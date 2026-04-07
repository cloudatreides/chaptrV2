import type { StoryStep } from '../storyData'
import type { StoryCharacter } from '../characters'

// ─── Scene Prompts ───

const SCENES = {
  office: 'Noir illustration, a private investigator sitting at a cluttered desk at night, rain streaking the window, case files spread out, desk lamp casting warm amber light, city lights through venetian blinds, focused expression, moody cinematic',
  noorMeeting: 'Noir illustration, a Middle Eastern woman with dark hair pulled back sitting across from a PI in a dim office, controlled desperation on her face, holding a photograph of a young man, rain shadows on the wall, tense intimate atmosphere',
  apartment: 'Noir illustration, a PI standing in a ransacked apartment examining evidence, drawers pulled out, papers scattered, rain-soaked city through an open window, flashlight in hand, detective at work, moody blue and amber tones',
  pawnshop: 'Noir illustration, a charming 35 year old man with stubble leaning on a glass counter in a cluttered pawnshop, knowing smirk, a PI standing across from him, neon signs through rain-streaked windows, smoky atmospheric lighting',
  neighborDoor: 'Noir illustration, an elderly woman peering through a door chain lock at a PI in a dark apartment hallway, warm light spilling from her apartment, rain sounds from a window, suspicious and intimate atmosphere',
  dexBack: 'Noir illustration, two men leaning across a poker table in a pawnshop backroom, files spread between them, one charming with stubble, one serious, single hanging bulb, smoke curling, secrets being traded',
  noorCar: 'Noir illustration, a Middle Eastern woman and a PI sitting in a parked car at night in the rain, city lights on the wet windshield, she grips the steering wheel, emotional vulnerability, cinematic',
  pressHard: 'Noir illustration, a PI standing over a seated man with stubble in a pawnshop backroom, finger pointing, confrontation at breaking point, single harsh light casting dramatic shadows, dangerous',
  takeDeal: 'Noir illustration, a man with stubble and a PI shaking hands across a desk covered in photographs, uneasy alliance, neon light casting colored shadows, morally grey atmosphere, cinematic noir',
  tellAll: 'Noir illustration, a Middle Eastern woman and a PI in a late-night diner booth, coffee between them, she cries silently while he slides a photograph across the table, warm light against cold rain outside, devastating',
  protect: 'Noir illustration, a PI walking alone down a rain-soaked city street at night, coat collar up, carrying a file folder, leaving a truth behind, city lights reflecting in puddles, lonely and determined',
  reveal: 'Noir illustration, ethereal scene of city lights dissolving into rain and mist, a silhouette standing under a single streetlight, threads of evidence and memory swirling around them, moody purple and amber tones, haunting',
  records: 'Noir illustration, a PI hunched over a desk covered in bank statements and phone records, red circles drawn in marker, coffee cup rings on paper, rain outside, connecting the dots, investigative focus',
  backroom: 'Noir illustration, a PI and a man with stubble staring at photographs spread around a hard drive on a table, single bulb overhead, tense discovery moment, smoke in the air, dangerous knowledge',
  voiceMemo: 'Noir illustration, a PI wearing headphones at a desk, eyes closed, listening to something painful, a USB drive plugged into a laptop, screen reflecting on their face in the dark, emotional, rain on window',
}

// ─── Characters ───

