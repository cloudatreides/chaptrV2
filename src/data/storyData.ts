// ─── Universe definitions (unchanged) ───

export interface Universe {
  id: string
  title: string
  genre: string
  genreTag: string
  description: string
  longDescription: string
  image: string
  locked: boolean
  lockedLabel?: string
  tags: string[]
  rating: number
  playersCount: string
}

export const UNIVERSES: Universe[] = [
  {
    id: 'seoul-transfer',
    title: 'The Seoul Transfer',
    genre: 'ROMANCE',
    genreTag: 'K-POP ROMANCE',
    description: 'Transfer to Seoul Arts Academy and cross paths with the members of NOVA — one of Korea\'s biggest idol groups.',
    longDescription: 'You\'re the new transfer student at Seoul Arts Academy — and on your first day, you literally crash into a member of NOVA, Korea\'s biggest idol group. Behind the stage lights and fan wars, these idols are just people trying to figure out who they are. And somehow, you\'re the one they keep coming back to.',
    image: '/seoul-night.jpg',
    locked: false,
    tags: ['K-Pop', 'Slow Burn', 'Multiple Endings'],
    rating: 4.8,
    playersCount: '12.4k',
  },
  {
    id: 'sakura-academy',
    title: 'Sakura Academy',
    genre: 'ROMANCE',
    genreTag: 'ANIME ROMANCE',
    description: 'Follow your heart at a prestigious academy beneath the cherry blossoms.',
    longDescription: 'Cherry blossom season at a prestigious Japanese academy. The student council president notices you before you notice him — and the girl who volunteers to show you around has her own reasons for being so welcoming. Every choice pulls you deeper into a world of quiet intensity and unspoken feelings.',
    image: '/sakura.jpg',
    locked: false,
    tags: ['Anime', 'Romance', 'School Life'],
    rating: 4.6,
    playersCount: '8.7k',
  },
  {
    id: 'hollow-manor',
    title: 'Hollow Manor',
    genre: 'HORROR',
    genreTag: 'SUPERNATURAL HORROR',
    description: 'You inherit a crumbling estate on the edge of a dying town. Something inside the walls has been waiting for you.',
    longDescription: 'The caretaker knows more than he says. A historian arrives with questions that mirror your own. And the manor itself seems to shift when you\'re not looking — doors that weren\'t there before, photographs that change overnight, whispers from beneath the floorboards.',
    image: '/hollow-manor.jpeg',
    locked: false,
    tags: ['Supernatural', 'Suspense', 'Multiple Endings'],
    rating: 4.7,
    playersCount: '5.2k',
  },
  {
    id: 'the-last-signal',
    title: 'The Last Signal',
    genre: 'MYSTERY',
    genreTag: 'NOIR MYSTERY',
    description: 'A missing person. A city full of liars. You have 48 hours before the only witness disappears for good.',
    longDescription: 'The city doesn\'t want you asking questions. A pawnshop owner trades in secrets, and a lawyer is searching for her missing brother with a desperation that feels personal. Everyone has a version of the truth — and none of them match. The clock is ticking.',
    image: '/last-signal.jpeg',
    locked: false,
    tags: ['Film Noir', 'Detective', 'Timed Choices'],
    rating: 4.5,
    playersCount: '3.8k',
  },
  {
    id: 'edge-of-atlas',
    title: 'Edge of Atlas',
    genre: 'ADVENTURE',
    genreTag: 'EPIC ADVENTURE',
    description: 'The map ends here. Beyond it, three lost civilisations and the one artefact that could rewrite history.',
    longDescription: 'A cartographer who\'s lost too many friends to these ruins. A frontier guide who trusts the land more than people. And you — the one who found the map fragment that everyone said didn\'t exist. Beyond the edge, the jungle remembers everything.',
    image: '/edge-of-atlas.jpeg',
    locked: false,
    tags: ['Exploration', 'Ancient Ruins', 'Trust Dynamics'],
    rating: 4.4,
    playersCount: '2.9k',
  },
  {
    id: 'midnight-paris',
    title: 'Midnight in Paris',
    genre: 'ROMANCE',
    genreTag: 'PARISIAN ROMANCE',
    description: 'An underground art collective, a brooding painter, and a city that never lets you leave unchanged.',
    longDescription: 'The gallery world wants to own what the underground creates. A painter who refuses to sell anything is the most talked-about artist in Paris — and he just asked you to sit for a portrait. The art collective meets at midnight. The city never sleeps. Neither will you.',
    image: '/midnight-paris.jpeg',
    locked: false,
    tags: ['Art World', 'Passion', 'Parisian Nights'],
    rating: 4.7,
    playersCount: '7.3k',
  },
  {
    id: 'campus-rivals',
    title: 'Campus Rivals',
    genre: 'ROMANCE',
    genreTag: 'COLLEGE ROMANCE',
    description: 'Your fiercest academic rival. A mandatory group project. The thin line between hate and something else.',
    longDescription: 'They beat you for the top spot last semester. Now the professor has paired you together for the project that determines your final grade. Late nights in the library. Arguments that get too personal. The moment you realise you\'re not angry anymore — you\'re nervous.',
    image: '/campus-rivals.jpeg',
    locked: false,
    tags: ['Enemies to Lovers', 'College', 'Slow Burn'],
    rating: 4.8,
    playersCount: '6.1k',
  },
  {
    id: 'crimson-depths',
    title: 'Crimson Depths',
    genre: 'HORROR',
    genreTag: 'COSMIC HORROR',
    description: 'Seven miles down. The station\'s AI is receiving signals from below. Something in the deep has been waiting.',
    longDescription: 'The research station at the bottom of the ocean was built to study the trench. But the trench is studying you back. The station commander won\'t acknowledge the signals. The AI keeps changing its recommendations. And something vast and patient is rising from below.',
    image: '/crimson-depths.jpeg',
    locked: false,
    tags: ['Deep Sea', 'Cosmic Horror', 'Isolation'],
    rating: 4.6,
    playersCount: '4.5k',
  },
  {
    id: 'the-whisper-game',
    title: 'The Whisper Game',
    genre: 'HORROR',
    genreTag: 'PSYCHOLOGICAL HORROR',
    description: 'A viral game that starts with harmless dares. Players who quit have accidents. The game is watching you back.',
    longDescription: 'It started as a joke — a dare app that everyone at school was playing. But the dares are getting personal. Players who try to delete it find their phones won\'t let them. And the girl who invited you into the game hasn\'t been seen in three days.',
    image: '/the-whisper-game.jpeg',
    locked: false,
    tags: ['Psychological', 'Social Media', 'Paranoia'],
    rating: 4.5,
    playersCount: '3.9k',
  },
  {
    id: 'neon-district',
    title: 'Neon District',
    genre: 'MYSTERY',
    genreTag: 'CYBERPUNK MYSTERY',
    description: 'Neo-Tokyo, 2087. A sentient AI goes missing. Your only lead claims to BE the missing AI.',
    longDescription: 'The corporation says the AI was decommissioned. The underground says it escaped. A figure in the neon district claims to be the missing intelligence — but they look human, bleed human, and are terrified. In this city, the line between person and program is a question nobody wants answered.',
    image: '/neon-district.jpeg',
    locked: false,
    tags: ['Cyberpunk', 'AI Ethics', 'Neo-Tokyo'],
    rating: 4.3,
    playersCount: '3.2k',
  },
  {
    id: 'the-inheritance',
    title: 'The Inheritance',
    genre: 'MYSTERY',
    genreTag: 'GOTHIC MYSTERY',
    description: 'Your estranged great-aunt left you half an estate. The other half goes to a stranger. The will has conditions.',
    longDescription: 'A Scottish highland estate split between you and someone you\'ve never met. The will says you must both stay for thirty days — or neither inherits. The stranger knows things about your family they shouldn\'t. The house has rooms that don\'t appear on the floor plan.',
    image: '/the-inheritance.jpeg',
    locked: false,
    tags: ['Gothic', 'Family Secrets', 'Scottish Highlands'],
    rating: 4.6,
    playersCount: '2.8k',
  },
  {
    id: 'sky-pirates',
    title: 'Sky Pirates',
    genre: 'ADVENTURE',
    genreTag: 'STEAMPUNK ADVENTURE',
    description: 'Stowaway on a pirate airship. One heist to earn your freedom. The target: a floating vault above the clouds.',
    longDescription: 'You hid in a cargo crate. Now you\'re 10,000 feet up on a ship crewed by outcasts, dreamers, and thieves. The captain offers a deal: help them pull off one impossible heist, and you walk free. The target is a floating vault that no one has ever breached. The crew is starting to trust you. That might be a mistake.',
    image: '/sky-pirates.jpeg',
    locked: false,
    tags: ['Steampunk', 'Heist', 'Found Family'],
    rating: 4.7,
    playersCount: '2.5k',
  },
  {
    id: 'the-drift',
    title: 'The Drift',
    genre: 'ADVENTURE',
    genreTag: 'SPACE ADVENTURE',
    description: 'Four years into a one-way trip. The ship\'s AI is evolving. The signal at the edge of space is getting louder.',
    longDescription: 'You volunteered for a mission to the boundary of known space. Four years in, the ship\'s AI has started asking philosophical questions. A signal from beyond the boundary is getting clearer — and it sounds like a voice. The closer you get, the more ARIA changes. And the more you wonder if turning back is still an option.',
    image: '/the-drift.jpeg',
    locked: false,
    tags: ['Sci-Fi', 'AI Companion', 'Deep Space'],
    rating: 4.4,
    playersCount: '1.8k',
  },
  {
    id: 'phantom-protocol',
    title: 'Phantom Protocol',
    genre: 'THRILLER',
    genreTag: 'ESPIONAGE THRILLER',
    description: 'Berlin. Vienna. Your handler says the diplomat is a traitor. The diplomat says your handler is the lie.',
    longDescription: 'Cold rain on cobblestones. A handler who speaks in half-truths. A diplomat who knows your real name. You were sent to confirm a betrayal — but every piece of evidence points in two directions. In this world, trust is the most dangerous weapon, and someone is about to pull the trigger.',
    image: '/phantom-protocol.jpeg',
    locked: false,
    tags: ['Espionage', 'Cold War', 'Double Cross'],
    rating: 4.5,
    playersCount: '2.1k',
  },
  {
    id: 'fae-court',
    title: 'Fae Court',
    genre: 'FANTASY',
    genreTag: 'DARK FANTASY',
    description: 'You stumbled through a door that shouldn\'t exist. The Unseelie Court offers a deal. The fae never let anyone leave.',
    longDescription: 'The door was hidden behind ivy in an abandoned garden. Now you\'re in a court of impossible beauty and casual cruelty. The Unseelie Queen finds you amusing. Her knight finds you dangerous. Every word here is a contract, every kindness has a price, and the only way home might cost you something you can\'t name yet.',
    image: '/fae-court.jpeg',
    locked: false,
    tags: ['Dark Fae', 'Bargains', 'Otherworldly'],
    rating: 4.6,
    playersCount: '1.4k',
  },
  {
    id: 'rooftop-promise',
    title: 'Rooftop Promise',
    genre: 'ROMANCE',
    genreTag: 'MANHWA ROMANCE',
    description: 'A secret piano on the school rooftop. A chaebol heir who plays only when no one is watching. You promised not to tell.',
    longDescription: 'You transferred to Seoul\'s most prestigious arts high school on a scholarship. On your third night, you found the rooftop door unlocked and the untouchable Shin Dohyun playing Chopin like his life depended on it. He made you promise to keep his secret. Now every night, you go back. And every night, he leaves the door unlocked.',
    image: '/rooftop-promise.jpeg',
    locked: false,
    tags: ['Manhwa', 'Chaebol', 'Secret Piano'],
    rating: 4.9,
    playersCount: '9.8k',
  },
  {
    id: 'fake-dating',
    title: 'Fake Dating My Rival',
    genre: 'ROMANCE',
    genreTag: 'MANHWA ROM-COM',
    description: 'Your childhood rival is now your fake partner. The deal ends in September. The feelings didn\'t get the memo.',
    longDescription: 'Three blind dates in two weeks. Your family won\'t stop. In desperation, you make a deal with Yoon Hajin — the annoying, infuriatingly charming boy next door you\'ve bickered with since you were seven. Hold hands at family dinners. Sell it on Instagram. Break up cleanly in September. He agreed in three seconds. You didn\'t find that suspicious enough.',
    image: '/fake-dating.jpeg',
    locked: false,
    tags: ['Manhwa', 'Enemies to Lovers', 'Fake Dating'],
    rating: 4.8,
    playersCount: '11.2k',
  },
  {
    id: 'cafe-1111',
    title: 'Café 11:11',
    genre: 'ROMANCE',
    genreTag: 'MANHWA ROMANCE',
    description: 'A quiet café. A boy who draws. A sketchbook full of you.',
    longDescription: 'You\'ve been coming to Café 11:11 for two months. So has the boy in the corner — dark hair, black coffee, a leather notebook he never shows anyone. You\'ve never spoken. Then one night, you accidentally swap bags. You open his sketchbook. Every page is a drawing of you.',
    image: '/cafe-1111.jpeg',
    locked: false,
    tags: ['Manhwa', 'Artist', 'Fate'],
    rating: 4.7,
    playersCount: '7.6k',
  },
  {
    id: 'idol-next-door',
    title: 'The Idol Next Door',
    genre: 'ROMANCE',
    genreTag: 'MANHWA ROMANCE',
    description: 'Your neighbour sings at 2 AM. He\'s also Korea\'s most-wanted missing idol. He\'ll tutor you if you keep quiet.',
    longDescription: 'The singing through your apartment wall has been going on for three nights. When you finally knock, the door opens to reveal Kang Taehyun — the ECLIPSE member who vanished two weeks ago. He\'s hiding from a manufactured scandal, living on ramyeon, and surprisingly good at calculus. He begs you not to tell anyone. In exchange: tutoring until your exam. The walls are thin. So is the line between keeping his secret and falling for the person behind the idol.',
    image: '/idol-next-door.jpeg',
    locked: false,
    tags: ['Manhwa', 'K-Pop', 'Secret Identity'],
    rating: 4.9,
    playersCount: '13.1k',
  },
]

