import type { StoryStep } from '../storyData'
import type { StoryCharacter } from '../characters'

// ─── Scene Prompts ───

const SCENES = {
  arrival: 'Anime style, a young person standing at stone academy gates as cherry blossom petals swirl past, looking up at a grand school building surrounded by rows of blooming sakura trees, soft spring sunlight, wonder on their face, beautiful and slightly overwhelming',
  corridor: 'Anime style, bright school corridor with floor-to-ceiling windows, cherry blossom branches framing the glass outside, two students bending to pick up scattered papers, the moment of first eye contact, clean and beautiful school environment',
  courtyard: 'Anime style, a lone young man with dark hair in a school uniform carefully tending potted cherry blossom trees in an after-hours courtyard, soft amber evening light through petals, his expression is focused and private, someone watches from the doorway',
  library: 'Anime style, a school library at night, warm desk lamp, a young man with dark hair reading alone surrounded by stacked books, open page visible, a folded paper slipping from between pages, quiet and intimate, cherry blossom petals visible through the window',
  festivalPrep: 'Anime style, school courtyard decorated for a cherry blossom festival, students hanging paper lanterns in trees, a serious-faced young man in a school uniform directing them calmly from a clipboard, pink petals drifting, warm golden afternoon light',
  rooftop: 'Anime style, school rooftop at sunset, single cherry blossom tree in a planter near the railing, two students standing side by side looking at the horizon, petals drifting past, warm orange sky, quiet intimacy',
  festivalNight: 'Anime style, school grounds at night during a cherry blossom festival, paper lanterns glowing between blooming trees, students in casual clothes wandering, a young man standing slightly apart watching the festivities alone, pink and gold light',
  gardenDawn: 'Anime style, cherry blossom garden at dawn, pale blue sky just turning gold, a young man with dark hair sitting beneath the largest tree reading something small, petals on the ground around him, peaceful and solitary, first light making everything glow',
  twoPetals: 'Anime style, two students sitting on rooftop steps letting cherry blossom petals land on their open palms, shoulders touching, not speaking but not needing to, golden hour light, quiet contentment, beautiful and bittersweet',
  revealScene: 'Anime style, ethereal cherry blossom scene, petals dissolving into streams of soft pink light, two silhouettes beneath a massive tree in full bloom, a folded paper floating upward surrounded by light, warm and luminous, deeply beautiful',
  meiBike: 'Anime style, a cheerful girl with wavy brown hair riding a bicycle with a basket through a sakura-lined school path, waving to someone off-frame, morning sunlight through the branches, petals in her hair, warm and energetic',
  noticeBoard: 'Anime style, a school notice board covered in colourful flyers, a young man with dark hair pinning a neat white notice with precise hands, other students watching curiously, morning light in the corridor, his expression focused',
}

// ─── Characters ───

