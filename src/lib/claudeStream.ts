import { getBibleForUniverse, resolveText } from '../data/storyData'
import { CHARACTERS, getCharacter } from '../data/characters'
import { getSoraSystemPrompt } from '../data/characters'
import { getAffinityTier } from './affinity'
import type { ChatMessage, PlaythroughRecord } from '../store/useStore'

// ─── Affinity Delta Parser ───

export interface AffinityParseResult {
  content: string   // reply with tag stripped
  delta: number     // parsed affinity change (-5 to +5), defaults to +2 if no tag
  reason: string    // human-readable reason
}

export function parseAffinityDelta(reply: string): AffinityParseResult {
  const match = reply.match(/\[AFFINITY:([+-]\d+)\]\s*$/)
  if (!match) {
    return { content: reply.trim(), delta: 2, reason: 'Friendly conversation' }
  }
  const delta = parseInt(match[1], 10)
  const clamped = Math.max(-5, Math.min(5, delta))
  const content = reply.replace(/\n?\[AFFINITY:[+-]\d+\]\s*$/, '').trim()

  let reason: string
  if (clamped >= 3) reason = 'Really connected with you'
  else if (clamped >= 1) reason = 'Enjoyed the conversation'
  else if (clamped === 0) reason = 'Neutral exchange'
  else if (clamped >= -2) reason = 'Felt a bit put off'
  else reason = 'Didn\'t appreciate that'

  return { content, delta: clamped, reason }
}

// ─── Types ───

export interface StreamBeatParams {
  beatTitle: string
  arcBrief?: string
  choiceHistory: { label: string; description: string }[]
  chatSummaries: string[]
  characterState: { junhoTrust: number }
  bio: string | null
  playerName: string | null
  loveInterest: 'jiwon' | 'yuna' | null
  universeId: string | null
  signal?: AbortSignal
  previousPlaythroughs?: PlaythroughRecord[]
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
  genre?: string // universe genre (e.g. 'ROMANCE', 'HORROR')
  signal?: AbortSignal
  sceneContext?: string // context from other character conversations in the same scene
  affinityScore?: number // per-character affinity level (0-100)
  characterMemories?: string[] // memorable facts protagonist has shared with this character
  globalAffinityScore?: number // lifetime affinity across all playthroughs
  previousPlaythroughs?: PlaythroughRecord[]
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
    .replace(/```\w*\n?/g, '')
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

/** Build optional prompt additions for cross-playthrough memory */
function buildMemoryPrompt(globalAffinityScore?: number, previousPlaythroughs?: PlaythroughRecord[]): string {
  let extra = ''
  if (globalAffinityScore && globalAffinityScore > 0) {
    const tier = getAffinityTier(globalAffinityScore)
    extra += `\n\nCROSS-STORY BOND: You've interacted with the protagonist across multiple stories. Your lifetime connection is at "${tier.label}" level (${globalAffinityScore}/100). You feel a sense of familiarity, like meeting an old friend in a new life.`
  }
  if (previousPlaythroughs && previousPlaythroughs.length > 0) {
    const recent = previousPlaythroughs.slice(-3)
    const summaries = recent.map((pt) => {
      const choiceLabels = pt.choices.map((c) => c.label).join(', ')
      return `- Choices: ${choiceLabels}${pt.signature ? `. Ending: "${pt.signature}"` : ''}`
    }).join('\n')
    extra += `\n\nPREVIOUS PLAYTHROUGHS: The player has completed this story before.\n${summaries}\nYou may reference this naturally, e.g. "You chose differently this time..." or "Last time you trusted me." Only when it feels organic, never forced.`
  }
  return extra
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
  const { choiceHistory, chatSummaries, characterState, bio, playerName, loveInterest, universeId, previousPlaythroughs } = params
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
  const nameText = playerName ? `\n\nPROTAGONIST NAME: ${playerName}. Use their name occasionally in dialogue and narration (e.g. when other characters address them). Don't overuse it — mix "you" and "${playerName}" naturally.` : ''

  const memoryText = buildMemoryPrompt(undefined, previousPlaythroughs)