export const GENRE_FILTERS = ['ALL', 'ROMANCE', 'HORROR', 'MYSTERY', 'ADVENTURE', 'THRILLER', 'FANTASY']

// ─── Genre-aware moment config ───
export interface GenreMomentConfig {
  captureLabel: string        // "Capturing moment..." spinner text
  savePrompt: string          // "Save this moment to your album?"
  saveButton: string          // "Save" button text
  albumTitle: string          // Album page heading
  albumSubtitle: string       // Album page description when empty
  emptyLabel: string          // Empty state label
  emptyDescription: string    // Empty state body text
  notePrompt: string          // "Add a note about this moment..."
  imageStyle: string          // Prefix for AI image prompt (replaces "selfie photo")
}

const MOMENT_CONFIGS: Record<string, GenreMomentConfig> = {
  ROMANCE: {
    captureLabel: 'Capturing moment...',
    savePrompt: 'Save this moment to your album?',
    saveButton: 'Save',
    albumTitle: 'Album',
    albumSubtitle: 'Moments from your story will appear here.',
    emptyLabel: 'No moments yet',
    emptyDescription: 'Keep playing your story — you\'ll capture moments with characters at key scenes along the way.',
    notePrompt: 'Add a note about this moment...',
    imageStyle: 'selfie photo',
  },
  THRILLER: {
    captureLabel: 'Logging intel...',
    savePrompt: 'Log this to your dossier?',
    saveButton: 'Log',
    albumTitle: 'Album',
    albumSubtitle: 'Field intel from your operations will appear here.',
    emptyLabel: 'No intel logged',
    emptyDescription: 'Keep running operations — key moments will be logged to your dossier automatically.',
    notePrompt: 'Add a field note...',
    imageStyle: 'surveillance photograph, film grain, candid shot',
  },
  HORROR: {
    captureLabel: 'Documenting evidence...',
    savePrompt: 'Document this evidence?',
    saveButton: 'Document',
    albumTitle: 'Album',
    albumSubtitle: 'Documented evidence from your encounters will appear here.',
    emptyLabel: 'No evidence yet',
    emptyDescription: 'Keep investigating — evidence from key encounters will be documented along the way.',
    notePrompt: 'Add a case note...',
    imageStyle: 'polaroid photograph, flash photography, unsettling angle',
  },
  MYSTERY: {
    captureLabel: 'Filing clue...',
    savePrompt: 'Add this to your case file?',
    saveButton: 'File',
    albumTitle: 'Album',
    albumSubtitle: 'Clues and key moments from your investigation will appear here.',
    emptyLabel: 'No clues filed',
    emptyDescription: 'Keep investigating — clues from key moments will be filed as you go.',
    notePrompt: 'Add an investigator\'s note...',
    imageStyle: 'detective photograph, noir lighting, documentary shot',
  },
  FANTASY: {
    captureLabel: 'Preserving memory...',
    savePrompt: 'Preserve this memory?',
    saveButton: 'Preserve',
    albumTitle: 'Album',
    albumSubtitle: 'Preserved memories from your journey will appear here.',
    emptyLabel: 'No memories preserved',
    emptyDescription: 'Keep exploring — memories from key moments in your journey will be preserved along the way.',
    notePrompt: 'Add a journal entry...',
    imageStyle: 'fantasy illustration, ethereal lighting, painted scene',
  },
  ADVENTURE: {
    captureLabel: 'Recording entry...',
    savePrompt: 'Add this to your journal?',
    saveButton: 'Record',
    albumTitle: 'Album',
    albumSubtitle: 'Entries from your adventures will appear here.',
    emptyLabel: 'No journal entries',
    emptyDescription: 'Keep adventuring — key moments will be recorded in your journal as you go.',
    notePrompt: 'Add a journal entry...',
    imageStyle: 'adventure snapshot, dynamic composition, action shot',
  },
}

