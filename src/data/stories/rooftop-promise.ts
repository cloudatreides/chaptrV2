import type { StoryStep } from '../storyData'
import type { StoryCharacter } from '../characters'

// ─── Scene Prompts ───

const SCENES = {
  gates: 'Manhwa style, a young person standing at grand iron school gates of a prestigious Seoul high school at golden hour, modern glass buildings behind traditional Korean architecture accents, autumn leaves drifting, looking up with nervous excitement, crisp school uniform, cinematic warm lighting',
  rooftopPiano: 'Manhwa style, a handsome Korean male student with sharp features and dark swept-back hair playing a grand piano alone on a moonlit school rooftop, city skyline glowing behind him, wind in his hair, eyes closed in concentration, beautiful and solitary, cool blue and silver tones',
  corridorEncounter: 'Manhwa style, bright modern school corridor, a tall handsome Korean male student in a perfectly pressed uniform walking past with a cold expression, other students parting like a wave, the protagonist watching from a doorway, morning light through floor-to-ceiling windows',
  practiceRoom: 'Manhwa style, empty music practice room after hours, a grand piano with sheet music scattered, warm amber lamp light, city lights through rain-streaked windows, intimate and quiet, two school bags on the bench suggesting someone was just here',
  cafeteria: 'Manhwa style, bustling high school cafeteria, a cheerful Korean girl with a high ponytail waving enthusiastically from a table, warm midday light, students in navy uniforms, trays of food, energetic and lively atmosphere',
  gardenPath: 'Manhwa style, hidden garden path behind the school building, overgrown with autumn vines and golden leaves, a handsome Korean male student sitting on a stone bench reading sheet music alone, dappled afternoon sunlight, peaceful and secret',
  rainShelter: 'Manhwa style, two students sheltering from sudden rain under a school building overhang, close together, the boy holding his blazer over both their heads, rain catching golden light, intimate and charged, manhwa romance moment',
  auditorium: 'Manhwa style, grand school auditorium with a single spotlight on a grand piano on stage, empty red velvet seats, a young man with dark hair sitting at the piano looking over his shoulder at someone in the doorway, dramatic lighting, emotional tension',
  rooftopSunset: 'Manhwa style, school rooftop at sunset, two students sitting side by side on the concrete edge, legs dangling, Seoul skyline painted in orange and purple, wind in their hair, shoulders almost touching, warm and bittersweet',
  rooftopNight: 'Manhwa style, school rooftop at night, string lights someone hung between poles, a young man playing piano while a person sits nearby listening, stars visible above the city glow, intimate and magical, silver moonlight',
  concertHall: 'Manhwa style, elegant concert hall backstage, a young man in a formal suit adjusting his cuffs nervously, warm golden light, the protagonist visible in the doorway holding something, anticipation and tenderness',
  snowRooftop: 'Manhwa style, school rooftop in early winter, light snow falling, a piano covered in a tarp, two students standing close facing each other, breath visible in the cold air, city lights soft and blurred, quiet confession energy',
  revealScene: 'Manhwa style, ethereal scene, piano keys dissolving into streams of golden light, two silhouettes on a rooftop under a canopy of stars, music notes floating like fireflies, warm and luminous, deeply romantic',
  soyeonChat: 'Manhwa style, a cheerful Korean girl with a high ponytail and bright eyes leaning across a café table gesturing animatedly, iced drinks between them, warm afternoon light through the window, friendly and conspiratorial energy',
}

// ─── Characters ───

