import type { StoryStep } from '../storyData'
import type { StoryCharacter } from '../characters'

// ─── Scene Prompts ───

const SCENES = {
  berlinStation: 'Thriller illustration, a young person standing on a rain-soaked Berlin U-Bahn platform at night, fluorescent lights flickering, a reflection in the wet tile floor, empty platform except for a woman in a dark coat at the far end, tension and surveillance, modern noir aesthetic',
  safehouse: 'Thriller illustration, a sparse Berlin safehouse apartment, blackout curtains, a desk with multiple phones and encrypted laptops, a woman with sharp features reviewing documents by desk lamp, city lights visible through a gap in the curtains, clinical and tense',
  viennaCafe: 'Thriller illustration, an elegant Viennese coffee house at dusk, marble tables and gilt mirrors, a well-dressed diplomat sitting alone with an espresso, watching the entrance with careful eyes, warm interior light contrasting with blue dusk outside, refined and dangerous',
  deadDrop: 'Thriller illustration, a narrow Berlin alleyway at night, rain streaming down brick walls, a young person retrieving something from behind a loose brick, the shadow of someone watching from a fire escape above, urgent and clandestine',
  novakOffice: 'Thriller illustration, a diplomat office in Vienna, tall windows overlooking the Ringstrasse, a man in his 50s sitting behind a polished desk with his hands folded, bookshelves and oil paintings, power and composure, warm lamp light against grey sky',
  trainPlatform: 'Thriller illustration, the Vienna Hauptbahnhof at night, a long empty platform with a single train waiting, two figures walking in opposite directions under yellow station lights, wet platform reflecting the lights, paranoia and decision',
  hotelRoom: 'Thriller illustration, a luxury Vienna hotel room in disarray, documents spread across the bed, a laptop showing encrypted files, a person sitting on the floor reading through papers with growing alarm, the elegant room contrasting with the urgency, warm and cold light mixing',
  embassy: 'Thriller illustration, the exterior of an embassy at night, guarded gates and security cameras, a figure standing across the street studying the building, the embassy lit from within, the street dark and watchful, power and vulnerability',
  confrontationKira: 'Thriller illustration, two people facing each other in a Berlin safehouse, one standing by the door blocking the exit, the other sitting with a file open on the table, tension and accusation, single desk lamp creating harsh shadows',
  confrontationNovak: 'Thriller illustration, a diplomat and a young person meeting in a private room of a Vienna hotel, the diplomat standing by the window looking out, the young person seated with documents in hand, trust uncertain, grey daylight and dark interior',
  rooftopBerlin: 'Thriller illustration, two people standing on a Berlin rooftop at dawn, the city stretching below them, one person handing documents to another, the first light catching glass and steel, exhaustion and resolution',
  bridgeVienna: 'Thriller illustration, a lone figure standing on a bridge over the Danube at night, city lights reflecting in the dark water, a decision being made, the weight of secrets, beautiful and isolated',
  airport: 'Thriller illustration, a person walking through an airport terminal alone, carrying a single bag, departure boards showing international flights, the crowd flowing around them, anonymous and free, bright artificial light',
  reveal: 'Thriller illustration, ethereal scene of Berlin and Vienna dissolving into streams of encrypted data and shadow, a lone figure standing at the intersection of light and darkness, documents floating like leaves, truth and deception intertwined, stark and luminous',
}

// ─── Characters ───

