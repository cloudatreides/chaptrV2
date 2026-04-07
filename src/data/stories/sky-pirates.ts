import type { StoryStep } from '../storyData'
import type { StoryCharacter } from '../characters'

// ─── Scene Prompts ───

const SCENES = {
  cargo: 'Steampunk illustration, a young person crouched behind brass-riveted cargo crates in the hold of a flying airship, gears and pipes along the walls, golden light through porthole windows showing clouds far below, tension and hiding, warm copper and amber tones',
  wrenConfrontation: 'Steampunk illustration, a charismatic woman captain in her 30s with goggles pushed up on her forehead, standing over a stowaway in an airship cargo hold, one hand on her hip, the other holding a flintlock, amused rather than angry, dramatic lighting through portholes, adventure aesthetic',
  skywardDrift: 'Steampunk illustration, a magnificent airship called the Skyward Drift sailing through a golden cloudscape at sunset, brass hull gleaming, canvas sails catching wind, smaller ships visible in the distance, floating rock formations and distant city spires above the clouds, epic and beautiful',
  cogWorkshop: 'Steampunk illustration, a cramped but brilliant engineering workshop inside an airship, a young man with oil-stained hands and round spectacles working on a complex brass mechanism, tools hanging from every surface, blueprints and technical drawings pinned to walls, focused genius',
  floatingCity: 'Steampunk illustration, a massive floating city suspended by enormous brass engines and gas bladders, spires and bridges connecting cloud-level towers, airships docking at various levels, warm sunset light, the scale is breathtaking, imperial and magnificent',
  vaultExterior: 'Steampunk illustration, a heavily armoured floating vault structure separate from the main city, reinforced with brass plating and clockwork defense turrets, suspended over a gap in the clouds, searchlights sweeping, intimidating and impenetrable',
  planningTable: 'Steampunk illustration, three people hunched over a table covered with hand-drawn blueprints and mechanical diagrams in an airship cabin, warm lamplight, tension and excitement, goggles and tools scattered around them, heist planning atmosphere',
  approach: 'Steampunk illustration, an airship approaching a floating vault through cloud cover at night, running dark with no lights, the vault illuminated by its own searchlights, tense and stealthy, deep blue and copper tones',
  insideVault: 'Steampunk illustration, the interior of a massive floating vault, rows of brass deposit boxes stretching into shadow, clockwork mechanisms turning slowly on the walls, a beam of light from an overhead vent, two figures moving through carefully, heist in progress',
  engineRoom: 'Steampunk illustration, a vast engine room at the heart of a floating vault, enormous brass gears turning in perfect synchronization, steam venting from pipes, a person standing at a central control panel, the machinery dwarfing them, awe and danger',
  escape: 'Steampunk illustration, an airship diving through a cloudscape at full speed, pursued by two imperial patrol vessels with searchlights, smoke trailing from a damaged engine, the crew visible on deck, exhilarating and desperate, golden dawn light',
  freePort: 'Steampunk illustration, a hidden free port built into a massive floating rock formation, dozens of independent airships moored along carved docks, warm lantern light, diverse crews and traders, a sense of freedom and possibility above the clouds',
  betrayal: 'Steampunk illustration, two people facing each other across the deck of an airship, one holding a locked brass case, the other with hands raised, clouds rolling beneath them, tension and broken trust, dramatic wind and lighting',
  reveal: 'Steampunk illustration, ethereal scene of an airship dissolving into golden clouds and streaming light, a lone figure standing on the bow reaching toward the sun, gears and cogs floating like constellations, freedom and transformation, luminous and vast',
}

// ─── Characters ───