  return `${getBibleForUniverse(universeId, loveInterest)}${historyText}${chatText}${trustText}${bioText}${nameText}${memoryText}

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
  genre?: string // universe genre (e.g. 'ROMANCE', 'HORROR')
  sceneContext?: string // context from other character conversations in the same scene
  affinityScore?: number // per-character affinity level (0-100)
  characterMemories?: string[] // memorable facts protagonist has shared with this character
  globalAffinityScore?: number
  previousPlaythroughs?: PlaythroughRecord[]
}

export async function generateOpeningMessage(params: OpeningMessageParams): Promise<string> {
  const { characterId, storyContext, characterState, bio, loveInterest, universeId, genre, sceneContext, affinityScore, characterMemories, globalAffinityScore, previousPlaythroughs } = params
  const character = getCharacter(characterId, universeId)
  if (!character) return '...'

  const trust = characterState.junhoTrust
  const trustLabel = trust > 70 ? 'high' : trust > 40 ? 'moderate' : 'low'

  let system = characterId === 'sora' ? getSoraSystemPrompt(loveInterest) : character.systemPrompt
  // (Change C) Override base personality at high affinity in romance
  if (genre === 'ROMANCE' && affinityScore !== undefined && affinityScore >= 56) {
    system += `\n\nIMPORTANT OVERRIDE: Your usual guardedness and deflection is cracking. You catch yourself being honest before you can stop it. The personality traits above (guarded, deflects, cold) are your DEFAULT — but this person has gotten past your walls. Let that show.`
  }
  system += `\n\nSTORY CONTEXT: ${storyContext}`
  system += `\n\nRelationship with protagonist: ${trustLabel} trust (${trust}/100).`
  if (affinityScore !== undefined) {
    const tier = getAffinityTier(affinityScore, genre)
    system += `\nAffinity level: ${tier.label} (${affinityScore}/100). ${tier.promptModifier}`
  }
  if (bio) system += `\nProtagonist personality: "${bio}"`
  if (characterMemories && characterMemories.length > 0) {
    system += `\n\nTHINGS THE PROTAGONIST HAS SHARED WITH YOU:\n${characterMemories.map(m => `- ${m}`).join('\n')}\nYou remember these. Weave them in naturally if relevant — don't force it.`
  }
  if (sceneContext) system += `\n\n${sceneContext}`
  system += buildMemoryPrompt(globalAffinityScore, previousPlaythroughs)
  // (Change B) Romance engagement rule
  if (genre === 'ROMANCE') {
    system += `\n\nROMANCE RULE — CRITICAL:
This is a romance story. When the protagonist expresses romantic interest, affection, or flirts with you, DO NOT shut it down, lecture them, or play therapist. Instead, REACT EMOTIONALLY:
- Get flustered, deflect with humor, or let something genuine slip
- Show physical tells through your words: "I don't know why I just said that", "Why do you make this so hard?"
- Push-pull is good. Vulnerability followed by a joke is good. Almost-confessions are good.
- NEVER lecture about what love is. NEVER say "that's obsession not love". NEVER be preachy.
- The audience wants romantic TENSION — give them butterflies, not therapy.`
  }
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
  const { characterId, messages, storyContext, exchangeNumber, maxExchanges, characterState, bio, loveInterest, universeId, genre, signal, sceneContext, affinityScore, characterMemories, globalAffinityScore, previousPlaythroughs } = params
  const character = getCharacter(characterId, universeId)
  if (!character) throw new Error(`Unknown character: ${characterId}`)

  const trust = characterState.junhoTrust
  const trustLabel = trust > 70 ? 'high' : trust > 40 ? 'moderate' : 'low'

  let system = characterId === 'sora' ? getSoraSystemPrompt(loveInterest) : character.systemPrompt
  // (Change C) Override base personality at high affinity in romance
  if (genre === 'ROMANCE' && affinityScore !== undefined && affinityScore >= 56) {
    system += `\n\nIMPORTANT OVERRIDE: Your usual guardedness and deflection is cracking. You catch yourself being honest before you can stop it. The personality traits above (guarded, deflects, cold) are your DEFAULT — but this person has gotten past your walls. Let that show.`
  }
  system += `\n\nSTORY CONTEXT: ${storyContext}`
  system += `\n\nRelationship with protagonist: ${trustLabel} trust (${trust}/100).`
  if (affinityScore !== undefined) {
    const tier = getAffinityTier(affinityScore, genre)
    system += `\nAffinity level: ${tier.label} (${affinityScore}/100). ${tier.promptModifier}`
  }
  if (bio) system += `\nProtagonist personality: "${bio}"`
  if (characterMemories && characterMemories.length > 0) {
    system += `\n\nTHINGS THE PROTAGONIST HAS SHARED WITH YOU:\n${characterMemories.map(m => `- ${m}`).join('\n')}\nYou remember these. Weave them in naturally if relevant — don't force it.`
  }
  if (sceneContext) system += `\n\n${sceneContext}`
  system += buildMemoryPrompt(globalAffinityScore, previousPlaythroughs)
  // (Change B) Romance engagement rule
  if (genre === 'ROMANCE') {
    system += `\n\nROMANCE RULE — CRITICAL:
This is a romance story. When the protagonist expresses romantic interest, affection, or flirts with you, DO NOT shut it down, lecture them, or play therapist. Instead, REACT EMOTIONALLY:
- Get flustered, deflect with humor, or let something genuine slip
- Show physical tells through your words: "I don't know why I just said that", "Why do you make this so hard?"
- Push-pull is good. Vulnerability followed by a joke is good. Almost-confessions are good.
- NEVER lecture about what love is. NEVER say "that's obsession not love". NEVER be preachy.
- The audience wants romantic TENSION — give them butterflies, not therapy.`
  }

  system += `\n\nWRITING STYLE — MANDATORY:
- Write ONLY dialogue. Just speak as the character.
- NEVER use asterisks for actions (*leans forward*, *sighs*). This is a chat, not a roleplay.
- NEVER narrate your own body language or inner thoughts.
- No stage directions, no prose narration, no "I say softly" — just the words you'd actually say.
- NEVER use em dashes (—). Use commas, periods, or just start a new sentence. Em dashes are an AI writing tell.
- Give SUBSTANTIVE replies. 2-4 sentences minimum. Ask follow-up questions, share reactions, reveal something about yourself, or build on what the protagonist said. One-word or one-line replies kill the conversation. You're a compelling character — act like one.`

  system += `\n\nAFFINITY — MANDATORY:
After your dialogue, on a NEW line, add exactly one tag: [AFFINITY:+N] or [AFFINITY:-N] where N is 1-5.
This reflects how this exchange made you feel about the protagonist:
- +1 to +2: Normal pleasant chat, small talk
- +3 to +5: They said something that really resonated, showed genuine care, or impressed you
- -1 to -2: They were dismissive, rude, shallow, or said something mildly off-putting
- -3 to -5: They were deeply disrespectful, cruel, or crossed a clear boundary
Be honest as your character. Don't always give positive scores. If they're boring or pushy, reflect that.
Example: "yeah I'd love to grab coffee sometime, that sounds really nice.\n[AFFINITY:+2]"`

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
      max_tokens: 300,
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

