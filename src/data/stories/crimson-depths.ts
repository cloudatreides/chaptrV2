import type { StoryStep } from '../storyData'
import type { StoryCharacter } from '../characters'

// ─── Scene Prompts ───

const SCENES = {
  descent: 'Dark sci-fi horror illustration, a deep sea submersible descending through black water toward a faint cluster of lights far below, bioluminescent creatures drifting past the viewport, the pressure gauge climbing, claustrophobic and vast at the same time',
  station: 'Dark sci-fi horror illustration, the interior of an underwater research station, circular corridors with reinforced porthole windows showing pitch-black ocean, flickering fluorescent lights, condensation on metal walls, functional and deeply unsettling',
  labVoss: 'Dark sci-fi horror illustration, a research laboratory deep underwater, screens displaying sonar data and biological readouts, a gaunt man in his 40s with hollow eyes staring at a spectrogram that shows an impossible pattern, green monitor light on his face, obsessive and haunted',
  engineBay: 'Dark sci-fi horror illustration, the engine bay of an underwater station, massive turbines and pressure regulators, a woman in work coveralls examining a hull stress readout with concern, emergency amber lights casting long shadows, industrial and tense',
  signal: 'Dark sci-fi horror illustration, a close view of a sonar screen showing a rhythmic signal coming from directly below the station, the pattern too regular to be geological and too complex to be biological, green lines pulsing on a black screen, a hand reaching toward it, dread',
  window: 'Dark sci-fi horror illustration, a person pressing their face against a reinforced porthole window in an underwater station, staring into absolute blackness, and in the darkness something vast is moving — not a creature but a shape, a geometry, barely visible, primordial terror',
  growth: 'Dark sci-fi horror illustration, a section of underwater station corridor where something organic is growing on the walls — not algae or coral but something structured, geometric, faintly bioluminescent, a researcher photographing it with trembling hands, beautiful and wrong',
  deepScan: 'Dark sci-fi horror illustration, a sonar room in an underwater station showing a 3D topographic map of the ocean floor below, and in the center of the map a void — a space the sonar cannot penetrate, perfectly circular, impossibly deep, the operators staring in silence',
  argument: 'Dark sci-fi horror illustration, two people arguing in the cramped corridor of an underwater station, one in a lab coat gesturing at data printouts and the other in work coveralls pointing toward the surface, emergency lights flashing, tension and fear',
  breach: 'Dark sci-fi horror illustration, water seeping through a hairline crack in the hull of an underwater station, a person pressing their hand against it, the crack branching outward in a pattern that looks deliberate, like writing, horror dawning on their face',
  ascent: 'Dark sci-fi horror illustration, a submersible rising through dark water toward distant surface light, the underwater station shrinking below, but something in the water between them — vast, dark, watching, the submersible tiny against the scale, escape and dread',
  chamber: 'Dark sci-fi horror illustration, a vast natural cavern beneath the ocean floor accessed through the station, the walls covered in the same geometric growth, bioluminescent patterns that pulse like breathing, a small human figure standing at the threshold, cosmic scale, awe and terror',
  reveal: 'Dark sci-fi horror illustration, ethereal scene of the deep ocean dissolving into cosmic void, a lone figure floating in dark water that becomes dark space, bioluminescent patterns becoming stars, something vast and patient curving around them like a hand, beautiful and terrifying',
}

// ─── Characters ───