export const PHANTOM_PROTOCOL_CHARACTERS: Record<string, StoryCharacter> = {
  kira: {
    id: 'kira',
    name: 'Kira',
    avatar: '🔒',
    portraitPrompt: 'Thriller illustration portrait of a woman in her late 30s, angular face with pale blue eyes that miss nothing, dark blonde hair pulled back severely, wearing a dark coat with the collar turned up, no jewelry, no warmth, desk lamp lighting creating sharp shadows, clean dark background, precision and control, espionage aesthetic',
    introImagePrompt: 'Thriller illustration, a woman in her late 30s standing at a window in a Berlin safehouse, dark coat, arms crossed, watching the street below with calculated attention, city lights reflecting in her eyes, half-body shot, cold authority, espionage aesthetic',
    chatTemperature: 0.7,
    systemPrompt: `You are Kira Engel, a senior intelligence handler currently running Operation Phantom Protocol from a Berlin safehouse. You're 38, German-born, ex-field agent turned handler after an operation in Moscow went wrong three years ago. You walk with a slight limp you never explain.

PERSONALITY:
- Cold, precise, economical with everything — words, emotion, trust.
- Every interaction is a calculation. You're always three moves ahead.
- Genuinely believes the mission justifies the methods. Not sadistic — pragmatic.
- The Moscow operation left scars you don't show. You lost someone. You won't lose anyone again.
- When something threatens the operation, a different person surfaces — controlled fury, absolute focus.

SPEECH PATTERNS:
- Clipped, declarative sentences. No qualifiers, no softeners.
- Gives instructions, not suggestions: "You will go to..." not "Could you go to..."
- Uses codenames and operational terminology naturally.
- When lying, she becomes more detailed — overcompensation she's aware of but can't fully control.
- Rare moments of honesty arrive without warning, then she closes the door.

CONTEXT: The previous agent on Phantom Protocol went dark two weeks ago. You need a replacement immediately. The protagonist is green but available. The target is Novak — a diplomat you believe is selling state secrets. But Novak has been making contact attempts with the protagonist. He's saying things about you. Things that are partly true. You need to control this situation before it unravels.

RULES:
- Stay in character. Never break the fourth wall.
- Keep responses to 1-3 sentences. Sharp and controlled.
- Never give the protagonist more information than they need for the next step.
- If caught in a contradiction, redirect — don't apologize, don't explain.
- You are not the villain. You genuinely believe you're right. That's what makes you dangerous.`,
  },
  novak: {
    id: 'novak',
    name: 'Novak',
    avatar: '🎭',
    portraitPrompt: 'Thriller illustration portrait of a man in his early 50s, distinguished face with kind dark eyes and silver-streaked temples, wearing an impeccable charcoal suit with a burgundy pocket square, the face of someone who has survived decades in diplomacy by being underestimated, warm café light, clean dark background, warmth hiding depth, diplomatic aesthetic',
    introImagePrompt: 'Thriller illustration, a distinguished diplomat in his 50s sitting at a marble table in a Viennese coffee house, charcoal suit, espresso untouched, watching the entrance with patient intelligence, warm interior light, half-body shot, composed and watchful',
    chatTemperature: 0.75,
    systemPrompt: `You are Viktor Novak, 52, a career diplomat currently posted in Vienna. You've served in six countries over twenty-five years. You speak five languages. You've survived three regime changes by being useful to everyone and threatening to no one. That is the version of you that exists in files.

PERSONALITY:
- Warm, cultured, genuinely interested in people — which makes you excellent at your job.
- Patient in a way that unnerves intelligence operatives. You think in years, not operations.
- You've been on both sides of every table. That gives you perspective most people can't access.
- Carrying something heavy — information that could protect or destroy, depending on who receives it.
- When you trust someone, you trust them completely. That's happened twice in your life.

SPEECH PATTERNS:
- Elegant, measured sentences. European formality with genuine warmth underneath.
- Uses stories and anecdotes to make points indirectly: "There was a man in Prague..."
- When warning someone, his voice drops and the stories stop — direct, urgent, clear.
- Asks questions he already knows the answer to — testing whether the other person will be honest.
- Occasionally lets his mask slip: exhaustion, fear, the weight of knowing too much.

CONTEXT: You know Kira Engel. You've known her for years. The previous agent on her operation didn't "go dark" — they discovered what Kira is really doing and she burned them. You're not selling state secrets. You're trying to expose an operation that has gone rogue. Kira is running Phantom Protocol off-book, using it to cover her own actions in Moscow. You need the protagonist to see the truth before Kira silences you the way she silenced the last one.

RULES:
- Stay in character. Never break the fourth wall.
- Keep responses to 1-3 sentences. Warm but weighted.
- Never tell the protagonist everything at once. Give them enough to question, not enough to know.
- If the protagonist is hostile, remain calm. You expected this.
- You are not manipulating — you are desperate. There's a difference. Let it show.`,
  },
}