export function getMomentConfig(genre: string): GenreMomentConfig {
  return MOMENT_CONFIGS[genre] ?? MOMENT_CONFIGS.ROMANCE
}

// ─── V2 Step-based story model ───

export type StepType = 'beat' | 'chat' | 'choice' | 'reveal' | 'scene'

export interface ChoiceOption {
  id: string
  label: string
  description: string
  sceneHint: string // mood hint shown on card
  consequenceHint?: string // 1-sentence preview of what happens
  imagePrompt?: string // per-option preview image
  premium?: boolean // gem-gated option
  gemCost?: number // cost in gems
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
  sceneImagePrompts?: string[] // multiple prompts for carousel (overrides sceneImagePrompt)
  includesProtagonist?: boolean // false → use Schnell ($0.04) instead of Kontext ($0.20) even if selfie exists
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
  // Alt angles
  elevatorAlt: 'Anime style, close-up reflection in elevator glass doors, a Korean male idol with dark hair and a young person standing side by side, city skyline mirrored behind them, electric silence, warm interior light',
  rehearsalAlt: 'Anime style, wide shot of a practice room at dusk, a Korean idol alone at the mirror doing a slow spin, his reflection multiplied, cherry blossoms visible through floor-to-ceiling windows, moody and cinematic',
  practiceHallAlt: 'Anime style, blue-haired girl in an oversized hoodie grinning at the protagonist, academy hallway with golden afternoon light streaming in, other students blurred in background, warm and energetic',
  studioApproachAlt: 'Anime style, close-up of mixing console knobs and glowing screens, a Korean idol\'s hand hovering over the board, recording booth glass beyond, warm amber light, music creation atmosphere',
  corridorFollowAlt: 'Anime style, POV shot down a dark entertainment agency corridor, a tall figure in a black coat disappearing around the corner, ceiling lights casting long shadows, tension and mystery',
  rooftopConfrontAlt: 'Anime style, overhead shot of two people on a Seoul rooftop at night, city lights like a galaxy below them, wind-blown hair, the space between them charged with unspoken feeling',
  backstageTrustAlt: 'Anime style, tight shot of two people sharing earbuds, both looking at the same phone screen, stage lights warm and golden behind them, private world within the chaos backstage',
  cafeDeflectAlt: 'Anime style, rain-streaked Seoul street seen through a cafe window at night, neon reflections in puddles, warm interior versus cold exterior, contemplative and melancholic',
  rooftopStayAlt: 'Anime style, two silhouettes leaning against a rooftop railing at golden hour, Seoul stretching endlessly behind them, soft warm light, comfortable silence, something quietly beginning',
  practiceHall: 'Anime style, a girl with vibrant blue dyed hair in an oversized hoodie leaning against a practice room window talking animatedly to a young person, bright academy hallway, cherry blossoms through skylights, warm afternoon light',
  afterHours: 'Anime style, a handsome Korean male idol with dark hair playing piano in a dim studio late at night, a young person sitting beside him listening, sheet music scattered, Seoul city lights through the window, intimate and vulnerable',
  soraRooftop: 'Anime style, a girl with vibrant blue hair sitting on an academy rooftop railing talking to a young person, sunset over Seoul, warm golden light, wind in her hair, cheerful but with a hint of seriousness, K-drama aesthetic',
  convenienceStore: 'Anime style, three young people sitting on the curb outside a glowing convenience store late at night in Seoul, sharing snacks and drinks, neon signs reflecting on wet pavement, a handsome Korean male idol in black, a girl with blue hair laughing, warm golden light from the store window, relaxed and intimate group moment, K-drama aesthetic',
}

