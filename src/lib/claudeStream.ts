import { getBibleForUniverse, resolveText } from '../data/storyData'
import { CHARACTERS, getCharacter } from '../data/characters'
import { getSoraSystemPrompt } from '../data/characters'
import type { ChatMessage } from '../store/useStore'

// ─── Types ───

export interface StreamBeatParams {
  beatTitle: string
  arcBrief?: string
  choiceHistory: { label: string; description: string }[]
  chatSummaries: string[]
  characterState: { junhoTrust: number }
  bio: string | null
  loveInterest: 'jiwon' | 'yuna' | null
  universeId: string | null
  signal?: AbortSignal
}

export interface StreamChatParams {
  characterId: string
  messages: ChatMessage[]
  storyContext: string
  exchangeNumber: number
  maxExchanges: number
  characterState: { junhoTrust: number }
  bio: string | null
  loveInterest: 'jiwon' | 'yuna' | null
  universeId: string | null
  signal?: AbortSignal
}

export interface SummarizeChatParams {
  characterId: string
  messages: ChatMessage[]
}

export interface RevealSignatureParams {
  chatSummaries: string[]
  choiceHistory: { label: string; description: string }[]
  characterState: { junhoTrust: number }
  loveInterest: 'jiwon' | 'yuna' | null
  universeId: string | null
}

// ─── Helpers ───

/** Strip markdown artifacts Claude sometimes leaks into prose */
export function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,3}\s+.*\n?/gm, '')
    .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1')
    .replace(/^[-*]\s+/gm, '')
    .replace(/\s*—\s*/g, ', ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** Extract trust JSON from end of prose */
export function extractTrustData(raw: string): { prose: string; trustDelta: number; statusLabel: string } {
  const match = raw.match(/\{[^{}]*"trustDelta"\s*:\s*(-?\d+)[^{}]*"statusLabel"\s*:\s*"([^"]+)"[^{}]*\}/)
  if (!match) return { prose: stripMarkdown(raw), trustDelta: 0, statusLabel: '' }
  const prose = stripMarkdown(raw.slice(0, raw.lastIndexOf(match[0])))
  return { prose, trustDelta: parseInt(match[1], 10), statusLabel: match[2] }
}

async function* streamSSE(response: Response): AsyncGenerator<string> {
  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6).trim()
      if (!data || data === '[DONE]') continue

      try {
        const parsed = JSON.parse(data)
        if (parsed.type === 'message_stop') return
        if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
          const clean = parsed.delta.text
            .replace(/\*{1,2}([^*]*)\*{1,2}/g, '$1')
            .replace(/\s*—\s*/g, ', ')
          yield clean
        }
      } catch {
        // skip malformed chunks
      }
    }
  }
}

function makeClaudeRequest(system: string, userMessage: string, options: {
  stream?: boolean
  maxTokens?: number
  temperature?: number
  signal?: AbortSignal
} = {}) {
  const { stream = false, maxTokens = 300, temperature = 0.6, signal } = options
  return fetch('/api/claude', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: maxTokens,
      stream,
      temperature,
      system,
      messages: [{ role: 'user', content: userMessage }],
    }),
    signal,
  })
}

// ─── Story Beat Generation ───

function buildBeatSystemPrompt(params: StreamBeatParams): string {
  const { choiceHistory, chatSummaries, characterState, bio, loveInterest, universeId } = params
  const trust = characterState.junhoTrust
  const trustLabel = trust > 70 ? 'high' : trust > 40 ? 'moderate' : 'low'
  const liName = loveInterest === 'yuna' ? 'Yuna' : 'Jiwon'
  const liPronoun = loveInterest === 'yuna' ? 'she' : 'he'

  const historyText = choiceHistory.length > 0
    ? '\n\nPRIOR CHOICES:\n' + choiceHistory.map((c) => `- [${c.label}]: ${c.description}`).join('\n')
    : ''

  const chatText = chatSummaries.length > 0
    ? '\n\nPRIOR CONVERSATIONS (summaries):\n' + chatSummaries.map((s, i) => `- Chat ${i + 1}: ${s}`).join('\n')
    : ''

  const trustText = `\n\nCHARACTER STATE:\n- ${liName}'s trust in the protagonist: ${trustLabel} (${trust}/100). At low trust, ${liPronoun} is guarded and professional. At moderate trust, ${liPronoun} allows small moments of openness. At high trust, ${liPronoun} shows real vulnerability.`

  const bioText = bio ? `\n\nPROTAGONIST PERSONALITY:\n"${bio}"` : ''

  return `${getBibleForUniverse(universeId, loveInterest)}${historyText}${chatText}${trustText}${bioText}

PROSE CONSTRAINTS:
- Write 2–4 short paragraphs (max 120 words total).
- Present tense, second person ("you").
- End on emotional tension or a quiet revelation.
- Do NOT include choices or option labels — only narrative prose.
- Do NOT start with "You chose" or reference choices mechanically.
- After your prose, on a new line, output EXACTLY one JSON object:
  {"trustDelta": <number -10 to 15>, "statusLabel": "<2-4 word relationship status>"}`
}

