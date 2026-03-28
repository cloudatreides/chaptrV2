import { CHARACTER_BIBLE, CHAPTER_BRIEFS } from '../data/storyData'
import type { Choice, CharacterState, DynamicChoice } from '../store/useStore'

export interface StreamBeatParams {
  chapter: number
  chapterTitle: string
  choiceText: string
  choiceHistory: Choice[]
  characterState: CharacterState
  apiKey: string
  signal?: AbortSignal
}

export interface GenerateChoicesParams {
  chapter: number
  chapterTitle: string
  prose: string
  choiceHistory: Choice[]
  characterState: CharacterState
  apiKey: string
}

function buildSystemPrompt(choiceHistory: Choice[], chapter: number, characterState: CharacterState): string {
  const historyText = choiceHistory.length > 0
    ? '\n\nPRIOR CHOICES (these have shaped the story — honour them causally, not just as references):\n' + choiceHistory.map(
        (c) => `- Ch.${c.chapter} "${c.chapterTitle}": ${c.text}`
      ).join('\n')
    : ''

  const brief = CHAPTER_BRIEFS[chapter]
  const arcText = brief ? `\n\nCHAPTER ARC DESTINATION (must be true by chapter end regardless of choices made):\n${brief}` : ''

  const trust = characterState.junhoTrust
  const trustLabel = trust > 70 ? 'high' : trust > 40 ? 'moderate' : 'low'
  const trustText = `\n\nCHARACTER STATE:\n- Junho's trust in the protagonist: ${trustLabel} (${trust}/100). At low trust, he is guarded and professional. At moderate trust, he allows small moments of openness. At high trust, he shows real vulnerability.`

  return `${CHARACTER_BIBLE}${historyText}${arcText}${trustText}

PROSE CONSTRAINTS:
- Write 2–4 short paragraphs (max 120 words total).
- Present tense, second person ("you").
- End on emotional tension or a quiet revelation that moves toward the arc destination.
- Do NOT include choices or option labels — only narrative prose.
- Do NOT start with "You chose" or reference the choice mechanically.`
}

export async function* streamBeatProse(params: StreamBeatParams): AsyncGenerator<string> {
  const { chapter, chapterTitle, choiceText, choiceHistory, characterState, apiKey, signal } = params

  const userMessage = `Chapter ${chapter}: "${chapterTitle}". The reader chose: "${choiceText}". Write the continuation prose.`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 300,
      stream: true,
      system: buildSystemPrompt(choiceHistory, chapter, characterState),
      messages: [{ role: 'user', content: userMessage }],
    }),
    signal,
  })

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`)
  }

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
          yield parsed.delta.text
        }
      } catch {
        // skip malformed chunks
      }
    }
  }
}

export async function generateChoices(params: GenerateChoicesParams): Promise<DynamicChoice[]> {
  const { chapter, chapterTitle, prose, choiceHistory, characterState, apiKey } = params

  const trust = characterState.junhoTrust
  const trustLabel = trust > 70 ? 'high' : trust > 40 ? 'moderate' : 'low'

  const priorContext = choiceHistory.length > 0
    ? '\nPrior choices: ' + choiceHistory.map((c) => `Ch.${c.chapter}: "${c.text}"`).join(', ')
    : ''

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 200,
        system: `You generate reader choices for an interactive K-drama story. Given a prose beat, produce exactly 3 short choices (5–8 words each) for what the protagonist does next. They must feel emotionally distinct and fit the scene naturally.

Trust level with Junho: ${trustLabel} (${trust}/100). Higher trust unlocks emotionally intimate options.${priorContext}

Return ONLY valid JSON — no markdown, no explanation:
{"choices":[{"text":"..."},{"text":"..."},{"text":"...","gemCost":10}]}

Rules:
- Third choice always gets gemCost: 10 (it's the bold/premium option)
- No meta-language ("Look around", "Go back")
- Present tense, implied second person`,
        messages: [{
          role: 'user',
          content: `Chapter ${chapter}: "${chapterTitle}"\n\nProse:\n${prose}\n\nGenerate 3 choices for what happens next.`,
        }],
      }),
    })

    if (!response.ok) return []

    const data = await response.json()
    const text: string = data.content?.[0]?.text ?? ''
    const parsed = JSON.parse(text)
    return Array.isArray(parsed.choices) ? parsed.choices : []
  } catch {
    return []
  }
}
