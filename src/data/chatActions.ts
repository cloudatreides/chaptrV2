// ─── Chat Actions ───
// Interactive actions players can send in chat to boost affinity and get unique character reactions.

export type ActionCategory = 'romantic' | 'playful' | 'emotional' | 'gift'

export interface ChatActionVariant {
  condition: (playerGender: 'male' | 'female', characterGender: 'male' | 'female') => boolean
  label: string
  emoji: string
  promptInjection: string
}

export interface ChatAction {
  id: string
  label: string
  emoji: string
  category: ActionCategory
  gemCost: number
  affinityBoost: number
  minTier: number // 0-4 index into affinity tiers
  promptInjection: string
  variants?: ChatActionVariant[]
}

// ─── Action Definitions ───

export const CHAT_ACTIONS: ChatAction[] = [
  // ── Playful (low gate, free/cheap) ──
  {
    id: 'poke',
    label: 'Poke',
    emoji: '👉',
    category: 'playful',
    gemCost: 0,
    affinityBoost: 1,
    minTier: 0,
    promptInjection: 'poked you playfully. React naturally — are you amused, annoyed, or do you poke back?',
  },
  {
    id: 'send-meme',
    label: 'Send a Meme',
    emoji: '😂',
    category: 'playful',
    gemCost: 0,
    affinityBoost: 2,
    minTier: 1,
    promptInjection: 'sent you a funny meme. React in character — do you find it hilarious, cringe, or roast them for their taste?',
  },
  {
    id: 'dare',
    label: 'Dare',
    emoji: '🎲',
    category: 'playful',
    gemCost: 1,
    affinityBoost: 3,
    minTier: 2,
    promptInjection: 'dared you to do something bold. React in character — do you accept the dare, dare them back, or refuse with attitude?',
  },
  {
    id: 'challenge',
    label: 'Challenge',
    emoji: '🎮',
    category: 'playful',
    gemCost: 1,
    affinityBoost: 3,
    minTier: 1,
    promptInjection: 'challenged you to a quick game (rock-paper-scissors, trivia, or whatever fits). Play along — pick a game, play a round, and react to winning or losing.',
  },

  // ── Gifts (universal, gem cost) ──
  {
    id: 'coffee',
    label: 'Coffee',
    emoji: '☕',
    category: 'gift',
    gemCost: 1,
    affinityBoost: 3,
    minTier: 0,
    promptInjection: 'bought you a coffee. React warmly — this is a casual, thoughtful gesture.',
  },
  {
    id: 'mystery-box',
    label: 'Mystery Box',
    emoji: '🎁',
    category: 'gift',
    gemCost: 2,
    affinityBoost: 0, // random, handled specially
    minTier: 1,
    promptInjection: 'sent you a mystery gift box. Imagine what is inside based on your personality — react to discovering it. Could be something you love or something hilariously wrong.',
  },
  {
    id: 'favorite-thing',
    label: 'Their Favorite',
    emoji: '✨',
    category: 'gift',
    gemCost: 5,
    affinityBoost: 10,
    minTier: 3,
    promptInjection: '', // dynamically set based on memory match
  },

  // ── Emotional (mid-tier gate, free) ──
  {
    id: 'comfort',
    label: 'Comfort',
    emoji: '🤗',
    category: 'emotional',
    gemCost: 0,
    affinityBoost: 5,
    minTier: 2,
    promptInjection: 'reached out to comfort you with a warm, supportive gesture. React vulnerably — let your guard down a little. This person cares.',
  },
  {
    id: 'share-secret',
    label: 'Share a Secret',
    emoji: '🤫',
    category: 'emotional',
    gemCost: 0,
    affinityBoost: 7,
    minTier: 3,
    promptInjection: 'told you they want to share a secret with you. React with genuine surprise and warmth — then share one of YOUR secrets back. Reveal something personal about your backstory that you haven\'t shared before.',
  },
  {
    id: 'ask-past',
    label: 'Ask About Past',
    emoji: '📷',
    category: 'emotional',
    gemCost: 0,
    affinityBoost: 5,
    minTier: 2,
    promptInjection: 'asked about your past — something personal, something real. Share a memory or backstory detail that reveals who you are beneath the surface. Be specific and honest.',
  },

  // ── Romantic (tier-gated, gem cost) ──
  {
    id: 'romantic-gift',
    label: 'Send Flowers',
    emoji: '💐',
    category: 'romantic',
    gemCost: 3,
    affinityBoost: 8,
    minTier: 2,
    promptInjection: 'sent you a beautiful bouquet of flowers. React with genuine emotion — flustered, touched, shy. This is a romantic gesture.',
    variants: [
      {
        condition: (pg, cg) => pg === 'male' && cg === 'female',
        label: 'Send Roses',
        emoji: '🌹',
        promptInjection: 'sent you a bouquet of red roses. React with genuine emotion — flustered, touched, shy. This is clearly a romantic gesture.',
      },
      {
        condition: (pg, cg) => pg === 'female' && cg === 'male',
        label: 'Baked Cookies',
        emoji: '🍪',
        promptInjection: 'baked you homemade cookies. React warmly — you can tell they put real effort into this. It\'s sweet and personal.',
      },
    ],
  },
  {
    id: 'love-letter',
    label: 'Write a Letter',
    emoji: '💌',
    category: 'romantic',
    gemCost: 5,
    affinityBoost: 10,
    minTier: 3,
    promptInjection: 'wrote you a heartfelt letter expressing how they feel about you. React with deep emotion — this is vulnerable and real.',
    variants: [
      {
        condition: (pg, cg) => pg === 'female' && cg === 'male',
        label: 'Slip a Note',
        emoji: '📝',
        promptInjection: 'slipped a handwritten note into your pocket when you weren\'t looking. You just found it. React with genuine surprise and emotion — it says something honest about how they feel.',
      },
    ],
  },
  {
    id: 'serenade',
    label: 'Serenade',
    emoji: '🎶',
    category: 'romantic',
    gemCost: 8,
    affinityBoost: 12,
    minTier: 4,
    promptInjection: 'sang a song for you — just for you. React with deep emotion. Your walls are completely down. This is the most romantic gesture possible.',
    variants: [
      {
        condition: (pg, cg) => pg === 'female' && cg === 'male',
        label: 'Made You a Playlist',
        emoji: '🎧',
        promptInjection: 'made you a personal playlist of songs that remind them of you. React with deep emotion — every song choice shows how well they know you. This is intimate and thoughtful.',
      },
    ],
  },
]

