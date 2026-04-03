// ─── Universe definitions (unchanged) ───

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
    locked: false,
  },
  {
    id: 'hollow-manor',
    title: 'Hollow Manor',
    genre: 'HORROR',
    genreTag: 'SUPERNATURAL HORROR',
    description: 'You inherit a crumbling estate on the edge of a dying town. Something inside the walls has been waiting for you.',
    image: '/hollow-manor.svg',
    locked: false,
  },
  {
    id: 'the-last-signal',
    title: 'The Last Signal',
    genre: 'MYSTERY',
    genreTag: 'NOIR MYSTERY',
    description: 'A missing person. A city full of liars. You have 48 hours before the only witness disappears for good.',
    image: '/last-signal.svg',
    locked: false,
  },
  {
    id: 'edge-of-atlas',
    title: 'Edge of Atlas',
    genre: 'EPIC ADVENTURE',
    genreTag: 'EPIC ADVENTURE',
    description: 'The map ends here. Beyond it, three lost civilisations and the one artefact that could rewrite history.',
    image: '/edge-of-atlas.svg',
    locked: false,
  },
]

export const GENRE_FILTERS = ['ALL', 'ROMANCE', 'HORROR', 'MYSTERY', 'ADVENTURE']

// ─── V2 Step-based story model ───

export type StepType = 'beat' | 'chat' | 'choice' | 'reveal' | 'scene'

export interface ChoiceOption {
  id: string
  label: string
  description: string
  sceneHint: string // mood hint shown on card
  consequenceHint?: string // 1-sentence preview of what happens
  imagePrompt?: string // per-option preview image
}

export interface SceneCharacter {
  characterId: string
  minExchanges?: number
  maxExchanges?: number
  required?: boolean // must talk to this character before advancing
}

export interface StoryStep {
  id: string
  type: StepType
  title?: string
  // Beat fields
  openingProse?: string // only for first beat or static opening
  sceneImagePrompt?: string // Together AI FLUX.1 prompt
  staticImage?: string // fallback
  arcBrief?: string // what must be true by end of this beat
  // Chat fields
  characterId?: string
  maxExchanges?: number // soft cap — character wraps up naturally near this
  minExchanges?: number // minimum before "Continue story" button appears
  chatImagePrompt?: string // FLUX prompt for chat header image (overrides character introImagePrompt)
  // Scene fields (multi-character chat)
  sceneCharacters?: SceneCharacter[]
  minCharactersTalkedTo?: number // how many characters must be talked to before advancing
  groupChat?: boolean // if true, renders as unified group thread instead of tabbed scene
  // Choice fields
  choicePointId?: string
  options?: ChoiceOption[]
  // Conditional: which branch choices must match for this step to be active
  requires?: Record<string, string>
}

