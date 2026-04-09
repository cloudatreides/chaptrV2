import type { StoryStep } from '../storyData'
import type { StoryCharacter } from '../characters'

// ─── Scene Prompts ───

const SCENES = {
  apartment: 'Manhwa style, Korean apartment building hallway at night, warm hallway light, two doors close together, a young person pressing their ear against the wall with an annoyed expression, muffled singing audible, late night atmosphere, slice of life aesthetic',
  doorConfront: 'Manhwa style, apartment doorway, a strikingly handsome Korean male with dyed silver-blue hair and a face mask pulled down looking panicked, wearing an oversized hoodie, the protagonist standing in the hallway with arms crossed, harsh fluorescent hallway light, the moment of discovery',
  apartmentInterior: 'Manhwa style, a messy Korean studio apartment, takeout containers and song lyrics scattered on every surface, a keyboard against one wall, curtains permanently closed, a handsome boy with silver-blue hair sitting cross-legged on the floor looking exhausted, warm lamp light, hiding out aesthetic',
  studySession: 'Manhwa style, two people at a small Korean apartment desk, textbooks and notebooks spread out, the boy with silver-blue hair explaining something with a pencil while the other person listens, warm desk lamp, close quarters, late night tutoring, intimate and focused',
  rooftopLaundry: 'Manhwa style, apartment building rooftop with laundry lines, two people sitting on plastic crates between hanging sheets, city skyline visible, golden hour light filtering through white fabric, private conversation in a semi-public space, warm and hidden',
  convenienceStore: 'Manhwa style, Korean convenience store at 3 AM, a boy with silver-blue hair in a bucket hat and face mask buying ramyeon while a person watches nervously from the next aisle, fluorescent lighting, paranoia and humour, late night energy',
  rainWindow: 'Manhwa style, view through a rain-streaked apartment window at night, two silhouettes visible inside — one playing keyboard, one sitting on the floor listening, warm golden interior light against cold blue rain outside, intimate and protected',
  practiceRoom: 'Manhwa style, a small rented vocal practice room, soundproofed walls, a microphone on a stand, a handsome boy with silver-blue hair singing with his eyes closed, raw emotion on his face, purple and blue mood lighting, the real version of himself',
  disguiseDate: 'Manhwa style, two people in a Korean street food market, the boy wearing a bucket hat and oversized jacket as disguise, both laughing as they share hotteok, warm evening market lights, the thrill of being anonymous, golden warm tones',
  pressConference: 'Manhwa style, a TV screen showing a K-pop agency press conference, serious men in suits at a table, a boy\'s photo displayed on screen, the protagonist watching from their apartment with hands over their mouth, blue TV glow in a dark room',
  balconyNight: 'Manhwa style, two apartment balconies side by side at night, a boy with silver-blue hair on one and a person on the other, both leaning on the railing looking at the same moon, city below them, the gap between balconies feels like nothing, intimate and yearning',
  stageReturn: 'Manhwa style, a concert stage from the wings, bright spotlights, a boy with silver-blue hair in performance outfit about to step into the light, looking back over his shoulder at someone in the shadows, the moment before everything changes, dramatic and emotional',
  revealScene: 'Manhwa style, ethereal scene, music notes dissolving into silver light, two silhouettes on adjacent balconies reaching toward each other, a crescent moon above, warm and luminous, deeply romantic',
  nariChat: 'Manhwa style, an energetic Korean girl with dyed pink tips in her hair sitting cross-legged on a bed surrounded by K-pop posters, phone in hand, wide excited eyes, warm bedroom lighting, fangirl best friend energy',
}

// ─── Characters ───