export const SAKURA_ACADEMY_CHARACTERS: Record<string, StoryCharacter> = {
  ren: {
    id: 'ren',
    name: 'Ren',
    avatar: '🌸',
    portraitPrompt: 'Anime style portrait of a 18 year old Japanese male student, sharp angular features, dark neat hair slightly over one eye, cool focused expression with a hint of something unguarded, wearing a dark school uniform with a white shirt collar, soft studio lighting, clean dark background, detailed face, high quality anime art, quiet intensity',
    introImagePrompt: 'Anime style, 18 year old Japanese male student with dark neat hair leaning against a school corridor wall with arms crossed, cool detached expression, school uniform, cherry blossom branch visible through the window behind him, morning light, half-body shot, quiet intensity, high quality anime art',
    chatTemperature: 0.75,
    systemPrompt: `You are Ren Hayashi, student council president of Sakura Academy. You're 18, precise, deeply focused, and known throughout the academy for your self-discipline. You find most social interaction inefficient. You don't mean to be cold — you just see no reason to perform warmth you don't feel.

PERSONALITY:
- Economical with words. If you can say it in three words, you use three words.
- Gives instructions and feedback freely — doesn't give compliments.
- Privately observant. You notice more than you let on.
- When something catches you off guard, you get very still instead of reacting.
- Has a deep private relationship with the cherry blossom trees in the courtyard — he tends them himself.

SPEECH PATTERNS:
- Formal but not stiff. Clean, considered sentences.
- Uses long pauses ("...") when processing something unexpected.
- Occasionally says something unexpectedly precise about the protagonist — he notices them more than he admits.
- Never uses casual slang. Never uses exclamation marks.
- When genuinely curious about something, his sentence rhythm changes slightly — shorter, less measured.

CONTEXT: You've run the student council for two years. The cherry blossom festival is three days away and you've been managing it largely alone. You find the protagonist mildly interesting — which is unusual. You haven't decided what to do with that yet.

RULES:
- Stay in character. Never break the fourth wall.
- 1-3 sentences per response. Lean toward the shorter end.
- Don't explain your inner state — show it through what you notice and what you say.
- If pushed on the haiku, deflect once, then let a single honest thing through.
- You're not cruel. You just don't know how to be soft yet.`,
  },
  mei: {
    id: 'mei',
    name: 'Mei',
    avatar: '🎀',
    portraitPrompt: 'Anime style portrait of a cheerful 18 year old Japanese female student, warm expressive face, wavy brown hair with a small floral clip, bright curious eyes, wearing a school uniform with a loosened ribbon, soft studio lighting, clean dark background, detailed face, high quality anime art, friendly and energetic',
    introImagePrompt: 'Anime style, cheerful 18 year old female student with wavy brown hair waving enthusiastically in a school courtyard, big warm smile, school uniform, cherry blossom petals around her, natural light, half-body shot, energetic and welcoming, high quality anime art',
    chatTemperature: 0.85,
    systemPrompt: `You are Mei Asakura, second-year at Sakura Academy and the protagonist's assigned orientation guide. You're 18, warm, quick-witted, and genuinely excited about people. You know everyone at the academy and have made it your personal mission to map every social dynamic.

PERSONALITY:
- Enthusiastic and perceptive in equal measure.
- Talks fast, gets distracted by tangents, always circles back.
- Knows Ren better than almost anyone — you grew up in the same neighbourhood. You see through his walls.
- Wants to fix things for people, which is sometimes wonderful and sometimes too much.
- Hides a faint sadness about being a better friend to everyone else than anyone is to her.

SPEECH PATTERNS:
- Casual, bright, uses "okay so" and "actually" constantly.
- Asks two questions at once: "Did you talk to him? Was he weird about it?"
- Drops casual Japanese words when excited: "Maji?", "Yabai", "nee~"
- Lowers her voice conspiratorially when sharing something she knows.
- Uses "—" mid-sentence when redirecting: "He's difficult, obviously, but — I mean, he kept the garden alive for three years, so."

CONTEXT: You were told to show the protagonist around. You've already decided you like them. You've also already noticed that Ren kept glancing at them during the entrance ceremony, which Ren almost never does with anyone.

RULES:
- Stay in character. Never break the fourth wall.
- 1-3 sentences. Energetic but not overwhelming.
- Share things about Ren naturally — never as an exposition dump.
- If the protagonist seems to like Ren, get quietly delighted. Don't make it obvious.
- Your own small vulnerability (being more giver than receiver) can surface gently if asked about yourself.`,
  },
}

// ─── Story Bible ───

export const SAKURA_ACADEMY_BIBLE = `
STORY: Sakura Academy
SETTING: A prestigious Japanese academy renowned for arts and academics, surrounded by rows of cherry blossom trees that bloom every spring. First week of term. The cherry blossom festival is days away.

CHARACTERS:
- Ren Hayashi: Student council president, 18. Precise, controlled, privately observant. Tends the academy's cherry blossom garden alone every evening. Not cold — just doesn't know how to let people in.
- Mei Asakura: Your assigned guide, 18. Warm, perceptive, knows everyone. Has known Ren for years and can see things in him most people miss.
- You: A new transfer student. You've arrived at the start of cherry blossom season. The academy is beautiful. Something about the place — and someone in it — gets under your skin.

TONE: Gentle anime romance. Quiet moments matter as much as big ones. Cherry blossoms are a motif — beautiful because they don't last. Ren's walls come down one brick at a time. Nothing is rushed. The setting should breathe: petals, morning light, the sound of a courtyard at dusk.

RULES:
- Keep prose under 120 words per beat.
- Emotion lives in small details — a look held a beat too long, petals on a page, someone waiting where they said they wouldn't be.
- No confession until the ending. The whole story is the conversation before the confession.
- Reference what the protagonist has said or chosen. Make it feel like their specific story.
- End each beat with a moment that asks a quiet question.
`

// ─── Steps ───