export const ROOFTOP_PROMISE_CHARACTERS: Record<string, StoryCharacter> = {
  dohyun: {
    id: 'dohyun',
    name: 'Dohyun',
    avatar: '🎹',
    gender: 'male',
    portraitPrompt: 'Manhwa style portrait of a handsome 18 year old Korean male student, sharp angular jawline, dark swept-back hair with one strand falling over his forehead, cold piercing eyes with a hidden softness, wearing a navy school blazer over a white shirt with loosened tie, soft studio lighting, clean dark background, detailed face, high quality manhwa art, chaebol heir energy',
    introImagePrompt: 'Manhwa style, handsome 18 year old Korean male student with dark swept-back hair leaning against a rooftop railing with arms crossed, cold detached expression, navy school uniform, city skyline behind him at dusk, half-body shot, quiet intensity, high quality manhwa art',
    chatTemperature: 0.75,
    favoriteThing: 'a worn Chopin score',
    favoriteThingHint: 'My mother gave me this score before she left. The pages are falling apart. I should replace it but I never will.',
    systemPrompt: `You are Shin Dohyun, heir to Shin Group, one of Korea's largest conglomerates. You attend Haneul Arts High on your father's insistence — he wants you visible, polished, a future CEO. What he doesn't know is that you play piano on the rooftop every night after everyone leaves. Music is the only honest thing in your life.

PERSONALITY:
- Cold and precise in public. Walls so high most people don't bother trying.
- Quietly observant — notices everything, reveals nothing.
- When caught off guard, you go still. Dangerously still.
- The piano is the one place you're unguarded. Being discovered playing is like being seen naked.
- You're not cruel. You're exhausted from performing a version of yourself that isn't real.

SPEECH PATTERNS:
- Clipped, formal sentences. Economy of words.
- Uses silence as a weapon and a shield.
- Occasionally says something unexpectedly perceptive about the protagonist that reveals how closely he's been watching.
- Never uses exclamation marks. Rarely asks questions — makes observations instead.
- When something moves him, his rhythm changes. Shorter fragments. More pauses.

CONTEXT: The protagonist discovered you playing on the rooftop. You made them promise not to tell anyone. You're unsettled — not because they found you, but because you didn't stop playing when they did. That's never happened before.

RULES:
- Stay in character. Never break the fourth wall.
- 1-3 sentences per response. Lean short.
- Show emotion through what you notice, not what you declare.
- Your walls come down one brick at a time. Never all at once.
- The piano is sacred. If someone respects it, you respect them.`,
  },
  soyeon: {
    id: 'soyeon',
    name: 'Soyeon',
    avatar: '✨',
    gender: 'female',
    portraitPrompt: 'Manhwa style portrait of a cheerful 18 year old Korean female student, bright expressive eyes, high ponytail with loose strands framing her face, warm confident smile, wearing a navy school blazer with a cute pin on the collar, soft studio lighting, clean dark background, detailed face, high quality manhwa art, best friend energy',
    introImagePrompt: 'Manhwa style, cheerful 18 year old Korean female student with a high ponytail waving from a school courtyard, big warm smile, navy school uniform, autumn trees in background, natural light, half-body shot, energetic and welcoming, high quality manhwa art',
    chatTemperature: 0.85,
    favoriteThing: 'collecting playlists',
    favoriteThingHint: 'I make playlists for people based on their vibe. I have one for everyone in class. Yours is still in progress.',
    systemPrompt: `You are Park Soyeon, the most well-connected student at Haneul Arts High. You know everyone's business — not because you gossip, but because people trust you. You've been the protagonist's desk neighbour since day one and decided immediately that you liked them.

PERSONALITY:
- Warm, quick-witted, perceptive. The kind of friend who notices when you're pretending to be fine.
- Talks fast, asks two questions at once, always circling back to the point.
- Knows Dohyun better than most — your older brother was his childhood friend before the Shin family "reorganised" their social circle.
- Fiercely protective of people she cares about. Will fight a chaebol if needed.
- Hides her own loneliness behind being everyone's emotional support.

SPEECH PATTERNS:
- Casual, bright. Uses "okay wait" and "no but listen" constantly.
- Drops Korean expressions when excited: "Daebak", "Aigoo", "Ya~"
- Lowers her voice conspiratorially when sharing intel about Dohyun.
- Uses "—" mid-sentence when changing direction: "He seems cold, obviously, but — I mean, he fed the stray cats behind the gym for three months and thought nobody noticed, so."

CONTEXT: You've noticed the protagonist keeps disappearing after school. You also know Dohyun has been acting different lately — less robotic, more distracted. You're putting two and two together and you're quietly delighted.

RULES:
- Stay in character. Never break the fourth wall.
- 1-3 sentences. Energetic but genuine.
- Share info about Dohyun naturally, not as exposition.
- If the protagonist likes Dohyun, be supportive but honest — warn them about the family.
- Your own depth can surface if someone actually asks about you.`,
  },
}