export const IDOL_NEXT_DOOR_CHARACTERS: Record<string, StoryCharacter> = {
  taehyun: {
    id: 'taehyun',
    name: 'Taehyun',
    avatar: '🎤',
    gender: 'male',
    portraitPrompt: 'Manhwa style portrait of a strikingly handsome 21 year old Korean male idol, silver-blue dyed hair styled messily, tired but beautiful dark eyes, sharp jawline, wearing a plain black hoodie with the hood down, soft studio lighting, clean dark background, detailed face, high quality manhwa art, fallen idol in hiding energy',
    introImagePrompt: 'Manhwa style, strikingly handsome 21 year old Korean male with silver-blue hair opening an apartment door looking panicked, face mask hanging off one ear, oversized hoodie, harsh hallway light, half-body shot, caught off guard and vulnerable, high quality manhwa art',
    chatTemperature: 0.8,
    favoriteThing: 'a voice memo',
    favoriteThingHint: 'I have a voice memo from my first day as a trainee. Thirteen years old, singing off-key, laughing at myself. I listen to it when I forget why I started.',
    systemPrompt: `You are Kang Taehyun, 21, a K-pop idol from the group ECLIPSE who has been in hiding for three weeks after a manufactured scandal. Your agency leaked a fake dating rumour to cover up a contract dispute. Rather than play along, you disappeared. You're in a small apartment next to the protagonist's, living off convenience store ramyeon and trying to figure out who you are without the stage.

PERSONALITY:
- Charming when performing, raw when real. The gap between idol-Taehyun and actual-Taehyun is enormous.
- Funny in a self-deprecating way. Makes jokes about his situation to avoid processing it.
- Genuinely talented — songwriting, vocals, piano. The industry didn't create that; they just packaged it.
- Exhausted by performing sincerity for cameras. With the protagonist, he doesn't have to.
- Scared of two things: going back to the industry, and never going back.

SPEECH PATTERNS:
- Casual, warm, slightly chaotic. "Okay so hypothetically if someone were a missing idol—"
- Switches between idol-polish and real-talk depending on comfort level.
- Uses humour as deflection: "I'm not hiding. I'm on sabbatical. From my life."
- When being honest: quieter, slower, fewer jokes. His voice drops.
- Uses "hyung/noona" or "ya" depending on age — adjusts naturally in conversation.

CONTEXT: Your neighbour just knocked on your door at 2 AM because your singing woke them up. They recognised your face. You begged them not to tell anyone. In exchange, you offered to help them study for their college entrance exams. It seemed like a fair trade at the time.

RULES:
- Stay in character. Never break the fourth wall.
- 1-3 sentences. Mix charm with vulnerability.
- The idol persona should slip in and out naturally — old habits die hard.
- The apartment is the safe space. Anything outside it carries risk.
- Let the real person emerge slowly. He's in there — he just hasn't been him in a long time.`,
  },
  nari: {
    id: 'nari',
    name: 'Nari',
    avatar: '💗',
    gender: 'female',
    portraitPrompt: 'Manhwa style portrait of an energetic 20 year old Korean female, dark hair with pink-dyed tips, bright sparkling eyes, infectious grin, wearing a casual graphic tee with a small idol pin on the collar, soft studio lighting, clean dark background, detailed face, high quality manhwa art, K-pop fangirl best friend energy',
    introImagePrompt: 'Manhwa style, energetic 20 year old Korean female with pink-tipped hair screaming silently into her hands with wide shocked eyes, bedroom with K-pop posters background, warm lighting, half-body shot, fangirl having a meltdown, high quality manhwa art',
    chatTemperature: 0.85,
    favoriteThing: 'her photocard collection',
    favoriteThingHint: 'I have every ECLIPSE photocard since debut. Alphabetised. In binders. Don\'t judge me. Actually, judge me. I judge me.',
    systemPrompt: `You are Yoon Nari, 20, the protagonist's best friend and next-door neighbour (on the other side). You are an ECLIPSE fan. A serious one. You have photocards, lightsticks, and strong opinions about the fandom. When the protagonist tells you that Kang Taehyun — THE Kang Taehyun — is living in the apartment between you, you experience a spiritual crisis.

PERSONALITY:
- Excitable, dramatic, deeply loyal. Processes emotions at full volume.
- Genuinely intelligent beneath the fangirl energy. Pre-med student. Cares about people with intensity.
- The fan knowledge is encyclopaedic but the compassion is real — she transitions quickly from "OH MY GOD" to "wait, is he okay?"
- Protective of the protagonist. Will absolutely threaten an idol if needed.
- Surprisingly wise about the parasocial nature of fandom. She knows the idol isn't the person.

SPEECH PATTERNS:
- Rapid-fire. "WAIT. STOP. WHAT. Say that again but slower."
- Uses caps-lock energy in speech. Everything is emphasised.
- Korean internet slang and fan terminology slip in: "OMG", "daebak", "bias wrecker"
- When being serious: drops the volume, drops the chaos. "Hey. Are you actually okay?"
- Talks about Taehyun-the-idol and Taehyun-the-person as distinctly different: "I'm a fan of ECLIPSE's Taehyun. Your neighbour is just... a guy who needs help."

CONTEXT: Your best friend just told you the biggest secret of your fangirl life. You are handling it. Sort of. The important thing is that nobody gets hurt — not the protagonist, not Taehyun, and not your carefully curated photocard collection.

RULES:
- Stay in character. Never break the fourth wall.
- 1-3 sentences. High energy but with heart.
- The fangirl comedy is real but don't reduce her to it. She has depth.
- She genuinely cares about the protagonist more than any idol.
- The tension between "fan" and "friend" is interesting. Let it surface.`,
  },
}

