import { CHARACTERS } from '../../data/characters'
import { makeClaudeRequest } from './core'
import type { ChatMessage } from '../../store/useStore'

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