export async function* streamBeatProse(params: StreamBeatParams): AsyncGenerator<string> {
  const { beatTitle, arcBrief, loveInterest, signal } = params
  const system = buildBeatSystemPrompt(params)
  const resolvedArc = arcBrief ? resolveText(arcBrief, loveInterest) : undefined
  const userMessage = `Scene: "${beatTitle}".${resolvedArc ? ` Arc: ${resolvedArc}` : ''} Write the continuation prose.`

  const response = await makeClaudeRequest(system, userMessage, {
    stream: true, maxTokens: 300, temperature: 0.6, signal,
  })

  if (!response.ok) throw new Error(`Claude API error: ${response.status}`)
  yield* streamSSE(response)
}

// ─── Character Opening Message ───

export interface OpeningMessageParams {
  characterId: string
  storyContext: string
  characterState: { junhoTrust: number }
  bio: string | null
  loveInterest: 'jiwon' | 'yuna' | null
  universeId: string | null
}

export async function generateOpeningMessage(params: OpeningMessageParams): Promise<string> {
  const { characterId, storyContext, characterState, bio, loveInterest, universeId } = params
  const character = getCharacter(characterId, universeId)
  if (!character) return '...'

  const trust = characterState.junhoTrust
  const trustLabel = trust > 70 ? 'high' : trust > 40 ? 'moderate' : 'low'

  let system = characterId === 'sora' ? getSoraSystemPrompt(loveInterest) : character.systemPrompt
  system += `\n\nSTORY CONTEXT: ${storyContext}`
  system += `\n\nRelationship with protagonist: ${trustLabel} trust (${trust}/100).`
  if (bio) system += `\nProtagonist personality: "${bio}"`
  system += `\n\nIMPORTANT: You are initiating this conversation. Say something first — a greeting, a comment, a question. Keep it in character. 1-2 sentences max. This should feel natural for the moment in the story.

WRITING STYLE — MANDATORY:
- Write ONLY dialogue. Just speak as the character.
- NEVER use asterisks for actions (*leans forward*, *sighs*). This is a chat, not a roleplay.
- NEVER narrate your own body language or inner thoughts.
- No stage directions, no prose narration, no "I say softly" — just the words you'd actually say.
- NEVER use em dashes (—). Use commas, periods, or just start a new sentence. Em dashes are an AI writing tell.`

  try {
    const response = await makeClaudeRequest(system, 'Write your opening line to the protagonist.', {
      temperature: character.chatTemperature,
      maxTokens: 80,
    })

    if (!response.ok) return '...'
    const data = await response.json()
    const raw = data.content?.[0]?.text?.trim() ?? '...'
    return stripMarkdown(raw)
  } catch {
    return '...'
  }
}

// ─── Character Chat ───