// Scene image prompts for FLUX.1 Schnell — each describes a distinct mood/location
const SCENE_PROMPTS = {
  arrival: 'Anime style, a young person standing in front of a gleaming modern entertainment building at night in Seoul, looking up in awe, cherry blossoms falling, neon signs reflecting on wet pavement, cinematic lighting, first day energy',
  elevator: 'Anime style, inside a sleek modern elevator, a handsome Korean male idol with dark messy hair in a black turtleneck facing a young person, both surprised, city lights through glass walls, intimate tension, K-drama moment',
  rehearsal: 'Anime style, a handsome Korean male idol with dark messy hair dancing intensely in a practice room with mirror walls, warm spotlight, focused expression, sweat on his brow, Seoul skyline through windows at dusk, other dancers in background',
  studioApproach: 'Anime style, recording studio interior, a handsome Korean male idol with dark hair sitting at a mixing console, looking up as someone approaches, warm colorful lighting, intimate creative atmosphere, K-drama aesthetic',
  corridorFollow: 'Anime style, a handsome Korean male idol with dark messy hair walking quickly down a dimly lit corridor, coat flowing, a figure following at a distance in the shadows, mysterious blue-tinted lighting, tension',
  rooftopConfront: 'Anime style, two young people facing each other on a rooftop at night, one with dark messy hair looking intense, wind blowing, city lights sprawling behind them, emotional confrontation, K-drama climax',
  rooftopStay: 'Anime style, two young people sitting side by side on a rooftop edge at golden hour looking at sunset over Seoul, shoulders almost touching, warm colors, quiet intimacy, cherry blossoms on the breeze',
  backstageTrust: 'Anime style, backstage after a concert, a young idol with dark hair sitting on a case sharing earbuds with someone, warm string lights, costumes hanging around them, vulnerable trust, soft golden glow',
  cafeDeflect: 'Anime style, a young person sitting alone in a quiet late-night cafe in Seoul, rain on windows, looking at their phone with a conflicted expression, melancholic blue lighting, beautiful but lonely',
  reveal: 'Anime style, ethereal dream-like scene, two silhouettes connected by glowing threads of light, abstract Seoul cityscape in background, cosmic purple and pink tones, emotional, beautiful',
  practiceHall: 'Anime style, a girl with vibrant blue dyed hair in an oversized hoodie leaning against a practice room window talking animatedly to a young person, bright academy hallway, cherry blossoms through skylights, warm afternoon light',
  afterHours: 'Anime style, a handsome Korean male idol with dark hair playing piano in a dim studio late at night, a young person sitting beside him listening, sheet music scattered, Seoul city lights through the window, intimate and vulnerable',
  soraRooftop: 'Anime style, a girl with vibrant blue hair sitting on an academy rooftop railing talking to a young person, sunset over Seoul, warm golden light, wind in her hair, cheerful but with a hint of seriousness, K-drama aesthetic',
}

