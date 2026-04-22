import { getAffinityTier } from '../affinity'
import type { PlaythroughRecord } from '../../store/useStore'

// ─── Helpers ───

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

export function extractTrustData(raw: string): { prose: string; trustDelta: number; statusLabel: string } {
  const match = raw.match(/\{[^{}]*"trustDelta"\s*:\s*(-?\d+)[^{}]*"statusLabel"\s*:\s*"([^"]+)"[^{}]*\}/)
  if (!match) return { prose: stripMarkdown(raw), trustDelta: 0, statusLabel: '' }
  const prose = stripMarkdown(raw.slice(0, raw.lastIndexOf(match[0])))
  return { prose, trustDelta: parseInt(match[1], 10), statusLabel: match[2] }
}

// ─── SSE Streaming ───

export async function* streamSSE(response: Response): AsyncGenerator<string> {
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

// ─── API Request ───

export function makeClaudeRequest(system: string, userMessage: string, options: {
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

// ─── Memory Prompt Builder ───

export function buildMemoryPrompt(globalAffinityScore?: number, previousPlaythroughs?: PlaythroughRecord[]): string {
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