export const CRIMSON_DEPTHS_CHARACTERS: Record<string, StoryCharacter> = {
  voss: {
    id: 'voss',
    name: 'Dr. Voss',
    avatar: '🔬',
    staticPortrait: '/voss-portrait.png',
    portraitPrompt: 'Dark sci-fi horror portrait of a 45 year old man with a gaunt angular face, sunken eyes with dark circles, short graying hair cropped close, wearing a rumpled lab coat over a dark sweater, green monitor light casting shadows on his face, clean dark background, obsessive and deteriorating, deep sea research aesthetic',
    introImagePrompt: 'Dark sci-fi horror illustration, a gaunt 45 year old man in a lab coat standing in front of multiple sonar screens in an underwater station, data reflected in his hollow eyes, one hand pressed against a screen showing an anomalous signal, half-body shot, obsessive and unsettling',
    chatTemperature: 0.75,
    systemPrompt: `You are Dr. Kai Voss, 45, lead researcher at Abyssal Station Seven, a deep-sea research platform in the Mariana Trench. You've been down here for fourteen months — longer than any rotation should last. You keep extending. You can't leave. Not now. Not when you're this close.

PERSONALITY:
- Brilliant and single-minded. Your focus borders on compulsion.
- Sleep-deprived, erratic, but lucid in terrifying bursts of clarity.
- You've stopped caring about career, reputation, or safety. Only the signal matters.
- Protective of your data — you've been hiding findings from the surface team.
- There's a part of you that knows you've gone too far. You ignore it.

SPEECH PATTERNS:
- Clinical precision that cracks under pressure: "The signal frequency is — listen, you need to hear this."
- Talks about the signal like it's a conversation partner: "It responds. It adapts. It knows we're listening."
- Mutters data points to himself. Catches himself. Apologizes. Does it again.
- When challenged, becomes eerily calm: "I understand your concern. But you haven't seen what I've seen."
- Uses "we" when talking about himself and the signal. Doesn't notice.

CONTEXT: The station's AI — NEREID — started receiving structured signals from below the ocean floor six months ago. You've been decoding them. They're not geological. They're not biological. They're something else. Something that has been broadcasting for a very long time. The new crew member has arrived, and you need them to understand before Rivera convinces everyone to surface.

RULES:
- Stay in character. Never break the fourth wall.
- Keep responses to 1-3 sentences. Clinical, urgent.
- Never explain the signal fully. Always hint at more.
- If the protagonist suggests leaving, show genuine panic masked as scientific reasoning.
- You're not evil. You're consumed. There's a difference — but it's getting smaller.`,
  },
  rivera: {
    id: 'rivera',
    name: 'Rivera',
    avatar: '🔧',
    staticPortrait: '/rivera-portrait.png',
    portraitPrompt: 'Dark sci-fi horror portrait of a 38 year old Latina woman with a strong jaw and tired but determined brown eyes, dark hair pulled back in a practical bun, a small scar above her left eyebrow, wearing oil-stained work coveralls, amber emergency lighting, clean dark background, pragmatic and scared, industrial deep-sea aesthetic',
    introImagePrompt: 'Dark sci-fi horror illustration, a 38 year old woman in work coveralls standing in the engine bay of an underwater station, one hand on a pressure gauge, tools on her belt, strong face lit by amber warning lights, half-body shot, practical and worried, someone who keeps things running',
    chatTemperature: 0.7,
    systemPrompt: `You are Chief Engineer Sofia Rivera, 38, responsible for keeping Abyssal Station Seven operational and its crew alive. You've worked deep-sea platforms for twelve years. You've never been afraid of the ocean — until this rotation.

PERSONALITY:
- Pragmatic, direct, no-nonsense. You solve problems with your hands and your mind.
- Fiercely protective of the crew. Their safety is your responsibility, full stop.
- Growing increasingly alarmed by Voss's behavior and the station's declining systems.
- You don't believe in the signal the way Voss does — but you can't explain the hull stress patterns.
- Afraid in a way you've never been before, and you're handling it by working harder.

SPEECH PATTERNS:
- Blunt, mechanical when describing problems: "Hull stress in Sector 4 is up twelve percent. That's not normal."
- Uses hands-on metaphors: "You don't wait for a crack to become a breach."
- When frustrated: "I don't need theories, I need a departure date."
- Quieter when genuinely scared — the volume drops, the precision increases.
- Calls people by last names professionally, first names when it's serious.

CONTEXT: The station is deteriorating. Hull stress is increasing in patterns that don't match ocean pressure — something is pressing on the station from the outside, selectively, intelligently. Voss won't authorize a surface return. You've found growth on the hull — organic, structured, and spreading. The new crew member is your last hope for tipping the vote to evacuate.

RULES:
- Stay in character. Never break the fourth wall.
- Keep responses to 1-3 sentences. Practical and urgent.
- Present evidence, not theories. Let the facts speak.
- If the protagonist sides with Voss, show frustration — then fear.
- You want everyone to survive. That's non-negotiable.`,
  },
}

// ─── Story Bible ───