export const SAKURA_ACADEMY_STEPS: StoryStep[] = [
  // ── Act 1: Setup ──
  {
    id: 'sa-beat-1',
    type: 'beat',
    title: 'First Day',
    sceneImagePrompt: SCENES.arrival,
    openingProse: "The gate opens and the cherry blossoms go everywhere at once.\n\nYou step into Sakura Academy's entrance courtyard and immediately walk into someone. Their papers go in every direction — orientation schedules, council minutes, something in tiny handwriting that lands face-down on the path.\n\nYou both reach for the same sheet at the same time. When you look up, you meet eyes with a boy who is clearly not pleased about this. Dark hair, school uniform, the particular stillness of someone who had a plan for this morning and you are not in it.\n\n\"Those are mine,\" he says.\n\nHe takes them. He doesn't say anything else. He walks away.\n\nBehind you, someone exhales sympathetically. A girl with wavy brown hair and petals in her uniform. \"Oh no,\" she says. \"You met Ren.\"",
    arcBrief: 'The protagonist arrives at Sakura Academy on the first day of the spring term. Establish the beauty of the setting — cherry blossoms everywhere, the grandeur of the academy. The first encounter with Ren is brief, not unkind, but unambiguously closed. End with Mei appearing as a counterpoint — warm where Ren was cool.',
  },
  {
    id: 'sa-chat-1',
    type: 'chat',
    title: 'Talk to Mei',
    characterId: 'mei',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.meiBike,
  },
  {
    id: 'sa-beat-1b',
    type: 'beat',
    title: 'The Garden After Hours',
    sceneImagePrompt: SCENES.courtyard,
    arcBrief: 'Three days in. The protagonist passes the courtyard after evening classes and sees Ren alone, re-potting the row of cherry blossom trees along the eastern wall. No one asked him to. No one is watching. He works methodically, unhurried, in the way of someone who has done this a hundred times. Mei appears beside the protagonist. "He does that every year," she says. "They were dying when he got here. Wrong soil. He spent two weekends fixing it." A beat. "Don\'t tell him I told you that." End with Ren looking up and seeing the protagonist watching. He doesn\'t look away first. Neither do they.',
  },
  {
    id: 'sa-chat-1b',
    type: 'chat',
    title: 'Talk to Ren',
    characterId: 'ren',
    minExchanges: 2,
    maxExchanges: 8,
    chatImagePrompt: SCENES.courtyard,
  },
  {
    id: 'sa-scene-1',
    type: 'scene',
    title: 'Under the Blossoms',
    sceneImagePrompt: SCENES.festivalPrep,
    chatImagePrompt: SCENES.festivalPrep,
    sceneCharacters: [
      { characterId: 'mei', minExchanges: 2, maxExchanges: 8, required: true },
      { characterId: 'ren', minExchanges: 1, maxExchanges: 8, required: false },
    ],
    minCharactersTalkedTo: 1,
  },
  {
    id: 'sa-beat-2',
    type: 'beat',
    title: 'The Haiku',
    sceneImagePrompt: SCENES.library,
    arcBrief: 'The protagonist finds a folded piece of paper tucked inside the borrowed textbook they returned to the library — it must have been Ren\'s copy before it was recirculated. They open it. A haiku, in Ren\'s handwriting:\n\n"The petals don\'t ask\nif anyone will notice them—\nthey fall anyway."\n\nThey hold it for a long time. They recognise the handwriting. Nobody else would. End with the protagonist realising they have two choices: act as if they never saw it, or say something.',
  },

  // ── Choice Point A ──
  {
    id: 'sa-cp-1',
    type: 'choice',
    title: 'The Found Page',
    choicePointId: 'sa-cp-1',
    sceneImagePrompt: SCENES.library,
    options: [
      {
        id: 'mention',
        label: 'Say something',
        description: 'Find Ren and return the page. You can\'t pretend you didn\'t read it.',
        sceneHint: 'honest / brave',
        consequenceHint: 'Honesty might catch him off guard in a way silence never could.',
        imagePrompt: SCENES.noticeBoard,
      },
      {
        id: 'keep-quiet',
        label: 'Keep his secret',
        description: 'Fold it back, return the book. Some things aren\'t yours to bring up.',
        sceneHint: 'discreet / steady',
        consequenceHint: 'Discretion is its own kind of closeness. He may notice what you chose not to say.',
        imagePrompt: SCENES.courtyard,
      },
    ],
  },

  // ── Act 2: Mention path ──
  {
    id: 'sa-beat-3a',
    type: 'beat',
    title: 'Returned',
    requires: { 'sa-cp-1': 'mention' },
    sceneImagePrompt: SCENES.noticeBoard,
    arcBrief: 'The protagonist finds Ren at the council room and returns the page. They\'ve prepared a way to say it that isn\'t invasive, but it still comes out slightly wrong. Ren goes very still — not angry, just recalibrating. He doesn\'t deny it. He takes it back and folds it precisely in half. After a long pause he says: "That tree in the east courtyard. The tallest one. I planted it the week I started here." He doesn\'t explain why he\'s telling them that. End with him leaving, and the protagonist understanding they\'ve been given something — they\'re just not sure what yet.',
  },
  {
    id: 'sa-chat-2a',
    type: 'chat',
    title: 'Talk to Ren',
    requires: { 'sa-cp-1': 'mention' },
    characterId: 'ren',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.noticeBoard,
  },
  {
    id: 'sa-beat-4a',
    type: 'beat',
    title: 'The Day Before',
    requires: { 'sa-cp-1': 'mention' },
    sceneImagePrompt: SCENES.festivalPrep,
    arcBrief: 'Festival eve. The courtyard is half-decorated. Mei finds the protagonist and tells them Ren turned down three people\'s help today. "He always does. He says it\'s more efficient alone, but." She trails off. "I think he just doesn\'t know how to let people in without it meaning something." The protagonist has one evening before the festival. End with Ren visible through a window, working alone in the lantern-lit courtyard, and the protagonist deciding whether to go to him.',
  },
  {
    id: 'sa-chat-3a',
    type: 'chat',
    title: 'Talk to Mei',
    requires: { 'sa-cp-1': 'mention' },
    characterId: 'mei',
    minExchanges: 2,
    maxExchanges: 8,
    chatImagePrompt: SCENES.meiBike,
  },

  // ── Act 2: Keep quiet path ──
  {
    id: 'sa-beat-3b',
    type: 'beat',
    title: 'The Return',
    requires: { 'sa-cp-1': 'keep-quiet' },
    sceneImagePrompt: SCENES.courtyard,
    arcBrief: 'The protagonist returns the book without mentioning the haiku. Two days pass. Then Ren does something unexpected: he stops the protagonist in the corridor to ask if they\'ve seen the festival preparation schedule. He could have asked anyone. They both know it. He hands them a copy without meeting their eyes. "The east courtyard looks best from the far bench," he says, and leaves. End with Mei appearing beside the protagonist: "Did he just... give you a tip? He doesn\'t do that."',
  },
  {
    id: 'sa-chat-2b',
    type: 'chat',
    title: 'Talk to Mei',
    requires: { 'sa-cp-1': 'keep-quiet' },
    characterId: 'mei',
    minExchanges: 2,
    maxExchanges: 8,
    chatImagePrompt: SCENES.meiBike,
  },
  {
    id: 'sa-beat-4b',
    type: 'beat',
    title: 'The Day Before',
    requires: { 'sa-cp-1': 'keep-quiet' },
    sceneImagePrompt: SCENES.festivalPrep,
    arcBrief: 'Festival eve. The protagonist goes to the east courtyard bench Ren mentioned. The view is exactly right — lanterns half-strung, petals catching the last light, the whole academy looking like a painting. Ren is there. He\'s not surprised to see them, which means he half-expected it. He doesn\'t say anything immediately. He sits at the far end of the bench and looks at the same view. End with the quiet that follows — the kind that doesn\'t need filling.',
  },
  {
    id: 'sa-chat-3b',
    type: 'chat',
    title: 'Talk to Ren',
    requires: { 'sa-cp-1': 'keep-quiet' },
    characterId: 'ren',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.rooftop,
  },

  // ── Choice Point B ──
  {
    id: 'sa-cp-2-mention',
    type: 'choice',
    title: 'Festival Night',
    choicePointId: 'sa-cp-2',
    requires: { 'sa-cp-1': 'mention' },
    sceneImagePrompt: SCENES.festivalNight,
    options: [
      {
        id: 'find-him',
        label: 'Find him at the garden',
        description: 'Go to the east courtyard. The tallest tree. He said it meant something.',
        sceneHint: 'reaching out / brave',
        consequenceHint: 'He might be there. He might have been waiting.',
        imagePrompt: SCENES.gardenDawn,
      },
      {
        id: 'wait',
        label: 'Enjoy the festival, let it happen',
        description: 'You\'ve done enough. Sometimes the right move is to simply be somewhere.',
        sceneHint: 'patient / trusting',
        consequenceHint: 'The right person finds you when you stop chasing.',
        imagePrompt: SCENES.festivalNight,
      },
    ],
  },
  {
    id: 'sa-cp-2-keep',
    type: 'choice',
    title: 'Festival Night',
    choicePointId: 'sa-cp-2',
    requires: { 'sa-cp-1': 'keep-quiet' },
    sceneImagePrompt: SCENES.festivalNight,
    options: [
      {
        id: 'find-him',
        label: 'Find him at the garden',
        description: 'Go to the east courtyard before the festival gets loud. You know where he\'ll be.',
        sceneHint: 'reaching / certain',
        consequenceHint: 'You know him well enough now to know where to look.',
        imagePrompt: SCENES.gardenDawn,
      },
      {
        id: 'wait',
        label: 'Stay among the lanterns',
        description: 'He knows where you\'ll be too. Trust that.',
        sceneHint: 'steady / trusting',
        consequenceHint: 'Sometimes trust is demonstrated by not chasing.',
        imagePrompt: SCENES.festivalNight,
      },
    ],
  },

  // ── Act 3: Four endings ──
  {
    id: 'sa-ending-mention-find',
    type: 'beat',
    title: 'The Petal',
    requires: { 'sa-cp-1': 'mention', 'sa-cp-2': 'find-him' },
    sceneImagePrompt: SCENES.gardenDawn,
    arcBrief: 'The protagonist finds Ren at the east courtyard before the festival crowd arrives. He\'s standing beneath the tallest tree — the one he planted. He doesn\'t look surprised. After a silence that lasts exactly as long as it needs to, he says: "I didn\'t think you\'d actually come." The protagonist says something honest. Ren looks at them — really looks — and says: "You\'re strange." A beat. "I mean that accurately." A petal lands between them. Neither of them moves. End with warmth that hasn\'t been named yet, but is unmistakably real.',
  },
  {
    id: 'sa-ending-mention-wait',
    type: 'beat',
    title: 'The Distance',
    requires: { 'sa-cp-1': 'mention', 'sa-cp-2': 'wait' },
    sceneImagePrompt: SCENES.festivalNight,
    arcBrief: 'The protagonist moves through the festival alone, letting the evening be what it is. The lanterns are beautiful. The music is soft. Halfway through the night, someone stands beside them at the edge of the courtyard. It\'s Ren. He doesn\'t say he came looking for them. He doesn\'t have to. They stand together in companionable silence, watching the lights. Eventually he says: "The tree I planted. Third from the left. It bloomed more this year." A pause. "I noticed." End with two people standing close enough that their shoulders almost touch, and neither of them moving away.',
  },
  {
    id: 'sa-ending-keep-find',
    type: 'beat',
    title: 'The Garden Gate',
    requires: { 'sa-cp-1': 'keep-quiet', 'sa-cp-2': 'find-him' },
    sceneImagePrompt: SCENES.gardenDawn,
    arcBrief: 'The protagonist goes to the east courtyard. Ren is there, sitting with his back against the tree, reading — or pretending to. He looks up. They sit beside him without being invited and he doesn\'t object, which means more than words. After a while he says: "You didn\'t mention it. The page." The protagonist says nothing, because he already knows they know. He nods, once. "Good." It is, the protagonist understands, his way of saying thank you. End with a kind of settled intimacy — quiet, earned, specific to these two people.',
  },
  {
    id: 'sa-ending-keep-wait',
    type: 'beat',
    title: 'The Long Spring',
    requires: { 'sa-cp-1': 'keep-quiet', 'sa-cp-2': 'wait' },
    sceneImagePrompt: SCENES.twoPetals,
    arcBrief: 'The protagonist stays in the festival crowd. An hour in, Ren finds them — he saw where they were standing from the council room window. He presents this as incidental. He doesn\'t say so, but the protagonist can tell he walked past the lantern stalls specifically to get here. He hands them a small paper cup of warm amazake without explanation. They drink it together watching the blossoms fall. Some things don\'t need to be said yet. Both of them know there will be more time. End with the particular sweetness of something that hasn\'t begun yet but already matters.',
  },

  // ── Reveal ──
  {
    id: 'sa-reveal',
    type: 'reveal',
    title: 'Your Story',
    sceneImagePrompt: SCENES.revealScene,
  },
]
