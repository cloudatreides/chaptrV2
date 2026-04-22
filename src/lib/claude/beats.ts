import { resolveText } from '../../data/storyData'
import { getBibleForUniverse } from '../../data/storyHelpers'
import { streamSSE, makeClaudeRequest, buildMemoryPrompt } from './core'
import type { PlaythroughRecord } from '../../store/useStore'

// ─── Types ───

export interface StreamBeatParams {
  beatTitle: string
  arcBrief?: string
  chapterBrief?: string
  choiceHistory: { label: string; description: string; sceneHint?: string }[]
  chatSummaries: string[]
  characterState: { junhoTrust: number }
  bio: string | null
  playerName: string | null
  loveInterest: 'jiwon' | 'yuna' | null
  universeId: string | null
  signal?: AbortSignal
  previousPlaythroughs?: PlaythroughRecord[]
}

// ─── Prompt Builder ───

function buildBeatSystemPrompt(params: StreamBeatParams): string {
  const { choiceHistory, chatSummaries, characterState, bio, playerName, loveInterest, universeId, previousPlaythroughs, chapterBrief } = params
  const trust = characterState.junhoTrust
  const trustLabel = trust > 70 ? 'high' : trust > 40 ? 'moderate' : 'low'
  const liName = loveInterest === 'yuna' ? 'Yuna' : 'Jiwon'
  const liPronoun = loveInterest === 'yuna' ? 'she' : 'he'

  const historyText = choiceHistory.length > 0
    ? '\n\nPRIOR CHOICES:\n' + choiceHistory.map((c) => `- [${c.label}]: ${c.description}${c.sceneHint ? ` (tone: ${c.sceneHint})` : ''}`).join('\n')
    : ''

  const lastChoice = choiceHistory.length > 0 ? choiceHistory[choiceHistory.length - 1] : null
  const recentChoiceText = lastChoice
    ? `\n\nMOST RECENT CHOICE — CRITICAL:\nThe protagonist just chose: "${lastChoice.label}" — ${lastChoice.description}${lastChoice.sceneHint ? ` Their approach was ${lastChoice.sceneHint}.` : ''}\nYour prose MUST reflect this choice. Show its emotional consequences — how characters react, what shifts in the dynamic, what the protagonist feels. The reader should feel that their choice mattered.`
    : ''

  const chatText = chatSummaries.length > 0
    ? '\n\nPRIOR CONVERSATIONS (summaries):\n' + chatSummaries.map((s, i) => `- Chat ${i + 1}: ${s}`).join('\n')
    : ''

  const trustText = `\n\nCHARACTER STATE:\n- ${liName}'s trust in the protagonist: ${trustLabel} (${trust}/100). At low trust, ${liPronoun} is guarded and professional. At moderate trust, ${liPronoun} allows small moments of openness. At high trust, ${liPronoun} shows real vulnerability.`

  const bioText = bio ? `\n\nPROTAGONIST PERSONALITY:\n"${bio}"` : ''
  const nameText = playerName ? `\n\nPROTAGONIST NAME: ${playerName}. Use their name occasionally in dialogue and narration (e.g. when other characters address them). Don't overuse it — mix "you" and "${playerName}" naturally.` : ''

  const memoryText = buildMemoryPrompt(undefined, previousPlaythroughs)
  const chapterText = chapterBrief ? `\n\nCHAPTER GOAL:\n${chapterBrief}\nAll beats in this chapter should build toward this goal. Make sure the emotional arc moves forward.` : ''

  return `${getBibleForUniverse(universeId, loveInterest)}${chapterText}${historyText}${recentChoiceText}${chatText}${trustText}${bioText}${nameText}${memoryText}

PROSE CONSTRAINTS:
- Write 2–4 short paragraphs (max 120 words total).
- Present tense, second person ("you").
- End on emotional tension or a quiet revelation.
- Do NOT include choices or option labels — only narrative prose.
- Do NOT start with "You chose" or reference choices mechanically.
- After your prose, on a new line, output EXACTLY one JSON object:
  {"trustDelta": <number -10 to 15>, "statusLabel": "<2-4 word relationship status>"}`
}

// ─── Beat Generation ───

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