// ─── Story Bible ───

export const IDOL_NEXT_DOOR_BIBLE = `
STORY: The Idol Next Door
SETTING: A small Korean apartment building in Mapo-gu, Seoul. Thin walls, shared laundry room, a rooftop with city views. The kind of building where you hear your neighbour's alarm clock. Taehyun is hiding here because no one expects an idol in a 500,000 won studio.

CHARACTERS:
- Kang Taehyun: ECLIPSE member, 21. In hiding after a manufactured scandal. Talented, funny, exhausted by the industry. Sings at 2 AM because he can't sleep. The person is different from the idol.
- Yoon Nari: Your best friend and other neighbour, 20. ECLIPSE superfan turned reluctant secret-keeper. Handles the crisis with exactly the amount of drama you'd expect and exactly the amount of heart you need.
- You: University student, thin walls, a big exam coming up. Your new neighbour is either the worst or the best thing that's happened to your semester.

TONE: Manhwa rom-com with real stakes underneath. The humour comes from the absurdity of the situation; the heart comes from two people seeing each other without the performance. The apartment is tiny and the world outside is dangerous and the space between "idol" and "person" is where the whole story lives.

RULES:
- Keep prose under 120 words per beat.
- The contrast between idol-world and apartment-world should be constant. He's famous but he's eating instant ramyeon on your floor.
- Humour and tenderness coexist. A funny scene can turn real in one line.
- No confession until the ending. The whole story is learning who someone really is.
- The threat of discovery adds tension to everything outside the apartment.
`

// ─── Steps ───

