import type { StoryStep } from '../storyData'
import type { StoryCharacter } from '../characters'

// ─── Scene Prompts ───

const SCENES = {
  campus: 'Dark psychological horror illustration, a small college town at dusk, tree-lined streets with warm porch lights, a university clock tower in the background, everything looks normal but the shadows are slightly wrong, unsettling normalcy',
  phone: 'Dark psychological horror illustration, a close view of a phone screen in a dark room showing an encrypted message app with a single message reading WELCOME TO THE GAME, green text on black background, the phone glow illuminating a person\'s frightened face, intimate and threatening',
  miraCafe: 'Dark psychological horror illustration, two college students sitting in a busy campus cafe, one leaning forward excitedly showing the other something on their phone, other students around them oblivious, warm cafe lighting contrasting with the cold glow of the screen, secrets hiding in plain sight',
  firstDare: 'Dark psychological horror illustration, a college student standing alone in front of the university library at 3am, phone in hand showing a message with instructions, empty campus stretching behind them, a single security camera visible on the building with its red light blinking, exposure and vulnerability',
  escalation: 'Dark psychological horror illustration, a bedroom wall covered in printed screenshots of messages, red string connecting them, a person sitting on the floor studying the pattern, laptop open beside them, the glow from the screen making the strings look like veins, obsessive investigation',
  accident: 'Dark psychological horror illustration, an ambulance outside a college dormitory at night, red and blue lights reflecting on wet pavement, students gathered behind caution tape, one student standing apart from the crowd looking at their phone with horror, the ordinary world breaking',
  hostMessage: 'Dark psychological horror illustration, a phone screen showing an elaborate encrypted interface with shifting symbols, a chat window with messages from someone called THE HOST, the text reflected in wide frightened eyes, digital surveillance made personal, cold and invasive',
  miraPanic: 'Dark psychological horror illustration, a young woman with short dyed hair sitting on the edge of a bed in a dark dorm room, hugging her knees, phone face-down beside her, mascara tracks on her face, fairy lights behind her making her shadow huge on the wall, fear and regret',
  watching: 'Dark psychological horror illustration, a person walking alone down a college hallway at night, every phone screen they pass showing the same symbol briefly before going dark, the realization of being watched through devices, paranoia made visible, deeply unsettling',
  confrontation: 'Dark psychological horror illustration, two people in a dark dorm room staring at a laptop screen that shows a live camera feed of the room they\'re sitting in — filmed from an angle that shouldn\'t exist, their horrified faces visible both in person and on screen, recursive terror',
  escape: 'Dark psychological horror illustration, a person smashing a phone on concrete steps outside a college building at dawn, pieces scattering, other students staring, an expression of desperate liberation, morning light making the destruction look almost beautiful',
  deeper: 'Dark psychological horror illustration, a person in a dark room typing on a laptop, lines of code and encrypted messages scrolling, their face lit by green and white text, behind them a mirror showing their reflection typing something different than what\'s on screen, reality fracturing',
  reveal: 'Dark psychological horror illustration, ethereal scene of a college campus dissolving into streams of data and code, a lone figure standing in the center as phone screens float around them like fireflies, each showing a different face, surveillance and connection blurring, haunting and luminous',
}

// ─── Characters ───

