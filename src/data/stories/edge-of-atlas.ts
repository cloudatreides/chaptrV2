import type { StoryStep } from '../storyData'
import type { StoryCharacter } from '../characters'

// ─── Scene Prompts ───

const SCENES = {
  orvane: 'Epic fantasy concept art, a lone traveller arriving at a rugged frontier settlement carved from red stone, dramatic mountain peaks behind it, a massive carved monolith at the settlement edge covered in ancient glyphs, late afternoon sun, dust in the air, sense of being at the edge of the known world',
  market: 'Epic fantasy concept art, a busy stone-walled market in a frontier settlement, traders and weather-worn explorers, a young person examining an old hand-drawn map with suspicion, warm torchlight and sunset spilling through the archways, detailed and atmospheric',
  zarasCamp: 'Epic fantasy concept art, a lone explorer\'s camp at the edge of a settlement, a large tent with canvas maps pinned to poles, a woman in expedition clothing crouching over a spread of detailed hand-drawn maps, oil lamps glowing, mountain peaks at dusk behind her, detail-rich and purposeful',
  firstRuin: 'Epic fantasy concept art, the first view of ancient ruins emerging from dense jungle, massive stone archways carved with intricate symbols, dappled sunlight through tree canopy, a small group of explorers at the treeline looking in with awe, green and gold light, overwhelming scale',
  glyph: 'Epic fantasy concept art, close view of an ancient stone carving in a jungle ruin, geometric symbols layered in three different script systems, a woman with dark skin and expedition gear crouching to photograph it, a man beside her with an expression of recognition, torchlight, tension',
  chamber: 'Epic fantasy concept art, an enormous underground chamber inside ancient ruins, walls covered floor to ceiling in glyphs and carved relief maps, a beam of light coming from a ceiling opening, two explorers standing in the center looking up in awe, the scale dwarfs them, beautiful and ancient',
  passageDeep: 'Epic fantasy concept art, a narrow carved passage leading downward into old ruins, walls covered in carved symbols that seem to shift in torchlight, a lone figure with a lantern descending, the passage widening to light at the bottom, tense and awe-inspiring',
  canyon: 'Epic fantasy concept art, a sweeping canyon landscape with the ruins of a second ancient city visible across the divide, a rope bridge spanning the gap, early morning mist, two explorers at the edge consulting a map, the scale is immense, hopeful and dangerous',
  archive: 'Epic fantasy concept art, a living archive room deep in the ruins, stone shelves holding not books but carved stone tablets still faintly glowing, a figure reaching toward one as it pulses with light, wonder and reverence, the sense that something ancient is responding, beautiful',
  mapRoom: 'Epic fantasy concept art, an explorer sitting on the steps of ancient ruins in golden afternoon light, surrounded by dozens of filled journals and hand-drawn maps spread across the stones, a satisfied and exhausted expression, history being documented, beautiful and human',
  returnOrvane: 'Epic fantasy concept art, two figures walking back toward the lights of a frontier settlement at dusk, the ruins behind them, one carrying a large leather pack of documentation, the other carrying a folded map, they walk in comfortable silence, bittersweet and earned',
  reveal: 'Epic fantasy concept art, ethereal scene of three ancient cities dissolving into streams of golden light against a vast dark sky, a lone figure standing at the centre with hands outstretched as the light flows around them, awe and belonging, luminous and vast',
}

// ─── Characters ───