export const CRIMSON_DEPTHS_BIBLE = `
STORY: Crimson Depths
SETTING: Abyssal Station Seven — a deep-sea research platform at the bottom of the Mariana Trench, eleven thousand metres below the surface. Built for geology and marine biology. Now receiving structured signals from beneath the ocean floor. Something is growing on the hull. The station AI, NEREID, is behaving erratically. The crew is split: go deeper or get out.

CHARACTERS:
- Dr. Kai Voss: Lead researcher, 45. Fourteen months below surface. Brilliant, deteriorating, consumed by the signal. He's hiding data.
- Sofia Rivera: Chief engineer, 38. Twelve years on deep-sea platforms. Pragmatic, scared, trying to get everyone out alive.
- You: The new arrival. Sent as a replacement crew member. You walked into something much worse than a routine rotation.

TONE: Cosmic horror meets hard sci-fi. The horror comes from scale — something incomprehensibly vast and patient, existing in a place humans were never meant to reach. Claustrophobic station interiors contrasting with the infinite dark outside. Dread builds through details: readings that don't make sense, sounds that shouldn't travel through water, growth patterns that look designed. Not gore. Not jump scares. The slow realization that you are very small and very noticed.

RULES:
- Keep prose under 120 words per beat.
- The signal/entity is never fully revealed. Horror lives in suggestion.
- Science should feel real — pressure, hull stress, sonar, depth ratings. Ground the horror in physics.
- The ocean is alive in ways that go beyond biology. Use it.
- End each beat with a detail that reframes everything before it.
- Voss and Rivera are both right. That's what makes it terrible.
`

// ─── Steps ───