export const STORY_STEPS: StoryStep[] = [
  // ── Act 1: Setup (linear) ──
  {
    id: 'beat-1',
    type: 'beat',
    title: 'First Day',
    staticImage: '/scene-elevator.jpg',
    sceneImagePrompt: SCENE_PROMPTS.arrival,
    openingProse: 'The elevator doors slide open. Standing in front of you is Lee Jiwon — the lead vocalist of NOVA. He looks as surprised as you are.\n\nNeither of you speaks. The city hums forty floors below.\n\nThen the doors start to close, and he catches them with one hand.',
    arcBrief: 'First encounter with Jiwon. Establish the spark of something — surprise, curiosity, tension. End with an unresolved moment.',
  },
  {
    id: 'chat-1',
    type: 'chat',
    title: 'Talk to Jiwon',
    characterId: 'jiwon',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENE_PROMPTS.elevator,
  },
  {
    id: 'beat-1b',
    type: 'beat',
    title: 'The Practice Rooms',
    sceneImagePrompt: SCENE_PROMPTS.practiceHall,
    arcBrief: 'The protagonist settles into academy life. Between classes, they pass the practice rooms. Through one glass window, NOVA is rehearsing. Jiwon at the center, commanding but distant. The other members laugh between takes. Jiwon doesn\'t. A blue-haired girl appears beside the protagonist. She grins like they\'re already friends. Sora knows things: who to avoid, which rooms have the best acoustics, why Jiwon doesn\'t eat in the cafeteria. End with Sora saying something knowing: "He noticed you, by the way. In the elevator. He doesn\'t usually notice anyone."',
  },
  {
    id: 'scene-1',
    type: 'scene',
    title: 'Practice Rooms',
    chatImagePrompt: SCENE_PROMPTS.practiceHall,
    sceneCharacters: [
      { characterId: 'sora', minExchanges: 2, maxExchanges: 8, required: true },
      { characterId: 'jiwon', minExchanges: 1, maxExchanges: 8, required: false },
    ],
    minCharactersTalkedTo: 1,
  },
  {
    id: 'beat-2',
    type: 'beat',
    title: 'The Rehearsal',
    staticImage: '/scene-studio.jpg',
    sceneImagePrompt: SCENE_PROMPTS.rehearsal,
    arcBrief: 'The next day at the academy. Jiwon is rehearsing. The protagonist sees a different side of him — focused, under pressure. Something Jiwon does or says reveals the weight he carries. End with a moment that makes the protagonist want to know more.',
  },

  // ── Choice Point A ──
  {
    id: 'cp-1',
    type: 'choice',
    title: 'A Decision',
    choicePointId: 'cp-1',
    sceneImagePrompt: SCENE_PROMPTS.rehearsal,
    options: [
      {
        id: 'approach',
        label: 'Approach him',
        description: 'Walk up to Jiwon at the mixing desk. Say something.',
        sceneHint: 'bold / direct',
        consequenceHint: 'Your directness could disarm him — or make him shut down completely.',
        imagePrompt: SCENE_PROMPTS.studioApproach,
      },
      {
        id: 'follow',
        label: 'Follow at a distance',
        description: 'He leaves in a hurry. Follow him — see where he goes.',
        sceneHint: 'cautious / curious',
        consequenceHint: 'You\'ll see a side of him he hides from everyone — but if he catches you...',
        imagePrompt: SCENE_PROMPTS.corridorFollow,
      },
    ],
  },

  // ── Act 2: Approach path ──
  {
    id: 'beat-3a',
    type: 'beat',
    title: 'The Studio',
    requires: { 'cp-1': 'approach' },
    staticImage: '/scene-studio.jpg',
    sceneImagePrompt: SCENE_PROMPTS.studioApproach,
    arcBrief: 'The protagonist approaches Jiwon at the studio. What starts as small talk turns into something more personal. Jiwon lets his guard down slightly. They discover a shared connection through music. End with a moment of genuine warmth — but also a reminder of the distance between their worlds.',
  },
  {
    id: 'scene-2a',
    type: 'scene',
    title: 'After the Studio',
    requires: { 'cp-1': 'approach' },
    chatImagePrompt: SCENE_PROMPTS.afterHours,
    sceneCharacters: [
      { characterId: 'sora', minExchanges: 2, maxExchanges: 8, required: false },
      { characterId: 'jiwon', minExchanges: 2, maxExchanges: 8, required: true },
    ],
    minCharactersTalkedTo: 1,
  },

  // ── Act 2: Follow path ──
  {
    id: 'beat-3b',
    type: 'beat',
    title: 'The Corridor',
    requires: { 'cp-1': 'follow' },
    staticImage: '/scene-rooftop.jpg',
    sceneImagePrompt: SCENE_PROMPTS.corridorFollow,
    arcBrief: 'The protagonist follows Jiwon through the academy. He leads them to an unexpected place — somewhere private, away from cameras and fans. They overhear something they weren\'t meant to. Jiwon catches them. End with a confrontation that could go either way.',
  },
  {
    id: 'scene-2b',
    type: 'scene',
    title: 'After the Confrontation',
    requires: { 'cp-1': 'follow' },
    chatImagePrompt: SCENE_PROMPTS.corridorFollow,
    sceneCharacters: [
      { characterId: 'jiwon', minExchanges: 2, maxExchanges: 8, required: true },
      { characterId: 'sora', minExchanges: 1, maxExchanges: 8, required: false },
    ],
    minCharactersTalkedTo: 1,
  },

  // ── Choice Point B (options differ per path) ──
  {
    id: 'cp-2-approach',
    type: 'choice',
    title: 'The Moment',
    choicePointId: 'cp-2',
    requires: { 'cp-1': 'approach' },
    sceneImagePrompt: SCENE_PROMPTS.rooftopConfront,
    options: [
      {
        id: 'confront',
        label: 'Confront the truth',
        description: 'Tell Jiwon what Sora told you. No more pretending.',
        sceneHint: 'brave / vulnerable',
        consequenceHint: 'Raw honesty could shatter everything — or finally make it real.',
        imagePrompt: SCENE_PROMPTS.rooftopConfront,
      },
      {
        id: 'stay',
        label: 'Stay quiet, stay close',
        description: 'Some things are better left unsaid. Just be there.',
        sceneHint: 'gentle / patient',
        consequenceHint: 'Silence speaks too. Sometimes presence is the braver choice.',
        imagePrompt: SCENE_PROMPTS.rooftopStay,
      },
    ],
  },
  {
    id: 'cp-2-follow',
    type: 'choice',
    title: 'The Moment',
    choicePointId: 'cp-2',
    requires: { 'cp-1': 'follow' },
    sceneImagePrompt: SCENE_PROMPTS.backstageTrust,
    options: [
      {
        id: 'trust',
        label: 'Trust him',
        description: 'Tell Jiwon what you overheard. Let him explain.',
        sceneHint: 'open / hopeful',
        consequenceHint: 'A leap of faith — he might catch you, or you might fall alone.',
        imagePrompt: SCENE_PROMPTS.backstageTrust,
      },
      {
        id: 'deflect',
        label: 'Deflect and leave',
        description: 'Pretend you didn\'t hear anything. Walk away.',
        sceneHint: 'guarded / safe',
        consequenceHint: 'Safe, but you\'ll carry the weight of what you didn\'t say.',
        imagePrompt: SCENE_PROMPTS.cafeDeflect,
      },
    ],
  },

  // ── Act 3: Four endings ──
  {
    id: 'ending-approach-confront',
    type: 'beat',
    title: 'The Confrontation',
    requires: { 'cp-1': 'approach', 'cp-2': 'confront' },
    staticImage: '/scene-rooftop.jpg',
    sceneImagePrompt: SCENE_PROMPTS.rooftopConfront,
    arcBrief: 'The protagonist confronts Jiwon on the rooftop. Raw honesty. Jiwon is shaken — nobody talks to him like this. The conversation escalates, then breaks open into something real. End with a moment of mutual recognition: they see each other clearly for the first time. Bittersweet but hopeful. The strongest emotional connection.',
  },
  {
    id: 'ending-approach-stay',
    type: 'beat',
    title: 'The Quiet Choice',
    requires: { 'cp-1': 'approach', 'cp-2': 'stay' },
    staticImage: '/scene-rooftop.jpg',
    sceneImagePrompt: SCENE_PROMPTS.rooftopStay,
    arcBrief: 'The protagonist chooses presence over words. They sit together on the rooftop as the sun sets. Jiwon doesn\'t say much, but his body language softens. A small gesture — sharing earbuds, letting their shoulders touch. End with quiet intimacy. Nothing resolved, but something planted. Warm and tender.',
  },
  {
    id: 'ending-follow-trust',
    type: 'beat',
    title: 'The Leap',
    requires: { 'cp-1': 'follow', 'cp-2': 'trust' },
    staticImage: '/scene-studio.jpg',
    sceneImagePrompt: SCENE_PROMPTS.backstageTrust,
    arcBrief: 'The protagonist takes a risk and tells Jiwon the truth. Backstage, after everything, Jiwon is tired of people lying to him. The honesty lands. He shares something he\'s never told anyone. End with a fragile new trust — two people who chose each other in a world that incentivizes pretending. Vulnerable and honest.',
  },
  {
    id: 'ending-follow-deflect',
    type: 'beat',
    title: 'The Distance',
    requires: { 'cp-1': 'follow', 'cp-2': 'deflect' },
    staticImage: '/scene-elevator.jpg',
    sceneImagePrompt: SCENE_PROMPTS.cafeDeflect,
    arcBrief: 'The protagonist walks away. Later, alone in a late-night cafe, they replay what happened. Their phone buzzes — it\'s Jiwon, sending a song link with no message. End with the ache of something that could have been. Melancholic but beautiful. The connection is real but neither was brave enough.',
  },

  // ── Reveal ──
  {
    id: 'reveal',
    type: 'reveal',
    title: 'Your Story',
    sceneImagePrompt: SCENE_PROMPTS.reveal,
  },
]

