export interface Universe {
  id: string
  title: string
  genre: string
  genreTag: string
  description: string
  image: string
  locked: boolean
  lockedLabel?: string
}

export const UNIVERSES: Universe[] = [
  {
    id: 'seoul-transfer',
    title: 'The Seoul Transfer',
    genre: 'ROMANCE',
    genreTag: 'K-POP ROMANCE',
    description: 'Transfer to Seoul Arts Academy and cross paths with the members of NOVA — one of Korea\'s biggest idol groups.',
    image: '/seoul-night.jpg',
    locked: false,
  },
  {
    id: 'sakura-academy',
    title: 'Sakura Academy',
    genre: 'ROMANCE',
    genreTag: 'ANIME ROMANCE',
    description: 'Follow your heart at a prestigious academy beneath the cherry blossoms.',
    image: '/sakura.jpg',
    locked: true,
    lockedLabel: 'SOON',
  },
]

export const GENRE_FILTERS = ['ALL', 'ROMANCE', 'HORROR', 'MYSTERY', 'ADVENTURE']

export interface Chapter {
  number: number
  title: string
  sceneImage: string
  openingProse: string
  choices: { text: string; gemCost?: number }[]
}

export const SEOUL_TRANSFER_CHAPTERS: Chapter[] = [
  {
    number: 1,
    title: 'First Day',
    sceneImage: '/scene-elevator.jpg',
    openingProse: 'The elevator doors slide open. Standing in front of you is Lee Junho — the lead vocalist of NOVA. He looks as surprised as you are.',
    choices: [
      { text: 'Say hello first' },
      { text: "Pretend you don't recognize him" },
      { text: 'Ask for his number', gemCost: 10 },
    ],
  },
  {
    number: 2,
    title: 'The Rehearsal',
    sceneImage: '/scene-studio.jpg',
    openingProse: 'The practice room is empty except for the two of you. Music echoes softly from the speakers. Junho sets down his bag and turns to face you.',
    choices: [
      { text: 'Offer to help with choreography' },
      { text: 'Ask about his upcoming concert' },
      { text: 'Stay silent and listen', gemCost: 10 },
    ],
  },
  {
    number: 3,
    title: 'The Rooftop',
    sceneImage: '/scene-rooftop.jpg',
    openingProse: 'The door swings open. You step out onto the rooftop, expecting silence.\n\nYou don\'t expect him to already be there.',
    choices: [
      { text: 'Step closer' },
      { text: 'Stay where you are' },
    ],
  },
]

export const CHARACTER_BIBLE = `
STORY: The Seoul Transfer
SETTING: Seoul Arts Academy, present day.

CHARACTERS:
- Lee Junho: Lead vocalist of NOVA, Korea's top idol group. 23 years old. Quietly intense. Doesn't show vulnerability easily. Protective once he trusts someone.
- NOVA: K-pop group. Members include Junho (vocals), Minjae (rap), and Seobin (dance). Fictional — no real celebrity references.
- You (Y/N): International transfer student. Talented musician. Drawn into NOVA's world by circumstance.

TONE: Cinematic K-drama romance. Slow burn. Emotionally intelligent prose. Short, punchy paragraphs. Present tense.

RULES:
- Never name real celebrities.
- Keep prose under 120 words per beat.
- End each beat with a clear emotional tension or revelation.
- Reference prior choices naturally in the narrative.
`
