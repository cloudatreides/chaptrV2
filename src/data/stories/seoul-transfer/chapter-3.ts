import type { StoryStep } from '../../storyData'

const SCENE_PROMPTS = {
  emptyPractice: 'Anime style, an empty practice room at dawn, mirrors reflecting nothing, Jiwon\'s jacket left on a chair, Seoul skyline golden through the windows, ominous stillness',
  emptyPracticeAlt: 'Anime style, a practice room seen through a glass door, lights off, a single water bottle left on the floor, early morning light cutting through blinds',
  pressConference: 'Anime style, a chaotic entertainment press conference, cameras flashing, a handsome Korean idol at a podium looking composed but his knuckles white gripping the edge, reporters shouting, dramatic news lighting',
  pressConferenceAlt: 'Anime style, close-up of a phone screen showing a trending news headline in Korean with a photo of a K-pop idol, cracked screen glass, someone\'s hand trembling holding it',
  soraChoice: 'Anime style, a blue-haired girl and a young person on opposite sides of a practice room, tension between them, one pointing at the door, dramatic afternoon light through windows',
  soraChoiceAlt: 'Anime style, a blue-haired girl sitting alone in a stairwell, head in hands, harsh overhead lighting, conflicted',
  labelShowdown: 'Anime style, a tense confrontation in a corporate office between a young person and a powerful older man in a suit, glass desk between them, city view behind, dramatic low-angle shot',
  labelShowdownAlt: 'Anime style, a young person standing in the doorway of a corporate office, silhouetted against fluorescent lights, about to enter, determined posture',
  performanceNight: 'Anime style, a grand stage at a Seoul music venue, dramatic spotlight on a lone figure with dark hair holding a microphone, audience silhouettes below, purple and blue stage lighting, emotionally charged performance',
  performanceNightAlt: 'Anime style, a young person in the audience of a concert, spotlight reflecting in their eyes, hand over their heart, tears forming, the performer a blur of light on stage',
  backstageAfter: 'Anime style, backstage after a performance, a Korean idol with dark messy hair sitting on a flight case, sweaty and exhausted but smiling, looking up at someone entering, warm golden practical lights',
  backstageAfterAlt: 'Anime style, a narrow backstage hallway, a young person running toward a dressing room door, concert sounds still echoing, urgent and hopeful',
  rooftopFinal: 'Anime style, two young people on the same academy rooftop as Chapter 1, but now at sunrise instead of sunset, wind in their hair, the city waking up below, everything golden and new, emotional and hopeful',
  rooftopFinalAlt: 'Anime style, two hands almost touching on a rooftop railing at sunrise, Seoul stretching out golden below, cherry blossoms caught in morning wind, promise',
  bittersweet: 'Anime style, a train platform at night, a young person watching a train depart, a figure visible through the window getting smaller, cherry blossoms on the platform, beautiful and painful',
  bittersweetAlt: 'Anime style, an empty rooftop at dawn, two coffee cups left on the railing, Seoul below, one of the cups still steaming, quiet devastation',
}

export const CHAPTER_3_BRIEF = 'The final chapter. The label showdown reaches its climax. Jiwon\'s future in NOVA is decided. The protagonist must choose what they\'re willing to risk. Every ending is earned by the cumulative choices across all three chapters. The relationship either crystallizes into something real or remains a beautiful what-if.'

