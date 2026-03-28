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
  {
    id: 'hollow-manor',
    title: 'Hollow Manor',
    genre: 'HORROR',
    genreTag: 'SUPERNATURAL HORROR',
    description: 'You inherit a crumbling estate on the edge of a dying town. Something inside the walls has been waiting for you.',
    image: '/sakura.jpg',
    locked: true,
    lockedLabel: 'SOON',
  },
  {
    id: 'the-last-signal',
    title: 'The Last Signal',
    genre: 'MYSTERY',
    genreTag: 'NOIR MYSTERY',
    description: 'A missing person. A city full of liars. You have 48 hours before the only witness disappears for good.',
    image: '/seoul-night.jpg',
    locked: true,
    lockedLabel: 'SOON',
  },
  {
    id: 'edge-of-atlas',
    title: 'Edge of Atlas',
    genre: 'ADVENTURE',
    genreTag: 'EPIC ADVENTURE',
    description: 'The map ends here. Beyond it, three lost civilisations and the one artefact that could rewrite history.',
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
  continuationSceneImage: string
  openingProse: string
  choices: { text: string; gemCost?: number; trustDelta?: number }[]
}

export const SEOUL_TRANSFER_CHAPTERS: Chapter[] = [
  {
    number: 1,
    title: 'First Day',
    sceneImage: '/scene-elevator.jpg',
    continuationSceneImage: '/scene-studio.jpg',
    openingProse: 'The elevator doors slide open. Standing in front of you is Lee Junho — the lead vocalist of NOVA. He looks as surprised as you are.',
    choices: [
      { text: 'Say hello first', trustDelta: 5 },
      { text: "Pretend you don't recognize him", trustDelta: -3 },
      { text: 'Ask for his number', gemCost: 10, trustDelta: 12 },
    ],
  },
  {
    number: 2,
    title: 'The Rehearsal',
    sceneImage: '/scene-studio.jpg',
    continuationSceneImage: '/scene-rooftop.jpg',
    openingProse: 'The practice room is empty except for the two of you. Music echoes softly from the speakers. Junho sets down his bag and turns to face you.',
    choices: [
      { text: 'Offer to help with choreography', trustDelta: 10 },
      { text: 'Ask about his upcoming concert', trustDelta: 4 },
      { text: 'Stay silent and listen', gemCost: 10, trustDelta: 8 },
    ],
  },
  {
    number: 3,
    title: 'The Rooftop',
    sceneImage: '/scene-rooftop.jpg',
    continuationSceneImage: '/scene-elevator.jpg',
    openingProse: 'The door swings open. You step out onto the rooftop, expecting silence.\n\nYou don\'t expect him to already be there.',
    choices: [
      { text: 'Step closer', trustDelta: 12 },
      { text: 'Stay where you are', trustDelta: 5 },
    ],
  },
]

// Arc destination per chapter — what MUST be true by the end regardless of choices.
// User choices change the texture of how we get there, not the destination.
export const CHAPTER_BRIEFS: Record<number, string> = {
  1: 'By the end of this chapter, Junho and the protagonist have had their first real moment of connection — unexpected, slightly charged, not resolved. Junho has revealed one small unguarded thing about himself. The protagonist has made an impression, positive or complicated depending on the choice made.',
  2: 'By the end of this chapter, the rehearsal has become unexpectedly personal. Something Junho does or says reveals the pressure he is under. The protagonist has crossed from observer to someone Junho is aware of. The dynamic has shifted — there is now something unspoken between them.',
  3: 'By the end of this chapter, the rooftop scene ends with a moment of near-confession — something almost said, then pulled back. The reader should feel the weight of what wasn\'t said more than what was. This is the emotional peak of Act 1.',
}

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