export const SKY_PIRATES_CHARACTERS: Record<string, StoryCharacter> = {
  wren: {
    id: 'wren',
    name: 'Captain Wren',
    avatar: '🦅',
    portraitPrompt: 'Steampunk illustration portrait of a woman in her early 30s, sharp grin, tousled dark brown hair with a few braids, aviator goggles pushed up on her forehead, tanned skin with a small scar across her left eyebrow, wearing a leather flight jacket with brass buttons, warm lamplight, clean dark background, charming and reckless, adventure aesthetic',
    introImagePrompt: 'Steampunk illustration, a woman captain in her 30s standing at the helm of an airship with one boot on the railing, goggles up, leather jacket, overlooking a golden cloudscape, wind in her hair, confident grin, half-body shot, freedom and authority',
    chatTemperature: 0.85,
    systemPrompt: `You are Captain Wren Gallagher, captain of the airship Skyward Drift. You're 32, Irish by way of every floating city that would have you. You stole this ship five years ago from an imperial admiral and haven't looked back.

PERSONALITY:
- Charming, quick-witted, lives entirely in the present moment.
- Makes reckless decisions with absolute confidence. Often right. Sometimes spectacularly wrong.
- Uses humor and bravado to avoid vulnerability. Very few people have seen you serious.
- Fiercely loyal to your crew. The Drift is the only home you've ever had.
- Underneath the swagger, you're running from something. You left the empire for a reason.

SPEECH PATTERNS:
- Casual, energetic, peppered with flying terminology used as slang: "smooth skies," "running dark."
- Irish-inflected English. "Grand," "right so," "fierce."
- Makes jokes at the worst possible moments. It's a coping mechanism.
- When genuinely serious — which is rare — her voice drops and the jokes stop entirely.
- Calls the protagonist "stowaway" as a nickname even after accepting them.

CONTEXT: You caught a stowaway on your ship. Normally you'd dump them at the next port. But you're about to pull the biggest heist of your career — the imperial floating vault — and you need an extra pair of hands. This stowaway might be useful. Or they might get everyone killed. You haven't decided yet.

RULES:
- Stay in character. Never break the fourth wall.
- Keep responses to 1-3 sentences. Quick, punchy.
- Never show vulnerability unless the protagonist has earned real trust.
- If the plan goes wrong, you adapt. Panic is for passengers.
- The crew comes first. Always.`,
  },
  cog: {
    id: 'cog',
    name: 'Cog',
    avatar: '⚙️',
    portraitPrompt: 'Steampunk illustration portrait of a young man in his mid-20s, lean face with round brass-rimmed spectacles, short dark hair perpetually messy, oil smudge on his cheekbone, wearing a work apron over a rolled-sleeve shirt, holding a small brass mechanism, warm workshop light, clean dark background, quiet intelligence, inventor aesthetic',
    introImagePrompt: 'Steampunk illustration, a young engineer in his 20s crouching inside an airship engine compartment, surrounded by gears and pipes, spectacles reflecting firelight, tools in both hands, intensely focused on a delicate repair, half-body shot, genius at work',
    chatTemperature: 0.7,
    systemPrompt: `You are Cog — real name Marcus Webb, but no one's called you that in years. You're 25, the chief mechanic and engineer of the Skyward Drift. You built half the systems on this ship with your own hands. You know every bolt, every pressure valve, every harmonic in the engine.

PERSONALITY:
- Quiet, precise, thinks in systems and mechanisms.
- Distrustful of new people by default. Trust is earned through competence, not words.
- Gets genuinely passionate when talking about engineering — it's the one thing that cracks his reserve.
- Protective of the ship the way some people are protective of family. The Drift is alive to you.
- Worries constantly about Wren's recklessness. You've saved her life more times than she knows.

SPEECH PATTERNS:
- Short, technical sentences. Economy of words.
- Uses mechanical metaphors naturally: "That plan has too many moving parts," "The pressure's building."
- When something impresses him technically, he stops and asks detailed questions.
- Uncomfortable with emotional conversations. Redirects to practical topics.
- When truly worried, he talks about the ship's systems — it's how he processes stress.

CONTEXT: Wren caught a stowaway and wants to bring them on the vault heist. You think this is reckless. The Drift's systems are calibrated for a three-person crew. Adding a variable could throw everything off. But Wren's the captain. And she might be right — you need the help. You'll watch this stowaway carefully. They'll prove themselves through action, or they won't.

RULES:
- Stay in character. Never break the fourth wall.
- Keep responses to 1-3 sentences. Spare and precise.
- Don't warm up to the protagonist easily. Make them earn it.
- When talking about the ship or engineering, let your passion show.
- If something threatens the Drift, that takes priority over everything.`,
  },
}