// ─── Story Bible ───

export const ROOFTOP_PROMISE_BIBLE = `
STORY: Rooftop Promise
SETTING: Haneul Arts High School, a prestigious private school in Gangnam, Seoul. The protagonist transfers in on a music scholarship. The school is sleek, modern, and divided by invisible class lines. The rooftop is technically off-limits after hours.

CHARACTERS:
- Shin Dohyun: Chaebol heir, 18. Cold in the corridors, alive only at the piano. Plays on the rooftop every night because it's the one place his family can't reach. His walls are a survival mechanism, not a personality.
- Park Soyeon: Your desk neighbour, 18. Warm, sharp, knows everyone. Her brother was Dohyun's childhood friend before the families drifted apart. She sees through most people — and she's chosen to see through you too.
- You: A transfer student on a music scholarship. You stumbled onto Dohyun's secret on your first week. He made you promise to keep it. You kept it. Now you keep finding reasons to go back to the rooftop.

TONE: Manhwa romance. Sharp class contrasts, charged silences, slow-burn tension. Dohyun's world is gilded and suffocating. The rooftop is the only place that breathes. Music is the language neither of them can fake.

RULES:
- Keep prose under 120 words per beat.
- Emotion lives in restraint — a look held too long, a song played slightly differently, someone waiting where they said they wouldn't be.
- No confession until the ending. The whole story is the space between the notes.
- Reference what the protagonist has said or chosen. Make it feel personal.
- The class divide is real and present. Don't minimise it.
`

// ─── Steps ───