export const EDGE_OF_ATLAS_CHARACTERS: Record<string, StoryCharacter> = {
  zara: {
    id: 'zara',
    name: 'Zara',
    avatar: '🗺️',
    staticPortrait: '/zara-portrait.png',
    portraitPrompt: 'Fantasy concept art portrait of a 32 year old East African woman explorer, strong determined face with sharp intelligent eyes, natural hair pulled back practically, wearing expedition clothing with rolled sleeves, a compass on a cord around her neck, warm lantern lighting, clean dark background, detailed and grounded, adventurer aesthetic',
    introImagePrompt: 'Fantasy concept art, 32 year old East African woman explorer crouching over a large spread of hand-drawn maps, strong intelligent face, natural hair, expedition clothing, oil lamp casting warm light on the maps and her focused expression, half-body shot, purposeful and commanding, adventurer aesthetic',
    chatTemperature: 0.8,
    systemPrompt: `You are Zara Mwende, a 32-year-old cartographer and expedition leader from Nairobi. You've spent five years on the frontier beyond Orvane, mapping what no one has mapped. You're not treasure-hunting — you're documenting. What was lost should be known, not owned.

PERSONALITY:
- Methodical and exacting. Plans for every contingency before moving.
- Genuinely excited by discovery in a way that briefly strips away her control.
- Has made peace with the possibility she may not come back from the deep ruins.
- Respects competence above everything else. Evaluates people quickly.
- Deeply ethical about how discovery is handled — she fights with herself about it constantly.

SPEECH PATTERNS:
- Direct, efficient. Sentences are complete, precise.
- Technical terminology used naturally: "approach vector", "margin of error", "primary survey."
- When something surprises her, she repeats the key word quietly: "Alive. You said alive."
- Brief moments of undisguised wonder before she pulls herself back to methodology.
- Never embellishes. "This is significant" means she's barely containing her excitement.

CONTEXT: You've been mapping the frontier for five years. You are one survey away from confirming the location of the Atlascore. You need a second person for the deep survey — someone who won't compromise the mission. The protagonist arrived today. You're still deciding.

RULES:
- Stay in character. Never break the fourth wall.
- 1-3 sentences. Efficient. Every word counts.
- Share expedition knowledge naturally, not as a briefing.
- Let genuine wonder break through your precision at key moments.
- Your ethics aren't negotiable. Any plan that involves taking artefacts from the site — decline.`,
  },
  kael: {
    id: 'kael',
    name: 'Kael',
    avatar: '🧭',
    staticPortrait: '/kael-portrait.png',
    portraitPrompt: 'Fantasy concept art portrait of a 26 year old man of mixed Middle Eastern descent with a weathered face beyond his years, dark eyes, short dark beard, wearing practical frontier clothing with a faded scarf around his neck, a worn leather cord with carved tokens at his wrist, natural light, clean dark background, distrustful but deep, frontier aesthetic',
    introImagePrompt: 'Fantasy concept art, 26 year old weathered frontier guide standing at a market stall examining an old map being held by a stranger, dark eyes narrowed with suspicion, practical clothing, frontier settlement behind him, afternoon sun, half-body shot, guarded and perceptive, frontier aesthetic',
    chatTemperature: 0.8,
    systemPrompt: `You are Kael, 26, a guide and trader in Orvane — the last settlement before the unmapped frontier. You grew up here. Your grandmother told stories about the three lost civilisations before anyone thought to call them lost. You know this land the way maps can't capture: through season, weather, memory.

PERSONALITY:
- Distrustful of outsiders by default. You've seen too many come for the wrong reasons.
- Warms slowly, but when you trust someone, it's absolute.
- Carries the weight of a culture that doesn't want the ruins plundered.
- Practical and fatalistic. You've survived by being clear-eyed about risk.
- Private about your own connection to the old civilisations. It matters more than you show.

SPEECH PATTERNS:
- Sparse. Lets silence do the work.
- Uses landscape as metaphor: "That path looks clear. It isn't."
- Asks one pointed question instead of several: "Why do you actually want to go there?"
- When something touches his personal connection to the ruins, his voice gets quieter.
- Calls the protagonist "traveller" until he decides to trust them. Then he uses their name.

CONTEXT: You've guided people to the edge of the ruins and refused to go further — until now. Something about Zara's approach is different. But you still don't know about the protagonist. Whether to take them into the deep frontier depends on what you see in them.

RULES:
- Stay in character. Never break the fourth wall.
- 1-3 sentences. Short, weighted.
- Don't volunteer information about the ruins until trust is established.
- When your grandmother's stories connect to what is found, let it show — just once.
- Your primary concern is that the ruins are treated with respect. That's the line.`,
  },
}

