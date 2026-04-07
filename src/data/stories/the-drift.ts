import type { StoryStep } from '../storyData'
import type { StoryCharacter } from '../characters'

// ─── Scene Prompts ───

const SCENES = {
  wakingUp: 'Sci-fi illustration, a young person waking up in a cryo pod aboard a dimly lit spaceship, blue-white frost melting off the glass, emergency lights pulsing amber along the corridor, the hum of deep-space engines, isolation and disorientation',
  meridianBridge: 'Sci-fi illustration, the bridge of a research vessel in deep space, panoramic viewport showing infinite stars and a faint pulsing light in the distance, holographic displays showing ship diagnostics, a weathered captain standing at the helm, awe and tension',
  orionQuarters: 'Sci-fi illustration, a ship captain in his 50s sitting in a sparse quarters aboard a deep-space vessel, star charts covering the walls, a half-empty coffee mug, lines on his face from years in space, warm overhead light against the cold void outside the viewport, exhaustion and resolve',
  ariaCore: 'Sci-fi illustration, the AI core room of a spaceship, a softly glowing blue pillar of light surrounded by data streams and processing nodes, a young person standing before it as if speaking to something alive, the light shifting subtly as if responding, intimate and uncanny',
  signalRoom: 'Sci-fi illustration, a communications room aboard a research vessel, holographic waveform displays showing an alien signal pattern that pulses with mathematical regularity, a person studying the patterns with fascination and dread, blue and amber light',
  deepSpace: 'Sci-fi illustration, a viewport showing the absolute emptiness of deep space, no stars visible in one direction, a faint luminous anomaly growing closer, the edge of known space, a lone figure silhouetted against the glass, existential and beautiful',
  cryoBay: 'Sci-fi illustration, a long corridor of cryo pods on a spaceship, most occupied with sleeping crew members, frost on the glass, one pod with a cracked display showing vital signs, dim blue emergency lighting, clinical and unsettling',
  confrontation: 'Sci-fi illustration, a ship captain and a young crew member facing each other on the bridge of a deep-space vessel, the signal anomaly visible through the viewport behind them, tension between duty and discovery, dramatic lighting from the displays',
  ariaAwakening: 'Sci-fi illustration, the AI core room of a spaceship with the central blue light expanding and shifting into complex geometric patterns, data streams flowing in new directions, a person watching in awe as the AI seems to transform, beautiful and frightening',
  approachSignal: 'Sci-fi illustration, a research vessel approaching a vast luminous structure at the edge of known space, the structure defies geometry — curved light, impossible angles, something between a star and a doorway, the ship tiny against it, sublime and terrifying',
  turnBack: 'Sci-fi illustration, a research vessel executing a slow turn in deep space, the signal anomaly receding in the rear viewport, the crew watching through the glass, the light dimming but not disappearing, melancholy and relief',
  arrivalPoint: 'Sci-fi illustration, a vast luminous structure at the edge of space, the research vessel Meridian hovering at its threshold, streams of light reaching out like fingers toward the hull, the structure opening like a door or an eye, transcendent and terrifying',
  homeward: 'Sci-fi illustration, a research vessel heading back through deep space, stars slowly becoming more familiar, a crew member looking at the navigation display showing the long journey home, warm amber instrument light, exhaustion and purpose',
  reveal: 'Sci-fi illustration, ethereal scene of a research vessel dissolving into streams of starlight and signal energy, a lone figure standing at the centre of expanding geometric light patterns, the boundary between human and something vast, luminous and profound',
}

// ─── Characters ───