// ─── Helpers ───

/** Get the action list with gender variants resolved */
export function getResolvedActions(
  playerGender: 'male' | 'female',
  characterGender: 'male' | 'female',
): ChatAction[] {
  return CHAT_ACTIONS.map((action) => {
    if (!action.variants) return action

    const matchingVariant = action.variants.find((v) =>
      v.condition(playerGender, characterGender),
    )
    if (!matchingVariant) return action

    return {
      ...action,
      label: matchingVariant.label,
      emoji: matchingVariant.emoji,
      promptInjection: matchingVariant.promptInjection,
    }
  })
}

/** Parse an action label from a message like "[ACTION: Coffee]" and return display data */
export function parseActionFromMessage(content: string): { label: string; emoji: string } | null {
  const match = content.match(/^\[ACTION:\s*(.+)]$/)
  if (!match) return null
  const label = match[1]
  // Search all actions + variants for the label
  for (const action of CHAT_ACTIONS) {
    if (action.label === label) return { label: action.label, emoji: action.emoji }
    if (action.variants) {
      for (const v of action.variants) {
        if (v.label === label) return { label: v.label, emoji: v.emoji }
      }
    }
  }
  // Fallback: unknown action, still render nicely
  return { label, emoji: '✨' }
}

/** Get the affinity boost for mystery box (random) */
export function getMysteryBoxBoost(): number {
  return Math.floor(Math.random() * 8) + 1 // 1-8
}

/** Get available actions for a given affinity tier index (0-4) */
export function getAvailableActions(
  playerGender: 'male' | 'female',
  characterGender: 'male' | 'female',
  _tierIndex: number,
): { available: ChatAction[]; locked: ChatAction[] } {
  const resolved = getResolvedActions(playerGender, characterGender)
  // TODO: remove — unlock all for testing
  const available = resolved
  const locked: ChatAction[] = []
  return { available, locked }
}

/** Build the prompt injection for "favorite thing" action */
export function getFavoriteThingPrompt(
  favoriteThing: string | undefined,
  memories: string[],
): { prompt: string; isMatch: boolean } {
  if (!favoriteThing) {
    return {
      prompt: 'gave you a generic gift. React politely but it\'s clear they don\'t know you that well yet. Say something like "Oh, thanks... that\'s nice." — you appreciate the gesture but it doesn\'t feel personal.',
      isMatch: false,
    }
  }

  // Check if any memory mentions the favorite thing
  const lowerFav = favoriteThing.toLowerCase()
  const hasMatch = memories.some((m) => m.toLowerCase().includes(lowerFav))

  if (hasMatch) {
    return {
      prompt: `gave you exactly what you love most — ${favoriteThing}! They REMEMBERED. React with genuine, overwhelming joy. This proves they've been paying attention to the things you've shared. This is the most thoughtful gift anyone has ever given you. Be specific about WHY this means so much.`,
      isMatch: true,
    }
  }

  return {
    prompt: 'gave you a generic gift. React politely but it\'s clear they don\'t know you that well yet. Say something like "Oh, thanks... that\'s nice." — you appreciate the gesture but it doesn\'t feel personal.',
    isMatch: false,
  }
}

/** Category display info */
export const CATEGORY_INFO: Record<ActionCategory, { label: string; color: string }> = {
  romantic: { label: 'Romantic', color: '#e060b8' },
  playful: { label: 'Playful', color: '#60a5fa' },
  emotional: { label: 'Emotional', color: '#a78bfa' },
  gift: { label: 'Gifts', color: '#fbbf24' },
}