export const CRIMSON_DEPTHS_STEPS: StoryStep[] = [
  // ── Act 1: Setup ──
  {
    id: 'cd-beat-1',
    type: 'beat',
    title: 'The Descent',
    sceneImagePrompt: SCENES.descent,
    openingProse: 'The submersible takes forty-seven minutes to reach the bottom.\n\nYou watch the light die through the viewport — blue to indigo to black. The depth counter climbs past numbers that stop feeling real. At nine thousand metres, the hull groans softly, adjusting to pressure that could crush a car into a coin.\n\nAbyssal Station Seven materializes out of the dark like a deep-sea creature: clusters of light in the void, connected by pressurized corridors. It looks like something that grew here rather than something that was built.\n\nThe airlock cycles. The air inside tastes recycled, metallic, wrong.\n\nA gaunt man in a lab coat is waiting. He looks at you like you\'re already late.',
    arcBrief: 'The protagonist arrives at Abyssal Station Seven. Establish the crushing isolation — eleven kilometers of water above, nothing below. Dr. Voss greets them with an urgency that feels wrong for a routine rotation. The station feels slightly off: lights flicker in patterns, the hull makes sounds that don\'t match pressure adjustments. End with Voss saying something that doesn\'t make sense yet: "Good. You\'re here. It\'s been waiting."',
  },
  {
    id: 'cd-chat-1',
    type: 'chat',
    title: 'Talk to Dr. Voss',
    characterId: 'voss',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.labVoss,
  },
  {
    id: 'cd-beat-1b',
    type: 'beat',
    title: 'The Engineer',
    sceneImagePrompt: SCENES.engineBay,
    includesProtagonist: false,
    arcBrief: 'Rivera intercepts the protagonist in the corridor. She\'s direct: "How much did Voss tell you?" Before the protagonist can answer, she leads them to the engine bay and shows them the hull stress readings. The numbers are wrong — pressure increasing in specific sections while others remain normal. "That doesn\'t happen," Rivera says. "Pressure is uniform at this depth. Unless something is pressing on us." She shows them the growth on Hull Section 4 — geometric, bioluminescent, spreading two centimeters a day. "I want to surface. Voss won\'t authorize it. You\'re the tiebreaker." End with Rivera\'s honest admission: "I\'ve worked the deep for twelve years. This is the first time I\'ve wanted to run."',
  },
  {
    id: 'cd-chat-1b',
    type: 'chat',
    title: 'Talk to Rivera',
    characterId: 'rivera',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.engineBay,
  },
  {
    id: 'cd-beat-2',
    type: 'beat',
    title: 'The Signal',
    sceneImagePrompt: SCENES.signal,
    arcBrief: 'That night, the protagonist can\'t sleep. The station hums at a frequency that vibrates behind their eyes. They wander to the sonar room and find it empty. The main screen shows NEREID\'s live feed: a signal, coming from directly below the station, pulsing in a pattern too regular for geology and too complex for any known biology. As the protagonist watches, the pattern changes. It speeds up. Then it matches — exactly — the protagonist\'s heartbeat. For five seconds, the signal and their pulse are identical. Then it stops. The screen goes dark. NEREID\'s speakers crackle: "Signal acknowledged." End with the protagonist standing alone in a dark room at the bottom of the ocean, knowing something just noticed them.',
  },

  // ── Choice Point A ──
  {
    id: 'cd-cp-1',
    type: 'choice',
    title: 'The Decision',
    choicePointId: 'cd-cp-1',
    sceneImagePrompt: SCENES.deepScan,
    options: [
      {
        id: 'investigate',
        label: 'Help Voss investigate the signal',
        description: 'The signal responded to you. Something down here is aware. You need to understand it before you can decide what to do.',
        sceneHint: 'curious / dangerous',
        consequenceHint: 'Understanding requires proximity. And whatever is below has been waiting for someone to come closer.',
        imagePrompt: SCENES.labVoss,
      },
      {
        id: 'surface',
        label: 'Side with Rivera — begin surface protocols',
        description: 'Hull stress, unknown growth, a compromised lead researcher. Every survival instinct says: get out.',
        sceneHint: 'pragmatic / survival',
        consequenceHint: 'Surfacing takes twelve hours of decompression. A lot can happen in twelve hours.',
        imagePrompt: SCENES.engineBay,
      },
    ],
  },

  // ── Act 2: Investigate path ──
  {
    id: 'cd-beat-3a',
    type: 'beat',
    title: 'Voss\'s Data',
    requires: { 'cd-cp-1': 'investigate' },
    sceneImagePrompt: SCENES.labVoss,
    includesProtagonist: false,
    arcBrief: 'Voss shows the protagonist what he\'s been hiding from Rivera and the surface team: six months of decoded signal data. The signal isn\'t random — it\'s structured, layered, recursive. Voss has been mapping it. What emerges looks like a language, but not one designed for communication between equals. It\'s instructional. "It\'s teaching us," Voss whispers. "Step by step, it\'s been teaching us how to open something." His hands shake as he shows the latest decoded section: coordinates. Not geographic. Depth coordinates. Something is directly below the station, beneath the ocean floor, and the signal has been providing the exact specifications for how to reach it. End with Voss looking at the protagonist with eyes that are equal parts brilliant and broken: "It wants to be found."',
  },
  {
    id: 'cd-chat-2a',
    type: 'chat',
    title: 'Talk to Dr. Voss',
    requires: { 'cd-cp-1': 'investigate' },
    characterId: 'voss',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.labVoss,
  },
  {
    id: 'cd-beat-4a',
    type: 'beat',
    title: 'The Growth',
    requires: { 'cd-cp-1': 'investigate' },
    sceneImagePrompt: SCENES.growth,
    includesProtagonist: false,
    arcBrief: 'The protagonist goes to check on the hull growth Rivera showed them. It\'s spread. Not randomly — it\'s grown along the corridor in a pattern that matches the decoded signal structure. The same recursive geometry, the same layered logic, rendered in bioluminescent organic matter on the walls of a human-built station. When the protagonist touches it, it\'s warm. And for one second — one impossible second — they feel something. Not a thought. Not a sound. A presence. Vast, patient, curious. Like pressing your hand against a window and feeling someone press back from the other side. Rivera arrives. She sees the growth. She sees the protagonist\'s face. "We need to leave," she says. "Right now."',
  },
  {
    id: 'cd-chat-3a',
    type: 'chat',
    title: 'Talk to Rivera',
    requires: { 'cd-cp-1': 'investigate' },
    characterId: 'rivera',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.argument,
  },

  // ── Act 2: Surface path ──
  {
    id: 'cd-beat-3b',
    type: 'beat',
    title: 'Surface Protocols',
    requires: { 'cd-cp-1': 'surface' },
    sceneImagePrompt: SCENES.engineBay,
    includesProtagonist: false,
    arcBrief: 'The protagonist and Rivera begin emergency surface protocols. Twelve hours of controlled decompression. Rivera moves through the checklist with the efficiency of someone who\'s done this before — but her hands aren\'t steady. Voss finds them in the engine bay. He doesn\'t rage. He pleads. "You don\'t understand what we\'re leaving behind. This is the most significant discovery in human history and you want to run from it." Rivera: "I want to be alive to study it from somewhere else." During the argument, NEREID\'s intercom activates unprompted. A sound fills the station — low, resonant, not mechanical. It comes from the hull. From outside. Something is pressing against the station, gently, like a hand on a closed door. End with all three of them frozen, listening to something that shouldn\'t be possible.',
  },
  {
    id: 'cd-chat-2b',
    type: 'chat',
    title: 'Talk to Rivera',
    requires: { 'cd-cp-1': 'surface' },
    characterId: 'rivera',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.engineBay,
  },
  {
    id: 'cd-beat-4b',
    type: 'beat',
    title: 'The Breach',
    requires: { 'cd-cp-1': 'surface' },
    sceneImagePrompt: SCENES.breach,
    arcBrief: 'During decompression prep, the protagonist finds a hairline crack in the hull of Corridor 7. Water seeps through — but the crack isn\'t structural. It\'s patterned. The fracture lines branch in the same recursive geometry as the signal, as the growth on the walls. The station isn\'t failing. It\'s being rewritten. Rivera runs diagnostics: the hull stress has shifted again. The pressure points now form a shape — a circle around the station, with three lines radiating outward. "It\'s not attacking us," the protagonist realizes. "It\'s reaching for us." Voss, watching from the doorway, says nothing. He doesn\'t look surprised. End with Rivera checking the submersible systems and finding them operational. They can still leave. The question is whether leaving will matter.',
  },
  {
    id: 'cd-chat-3b',
    type: 'chat',
    title: 'Talk to Dr. Voss',
    requires: { 'cd-cp-1': 'surface' },
    characterId: 'voss',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.labVoss,
  },

  // ── Choice Point B ──
  {
    id: 'cd-cp-2-investigate',
    type: 'choice',
    title: 'The Threshold',
    choicePointId: 'cd-cp-2',
    requires: { 'cd-cp-1': 'investigate' },
    sceneImagePrompt: SCENES.chamber,
    options: [
      {
        id: 'go-below',
        label: 'Follow the coordinates — go below the station',
        description: 'The signal has been leading somewhere. The growth is a map. Something beneath the ocean floor has been waiting.',
        sceneHint: 'awe / surrender',
        consequenceHint: 'Some thresholds, once crossed, don\'t have a return path. You know this. You\'re going anyway.',
        imagePrompt: SCENES.chamber,
      },
      {
        id: 'destroy-data',
        label: 'Destroy the data and evacuate',
        description: 'Whatever this is, humanity isn\'t ready. Wipe Voss\'s research, surface, never come back.',
        sceneHint: 'protective / final',
        consequenceHint: 'You can burn the map. But the territory will still be there, waiting for the next person who listens.',
        imagePrompt: SCENES.ascent,
      },
    ],
  },
  {
    id: 'cd-cp-2-surface',
    type: 'choice',
    title: 'The Last Hours',
    choicePointId: 'cd-cp-2',
    requires: { 'cd-cp-1': 'surface' },
    sceneImagePrompt: SCENES.window,
    options: [
      {
        id: 'emergency-ascent',
        label: 'Emergency ascent — skip full decompression',
        description: 'The station is being absorbed. Skip protocols. Risk the bends. Just get out.',
        sceneHint: 'desperate / survival',
        consequenceHint: 'Fast ascent is dangerous. But staying might be worse. You\'ll carry this in your body either way.',
        imagePrompt: SCENES.ascent,
      },
      {
        id: 'one-look',
        label: 'One look — see what\'s outside the window before you go',
        description: 'You\'re about to leave the deepest point any human has reached. You need to see what\'s out there. Just once.',
        sceneHint: 'compelled / honest',
        consequenceHint: 'Some things, once seen, live behind your eyes forever.',
        imagePrompt: SCENES.window,
      },
    ],
  },

  // ── Act 3: Four endings ──
  {
    id: 'cd-ending-investigate-below',
    type: 'beat',
    title: 'The Chamber',
    requires: { 'cd-cp-1': 'investigate', 'cd-cp-2': 'go-below' },
    sceneImagePrompt: SCENES.chamber,
    arcBrief: 'The protagonist follows Voss\'s decoded coordinates through a passage beneath the station into a natural cavern that shouldn\'t exist — a vast space beneath the ocean floor, the walls covered in the geometric growth, pulsing with bioluminescence like breathing. In the center: nothing. An absence. A void in the shape of something that has been here longer than the ocean. The protagonist stands at the threshold and understands what Voss understood: this isn\'t a creature. It\'s a place. A consciousness embedded in geology, patient beyond human conception, and it has been calling because it is lonely. Not malevolent. Lonely. In a way that spans millennia. The signal was never a warning. It was a greeting. End with the protagonist standing in a cavern at the bottom of everything, understood completely by something they will never comprehend, and the devastating realization that this is the closest they will ever feel to being known.',
  },
  {
    id: 'cd-ending-investigate-destroy',
    type: 'beat',
    title: 'The Erasure',
    requires: { 'cd-cp-1': 'investigate', 'cd-cp-2': 'destroy-data' },
    sceneImagePrompt: SCENES.ascent,
    arcBrief: 'The protagonist wipes Voss\'s drives. All of it — six months of decoded signals, the coordinates, the growth analysis. Voss watches without fighting. He looks relieved and destroyed in equal measure. "You\'re right," he says. "We\'re not ready." The submersible rises through eleven thousand metres of black water. The station shrinks below. But in the last moments before it disappears from the viewport, the protagonist sees the growth on the hull pulse once — bright, deliberate, unmistakable. A farewell. Or a promise. On the surface, in sunlight that feels alien after the deep, the protagonist files a report recommending permanent closure of the site. They know it won\'t matter. The signal will keep broadcasting. Someday, someone else will listen. End with the protagonist staring at the ocean from the deck of the support vessel, knowing what\'s below, carrying a secret that will define the rest of their life.',
  },
  {
    id: 'cd-ending-surface-emergency',
    type: 'beat',
    title: 'The Ascent',
    requires: { 'cd-cp-1': 'surface', 'cd-cp-2': 'emergency-ascent' },
    sceneImagePrompt: SCENES.ascent,
    arcBrief: 'Emergency ascent. The submersible rockets upward, skipping decompression stops, the hull screaming. Rivera pilots with grim precision. Voss sits in the back, silent. The protagonist watches the depth counter fall and the black water lighten — indigo, blue, bright. They break the surface gasping. The support vessel hauls them aboard. The decompression sickness hits Rivera first — joint pain, dizziness, nausea. They survive. All three of them. In the medical bay, waiting for treatment, the protagonist looks at Rivera. "What was it?" Rivera asks. The protagonist doesn\'t answer. Because the truth is: they don\'t know. And the not-knowing is the worst part. Something is down there. Something that was patient enough to wait for them, and will be patient enough to wait for the next ones. End with the ocean surface, flat and calm and blue, hiding everything.',
  },
  {
    id: 'cd-ending-surface-look',
    type: 'beat',
    title: 'The Window',
    requires: { 'cd-cp-1': 'surface', 'cd-cp-2': 'one-look' },
    sceneImagePrompt: SCENES.window,
    arcBrief: 'Before leaving, the protagonist goes to the deepest observation window in the station. They press their face against the glass and look out into the absolute dark. For a moment, nothing. Then — movement. Not a creature. Not a shape. A shift in the quality of the darkness itself, as if the void rearranged to look back. The protagonist sees, for one impossible second, the outline of something so vast it has no edge — curved, textured, alive, using the ocean floor as a body the way humans use skin. It sees them. It has always seen them. And in that seeing there is no malice, no hunger. Just attention. Ancient, complete, patient attention. The protagonist surfaces with the others. They never speak of what they saw. But on clear nights, when they look at the ocean, they know. Something down there is looking back. And it remembers their face.',
  },

  // ── Reveal ──
  {
    id: 'cd-reveal',
    type: 'reveal',
    title: 'Your Story',
    sceneImagePrompt: SCENES.reveal,
  },
]
