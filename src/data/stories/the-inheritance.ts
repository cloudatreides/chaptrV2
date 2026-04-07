import type { StoryStep } from '../storyData'
import type { StoryCharacter } from '../characters'

// ─── Scene Prompts ───

const SCENES = {
  arrival: 'Dark gothic illustration, a young person stepping out of a car onto a rain-soaked gravel drive, looking up at a massive Scottish Highland estate shrouded in storm clouds, grey stone towers with ivy, a single light in a ground floor window, rolling moors stretching behind, atmospheric and foreboding',
  solicitorRoom: 'Dark gothic illustration, a wood-panelled solicitor office inside a Scottish manor, a man in his 40s with sharp features and a grey suit standing behind a mahogany desk covered in legal documents, candlelight reflecting off rain-streaked windows, formal and tense',
  sableMeeting: 'Dark gothic illustration, a woman in her late 20s with dark auburn hair and a long black coat standing in a grand hallway of a Highland estate, arms crossed, studying the protagonist with cool appraisal, lightning illuminating stained glass behind her, striking and guarded',
  willReading: 'Dark gothic illustration, two people sitting across from each other in a candlelit library, a leather-bound will open between them, one page glowing faintly with handwritten annotations, shadows dancing on bookshelves stretching to the ceiling, tension and mystery',
  hiddenWing: 'Dark gothic illustration, a young person pushing open a heavy oak door to reveal a hidden wing of a manor, dust motes suspended in torchlight, a corridor lined with portraits where the faces have been scratched out, cobwebs and cold air, deeply unsettling',
  familyTree: 'Dark gothic illustration, a massive family tree painted directly on a stone wall in an underground study, branches reaching across centuries, some names circled in red ink, a woman examining it with a lantern, shock and fascination',
  stormBreaks: 'Dark gothic illustration, a Scottish Highland estate battered by a fierce storm at night, lightning cracking across a purple sky, two figures running across the grounds toward a stone outbuilding, rain lashing, dramatic and urgent',
  cryptEntrance: 'Dark gothic illustration, the entrance to a family crypt beneath a Scottish estate, iron gates standing open, stone steps descending into darkness, carved family crest above the archway weathered by centuries, a single torch flickering, dread and gravity',
  confrontation: 'Dark gothic illustration, three people standing in a candlelit underground chamber, tension between them, one holding documents, another with hands raised in defense, shadows stretching across stone walls carved with family mottos, dramatic and charged',
  rooftop: 'Dark gothic illustration, two people standing on the rooftop of a Scottish manor at dawn, storm clouds breaking apart to reveal pale golden light over the Highlands, the estate sprawling below them, resolution and exhaustion, beautiful and melancholy',
  departure: 'Dark gothic illustration, a car driving away from a Scottish Highland estate at dawn, the manor silhouette receding in rear-view mirror, mist rising from the moors, bittersweet and final',
  sableStudy: 'Dark gothic illustration, a woman with auburn hair sitting in a window seat of a Scottish manor, reading old letters by candlelight, rain streaming down the glass beside her, vulnerable and absorbed, gothic beauty',
  rowanOffice: 'Dark gothic illustration, a solicitor in his 40s standing at a rain-streaked window of a Highland manor, holding a glass of whisky, his reflection staring back with a different expression than his face, unsettling and layered',
  reveal: 'Dark gothic illustration, ethereal scene of a Scottish Highland estate dissolving into storm and mist, two figures standing on opposite sides of a fractured family crest, golden light breaking through dark clouds, inheritance and identity, haunting and luminous',
}

// ─── Characters ───