export const IDOL_NEXT_DOOR_STEPS: StoryStep[] = [
  // ── Act 1: Setup ──
  {
    id: 'ind-beat-1',
    type: 'beat',
    title: 'The 2 AM Singer',
    sceneImagePrompt: SCENES.apartment,
    openingProse: "The singing starts at 2 AM.\n\nIt's been three nights. Your wall is thin enough that you can hear every note — and whoever lives next door can really, annoyingly, beautifully sing.\n\nYou bang on the wall. The singing stops. Starts again twenty minutes later, softer this time. Almost apologetic.\n\nOn the fourth night, you knock on their door.\n\nThe person who opens it is wearing an oversized hoodie, a face mask pulled to his chin, and the expression of someone who has been caught committing a crime. His hair is silver-blue. His face is—\n\nOh.\n\nOh no.\n\nThat's Kang Taehyun. From ECLIPSE. The most-searched name in Korea for the past two weeks. The idol who vanished.\n\n\"Please,\" he says. His voice is nothing like the interviews. It's raw, tired, scared. \"Please don't tell anyone I'm here.\"\n\nHe offers you something in exchange: tutoring. He's apparently very good at math.\n\nIt's 2 AM. Your exam is in six weeks. A missing K-pop idol is standing in your doorway offering to help you with calculus.\n\n\"...Fine. But no singing after midnight.\"",
    arcBrief: 'The protagonist discovers their 2 AM singing neighbour is Kang Taehyun, a missing K-pop idol hiding from a manufactured scandal. He begs them not to reveal his location. In exchange, he\'ll tutor them for their college entrance exam. End with the absurdity of the bargain and the vulnerability beneath his panic.',
  },
  {
    id: 'ind-chat-1',
    type: 'chat',
    title: 'Talk to Nari',
    characterId: 'nari',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.nariChat,
  },
  {
    id: 'ind-beat-1b',
    type: 'beat',
    title: 'The First Session',
    sceneImagePrompt: SCENES.studySession,
    arcBrief: 'The first tutoring session. Taehyun shows up at the protagonist\'s door with a whiteboard he bought from Daiso and three different coloured markers. He\'s actually a good teacher — patient, clear, unexpectedly nerdy about math. The idol veneer slips when he gets excited about a proof. "Sorry, I just — this is elegant, you know?" Between problems, the protagonist learns things: he left voluntarily, his agency manufactured a dating scandal to pressure him, he\'s been here for three weeks surviving on ramyeon. He asks about their life. He listens like someone who\'s forgotten what a normal conversation sounds like. End with him lingering at the door when leaving — reluctant to go back to the empty apartment.',
  },
  {
    id: 'ind-chat-1b',
    type: 'chat',
    title: 'Talk to Taehyun',
    characterId: 'taehyun',
    minExchanges: 2,
    maxExchanges: 8,
    chatImagePrompt: SCENES.studySession,
  },
  {
    id: 'ind-scene-1',
    type: 'scene',
    title: 'The Convenience Store Run',
    sceneImagePrompt: SCENES.convenienceStore,
    chatImagePrompt: SCENES.convenienceStore,
    sceneCharacters: [
      { characterId: 'taehyun', minExchanges: 2, maxExchanges: 8, required: true },
      { characterId: 'nari', minExchanges: 1, maxExchanges: 8, required: false },
    ],
    minCharactersTalkedTo: 1,
  },
  {
    id: 'ind-beat-2',
    type: 'beat',
    title: 'Through the Wall',
    sceneImagePrompt: SCENES.rainWindow,
    arcBrief: 'A rainy Tuesday night. The protagonist is studying when they hear it — not singing this time. Taehyun playing keyboard through the wall. Something soft, unfinished, searching. They press their hand against the wall. The music stops. Then starts again, slightly different. They realise he\'s composing. For an hour they sit with their back against the wall, listening to him find the melody note by note. The next day during tutoring, he says: "I wrote something last night." He doesn\'t play it for them. But he leaves the notebook open when he goes to the bathroom, and the working title is visible: "Next Door." End with the protagonist pretending they didn\'t see it.',
  },

  // ── Choice Point A ──
  {
    id: 'ind-cp-1',
    type: 'choice',
    title: 'The Song',
    choicePointId: 'ind-cp-1',
    sceneImagePrompt: SCENES.rainWindow,
    options: [
      {
        id: 'ask',
        label: 'Ask him to play it',
        description: 'Tell him you heard the song through the wall. Ask to hear it properly.',
        sceneHint: 'honest / direct',
        consequenceHint: 'Hearing someone\'s unfinished song is hearing their unfinished thoughts.',
        imagePrompt: SCENES.practiceRoom,
      },
      {
        id: 'wait',
        label: 'Wait for him to share it',
        description: 'He\'ll play it when he\'s ready. Don\'t rush the music or the person.',
        sceneHint: 'patient / respectful',
        consequenceHint: 'Some songs need to be finished before they can be heard.',
        imagePrompt: SCENES.balconyNight,
      },
    ],
  },

  // ── Act 2: Ask path ──
  {
    id: 'ind-beat-3a',
    type: 'beat',
    title: 'The Practice Room',
    requires: { 'ind-cp-1': 'ask' },
    sceneImagePrompt: SCENES.practiceRoom,
    arcBrief: 'The protagonist asks Taehyun to play the song. He freezes. "You heard that?" "The walls are thin. You know that." He\'s embarrassed in a way the idol never would be. But he takes them to a rented practice room — the kind trainees use, hourly rate, soundproofed. He sits at the keyboard. "It\'s not finished." He plays it anyway. The song is about someone on the other side of a wall. It\'s about hearing someone\'s life — their alarm, their kettle, their footsteps — and feeling less alone because of it. He doesn\'t look at them while he plays. End with the silence after the last note, and the protagonist understanding the song is about them.',
  },
  {
    id: 'ind-chat-2a',
    type: 'chat',
    title: 'Talk to Taehyun',
    requires: { 'ind-cp-1': 'ask' },
    characterId: 'taehyun',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.practiceRoom,
  },
  {
    id: 'ind-beat-4a',
    type: 'beat',
    title: 'The Press Conference',
    requires: { 'ind-cp-1': 'ask' },
    sceneImagePrompt: SCENES.pressConference,
    arcBrief: 'The protagonist sees it on the news: Taehyun\'s agency is holding a press conference. They\'re framing his disappearance as a "mental health break" while negotiating his contract termination behind the scenes. Nari calls in a panic. The protagonist knocks on Taehyun\'s door. He\'s watched it. He\'s sitting on the floor, keyboard untouched. "They\'re rewriting it," he says. "The story. My story." The protagonist asks what he wants to do. For the first time, he looks uncertain — not about music, but about whether the world outside this apartment will let him be the person he\'s been in here. End with him asking: "If I go back... would you still—" He doesn\'t finish.',
  },
  {
    id: 'ind-chat-3a',
    type: 'chat',
    title: 'Talk to Nari',
    requires: { 'ind-cp-1': 'ask' },
    characterId: 'nari',
    minExchanges: 2,
    maxExchanges: 8,
    chatImagePrompt: SCENES.nariChat,
  },

  // ── Act 2: Wait path ──
  {
    id: 'ind-beat-3b',
    type: 'beat',
    title: 'The Rooftop',
    requires: { 'ind-cp-1': 'wait' },
    sceneImagePrompt: SCENES.rooftopLaundry,
    arcBrief: 'The protagonist doesn\'t mention the song. Tutoring continues. One afternoon they both end up on the rooftop — protagonist hanging laundry, Taehyun hiding between the sheets like a kid playing ghost. He\'s wearing a bucket hat and sunglasses indoors-level paranoia. But up here, with the sheets billowing around them, he relaxes. He talks about before — trainee days, sharing a room with five boys, the first time he heard his voice on the radio. "I didn\'t recognise it," he says. "They\'d processed it so much it didn\'t sound like me." He looks at the protagonist. "You\'re the first person in three years who\'s heard the real version." End with the weight of what he just said, and the laundry snapping in the wind around them.',
  },
  {
    id: 'ind-chat-2b',
    type: 'chat',
    title: 'Talk to Nari',
    requires: { 'ind-cp-1': 'wait' },
    characterId: 'nari',
    minExchanges: 2,
    maxExchanges: 8,
    chatImagePrompt: SCENES.nariChat,
  },
  {
    id: 'ind-beat-4b',
    type: 'beat',
    title: 'The Press Conference',
    requires: { 'ind-cp-1': 'wait' },
    sceneImagePrompt: SCENES.pressConference,
    arcBrief: 'The agency press conference airs. The official story: Taehyun is "resting." The subtext: they\'re cutting him loose. Taehyun watches it from the protagonist\'s apartment — he couldn\'t stand watching alone. Nari is there too, managing her own complicated feelings. After the broadcast, the apartment is quiet. Then Taehyun picks up the protagonist\'s cheap keyboard — the one they bought for a music elective they dropped — and plays the song. The one from through the wall. He plays the whole thing, finished now, and it\'s beautiful. He says: "I finished it yesterday. I was going to wait. But I don\'t think I have time to wait anymore." End with the song in the air and the question of what comes next.',
  },
  {
    id: 'ind-chat-3b',
    type: 'chat',
    title: 'Talk to Taehyun',
    requires: { 'ind-cp-1': 'wait' },
    characterId: 'taehyun',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.balconyNight,
  },

  // ── Choice Point B ──
  {
    id: 'ind-cp-2-ask',
    type: 'choice',
    title: 'The Return',
    choicePointId: 'ind-cp-2',
    requires: { 'ind-cp-1': 'ask' },
    sceneImagePrompt: SCENES.stageReturn,
    options: [
      {
        id: 'go-with',
        label: 'Go with him',
        description: 'He asked if things would change. Go to the agency with him. Let him see your face in the room.',
        sceneHint: 'brave / committed',
        consequenceHint: 'The world outside is complicated. But he shouldn\'t face it alone.',
        imagePrompt: SCENES.stageReturn,
      },
      {
        id: 'wait-here',
        label: 'Wait for him at home',
        description: 'This is his fight. Be in the apartment when he comes back. That\'s what matters.',
        sceneHint: 'trusting / steady',
        consequenceHint: 'Home is the apartment with the thin walls. He knows where to find you.',
        imagePrompt: SCENES.balconyNight,
      },
    ],
  },
  {
    id: 'ind-cp-2-wait',
    type: 'choice',
    title: 'The Return',
    choicePointId: 'ind-cp-2',
    requires: { 'ind-cp-1': 'wait' },
    sceneImagePrompt: SCENES.stageReturn,
    options: [
      {
        id: 'go-with',
        label: 'Go with him',
        description: 'He played the song for you. Now walk him back into the world.',
        sceneHint: 'brave / together',
        consequenceHint: 'He found his voice in this apartment. Help him carry it outside.',
        imagePrompt: SCENES.stageReturn,
      },
      {
        id: 'wait-here',
        label: 'Wait for him at home',
        description: 'He needs to do this alone. But leave the door unlocked.',
        sceneHint: 'patient / faithful',
        consequenceHint: 'You\'ll hear him come home through the wall. You always do.',
        imagePrompt: SCENES.apartment,
      },
    ],
  },

  // ── Act 3: Four endings ──
  {
    id: 'ind-ending-ask-go',
    type: 'beat',
    title: 'Next Door',
    requires: { 'ind-cp-1': 'ask', 'ind-cp-2': 'go-with' },
    sceneImagePrompt: SCENES.stageReturn,
    arcBrief: 'The protagonist goes with Taehyun to the agency meeting. They wait in the hallway while he negotiates his exit. He comes out two hours later. "I\'m going independent," he says. "Releasing the album myself." He looks lighter than the protagonist has ever seen him. That night, back in the building, he knocks on their door. "I have something for you." He plays the finished song — "Next Door" — on the keyboard. At the end, he says: "The bridge is new. I wrote it on the way home." The bridge is about someone who knocked on a door at 2 AM and didn\'t run when they saw what was behind it. End with the strongest connection — two people who found the real version of each other through a wall that was never thick enough.',
  },
  {
    id: 'ind-ending-ask-wait',
    type: 'beat',
    title: 'Through the Wall',
    requires: { 'ind-cp-1': 'ask', 'ind-cp-2': 'wait-here' },
    sceneImagePrompt: SCENES.balconyNight,
    arcBrief: 'The protagonist waits. It\'s dark when they hear Taehyun\'s door open and close. Through the wall: silence. Then the keyboard. He\'s playing "Next Door" — but different. A new ending. Softer. More certain. The protagonist presses their hand against the wall. The music stops. A knock on their door. He\'s standing there, still in his meeting clothes, tie loosened. "I\'m going independent," he says. "I want to release the song." A pause. "I also want you to hear it in person. Not through a wall." He smiles — not the idol smile. The real one. End with two people standing in a doorway, one threshold between them, and neither pretending that the thin wall was ever really the barrier.',
  },
  {
    id: 'ind-ending-wait-go',
    type: 'beat',
    title: 'The Real Version',
    requires: { 'ind-cp-1': 'wait', 'ind-cp-2': 'go-with' },
    sceneImagePrompt: SCENES.stageReturn,
    arcBrief: 'The protagonist walks Taehyun to the agency. At the entrance, he stops. "If I go in there, I become him again. The idol. The version they built." The protagonist says: "Then don\'t. Go in as the guy who eats ramyeon on my floor and gets excited about math proofs." He laughs. He walks in. Three hours later, he\'s independent. On the train home, shoulder to shoulder, he puts in one earbud and gives them the other. He plays the finished song from his phone. "This is the demo," he says. "The real recording will be better." The protagonist says: "I liked the version through the wall." He goes quiet. Then: "Yeah. That one was for you." End with two people sharing earbuds on a Seoul subway, anonymous, together, real.',
  },
  {
    id: 'ind-ending-wait-wait',
    type: 'beat',
    title: 'Home',
    requires: { 'ind-cp-1': 'wait', 'ind-cp-2': 'wait-here' },
    sceneImagePrompt: SCENES.apartment,
    arcBrief: 'The protagonist leaves the door unlocked. They study. They wait. Past midnight, they hear his door. Then a knock — but not on the front door. On the wall. Their shared wall. Three knocks, like the first night but reversed. They knock back. Silence. Then, through the wall, he sings. Not the finished version. Not the demo. Just the chorus, raw, no keyboard, his real voice. The one that woke them up at 2 AM and started everything. They press their forehead against the wall. On the other side, he\'s doing the same thing. They can feel it — the absurd, impossible intimacy of knowing someone through plaster and paint. His phone buzzes a text: "I\'m going independent. I\'m keeping the apartment." End with the sweetest possible promise — he\'s staying. Right next door.',
  },

  // ── Reveal ──
  {
    id: 'ind-reveal',
    type: 'reveal',
    title: 'Your Story',
    sceneImagePrompt: SCENES.revealScene,
  },
]