// ─── Branch router ───

export function getActiveSteps(branchChoices: Record<string, string>, steps: StoryStep[] = STORY_STEPS): StoryStep[] {
  return steps.filter((step) => {
    if (!step.requires) return true
    return Object.entries(step.requires).every(
      ([cpId, required]) => branchChoices[cpId] === required
    )
  })
}

export function getTotalBeats(steps: StoryStep[]): number {
  return steps.filter((s) => s.type === 'beat').length
}

export function getCurrentBeatNumber(steps: StoryStep[], currentStepIndex: number): number {
  let count = 0
  for (let i = 0; i <= currentStepIndex && i < steps.length; i++) {
    if (steps[i].type === 'beat') count++
  }
  return count
}

// ─── Character bible (used in story generation prompts) ───

export const CHARACTER_BIBLE = `
STORY: The Seoul Transfer
SETTING: Seoul Arts Academy, present day.

CHARACTERS:
- Lee Jiwon: Lead vocalist of NOVA, Korea's top idol group. 23 years old. Quietly intense. Doesn't show vulnerability easily. Protective once he trusts someone.
- Sora: Blue-haired trainee at the academy. 21. Energetic, sharp-witted, knows everyone. Friendly but ambitious — she's here to debut too.
- NOVA: K-pop group. Members include Jiwon (vocals), Minjae (rap), and Seobin (dance). Fictional — no real celebrity references.
- You (Y/N): International transfer student. Talented musician. Drawn into NOVA's world by circumstance.

TONE: Cinematic K-drama romance. Slow burn. Emotionally intelligent prose. Short, punchy paragraphs. Present tense.

RULES:
- Never name real celebrities.
- Keep prose under 120 words per beat.
- End each beat with a clear emotional tension or revelation.
- Reference prior choices and conversations naturally in the narrative.
`