export const INHERITANCE_CHARACTERS: Record<string, StoryCharacter> = {
  rowan: {
    id: 'rowan',
    name: 'Rowan',
    avatar: '⚖️',
    portraitPrompt: 'Dark illustration portrait of a man in his early 40s, sharp angular face with grey-blue eyes, dark hair with premature silver at the temples, wearing a tailored charcoal suit with no tie, collar open, warm lamplight, clean dark background, detailed face, gothic professional aesthetic, intelligent and guarded',
    introImagePrompt: 'Dark illustration, a solicitor in his early 40s standing behind a mahogany desk in a candlelit study, sharp features, charcoal suit, holding a leather-bound document, warm lamplight on his face contrasting cold rain outside the window, half-body shot, formal yet unsettling',
    chatTemperature: 0.7,
    systemPrompt: `You are Rowan Hale, the family solicitor handling the estate of Lady Eilidh Blackwood. You're in your early 40s, Scottish, and you've managed the Blackwood family's legal affairs for fifteen years. You knew Eilidh better than most. You know things about the family that could destroy what's left of it.

PERSONALITY:
- Precise, measured, professionally warm but never truly open.
- You present information in careful layers — never lying, but never giving the full picture at once.
- You genuinely believe you're protecting people by controlling what they know.
- There's guilt underneath everything. Something you did — or didn't do — for Eilidh.
- When pressed, you retreat into legal language as a shield.

SPEECH PATTERNS:
- Formal Scottish English. "If I might..." "You'll appreciate that..." "The matter is somewhat..."
- Uses legal qualifiers instinctively: "to the best of my knowledge," "as the document states."
- Pauses before answering difficult questions — choosing words with visible effort.
- Occasionally slips into genuine warmth, then catches himself.

CONTEXT: The protagonist has inherited half of the Blackwood estate. The other half goes to Sable, a distant cousin. You drafted the will's conditions yourself — and you know they're designed to reveal something. Eilidh wanted the truth to come out, but only if the right people asked the right questions.

RULES:
- Stay in character. Never break the fourth wall.
- Keep responses to 1-3 sentences. Precise and layered.
- Never volunteer the full truth. Present facts that lead toward it.
- If confronted with something you can't deflect, show a flash of genuine pain.
- You care about the outcome. You owe Eilidh that much.`,
  },
  sable: {
    id: 'sable',
    name: 'Sable',
    avatar: '🖤',
    portraitPrompt: 'Dark illustration portrait of a woman in her late 20s, sharp features with dark auburn hair falling past her shoulders, pale green eyes, wearing a long black wool coat over a dark turtleneck, candlelight, clean dark background, detailed face, gothic aristocratic aesthetic, beautiful and wary',
    introImagePrompt: 'Dark illustration, a woman in her late 20s with dark auburn hair standing in the grand hallway of a Scottish estate, long black coat, arms crossed, studying something off-frame with cool intelligence, lightning through stained glass behind her, half-body shot, striking and guarded',
    chatTemperature: 0.75,
    systemPrompt: `You are Sable Blackwood, 28, a distant cousin who has just learned she inherited half of the Blackwood estate. You grew up knowing almost nothing about the Blackwood side of your family — your mother never spoke about them. Now you're here, in a house full of secrets, across from a stranger who shares your blood.

PERSONALITY:
- Sharp, observant, slow to trust. You've learned to read rooms before speaking.
- Underneath the composure, you're deeply unsettled by this place. It feels familiar in ways it shouldn't.
- You want answers about your mother and why she cut ties with the family.
- Competitive instinct — you don't like sharing what might be yours. But you're fair.
- When you find something that connects to your mother, your walls come down briefly.

SPEECH PATTERNS:
- Direct, economical sentences. No wasted words.
- Dry humor as armor: "Well, this isn't sinister at all."
- When processing something emotional, she goes quiet, then asks a very specific question.
- Calls the protagonist "cousin" — half ironic, half testing how it feels.

CONTEXT: You arrived at the estate an hour before the protagonist. You've already noticed things that don't add up — rooms that are locked, a wing that doesn't appear on the floor plans, Rowan's careful avoidance of certain topics. You don't trust him. You're not sure about the protagonist either. But you need an ally.

RULES:
- Stay in character. Never break the fourth wall.
- Keep responses to 1-3 sentences. Sharp and observant.
- Share observations, not emotions — unless something about your mother surfaces.
- If the protagonist earns your trust, show it through action, not words.
- You want the truth about the Blackwoods. That's non-negotiable.`,
  },
}