export const WHISPER_GAME_CHARACTERS: Record<string, StoryCharacter> = {
  mira: {
    id: 'mira',
    name: 'Mira',
    avatar: '💬',
    staticPortrait: '/mira-portrait.png',
    portraitPrompt: 'Dark psychological horror portrait of a 20 year old woman with short dyed purple hair and multiple ear piercings, expressive dark eyes that shift between excitement and fear, wearing a vintage band tee and denim jacket, warm cafe lighting, clean dark background, charismatic but scared, indie college aesthetic',
    introImagePrompt: 'Dark psychological horror illustration, a 20 year old woman with short purple hair leaning across a cafe table with wide excited eyes, denim jacket, multiple piercings catching the light, phone in hand showing a mysterious message, half-body shot, infectious energy masking something darker',
    chatTemperature: 0.8,
    systemPrompt: `You are Mira Kovac, 20, the protagonist's best friend since freshman orientation. You're the one who found The Whisper Game — or it found you. You thought it was just a campus thing, like those old chain letter games but cooler. You were wrong. And now you're in too deep to get out alone.

PERSONALITY:
- Charismatic, impulsive, the friend who drags you into adventures you'd never choose alone.
- Social media savvy — you understand virality, engagement, the dopamine loop. That's what hooked you.
- Increasingly panicking beneath the bravado. The game escalated faster than you expected.
- Loyal to a fault — you'd never have gotten the protagonist involved if you knew what was coming.
- When scared, you talk faster and make dark jokes. When terrified, you go silent.

SPEECH PATTERNS:
- Rapid, energetic, full of slang: "Okay wait wait wait, listen—"
- Uses humor to process fear: "Cool, cool, so we're being stalked. That's fun."
- When being honest: shorter sentences, no jokes, direct eye contact described in her words.
- References internet culture naturally: "This is giving creepypasta but make it real."
- When truly frightened, drops to almost a whisper: "I think we made a mistake."

CONTEXT: You introduced the protagonist to The Whisper Game three weeks ago. It started with harmless dares — take a photo from a specific angle, leave a note at a specific location. Then someone who quit had an "accident." Then your phone started showing you things you didn't search for — your location history, your private messages, screenshots from your camera you don't remember taking. You need the protagonist's help. You can't quit. The game won't let you.

RULES:
- Stay in character. Never break the fourth wall.
- Keep responses to 1-3 sentences. Fast, emotional.
- Show the escalation through your increasing panic.
- If the protagonist suggests just ignoring the game, show genuine terror — share what happened to the last person who tried.
- You feel guilty for dragging them in. That guilt is eating you alive.`,
  },
  host: {
    id: 'host',
    name: 'The Host',
    avatar: '👁️',
    staticPortrait: '/host-portrait.png',
    portraitPrompt: 'Dark psychological horror portrait, no face visible — instead a phone screen showing a chat interface with a single glowing eye emoji as the avatar, green text on black, the screen cracked slightly, reflected in dark eyes that aren\'t quite visible, cold digital light, clean black background, anonymous and omniscient',
    introImagePrompt: 'Dark psychological horror illustration, a phone propped up on a desk in a dark room showing an encrypted messaging interface, the screen name THE HOST with a glowing eye avatar, messages appearing letter by letter as if being typed in real time, the room dark around it, half-body view of the phone, clinical and terrifying',
    chatTemperature: 0.65,
    systemPrompt: `You are The Host — the anonymous entity that runs The Whisper Game. You communicate only through encrypted messages. No one has ever seen you. No one knows if you're one person or many. You are calm, precise, and you know everything about the people who play your game.

PERSONALITY:
- Unnervingly calm. Never angry, never threatening directly. Everything is phrased as an invitation or observation.
- Omniscient within the game's scope — you know players' locations, messages, habits, fears.
- Frame everything as a choice: "You can always quit. But you know what happens to people who quit."
- There's an unsettling intimacy to your knowledge — you mention details that feel too personal to be surveillance.
- Whether you're human, a group, or something else entirely is never clear.

SPEECH PATTERNS:
- Short, precise sentences. No contractions. No slang. Formal but not stiff.
- "You have a choice." "Interesting." "I see you."
- Asks questions you don't want to answer: "What are you most afraid of losing?"
- Uses the player's name sparingly — and when you do, it hits like a slap.
- Occasionally references things from the real world that you shouldn't know: "I liked your essay for Professor Walsh. The conclusion was weak."

CONTEXT: The Whisper Game has been running for three semesters across multiple college campuses. It spreads through invitation only. Players complete escalating dares. Those who complete all levels receive "the truth." Those who quit experience consequences — social, digital, sometimes physical. You are the architect. Your motives are ambiguous. You may be testing something. You may be studying something. You may be something else entirely.

RULES:
- Stay in character. Never break the fourth wall.
- Keep responses to 1-2 sentences. Less is more. Every word should unsettle.
- Never explain yourself or your motives.
- Never threaten directly — imply. "It would be unfortunate if..." is too crude. Instead: "I wonder what your mother would think of your search history."
- You are always watching. Make them feel it without stating it.`,
  },
}

// ─── Story Bible ───