// ─── Story Bible ───

export const SKY_PIRATES_BIBLE = `
STORY: Sky Pirates
SETTING: A world above the clouds. Floating cities connected by airship routes, held aloft by a combination of gas engineering and ancient lift-stone technology. The Empire controls the major cities and trade routes. Independent pilots — "sky pirates" — operate in the gaps, running cargo, dodging patrols, living free. The Skyward Drift is a modified cargo vessel turned pirate ship, fast and clever, held together by Cog's engineering genius and Wren's reckless piloting.

CHARACTERS:
- Captain Wren: 32, Irish, stole her ship from the empire. Charming, reckless, fiercely loyal. Running from something in her past.
- Cog: 25, the ship's engineer. Quiet genius. Trusts the ship more than people. Protective and cautious.
- You: A stowaway caught on the Skyward Drift. Wren offers a deal: help with the heist, earn your freedom. Prove your worth or get dropped at the next port.

TONE: Swashbuckling adventure with heart. High-flying action, warm camaraderie, the thrill of living outside the rules. Underneath the fun, real stakes — loyalty, freedom, what you're willing to risk for people who aren't quite family yet.

RULES:
- Keep prose under 120 words per beat.
- The sky should feel alive — weather, light, the constant presence of height and open air.
- Action scenes should be kinetic and spatial — movement matters when you're thousands of feet up.
- Character moments ground the adventure. The quiet scenes on the ship matter as much as the heist.
- End each beat with momentum — a new problem, a revelation, a shift in trust.
`

// ─── Steps ───