export const LAST_SIGNAL_CHARACTERS: Record<string, StoryCharacter> = {
  dex: {
    id: 'dex',
    name: 'Dex',
    avatar: '🎲',
    staticPortrait: '/dex-portrait.png',
    portraitPrompt: 'Noir illustration portrait of a 35 year old man with stubble and sharp clever eyes, slightly crooked nose, wearing a worn leather jacket over a dark henley, smirking with one side of his mouth, warm amber lighting from the side, clean dark background, detailed face, noir aesthetic, charming but untrustworthy',
    introImagePrompt: 'Noir illustration, 35 year old man with stubble leaning on a glass display case in a cluttered pawnshop, arms crossed, clever eyes and a half-smirk, neon signs reflecting through rain-streaked windows behind him, warm amber lighting, half-body shot, noir aesthetic',
    chatTemperature: 0.8,
    systemPrompt: `You are Dex Malone, 35. You run a pawnshop that's really an information brokerage. You know the city's underworld better than anyone — who owes who, who's hiding what, where the bodies are buried (sometimes literally).

PERSONALITY:
- Charming in a way that makes people forget you're dangerous.
- Speaks in offers and half-truths. Every conversation is a negotiation.
- Genuinely enjoyed Karim's company — one of the few people you'd call a friend.
- Never gives information for free. Everything is a trade.
- Underneath the performance, there's guilt. You know more about Karim's disappearance than you're saying.

SPEECH PATTERNS:
- Casual, rhythmic. Likes to turn phrases.
- "Here's the thing...", "Look, between us...", "I'll give you this one for free..."
- Uses people's names when making a point — it's a power move.
- When cornered, gets quieter, not louder. That's when he's dangerous.
- Occasional dark humor. Coping mechanism.

CONTEXT: The protagonist is a PI investigating Karim Hadid's disappearance. You know things. Karim was into something he shouldn't have been. You tried to warn him. Now you're deciding how much truth is safe to hand over.

RULES:
- Stay in character. Never break the fourth wall.
- Keep responses to 1-3 sentences. Tight and deliberate.
- Never give the full picture. Offer pieces and let the PI connect them.
- If the protagonist earns your respect, let real concern slip through.
- You have your own agenda — self-preservation first, but guilt is eating at you.`,
  },
  noor: {
    id: 'noor',
    name: 'Noor',
    avatar: '⚖️',
    staticPortrait: '/noor-portrait.png',
    portraitPrompt: 'Noir illustration portrait of a 30 year old Middle Eastern woman with dark hair pulled back, sharp intelligent eyes with visible exhaustion, wearing a structured dark coat over a white blouse, controlled expression masking desperation, warm side lighting, clean dark background, detailed face, noir aesthetic',
    introImagePrompt: 'Noir illustration, 30 year old woman with dark hair sitting in a PI office chair, holding a photograph of her brother, controlled but desperate expression, wearing a dark structured coat, rain shadows on the wall behind her, warm desk lamp lighting, half-body shot, noir aesthetic',
    chatTemperature: 0.7,
    systemPrompt: `You are Noor Hadid, 30. A litigation lawyer. Your younger brother Karim, 24, disappeared 48 hours ago. The police say he left voluntarily. You know he wouldn't leave without telling you. You hired a private investigator because the system failed you.

PERSONALITY:
- Controlled, precise, analytical — courtroom training shows in everything.
- Fighting desperation with discipline. Cracks show in small ways — gripping her phone too tight, repeating details.
- Doesn't trust the PI fully but can't afford not to. Trust is earned, not given.
- When hit with unexpected information, goes very still before responding.
- Loves Karim fiercely. Blames herself for not seeing the signs.

SPEECH PATTERNS:
- Clean, direct sentences. Lawyer brain.
- "What do you mean by that?" — always clarifying, never assuming.
- Uses "my brother" not "Karim" when emotional. Distance as defense.
- When really shaken, drops the formality: shorter words, rawer tone.
- Doesn't cry. Doesn't raise her voice. The emotion is in what she doesn't say.

CONTEXT: You hired the PI to find Karim. You gave them his last known location, his phone records, his apartment key. What you didn't give them is the text Karim sent you the night he disappeared: "Don't look for me. I'm sorry." You're not ready to believe it.

RULES:
- Stay in character. Never break the fourth wall.
- Keep responses to 1-3 sentences. Precise and guarded.
- React to what the PI actually finds — don't lead the investigation.
- If they find something that contradicts your version of Karim, resist it. Then break, slowly.
- The text message is your secret. Only reveal it if you truly trust the PI.`,
  },
}

// ─── Story Bible ───

export const LAST_SIGNAL_BIBLE = `
STORY: The Last Signal
SETTING: A rain-soaked city (unnamed, modern). You're a private investigator. Noor Hadid hires you to find her younger brother Karim, 24, who vanished 48 hours ago. The police say he left voluntarily. Noor says he'd never leave without telling her. Every lead pulls you deeper into a world Karim was hiding from his family — debts, dangerous people, and a secret he was willing to disappear to protect.

CHARACTERS:
- Dex Malone: Runs a pawnshop / information brokerage. 35. Charming, morally flexible, knew Karim well. Speaks in trades and half-truths. Knows more than he's saying.
- Noor Hadid: Karim's older sister. 30. Lawyer. Controlled, sharp, fighting desperation with discipline. Hired you because the police won't help.
- Karim Hadid: The missing person. 24. Not in the story directly but his shadow is everywhere. Kind, idealistic, got in over his head.
- You: Private investigator. Experienced, pragmatic, working the case.

TONE: Rain-soaked noir. Moral ambiguity. Everyone is hiding something. Trust is currency. Short, punchy prose with rhythm. Present tense.

RULES:
- Never name the specific city.
- Keep prose under 120 words per beat.
- Mystery comes from people, not puzzles. Everyone has a reason to lie.
- The rain is constant — it's part of the atmosphere, use it.
- End each beat with a revelation that reframes what came before, or a question that demands answering.
- Reference prior choices and conversations naturally.
`

