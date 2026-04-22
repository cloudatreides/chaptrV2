// ─── Affinity Delta Parser ───

export interface AffinityParseResult {
  content: string
  delta: number
  reason: string
  suggestions?: string[]
}

export function parseAffinityDelta(reply: string): AffinityParseResult {
  let suggestions: string[] | undefined
  const suggestionsMatch = reply.match(/\[SUGGESTIONS:\s*"([^"]+)"\s*\|\s*"([^"]+)"\s*\|\s*"([^"]+)"\s*\]/)
  const replyWithoutSuggestions = suggestionsMatch
    ? reply.replace(/\n?\[SUGGESTIONS:\s*"[^"]+"\s*\|\s*"[^"]+"\s*\|\s*"[^"]+"\s*\]/, '').trimEnd()
    : reply
  if (suggestionsMatch) {
    suggestions = [suggestionsMatch[1], suggestionsMatch[2], suggestionsMatch[3]]
  }

  const trustJsonMatch = replyWithoutSuggestions.match(/\{[^{}]*"trustDelta"\s*:\s*(-?\d+)[^{}]*\}/)
  const cleanedReply = trustJsonMatch ? replyWithoutSuggestions.replace(/\{[^{}]*"trustDelta"[^{}]*\}/g, '').trimEnd() : replyWithoutSuggestions

  const match = cleanedReply.match(/\[AFFINITY:([+-]\d+)\]\s*$/)
  if (!match) {
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