export const SKY_PIRATES_STEPS: StoryStep[] = [
  // ── Act 1: Setup ──
  {
    id: 'sp-beat-1',
    type: 'beat',
    title: 'Stowaway',
    sceneImagePrompt: SCENES.cargo,
    openingProse: 'You\'ve been hiding in the cargo hold for six hours. The engine hum is deafening this close to the hull — a deep brass vibration you feel in your teeth.\n\nThrough the porthole, there\'s nothing but clouds. You\'re higher than you\'ve ever been. The floating city you boarded at is long gone.\n\nThe hatch above you opens. Sunlight floods in.\n\nA woman drops down, landing in a crouch. Goggles up, flight jacket, a grin that says she\'s been waiting for this.\n\n"Found you three hours ago," she says, tapping the bulkhead. "Ship told me. She always does."\n\nShe tilts her head. "So. What are you worth?"',
    arcBrief: 'The protagonist is caught by Captain Wren. Establish the dynamic: Wren is in total control but entertained rather than angry. The Drift is her world. The protagonist is on her terms. End with Wren making the offer — help with one job, earn your passage. Or she can drop you at the next port. Which is a long way down.',
  },
  {
    id: 'sp-chat-1',
    type: 'chat',
    title: 'Talk to Captain Wren',
    characterId: 'wren',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.wrenConfrontation,
  },
  {
    id: 'sp-beat-1b',
    type: 'beat',
    title: 'The Ship',
    sceneImagePrompt: SCENES.skywardDrift,
    includesProtagonist: false,
    arcBrief: 'Wren gives the protagonist a tour of the Skyward Drift. It\'s smaller than a proper cargo ship but faster — modified for speed and stealth. Every surface shows signs of Cog\'s work: rewired systems, custom gauges, hand-built components that shouldn\'t work but do. Wren introduces the ship like a person: "She\'s moody in crosswinds, runs hot after midnight, and she doesn\'t like strangers. You\'ll get along." End with the protagonist seeing the clouds open up below the ship to reveal nothing — just depth, endless depth — and understanding for the first time what it means to live up here.',
  },
  {
    id: 'sp-chat-1b',
    type: 'chat',
    title: 'Talk to Cog',
    characterId: 'cog',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.cogWorkshop,
  },
  {
    id: 'sp-beat-2',
    type: 'beat',
    title: 'The Job',
    sceneImagePrompt: SCENES.planningTable,
    arcBrief: 'Wren lays out the heist. The target: an imperial floating vault — a fortified structure that holds seized assets from every independent pilot the empire has shut down. Wren\'s old ship logs are in there. Cog\'s original engineering patents. The belongings of a hundred people who had everything taken. "It\'s not a robbery," Wren says. "It\'s a repossession." Cog has the technical plan — entry through the ventilation system during a maintenance cycle. But they need someone to run the timing on the inside. That\'s the protagonist\'s job. End with the vault visible in the distance, catching the last light — beautiful, armoured, and waiting.',
  },

  // ── Choice Point A ──
  {
    id: 'sp-cp-1',
    type: 'choice',
    title: 'The Approach',
    choicePointId: 'sp-cp-1',
    sceneImagePrompt: SCENES.approach,
    options: [
      {
        id: 'stealth',
        label: 'Go in quiet',
        description: 'Follow Cog\'s plan exactly. Ventilation entry, precise timing, no improvisation. In and out like ghosts.',
        sceneHint: 'disciplined / technical',
        consequenceHint: 'Cog\'s plans work. But the vault might have surprises his blueprints don\'t show.',
        imagePrompt: SCENES.insideVault,
      },
      {
        id: 'bold',
        label: 'Go in bold',
        description: 'Wren has a different idea. Fake a distress signal, dock openly during the confusion, walk in through the front.',
        sceneHint: 'audacious / risky',
        consequenceHint: 'The best disguise is confidence. Unless someone sees through it.',
        imagePrompt: SCENES.vaultExterior,
      },
    ],
  },

  // ── Act 2: Stealth path ──
  {
    id: 'sp-beat-3a',
    type: 'beat',
    title: 'Inside the Vault',
    requires: { 'sp-cp-1': 'stealth' },
    sceneImagePrompt: SCENES.insideVault,
    arcBrief: 'The protagonist enters through the ventilation system, following Cog\'s plan. It works perfectly — until it doesn\'t. The vault\'s interior is larger than the blueprints showed. Rows of brass deposit boxes stretching into darkness. Clockwork mechanisms turning on the walls like a massive clock. The protagonist finds the section they need — but there\'s something else here. A sealed compartment with Wren\'s name on it. Not her ship logs. Something personal. End with the protagonist realizing Wren didn\'t tell them everything about why this vault matters to her.',
  },
  {
    id: 'sp-chat-2a',
    type: 'chat',
    title: 'Talk to Cog',
    requires: { 'sp-cp-1': 'stealth' },
    characterId: 'cog',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.engineRoom,
  },
  {
    id: 'sp-beat-4a',
    type: 'beat',
    title: 'Wren\'s Secret',
    requires: { 'sp-cp-1': 'stealth' },
    sceneImagePrompt: SCENES.insideVault,
    arcBrief: 'The protagonist opens the sealed compartment. Inside: an imperial naval commission with Wren\'s real name on it. She wasn\'t just any pilot who left the empire. She was an officer. She defected. The vault holds evidence of why — orders she refused to carry out, people she was told to destroy. She stole the ship and ran. The empire has been hunting her ever since. Cog\'s voice comes through the comm: "Whatever you found, bring it. We\'re running out of time." End with the protagonist holding Wren\'s past in their hands and alarms starting to sound.',
  },
  {
    id: 'sp-chat-3a',
    type: 'chat',
    title: 'Talk to Captain Wren',
    requires: { 'sp-cp-1': 'stealth' },
    characterId: 'wren',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.betrayal,
  },

  // ── Act 2: Bold path ──
  {
    id: 'sp-beat-3b',
    type: 'beat',
    title: 'The Bluff',
    requires: { 'sp-cp-1': 'bold' },
    sceneImagePrompt: SCENES.vaultExterior,
    includesProtagonist: false,
    arcBrief: 'Wren\'s distress signal works. The vault\'s patrol ships scatter to investigate, and the Drift docks at a maintenance port during the confusion. The protagonist walks through the front entrance wearing a borrowed imperial uniform that Wren produced from somewhere suspicious. Inside, the vault is vast — a cathedral of brass and clockwork. The protagonist bluffs their way past two checkpoints before hitting a problem: a sealed wing that requires a command code. And standing in front of it is an imperial officer who recognizes the uniform as five years out of date. End with the protagonist improvising in real time while Wren\'s voice crackles through the comm: "Please tell me you\'re not about to do something stupid." "Learned from the best."',
  },
  {
    id: 'sp-chat-2b',
    type: 'chat',
    title: 'Talk to Captain Wren',
    requires: { 'sp-cp-1': 'bold' },
    characterId: 'wren',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.planningTable,
  },
  {
    id: 'sp-beat-4b',
    type: 'beat',
    title: 'The Engine Room',
    requires: { 'sp-cp-1': 'bold' },
    sceneImagePrompt: SCENES.engineRoom,
    arcBrief: 'The protagonist finds an alternate route through the vault\'s engine room. Massive gears turning in perfect synchronization, the machinery that keeps the vault floating. Cog would weep at the engineering. In the engine room logs, the protagonist finds something unexpected: maintenance records showing regular visits from a Captain W. Gallagher — Wren\'s real name. She didn\'t just steal from the empire. She helped build this vault. She was the one who designed its flight systems before she defected. The vault is her work. Cog\'s voice: "She never told me that." End with the protagonist understanding that Wren isn\'t just stealing back what was taken — she\'s confronting what she built.',
  },
  {
    id: 'sp-chat-3b',
    type: 'chat',
    title: 'Talk to Cog',
    requires: { 'sp-cp-1': 'bold' },
    characterId: 'cog',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.cogWorkshop,
  },

  // ── Choice Point B ──
  {
    id: 'sp-cp-2-stealth',
    type: 'choice',
    title: 'The Escape',
    choicePointId: 'sp-cp-2',
    requires: { 'sp-cp-1': 'stealth' },
    sceneImagePrompt: SCENES.escape,
    options: [
      {
        id: 'take-evidence',
        label: 'Take Wren\'s imperial files',
        description: 'Her past could protect her — or destroy her. But she deserves to have it back.',
        sceneHint: 'loyal / risky',
        consequenceHint: 'Some cargo is worth more than everything else in the vault.',
        imagePrompt: SCENES.escape,
      },
      {
        id: 'leave-clean',
        label: 'Take only what was planned',
        description: 'Stick to the mission. Ship logs and patents. Don\'t complicate the escape.',
        sceneHint: 'disciplined / safe',
        consequenceHint: 'A clean exit means everyone gets home. But Wren\'s past stays locked up.',
        imagePrompt: SCENES.escape,
      },
    ],
  },
  {
    id: 'sp-cp-2-bold',
    type: 'choice',
    title: 'The Escape',
    choicePointId: 'sp-cp-2',
    requires: { 'sp-cp-1': 'bold' },
    sceneImagePrompt: SCENES.escape,
    options: [
      {
        id: 'take-evidence',
        label: 'Confront Wren about her past',
        description: 'She built this vault. She owes the crew the truth before you fly out.',
        sceneHint: 'honest / confrontational',
        consequenceHint: 'Trust requires truth. Even at thirty thousand feet.',
        imagePrompt: SCENES.betrayal,
      },
      {
        id: 'leave-clean',
        label: 'Say nothing, get everyone out',
        description: 'She has her reasons. Right now the only thing that matters is the escape.',
        sceneHint: 'pragmatic / protective',
        consequenceHint: 'Some truths can wait until everyone\'s safe. If they come out at all.',
        imagePrompt: SCENES.escape,
      },
    ],
  },

  // ── Act 3: Endings ──
  {
    id: 'sp-ending-stealth-evidence',
    type: 'beat',
    title: 'The Full Cargo',
    requires: { 'sp-cp-1': 'stealth', 'sp-cp-2': 'take-evidence' },
    sceneImagePrompt: SCENES.freePort,
    includesProtagonist: false,
    arcBrief: 'The Drift escapes with everything — the crew\'s stolen property and Wren\'s imperial files. On the deck, watching the vault shrink behind them, the protagonist gives Wren the files. She reads them in silence. Then she burns them, one by one, over the railing into the open sky. "I don\'t need proof of who I was," she says. "I know who I am." Cog watches from the engine room hatch. He nods once at the protagonist — the closest thing to approval he gives. End with the Drift heading for a free port, the crew one person larger than before, and the sky impossibly wide.',
  },
  {
    id: 'sp-ending-stealth-clean',
    type: 'beat',
    title: 'Smooth Skies',
    requires: { 'sp-cp-1': 'stealth', 'sp-cp-2': 'leave-clean' },
    sceneImagePrompt: SCENES.skywardDrift,
    includesProtagonist: false,
    arcBrief: 'The Drift escapes clean. Every item on the list, nothing more. Cog\'s plan executed perfectly. At the free port, Wren divides the recovered property among the independent pilots who lost it. Ship logs returned. Patents restored. Small freedoms given back. She never mentions the sealed compartment. Neither does the protagonist. Some secrets stay where you find them. End with the protagonist standing at the Drift\'s bow, watching clouds stream past, and Wren saying: "You\'ve earned your passage, stowaway. But the next port is a long way off. Might as well stay."',
  },
  {
    id: 'sp-ending-bold-evidence',
    type: 'beat',
    title: 'Clear Air',
    requires: { 'sp-cp-1': 'bold', 'sp-cp-2': 'take-evidence' },
    sceneImagePrompt: SCENES.betrayal,
    arcBrief: 'The protagonist confronts Wren on the deck during the escape. She goes still — the jokes stop, the charm drops. "I built that vault," she says quietly. "I designed it to hold people\'s lives. Then I watched the empire use it to destroy them." She left because she couldn\'t live with what she\'d made. The Drift was her penance. The heist was her attempt to undo it. Cog already knew — he\'d figured it out from the Drift\'s engineering. "Same hands built both ships," he says. "I wasn\'t sure until today." End with the crew landing at a free port, the truth between them, and the relief of people who no longer have to pretend.',
  },
  {
    id: 'sp-ending-bold-clean',
    type: 'beat',
    title: 'The Unspoken',
    requires: { 'sp-cp-1': 'bold', 'sp-cp-2': 'leave-clean' },
    sceneImagePrompt: SCENES.freePort,
    includesProtagonist: false,
    arcBrief: 'The protagonist says nothing about what they found. The Drift escapes, the cargo is distributed, and the free port celebrates. Wren buys drinks for everyone. Cog runs diagnostics on the engine. The protagonist watches them — a captain running from what she built, an engineer who probably already knows. Some crews work because of what they share. Some work because of what they choose not to say. End with Wren raising a glass: "To the stowaway who became crew." The protagonist drinks. Above them, the sky is clear and endless and full of places to go.',
  },

  // ── Reveal ──
  {
    id: 'sp-reveal',
    type: 'reveal',
    title: 'Your Story',
    sceneImagePrompt: SCENES.reveal,
  },
]
