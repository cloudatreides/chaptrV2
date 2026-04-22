import { CHARACTERS, getCharacter, getSoraSystemPrompt } from '../../data/characters'
import { getAffinityTier } from '../affinity'
import { streamSSE, makeClaudeRequest, stripMarkdown, buildMemoryPrompt } from './core'
import type { ChatMessage, PlaythroughRecord } from '../../store/useStore'

// ─── Types ───

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
  genre?: string
  signal?: AbortSignal
  sceneContext?: string
  affinityScore?: number
  characterMemories?: string[]
  globalAffinityScore?: number
  previousPlaythroughs?: PlaythroughRecord[]
}

export interface OpeningMessageParams {
  characterId: string
  storyContext: string
  characterState: { junhoTrust: number }
  bio: string | null
  loveInterest: 'jiwon' | 'yuna' | null
  universeId: string | null
  genre?: string
  sceneContext?: string
  affinityScore?: number
  characterMemories?: string[]
  globalAffinityScore?: number
  previousPlaythroughs?: PlaythroughRecord[]
}

export interface SummarizeChatParams {
  characterId: string
  messages: ChatMessage[]
}

// ─── Shared System Prompt Builder ───

interface ChatPromptContext {
  characterId: string
  characterState: { junhoTrust: number }
  storyContext: string
  bio: string | null
  loveInterest: 'jiwon' | 'yuna' | null
  universeId: string | null
  genre?: string
  sceneContext?: string
  affinityScore?: number
  characterMemories?: string[]
  globalAffinityScore?: number
  previousPlaythroughs?: PlaythroughRecord[]
}

export function buildChatSystemPrompt(ctx: ChatPromptContext): { system: string; character: ReturnType<typeof getCharacter> } {
  const { characterId, characterState, storyContext, bio, loveInterest, universeId, genre, sceneContext, affinityScore, characterMemories, globalAffinityScore, previousPlaythroughs } = ctx
  const character = getCharacter(characterId, universeId)
  if (!character) return { system: '', character: undefined }

  const trust = characterState.junhoTrust
  const trustLabel = trust > 70 ? 'high' : trust > 40 ? 'moderate' : 'low'

  let system = characterId === 'sora' ? getSoraSystemPrompt(loveInterest) : character.systemPrompt

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
    if (affinityScore !== undefined && affinityScore >= 36 && character?.favoriteThingHint) {
      system += `\n\nPERSONAL DETAIL — If the conversation goes somewhere personal or the protagonist asks about your interests, you may naturally mention: "${character.favoriteThingHint}" — but only if it fits the moment. Don't force it. This is something real about you.`
    }
  }

  if (sceneContext) system += `\n\n${sceneContext}`
  system += buildMemoryPrompt(globalAffinityScore, previousPlaythroughs)

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

  return { system, character }
}

const WRITING_STYLE_RULES = `\n\nWRITING STYLE — MANDATORY:
- Write ONLY dialogue. Just speak as the character.
- NEVER use asterisks for actions (*leans forward*, *sighs*). This is a chat, not a roleplay.
- NEVER narrate your own body language or inner thoughts.
- No stage directions, no prose narration, no "I say softly" — just the words you'd actually say.
- NEVER use em dashes (—). Use commas, periods, or just start a new sentence. Em dashes are an AI writing tell.`

const SUGGESTIONS_RULES = `\n\nAfter your dialogue, on a NEW line, suggest 3 things the protagonist might say next.
These MUST be contextual responses to what you just said — not generic icebreakers.
Format: [SUGGESTIONS: "reply 1" | "reply 2" | "reply 3"]
- One should be flirty/bold, one curious/engaging, one playful/teasing
- Keep each under 50 characters
- They should feel like natural responses to YOUR specific message`

// ─── Opening Message ───

export async function generateOpeningMessage(params: OpeningMessageParams): Promise<{ content: string; suggestions?: string[] }> {
  const { system, character } = buildChatSystemPrompt(params)
  if (!character) return { content: '...' }

  let fullSystem = system
  fullSystem += `\n\nIMPORTANT: You are initiating this conversation. Say something first — a greeting, a comment, a question. Keep it in character. 1-2 sentences max. This should feel natural for the moment in the story.

After your opening line, on a NEW line, suggest 3 things the protagonist might say in response.
Format: [SUGGESTIONS: "reply 1" | "reply 2" | "reply 3"]
- These MUST be contextual responses to YOUR specific opening line
- One should be flirty/bold, one curious/engaging, one playful/teasing
- Keep each under 50 characters`
  fullSystem += WRITING_STYLE_RULES

  try {
    const response = await makeClaudeRequest(fullSystem, 'Write your opening line to the protagonist.', {
      temperature: character.chatTemperature,
      maxTokens: 150,
    })

    if (!response.ok) return { content: '...' }
    const data = await response.json()
    const raw = data.content?.[0]?.text?.trim() ?? '...'
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

// ─── Chat Reply (Streaming) ───

export async function* streamChatReply(params: StreamChatParams): AsyncGenerator<string> {
  const { messages, exchangeNumber, maxExchanges, signal } = params
  const { system, character } = buildChatSystemPrompt(params)
  if (!character) throw new Error(`Unknown character: ${params.characterId}`)

  let fullSystem = system
  fullSystem += WRITING_STYLE_RULES
  fullSystem += `\n- Give SUBSTANTIVE replies. 2-4 sentences minimum. Ask follow-up questions, share reactions, reveal something about yourself, or build on what the protagonist said. One-word or one-line replies kill the conversation. You're a compelling character — act like one.`

  fullSystem += `\n\nAFFINITY — MANDATORY:
After your dialogue, on a NEW line, add exactly one tag: [AFFINITY:+N] or [AFFINITY:-N] where N is 1-5.
This reflects how this exchange made you feel about the protagonist:
- +1 to +2: Normal pleasant chat, small talk
- +3 to +5: They said something that really resonated, showed genuine care, or impressed you
- -1 to -2: They were dismissive, rude, shallow, or said something mildly off-putting
- -3 to -5: They were deeply disrespectful, cruel, or crossed a clear boundary
Be honest as your character. Don't always give positive scores. If they're boring or pushy, reflect that.`

  fullSystem += `\n\nSUGGESTIONS — MANDATORY:`
  fullSystem += SUGGESTIONS_RULES
  fullSystem += `\nExample:
"yeah I'd love to grab coffee sometime, that sounds really nice.
[AFFINITY:+2]
[SUGGESTIONS: "It's a date then." | "What's your coffee order?" | "You're full of surprises."]"`

  if (exchangeNumber >= maxExchanges) {
    fullSystem += `\n\nIMPORTANT: This is your FINAL reply in this conversation. Naturally wrap up — you're being called away, need to go, or the moment is ending. Don't be abrupt, but make it clear this exchange is closing.`
  } else if (exchangeNumber >= maxExchanges - 2) {
    fullSystem += `\n\nNOTE: The conversation is winding down. Start to naturally bring things to a close over your next replies — don't cut off abruptly, but let the energy taper.`
  }

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
      system: fullSystem,
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
  system += WRITING_STYLE_RULES

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