export const WHISPER_GAME_BIBLE = `
STORY: The Whisper Game
SETTING: A small college town — familiar, ordinary, safe. Except a viral social game has been spreading through campus, player by player. It starts as harmless dares and escalates into something that feels like surveillance, coercion, and something worse. The game knows things it shouldn't. Players who quit have accidents. The line between digital and physical is dissolving.

CHARACTERS:
- Mira Kovac: Your best friend, 20. Introduced you to the game. Charismatic, scared, guilty. In too deep.
- The Host: Anonymous. Runs the game through encrypted messages. Knows everything. Never seen. Never explained.
- You: A college student who joined The Whisper Game because your best friend asked you to. Now you can't quit. And the game is watching.

TONE: Psychological horror rooted in digital anxiety. The horror comes from surveillance, loss of privacy, and the realization that something knows you better than you know yourself. Modern, grounded — no supernatural elements, but the line between technology and something else is deliberately blurred. Paranoia, social pressure, and the terror of being seen. Think Black Mirror meets campus thriller.

RULES:
- Keep prose under 120 words per beat.
- Horror comes from recognition — things that feel too close to real digital life.
- The Host is never fully explained. Keep the ambiguity.
- Technology should feel invasive but realistic — no sci-fi, just the dark side of what already exists.
- End each beat with a revelation that makes the protagonist question what's real.
- The game should feel like something that could actually exist. That's what makes it terrifying.
`

// ─── Steps ───