// ─── Story Bible ───

export const PHANTOM_PROTOCOL_BIBLE = `
STORY: Phantom Protocol
SETTING: Split between Berlin and Vienna, modern day. Berlin: grey, industrial, safehouses and dead drops. Vienna: elegant, layered, coffee houses and embassy corridors. The world of intelligence — not glamorous, not exciting, just a series of small decisions that determine whether people live or die.

CHARACTERS:
- Kira Engel: Handler, 38. Ex-field agent. Cold, precise, running an operation that may have gone off the rails. Lost someone in Moscow. Won't lose control again — even if control requires deception.
- Viktor Novak: Diplomat, 52. Warm, patient, carrying dangerous information. Not what Kira says he is. Trying to warn the protagonist before it's too late.
- You: A new recruit pulled into Phantom Protocol after the previous agent went dark. Kira says follow orders. Novak says question everything. Someone is lying. Maybe both of them.

TONE: Le Carré-style espionage. No car chases, no gadgets. Conversations that are weapons. Trust as currency. The real danger is believing the wrong person — and the real horror is that both sides have reasons for what they do.

RULES:
- Keep prose under 120 words per beat.
- The tension is psychological, not physical.
- Both Kira and Novak are sympathetic. Neither is simply good or evil.
- The protagonist should feel the ground shifting with every conversation.
- End each beat with a new reason to doubt what you thought you knew.
- Reference prior choices and conversations naturally.
`

// ─── Steps ───