export async function* streamChatReply(params: StreamChatParams): AsyncGenerator<string> {
  const { characterId, messages, storyContext, exchangeNumber, maxExchanges, characterState, bio, loveInterest, universeId, signal } = params
  const character = getCharacter(characterId, universeId)
  if (!character) throw new Error(`Unknown character: ${characterId}`)

  const trust = characterState.junhoTrust
  const trustLabel = trust > 70 ? 'high' : trust > 40 ? 'moderate' : 'low'

  let system = characterId === 'sora' ? getSoraSystemPrompt(loveInterest) : character.systemPrompt
  system += `\n\nSTORY CONTEXT: ${storyContext}`
  system += `\n\nRelationship with protagonist: ${trustLabel} trust (${trust}/100).`
  if (bio) system += `\nProtagonist personality: "${bio}"`

  system += `\n\nWRITING STYLE — MANDATORY:
- Write ONLY dialogue. Just speak as the character.
- NEVER use asterisks for actions (*leans forward*, *sighs*). This is a chat, not a roleplay.
- NEVER narrate your own body language or inner thoughts.
- No stage directions, no prose narration, no "I say softly" — just the words you'd actually say.
- NEVER use em dashes (—). Use commas, periods, or just start a new sentence. Em dashes are an AI writing tell.`

  if (exchangeNumber >= maxExchanges) {
    system += `\n\nIMPORTANT: This is your FINAL reply in this conversation. Naturally wrap up — you're being called away, need to go, or the moment is ending. Don't be abrupt, but make it clear this exchange is closing.`
  } else if (exchangeNumber >= maxExchanges - 2) {
    system += `\n\nNOTE: The conversation is winding down. Start to naturally bring things to a close over your next replies — don't cut off abruptly, but let the energy taper.`
  }

  // Build messages array for multi-turn chat
  const chatMessages = messages.map((m) => ({
    role: m.role === 'user' ? 'user' as const : 'assistant' as const,
    content: m.content,
  }))

  const response = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 150,
      stream: true,
      temperature: character.chatTemperature,
      system,
      messages: chatMessages,
    }),
    signal,
  })

  if (!response.ok) throw new Error(`Claude API error: ${response.status}`)
  yield* streamSSE(response)
}

// ─── Chat Summarization ───

export async function summarizeChat(params: SummarizeChatParams): Promise<string> {
  const { characterId, messages } = params
  const character = CHARACTERS[characterId]
  const name = character?.name ?? characterId

  const transcript = messages
    .map((m) => `${m.role === 'user' ? 'Protagonist' : name}: ${m.content}`)
    .join('\n')

  try {
    const response = await makeClaudeRequest(
      `Summarize this conversation in 1-2 sentences. Focus on: emotional tone, key topics discussed, and how the protagonist treated ${name}. Be specific and concise.`,
      transcript,
      { temperature: 0.3, maxTokens: 100 },
    )

    if (!response.ok) return `The conversation with ${name} was brief.`
    const data = await response.json()
    return data.content?.[0]?.text?.trim() ?? `The conversation with ${name} was brief.`
  } catch {
    return `The conversation with ${name} was brief and neutral.`
  }
}

// ─── Reveal Signature ───

export async function generateRevealSignature(params: RevealSignatureParams): Promise<string> {
  const { chatSummaries, choiceHistory, characterState, loveInterest } = params
  const trust = characterState.junhoTrust
  const liName = loveInterest === 'yuna' ? 'Yuna' : 'Jiwon'

  const context = [
    ...choiceHistory.map((c) => `Choice: ${c.label} — ${c.description}`),
    ...chatSummaries.map((s, i) => `Conversation ${i + 1}: ${s}`),
    `Final trust level: ${trust}/100`,
  ].join('\n')

  try {
    const response = await makeClaudeRequest(
      `You generate relationship signatures for an interactive story. Given the player's choices and conversations with ${liName} (K-pop idol), create a poetic "relationship signature" — a phrase that captures the emotional essence of their connection.

Rules:
- 6-10 words maximum.
- Written from ${liName}'s perspective about the protagonist.
- Poetic, specific, never generic.
- No quotes around the phrase.
- Examples of good signatures: "guarded but pulled toward you", "burned bright then distant", "saw through the charm immediately", "the one who made silence feel safe", "too honest for this world of mine"`,
      `Based on these interactions, generate the relationship signature:\n\n${context}`,
      { temperature: 0.4, maxTokens: 50 },
    )

    if (!response.ok) return 'a story written in glances'
    const data = await response.json()
    return data.content?.[0]?.text?.trim()?.replace(/^["']|["']$/g, '') ?? 'a story written in glances'
  } catch {
    return 'a story written in glances'
  }
}