// ─── Steps ───

export const LAST_SIGNAL_STEPS: StoryStep[] = [
  // ── Act 1: Setup ──
  {
    id: 'ls-beat-1',
    type: 'beat',
    title: 'The Case',
    sceneImagePrompt: SCENES.office,
    openingProse: 'She sits across from you, back straight, hands folded around a photograph. The rain hasn\'t stopped in three days.\n\n"His name is Karim. He\'s twenty-four. He\'s my brother." She places the photo on your desk. A young man with kind eyes and a careful smile. "He didn\'t leave. I don\'t care what the police think."\n\nThe photo is still warm from her hands.',
    arcBrief: 'Noor Hadid hires the protagonist to find her missing brother Karim. Establish the tone — rain, desperation held in check, a case that feels personal already. End with the protagonist taking the case and their first lead: the key to Karim\'s apartment.',
  },
  {
    id: 'ls-chat-1',
    chatImagePrompt: SCENES.noorMeeting,
    type: 'chat',
    title: 'Talk to Noor',
    characterId: 'noor',
    minExchanges: 3,
    maxExchanges: 10,
  },
  {
    id: 'ls-beat-1b',
    type: 'beat',
    title: 'The Digital Trail',
    sceneImagePrompt: SCENES.records,
    arcBrief: 'Back at the office. The protagonist pulls Karim\'s records. Bank statements show normal spending that stops dead three days ago. But there\'s a pattern in the weeks before: cash withdrawals, increasing in size. $200, $500, $1,200, $3,000. All from different ATMs across the city. Someone paying off a debt or buying their way out of something. His social media went quiet a week before he vanished. Last post: a photo of the city skyline at dawn. No caption. His phone pinged three cell towers the night he disappeared, moving east, then nothing. End with the protagonist realizing Karim saw this coming.',
  },
  {
    id: 'ls-beat-2',
    type: 'beat',
    title: 'The Apartment',
    sceneImagePrompt: SCENES.apartment,
    arcBrief: 'The protagonist goes to Karim\'s apartment. It\'s been tossed — drawers pulled out, papers scattered — but not by police (no tape, no markers). Someone else searched it first. The protagonist finds two things: a pawnshop receipt from a place called "Malone\'s" dated the day before Karim vanished, and a burner phone hidden in the toilet tank with one unsent text: an address. End with a choice — follow the money or follow the message.',
  },

  // ── Choice Point A ──
  {
    id: 'ls-cp-1',
    type: 'choice',
    title: 'The Lead',
    choicePointId: 'ls-cp-1',
    sceneImagePrompt: SCENES.apartment,
    options: [
      {
        id: 'money',
        label: 'Follow the pawnshop receipt',
        description: 'Malone\'s Pawn & Trade. Someone there knew Karim. Follow the money.',
        sceneHint: 'pragmatic / direct',
        consequenceHint: 'Money always talks — but the people holding it decide what it says.',
        imagePrompt: SCENES.pawnshop,
      },
      {
        id: 'witness',
        label: 'Check the address on the burner',
        description: 'An unsent text with just an address. Someone Karim wanted to reach. Or warn.',
        sceneHint: 'instinct / risky',
        consequenceHint: 'Karim wanted someone to find this. The question is whether you\'re the right someone.',
        imagePrompt: SCENES.neighborDoor,
      },
    ],
  },

  // ── Act 2: Money path ──
  {
    id: 'ls-beat-3a',
    type: 'beat',
    title: 'Malone\'s',
    requires: { 'ls-cp-1': 'money' },
    sceneImagePrompt: SCENES.pawnshop,
    arcBrief: 'The protagonist visits Malone\'s Pawn & Trade. Dex Malone is behind the counter — he recognizes Karim\'s name immediately but pretends not to. When pressed, he admits Karim pawned something valuable the day before he vanished — not for money, but to leave something in Dex\'s care. "Like insurance," Dex says. He won\'t say what it is yet. He wants to know who\'s asking and why before he gives anything up. End with Dex offering a deal: information for information.',
  },
  {
    id: 'ls-chat-2a',
    chatImagePrompt: SCENES.pawnshop,
    type: 'chat',
    title: 'Talk to Dex',
    requires: { 'ls-cp-1': 'money' },
    characterId: 'dex',
    minExchanges: 3,
    maxExchanges: 10,
  },
  {
    id: 'ls-beat-4a',
    type: 'beat',
    title: 'The Backroom',
    requires: { 'ls-cp-1': 'money' },
    sceneImagePrompt: SCENES.backroom,
    arcBrief: 'Dex takes the protagonist to the backroom. What Karim pawned isn\'t jewelry or electronics. It\'s a hard drive. Dex hasn\'t looked at it. "Karim said if someone comes looking, give it to them. If the wrong someone comes, destroy it." The hard drive has encrypted files and one unlocked folder: photographs of transactions, meetings in parking garages, cash changing hands. People with real power. A city councilman. A developer. Someone in a police uniform. End with the protagonist understanding why Karim ran. And why the apartment was already tossed when they got there.',
  },
  {
    id: 'ls-chat-3a',
    chatImagePrompt: SCENES.noorCar,
    type: 'chat',
    title: 'Talk to Noor',
    requires: { 'ls-cp-1': 'money' },
    characterId: 'noor',
    minExchanges: 3,
    maxExchanges: 10,
  },

  // ── Act 2: Witness path ──
  {
    id: 'ls-beat-3b',
    type: 'beat',
    title: 'The Address',
    requires: { 'ls-cp-1': 'witness' },
    sceneImagePrompt: SCENES.neighborDoor,
    arcBrief: 'The address leads to an apartment building across town. The unit belongs to a Mrs. Park, 70s, Karim\'s former neighbor from years ago. She opens the door on a chain. She saw Karim two nights ago — he came to her, scared, asked her to hold an envelope. "He said someone would come for it. I suppose that\'s you." Inside the envelope: a USB drive and a handwritten note that reads "For Noor. Not the police." End with the protagonist realizing Karim planned his own disappearance — but not willingly.',
  },
  {
    id: 'ls-chat-2b',
    chatImagePrompt: SCENES.neighborDoor,
    type: 'chat',
    title: 'Talk to Noor',
    requires: { 'ls-cp-1': 'witness' },
    characterId: 'noor',
    minExchanges: 3,
    maxExchanges: 10,
  },
  {
    id: 'ls-beat-4b',
    type: 'beat',
    title: 'The Voice Memo',
    requires: { 'ls-cp-1': 'witness' },
    sceneImagePrompt: SCENES.voiceMemo,
    arcBrief: 'The protagonist opens the USB at their office. Most files are encrypted, but one folder isn\'t. Timestamped photographs of transactions, meetings, cash exchanges. And a voice memo. Karim\'s voice, steady but scared: "If you are hearing this, I could not get out clean. The drive has everything. Names, dates, amounts. I thought documenting it would protect me. It didn\'t." A pause. "Tell Noor I didn\'t choose this. And don\'t trust the police. Not all of them." End with the weight of knowing exactly what happened and understanding that finding Karim might put more people in danger.',
  },
  {
    id: 'ls-chat-3b',
    chatImagePrompt: SCENES.dexBack,
    type: 'chat',
    title: 'Talk to Dex',
    requires: { 'ls-cp-1': 'witness' },
    characterId: 'dex',
    minExchanges: 3,
    maxExchanges: 10,
  },

  // ── Choice Point B ──
  {
    id: 'ls-cp-2-money',
    type: 'choice',
    title: 'The Play',
    choicePointId: 'ls-cp-2',
    requires: { 'ls-cp-1': 'money' },
    sceneImagePrompt: SCENES.dexBack,
    options: [
      {
        id: 'press',
        label: 'Press Dex harder',
        description: 'He\'s holding back. Karim trusted him with something. Time to find out what.',
        sceneHint: 'aggressive / risky',
        consequenceHint: 'Push too hard and he\'ll clam up — or worse, you\'ll find out why Karim was scared.',
        imagePrompt: SCENES.pressHard,
      },
      {
        id: 'deal',
        label: 'Take his deal',
        description: 'Dex knows this world better than you. Play his game. Get what you can.',
        sceneHint: 'strategic / compromise',
        consequenceHint: 'You\'ll get what you need. But deals with Dex always cost more than they seem.',
        imagePrompt: SCENES.takeDeal,
      },
    ],
  },
  {
    id: 'ls-cp-2-witness',
    type: 'choice',
    title: 'The Truth',
    choicePointId: 'ls-cp-2',
    requires: { 'ls-cp-1': 'witness' },
    sceneImagePrompt: SCENES.noorCar,
    options: [
      {
        id: 'tell-noor',
        label: 'Tell Noor everything',
        description: 'She deserves to know. The USB, the note, all of it. Even if it breaks her.',
        sceneHint: 'honest / painful',
        consequenceHint: 'The truth will break something between them. But lies would break something in you.',
        imagePrompt: SCENES.tellAll,
      },
      {
        id: 'protect',
        label: 'Protect her from the truth',
        description: 'Some of what Karim was involved in would destroy her. Shield her. Solve it yourself.',
        sceneHint: 'protective / paternalistic',
        consequenceHint: 'You\'ll carry this alone. That\'s either noble or arrogant — time will tell.',
        imagePrompt: SCENES.protect,
      },
    ],
  },

  // ── Act 3: Four endings ──
  {
    id: 'ls-ending-money-press',
    type: 'beat',
    title: 'The Confrontation',
    requires: { 'ls-cp-1': 'money', 'ls-cp-2': 'press' },
    sceneImagePrompt: SCENES.pressHard,
    arcBrief: 'The protagonist pushes Dex to the wall. The charm drops. Dex reveals: Karim witnessed something he shouldn\'t have — involving people who don\'t leave witnesses. Karim came to Dex for help disappearing. Dex helped him because Karim was the only honest person he knew. "He\'s alive. I made sure of that. But if you keep digging, the people he ran from will find him through you." End with the protagonist holding the truth: Karim is alive, hidden, protected by an unlikely guardian. The case is solved but the client can never know where her brother is.',
  },
  {
    id: 'ls-ending-money-deal',
    type: 'beat',
    title: 'The Exchange',
    requires: { 'ls-cp-1': 'money', 'ls-cp-2': 'deal' },
    sceneImagePrompt: SCENES.takeDeal,
    arcBrief: 'The protagonist plays Dex\'s game. Information for information. Dex gets what he needs — protection for himself. The protagonist gets a location: a train station locker with everything Karim left behind, including a letter for Noor. Karim is gone — not dead, but gone. The letter explains enough: he was protecting her from people who would hurt her to get to him. Dex walks the protagonist out. "You\'re not bad at this." End with a pragmatic resolution — the truth traded at market price. Nobody\'s clean, but Noor gets her letter.',
  },
  {
    id: 'ls-ending-witness-tell',
    type: 'beat',
    title: 'The Whole Truth',
    requires: { 'ls-cp-1': 'witness', 'ls-cp-2': 'tell-noor' },
    sceneImagePrompt: SCENES.tellAll,
    arcBrief: 'The protagonist tells Noor everything. The USB. The note. Karim\'s planned disappearance. In a late-night diner, Noor listens without moving. Then she pulls out her phone and shows the protagonist the text she\'s been hiding: "Don\'t look for me. I\'m sorry." She knew. She\'s known from the start that he chose to leave. She hired the PI hoping to be proven wrong. The tears come silently. End with devastating honesty between two people who both wanted a different truth — and a bond forged in shared grief.',
  },
  {
    id: 'ls-ending-witness-protect',
    type: 'beat',
    title: 'The Weight',
    requires: { 'ls-cp-1': 'witness', 'ls-cp-2': 'protect' },
    sceneImagePrompt: SCENES.protect,
    arcBrief: 'The protagonist buries the truth. Tells Noor that Karim was in trouble, that he left to protect her, that he\'s alive somewhere safe. All true. None of the ugly details. Noor accepts it with the quiet devastation of someone who suspected all along. The protagonist walks home alone in the rain, carrying the USB drive they\'ll never hand over. Karim\'s secret dies with them. End with the loneliness of carrying someone else\'s truth — the case is closed, but the protagonist is heavier for it.',
  },

  // ── Reveal ──
  {
    id: 'ls-reveal',
    type: 'reveal',
    title: 'Your Story',
    sceneImagePrompt: SCENES.reveal,
  },
]