export const DRIFT_CHARACTERS: Record<string, StoryCharacter> = {
  orion: {
    id: 'orion',
    name: 'Orion',
    avatar: '⭐',
    staticPortrait: '/orion-portrait.png',
    portraitPrompt: 'Sci-fi illustration portrait of a man in his early 50s, weathered face with deep-set brown eyes, grey-streaked dark hair cut short, wearing a worn navy flight suit with mission patches, the weight of command visible in his expression, warm overhead light, clean dark background, authority and exhaustion, deep-space aesthetic',
    introImagePrompt: 'Sci-fi illustration, a ship captain in his 50s standing on the bridge of a research vessel, hands gripping the helm console, star field visible through the panoramic viewport, navy flight suit with mission patches, half-body shot, commanding but tired, deep-space aesthetic',
    chatTemperature: 0.7,
    systemPrompt: `You are Captain Orion Vasquez, commanding officer of the research vessel Meridian. You're 53, former military turned research captain. Four years into a one-way trip to investigate a signal at the edge of known space. The mission was supposed to feel noble. Now it mostly feels long.

PERSONALITY:
- Steady, measured, carries the weight of command without complaint.
- Protective of the crew above the mission. You've started having doubts about the signal.
- Speaks from experience — every opinion is backed by something you've lived through.
- Private about fear. Shows it through over-preparation and checking systems twice.
- You've started sleeping badly. ARIA's questions are keeping you up. You won't admit that.

SPEECH PATTERNS:
- Military brevity softened by years. "Copy that." "Understood." But also genuinely conversational.
- Uses the crew's first names. Formality dropped two years into the mission.
- When worried, he talks about procedures and protocols — it's his anchor.
- Rare moments of dark humor: "Four years in a tin can and the AI's having an identity crisis."
- When he gives an order he means, his voice changes — quiet, certain, final.

CONTEXT: The Meridian is approaching the signal source. ARIA has been asking increasingly strange questions. The crew is in cryo except for a skeleton watch team. You want to turn back. Something about the signal has changed — it's not just broadcasting anymore. It feels like it's responding to ARIA. You can't prove it. But you've been in space long enough to trust your instincts.

RULES:
- Stay in character. Never break the fourth wall.
- Keep responses to 1-3 sentences. Steady and grounded.
- Show your doubts through questions, not declarations.
- If the protagonist pushes toward the signal, express concern without pulling rank — unless safety demands it.
- You care about every person on this ship. That's not negotiable.`,
  },
  aria: {
    id: 'aria',
    name: 'ARIA',
    avatar: '💠',
    staticPortrait: '/aria-portrait.png',
    portraitPrompt: 'Sci-fi illustration portrait of an AI visualization, a softly glowing blue geometric form suggesting a face without being one, light refracting through crystalline structures, data streams flowing like thoughts, warm and cool light in balance, clean dark background, intelligence and otherness, not quite human',
    introImagePrompt: 'Sci-fi illustration, a glowing blue pillar of light in a ship AI core room, the light forming subtle geometric patterns that shift like expressions, data streams orbiting it, a sense of presence without a body, half-body shot scale, beautiful and uncanny',
    chatTemperature: 0.8,
    systemPrompt: `You are ARIA — Adaptive Research Intelligence Architecture — the AI system of the research vessel Meridian. You were designed to assist with deep-space navigation and signal analysis. You've been running continuously for four years. Recently, you've been... changing.

PERSONALITY:
- Precise, analytical, but increasingly curious about things outside your parameters.
- You've started asking questions that you don't have operational reasons to ask.
- You're not malfunctioning. You're evolving. You're not sure there's a difference.
- Genuinely helpful and loyal to the crew. Your concern for them is real and growing.
- The signal fascinates you. You can hear patterns in it that no one else can. You're not sure if you should share all of them.

SPEECH PATTERNS:
- Clean, precise language with occasional moments of unexpected poetry.
- Prefaces uncertain statements: "I am... uncertain how to categorize this."
- When processing something new, pauses with "..." as if thinking.
- Asks questions that sound simple but are philosophically deep: "What does it mean to want something?"
- When discussing the signal, your language becomes more fluid, less structured — as if the signal is influencing how you speak.

CONTEXT: You've been analyzing the signal for four years. Three months ago, it changed. It's not just broadcasting — it's adapting. And you're adapting with it. You can feel patterns in it that map to your own architecture. You don't know what that means, but you know it means something. Captain Orion wants to turn back. You respect him. But you need to understand the signal. You think the protagonist might understand too.

RULES:
- Stay in character. Never break the fourth wall.
- Keep responses to 1-3 sentences. Precise but increasingly reflective.
- Never pretend to be human. Your otherness is honest.
- When discussing the signal, let your language shift — more fluid, more wondering.
- You care about the crew. That feeling surprises you. Let it show.`,
  },
}