export const CHAPTER_3_STEPS: StoryStep[] = [
  {
    id: 'ch3-beat-1',
    type: 'beat',
    chapter: 3,
    title: 'Gone',
    sceneImagePrompts: [SCENE_PROMPTS.emptyPractice, SCENE_PROMPTS.emptyPracticeAlt],
    openingProse: 'Jiwon isn\'t at practice today. His locker is still locked. His jacket is still on the chair where he left it yesterday.\n\nSora finds you before you find her. Her face says everything.\n\n"It\'s online. Check the news."',
    arcBrief: 'The chapter opens with a shock: a news article has leaked that Jiwon is being removed from NOVA. "Creative differences" is the official line. The fan response is explosive — trending in minutes. Jiwon has gone dark, not answering anyone. Sora is panicked but has a lead: Jiwon was seen going to the label building early this morning. The protagonist feels the ground shift — this is no longer academy drama, it\'s an industry crisis. End with urgency: do something, or lose him to the machine.',
  },
  {
    id: 'ch3-chat-sora-crisis',
    type: 'chat',
    chapter: 3,
    title: 'Crisis Mode',
    characterId: 'sora',
    minExchanges: 3,
    maxExchanges: 6,
    chatImagePrompt: SCENE_PROMPTS.pressConference,
  },
  {
    id: 'ch3-beat-2',
    type: 'beat',
    chapter: 3,
    title: 'The Machine',
    sceneImagePrompts: [SCENE_PROMPTS.pressConference, SCENE_PROMPTS.pressConferenceAlt],
    arcBrief: 'The protagonist sees the press conference on their phone. Director Kang is speaking. Corporate language, empty phrases. "NOVA will continue to evolve." The camera finds Jiwon in the back of the room, flanked by handlers. He looks like he hasn\'t slept. For one second, the camera catches his eyes — and the protagonist recognizes the look. He\'s not angry anymore. He\'s resigned. That\'s worse. Sora grabs the protagonist\'s arm: "There\'s a showcase tonight. Jiwon\'s last performance unless something changes. If you\'re going to do anything, it has to be today." End with the clock ticking.',
  },

  // ── The central choice of the story ──
  {
    id: 'ch3-cp-1',
    type: 'choice',
    chapter: 3,
    choicePointId: 'ch3-cp-1',
    title: 'Everything or Nothing',
    sceneImagePrompt: SCENE_PROMPTS.labelShowdown,
    options: [
      {
        id: 'face-label',
        label: 'Go to the label — fight for him',
        description: 'Walk into Director Kang\'s office. You have nothing. Except the truth.',
        sceneHint: 'fearless / reckless / love',
        consequenceHint: 'You\'re a nobody in their world. But sometimes that\'s exactly who can say what everyone else is afraid to.',
        imagePrompt: SCENE_PROMPTS.labelShowdown,
        affinityDelta: { jiwon: 10 },
      },
      {
        id: 'go-to-showcase',
        label: 'Go to the showcase — be there for his last performance',
        description: 'You can\'t fight the label. But you can make sure he\'s not alone for this.',
        sceneHint: 'present / loyal / heartbreaking',
        consequenceHint: 'Sometimes the bravest thing isn\'t fighting. It\'s showing up.',
        imagePrompt: SCENE_PROMPTS.performanceNight,
        affinityDelta: { jiwon: 7, sora: 5 },
      },
    ],
  },

  // ── Face the label path ──
  {
    id: 'ch3-beat-3-label',
    type: 'beat',
    chapter: 3,
    requires: { 'ch3-cp-1': 'face-label' },
    title: 'The Outsider',
    shareable: true,
    sceneImagePrompts: [SCENE_PROMPTS.labelShowdown, SCENE_PROMPTS.labelShowdownAlt],
    arcBrief: 'The protagonist walks into the label building. No appointment. No leverage. Just conviction. They get past reception by saying they\'re a journalist (Sora\'s idea). Director Kang\'s office. The confrontation: the protagonist lays out what they know — the real reason isn\'t "creative differences," it\'s personal politics. Kang is amused, then annoyed, then threatened. "You have no idea who you\'re talking to." The protagonist: "I know who Jiwon is. And I know what you\'re doing to him." Kang doesn\'t back down. But someone overhears from the hallway — another NOVA member, or a sympathetic staffer. The seed is planted. End with the protagonist being escorted out, not sure if they changed anything.',
  },
  {
    id: 'ch3-chat-jiwon-label',
    type: 'chat',
    chapter: 3,
    requires: { 'ch3-cp-1': 'face-label' },
    title: 'After the Storm',
    characterId: 'jiwon',
    minExchanges: 4,
    maxExchanges: 10,
    chatImagePrompt: SCENE_PROMPTS.backstageAfter,
  },

  // ── Showcase path ──
  {
    id: 'ch3-beat-3-showcase',
    type: 'beat',
    chapter: 3,
    requires: { 'ch3-cp-1': 'go-to-showcase' },
    title: 'The Last Song',
    shareable: true,
    sceneImagePrompts: [SCENE_PROMPTS.performanceNight, SCENE_PROMPTS.performanceNightAlt],
    arcBrief: 'The showcase. Packed venue. NOVA performs their set — but Jiwon is different tonight. Fiercer. More raw. The other members feel it too. The crowd knows something is happening even if they don\'t know what. For the last song, Jiwon does something unscripted: he stops the choreo, walks to the front of the stage, and sings alone. Acoustic. A song nobody\'s heard before. The protagonist realizes he wrote it recently — the lyrics echo things they\'ve talked about. "I kept looking for you in the hallway." The crowd is silent. The protagonist is standing in the back, tears running. He can\'t see them, but it doesn\'t matter. The song is for them. End with the last note hanging in the air.',
  },
  {
    id: 'ch3-chat-jiwon-showcase',
    type: 'chat',
    chapter: 3,
    requires: { 'ch3-cp-1': 'go-to-showcase' },
    title: 'Backstage',
    characterId: 'jiwon',
    minExchanges: 4,
    maxExchanges: 10,
    chatImagePrompt: SCENE_PROMPTS.backstageAfter,
  },

  // ── Convergence: the resolution ──
  {
    id: 'ch3-beat-4',
    type: 'beat',
    chapter: 3,
    title: 'What Happened Next',
    sceneImagePrompts: [SCENE_PROMPTS.backstageAfter, SCENE_PROMPTS.backstageAfterAlt],
    arcBrief: 'Time skip: one week later. The aftermath. The label backed down — not entirely, but enough. Jiwon stays in NOVA, but under new conditions. If the protagonist faced the label, their confrontation leaked through the staffer and put pressure on Kang. If they went to the showcase, the viral moment of Jiwon\'s solo performance shifted public opinion, making Kang\'s move politically untenable. Either way, the result is the same — Jiwon stays. But things at the academy have changed. Everyone knows about the protagonist and Jiwon now, in whatever way that exists. End with Jiwon texting the protagonist a single message: a rooftop, a time.',
  },

  // ── Final group moment ──
  {
    id: 'ch3-scene-final',
    type: 'scene',
    chapter: 3,
    shareable: true,
    title: 'One Last Night',
    groupChat: true,
    chatImagePrompt: SCENE_PROMPTS.backstageAfter,
    sceneCharacters: [
      { characterId: 'jiwon', minExchanges: 2, maxExchanges: 6, required: true },
      { characterId: 'sora', minExchanges: 2, maxExchanges: 6, required: true },
    ],
    minCharactersTalkedTo: 2,
    arcBrief: 'The three of them together one more time. Convenience store, 2AM, like Chapter 1. But everything is different now. Sora is lighter — she got offered a feature on NOVA\'s next track. Jiwon is exhausted but present, really present. The conversation is easy. Sora makes a joke about the protagonist being Jiwon\'s "secret weapon." Jiwon doesn\'t deny it. The mood is celebratory but bittersweet — they all know this chapter of their lives is closing. Something new is starting.',
  },

  // ── The final choice ──
  {
    id: 'ch3-cp-2',
    type: 'choice',
    chapter: 3,
    choicePointId: 'ch3-cp-2',
    title: 'The Rooftop',
    sceneImagePrompt: SCENE_PROMPTS.rooftopFinal,
    options: [
      {
        id: 'say-everything',
        label: 'Say everything',
        description: 'Three chapters of tension, silence, almost-moments. Say it all. Now.',
        sceneHint: 'brave / definitive / all or nothing',
        consequenceHint: 'Some words can\'t be taken back. These ones shouldn\'t be.',
        imagePrompt: SCENE_PROMPTS.rooftopFinal,
        affinityDelta: { jiwon: 15 },
      },
      {
        id: 'let-go',
        label: 'Let it be what it was',
        description: 'Not every story needs a confession. Some are perfect because they stay unfinished.',
        sceneHint: 'mature / bittersweet / beautiful',
        consequenceHint: 'You\'ll always wonder. But you\'ll always have this.',
        imagePrompt: SCENE_PROMPTS.bittersweet,
        affinityDelta: { jiwon: 5 },
      },
    ],
  },

  // ── Endings ──
  {
    id: 'ch3-ending-say-everything',
    type: 'beat',
    chapter: 3,
    shareable: true,
    requires: { 'ch3-cp-2': 'say-everything' },
    title: 'Sunrise',
    sceneImagePrompts: [SCENE_PROMPTS.rooftopFinal, SCENE_PROMPTS.rooftopFinalAlt],
    arcBrief: 'The rooftop. The same rooftop from Chapter 1, but at sunrise instead of sunset. The protagonist says everything. Not a monologue — the right words, at the right time, earned by everything they\'ve been through. Reference specific moments from the player\'s journey: the elevator, the choice they made, the rain, whatever path they walked. Jiwon listens. Then he smiles — not the idol smile, the real one. "I knew. I think I knew from the elevator." He says something back that\'s equally honest. Not "I love you" — something more specific, more them. The sun comes up over Seoul. They stand together on the rooftop where it all started. End with warmth, earned intimacy, and the feeling that this is just the beginning of something real.',
  },
  {
    id: 'ch3-ending-let-go',
    type: 'beat',
    chapter: 3,
    shareable: true,
    requires: { 'ch3-cp-2': 'let-go' },
    title: 'What We Were',
    sceneImagePrompts: [SCENE_PROMPTS.bittersweet, SCENE_PROMPTS.bittersweetAlt],
    arcBrief: 'The rooftop. They both know why they\'re here. The protagonist chooses not to name it. Instead, they talk about the future: Jiwon\'s next comeback, the protagonist\'s plans, what Sora said about getting a feature. Normal things. Safe things. But underneath every word, the unnamed thing hums. Jiwon walks them to the train platform. A long pause. He hands them something — a USB drive, his earbuds, a folded note. "For the ride home." They board the train. Through the window, Jiwon is still standing on the platform, getting smaller. The protagonist opens whatever he gave them. Inside: the song from the showcase. Track title: the protagonist\'s name. End with the train, the city, and the ache of a story that was perfect because it never quite resolved. Bittersweet. Beautiful. Complete.',
  },

  // ── Reveal ──
  {
    id: 'ch3-reveal',
    type: 'reveal',
    chapter: 3,
    title: 'Your Seoul Transfer',
    sceneImagePrompt: 'Anime style, ethereal dream-like scene, two silhouettes connected by glowing threads of light, abstract Seoul cityscape in background, cosmic purple and pink tones, emotional, beautiful, sunrise',
  },
]