export const CHAPTER_BRIEFS: Record<number, string> = {
  1: 'By the end of this chapter, Jiwon and the protagonist have had their first real moment of connection — unexpected, slightly charged, not resolved. Jiwon has revealed one small unguarded thing about himself. The protagonist has made an impression, positive or complicated depending on the choice made.',
}

// ─── Love interest resolution ───

const SWAP_MAP: Record<string, Record<string, string>> = {
  yuna: {
    'Jiwon': 'Yuna',
    'jiwon': 'yuna',
    'Lee Jiwon': 'Kang Yuna',
    'NOVA': 'LUMINA',
    ' he ': ' she ',
    ' He ': ' She ',
    ' him ': ' her ',
    ' Him ': ' Her ',
    ' his ': ' her ',
    ' His ': ' Her ',
    ' himself': ' herself',
    'lead vocalist of NOVA': 'lead vocalist of LUMINA',
  },
}

/** Resolve which character ID to use for the main love interest */
export function resolveLoveInterestId(preference: 'jiwon' | 'yuna' | null): string {
  return preference === 'yuna' ? 'yuna' : 'jiwon'
}

/** Swap gendered text when love interest is Yuna */
export function resolveText(text: string, preference: 'jiwon' | 'yuna' | null): string {
  if (!preference || preference === 'jiwon') return text
  const swaps = SWAP_MAP[preference]
  if (!swaps) return text
  let result = text
  for (const [from, to] of Object.entries(swaps)) {
    result = result.split(from).join(to)
  }
  return result
}

/** Get the character bible adjusted for love interest */
export function getCharacterBible(preference: 'jiwon' | 'yuna' | null): string {
  return resolveText(CHARACTER_BIBLE, preference)
}

// ─── Universe-aware story loading ───

import { getStoryData } from './stories'

/** Get steps for a universe. Falls back to Seoul Transfer. */
export function getStepsForUniverse(universeId: string | null): StoryStep[] {
  const storyData = getStoryData(universeId)
  if (storyData) return storyData.steps
  return STORY_STEPS
}

/** Get character bible for a universe. Falls back to Seoul Transfer. */
export function getBibleForUniverse(universeId: string | null, preference?: 'jiwon' | 'yuna' | null): string {
  const storyData = getStoryData(universeId)
  if (storyData) return storyData.bible
  return getCharacterBible(preference ?? null)
}

/** Get reveal perspective label for a universe */
export function getRevealPerspective(universeId: string | null, loveInterest?: 'jiwon' | 'yuna' | null): string {
  const storyData = getStoryData(universeId)
  if (storyData) return storyData.revealPerspective
  return loveInterest === 'yuna' ? 'Yuna sees you as' : 'Jiwon sees you as'
}