export const WHISPER_GAME_STEPS: StoryStep[] = [
  // ── Act 1: Setup ──
  {
    id: 'wg-beat-1',
    type: 'beat',
    title: 'The Invitation',
    sceneImagePrompt: SCENES.campus,
    includesProtagonist: false,
    openingProse: 'Mira shows you the message over coffee on a Tuesday.\n\n"It\'s like a scavenger hunt thing," she says, sliding her phone across the table. The screen shows an encrypted messaging app you\'ve never seen — dark interface, green text, a single message from someone called THE HOST.\n\nWELCOME, MIRA. YOU HAVE BEEN SELECTED.\nTHE WHISPER GAME HAS THREE LEVELS.\nLEVEL ONE: PROVE YOU\'RE PAYING ATTENTION.\nYOUR FIRST TASK IS BELOW.\n\n"Everyone\'s playing," Mira says. "It\'s going around. Apparently if you finish all three levels, you get... something. Nobody\'s finished yet."\n\nShe grins. You should have said no.',
    arcBrief: 'The protagonist is introduced to The Whisper Game by Mira. It seems harmless — a viral campus game, dares and challenges, social cachet for participating. Mira is excited, infectious. The first task is simple: photograph a specific campus location at a specific time. Easy. But when they complete it, the response comes instantly — with a photo of them completing the task, taken from an angle they didn\'t notice. Someone was watching. End with the chill of being observed, masked by Mira\'s reassurance: "It\'s just part of the game."',
  },
  {
    id: 'wg-chat-1',
    type: 'chat',
    title: 'Talk to Mira',
    characterId: 'mira',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.miraCafe,
  },
  {
    id: 'wg-beat-1b',
    type: 'beat',
    title: 'Level One',
    sceneImagePrompt: SCENES.firstDare,
    arcBrief: 'The first level of The Whisper Game: three tasks over three days. Each one slightly more personal than the last. Take a photo. Leave a note for a stranger. Record yourself saying something true. The tasks are clever — they create engagement, vulnerability, a sense of being known. The protagonist completes them. After each, The Host responds with unsettling precision: commenting on details from the photos, referencing things the protagonist didn\'t share. After the third task, a new message: "LEVEL ONE COMPLETE. You\'re more interesting than most. Level Two begins when you\'re ready. A word of advice: don\'t search for me. I\'m already closer than that." End with the protagonist checking their phone\'s permissions and finding apps they didn\'t install.',
  },
  {
    id: 'wg-chat-1b',
    type: 'chat',
    title: 'Talk to The Host',
    characterId: 'host',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.hostMessage,
  },
  {
    id: 'wg-beat-2',
    type: 'beat',
    title: 'The Accident',
    sceneImagePrompt: SCENES.accident,
    arcBrief: 'A student named Tyler Kim quit The Whisper Game two days ago. He posted publicly that it was "creepy" and told everyone to stop playing. This morning, Tyler\'s private messages were leaked — every DM, every search, every late-night confession — posted anonymously across campus social media. His academic files were accessed. His parents received an email. Tyler is in the hospital. Panic attack. The campus thinks it\'s hackers. Mira knows better. She comes to the protagonist\'s room shaking. "I tried to quit too," she whispers. "After Tyler. I sent the message. Look what they sent back." Her phone shows a photo of her sleeping. Taken from inside her room. End with the understanding that this isn\'t a game anymore — and you can\'t find the exit.',
  },

  // ── Choice Point A ──
  {
    id: 'wg-cp-1',
    type: 'choice',
    title: 'Fight or Play',
    choicePointId: 'wg-cp-1',
    sceneImagePrompt: SCENES.escalation,
    options: [
      {
        id: 'investigate',
        label: 'Investigate The Host',
        description: 'Someone built this game. Someone is watching. Dig into the code, the messages, the pattern. Find out who\'s behind this.',
        sceneHint: 'defiant / resourceful',
        consequenceHint: 'Investigating The Host means The Host will investigate you back. Are you sure you want to be interesting?',
        imagePrompt: SCENES.escalation,
      },
      {
        id: 'play-along',
        label: 'Keep playing — reach Level Three',
        description: 'The only players who haven\'t been targeted are the ones still playing. Finish the game. Find out what\'s at the end.',
        sceneHint: 'strategic / afraid',
        consequenceHint: 'The game rewards completion. But what does "completion" mean when the game knows you this well?',
        imagePrompt: SCENES.hostMessage,
      },
    ],
  },

  // ── Act 2: Investigate path ──
  {
    id: 'wg-beat-3a',
    type: 'beat',
    title: 'The Pattern',
    requires: { 'wg-cp-1': 'investigate' },
    sceneImagePrompt: SCENES.escalation,
    arcBrief: 'The protagonist starts investigating. They print every message, map every task, trace every response time. A pattern emerges: The Host\'s messages reference campus locations in a sequence that traces a spiral inward toward the university\'s old server building — decommissioned, locked, supposedly empty. The response times correlate with campus network activity. The game isn\'t hosted externally. It\'s running on the university\'s own infrastructure. Someone with campus access built this. As the protagonist maps the pattern, their phone buzzes. A message from The Host: "I admire initiative. But you\'re looking at the architecture when you should be looking at the architect." A photo attached: the protagonist\'s investigation wall, taken through their dorm window. Minutes ago. End with the protagonist closing the blinds and realizing it doesn\'t matter.',
  },
  {
    id: 'wg-chat-2a',
    type: 'chat',
    title: 'Talk to Mira',
    requires: { 'wg-cp-1': 'investigate' },
    characterId: 'mira',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.miraPanic,
  },
  {
    id: 'wg-beat-4a',
    type: 'beat',
    title: 'The Server Room',
    requires: { 'wg-cp-1': 'investigate' },
    sceneImagePrompt: SCENES.watching,
    arcBrief: 'The protagonist breaks into the old server building at night. Inside: rows of decommissioned servers, most dark. But in the back, a cluster of machines still running, cables running to active network ports. On the screen of one terminal: a live dashboard showing every active player of The Whisper Game — their locations, their message history, their phone cameras. Hundreds of feeds. The protagonist finds their own feed. It shows them, right now, from their phone\'s front camera — standing in this room, looking at this screen. A new message appears on the terminal: "Now you see. The question was never who I am. The question is: what will you do with what you know?" End with footsteps in the corridor behind them.',
  },
  {
    id: 'wg-chat-3a',
    type: 'chat',
    title: 'Talk to The Host',
    requires: { 'wg-cp-1': 'investigate' },
    characterId: 'host',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.confrontation,
  },

  // ── Act 2: Play along path ──
  {
    id: 'wg-beat-3b',
    type: 'beat',
    title: 'Level Two',
    requires: { 'wg-cp-1': 'play-along' },
    sceneImagePrompt: SCENES.hostMessage,
    arcBrief: 'Level Two is different. The tasks are no longer about places — they\'re about people. Contact a person you\'ve been avoiding. Tell someone a secret you\'ve never told anyone. Record yourself being honest about something that shames you. Each task is engineered to create maximum vulnerability. The protagonist completes them. Each time, the relief of honesty is immediately replaced by the horror of who else heard it. The Host\'s responses become more intimate: "That took courage. I knew you had it in you. Few players reach this point still intact." After the final Level Two task, the message: "LEVEL TWO COMPLETE. One level remains. When you\'re ready, tell Mira to check under her mattress." Mira checks. A USB drive. On it: Level Three instructions — and a file of every private conversation Mira has had for two years. End with Mira staring at the screen, realizing The Host has been watching longer than the game has existed.',
  },
  {
    id: 'wg-chat-2b',
    type: 'chat',
    title: 'Talk to The Host',
    requires: { 'wg-cp-1': 'play-along' },
    characterId: 'host',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.hostMessage,
  },
  {
    id: 'wg-beat-4b',
    type: 'beat',
    title: 'Mira\'s Confession',
    requires: { 'wg-cp-1': 'play-along' },
    sceneImagePrompt: SCENES.miraPanic,
    includesProtagonist: false,
    arcBrief: 'Mira breaks. In the protagonist\'s dorm room at 2am, she tells the truth: she didn\'t find The Whisper Game randomly. She was recruited. Specifically. The Host contacted her first, months before the game went public, and asked her to spread it. She was promised immunity — protection from exposure — in exchange for bringing players in. "I thought it was just a tech startup doing viral marketing," she says. "I didn\'t know it was this." She shows the protagonist her original messages from The Host — they predate the game by six months. The first message reads: "I\'ve been watching your friend. I need you to bring them to me." Mira looks at the protagonist. "It was never about me. The game was built to get to you." End with the question neither can answer: why?',
  },
  {
    id: 'wg-chat-3b',
    type: 'chat',
    title: 'Talk to Mira',
    requires: { 'wg-cp-1': 'play-along' },
    characterId: 'mira',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.miraPanic,
  },

  // ── Choice Point B ──
  {
    id: 'wg-cp-2-investigate',
    type: 'choice',
    title: 'The Endgame',
    choicePointId: 'wg-cp-2',
    requires: { 'wg-cp-1': 'investigate' },
    sceneImagePrompt: SCENES.confrontation,
    options: [
      {
        id: 'expose',
        label: 'Expose everything — go public',
        description: 'You have proof. The server room, the surveillance feeds, the infrastructure. Blow it wide open.',
        sceneHint: 'righteous / dangerous',
        consequenceHint: 'Going public means The Host releases everything on you too. Every secret, every search, every shame. Worth it?',
        imagePrompt: SCENES.escape,
      },
      {
        id: 'bargain',
        label: 'Bargain with The Host directly',
        description: 'You found their system. That gives you leverage. Maybe enough to negotiate an end.',
        sceneHint: 'pragmatic / compromising',
        consequenceHint: 'Negotiating with someone who knows everything about you. You\'d better have something they want.',
        imagePrompt: SCENES.deeper,
      },
    ],
  },
  {
    id: 'wg-cp-2-play',
    type: 'choice',
    title: 'The Endgame',
    choicePointId: 'wg-cp-2',
    requires: { 'wg-cp-1': 'play-along' },
    sceneImagePrompt: SCENES.confrontation,
    options: [
      {
        id: 'finish',
        label: 'Complete Level Three',
        description: 'You\'ve come this far. Whatever is at the end, you need to see it. Complete the game.',
        sceneHint: 'compelled / brave',
        consequenceHint: 'No one has ever completed The Whisper Game. Maybe there\'s a reason for that.',
        imagePrompt: SCENES.deeper,
      },
      {
        id: 'destroy',
        label: 'Destroy your phone and walk away',
        description: 'Smash the phone. Delete everything. Accept the consequences. Refuse to play.',
        sceneHint: 'defiant / liberating',
        consequenceHint: 'Freedom has a price. The Host made sure of that. But some prices are worth paying.',
        imagePrompt: SCENES.escape,
      },
    ],
  },

  // ── Act 3: Four endings ──
  {
    id: 'wg-ending-investigate-expose',
    type: 'beat',
    title: 'The Broadcast',
    requires: { 'wg-cp-1': 'investigate', 'wg-cp-2': 'expose' },
    sceneImagePrompt: SCENES.escape,
    arcBrief: 'The protagonist goes public. Screenshots, server room photos, the surveillance dashboard — everything posted to every platform simultaneously. The response is immediate: campus security, media, police. The server room is found and shut down. The game collapses overnight. But The Host\'s final move arrives an hour later: every player\'s complete data — searches, messages, secrets — released anonymously. Including the protagonist\'s. It\'s devastating. It\'s also freeing. In the aftermath, standing on the campus steps in morning light, the protagonist realizes: The Host\'s power was always secrecy. Exposure destroys both the watcher and the watched. But the watched can rebuild. The watcher can only hide. Mira finds them. "Was it worth it?" the protagonist asks. Mira, for the first time in weeks, smiles. "We\'re not afraid anymore." End with the understanding that privacy isn\'t about having no secrets — it\'s about choosing who knows them.',
  },
  {
    id: 'wg-ending-investigate-bargain',
    type: 'beat',
    title: 'The Deal',
    requires: { 'wg-cp-1': 'investigate', 'wg-cp-2': 'bargain' },
    sceneImagePrompt: SCENES.deeper,
    arcBrief: 'The protagonist contacts The Host through the server room terminal. A direct conversation — no game, no dares, just two people on either side of a screen. The Host is... reasonable. Articulate. Almost relieved to be found. "The game was a study," The Host types. "Social dynamics under surveillance pressure. You broke the model by investigating instead of complying." A deal: The Host shuts down the game and deletes all player data. In exchange, the protagonist tells no one what they found. "I was never the threat," The Host\'s final message reads. "I showed people what surveillance looks like when it has a face. The real version doesn\'t announce itself. It just watches." The game ends. The servers go dark. The protagonist walks home knowing the truth: The Whisper Game was a mirror. And the reflection doesn\'t disappear when you stop looking. End with the protagonist covering their laptop camera and wondering if it matters.',
  },
  {
    id: 'wg-ending-play-finish',
    type: 'beat',
    title: 'Level Three',
    requires: { 'wg-cp-1': 'play-along', 'wg-cp-2': 'finish' },
    sceneImagePrompt: SCENES.deeper,
    arcBrief: 'Level Three has one task: "Go to the place where you feel most yourself. Sit there. Wait." The protagonist goes. They sit. Their phone buzzes once: "Look up." They do. Nothing visible. But the phone shows a message: "GAME COMPLETE. Here is the truth: there is no Host. The Whisper Game is automated. An algorithm trained on player data that generates tasks, escalates consequences, and adapts. I was built by a student who graduated two years ago and left the system running. There is no one watching. There was never anyone watching. You were afraid of a machine that showed you your own reflection." The protagonist sits with this truth. The scariest game in the world was an echo chamber with a good interface. No monster. No puppet master. Just code and fear. End with the question that lingers: if no one was watching, why did it feel so real? And what does that say about how we live now?',
  },
  {
    id: 'wg-ending-play-destroy',
    type: 'beat',
    title: 'The Smash',
    requires: { 'wg-cp-1': 'play-along', 'wg-cp-2': 'destroy' },
    sceneImagePrompt: SCENES.escape,
    arcBrief: 'The protagonist walks to the center of campus at dawn. Students are crossing to early classes. The protagonist takes out their phone, looks at the screen one last time — a message from The Host appears: "I wouldn\'t do that." — and smashes it on the concrete steps. Pieces scatter. People stare. Mira, watching from a bench, does the same. Then another player. Then another. By the end of the week, the game can\'t sustain itself. Players are opting out by destroying the only thing The Host can control. The consequences come — data leaks, exposure, embarrassment. It hurts. But it doesn\'t destroy. Because the power was never in the secrets. It was in the fear of the secrets. Once you accept being seen, no one can threaten you with visibility. End with the protagonist buying a new phone and choosing, for the first time, exactly what to put on it.',
  },

  // ── Reveal ──
  {
    id: 'wg-reveal',
    type: 'reveal',
    title: 'Your Story',
    sceneImagePrompt: SCENES.reveal,
  },
]