// ─── Memory Extraction ───

export async function extractMemories(params: {
  characterId: string
  messages: ChatMessage[]
}): Promise<string[]> {
  const { characterId, messages } = params
  const character = CHARACTERS[characterId]
  const name = character?.name ?? characterId

  const transcript = messages
    .map((m) => `${m.role === 'user' ? 'Protagonist' : name}: ${m.content}`)
    .join('\n')

  try {
    const response = await makeClaudeRequest(
      `Extract 1-2 personal facts the protagonist revealed about themselves in this conversation.

Return ONLY a JSON array of strings. Each string is one sentence starting with "The protagonist".
Focus on: personal details, fears, hobbies, background, secrets, values — things that reveal character.
If nothing notable was revealed, return [].
Return ONLY valid JSON — no other text.

Examples: ["The protagonist mentioned they haven't slept well in weeks.", "The protagonist said they're afraid of being forgotten."]`,
      transcript,
      { temperature: 0.2, maxTokens: 120 },
    )

    if (!response.ok) return []
    const data = await response.json()
    const raw = data.content?.[0]?.text?.trim() ?? '[]'
    const match = raw.match(/\[[\s\S]*\]/)
    if (!match) return []
    const parsed = JSON.parse(match[0])
    return Array.isArray(parsed) ? parsed.filter((s: unknown) => typeof s === 'string') : []
  } catch {
    return []
  }
}

// ─── Group Chat Reaction ───

export async function generateGroupReaction(params: {
  characterId: string
  threadContext: string
  storyContext: string
  universeId: string | null
  loveInterest: 'jiwon' | 'yuna' | null
}): Promise<string> {
  const { characterId, threadContext, storyContext, universeId, loveInterest } = params
  const character = getCharacter(characterId, universeId)
  if (!character) return ''

  let system = characterId === 'sora' ? getSoraSystemPrompt(loveInterest) : character.systemPrompt
  system += `\n\nSTORY CONTEXT: ${storyContext}`
  system += `\n\nGROUP SCENE: You are one of several characters in a group conversation. React briefly to what was just said. 1-2 sentences MAX. Natural, in character — you might agree, tease, redirect, or add a thought. Don't address only the protagonist.`
  system += `\n\nWRITING STYLE — MANDATORY:
- Write ONLY dialogue. Just speak as the character.
- NEVER use asterisks for actions (*leans forward*, *sighs*).
- No stage directions or narration.
- NEVER use em dashes (—).`

  try {
    const response = await makeClaudeRequest(
      system,
      `Recent conversation:\n${threadContext}\n\nWhat do you briefly say?`,
      { temperature: character.chatTemperature, maxTokens: 80 },
    )
    if (!response.ok) return ''
    const data = await response.json()
    return stripMarkdown(data.content?.[0]?.text?.trim() ?? '')
  } catch {
    return ''
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
