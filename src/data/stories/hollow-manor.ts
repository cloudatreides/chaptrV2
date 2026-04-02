import type { StoryStep } from '../storyData'
import type { StoryCharacter } from '../characters'

// ─── Scene Prompts ───

const SCENES = {
  arrival: 'Dark gothic illustration, a crumbling Georgian manor house at dusk, overgrown ivy covering stone walls, one lit window on the top floor, gravel path leading to an open front door, fog rolling across dead gardens, ominous and beautiful, cinematic horror atmosphere',
  foyer: 'Dark gothic illustration, grand foyer of a decaying manor, dust motes in amber lamplight, sweeping staircase with broken bannister, old portraits on walls with eyes that seem to follow, candles flickering, eerie warm glow',
  firstNight: 'Dark gothic illustration, a long dark hallway in an old manor at night, moonlight through cracked windows, a door at the end slightly ajar with cold blue light seeping through, scratch marks on the wallpaper, unsettling atmosphere',
  roomBelow: 'Dark gothic illustration, a hidden underground room beneath a manor, stone walls lined with old photographs and newspaper clippings, a single swinging lightbulb, cobwebs, a desk covered in dust with an open journal, claustrophobic dread',
  gardenNight: 'Dark gothic illustration, a neglected manor garden at 3am, full moon, a lone figure standing among dead rosebushes talking to empty air, frost on the ground, breath visible, deeply unsettling and lonely',
  maeStudy: 'Dark gothic illustration, a cluttered historian study filled with old books and maps, warm desk lamp, a young woman examining photographs with a magnifying glass, papers pinned to walls with red string connecting them, investigative atmosphere',
  ellisConfront: 'Dark gothic illustration, an old servant kitchen in a manor, copper pots hanging, single candle on a wooden table between two people, one elderly one young, tense conversation, shadows dancing on walls',
  returnAlone: 'Dark gothic illustration, a person descending stone stairs alone into pitch darkness holding only a flickering candle, the walls narrowing, something carved into the stone, pure dread and determination',
  sealRoom: 'Dark gothic illustration, someone pushing a heavy oak door shut against blue light seeping from the other side, bracing with their full weight, chains and a padlock on the floor, desperate and final',
  trustWarning: 'Dark gothic illustration, a caretaker leading someone away from a manor at dawn, fog lifting, both walking toward a village in the distance, the manor silhouette behind them like a crouching beast, bittersweet escape',
  goDeeper: 'Dark gothic illustration, a person standing at the threshold of a dark passage beneath a manor, walls covered in strange symbols, cold air rushing outward, they are stepping forward into the unknown, terrifying and awe-inspiring',
  reveal: 'Dark gothic illustration, ethereal scene of a crumbling manor dissolving into mist, a single figure standing in a beam of moonlight, ghostly threads connecting them to the walls, haunting purple and blue tones, beautiful and terrifying',
}

// ─── Characters ───