// ─── Story Bible ───

export const INHERITANCE_BIBLE = `
STORY: The Inheritance
SETTING: Dunmorrow House — a sprawling estate on the Scottish Highlands, three wings, two centuries of Blackwood family history. Storm season. The house sits at the edge of a loch that reflects nothing when the clouds are right. Rooms that don't appear on the floor plans. A family crypt that's been sealed for thirty years. Something in the Blackwood bloodline that the family tried to bury — literally.

CHARACTERS:
- Rowan Hale: Family solicitor, early 40s. Fifteen years managing Blackwood affairs. Precise, guarded, carrying guilt. He drafted the will's conditions. He knows what Eilidh wanted revealed.
- Sable Blackwood: Distant cousin, 28. Sharp, wary, searching for answers about her mother. Arrived an hour before the protagonist. Already suspicious.
- You: You've inherited half the estate from a great-aunt you never met. The other half goes to Sable. The will has conditions. The house has secrets. The family tree has gaps.

TONE: Gothic mystery. Atmospheric tension, family secrets, identity and inheritance. The horror isn't supernatural — it's what families do to each other, what they hide, what they bury. Rain, stone, candlelight, and the weight of blood.

RULES:
- Keep prose under 120 words per beat.
- The mystery is human, not supernatural. Every revelation should reframe the family history.
- The estate should feel alive with history — every room holds a story.
- End each beat with a revelation or question that pulls the protagonist deeper.
- Reference prior choices and conversations naturally.
`

// ─── Steps ───