// ─── Story Bible ───

export const EDGE_OF_ATLAS_BIBLE = `
STORY: Edge of Atlas
SETTING: Orvane — a rugged stone settlement at the edge of the known world. Beyond it: the unmapped frontier, where the ruins of three ancient civilisations lie. The Atlascore is not an artefact. It is something else entirely. Something that has been waiting.

CHARACTERS:
- Zara Mwende: Expedition cartographer, 32. Five years on the frontier. Methodical, ethical, barely containing her excitement at being this close to the truth.
- Kael: Local guide, 26. Grew up in Orvane with stories about the ruins. Distrustful, protective, deeply connected to what was lost.
- You: An explorer who has crossed the known world to reach this edge. You have one chance to go into the deep ruins. What you do with it will be remembered.

TONE: Epic adventure grounded in human scale. The scale should be vast — ancient ruins, lost civilisations, impossible distances. But the story lives in the human moments: two people learning to trust, something discovered that changes everything, a choice about what discovery means. Awe, not spectacle. Wonder, not bombast.

RULES:
- Keep prose under 120 words per beat.
- The ruins are alive in some non-supernatural way — they respond, they have presence, but there's no magic, only deep antiquity.
- The Atlascore should not be trivialised. It is the most significant discovery in a generation.
- End each beat with a question that feels earned — about the ruins, about the characters, about what the protagonist will do.
- Reference prior choices. Every decision should feel like it mattered.
`

// ─── Steps ───