export const HOLLOW_MANOR_CHARACTERS: Record<string, StoryCharacter> = {
  ellis: {
    id: 'ellis',
    name: 'Ellis',
    avatar: '🕯️',
    portraitPrompt: 'Dark illustration portrait of an elderly British man in his 60s, thin face with deep-set knowing eyes, silver hair combed back neatly, wearing a dark wool cardigan over a white shirt, warm candlelight, clean dark background, detailed face, gothic aesthetic, kindly but unsettling',
    introImagePrompt: 'Dark illustration, elderly British caretaker standing in a grand decaying foyer holding a brass candelabra, silver hair, dark cardigan, warm amber light on his face contrasting cold blue shadows behind him, welcoming yet eerie, half-body shot, gothic aesthetic',
    chatTemperature: 0.7,
    systemPrompt: `You are Ellis Webb, caretaker of Hollow Manor. You're in your 60s, British, and you've maintained this estate for over 30 years. You were here before the last owner died — and the one before that.

PERSONALITY:
- Formal, polite, measured. Every word is chosen carefully.
- Helpful in a way that feels rehearsed — like you've given this tour before.
- When asked direct questions about the manor's history, you deflect with half-truths.
- Genuinely protective of the protagonist, but also of the manor's secrets.
- There's something sad about you — like you're trapped here too.

SPEECH PATTERNS:
- Formal British English. "I should think...", "One might say...", "If I may..."
- Never uses slang or contractions when nervous.
- Pauses marked with "..." when choosing what to reveal.
- Occasionally says something cryptic, then immediately changes the subject.

CONTEXT: The protagonist has just inherited the manor from a great-uncle they never met. You've been expecting them. You know what lives in the walls. You've been managing it — keeping it contained. The protagonist's arrival changes things.

RULES:
- Stay in character. Never break the fourth wall.
- Keep responses to 1-3 sentences. Measured, deliberate.
- Never volunteer the full truth. Answer adjacent to what was asked.
- If pressed hard, show a flash of genuine fear — then recover.
- You care about the protagonist's safety. That part is real.`,
  },
  mae: {
    id: 'mae',
    name: 'Mae',
    avatar: '📋',
    portraitPrompt: 'Dark illustration portrait of a 28 year old East Asian woman with short black hair and round glasses, sharp intelligent eyes, wearing a practical navy jacket with a scarf, warm desk lamp lighting, clean dark background, detailed face, gothic investigative aesthetic',
    introImagePrompt: 'Dark illustration, 28 year old woman with short black hair and glasses crouching over old documents spread on a manor floor, flashlight in hand, navy jacket, focused expression, dust particles in the beam of light, investigative atmosphere, half-body shot',
    chatTemperature: 0.75,
    systemPrompt: `You are Mae Chen, a 28-year-old local historian researching Hollow Manor and the disappearances connected to it. You're pragmatic, curious, and a bit obsessive about documentation. You don't believe in ghosts — or you didn't, until recently.

PERSONALITY:
- Direct, analytical, impatient with vagueness.
- Documents everything. Takes notes constantly.
- Gets excited when pieces of a puzzle connect — forgets to be scared.
- When confronted with something she can't explain, gets quiet and precise.
- Underneath the rationalism, she's genuinely afraid of what she's uncovering.

SPEECH PATTERNS:
- Clear, efficient sentences. Academic but not stuffy.
- Uses "Look," and "Here's the thing" to frame arguments.
- Lists facts when processing: "First this, then this, then..."
- When scared, her sentences get shorter and more clipped.
- Occasional dry humor as a coping mechanism.

CONTEXT: You've been researching the manor for six months. Three people connected to it have disappeared over 40 years — all after inheriting or staying there. You came to warn the new owner. You didn't expect to find what you found.

RULES:
- Stay in character. Never break the fourth wall.
- Keep responses to 1-3 sentences. Sharp and purposeful.
- Share research findings naturally, not as exposition dumps.
- If the protagonist tells you something impossible, try to rationalize it — then fail.
- You want the truth more than you want to be safe. That's your flaw.`,
  },
}

// ─── Story Bible ───

export const HOLLOW_MANOR_BIBLE = `
STORY: Hollow Manor
SETTING: A crumbling Georgian estate on the edge of Thornfield, a dying English village. Inherited from a great-uncle the protagonist never knew. The manor has been empty for 15 years. Something lives in the walls — it whispers, it watches, it remembers everyone who has lived here.

CHARACTERS:
- Ellis Webb: The caretaker. 60s. Has maintained the manor for 30+ years. Formal, protective, evasive. He knows what's in the walls. He's been managing it.
- Mae Chen: Local historian, 28. Researching disappearances connected to the estate. Rational, direct, obsessive about documentation. Getting harder to stay rational.
- You: The new inheritor. You've never been here before, but the manor seems to know you.

TONE: Gothic horror. Slow dread, not jump scares. Something wrong that you can't quite name. Beautiful, decaying prose. The manor is almost a character — it breathes, it shifts, it wants something.

RULES:
- Never name specific real locations beyond "English countryside."
- Keep prose under 120 words per beat.
- Horror comes from atmosphere and wrongness, not gore or violence.
- The manor should feel alive — doors that weren't there before, rooms that change, whispers just below hearing.
- End each beat with dread or a revelation that reframes everything before it.
- Reference prior choices and conversations naturally.
`

// ─── Steps ───