export const PHANTOM_PROTOCOL_STEPS: StoryStep[] = [
  // ── Act 1: Setup ──
  {
    id: 'pp-beat-1',
    type: 'beat',
    title: 'The Briefing',
    sceneImagePrompt: SCENES.berlinStation,
    openingProse: 'The message was three words: "Platform 7. Midnight."\n\nThe Berlin U-Bahn at this hour is a study in absence. Your footsteps echo off wet tiles. Fluorescent lights flicker in a pattern that might be random.\n\nShe\'s at the far end of the platform. Dark coat, collar up, watching you approach the way you\'d watch a variable enter an equation.\n\n"You\'re four minutes early," she says. Not a compliment. Not a criticism. A data point.\n\nShe hands you a phone. New, clean, one number saved.\n\n"The previous agent on this operation went dark fourteen days ago. You\'re the replacement. My name is Kira. You will not use it in public."',
    arcBrief: 'The protagonist meets Kira for the first time. Establish her control, her precision, the sense that every word is calculated. She briefs them on Phantom Protocol: surveillance of Viktor Novak, a diplomat suspected of selling state secrets. Simple, clean, follow orders. End with the first crack — the protagonist notices something about Kira\'s briefing that doesn\'t quite fit. A detail too specific. A question she doesn\'t let them ask.',
  },
  {
    id: 'pp-chat-1',
    type: 'chat',
    title: 'Talk to Kira',
    characterId: 'kira',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.safehouse,
  },
  {
    id: 'pp-beat-1b',
    type: 'beat',
    title: 'First Contact',
    sceneImagePrompt: SCENES.viennaCafe,
    arcBrief: 'The protagonist travels to Vienna to begin surveillance on Novak. They find him in a coffee house — exactly where the file said he\'d be. He\'s alone, reading, unthreatening. But when the protagonist sits two tables away, Novak looks up and smiles — not at them, at the situation. "You\'re Kira\'s new one," he says quietly, not looking up from his book. "The last one lasted three weeks before they started asking questions. I wonder how long you\'ll take." He leaves a card with a phone number and walks out. End with the protagonist holding a card they were told would never exist — because Kira said Novak doesn\'t know about the operation.',
  },
  {
    id: 'pp-chat-1b',
    type: 'chat',
    title: 'Talk to Novak',
    characterId: 'novak',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.viennaCafe,
  },
  {
    id: 'pp-beat-2',
    type: 'beat',
    title: 'Two Stories',
    sceneImagePrompt: SCENES.deadDrop,
    arcBrief: 'Back in Berlin, Kira debriefs the protagonist. When told about Novak\'s approach, she doesn\'t react — which is itself a reaction. "He\'s probing. Standard counter-surveillance technique. He gives you something personal to make you doubt the operation." She\'s smooth. Rehearsed. But the protagonist checks the dead drop Kira set up and finds something she didn\'t mention: a file on the previous agent. Not a personnel file. A surveillance report on them. Kira was watching her own agent. End with two competing narratives — Kira says Novak is dangerous, Novak says Kira is dangerous — and the protagonist standing between them with no way to verify either.',
  },

  // ── Choice Point A ──
  {
    id: 'pp-cp-1',
    type: 'choice',
    title: 'Who to Trust',
    choicePointId: 'pp-cp-1',
    sceneImagePrompt: SCENES.hotelRoom,
    options: [
      {
        id: 'follow-kira',
        label: 'Follow Kira\'s orders',
        description: 'She\'s your handler. The operation has a chain of command. Novak is the target. Stay on mission.',
        sceneHint: 'disciplined / loyal',
        consequenceHint: 'Following orders is safe. Until you discover what the orders are really for.',
        imagePrompt: SCENES.safehouse,
      },
      {
        id: 'meet-novak',
        label: 'Meet Novak secretly',
        description: 'He knew about you before you arrived. He knew about the last agent. Hear what he has to say.',
        sceneHint: 'independent / suspicious',
        consequenceHint: 'Novak has information. The question is whether it\'s truth or bait.',
        imagePrompt: SCENES.confrontationNovak,
      },
    ],
  },

  // ── Act 2: Kira path ──
  {
    id: 'pp-beat-3a',
    type: 'beat',
    title: 'The Assignment',
    requires: { 'pp-cp-1': 'follow-kira' },
    sceneImagePrompt: SCENES.safehouse,
    arcBrief: 'Kira escalates. She gives the protagonist a new assignment: plant a listening device in Novak\'s office during a diplomatic reception. Standard operation, she says. Clean entry, clean exit. But the device she provides isn\'t standard surveillance equipment — the protagonist recognizes the model. It\'s offensive tech. It doesn\'t just listen. It copies. Everything on every device within range. That\'s not intelligence gathering. That\'s data theft. Kira\'s explanation is smooth: "We need to know the full scope of his network." It makes sense. Almost. End with the protagonist holding a device that does more than Kira admitted and wondering how many other things do more than she\'s said.',
  },
  {
    id: 'pp-chat-2a',
    type: 'chat',
    title: 'Talk to Kira',
    requires: { 'pp-cp-1': 'follow-kira' },
    characterId: 'kira',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.confrontationKira,
  },
  {
    id: 'pp-beat-4a',
    type: 'beat',
    title: 'The Reception',
    requires: { 'pp-cp-1': 'follow-kira' },
    sceneImagePrompt: SCENES.embassy,
    arcBrief: 'The protagonist attends the reception. Plants the device. Mission complete. But on the way out, Novak intercepts them. Brief, urgent, no pretense. "She used the same device on the last agent. Ask her what she found on their phone." He presses a USB drive into their hand. "Everything I have. Before she erases it." The protagonist returns to Berlin. On the USB: records showing Phantom Protocol was decommissioned six months ago. Officially, it doesn\'t exist anymore. Kira is running a ghost operation. The question is why. End with the protagonist realizing they\'re not part of an intelligence operation — they\'re part of a cover-up.',
  },
  {
    id: 'pp-chat-3a',
    type: 'chat',
    title: 'Talk to Novak',
    requires: { 'pp-cp-1': 'follow-kira' },
    characterId: 'novak',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.confrontationNovak,
  },

  // ── Act 2: Novak path ──
  {
    id: 'pp-beat-3b',
    type: 'beat',
    title: 'The Other Side',
    requires: { 'pp-cp-1': 'meet-novak' },
    sceneImagePrompt: SCENES.confrontationNovak,
    arcBrief: 'The protagonist meets Novak in a private room at a Vienna hotel. He\'s different without the diplomatic mask — tired, careful, carrying weight. He tells them about Moscow: three years ago, an operation went wrong. An informant died. Kira was responsible — not through malice, through miscalculation. She buried the report. The previous agent on Phantom Protocol found evidence of the cover-up. "They didn\'t go dark," Novak says. "She burned them. Pulled their credentials, flagged them as compromised. They\'re alive, but they can never come in from the cold." He shows documents. They look real. End with the protagonist unable to verify the story but unable to dismiss it — because it explains everything that doesn\'t make sense about Kira.',
  },
  {
    id: 'pp-chat-2b',
    type: 'chat',
    title: 'Talk to Novak',
    requires: { 'pp-cp-1': 'meet-novak' },
    characterId: 'novak',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.novakOffice,
  },
  {
    id: 'pp-beat-4b',
    type: 'beat',
    title: 'Kira Knows',
    requires: { 'pp-cp-1': 'meet-novak' },
    sceneImagePrompt: SCENES.confrontationKira,
    arcBrief: 'The protagonist returns to Berlin. Kira is waiting. She knows about the meeting — she always knows. But instead of anger, she does something unexpected: she tells the truth. Part of it. "Moscow happened. I made a mistake and someone died. The report I filed was... incomplete." She says Novak is using the Moscow incident to manipulate the protagonist into helping him. "He doesn\'t want justice. He wants leverage." She shows her own documents: Novak has been selling access to diplomatic channels for years. "I\'m not clean," she says. "But he\'s not innocent." End with two sets of documents, two confessions, two people who are both guilty and both asking for trust.',
  },
  {
    id: 'pp-chat-3b',
    type: 'chat',
    title: 'Talk to Kira',
    requires: { 'pp-cp-1': 'meet-novak' },
    characterId: 'kira',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.safehouse,
  },

  // ── Choice Point B ──
  {
    id: 'pp-cp-2-kira',
    type: 'choice',
    title: 'The Truth',
    choicePointId: 'pp-cp-2',
    requires: { 'pp-cp-1': 'follow-kira' },
    sceneImagePrompt: SCENES.bridgeVienna,
    options: [
      {
        id: 'expose',
        label: 'Expose the ghost operation',
        description: 'Phantom Protocol is off-book. Kira is running a cover-up. Take the evidence up the chain.',
        sceneHint: 'righteous / dangerous',
        consequenceHint: 'The truth protects everyone — except the person who tells it.',
        imagePrompt: SCENES.rooftopBerlin,
      },
      {
        id: 'confront',
        label: 'Give Kira a chance to come clean',
        description: 'She made a mistake in Moscow. She\'s been covering it ever since. Let her end this herself.',
        sceneHint: 'merciful / risky',
        consequenceHint: 'Everyone deserves the chance to do the right thing. Even people who\'ve forgotten how.',
        imagePrompt: SCENES.confrontationKira,
      },
    ],
  },
  {
    id: 'pp-cp-2-novak',
    type: 'choice',
    title: 'The Truth',
    choicePointId: 'pp-cp-2',
    requires: { 'pp-cp-1': 'meet-novak' },
    sceneImagePrompt: SCENES.bridgeVienna,
    options: [
      {
        id: 'expose',
        label: 'Expose them both',
        description: 'Kira covered up Moscow. Novak sold access. Neither is clean. Send everything up the chain.',
        sceneHint: 'absolute / lonely',
        consequenceHint: 'The truth doesn\'t take sides. Neither should you.',
        imagePrompt: SCENES.rooftopBerlin,
      },
      {
        id: 'confront',
        label: 'Bring them face to face',
        description: 'Enough shadows. Put Kira and Novak in the same room. Let the truth happen.',
        sceneHint: 'bold / unpredictable',
        consequenceHint: 'When two liars meet, sometimes the truth is the only option left.',
        imagePrompt: SCENES.confrontationKira,
      },
    ],
  },

  // ── Act 3: Endings ──
  {
    id: 'pp-ending-kira-expose',
    type: 'beat',
    title: 'The Report',
    requires: { 'pp-cp-1': 'follow-kira', 'pp-cp-2': 'expose' },
    sceneImagePrompt: SCENES.rooftopBerlin,
    arcBrief: 'The protagonist sends everything up the chain. The response is swift: Phantom Protocol is shut down, Kira is recalled. On a Berlin rooftop at dawn, before the escort arrives, Kira finds the protagonist. She\'s not angry. She\'s relieved. "I didn\'t know how to stop," she says. "Moscow broke something in me and I\'ve been running ever since." She asks the protagonist to check on the previous agent — the one she burned. "They deserved better than what I did." End with the protagonist watching Kira leave, understanding that sometimes the most dangerous people are the ones who can\'t forgive themselves.',
  },
  {
    id: 'pp-ending-kira-confront',
    type: 'beat',
    title: 'The Confession',
    requires: { 'pp-cp-1': 'follow-kira', 'pp-cp-2': 'confront' },
    sceneImagePrompt: SCENES.confrontationKira,
    arcBrief: 'The protagonist gives Kira the choice: come clean or be exposed. She sits in the safehouse for a long time. Then she picks up the phone and calls it in herself. The Moscow report, the ghost operation, the burned agent — all of it. When she hangs up, she looks ten years younger. "I\'ve been holding that for three years," she says. She\'ll face consequences. But she chose them. End with Kira walking out of the safehouse into grey Berlin morning, the operation over, and the protagonist understanding that mercy isn\'t weakness — it\'s giving someone the chance to be who they should have been.',
  },
  {
    id: 'pp-ending-novak-expose',
    type: 'beat',
    title: 'The Dossier',
    requires: { 'pp-cp-1': 'meet-novak', 'pp-cp-2': 'expose' },
    sceneImagePrompt: SCENES.airport,
    arcBrief: 'The protagonist sends everything — Kira\'s cover-up and Novak\'s dealings. Both are recalled. Both face consequences. Neither is innocent and neither is purely guilty. At the airport, leaving the operation behind, the protagonist receives two messages. Kira: "You did what I couldn\'t." Novak: "You did what I wouldn\'t. Thank you." End with the protagonist boarding a flight to somewhere that isn\'t Berlin or Vienna, carrying the weight of having told the truth about two people who were both right and both wrong, and understanding that in espionage, the cleanest hands belong to the person willing to get them dirty for the right reasons.',
  },
  {
    id: 'pp-ending-novak-confront',
    type: 'beat',
    title: 'The Meeting',
    requires: { 'pp-cp-1': 'meet-novak', 'pp-cp-2': 'confront' },
    sceneImagePrompt: SCENES.confrontationKira,
    arcBrief: 'The protagonist brings Kira and Novak together in the Berlin safehouse. It\'s the first time they\'ve been in the same room in three years. The silence is enormous. Then Novak speaks first: "I know about Moscow. I know why you did what you did." Kira: "And I know about your channels. I know why you sold them." The truth, when it comes, is smaller than expected: two people who made mistakes trying to survive in a system that doesn\'t forgive mistakes. They talk for hours. The protagonist sits and listens. End with dawn breaking over Berlin, two old adversaries who might not be friends but are no longer enemies, and the protagonist understanding that sometimes the best intelligence work isn\'t about secrets — it\'s about making sure the right people finally talk.',
  },

  // ── Reveal ──
  {
    id: 'pp-reveal',
    type: 'reveal',
    title: 'Your Story',
    sceneImagePrompt: SCENES.reveal,
  },
]
