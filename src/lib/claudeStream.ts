import { CHARACTER_BIBLE, CHAPTER_BRIEFS } from '../data/storyData'
import type { Choice } from '../store/useStore'

export interface StreamBeatParams {
  chapter: number
  chapterTitle: string
  choiceText: string
  choiceHistory: Choice[]
  apiKey: string
  signal?: AbortSignal
}

function buildSystemPrompt(choiceHistory: Choice[], chapter: number): string {
  const historyText = choiceHistory.length > 0
    ? '\n\nPRIOR CHOICES (these have shaped the story — honour them causally, not just as references):\n' + choiceHistory.map(
        (c) => `- Ch.${c.chapter} "${c.chapterTitle}": ${c.text}`
      ).join('\n')
    : ''

  const brief = CHAPTER_BRIEFS[chapter]
  const arcText = brief ? `\n\nCHAPTER ARC DESTINATION (must be true by chapter end regardless of choices made):\n${brief}` : ''

  return `${CHARACTER_BIBLE}${historyText}${arcText}

PROSE CONSTRAINTS:
- Write 2–4 short paragraphs (max 120 words total).
- Present tense, second person ("you").
- End on emotional tension or a quiet revelation that moves toward the arc destination.
- Do NOT include choices or option labels — only narrative prose.
- Do NOT start with "You chose" or reference the choice mechanically.`
}

export async function* streamBeatProse(params: StreamBeatParams): AsyncGenerator<string> {
  const { chapter, chapterTitle, choiceText, choiceHistory, apiKey, signal } = params

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
      system: buildSystemPrompt(choiceHistory, chapter),
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