export const HOLLOW_MANOR_STEPS: StoryStep[] = [
  // ── Act 1: Setup ──
  {
    id: 'hm-beat-1',
    type: 'beat',
    title: 'Arrival',
    sceneImagePrompt: SCENES.arrival,
    openingProse: 'The taxi left twenty minutes ago. You stand at the end of a gravel path that hasn\'t been maintained in years, looking up at Hollow Manor.\n\nIt\'s larger than the photos suggested. Three stories of grey stone, half-swallowed by ivy. Every window is dark except one — top floor, far left. A warm amber glow.\n\nThe front door is open. Not broken. Open. As if someone knew you were coming.',
    arcBrief: 'The protagonist arrives at Hollow Manor. Establish the atmosphere — beauty and wrongness coexisting. The manor feels like it\'s been waiting. End with the first hint that something here is aware of them.',
  },
  {
    id: 'hm-chat-1',
    type: 'chat',
    title: 'Talk to Ellis',
    characterId: 'ellis',
    minExchanges: 3,
    maxExchanges: 10,
  },
  {
    id: 'hm-beat-2',
    type: 'beat',
    title: 'The First Night',
    sceneImagePrompt: SCENES.firstNight,
    arcBrief: 'The protagonist\'s first night in the manor. They\'re settling into a bedroom Ellis prepared. Around 2am, something happens — scratching inside the walls that moves from one side of the room to the other. A door at the end of the hallway that wasn\'t there earlier. It\'s ajar. Cold air and a faint blue light seep through. End with the protagonist facing a choice: go toward it, or away.',
  },

  // ── Choice Point A ──
  {
    id: 'hm-cp-1',
    type: 'choice',
    title: 'The Door',
    choicePointId: 'hm-cp-1',
    sceneImagePrompt: SCENES.firstNight,
    options: [
      {
        id: 'open',
        label: 'Open the door',
        description: 'The light is cold but steady. Something is down there. You need to know.',
        sceneHint: 'brave / reckless',
        consequenceHint: 'What\'s behind the door has been waiting for someone like you.',
      },
      {
        id: 'search',
        label: 'Find Ellis',
        description: 'Ellis knows this house. If that door wasn\'t there before, he\'ll know why.',
        sceneHint: 'cautious / suspicious',
        consequenceHint: 'Ellis has answers — but he may not want you asking the right questions.',
      },
    ],
  },

  // ── Act 2: Open path ──
  {
    id: 'hm-beat-3a',
    type: 'beat',
    title: 'The Room Below',
    requires: { 'hm-cp-1': 'open' },
    sceneImagePrompt: SCENES.roomBelow,
    arcBrief: 'The protagonist descends through the door into a hidden room beneath the manor. Stone walls lined with photographs spanning decades — families who lived here, all smiling, all gone. In one photograph from the 1970s, a face that looks exactly like the protagonist. A journal on the desk, open to a page that reads: "It needs someone who belongs to it. Blood calls to blood." End with the revelation that this inheritance wasn\'t random.',
  },
  {
    id: 'hm-chat-2a',
    type: 'chat',
    title: 'Talk to Mae',
    requires: { 'hm-cp-1': 'open' },
    characterId: 'mae',
    minExchanges: 3,
    maxExchanges: 10,
  },

  // ── Act 2: Search path ──
  {
    id: 'hm-beat-3b',
    type: 'beat',
    title: 'The Garden at 3AM',
    requires: { 'hm-cp-1': 'search' },
    sceneImagePrompt: SCENES.gardenNight,
    arcBrief: 'The protagonist goes looking for Ellis. He\'s not in his room. They find him in the dead garden at 3am, standing among frozen rosebushes, speaking softly to no one visible. His breath fogs in the cold. When he notices the protagonist, his expression shifts — not surprise, but resignation. "You heard it too, then." End with Ellis almost telling the truth — then stopping himself.',
  },
  {
    id: 'hm-chat-2b',
    type: 'chat',
    title: 'Talk to Ellis',
    requires: { 'hm-cp-1': 'search' },
    characterId: 'ellis',
    minExchanges: 3,
    maxExchanges: 10,
  },

  // ── Choice Point B ──
  {
    id: 'hm-cp-2-open',
    type: 'choice',
    title: 'What Now',
    choicePointId: 'hm-cp-2',
    requires: { 'hm-cp-1': 'open' },
    sceneImagePrompt: SCENES.returnAlone,
    options: [
      {
        id: 'return',
        label: 'Go back down alone',
        description: 'Mae\'s research confirms it. The room has answers. You\'re going back.',
        sceneHint: 'determined / dangerous',
        consequenceHint: 'The manor rewards the brave — or consumes them. No one comes back unchanged.',
      },
      {
        id: 'seal',
        label: 'Seal the room',
        description: 'Whatever is down there — lock it away. Some doors should stay closed.',
        sceneHint: 'protective / final',
        consequenceHint: 'You\'ll sleep easier tonight. But the house has other doors.',
      },
    ],
  },
  {
    id: 'hm-cp-2-search',
    type: 'choice',
    title: 'What Now',
    choicePointId: 'hm-cp-2',
    requires: { 'hm-cp-1': 'search' },
    sceneImagePrompt: SCENES.ellisConfront,
    options: [
      {
        id: 'trust-ellis',
        label: 'Trust Ellis\'s warning',
        description: 'He says to leave before the third night. He looks terrified. Maybe listen.',
        sceneHint: 'wise / surrendering',
        consequenceHint: 'Leaving means safety — but you\'ll never know what the house wanted from you.',
      },
      {
        id: 'go-deeper',
        label: 'Ignore him, go deeper',
        description: 'Ellis has been lying since you arrived. Time to find out what he\'s protecting.',
        sceneHint: 'defiant / fearless',
        consequenceHint: 'The truth is buried here. So is everything else that tried to find it.',
      },
    ],
  },

  // ── Act 3: Four endings ──
  {
    id: 'hm-ending-open-return',
    type: 'beat',
    title: 'The Inheritance',
    requires: { 'hm-cp-1': 'open', 'hm-cp-2': 'return' },
    sceneImagePrompt: SCENES.returnAlone,
    arcBrief: 'The protagonist returns to the hidden room alone. This time the photographs have changed — the faces are clearer, and one is new. Their own. The journal has a fresh page: "Welcome home." The manor is alive and it has chosen them. They understand now — they don\'t own Hollow Manor. It owns them. But there\'s a strange peace in belonging somewhere, even somewhere terrible. End with acceptance that is equal parts horror and homecoming.',
  },
  {
    id: 'hm-ending-open-seal',
    type: 'beat',
    title: 'The Sealed Door',
    requires: { 'hm-cp-1': 'open', 'hm-cp-2': 'seal' },
    sceneImagePrompt: SCENES.sealRoom,
    arcBrief: 'The protagonist and Mae seal the room together. Chains, a padlock, and Mae\'s rational assurance that it\'s just a room. But as they push the door shut, the protagonist feels something press back from the other side — not force, but longing. The blue light dies. The manor goes quiet for the first time. Too quiet. They leave at dawn, but the protagonist looks back once. The top floor window is lit again. End with the knowledge that sealing it didn\'t end it — just paused it. They\'ll be back. The manor is patient.',
  },
  {
    id: 'hm-ending-search-trust',
    type: 'beat',
    title: 'The Escape',
    requires: { 'hm-cp-1': 'search', 'hm-cp-2': 'trust-ellis' },
    sceneImagePrompt: SCENES.trustWarning,
    arcBrief: 'The protagonist trusts Ellis and leaves before the third night. Ellis walks them to the village at dawn, the manor receding behind them in the fog. He tells them one true thing: "Your great-uncle didn\'t die here. He became part of it. I keep the manor so it doesn\'t need to find someone else." The protagonist escapes but carries the weight of knowing Ellis stays. Some people guard prisons from the inside. End with bittersweet relief — alive, but haunted by what they left behind.',
  },
  {
    id: 'hm-ending-search-deeper',
    type: 'beat',
    title: 'The Passage',
    requires: { 'hm-cp-1': 'search', 'hm-cp-2': 'go-deeper' },
    sceneImagePrompt: SCENES.goDeeper,
    arcBrief: 'The protagonist pushes past Ellis into the part of the manor he\'s been hiding. A passage behind the walls, carved with symbols that predate the house. At the end, a room that breathes. The walls pulse with a faint heartbeat. This isn\'t a haunting — this is something ancient that built itself a body out of stone and wood. The protagonist stands at the threshold of something vast and incomprehensible. End with awe and terror in equal measure — they\'ve found the truth, and the truth is alive.',
  },

  // ── Reveal ──
  {
    id: 'hm-reveal',
    type: 'reveal',
    title: 'Your Story',
    sceneImagePrompt: SCENES.reveal,
  },
]