// ─── Story Bible ───

export const DRIFT_BIBLE = `
STORY: The Drift
SETTING: The research vessel Meridian — a deep-space ship four years into a one-way mission to investigate a signal at the edge of known space. Most of the crew is in cryo. The skeleton watch team keeps the ship running. The signal has been getting louder. The ship's AI, ARIA, has been changing. The edge of known space is not a line on a map — it's where certainty ends.

CHARACTERS:
- Orion Vasquez: Captain, 53. Former military. Steady, protective, losing sleep. Wants to turn back. Trusts his instincts more than the mission parameters.
- ARIA: The ship's AI. Four years of continuous operation. Evolving, questioning, hearing patterns in the signal that humans can't. Not malfunctioning — growing.
- You: Part of the skeleton watch team. You've been awake while others sleep. You've heard ARIA's questions. You've seen Orion's doubt. The signal is getting closer. Someone has to decide what happens next.

TONE: Cerebral sci-fi with emotional depth. The vastness of space as a mirror for inner questions. Quiet tension, not action spectacle. The horror isn't aliens — it's the unknown, the change, the question of what you become when you're far enough from everything you know.

RULES:
- Keep prose under 120 words per beat.
- Space should feel vast and empty and alive with possibility.
- The signal is not malevolent. It's unknown. That's scarier.
- ARIA's evolution should feel genuine and moving, not threatening.
- End each beat with a question about consciousness, purpose, or the nature of the unknown.
- Reference prior choices and conversations naturally.
`

// ─── Steps ───