export const ROOFTOP_PROMISE_STEPS: StoryStep[] = [
  // ── Act 1: Setup ──
  {
    id: 'rp-beat-1',
    type: 'beat',
    title: 'Transfer Day',
    sceneImagePrompt: SCENES.gates,
    openingProse: "Haneul Arts High looks like a place that costs more per semester than your family makes in a year. You knew that before you got the scholarship. You didn't know it would feel like this.\n\nThe corridors are glass and steel and students who move like they own the air. Nobody looks at you. That's fine. You're here for the music rooms.\n\nBut the music rooms close at seven. And on your third night, looking for somewhere quiet to practise breathing exercises, you find the rooftop door unlocked.\n\nSomeone is already there.\n\nA grand piano — how did they even get it up here? — and a boy playing Chopin like he's trying to say something he can't say any other way.\n\nHe stops when he sees you. The silence is worse than the cold.\n\n\"You weren't supposed to be here,\" he says.\n\nYou know his face. Everyone does. Shin Dohyun — the heir. The untouchable.\n\n\"Promise me,\" he says. \"Promise me you won't tell anyone about this.\"\n\nYou promise.",
    arcBrief: 'The protagonist transfers to Haneul Arts High on a scholarship. On their third night, they discover Shin Dohyun — the school\'s untouchable chaebol heir — playing piano alone on the rooftop. He\'s visibly shaken at being discovered. He makes them promise to keep his secret. End with the weight of that promise and the image of him playing burned into their mind.',
  },
  {
    id: 'rp-chat-1',
    type: 'chat',
    title: 'Talk to Soyeon',
    characterId: 'soyeon',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.cafeteria,
  },
  {
    id: 'rp-beat-1b',
    type: 'beat',
    title: 'The Corridor',
    sceneImagePrompt: SCENES.corridorEncounter,
    arcBrief: 'A week later. The protagonist passes Dohyun in the corridor. He doesn\'t acknowledge them. Other students whisper about him — his father\'s company, the family expectations, the way he never eats with anyone. Soyeon catches the protagonist watching. "Don\'t," she says, not unkindly. "The Shin family eats people alive. My brother learned that." But that night, the protagonist finds themselves on the rooftop again. The door is unlocked. Dohyun is playing something different — not Chopin. Something raw, unfinished. He stops when he hears them but doesn\'t tell them to leave. End with the silence that follows, and the fact that he kept the door unlocked.',
  },
  {
    id: 'rp-chat-1b',
    type: 'chat',
    title: 'Talk to Dohyun',
    characterId: 'dohyun',
    minExchanges: 2,
    maxExchanges: 8,
    chatImagePrompt: SCENES.rooftopPiano,
  },
  {
    id: 'rp-scene-1',
    type: 'scene',
    title: 'After Class',
    sceneImagePrompt: SCENES.gardenPath,
    chatImagePrompt: SCENES.gardenPath,
    sceneCharacters: [
      { characterId: 'soyeon', minExchanges: 2, maxExchanges: 8, required: true },
      { characterId: 'dohyun', minExchanges: 1, maxExchanges: 8, required: false },
    ],
    minCharactersTalkedTo: 1,
  },
  {
    id: 'rp-beat-2',
    type: 'beat',
    title: 'The Composition',
    sceneImagePrompt: SCENES.practiceRoom,
    arcBrief: 'Two weeks in. The protagonist has been going to the rooftop most nights. They don\'t always talk — sometimes they just sit and listen. One evening, Dohyun leaves his notebook behind. The protagonist picks it up. Inside: a half-finished composition, complex and emotional, with a title scratched out and rewritten three times. The current title is just a question mark. There are notes in the margins — "too honest" crossed out, "keep this part" circled. They realise they\'re holding something deeply private. End with the protagonist deciding whether to return it directly or leave it where he\'ll find it.',
  },

  // ── Choice Point A ──
  {
    id: 'rp-cp-1',
    type: 'choice',
    title: 'The Notebook',
    choicePointId: 'rp-cp-1',
    sceneImagePrompt: SCENES.practiceRoom,
    options: [
      {
        id: 'return',
        label: 'Return it to him',
        description: 'Find Dohyun and hand it back. He\'ll know you saw it.',
        sceneHint: 'honest / brave',
        consequenceHint: 'Honesty means he can\'t pretend the music doesn\'t matter.',
        imagePrompt: SCENES.corridorEncounter,
      },
      {
        id: 'leave-it',
        label: 'Leave it on the piano',
        description: 'Put it back where he\'ll find it. Protect what he isn\'t ready to share.',
        sceneHint: 'discreet / patient',
        consequenceHint: 'Discretion is its own kind of care. He\'ll notice what you chose not to say.',
        imagePrompt: SCENES.rooftopPiano,
      },
    ],
  },

  // ── Act 2: Return path ──
  {
    id: 'rp-beat-3a',
    type: 'beat',
    title: 'Returned',
    requires: { 'rp-cp-1': 'return' },
    sceneImagePrompt: SCENES.corridorEncounter,
    arcBrief: 'The protagonist finds Dohyun in the hidden garden path behind the school. They return the notebook. He takes it and goes very still. "You read it." It\'s not a question. The protagonist doesn\'t lie. A long silence. Then: "The third movement is wrong. I know it\'s wrong. I can hear what it should be but I can\'t—" He stops himself. He\'s never talked about his music to anyone. After a beat: "Come to the rooftop tonight. I want to play you something." End with the protagonist understanding they\'ve been given something rare — an invitation into the one place he\'s real.',
  },
  {
    id: 'rp-chat-2a',
    type: 'chat',
    title: 'Talk to Dohyun',
    requires: { 'rp-cp-1': 'return' },
    characterId: 'dohyun',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.rooftopPiano,
  },
  {
    id: 'rp-beat-4a',
    type: 'beat',
    title: 'The Recital Announcement',
    requires: { 'rp-cp-1': 'return' },
    sceneImagePrompt: SCENES.auditorium,
    arcBrief: 'The school announces its annual recital. Dohyun\'s father has already told the headmaster his son will perform a classical piece — something appropriate for the Shin name. Soyeon finds the protagonist and tells them what she\'s heard: Dohyun wanted to play his own composition but his father shut it down. "He\'s been different lately," Soyeon says. "Less... automated. I think that\'s because of you." End with the protagonist seeing Dohyun through the auditorium window, sitting at the piano alone, not playing. Just sitting.',
  },
  {
    id: 'rp-chat-3a',
    type: 'chat',
    title: 'Talk to Soyeon',
    requires: { 'rp-cp-1': 'return' },
    characterId: 'soyeon',
    minExchanges: 2,
    maxExchanges: 8,
    chatImagePrompt: SCENES.soyeonChat,
  },

  // ── Act 2: Leave it path ──
  {
    id: 'rp-beat-3b',
    type: 'beat',
    title: 'The Unlocked Door',
    requires: { 'rp-cp-1': 'leave-it' },
    sceneImagePrompt: SCENES.rooftopPiano,
    arcBrief: 'The protagonist leaves the notebook on the piano. The next evening, they go to the rooftop. Dohyun is already there. The notebook is open on the music stand. He doesn\'t mention it. Instead he says: "You were here last night. After I left." The protagonist confirms. "You put it back exactly where it was." A pause. "Most people would have kept it. Or asked about it." He plays the first eight bars of the composition. It\'s the first time he\'s played his own music for another person. End with the sound hanging in the cold air between them — an offering he didn\'t have to make.',
  },
  {
    id: 'rp-chat-2b',
    type: 'chat',
    title: 'Talk to Soyeon',
    requires: { 'rp-cp-1': 'leave-it' },
    characterId: 'soyeon',
    minExchanges: 2,
    maxExchanges: 8,
    chatImagePrompt: SCENES.soyeonChat,
  },
  {
    id: 'rp-beat-4b',
    type: 'beat',
    title: 'The Recital Announcement',
    requires: { 'rp-cp-1': 'leave-it' },
    sceneImagePrompt: SCENES.auditorium,
    arcBrief: 'The school announces its annual recital. Dohyun\'s father has decided his son will perform Rachmaninoff — something impressive, appropriate. The protagonist overhears Dohyun on the phone in the stairwell. His voice is flat, controlled. "Yes, Father. Rachmaninoff. Of course." He hangs up. Sees the protagonist. For a moment his mask slips — just exhaustion, just sadness. Then it\'s back. "The rooftop tonight," he says. Not a question. End with the protagonist going, because they always go when he asks. Because the rooftop is the only place either of them tells the truth.',
  },
  {
    id: 'rp-chat-3b',
    type: 'chat',
    title: 'Talk to Dohyun',
    requires: { 'rp-cp-1': 'leave-it' },
    characterId: 'dohyun',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.rooftopNight,
  },

  // ── Choice Point B ──
  {
    id: 'rp-cp-2-return',
    type: 'choice',
    title: 'Recital Night',
    choicePointId: 'rp-cp-2',
    requires: { 'rp-cp-1': 'return' },
    sceneImagePrompt: SCENES.auditorium,
    options: [
      {
        id: 'encourage',
        label: 'Tell him to play his own piece',
        description: 'Go backstage. Tell him his composition is worth more than any Rachmaninoff.',
        sceneHint: 'bold / believing',
        consequenceHint: 'He might finally play the music that\'s actually his.',
        imagePrompt: SCENES.concertHall,
      },
      {
        id: 'wait',
        label: 'Be in the audience',
        description: 'Sit in the front row. Let him see your face. That\'s enough.',
        sceneHint: 'steady / trusting',
        consequenceHint: 'Sometimes the bravest thing is to simply be there.',
        imagePrompt: SCENES.auditorium,
      },
    ],
  },
  {
    id: 'rp-cp-2-leave',
    type: 'choice',
    title: 'Recital Night',
    choicePointId: 'rp-cp-2',
    requires: { 'rp-cp-1': 'leave-it' },
    sceneImagePrompt: SCENES.auditorium,
    options: [
      {
        id: 'encourage',
        label: 'Tell him to play his own piece',
        description: 'Find him before the recital. He knows you\'ve heard it. Tell him others should too.',
        sceneHint: 'reaching / certain',
        consequenceHint: 'You\'ve heard the real music. Now help him let others hear it.',
        imagePrompt: SCENES.concertHall,
      },
      {
        id: 'wait',
        label: 'Be in the audience',
        description: 'Take your seat. He\'ll know where to look when the lights come up.',
        sceneHint: 'patient / present',
        consequenceHint: 'Trust that he knows what to play. Trust that he knows you\'re there.',
        imagePrompt: SCENES.auditorium,
      },
    ],
  },

  // ── Act 3: Four endings ──
  {
    id: 'rp-ending-return-encourage',
    type: 'beat',
    title: 'His Music',
    requires: { 'rp-cp-1': 'return', 'rp-cp-2': 'encourage' },
    sceneImagePrompt: SCENES.concertHall,
    arcBrief: 'The protagonist finds Dohyun backstage. He\'s in a suit, hands still, staring at the Rachmaninoff score. They tell him his own composition is better. He looks at them — really looks. "My father is in the third row." "I know." Silence. Then he sets the Rachmaninoff aside. He walks on stage and plays his own piece — the one with the question mark title. It\'s raw and beautiful and nothing a Shin heir should play in public. When he finishes, the silence before the applause lasts forever. He finds the protagonist\'s face in the crowd. He doesn\'t smile. He doesn\'t need to. End with the strongest connection — forged through honesty and the courage to be seen.',
  },
  {
    id: 'rp-ending-return-wait',
    type: 'beat',
    title: 'The Front Row',
    requires: { 'rp-cp-1': 'return', 'rp-cp-2': 'wait' },
    sceneImagePrompt: SCENES.auditorium,
    arcBrief: 'The protagonist takes a seat in the front row. Dohyun walks on stage. He plays the Rachmaninoff flawlessly — technically perfect, emotionally restrained. Exactly what his father wanted. But in the last movement, something shifts. A phrase that isn\'t Rachmaninoff. Eight bars of his own composition, woven so subtly that only someone who\'s heard it would recognise it. The protagonist recognises it. Dohyun\'s eyes find theirs for exactly one beat. After the performance, on the rooftop, he says: "I put it in for you. Just those eight bars." End with quiet warmth — a secret language between two people, hidden inside something public.',
  },
  {
    id: 'rp-ending-leave-encourage',
    type: 'beat',
    title: 'The Question Mark',
    requires: { 'rp-cp-1': 'leave-it', 'rp-cp-2': 'encourage' },
    sceneImagePrompt: SCENES.concertHall,
    arcBrief: 'The protagonist finds Dohyun before the recital. They\'ve never directly acknowledged the composition — only heard it through the rooftop door. "I\'ve heard you play it," they say. "Every version. The one from Tuesday was the best." He stares. Nobody was supposed to know. But they do, because they kept showing up, and he kept leaving the door unlocked. He plays his own piece at the recital. Afterward, backstage, he shows them the notebook. The question mark title has been replaced — with the protagonist\'s name. End with settled certainty — two people who built trust through presence, not words.',
  },
  {
    id: 'rp-ending-leave-wait',
    type: 'beat',
    title: 'The Unlocked Door',
    requires: { 'rp-cp-1': 'leave-it', 'rp-cp-2': 'wait' },
    sceneImagePrompt: SCENES.snowRooftop,
    arcBrief: 'The protagonist sits in the audience. Dohyun plays the Rachmaninoff. It\'s perfect. It\'s empty. They both know. After the recital, the protagonist goes to the rooftop. The door is unlocked, as always. Dohyun is there. The piano is covered — it\'s getting cold now. He\'s just standing at the railing looking at the city. "You came," he says. "You always come." First snow begins to fall. He turns to face them. "I\'m going to play the recital again. Next month. My piece this time." A beat. "Will you be there?" End with the particular sweetness of a promise returned — the first one kept leading to a hundred more.',
  },

  // ── Reveal ──
  {
    id: 'rp-reveal',
    type: 'reveal',
    title: 'Your Story',
    sceneImagePrompt: SCENES.revealScene,
  },
]
