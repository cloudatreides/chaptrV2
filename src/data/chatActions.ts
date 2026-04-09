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
    promptInjection: 'wants to play truth or dare with you. Come up with a SPECIFIC, creative dare for them that fits the current mood and your relationship. Make it playful and bold but appropriate for your closeness level. State the dare clearly, then react — are you excited to see if they\'ll do it? Nervous? Smirking? Example: "I dare you to send me a voice note saying the cheesiest pickup line you know." Be specific, not vague.',
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
    promptInjection: 'sent you a mystery gift box. Pick ONE specific item that\'s inside — something unexpected that fits your personality. Name the item, then give a SHORT reaction (1-2 sentences max). Don\'t list multiple things. Don\'t monologue. Just: what it is, and your gut reaction.',
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
    promptInjection: '', // dynamically set with AI-generated letter content
    variants: [
      {
        condition: (pg, cg) => pg === 'female' && cg === 'male',
        label: 'Slip a Note',
        emoji: '📝',
        promptInjection: '', // dynamically set with AI-generated note content
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

// ─── Descriptions (for hover tooltips) ───

export const ACTION_DESCRIPTIONS: Record<string, string> = {
  'poke': 'A playful nudge to get their attention',
  'send-meme': 'Share something funny and see their reaction',
  'dare': 'Start a truth or dare — they\'ll dare you back',
  'challenge': 'Challenge them to a quick game',
  'coffee': 'Buy them a coffee — a casual, thoughtful gesture',
  'mystery-box': 'Send a surprise gift — could be anything!',
  'favorite-thing': 'Gift something personal based on what you know about them',
  'comfort': 'Reach out with warmth when they need it',
  'share-secret': 'Open up and share something personal',
  'ask-past': 'Ask about a memory from their past',
  'romantic-gift': 'A romantic gesture to show how you feel',
  'love-letter': 'Pour your heart out in writing',
  'serenade': 'The ultimate romantic gesture',
}

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

/** Parse an action label from a message like "[ACTION: Coffee]" and return display data.
 *  Also extracts optional user input text appended after the action tag (e.g. love letter content). */
export function parseActionFromMessage(content: string): { label: string; emoji: string; userText?: string } | null {
  const firstLine = content.split('\n')[0]
  const match = firstLine.match(/^\[ACTION:\s*(.+)]$/)
  if (!match) return null
  const label = match[1]
  const userText = content.includes('\n') ? content.slice(content.indexOf('\n') + 1).trim() : undefined
  // Search all actions + variants for the label
  for (const action of CHAT_ACTIONS) {
    if (action.label === label) return { label: action.label, emoji: action.emoji, userText }
    if (action.variants) {
      for (const v of action.variants) {
        if (v.label === label) return { label: v.label, emoji: v.emoji, userText }
      }
    }
  }
  // Fallback: unknown action, still render nicely
  return { label, emoji: '✨', userText }
}

/** Get the affinity boost for mystery box (random) */
export function getMysteryBoxBoost(): number {
  return Math.floor(Math.random() * 8) + 1 // 1-8
}

/** Get available actions for a given affinity tier index (0-4) */
export function getAvailableActions(
  playerGender: 'male' | 'female',
  characterGender: 'male' | 'female',
  tierIndex: number,
): { available: ChatAction[]; locked: ChatAction[] } {
  const resolved = getResolvedActions(playerGender, characterGender)
  const available = resolved.filter(a => a.minTier <= tierIndex)
  const locked = resolved.filter(a => a.minTier > tierIndex)
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

/** IDs of actions that trigger a character reaction image in the chat thread */
export const IMAGE_REACTION_ACTION_IDS = new Set(['love-letter', 'serenade'])

/** Build a FLUX portrait prompt for a character reacting to a romantic action.
 *  Takes the character's base portraitPrompt and swaps in a reaction-specific pose/expression. */
export function buildReactionImagePrompt(
  basePortraitPrompt: string,
  actionId: string,
  _resolvedLabel: string,
): string {
  // Strip the pose/expression/clothing portion after the core appearance description
  // and replace with a reaction-specific one
  const reactionModifiers: Record<string, string> = {
    'love-letter': 'holding a handwritten letter close to their chest, eyes soft and glistening with emotion, gentle blush on cheeks, tender surprised smile, warm intimate lighting',
    'serenade': 'eyes closed with a peaceful moved expression, hand over heart, soft blush, listening to music, dreamy warm lighting, deeply touched',
  }

  const modifier = reactionModifiers[actionId] ?? 'blushing, looking touched and emotional, warm lighting'

  // Take the base prompt up to the first comma after the character description
  // and append the reaction modifier
  const base = basePortraitPrompt
    // Remove existing pose/expression descriptors
    .replace(/,\s*(subtle smirk|confident gaze|warm smile|bright expressive eyes|intense dark eyes|sharp elegant features|big smile)[^,]*/gi, '')
    // Remove existing clothing
    .replace(/,\s*wearing [^,]+/gi, '')
    // Remove existing lighting
    .replace(/,\s*(soft studio lighting|warm moody lighting)[^,]*/gi, '')
    // Remove background
    .replace(/,\s*clean (dark |simple )?background/gi, '')

  return `${base}, ${modifier}, clean soft-focus background, high quality anime art style`
}

// ─── Meme Pool ───
// Genre-aware meme descriptions that get picked randomly and shown to both player and character.

const MEME_POOL: Record<string, string[]> = {
  ROMANCE: [
    'distracted boyfriend meme but it\'s you staring at snacks instead of studying',
    'that one SpongeBob meme captioned "me pretending to be fine after 3 hours of sleep"',
    'the "this is fine" dog but the fire is just a pile of unread messages',
    'drake meme — no to "going outside" / yes to "one more episode"',
    'the awkward monkey puppet looking sideways',
    'a cat sitting at a dinner table like a disappointed parent',
    'the "guess I\'ll die" shrug guy but it\'s about doing laundry',
    '"how it started vs how it\'s going" — both photos are you on the couch',
    'that blinking white guy meme but it\'s about realizing it\'s already midnight',
    'the woman yelling at a cat at a dinner table',
  ],
  THRILLER: [
    'the "I\'m in danger" Ralph Wiggum meme but he\'s in a briefing room',
    '"we\'ve been trying to reach you about your extended warranty" but it\'s a coded transmission',
    'the conspiracy theory guy with red string and a corkboard',
    'two Spider-Men pointing at each other — both are double agents',
    '"understandable, have a great day" but to an interrogation suspect',
    'the "this is fine" dog but the room is a compromised safe house',
    '"you guys are getting paid?" but it\'s about field agent hazard pay',
    'a dog in a lab coat captioned "I have no idea what I\'m doing" — at a weapons lab',
  ],
  HORROR: [
    '"guess I\'ll die" but in a haunted house',
    'the "this is fine" dog but the fire is supernatural',
    'Scooby Doo unmasking meme — the monster was anxiety all along',
    '"first time?" meme but at a séance',
    'the astronaut "always has been" meme but about the house being haunted',
    '"we don\'t do that here" Black Panther meme but about going into the basement alone',
    'that cat being held like a baby, captioned "me after hearing literally any noise at 3am"',
  ],
  MYSTERY: [
    'the conspiracy theory guy with red string connecting clues',
    'Leonardo DiCaprio pointing at the TV — he spotted the clue',
    '"it\'s the same picture" corporate meme but it\'s two suspects',
    'the "math lady" meme trying to figure out the timeline',
    '"always has been" astronaut meme but about the butler being suspicious',
    '"am I a joke to you?" but it\'s the obvious clue everyone missed',
    'Charlie Day conspiracy board from Always Sunny',
  ],
  FANTASY: [
    '"one does not simply walk into Mordor" but it\'s about the enchanted forest',
    'the "this is fine" dog but the fire is magical',
    '"you shall not pass" but it\'s a locked enchanted door',
    'surprised Pikachu face but about a prophecy coming true',
    '"I\'m something of a wizard myself" Willem Dafoe meme',
    '"we\'ve had one breakfast, yes — but what about second breakfast?"',
    'the "guess I\'ll die" shrug but facing a dragon',
  ],
  ADVENTURE: [
    '"the floor is lava" meme but it\'s literally lava',
    '"this is fine" dog but the ship is sinking',
    '"road work ahead? yeah I sure hope it does" but about an ancient map',
    'Indiana Jones running from the boulder but it\'s a Monday',
    '"you guys are getting paid?" but about treasure hunting',
    'surprised Pikachu but about the treasure being friendship all along',
    '"that sign can\'t stop me because I can\'t read" but it\'s an ancient warning',
  ],
}

/** Pick a random meme description for a genre */
export function getRandomMeme(genre: string): string {
  const pool = MEME_POOL[genre] ?? MEME_POOL.ROMANCE
  return pool[Math.floor(Math.random() * pool.length)]
}

/** Category display info */
export const CATEGORY_INFO: Record<ActionCategory, { label: string; color: string }> = {
  romantic: { label: 'Romantic', color: '#e060b8' },
  playful: { label: 'Playful', color: '#60a5fa' },
  emotional: { label: 'Emotional', color: '#a78bfa' },
  gift: { label: 'Gifts', color: '#fbbf24' },
}