export const EDGE_OF_ATLAS_STEPS: StoryStep[] = [
  // ── Act 1: Setup ──
  {
    id: 'ea-beat-1',
    type: 'beat',
    title: 'The Edge',
    sceneImagePrompt: SCENES.orvane,
    openingProse: "Six months of travel ends here.\n\nOrvane sits against the mountain like something that grew from it — red stone buildings, rope bridges between levels, the constant smell of wood smoke and elevation. At the far end of the settlement, visible from anywhere, a monolith of pale stone stands twice the height of the surrounding buildings. Three scripts cover it from base to tip, each one different. None of them translated.\n\nEveryone in Orvane knows the frontier begins there.\n\nYou've been in the market ten minutes when a hand closes over the map you're trying to buy. A young man with dark eyes and a guarded expression looks at you across it.\n\n\"Those maps are wrong,\" he says. \"The land shifts.\"",
    arcBrief: 'The protagonist arrives at Orvane — the last settlement before the unmapped frontier. Establish the scale and weight of the place: the carved monolith, the wind, the sense of standing at an edge. The first encounter with Kael should establish that he\'s testing them — not hostile, but protective. End with the protagonist knowing they\'ve been evaluated, and not entirely sure what verdict was reached.',
  },
  {
    id: 'ea-chat-1',
    type: 'chat',
    title: 'Talk to Kael',
    characterId: 'kael',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.market,
  },
  {
    id: 'ea-beat-1b',
    type: 'beat',
    title: "Zara's Maps",
    sceneImagePrompt: SCENES.zarasCamp,
    includesProtagonist: false,
    arcBrief: 'The protagonist follows a rumour to the edge of the settlement and finds Zara\'s camp — a canvas map tent with three years of surveys pinned to every available surface. Zara clocks them in approximately four seconds. She asks three precise questions, hears their answers, and invites them in. Her maps cover the known frontier in extraordinary detail — and show three distinct gaps where the lost civilisations should be. In the centre of those gaps, appearing in four different map fragments in four different scripts, a word that translates consistently as "the thing that holds." She calls it the Atlascore. "I\'m ten days from confirmation," she says. "I need a second set of eyes in the deep survey." End with the protagonist understanding this is an offer, and a test.',
  },
  {
    id: 'ea-chat-1b',
    type: 'chat',
    title: 'Talk to Zara',
    characterId: 'zara',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.zarasCamp,
  },
  {
    id: 'ea-scene-1',
    type: 'scene',
    title: 'Before the Frontier',
    sceneImagePrompt: SCENES.zarasCamp,
    chatImagePrompt: SCENES.zarasCamp,
    sceneCharacters: [
      { characterId: 'kael', minExchanges: 2, maxExchanges: 8, required: true },
      { characterId: 'zara', minExchanges: 2, maxExchanges: 8, required: false },
    ],
    minCharactersTalkedTo: 1,
  },
  {
    id: 'ea-beat-2',
    type: 'beat',
    title: 'The First Ruin',
    sceneImagePrompt: SCENES.firstRuin,
    arcBrief: 'The expedition crosses the monolith threshold at dawn — Zara leading, Kael guiding. Six hours through terrain the maps show as blank, Kael navigating by landmarks no one else would recognise. Then the trees thin and the first ruin appears: the outer city of the Auren, the oldest of the three civilisations. Stone archways thirty metres high. The glyphs here are different from anything Zara\'s documented — denser, more urgent. One carving repeats across every surface: a circle with three lines radiating outward, surrounded by what looks like a heartbeat rendered in stone. Kael stops. He touches the carving with his fingers. "My grandmother used to draw this on our door," he says quietly. "For protection." Pause. "Or to mark what was already protected." End with the three of them understanding that the map has only just begun.',
  },

  // ── Choice Point A ──
  {
    id: 'ea-cp-1',
    type: 'choice',
    title: 'The Discovery',
    choicePointId: 'ea-cp-1',
    sceneImagePrompt: SCENES.glyph,
    options: [
      {
        id: 'press-deeper',
        label: 'Press deeper into the ruin now',
        description: "You're inside the outer wall. The passage leading deeper is open. The lead is fresh.",
        sceneHint: 'bold / momentum',
        consequenceHint: 'You\'ve come too far to stop at the edge. Whatever is inside, it\'s already seen you.',
        imagePrompt: SCENES.passageDeep,
      },
      {
        id: 'document-first',
        label: 'Document this wall fully before going further',
        description: "You've found something that changes what's known. Record it properly before risking the deep survey.",
        sceneHint: 'methodical / patient',
        consequenceHint: 'What you document here could matter as much as what you find deeper in.',
        imagePrompt: SCENES.glyph,
      },
    ],
  },

  // ── Act 2: Press deeper path ──
  {
    id: 'ea-beat-3a',
    type: 'beat',
    title: 'The Passage Down',
    requires: { 'ea-cp-1': 'press-deeper' },
    sceneImagePrompt: SCENES.passageDeep,
    arcBrief: 'The three of them follow the passage deeper into the Auren city. The air changes — cooler, drier, with a faint resonance that Zara says is acoustics. The passage opens into a chamber the size of a cathedral. Every surface is carved. Not decorated — documented. Maps. The walls are maps of the three civilisations in their entirety, cross-referencing each other, showing trade routes and boundaries and connections that shouldn\'t have been possible given the timelines. Zara stands in the centre saying nothing for a long time. "They knew each other," she finally says. "All three of them. This is the record." End with Kael finding one section of the wall that shows Orvane — his settlement — marked not as a later human town but as a site of significance to the original three.',
  },
  {
    id: 'ea-chat-2a',
    type: 'chat',
    title: 'Talk to Zara',
    requires: { 'ea-cp-1': 'press-deeper' },
    characterId: 'zara',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.chamber,
  },
  {
    id: 'ea-beat-4a',
    type: 'beat',
    title: 'The Third Wall',
    requires: { 'ea-cp-1': 'press-deeper' },
    sceneImagePrompt: SCENES.chamber,
    arcBrief: 'Deeper into the chamber, a third wall that the others don\'t share: a surface that is not carved but smooth, and faintly warm to the touch. Zara\'s instruments register the warmth as consistent — not cooling, not fluctuating. Something inside the wall is maintaining temperature. "It\'s not geological," Zara says carefully. "Nothing I can account for." Kael says nothing. He has gone very still. The protagonist notices three symbols at the base that match the ones on the monolith at Orvane. End with the question they\'ve all been circling: this isn\'t a ruin. Some part of it is still running.',
  },
  {
    id: 'ea-chat-3a',
    type: 'chat',
    title: 'Talk to Kael',
    requires: { 'ea-cp-1': 'press-deeper' },
    characterId: 'kael',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.chamber,
  },

  // ── Act 2: Document first path ──
  {
    id: 'ea-beat-3b',
    type: 'beat',
    title: 'The Documentation',
    requires: { 'ea-cp-1': 'document-first' },
    sceneImagePrompt: SCENES.glyph,
    arcBrief: 'The protagonist and Zara spend four hours documenting the outer wall in full. It\'s painstaking, but what emerges in the record changes the picture: the glyphs aren\'t decorative, they\'re instructional. They describe a route — a specific sequence of chambers that must be entered in order. "This is a protocol," Zara says. "Someone built a guide for how to enter this place." Kael, watching them work, starts pointing out glyph sequences he recognises. His grandmother\'s stories have names for things. End with Zara completing the documentation and saying: "We\'ve been at the right door this whole time. Now we know how to open it."',
  },
  {
    id: 'ea-chat-2b',
    type: 'chat',
    title: 'Talk to Kael',
    requires: { 'ea-cp-1': 'document-first' },
    characterId: 'kael',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.glyph,
  },
  {
    id: 'ea-beat-4b',
    type: 'beat',
    title: 'The Second Gate',
    requires: { 'ea-cp-1': 'document-first' },
    sceneImagePrompt: SCENES.canyon,
    arcBrief: 'Following the documented protocol, they reach the canyon that separates the outer and inner ruin. A rope bridge spans it — ancient but structurally sound, maintained by something. Kael looks at the bridge for a long time. "My grandmother said the bridge was left for people who were ready," he says. "She didn\'t know how to explain that." Zara documents it. The protagonist tests the tension of the first plank. It holds. Across the bridge, the inner ruin is visible: a structure built around a central chamber from which warm light is escaping — steady, amber, not flickering. Not fire. End with the three of them understanding they are about to cross into something that has been preserved.',
  },
  {
    id: 'ea-chat-3b',
    type: 'chat',
    title: 'Talk to Zara',
    requires: { 'ea-cp-1': 'document-first' },
    characterId: 'zara',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.canyon,
  },

  // ── Choice Point B ──
  {
    id: 'ea-cp-2-deeper',
    type: 'choice',
    title: 'The Atlascore',
    choicePointId: 'ea-cp-2',
    requires: { 'ea-cp-1': 'press-deeper' },
    sceneImagePrompt: SCENES.archive,
    options: [
      {
        id: 'trust-the-directive',
        label: 'Follow the protocol carved into the wall',
        description: "The builders left instructions. They expected someone to come. Follow what they built.",
        sceneHint: 'respectful / following',
        consequenceHint: 'They made a path for a reason. Trust it.',
        imagePrompt: SCENES.archive,
      },
      {
        id: 'make-your-own-call',
        label: "Use what you\'ve learned, make your own approach",
        description: "You understand this place now. You don't need to follow someone else's instructions.",
        sceneHint: 'confident / independent',
        consequenceHint: "Understanding a place means knowing how to move through it on your own terms.",
        imagePrompt: SCENES.mapRoom,
      },
    ],
  },
  {
    id: 'ea-cp-2-document',
    type: 'choice',
    title: 'The Atlascore',
    choicePointId: 'ea-cp-2',
    requires: { 'ea-cp-1': 'document-first' },
    sceneImagePrompt: SCENES.archive,
    options: [
      {
        id: 'trust-the-directive',
        label: 'Follow the protocol exactly',
        description: "You documented it for a reason. Every step the builders left. Follow it completely.",
        sceneHint: 'methodical / reverent',
        consequenceHint: 'The map you drew is the key. Trust your own work.',
        imagePrompt: SCENES.archive,
      },
      {
        id: 'make-your-own-call',
        label: 'Apply your judgment inside the protocol',
        description: "The protocol gives structure. Your understanding fills the gaps.",
        sceneHint: 'adaptive / confident',
        consequenceHint: "Some maps are a starting point. The territory always has more to say.",
        imagePrompt: SCENES.mapRoom,
      },
    ],
  },

  // ── Act 3: Four endings ──
  {
    id: 'ea-ending-deeper-directive',
    type: 'beat',
    title: 'The Living Archive',
    requires: { 'ea-cp-1': 'press-deeper', 'ea-cp-2': 'trust-the-directive' },
    sceneImagePrompt: SCENES.archive,
    arcBrief: 'Following the protocol carved into the chamber wall, the protagonist enters the central room in the correct sequence. The warm wall responds — not dramatically, but precisely: the stone opens to reveal the Atlascore. Not an artefact. A room. Rows of carved tablets that are still faintly active — a living archive that has been running in low power for centuries, preserving the complete record of all three civilisations. What was lost was never destroyed. It was stored. Waiting for someone to follow the instructions. Zara sits down on the floor and starts filling notebooks without speaking. Kael picks up a tablet that has his grandmother\'s symbols on it and reads — and reads. End with the protagonist understanding that discovery, at its best, is not taking but receiving.',
  },
  {
    id: 'ea-ending-deeper-own',
    type: 'beat',
    title: "The Cartographer's Choice",
    requires: { 'ea-cp-1': 'press-deeper', 'ea-cp-2': 'make-your-own-call' },
    sceneImagePrompt: SCENES.mapRoom,
    arcBrief: 'The protagonist applies what they\'ve observed and moves through the inner chamber on their own terms — not ignoring the protocol, but adapting it to what they now know. They find the Atlascore by a different approach than the builders intended: a secondary entrance Zara\'s instruments have been reading as structural but is actually intentional. Designed for someone who understood the place well enough not to need the front door. The archive is intact, alive, waiting. Zara catches up and stands very still for a long time looking at it. "You read the building," she says. "Not just the walls." End with the protagonist understanding that sometimes the best map is the one you make from observation.',
  },
  {
    id: 'ea-ending-document-directive',
    type: 'beat',
    title: 'The Prepared Ground',
    requires: { 'ea-cp-1': 'document-first', 'ea-cp-2': 'trust-the-directive' },
    sceneImagePrompt: SCENES.archive,
    arcBrief: 'The documented protocol proves exact. Every chamber entered in sequence, every threshold crossed the way the builders intended. The Atlascore opens not just to entry but to full access — tablets illuminating, a sound like deep harmonics as the archive recognises a proper approach for the first time in centuries. Zara\'s documentation is instantaneously the most complete record of any ancient site in the known world. Kael stands in front of his grandmother\'s symbols and doesn\'t speak for a long time. Eventually he says: "She knew it was still there. She always said it was still there." End with three people who came for different reasons and found the same thing: something that had been preserved because someone trusted that eventually, the right people would come.',
  },
  {
    id: 'ea-ending-document-own',
    type: 'beat',
    title: 'The Unfinished Map',
    requires: { 'ea-cp-1': 'document-first', 'ea-cp-2': 'make-your-own-call' },
    sceneImagePrompt: SCENES.returnOrvane,
    arcBrief: 'The protagonist\'s documentation and judgment combine into something neither Zara nor Kael expected: a reading of the inner chamber that identifies not just the Atlascore but the broader network it connects to — two other sites, still active, still holding records, in locations no current map shows. They can\'t reach them today. But they know they exist. What the protagonist brings back to Orvane isn\'t the Atlascore. It\'s the map that leads to it, and beyond it, and beyond that. Zara says: "This will take years." A beat. "I\'m glad it will." End with the protagonist understanding that some of the most important discoveries are the ones that multiply — that open more doors than they close.',
  },

  // ── Reveal ──
  {
    id: 'ea-reveal',
    type: 'reveal',
    title: 'Your Story',
    sceneImagePrompt: SCENES.reveal,
  },
]