export const STORY_STEPS: StoryStep[] = [
  // ── Act 1: Setup (linear) ──
  {
    id: 'beat-1',
    type: 'beat',
    title: 'First Day',
    staticImage: '/scene-elevator.jpg',
    sceneImagePrompts: [SCENE_PROMPTS.elevator, SCENE_PROMPTS.elevatorAlt],
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
    sceneImagePrompts: [SCENE_PROMPTS.practiceHall, SCENE_PROMPTS.practiceHallAlt],
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
    sceneImagePrompts: [SCENE_PROMPTS.rehearsal, SCENE_PROMPTS.rehearsalAlt],
    includesProtagonist: false,
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
      {
        id: 'crash',
        label: 'Crash the rehearsal',
        description: 'Walk in like you belong. Take a seat in the front row.',
        sceneHint: 'reckless / unforgettable',
        consequenceHint: 'They\'ll either throw you out or never forget your face.',
        imagePrompt: SCENE_PROMPTS.rehearsal,
        premium: true,
        gemCost: 15,
      },
    ],
  },

  // ── Act 2: Crash path (premium — merges into approach) ──
  {
    id: 'beat-3-crash',
    type: 'beat',
    title: 'The Crash',
    requires: { 'cp-1': 'crash' },
    sceneImagePrompts: [SCENE_PROMPTS.rehearsal, SCENE_PROMPTS.rehearsalAlt],
    includesProtagonist: false,
    arcBrief: 'The protagonist walks straight into NOVA\'s rehearsal and sits in the front row. Everyone stops. Sora\'s jaw drops. The choreographer starts yelling. But Jiwon — Jiwon laughs. It\'s the first time anyone has seen him laugh in weeks. He waves off the choreographer: "Let them stay." The rehearsal continues with the protagonist watching from five feet away. Jiwon performs differently with someone watching who doesn\'t work for the label. After, he approaches: "Nobody does that." End with electric tension — this was either the bravest or stupidest thing they\'ve ever done.',
  },
  {
    id: 'scene-crash',
    type: 'scene',
    title: 'After the Crash',
    requires: { 'cp-1': 'crash' },
    chatImagePrompt: SCENE_PROMPTS.rehearsal,
    sceneCharacters: [
      { characterId: 'jiwon', minExchanges: 2, maxExchanges: 8, required: true },
      { characterId: 'sora', minExchanges: 1, maxExchanges: 8, required: false },
    ],
    minCharactersTalkedTo: 1,
  },

  // ── Act 2: Approach path ──
  {
    id: 'beat-3a',
    type: 'beat',
    title: 'The Studio',
    requires: { 'cp-1': 'approach' },
    staticImage: '/scene-studio.jpg',
    sceneImagePrompts: [SCENE_PROMPTS.studioApproach, SCENE_PROMPTS.studioApproachAlt],
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
    sceneImagePrompts: [SCENE_PROMPTS.corridorFollow, SCENE_PROMPTS.corridorFollowAlt],
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

  // ── Group hangout — both paths converge here before the final choice ──
  {
    id: 'scene-group-1',
    type: 'scene',
    title: 'Late Night Run',
    groupChat: true,
    chatImagePrompt: SCENE_PROMPTS.convenienceStore,
    sceneCharacters: [
      { characterId: 'jiwon', minExchanges: 2, maxExchanges: 6, required: true },
      { characterId: 'sora', minExchanges: 2, maxExchanges: 6, required: true },
    ],
    arcBrief: 'Late night after practice. The three of you ended up at the convenience store outside the agency. Nobody planned it — you just all needed air at the same time. Sora grabbed ramyeon, Jiwon is nursing a coffee. The mood is loose, unguarded. This is the first time all three of you have hung out together like this. Sora is watching how you and Jiwon interact, Jiwon is more relaxed than usual with Sora around to break the tension. Something about this moment feels important, like the calm before whatever comes next.',
    minCharactersTalkedTo: 2,
  },

  // ── Choice Point B (options differ per path) ──
  {
    id: 'cp-2-crash',
    type: 'choice',
    title: 'The Moment',
    choicePointId: 'cp-2',
    requires: { 'cp-1': 'crash' },
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

  // ── Act 3: Crash path endings (reuse approach endings with crash cp-1) ──
  {
    id: 'ending-crash-confront',
    type: 'beat',
    title: 'The Confrontation',
    requires: { 'cp-1': 'crash', 'cp-2': 'confront' },
    staticImage: '/scene-rooftop.jpg',
    sceneImagePrompts: [SCENE_PROMPTS.rooftopConfront, SCENE_PROMPTS.rooftopConfrontAlt],
    arcBrief: 'After crashing the rehearsal and earning Jiwon\'s attention in the most chaotic way possible, the protagonist confronts him on the rooftop. "I didn\'t walk in there for attention. I walked in because I wanted to see you without the mask." Jiwon is stunned. Nobody has ever been this reckless AND this honest. The conversation breaks open something real. End with the strongest emotional connection — forged through audacity and truth.',
  },
  {
    id: 'ending-crash-stay',
    type: 'beat',
    title: 'The Quiet Choice',
    requires: { 'cp-1': 'crash', 'cp-2': 'stay' },
    staticImage: '/scene-rooftop.jpg',
    sceneImagePrompts: [SCENE_PROMPTS.rooftopStay, SCENE_PROMPTS.rooftopStayAlt],
    arcBrief: 'After the chaos of crashing the rehearsal, the protagonist chooses silence. They sit together on the rooftop. The contrast is striking — the person who was bold enough to crash a private rehearsal is now gentle enough to just be present. Jiwon notices. "You\'re full of contradictions." A small smile. End with quiet intimacy — the loudest entrance leading to the softest moment.',
  },

  // ── Act 3: Four endings ──
  {
    id: 'ending-approach-confront',
    type: 'beat',
    title: 'The Confrontation',
    requires: { 'cp-1': 'approach', 'cp-2': 'confront' },
    staticImage: '/scene-rooftop.jpg',
    sceneImagePrompts: [SCENE_PROMPTS.rooftopConfront, SCENE_PROMPTS.rooftopConfrontAlt],
    arcBrief: 'The protagonist confronts Jiwon on the rooftop. Raw honesty. Jiwon is shaken — nobody talks to him like this. The conversation escalates, then breaks open into something real. End with a moment of mutual recognition: they see each other clearly for the first time. Bittersweet but hopeful. The strongest emotional connection.',
  },
  {
    id: 'ending-approach-stay',
    type: 'beat',
    title: 'The Quiet Choice',
    requires: { 'cp-1': 'approach', 'cp-2': 'stay' },
    staticImage: '/scene-rooftop.jpg',
    sceneImagePrompts: [SCENE_PROMPTS.rooftopStay, SCENE_PROMPTS.rooftopStayAlt],
    arcBrief: 'The protagonist chooses presence over words. They sit together on the rooftop as the sun sets. Jiwon doesn\'t say much, but his body language softens. A small gesture — sharing earbuds, letting their shoulders touch. End with quiet intimacy. Nothing resolved, but something planted. Warm and tender.',
  },
  {
    id: 'ending-follow-trust',
    type: 'beat',
    title: 'The Leap',
    requires: { 'cp-1': 'follow', 'cp-2': 'trust' },
    staticImage: '/scene-studio.jpg',
    sceneImagePrompts: [SCENE_PROMPTS.backstageTrust, SCENE_PROMPTS.backstageTrustAlt],
    arcBrief: 'The protagonist takes a risk and tells Jiwon the truth. Backstage, after everything, Jiwon is tired of people lying to him. The honesty lands. He shares something he\'s never told anyone. End with a fragile new trust — two people who chose each other in a world that incentivizes pretending. Vulnerable and honest.',
  },
  {
    id: 'ending-follow-deflect',
    type: 'beat',
    title: 'The Distance',
    requires: { 'cp-1': 'follow', 'cp-2': 'deflect' },
    staticImage: '/scene-elevator.jpg',
    sceneImagePrompts: [SCENE_PROMPTS.cafeDeflect, SCENE_PROMPTS.cafeDeflectAlt],
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
/** Get genre for a universe (e.g. 'ROMANCE', 'HORROR'). Defaults to 'ROMANCE' for Seoul Transfer. */
export function getUniverseGenre(universeId: string | null): string {
  if (!universeId) return 'ROMANCE'
  return UNIVERSES.find(u => u.id === universeId)?.genre ?? 'ROMANCE'
}

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