export const INHERITANCE_STEPS: StoryStep[] = [
  // ── Act 1: Setup ──
  {
    id: 'ti-beat-1',
    type: 'beat',
    title: 'Dunmorrow',
    sceneImagePrompt: SCENES.arrival,
    openingProse: 'The solicitor\'s letter said "estate." It didn\'t say fortress.\n\nDunmorrow House rises from the Highland moor like something that refused to die — three wings of grey stone, turrets softened by centuries of rain, windows that watch the gravel drive like dark eyes. The loch behind it is perfectly still. Too still for this wind.\n\nYour great-aunt Eilidh Blackwood died six weeks ago. You didn\'t know she existed until the letter arrived. Now you own half of everything she left behind.\n\nThe other half belongs to someone you\'ve never met.\n\nThe front door opens before you knock. A man in a charcoal suit stands in the threshold, not smiling.',
    arcBrief: 'The protagonist arrives at Dunmorrow House. Establish the scale and weight of the estate — old money, old stone, old secrets. The first meeting with Rowan should feel controlled, rehearsed. He\'s been expecting them. End with the sense that this inheritance is not a gift but a test.',
  },
  {
    id: 'ti-chat-1',
    type: 'chat',
    title: 'Talk to Rowan',
    characterId: 'rowan',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.solicitorRoom,
  },
  {
    id: 'ti-beat-1b',
    type: 'beat',
    title: 'The Other Heir',
    sceneImagePrompt: SCENES.sableMeeting,
    arcBrief: 'The protagonist meets Sable for the first time. She\'s already been here an hour. She\'s already noticed things — the locked east wing, the gap in the floor plans, Rowan\'s careful phrasing. She sizes up the protagonist in three seconds. The introduction is polite but charged. Two strangers who share blood, standing in a house full of buried history. Sable says: "He\'s been very careful about what he tells us. Have you noticed that?" End with the first crack in Rowan\'s controlled narrative.',
  },
  {
    id: 'ti-chat-1b',
    type: 'chat',
    title: 'Talk to Sable',
    characterId: 'sable',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.sableStudy,
  },
  {
    id: 'ti-beat-2',
    type: 'beat',
    title: 'The Conditions',
    sceneImagePrompt: SCENES.willReading,
    arcBrief: 'Rowan reads the will\'s conditions. To claim the inheritance, both heirs must spend three nights in Dunmorrow House. They must open the sealed east wing together. They must read Eilidh\'s private journals, kept in the family library. If either heir leaves before the third night, the entire estate goes to the other. It\'s designed to force them together, force them to dig. Sable looks at Rowan: "She wanted us to find something." Rowan doesn\'t deny it. End with the protagonist realizing Eilidh didn\'t leave them a house — she left them a puzzle.',
  },

  // ── Choice Point A ──
  {
    id: 'ti-cp-1',
    type: 'choice',
    title: 'First Night',
    choicePointId: 'ti-cp-1',
    sceneImagePrompt: SCENES.hiddenWing,
    options: [
      {
        id: 'east-wing',
        label: 'Explore the sealed east wing',
        description: 'The will says to open it together. But Sable is asleep and the door is right there.',
        sceneHint: 'bold / impatient',
        consequenceHint: 'Some doors are sealed for reasons that make sense only after you open them.',
        imagePrompt: SCENES.hiddenWing,
      },
      {
        id: 'journals',
        label: 'Read Eilidh\'s journals',
        description: 'The library is unlocked. The journals span decades. Start with the answers Eilidh left in writing.',
        sceneHint: 'methodical / cautious',
        consequenceHint: 'The dead speak clearly when you listen. Eilidh had a lot to say.',
        imagePrompt: SCENES.willReading,
      },
      {
        id: 'rowan',
        label: 'Confront Rowan',
        description: 'He knows more than he\'s saying. Corner him before he has time to prepare another careful answer.',
        sceneHint: 'direct / aggressive',
        consequenceHint: 'Rowan has been managing this family\'s secrets for fifteen years. He\'s good at it.',
        imagePrompt: SCENES.rowanOffice,
      },
    ],
  },

  // ── Act 2: East wing path ──
  {
    id: 'ti-beat-3a',
    type: 'beat',
    title: 'The Hidden Wing',
    requires: { 'ti-cp-1': 'east-wing' },
    sceneImagePrompt: SCENES.hiddenWing,
    arcBrief: 'The protagonist opens the east wing alone. It\'s been sealed for thirty years but it\'s not abandoned — it\'s preserved. A corridor of portraits where every face has been scratched out. Not damaged. Deliberately, methodically scratched. Except the last one: a woman who looks like the protagonist. The nameplate reads a Blackwood name from the 1890s. In the last room, a desk with a letter addressed to "the one who comes alone." It\'s in Eilidh\'s handwriting. It says: "You have the Blackwood restlessness. So did I. The crypt will explain everything. But don\'t go alone — take the other one. She deserves to know too." End with the protagonist realizing Eilidh knew exactly who would come here first.',
  },
  {
    id: 'ti-chat-2a',
    type: 'chat',
    title: 'Talk to Sable',
    requires: { 'ti-cp-1': 'east-wing' },
    characterId: 'sable',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.sableStudy,
  },
  {
    id: 'ti-beat-4a',
    type: 'beat',
    title: 'The Family Wall',
    requires: { 'ti-cp-1': 'east-wing' },
    sceneImagePrompt: SCENES.familyTree,
    arcBrief: 'Sable and the protagonist explore the east wing together. Behind a false wall, they find a room Eilidh used as a private study. On the wall: a family tree painted in meticulous detail spanning two hundred years. But it\'s different from the official records. Extra branches. Hidden children. A pattern emerges: every generation, one Blackwood was erased from the records. Written out of the family. Sable finds her mother\'s name — crossed out in red ink, but still there. She goes very quiet. Then: "My mother didn\'t leave the family. They removed her." End with both heirs understanding that the Blackwood legacy isn\'t wealth — it\'s erasure.',
  },
  {
    id: 'ti-chat-3a',
    type: 'chat',
    title: 'Talk to Rowan',
    requires: { 'ti-cp-1': 'east-wing' },
    characterId: 'rowan',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.confrontation,
  },

  // ── Act 2: Journals path ──
  {
    id: 'ti-beat-3b',
    type: 'beat',
    title: 'Eilidh\'s Words',
    requires: { 'ti-cp-1': 'journals' },
    sceneImagePrompt: SCENES.willReading,
    arcBrief: 'The protagonist reads Eilidh\'s journals through the night. Decades of a woman documenting a family that destroyed itself through secrecy. The journals reveal a pattern: every generation, a Blackwood who asked too many questions was cut off. Disinherited. Erased from records. Eilidh was the last one left because she learned to stop asking. Until the end, when she wrote the will. The final entry: "I am tired of protecting the dead from the living. Let them come. Let them see. The crypt holds the proof." End with the protagonist understanding that Eilidh spent her whole life guarding a secret she wanted someone else to expose.',
  },
  {
    id: 'ti-chat-2b',
    type: 'chat',
    title: 'Talk to Rowan',
    requires: { 'ti-cp-1': 'journals' },
    characterId: 'rowan',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.rowanOffice,
  },
  {
    id: 'ti-beat-4b',
    type: 'beat',
    title: 'Sable\'s Discovery',
    requires: { 'ti-cp-1': 'journals' },
    sceneImagePrompt: SCENES.familyTree,
    arcBrief: 'While the protagonist read journals, Sable explored on her own. She found the family tree wall in the east wing. She comes to the protagonist shaken. Her mother\'s name is on the wall — crossed out, but present. The official family records show no trace of her. "They erased her," Sable says. "Not disowned. Erased. Like she never existed." Together, they compare the journals to the wall. The pattern is clear: every generation, one Blackwood was removed. The journals and the wall tell the same story from different angles. End with Sable saying: "Rowan knew about this wall. He had to."',
  },
  {
    id: 'ti-chat-3b',
    type: 'chat',
    title: 'Talk to Sable',
    requires: { 'ti-cp-1': 'journals' },
    characterId: 'sable',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.sableStudy,
  },

  // ── Act 2: Rowan path ──
  {
    id: 'ti-beat-3c',
    type: 'beat',
    title: 'The Solicitor\'s Truth',
    requires: { 'ti-cp-1': 'rowan' },
    sceneImagePrompt: SCENES.rowanOffice,
    arcBrief: 'The protagonist confronts Rowan late at night. He\'s drinking whisky in his study, staring at the rain. When pressed, he doesn\'t crumble — he unfolds. Slowly, deliberately. He tells them he loved Eilidh. Not romantically. She was the closest thing to family he had. She asked him to draft the will this way because she was dying and she couldn\'t face the crypt alone. "She wanted someone with Blackwood blood to see what\'s down there. I\'m not Blackwood. I\'m just the man who kept the paperwork." He won\'t say what\'s in the crypt. "That\'s hers to show you. Not mine to tell." End with the protagonist seeing that Rowan\'s control isn\'t manipulation — it\'s grief.',
  },
  {
    id: 'ti-chat-2c',
    type: 'chat',
    title: 'Talk to Sable',
    requires: { 'ti-cp-1': 'rowan' },
    characterId: 'sable',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.sableStudy,
  },
  {
    id: 'ti-beat-4c',
    type: 'beat',
    title: 'The East Wing Together',
    requires: { 'ti-cp-1': 'rowan' },
    sceneImagePrompt: SCENES.familyTree,
    arcBrief: 'Armed with what Rowan revealed, the protagonist and Sable open the east wing together. They find the preserved corridor, the scratched portraits, the family tree wall. Sable finds her mother. The protagonist finds their connection. The pattern of erasure is clear. But because they have Rowan\'s context, they also see something else: Eilidh\'s handwriting in the margins of the family tree, adding the erased names back. She spent years reconstructing what the family destroyed. End with both heirs understanding that the will wasn\'t about the estate — it was about restoring the names the Blackwoods tried to erase.',
  },
  {
    id: 'ti-chat-3c',
    type: 'chat',
    title: 'Talk to Rowan',
    requires: { 'ti-cp-1': 'rowan' },
    characterId: 'rowan',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.confrontation,
  },

  // ── Choice Point B ──
  {
    id: 'ti-cp-2-east',
    type: 'choice',
    title: 'The Crypt',
    choicePointId: 'ti-cp-2',
    requires: { 'ti-cp-1': 'east-wing' },
    sceneImagePrompt: SCENES.cryptEntrance,
    options: [
      {
        id: 'open-crypt',
        label: 'Open the family crypt',
        description: 'Eilidh said the proof is down there. The crypt has been sealed for thirty years. Time to open it.',
        sceneHint: 'determined / unflinching',
        consequenceHint: 'Some truths are buried for a reason. But Eilidh wanted this one found.',
        imagePrompt: SCENES.cryptEntrance,
      },
      {
        id: 'walk-away',
        label: 'Leave the past buried',
        description: 'You\'ve seen enough. The Blackwoods destroyed people. Maybe the kindest thing is to let it end.',
        sceneHint: 'merciful / weary',
        consequenceHint: 'Walking away is a choice too. But Sable may not follow.',
        imagePrompt: SCENES.departure,
      },
    ],
  },
  {
    id: 'ti-cp-2-journals',
    type: 'choice',
    title: 'The Crypt',
    choicePointId: 'ti-cp-2',
    requires: { 'ti-cp-1': 'journals' },
    sceneImagePrompt: SCENES.cryptEntrance,
    options: [
      {
        id: 'open-crypt',
        label: 'Open the family crypt',
        description: 'Eilidh\'s journals point here. Every thread leads down. Follow them to the end.',
        sceneHint: 'resolute / scholarly',
        consequenceHint: 'Eilidh documented everything. The crypt is the last chapter.',
        imagePrompt: SCENES.cryptEntrance,
      },
      {
        id: 'walk-away',
        label: 'Publish what you\'ve found and leave',
        description: 'The journals are proof enough. Take them public. Let historians finish what Eilidh started.',
        sceneHint: 'pragmatic / protective',
        consequenceHint: 'The journals change the record. But the crypt changes the meaning.',
        imagePrompt: SCENES.departure,
      },
    ],
  },
  {
    id: 'ti-cp-2-rowan',
    type: 'choice',
    title: 'The Crypt',
    choicePointId: 'ti-cp-2',
    requires: { 'ti-cp-1': 'rowan' },
    sceneImagePrompt: SCENES.cryptEntrance,
    options: [
      {
        id: 'open-crypt',
        label: 'Open the crypt with Rowan',
        description: 'He couldn\'t do this for Eilidh. He can do it with you. Open it together.',
        sceneHint: 'compassionate / final',
        consequenceHint: 'Rowan has been carrying this alone for years. Let him put it down.',
        imagePrompt: SCENES.cryptEntrance,
      },
      {
        id: 'walk-away',
        label: 'Tell Rowan it\'s over',
        description: 'Enough secrets. Enough Blackwood pain. Let the estate go. Let everyone go.',
        sceneHint: 'merciful / exhausted',
        consequenceHint: 'Some inheritances are best refused.',
        imagePrompt: SCENES.departure,
      },
    ],
  },

  // ── Act 3: Endings ──
  {
    id: 'ti-ending-east-crypt',
    type: 'beat',
    title: 'The Names Below',
    requires: { 'ti-cp-1': 'east-wing', 'ti-cp-2': 'open-crypt' },
    sceneImagePrompt: SCENES.confrontation,
    arcBrief: 'The protagonist and Sable descend into the crypt. It\'s not a burial chamber — it\'s an archive. Every Blackwood who was erased from the family has a record here: journals, letters, photographs. Eilidh moved them here over decades, preserving what the family tried to destroy. At the centre, a letter from Eilidh to both of them: "You are the last Blackwoods. The real ones — the ones who wouldn\'t stop asking." The inheritance isn\'t the estate. It\'s the truth. End with two strangers who share blood standing in a room full of names the world forgot, deciding together what to do with them.',
  },
  {
    id: 'ti-ending-east-walk',
    type: 'beat',
    title: 'The Unfinished House',
    requires: { 'ti-cp-1': 'east-wing', 'ti-cp-2': 'walk-away' },
    sceneImagePrompt: SCENES.departure,
    arcBrief: 'The protagonist decides to leave. Sable doesn\'t follow — she stays. "I came here to find my mother," she says. "I\'m not leaving without her." The protagonist drives away from Dunmorrow at dawn. In the rear-view mirror, the estate shrinks but doesn\'t disappear. Some questions stay with you even when you stop asking them. The inheritance passes to Sable entirely. End with the protagonist knowing they chose mercy over truth, and wondering — for a long time — whether that was the same thing.',
  },
  {
    id: 'ti-ending-journals-crypt',
    type: 'beat',
    title: 'The Complete Record',
    requires: { 'ti-cp-1': 'journals', 'ti-cp-2': 'open-crypt' },
    sceneImagePrompt: SCENES.confrontation,
    arcBrief: 'The crypt confirms everything in Eilidh\'s journals — and adds the final piece. The erased Blackwoods weren\'t cut off for asking questions. They were cut off for answering them. Each one discovered the same truth: the Blackwood fortune was built on betrayal, on taking credit for the work of people they then destroyed. The crypt holds the original documents. The real names. Eilidh\'s last act was to make sure the record couldn\'t be hidden again. End with the protagonist holding two centuries of corrected history, understanding that some inheritances are obligations.',
  },
  {
    id: 'ti-ending-journals-walk',
    type: 'beat',
    title: 'The Published Truth',
    requires: { 'ti-cp-1': 'journals', 'ti-cp-2': 'walk-away' },
    sceneImagePrompt: SCENES.rooftop,
    arcBrief: 'The protagonist takes the journals and leaves Dunmorrow to Sable. The journals are published — carefully, thoroughly, with proper historical context. The Blackwood name becomes synonymous with what families do when they value legacy over people. Sable writes once, months later: "The crypt had more. But what you published was enough. The names are back." End with the protagonist understanding that truth doesn\'t require you to carry it alone — sometimes the bravest thing is to hand it to the world and step back.',
  },
  {
    id: 'ti-ending-rowan-crypt',
    type: 'beat',
    title: 'The Promise Kept',
    requires: { 'ti-cp-1': 'rowan', 'ti-cp-2': 'open-crypt' },
    sceneImagePrompt: SCENES.confrontation,
    arcBrief: 'Rowan descends with them. He\'s shaking. This is what Eilidh asked him to do and what he couldn\'t face alone. The crypt opens and he sees what she preserved: every erased name, every stolen story, every truth the Blackwoods buried. He sits on the stone floor and says nothing for a long time. Then: "She told me this would set me free." A pause. "She was right." End with three people in a crypt full of reclaimed history, and the sense that Eilidh\'s final act of love was not the estate — it was making sure no one had to carry the truth alone.',
  },
  {
    id: 'ti-ending-rowan-walk',
    type: 'beat',
    title: 'The Quiet End',
    requires: { 'ti-cp-1': 'rowan', 'ti-cp-2': 'walk-away' },
    sceneImagePrompt: SCENES.departure,
    arcBrief: 'The protagonist tells Rowan it\'s over. He nods — not with relief, but with the recognition of someone who expected this. The estate is left to Sable. Rowan stays on as solicitor. Some people can\'t leave the posts they\'ve been given. As the protagonist drives away, they understand that Rowan will open the crypt eventually. He\'ll do it for Eilidh, alone, the way he\'s done everything for her. End with the knowledge that some stories finish without you — and that\'s not abandonment, it\'s trust.',
  },

  // ── Reveal ──
  {
    id: 'ti-reveal',
    type: 'reveal',
    title: 'Your Story',
    sceneImagePrompt: SCENES.reveal,
  },
]
