// ─── Chat Actions ───
// Interactive actions players can send in chat to boost affinity and get unique character reactions.

export type ActionCategory = 'romantic' | 'playful' | 'emotional' | 'gift'

export interface ChatActionVariant {
  condition: (playerGender: 'male' | 'female', characterGender: 'male' | 'female') => boolean
  label: string
  emoji: string
  promptInjection: string
  giftImagePrompt?: string
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
  giftImagePrompt?: string
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
    id: 'tell-joke',
    label: 'Tell a Joke',
    emoji: '😂',
    category: 'playful',
    gemCost: 0,
    affinityBoost: 2,
    minTier: 1,
    promptInjection: 'told you a joke. React in character — do you find it hilarious, cringe, or roast them for their humor?',
  },
  {
    id: 'dare',
    label: 'Dare',
    emoji: '🎲',
    category: 'playful',
    gemCost: 1,
    affinityBoost: 3,
    minTier: 2,
    promptInjection: '', // dynamically set with random dare
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
  // ── Emotional (mid-tier gate, free) ──
  {
    id: 'comfort',
    label: 'Comfort',
    emoji: '🤗',
    category: 'emotional',
    gemCost: 2,
    affinityBoost: 5,
    minTier: 2,
    promptInjection: 'reached out to comfort you. React in 2-3 sentences — let your guard down a little. Be vulnerable, not performative.',
  },
  {
    id: 'share-secret',
    label: 'Share a Secret',
    emoji: '🤫',
    category: 'emotional',
    gemCost: 0,
    affinityBoost: 7,
    minTier: 3,
    promptInjection: 'told you they want to share a secret. React briefly, then share ONE specific secret about yourself — something personal you haven\'t revealed before. Keep it to 2-3 sentences total.',
  },
  {
    id: 'ask-past',
    label: 'Ask About Past',
    emoji: '📷',
    category: 'emotional',
    gemCost: 0,
    affinityBoost: 5,
    minTier: 2,
    promptInjection: 'asked about your past. Share ONE specific memory or moment that shaped who you are. Be honest and concise — 2-3 sentences.',
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
    promptInjection: 'sent you a beautiful bouquet of flowers. React briefly (2-3 sentences) with genuine emotion — flustered, touched, shy. This is a romantic gesture.',
    giftImagePrompt: 'Anime style, close-up of hands holding a fresh bouquet of colorful flowers wrapped in craft paper, soft warm lighting, romantic atmosphere, high quality illustration, no face visible, gift-giving moment',
    variants: [
      {
        condition: (pg, cg) => pg === 'male' && cg === 'female',
        label: 'Send Roses',
        emoji: '🌹',
        promptInjection: 'sent you a bouquet of red roses. React briefly (2-3 sentences) with genuine emotion — flustered, touched, shy. This is clearly a romantic gesture.',
        giftImagePrompt: 'Anime style, close-up of masculine hands holding a fresh bouquet of red roses wrapped in elegant paper, soft warm lighting, romantic atmosphere, high quality illustration, no face visible, gift-giving moment',
      },
      {
        condition: (pg, cg) => pg === 'female' && cg === 'male',
        label: 'Baked Cookies',
        emoji: '🍪',
        promptInjection: 'baked you homemade cookies. React briefly (2-3 sentences) warmly — you can tell they put real effort into this. It\'s sweet and personal.',
        giftImagePrompt: 'Anime style, close-up of feminine hands holding a cute box of homemade decorated cookies tied with a ribbon, warm kitchen lighting, wholesome atmosphere, high quality illustration, no face visible, heartfelt gift',
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
    promptInjection: 'sang a song for you — just for you. React in 2-3 sentences. Be raw and genuine — what does hearing this make you feel? Don\'t narrate what happened. Just react.',
    variants: [
      {
        condition: (pg, cg) => pg === 'female' && cg === 'male',
        label: 'Made You a Playlist',
        emoji: '🎧',
        promptInjection: 'made you a personal playlist of songs that remind them of you. React in 2-3 sentences — mention one song that hit you hardest and why.',
      },
    ],
  },
]

// ─── Descriptions (for hover tooltips) ───

export const ACTION_DESCRIPTIONS: Record<string, string> = {
  'poke': 'A playful nudge to get their attention',
  'tell-joke': 'Tell a joke and see their reaction',
  'dare': 'Start a truth or dare — they\'ll dare you back',
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
      giftImagePrompt: matchingVariant.giftImagePrompt ?? action.giftImagePrompt,
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

/** IDs of actions that trigger a character reaction image in the chat thread */
export const IMAGE_REACTION_ACTION_IDS = new Set(['love-letter', 'comfort', 'mystery-box'])

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
    'comfort': 'arms open reaching out for a hug, soft vulnerable eyes glistening with tears, gentle grateful smile, warm golden lighting, emotionally moved',
    'mystery-box': 'eyes wide with surprise and delight, holding a small gift box, mouth slightly open in excitement, playful curious expression, warm colorful lighting',
    'extend-trip': 'blushing deeply, hands clasped together near face, eyes sparkling with joyful disbelief, genuinely overwhelmed happy smile, soft warm golden lighting, emotionally touched and flustered',
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

// ─── Joke Pool ───
// Genre-aware jokes that get picked randomly and shown to both player and character.

const JOKE_POOL: Record<string, string[]> = {
  ROMANCE: [
    'Are you a parking ticket? Because you\'ve got "fine" written all over you.',
    'Do you have a map? I keep getting lost in your eyes.',
    'I\'d tell you a chemistry joke, but I\'m afraid we wouldn\'t get a reaction.',
    'Why did the phone break up with the WiFi? There was no connection.',
    'I told my crush I liked her. She said "I like you too." I said "No, I LIKE like you." She said "I LIKE LIKE you too." We\'re still not dating.',
    'What do you call two birds in love? Tweet-hearts.',
    'I asked my date to meet me at the gym. She didn\'t show up. I guess we\'re not working out.',
    'Why don\'t scientists trust atoms? Because they make up everything — kind of like my excuses to text you.',
    'What did the blanket say to the bed? I\'ve got you covered.',
    'My love language is acts of snackage.',
  ],
  THRILLER: [
    'Why did the spy break up with the internet? Too many leaks.',
    'What\'s a secret agent\'s favorite type of shoe? Sneakers.',
    'I\'d tell you a classified joke, but then I\'d have to debrief you.',
    'Why don\'t spies ever get cold? They\'re always under cover.',
    'What did the surveillance camera say? I\'ve got my eye on you.',
    'How do secret agents communicate? Through covert-sation.',
    'Why was the interrogation so boring? They kept going in circles.',
    'I know a joke about a double agent, but it works both ways.',
  ],
  HORROR: [
    'What do ghosts serve for dessert? I scream.',
    'Why don\'t skeletons fight each other? They don\'t have the guts.',
    'What\'s a ghost\'s favorite room? The living room.',
    'Why did the zombie go to school? He wanted to improve his dead-ucation.',
    'What do you call a witch at the beach? A sand-witch.',
    'Why don\'t vampires have more friends? Because they\'re a pain in the neck.',
    'What\'s a demon\'s favorite meal? Deviled eggs.',
  ],
  MYSTERY: [
    'Why did the detective stay in bed? He was undercover.',
    'What do you call a fake noodle? An impasta — the most delicious suspect.',
    'I tried to write a mystery novel but couldn\'t figure out the ending. Still working on the case.',
    'Why was the math book so good at solving crimes? It had all the problems figured out.',
    'What do you call a detective who solves cases accidentally? Sheer-lock Holmes.',
    'The butler didn\'t do it. He was too busy butling.',
    'Why are detectives bad at football? They always investigate instead of scoring.',
  ],
  FANTASY: [
    'Why did the wizard fail at school? He couldn\'t spell.',
    'What do you call a lazy dragon? A drag-on.',
    'Why don\'t elves use social media? They prefer the elf-ernet.',
    'What\'s a knight\'s favorite fish? A swordfish.',
    'Why was the potion maker always calm? She knew how to keep her cool-dron.',
    'How does a wizard ask someone out? "Want to go on a magic carpet date?"',
    'Why did the orc go to therapy? Too much internal rage.',
  ],
  ADVENTURE: [
    'Why did the pirate go to school? To improve his arrrticulation.',
    'What\'s a treasure hunter\'s favorite letter? Arrrr... no wait, it\'s the C.',
    'I tried to climb a mountain once. It was an uphill battle.',
    'Why don\'t explorers ever get lost? They always find a way to make it an adventure.',
    'What did the compass say to the map? "You\'re going in the right direction."',
    'Why was the adventurer bad at cards? He always went all in.',
    'What do you call a dinosaur that explores? A Veloci-tracker.',
  ],
}

/** Pick a random joke for a genre */
export function getRandomJoke(genre: string): string {
  const pool = JOKE_POOL[genre] ?? JOKE_POOL.ROMANCE
  return pool[Math.floor(Math.random() * pool.length)]
}

// ─── Dare Pool ───
// Genre-aware dares that the player gives TO the character. The character must perform them.

const DARE_POOL: Record<string, string[]> = {
  ROMANCE: [
    'confess your most embarrassing crush moment',
    'say the cheesiest pickup line you know with a straight face',
    'admit something you\'ve never told anyone',
    'describe your ideal date in exactly three words',
    'say something you\'ve been too scared to say to me',
    'do your best impression of someone we both know',
    'tell me what you really thought when we first met',
    'describe me using only food comparisons',
    'sing the first song that comes to mind right now',
    'admit the last thing you lied about',
  ],
  THRILLER: [
    'reveal one thing from your file that isn\'t redacted',
    'admit the closest you\'ve come to blowing your cover',
    'confess a mission rule you\'ve broken',
    'tell me something your handler doesn\'t know',
    'describe the worst decision you\'ve made in the field',
    'admit who you trust less — me or command',
    'say the one thing an operative should never say out loud',
    'confess what you\'d do if this whole operation went sideways right now',
  ],
  HORROR: [
    'describe the last nightmare you actually remember',
    'admit what scares you more than anything',
    'confess the one thing you saw that you can\'t explain',
    'tell me what you\'d do if I disappeared right now',
    'say what you think is actually happening here — no filter',
    'admit the moment you realized something was really wrong',
    'describe the sound that makes your blood run cold',
  ],
  MYSTERY: [
    'reveal your prime suspect and why',
    'admit the biggest mistake you\'ve made on this case',
    'confess something about yourself that would make you a suspect',
    'tell me the one clue everyone else is ignoring',
    'describe the moment you knew this case was personal',
    'admit who you think is lying to us',
    'say what you think the real motive is',
  ],
  FANTASY: [
    'reveal your true name — the one with power',
    'admit what you\'d trade your magic for',
    'confess the one bargain you regret making',
    'describe the most dangerous thing you\'ve ever done with magic',
    'tell me what the prophecy really says about us',
    'admit what you saw in the enchanted mirror',
    'say the one spell you were told never to cast',
  ],
  ADVENTURE: [
    'admit the treasure you actually want most',
    'confess the closest you\'ve come to giving up',
    'describe the worst situation you\'ve talked your way out of',
    'tell me what you\'d do if the map was wrong',
    'admit the one rule of exploration you always break',
    'say what you\'d name your autobiography',
    'confess the real reason you became an adventurer',
  ],
}

/** Pick a random dare for a genre */
export function getRandomDare(genre: string): string {
  const pool = DARE_POOL[genre] ?? DARE_POOL.ROMANCE
  return pool[Math.floor(Math.random() * pool.length)]
}

/** Get 3 random dare options for the picker */
export function getDareOptions(genre: string): string[] {
  const pool = [...(DARE_POOL[genre] ?? DARE_POOL.ROMANCE)]
  const options: string[] = []
  while (options.length < 3 && pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length)
    options.push(pool.splice(idx, 1)[0])
  }
  return options
}

/** Category display info */
export const CATEGORY_INFO: Record<ActionCategory, { label: string; color: string }> = {
  romantic: { label: 'Romantic', color: '#e060b8' },
  playful: { label: 'Playful', color: '#60a5fa' },
  emotional: { label: 'Emotional', color: '#a78bfa' },
  gift: { label: 'Gifts', color: '#fbbf24' },
}