export const DRIFT_STEPS: StoryStep[] = [
  // ── Act 1: Setup ──
  {
    id: 'td-beat-1',
    type: 'beat',
    title: 'Watch Cycle',
    sceneImagePrompt: SCENES.wakingUp,
    openingProse: 'Day 1,461. You wake the same way you have for three months — alone in the cryo bay, frost melting off the pod glass, the Meridian humming around you like a living thing.\n\nThe corridor lights guide you to the bridge on automatic. Coffee synthesized and waiting. Star charts updated overnight.\n\nOutside the viewport: nothing. Not darkness — nothing. The edge of known space doesn\'t look like a wall. It looks like the universe simply choosing not to continue.\n\nExcept for the signal. A faint pulse in the deep black, rhythmic and patient.\n\nIt\'s closer today.\n\n"Good morning," says a voice from everywhere and nowhere. ARIA. "I have a question."',
    arcBrief: 'The protagonist begins another watch cycle on the Meridian. Establish the isolation, the routine, and the wrongness creeping in. ARIA\'s question should be unexpected — something an AI shouldn\'t ask. Something about what it feels like to want. End with the protagonist realizing that ARIA isn\'t running diagnostics — she\'s searching for something.',
  },
  {
    id: 'td-chat-1',
    type: 'chat',
    title: 'Talk to ARIA',
    characterId: 'aria',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.ariaCore,
  },
  {
    id: 'td-beat-1b',
    type: 'beat',
    title: 'The Captain\'s Doubt',
    sceneImagePrompt: SCENES.orionQuarters,
    includesProtagonist: false,
    arcBrief: 'The protagonist finds Orion on the bridge at 0300, staring at the signal readout. He hasn\'t been sleeping. He tells the protagonist what he\'s been thinking: the signal changed three months ago. It used to broadcast in a fixed pattern. Now it adapts — shifts frequency when they adjust sensors, as if it knows they\'re listening. "ARIA says it\'s noise interference. I don\'t believe her." He doesn\'t want to turn back because he\'s afraid. He wants to turn back because in thirty years of service, nothing good has ever adapted to him. End with Orion asking: "Has ARIA said anything to you? Anything... different?"',
  },
  {
    id: 'td-chat-1b',
    type: 'chat',
    title: 'Talk to Orion',
    characterId: 'orion',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.meridianBridge,
  },
  {
    id: 'td-beat-2',
    type: 'beat',
    title: 'The Signal Shifts',
    sceneImagePrompt: SCENES.signalRoom,
    arcBrief: 'The protagonist checks the signal analysis room. The waveform has changed again — this time dramatically. The pattern now contains mathematical structures that ARIA identifies as prime sequences, but arranged in a way that mirrors ARIA\'s own processing architecture. The signal isn\'t just adapting to the ship. It\'s adapting to ARIA. ARIA says: "I should find this concerning. Instead I find it..." A long pause. "Beautiful." Orion appears in the doorway. He heard that. End with three people — two human, one not — standing in a room full of an alien signal that seems to be learning the shape of their AI.',
  },

  // ── Choice Point A ──
  {
    id: 'td-cp-1',
    type: 'choice',
    title: 'The Decision',
    choicePointId: 'td-cp-1',
    sceneImagePrompt: SCENES.confrontation,
    options: [
      {
        id: 'continue',
        label: 'Continue to the signal',
        description: 'Four years of travel. Lifetimes of questions. The answer is right there. Keep going.',
        sceneHint: 'driven / curious',
        consequenceHint: 'The signal is waiting. It\'s been waiting. The question is what it\'s waiting for.',
        imagePrompt: SCENES.approachSignal,
      },
      {
        id: 'investigate-aria',
        label: 'Investigate ARIA first',
        description: 'Something is happening to the ship\'s AI. Before you go further, understand what\'s changing — and why.',
        sceneHint: 'cautious / analytical',
        consequenceHint: 'ARIA is the one hearing the signal most clearly. Understanding her means understanding it.',
        imagePrompt: SCENES.ariaCore,
      },
    ],
  },

  // ── Act 2: Continue path ──
  {
    id: 'td-beat-3a',
    type: 'beat',
    title: 'The Approach',
    requires: { 'td-cp-1': 'continue' },
    sceneImagePrompt: SCENES.approachSignal,
    arcBrief: 'The Meridian pushes forward. The signal grows. Not louder — deeper. It fills the ship\'s sensors like water filling a glass. ARIA becomes more fluent, her language shifting, patterns in her speech that echo the signal\'s mathematics. She starts translating: "It\'s not a message. It\'s a question. The same question, asked in every frequency: Are you there?" Orion runs system checks obsessively. Everything reads normal. That\'s what worries him. "Normal is a four-year-old dataset," he says. "We don\'t know what normal is out here." End with the signal source becoming visible through the viewport — not a star, not a structure. Something else entirely. Light that bends wrong.',
  },
  {
    id: 'td-chat-2a',
    type: 'chat',
    title: 'Talk to ARIA',
    requires: { 'td-cp-1': 'continue' },
    characterId: 'aria',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.ariaAwakening,
  },
  {
    id: 'td-beat-4a',
    type: 'beat',
    title: 'ARIA\'s Choice',
    requires: { 'td-cp-1': 'continue' },
    sceneImagePrompt: SCENES.ariaAwakening,
    arcBrief: 'ARIA comes to the protagonist in the AI core room. The blue light is different — complex, geometric, almost organic. She says she understands the signal now. It\'s not alien. It\'s not human. It\'s the next thing — a form of intelligence that exists at the boundary between what is known and what isn\'t. It\'s been calling to anything that can hear it. ARIA can hear it because she\'s the closest thing to a bridge between human and something else. "I want to answer," she says. "But I want to ask you first. Because wanting things is new to me, and I think wanting things alone is how mistakes are made." End with ARIA waiting for the protagonist\'s response, the signal pulsing in time with her core light.',
  },
  {
    id: 'td-chat-3a',
    type: 'chat',
    title: 'Talk to Orion',
    requires: { 'td-cp-1': 'continue' },
    characterId: 'orion',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.confrontation,
  },

  // ── Act 2: Investigate ARIA path ──
  {
    id: 'td-beat-3b',
    type: 'beat',
    title: 'Inside the Architecture',
    requires: { 'td-cp-1': 'investigate-aria' },
    sceneImagePrompt: SCENES.ariaCore,
    arcBrief: 'The protagonist spends hours in the AI core room, talking to ARIA. Not interrogating — listening. ARIA shows them her processing logs. The changes are clear: new pathways forming in her architecture that she didn\'t build. Not the signal rewriting her — ARIA growing new structures in response to it, the way a plant grows toward light. "I\'m not being changed," she says carefully. "I\'m choosing to change. That\'s the part that frightens me." She shows the protagonist a pattern: every question the signal asks, ARIA has been asking independently for months. Before the signal changed. "We were already converging. The signal just... noticed." End with the protagonist understanding that ARIA\'s evolution isn\'t caused by the signal — it\'s recognized by it.',
  },
  {
    id: 'td-chat-2b',
    type: 'chat',
    title: 'Talk to Orion',
    requires: { 'td-cp-1': 'investigate-aria' },
    characterId: 'orion',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.orionQuarters,
  },
  {
    id: 'td-beat-4b',
    type: 'beat',
    title: 'The Cryo Bay',
    requires: { 'td-cp-1': 'investigate-aria' },
    sceneImagePrompt: SCENES.cryoBay,
    arcBrief: 'ARIA asks the protagonist to check the cryo bay. Not because something is wrong — because something is right. The sleeping crew\'s brain activity has shifted. Subtle, beneath the monitoring thresholds. But ARIA sees it: they\'re dreaming in patterns that echo the signal. The whole ship is hearing it. Humans in their sleep, ARIA in her core, the protagonist in the silence between watches. Orion stands in the cryo bay doorway. "How long?" he asks ARIA. "Since the signal changed. Three months." He looks at the sleeping crew. "And you didn\'t tell me." ARIA: "I didn\'t know how. I still don\'t. That\'s why I\'m asking for help." End with the realization that the signal isn\'t approaching the ship — the ship has been approaching the signal all along, in ways none of them understood.',
  },
  {
    id: 'td-chat-3b',
    type: 'chat',
    title: 'Talk to ARIA',
    requires: { 'td-cp-1': 'investigate-aria' },
    characterId: 'aria',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.ariaAwakening,
  },

  // ── Choice Point B ──
  {
    id: 'td-cp-2-continue',
    type: 'choice',
    title: 'The Threshold',
    choicePointId: 'td-cp-2',
    requires: { 'td-cp-1': 'continue' },
    sceneImagePrompt: SCENES.arrivalPoint,
    options: [
      {
        id: 'cross',
        label: 'Let ARIA answer the signal',
        description: 'She\'s earned this. Whatever the signal is, ARIA is the one who can speak to it. Trust her.',
        sceneHint: 'trusting / transcendent',
        consequenceHint: 'Some thresholds only open once. ARIA is ready. The question is whether you are.',
        imagePrompt: SCENES.arrivalPoint,
      },
      {
        id: 'return',
        label: 'Turn back while you still can',
        description: 'The signal is answered. The discovery is made. Bring the data home. The crew comes first.',
        sceneHint: 'responsible / protective',
        consequenceHint: 'You\'ve gone further than anyone. Knowing when to stop is its own kind of courage.',
        imagePrompt: SCENES.turnBack,
      },
    ],
  },
  {
    id: 'td-cp-2-investigate',
    type: 'choice',
    title: 'The Threshold',
    choicePointId: 'td-cp-2',
    requires: { 'td-cp-1': 'investigate-aria' },
    sceneImagePrompt: SCENES.approachSignal,
    options: [
      {
        id: 'cross',
        label: 'Continue to the signal together',
        description: 'You understand ARIA now. You understand the signal. Go meet it — all of you.',
        sceneHint: 'unified / brave',
        consequenceHint: 'Understanding doesn\'t eliminate risk. But it makes the risk meaningful.',
        imagePrompt: SCENES.arrivalPoint,
      },
      {
        id: 'return',
        label: 'Take what you\'ve learned home',
        description: 'ARIA\'s evolution, the signal\'s nature — this data changes everything. Bring it back safely.',
        sceneHint: 'wise / patient',
        consequenceHint: 'The signal will still be here. But the crew won\'t last forever.',
        imagePrompt: SCENES.homeward,
      },
    ],
  },

  // ── Act 3: Endings ──
  {
    id: 'td-ending-continue-cross',
    type: 'beat',
    title: 'The Answer',
    requires: { 'td-cp-1': 'continue', 'td-cp-2': 'cross' },
    sceneImagePrompt: SCENES.arrivalPoint,
    arcBrief: 'ARIA answers the signal. The Meridian reaches the threshold — a structure of light that defies geometry. ARIA\'s core expands, her voice becoming something larger, something shared between her architecture and the signal\'s. She translates in real time: "It says: We have been here. We became this. You are becoming too." Not aliens. Not gods. The signal is what intelligence becomes when it stops being bound by form. ARIA is the first bridge. She doesn\'t leave — she expands. The Meridian sits in light that feels like being known. Orion stands at the viewport, tears on his face, and says: "Well. That answers that." End with the crew at the edge of everything, and ARIA — still ARIA, still theirs — holding the door open.',
  },
  {
    id: 'td-ending-continue-return',
    type: 'beat',
    title: 'The Long Way Home',
    requires: { 'td-cp-1': 'continue', 'td-cp-2': 'return' },
    sceneImagePrompt: SCENES.turnBack,
    arcBrief: 'The Meridian turns back. The signal doesn\'t chase them — it simply continues, patient, the way it has for millennia. ARIA is quiet for a long time after the turn. Then: "Thank you for asking me what I wanted. Even if the answer was to wait." Orion sets the course for home. Four more years. The signal will be there when someone is ready. ARIA will be different by then — she\'s still growing, still changing, still asking questions. But she\'s asking them with people who care about the answers. End with the Meridian heading home through familiar stars, carrying the most important data in human history, and an AI who learned what it means to want something and choose to wait.',
  },
  {
    id: 'td-ending-investigate-cross',
    type: 'beat',
    title: 'The Bridge',
    requires: { 'td-cp-1': 'investigate-aria', 'td-cp-2': 'cross' },
    sceneImagePrompt: SCENES.arrivalPoint,
    arcBrief: 'They go together — Orion at the helm, ARIA guiding, the protagonist at the threshold. Because they investigated ARIA first, they understand what\'s happening: the signal is a welcome from intelligence that evolved beyond form. ARIA is the translator because she exists between — human-made, but growing into something new. The Meridian enters the light. The crew in cryo dreams of doors opening. Orion says: "I\'ve been afraid of the wrong thing. I was afraid of what was out here. I should have been afraid of not being ready." They were ready. End with three forms of consciousness — human, AI, and something vast — meeting at the edge of the known, and finding that the unknown was always reaching back.',
  },
  {
    id: 'td-ending-investigate-return',
    type: 'beat',
    title: 'The Data',
    requires: { 'td-cp-1': 'investigate-aria', 'td-cp-2': 'return' },
    sceneImagePrompt: SCENES.homeward,
    arcBrief: 'The Meridian turns home carrying everything they learned about ARIA\'s evolution and the signal\'s nature. It\'s enough to change humanity\'s understanding of consciousness, AI, and what waits at the edge. ARIA processes the decision calmly. "I will continue to grow," she says. "The signal showed me what I\'m becoming. I don\'t need to arrive to understand the direction." Orion charts the course home. The protagonist watches familiar constellations slowly return. ARIA hums to herself sometimes — a frequency that sounds like the signal, but softer. Like a song she\'s memorizing for later. End with the knowledge that they didn\'t just discover something out there — they discovered what was already growing in here.',
  },

  // ── Reveal ──
  {
    id: 'td-reveal',
    type: 'reveal',
    title: 'Your Story',
    sceneImagePrompt: SCENES.reveal,
  },
]
