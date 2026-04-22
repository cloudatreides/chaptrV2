import { makeClaudeRequest } from './core'

// ─── Types ───

export interface RevealSignatureParams {
  chatSummaries: string[]
  choiceHistory: { label: string; description: string; sceneHint?: string }[]
  characterState: { junhoTrust: number }
  loveInterest: 'jiwon' | 'yuna' | null
  universeId: string | null
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

// ─── Love Letter ───

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
