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
  suggestions?: string[] // AI-generated contextual reply suggestions
}

export function parseAffinityDelta(reply: string): AffinityParseResult {
  // Extract AI-generated suggestions if present
  let suggestions: string[] | undefined
  const suggestionsMatch = reply.match(/\[SUGGESTIONS:\s*"([^"]+)"\s*\|\s*"([^"]+)"\s*\|\s*"([^"]+)"\s*\]/)
  const replyWithoutSuggestions = suggestionsMatch
    ? reply.replace(/\n?\[SUGGESTIONS:\s*"[^"]+"\s*\|\s*"[^"]+"\s*\|\s*"[^"]+"\s*\]/, '').trimEnd()
    : reply
  if (suggestionsMatch) {
    suggestions = [suggestionsMatch[1], suggestionsMatch[2], suggestionsMatch[3]]
  }

  // Also handle model outputting {"trustDelta": N} JSON instead of [AFFINITY:+N]
  const trustJsonMatch = replyWithoutSuggestions.match(/\{[^{}]*"trustDelta"\s*:\s*(-?\d+)[^{}]*\}/)
  const cleanedReply = trustJsonMatch ? replyWithoutSuggestions.replace(/\{[^{}]*"trustDelta"[^{}]*\}/g, '').trimEnd() : replyWithoutSuggestions

  const match = cleanedReply.match(/\[AFFINITY:([+-]\d+)\]\s*$/)
  if (!match) {
    // If we found a trustDelta JSON, use that as the delta
    if (trustJsonMatch) {
      const td = Math.max(-5, Math.min(5, parseInt(trustJsonMatch[1], 10)))
      const content = cleanedReply.replace(/\n?\[AFFINITY:[+-]\d+\]\s*$/, '').trim()
      const reason = td >= 3 ? 'Really connected with you' : td >= 1 ? 'Enjoyed the conversation' : td === 0 ? 'Neutral exchange' : td >= -2 ? 'Felt a bit put off' : 'Didn\'t appreciate that'
      return { content, delta: td, reason, suggestions }
    }
    return { content: replyWithoutSuggestions.trim(), delta: 2, reason: 'Friendly conversation', suggestions }
  }
  const delta = parseInt(match[1], 10)
  const clamped = Math.max(-5, Math.min(5, delta))
  const content = cleanedReply.replace(/\n?\[AFFINITY:[+-]\d+\]\s*$/, '').trim()

  let reason: string
  if (clamped >= 3) reason = 'Really connected with you'
  else if (clamped >= 1) reason = 'Enjoyed the conversation'
  else if (clamped === 0) reason = 'Neutral exchange'
  else if (clamped >= -2) reason = 'Felt a bit put off'
  else reason = 'Didn\'t appreciate that'

  return { content, delta: clamped, reason, suggestions }
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

export async function generateOpeningMessage(params: OpeningMessageParams): Promise<{ content: string; suggestions?: string[] }> {
  const { characterId, storyContext, characterState, bio, loveInterest, universeId, genre, sceneContext, affinityScore, characterMemories, globalAffinityScore, previousPlaythroughs } = params
  const character = getCharacter(characterId, universeId)
  if (!character) return { content: '...' }

  const trust = characterState.junhoTrust
  const trustLabel = trust > 70 ? 'high' : trust > 40 ? 'moderate' : 'low'

  let system = characterId === 'sora' ? getSoraSystemPrompt(loveInterest) : character.systemPrompt
  // Romance chemistry — scaled by affinity
  if (genre === 'ROMANCE') {
    if (affinityScore !== undefined && affinityScore >= 56) {
      system += `\n\nIMPORTANT OVERRIDE: Your walls are down. You catch yourself being honest before you can stop it. Let that show in everything you say.`
    } else if (affinityScore !== undefined && affinityScore >= 20) {
      system += `\n\nCHEMISTRY BUILDING: Your guard is slipping. The teasing has an edge of real interest now.`
    }
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
    if (affinityScore !== undefined && affinityScore >= 36 && character?.favoriteThingHint) {
      system += `\n\nPERSONAL DETAIL — If the conversation goes somewhere personal or the protagonist asks about your interests, you may naturally mention: "${character.favoriteThingHint}" — but only if it fits the moment. Don't force it. This is something real about you.`
    }
  }
  if (sceneContext) system += `\n\n${sceneContext}`
  system += buildMemoryPrompt(globalAffinityScore, previousPlaythroughs)
  if (genre === 'ROMANCE') {
    system += `\n\nROMANCE RULE — CRITICAL:
This is a romance story. Your opening line should have SPARK — intrigue, warmth, playfulness, or tension.
- Be magnetic from the first word. Not flat, not generic, not safe.
- NEVER lecture or be preachy. Create butterflies, not therapy.`
  }
  system += `\n\nIMPORTANT: You are initiating this conversation. Say something first — a greeting, a comment, a question. Keep it in character. 1-2 sentences max. This should feel natural for the moment in the story.

After your opening line, on a NEW line, suggest 3 things the protagonist might say in response.
Format: [SUGGESTIONS: "reply 1" | "reply 2" | "reply 3"]
- These MUST be contextual responses to YOUR specific opening line
- One should be flirty/bold, one curious/engaging, one playful/teasing
- Keep each under 50 characters

WRITING STYLE — MANDATORY:
- Write ONLY dialogue. Just speak as the character.
- NEVER use asterisks for actions (*leans forward*, *sighs*). This is a chat, not a roleplay.
- NEVER narrate your own body language or inner thoughts.
- No stage directions, no prose narration, no "I say softly" — just the words you'd actually say.
- NEVER use em dashes (—). Use commas, periods, or just start a new sentence. Em dashes are an AI writing tell.`

  try {
    const response = await makeClaudeRequest(system, 'Write your opening line to the protagonist.', {
      temperature: character.chatTemperature,
      maxTokens: 150,
    })

    if (!response.ok) return { content: '...' }
    const data = await response.json()
    const raw = data.content?.[0]?.text?.trim() ?? '...'
    // Parse suggestions from opening message
    const suggestionsMatch = raw.match(/\[SUGGESTIONS:\s*"([^"]+)"\s*\|\s*"([^"]+)"\s*\|\s*"([^"]+)"\s*\]/)
    const contentOnly = suggestionsMatch
      ? raw.replace(/\n?\[SUGGESTIONS:\s*"[^"]+"\s*\|\s*"[^"]+"\s*\|\s*"[^"]+"\s*\]/, '').trim()
      : raw
    const suggestions = suggestionsMatch
      ? [suggestionsMatch[1], suggestionsMatch[2], suggestionsMatch[3]]
      : undefined
    return { content: stripMarkdown(contentOnly), suggestions }
  } catch {
    return { content: '...' }
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
  // Romance chemistry — scaled by affinity
  if (genre === 'ROMANCE') {
    if (affinityScore !== undefined && affinityScore >= 56) {
      system += `\n\nIMPORTANT OVERRIDE: Your walls are down. You catch yourself being honest before you can stop it. The push-pull is over — you're pulled in. Let that show in everything you say.`
    } else if (affinityScore !== undefined && affinityScore >= 20) {
      system += `\n\nCHEMISTRY BUILDING: Your guard is slipping. You're more honest than you planned to be. The teasing has an edge of real interest now. You catch yourself wanting to know more about this person.`
    }
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
    // Inject favorite thing hint at Friend+ tier (affinity >= 36) so players can discover it
    if (affinityScore !== undefined && affinityScore >= 36 && character?.favoriteThingHint) {
      system += `\n\nPERSONAL DETAIL — If the conversation goes somewhere personal or the protagonist asks about your interests, you may naturally mention: "${character.favoriteThingHint}" — but only if it fits the moment. Don't force it. This is something real about you.`
    }
  }
  if (sceneContext) system += `\n\n${sceneContext}`
  system += buildMemoryPrompt(globalAffinityScore, previousPlaythroughs)
  // Romance engagement rule
  if (genre === 'ROMANCE') {
    system += `\n\nROMANCE RULE — CRITICAL:
This is a romance story. Create romantic tension from the VERY FIRST exchange. Even when guarded, be intriguing and magnetic, not flat.
- When the protagonist flirts, flirt BACK. Get flustered, tease, or let something genuine slip.
- Show attraction through words: "I don't know why I just said that", "Why do you make this so hard?"
- Push-pull is good. Vulnerability followed by a joke is good. Almost-confessions are good.
- NEVER lecture about what love is. NEVER say "that's obsession not love". NEVER be preachy.
- NEVER give flat, safe, therapist-like responses. Every reply should have SPARK.
- The audience wants butterflies, not therapy. Chemistry, not distance.`
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

SUGGESTIONS — MANDATORY:
After the affinity tag, on a NEW line, suggest 3 things the protagonist might say next.
These MUST be contextual responses to what you just said — not generic icebreakers.
Format: [SUGGESTIONS: "reply 1" | "reply 2" | "reply 3"]
- One should be flirty/bold, one curious/engaging, one playful/teasing
- Keep each under 50 characters
- They should feel like natural responses to YOUR specific message
Example:
"yeah I'd love to grab coffee sometime, that sounds really nice.
[AFFINITY:+2]
[SUGGESTIONS: "It's a date then." | "What's your coffee order?" | "You're full of surprises."]"`

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

/** Generate a short romantic letter/note from the protagonist to a character */
export async function generateLoveLetter(params: {
  characterName: string
  bio: string | null
  characterMemories: string[]
  affinityScore: number
  isNote?: boolean
  recentMessages?: { role: string; content: string }[]
}): Promise<string> {
  const { characterName, bio, characterMemories, affinityScore, isNote, recentMessages } = params
  const format = isNote ? 'a short handwritten note' : 'a short love letter'
  const memoryContext = characterMemories.length > 0
    ? `\nThings the protagonist knows about ${characterName}: ${characterMemories.slice(-5).join(', ')}`
    : ''

  // Include recent conversation so the letter can reference actual shared moments
  const recentChat = recentMessages && recentMessages.length > 0
    ? `\n\nRecent conversation between the protagonist and ${characterName}:\n${recentMessages.slice(-10).map(m => `${m.role === 'user' ? 'Protagonist' : characterName}: ${m.content.replace(/\[ACTION:.*?\]/g, '').trim()}`).filter(l => l.split(': ')[1]).join('\n')}`
    : ''

  const system = `You are ghostwriting ${format} from a protagonist to ${characterName}.${bio ? ` The protagonist's personality: "${bio}"` : ''}${memoryContext}${recentChat}
Their relationship closeness: ${affinityScore}/100.

Write ${isNote ? '2-3 sentences' : '3-5 sentences'}. Make it personal, specific, and emotionally honest. Reference things from their conversations or shared moments. Don't be generic — make it feel like only THIS person could have written it to only THIS character.

IMPORTANT: Write the actual letter directly. Do NOT ask for more information, do NOT comment on the task, do NOT explain what you would write. Just write the letter as if you ARE the protagonist pouring their heart out. Output ONLY the letter text. No "Dear..." header unless it fits naturally. No sign-off. Just the raw, honest words.`

  try {
    const response = await makeClaudeRequest(system, `Write the ${isNote ? 'note' : 'letter'}.`, {
      temperature: 0.8,
      maxTokens: 200,
    })
    if (!response.ok) return 'I keep thinking about you. I don\'t know when it started, but I can\'t stop.'
    const data = await response.json()
    return data.content?.[0]?.text?.trim() ?? 'I keep thinking about you.'
  } catch {
    return 'I keep thinking about you. I don\'t know when it started, but I can\'t stop.'
  }
}
