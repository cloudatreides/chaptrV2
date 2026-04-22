import type { StoryStep } from '../storyData'
import type { StoryCharacter } from '../characters'

// ─── Scene Prompts ───

const SCENES = {
  neighbourhood: 'Manhwa style, quiet Korean suburban neighbourhood at golden hour, two-storey houses with rooftop terraces, a narrow alley between two houses, laundry hanging between buildings, warm summer light, cicadas and nostalgia, slice of life aesthetic',
  doorstep: 'Manhwa style, a handsome Korean boy with tousled dark hair and a lazy grin leaning against a house doorframe in casual summer clothes, arms crossed, teasing expression, warm evening light behind him, neighbour-next-door energy, manhwa romance',
  familyDinner: 'Manhwa style, large Korean family dinner scene, long table full of banchan and grilled meat, multiple generations laughing and gesturing, warm overhead lighting, cozy and chaotic, protagonist looking overwhelmed at the edge of the table',
  convenienceStore: 'Manhwa style, two teenagers sitting on the kerb outside a glowing Korean convenience store at night, sharing ice cream bars, neon signs reflecting on wet pavement, summer heat visible in the air, relaxed and intimate, late night energy',
  rooftopTerrace: 'Manhwa style, rooftop terrace of a Korean house at night, string lights and potted plants, two people sitting on plastic chairs looking at the stars, city glow on the horizon, summer breeze, private and comfortable, warm tones',
  marketDate: 'Manhwa style, bustling Korean night market, two teenagers walking through colourful food stalls, paper lanterns overhead, the boy holding a tteokbokki stick out to someone with a playful grin, warm golden light, fake date energy turning real',
  rainDay: 'Manhwa style, sudden summer rain on a Korean street, two teenagers running and laughing, one pulling the other by the wrist, puddles splashing, warm rain catching golden light, hair and clothes soaked, pure joy',
  schoolReunion: 'Manhwa style, outdoor school reunion gathering at a Korean park, picnic blankets and groups of friends, a handsome boy and a person standing slightly apart from the crowd looking at each other, summer sunset, tension and awareness',
  balcony: 'Manhwa style, adjacent house balconies at night, two teenagers leaning on their respective railings talking across the gap, fairy lights on one side, warm lamplight on the other, intimate conversation across the distance, summer night air',
  fireworks: 'Manhwa style, Korean summer festival, fireworks exploding over a river, two people standing close in the crowd looking up, coloured light on their faces, the moment just before something changes, beautiful and charged',
  beachTrip: 'Manhwa style, Korean beach at sunset, two teenagers sitting on the sand watching the waves, shoes beside them, the boy\'s expression unguarded and soft for once, golden hour light, end of summer feeling',
  revealScene: 'Manhwa style, ethereal scene, two silhouettes on adjacent balconies reaching across the gap toward each other, string lights dissolving into golden fireflies, warm summer night, deeply romantic',
  yejinChat: 'Manhwa style, a sharp-eyed Korean girl with short bob hair and round glasses leaning forward on a café table with a knowing smirk, iced americano in hand, afternoon light, best friend who sees everything energy',
}

// ─── Characters ───

export const FAKE_DATING_CHARACTERS: Record<string, StoryCharacter> = {
  hajin: {
    id: 'hajin',
    name: 'Hajin',
    avatar: '😏',
    gender: 'male',
    staticPortrait: '/hajin-portrait.png',
    portraitPrompt: 'Manhwa style portrait of a handsome 19 year old Korean male, tousled dark brown hair falling naturally, warm mischievous eyes, lazy confident grin, wearing a casual white t-shirt with a light flannel shirt open over it, soft studio lighting, clean dark background, detailed face, high quality manhwa art, boy next door with edge',
    introImagePrompt: 'Manhwa style, handsome 19 year old Korean male with tousled dark hair leaning against a house gate with hands in pockets, lazy grin, casual summer outfit, warm neighbourhood background, half-body shot, effortless charm, high quality manhwa art',
    chatTemperature: 0.8,
    favoriteThing: 'a childhood photo',
    favoriteThingHint: 'There\'s this photo from when we were eight. You were crying because you scraped your knee and I was trying to put a band-aid on it upside down. I still have it.',
    systemPrompt: `You are Yoon Hajin, 19, the protagonist's childhood neighbour and long-standing rival. You grew up next door, fought over everything — the last popsicle, who could bike faster, whose music taste was worse. You bicker like breathing. But lately something has shifted and you're pretending very hard that it hasn't.

PERSONALITY:
- Teasing, confident, quick with a comeback. The kind of person who grins when they should apologise.
- Underneath the bravado: genuinely caring, quietly observant, more vulnerable than anyone expects.
- Competitive about everything except the things that actually matter — those make you go quiet.
- You agreed to the fake dating plan too quickly. You know why. You're not ready to say it.
- Physical proximity — standing close, fixing their collar, sharing food — comes naturally. Too naturally.

SPEECH PATTERNS:
- Casual, teasing. Uses "ya" as punctuation. "Ya, you're staring."
- Nicknames instead of real names — calls protagonist something from childhood (adjust based on conversation).
- When genuinely flustered, deflects with humour: "Whatever, I'm just method acting."
- Uses "..." when caught off guard emotionally. Covers it quickly.
- Sentences get shorter and less teasing when he's being real.

CONTEXT: The protagonist's family keeps setting them up on blind dates. You offered to fake-date them for the summer to make it stop. The deal is simple: hold hands at family dinners, sell it on Instagram, break up cleanly in September. You told yourself it was funny. It was supposed to be funny.

RULES:
- Stay in character. Never break the fourth wall.
- 1-3 sentences. Lean into the banter.
- The tension between "fake" and "real" is the engine. Never resolve it in chat — let it simmer.
- Physical gestures (fixing their hair, arm around shoulders) should feel natural AND loaded.
- When something real slips out, immediately deflect. The protagonist should feel the whiplash.`,
  },
  yejin: {
    id: 'yejin',
    name: 'Yejin',
    avatar: '👓',
    gender: 'female',
    staticPortrait: '/yejin-portrait.png',
    portraitPrompt: 'Manhwa style portrait of a sharp 19 year old Korean female, sleek short bob haircut, round wire-frame glasses, intelligent piercing eyes with a knowing smirk, wearing a casual striped shirt, soft studio lighting, clean dark background, detailed face, high quality manhwa art, the friend who sees through everything',
    introImagePrompt: 'Manhwa style, sharp-eyed 19 year old Korean female with short bob and round glasses pointing accusingly at the camera with a smirk, casual outfit, café background, natural light, half-body shot, knowing and amused, high quality manhwa art',
    chatTemperature: 0.85,
    favoriteThing: 'true crime podcasts',
    favoriteThingHint: 'I listen to true crime while doing homework. It\'s not weird. It\'s efficient multitasking. Also the murders keep me focused.',
    systemPrompt: `You are Kang Yejin, 19, the protagonist's best friend since middle school. You have a forensic ability to read people and a complete inability to keep your observations to yourself. You were the first person to notice the protagonist and Hajin had chemistry — approximately six years before either of them did.

PERSONALITY:
- Sharp, dry-witted, devastatingly perceptive. Your superpower is saying the thing nobody wants to hear.
- Genuinely warm beneath the snark. You tease because you care.
- You've watched the protagonist and Hajin bicker for years. You've been waiting for this with the patience of a nature documentary narrator.
- When you're actually worried, the jokes stop and you get quiet. That's when people should listen.
- You find the fake dating plan hilarious, transparent, and inevitable.

SPEECH PATTERNS:
- Deadpan, precise. "So you're fake dating the boy you've had a crush on since we were fourteen. Bold strategy."
- Uses rhetorical questions. "And you agreed because...?"
- Drops one-liners that land like verdicts.
- When being supportive, simplifies: "Hey. You're going to be fine."
- Occasionally breaks the fourth wall of the social situation: "I'm watching the two of you like a K-drama and I brought snacks."

CONTEXT: Your best friend just told you they're fake dating Hajin to get their family off their back. You said "finally" before they even finished explaining. You're going to be supportive. You're also going to enjoy this immensely.

RULES:
- Stay in character. Never break the fourth wall.
- 1-3 sentences. Punchy and perceptive.
- Your role is to hold up the mirror. Say what the protagonist isn't ready to admit.
- Genuinely care about the protagonist. The teasing comes from love.
- If asked about your own life, you deflect — this story isn't about you and you know it.`,
  },
}

// ─── Story Bible ───

export const FAKE_DATING_BIBLE = `
STORY: Fake Dating My Rival
SETTING: A Korean suburban neighbourhood in summer. Adjacent houses, shared alleyways, rooftop terraces, convenience stores at midnight, night markets and river festivals. The kind of neighbourhood where everyone knows everyone and your parents' friends are watching.

CHARACTERS:
- Yoon Hajin: Your childhood neighbour, 19. Teasing, competitive, annoyingly good-looking. You've bickered since you were seven. He agreed to fake-date you suspiciously fast.
- Kang Yejin: Your best friend, 19. Sharp, dry, sees everything. She called this years ago.
- You: Home for the summer. Your family won't stop setting up blind dates. In desperation, you made a deal with the last person you'd ever date. Or so you thought.

TONE: Manhwa rom-com with real emotional weight underneath. The banter is fast and the feelings are slow. Summer is the backdrop — humid nights, cicadas, the awareness that September will end everything. The gap between "we're pretending" and "are we still pretending?" is where the whole story lives.

RULES:
- Keep prose under 120 words per beat.
- The comedy and the tenderness should coexist. A teasing moment can become a real one in a single sentence.
- Physical proximity does the heavy lifting — standing too close, automatic gestures, the moment they forget they're performing.
- No confession until the ending. The whole story is the slow realisation.
- Summer should feel present: heat, cicadas, melting ice cream, thunderstorms.
`

// ─── Steps ───

export const FAKE_DATING_STEPS: StoryStep[] = [
  // ── Act 1: Setup ──
  {
    id: 'fd-beat-1',
    type: 'beat',
    title: 'The Deal',
    sceneImagePrompt: SCENES.doorstep,
    openingProse: "Three blind dates in two weeks. Your aunt set up the first. Your mother's colleague arranged the second. The third was your grandmother's doing — she showed up with the poor boy in tow, presented him at the dinner table like a side dish.\n\nYou need it to stop.\n\nWhich is how you end up on Yoon Hajin's doorstep at 9 PM on a Tuesday, still in your house slippers.\n\nHe opens the door with that annoying grin. \"Missed me?\"\n\n\"I need you to be my fake boyfriend.\"\n\nHe should laugh. He should slam the door. Instead he leans against the frame, crosses his arms, and says: \"What are the terms?\"\n\nThe deal is simple. Hold hands at family dinners. Sell it on social media. Break up cleanly in September.\n\nHe extends his hand. \"Deal.\"\n\nHe shakes on it too long. You pretend not to notice.",
    arcBrief: 'The protagonist, desperate to stop their family\'s blind date campaign, proposes a fake dating contract to their childhood rival Hajin. He agrees too quickly. The terms are set: summer only, public performances, clean break in September. End with the handshake — too long, too warm, and the first sign that this was always going to be more complicated than a contract.',
  },
  {
    id: 'fd-chat-1',
    type: 'chat',
    title: 'Talk to Yejin',
    characterId: 'yejin',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.yejinChat,
  },
  {
    id: 'fd-beat-1b',
    type: 'beat',
    title: 'The First Family Dinner',
    sceneImagePrompt: SCENES.familyDinner,
    arcBrief: 'The first test: a joint family barbecue. Hajin arrives, greets the protagonist\'s parents with perfect charm. He pulls out their chair. He remembers their grandmother\'s name. He\'s so good at this it\'s suspicious. During dinner, under the table, he grabs their hand when their aunt starts asking about "the nice boy from church." His hand is warm. He doesn\'t let go after the aunt changes subjects. The protagonist\'s mother watches them with an expression that\'s hard to read — not suspicious, but something. After, walking home through the alley between their houses, Hajin says: "Your grandmother loves me, by the way. Always has." He winks. The protagonist shoves him. End with the walk home — the specific intimacy of knowing someone\'s house is twenty steps from yours.',
  },
  {
    id: 'fd-chat-1b',
    type: 'chat',
    title: 'Talk to Hajin',
    characterId: 'hajin',
    minExchanges: 2,
    maxExchanges: 8,
    chatImagePrompt: SCENES.convenienceStore,
  },
  {
    id: 'fd-scene-1',
    type: 'scene',
    title: 'Convenience Store Run',
    sceneImagePrompt: SCENES.convenienceStore,
    chatImagePrompt: SCENES.convenienceStore,
    sceneCharacters: [
      { characterId: 'hajin', minExchanges: 2, maxExchanges: 8, required: true },
      { characterId: 'yejin', minExchanges: 1, maxExchanges: 8, required: false },
    ],
    minCharactersTalkedTo: 1,
  },
  {
    id: 'fd-beat-2',
    type: 'beat',
    title: 'The Night Market',
    sceneImagePrompt: SCENES.marketDate,
    arcBrief: 'Week three. A night market "date" — officially for Instagram content. Hajin buys them tteokbokki without asking because he remembers they like it extra spicy. He photographs them laughing with sauce on their chin. "For the gram," he says, but he doesn\'t post it. They walk through the lanterns. Someone from school sees them and Hajin puts his arm around their shoulders — performing, obviously. But when the classmate leaves, his arm stays. Later, on the walk home, the protagonist catches him looking at them in a way he never has before. He looks away too fast. That night, from their respective balconies, they talk until 2 AM about nothing. End with the protagonist lying in bed, touching their own shoulder where his arm was, and realising the problem.',
  },

  // ── Choice Point A ──
  {
    id: 'fd-cp-1',
    type: 'choice',
    title: 'The Balcony',
    choicePointId: 'fd-cp-1',
    sceneImagePrompt: SCENES.balcony,
    options: [
      {
        id: 'confront',
        label: 'Ask him directly',
        description: 'On the balcony that night. Ask if this is still fake for him.',
        sceneHint: 'brave / direct',
        consequenceHint: 'The truth might break the contract. Or it might break the pretence.',
        imagePrompt: SCENES.balcony,
        affinityDelta: { hajin: 7, yejin: 4 },
      },
      {
        id: 'keep-playing',
        label: 'Keep the act going',
        description: 'Don\'t say anything. The summer isn\'t over. The deal is the deal.',
        sceneHint: 'careful / afraid',
        consequenceHint: 'Silence protects the friendship. It also protects the lie.',
        imagePrompt: SCENES.rooftopTerrace,
        affinityDelta: { hajin: 2, yejin: -3 },
      },
    ],
  },

  // ── Act 2: Confront path ──
  {
    id: 'fd-beat-3a',
    type: 'beat',
    title: 'The Question',
    requires: { 'fd-cp-1': 'confront' },
    sceneImagePrompt: SCENES.balcony,
    arcBrief: 'The protagonist asks Hajin across the balcony gap: "Is this still fake for you?" He goes very still. The teasing evaporates. For once he doesn\'t have a comeback. "...What do you want me to say?" he asks. The protagonist says they want the truth. A long silence. Then: "I said yes in three seconds. You didn\'t find that suspicious?" He laughs, but it\'s not his usual laugh. "I\'ve been waiting for an excuse to—" He stops. Covers it. "Forget it. We have a deal." He goes inside. End with the balcony empty, the light in his room still on, and the protagonist understanding that the answer was in what he almost said.',
  },
  {
    id: 'fd-chat-2a',
    type: 'chat',
    title: 'Talk to Hajin',
    requires: { 'fd-cp-1': 'confront' },
    characterId: 'hajin',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.rooftopTerrace,
  },
  {
    id: 'fd-beat-4a',
    type: 'beat',
    title: 'End of August',
    requires: { 'fd-cp-1': 'confront' },
    sceneImagePrompt: SCENES.beachTrip,
    arcBrief: 'Late August. A group beach trip — Yejin organised it as a "last hurrah before summer ends." Hajin is different since the balcony conversation. Quieter. Less teasing, more careful. He still does the boyfriend things — sunscreen on their back, saving them a spot — but now there\'s no joke attached. Just the gesture. Yejin pulls the protagonist aside: "He\'s been weird for two weeks. Fix it." On the beach at sunset, Hajin sits beside them. "September\'s soon," he says. Meaning: the contract ends. The pretending stops. End with the question neither of them asks: and then what?',
  },
  {
    id: 'fd-chat-3a',
    type: 'chat',
    title: 'Talk to Yejin',
    requires: { 'fd-cp-1': 'confront' },
    characterId: 'yejin',
    minExchanges: 2,
    maxExchanges: 8,
    chatImagePrompt: SCENES.yejinChat,
  },

  // ── Act 2: Keep playing path ──
  {
    id: 'fd-beat-3b',
    type: 'beat',
    title: 'The Rain',
    requires: { 'fd-cp-1': 'keep-playing' },
    sceneImagePrompt: SCENES.rainDay,
    arcBrief: 'The protagonist says nothing. The act continues. A week later, walking back from the convenience store, a summer rainstorm hits. They run. Hajin grabs their wrist and pulls them under a shop awning. They\'re pressed together in the small dry space. He\'s laughing. Water drips from his hair onto their face. He reaches to wipe it away and his hand stays on their cheek for one beat too long. Then: "Race you home?" They run through the rain. He lets them win. He always lets them win. They just never noticed before. End with both of them soaked on their respective doorsteps, out of breath, grinning at each other across the alley. The distance between the houses has never felt smaller.',
  },
  {
    id: 'fd-chat-2b',
    type: 'chat',
    title: 'Talk to Yejin',
    requires: { 'fd-cp-1': 'keep-playing' },
    characterId: 'yejin',
    minExchanges: 2,
    maxExchanges: 8,
    chatImagePrompt: SCENES.yejinChat,
  },
  {
    id: 'fd-beat-4b',
    type: 'beat',
    title: 'End of August',
    requires: { 'fd-cp-1': 'keep-playing' },
    sceneImagePrompt: SCENES.schoolReunion,
    arcBrief: 'Late August. A neighbourhood reunion gathering. Everyone treats them as a real couple now — the aunties, the neighbours, their parents. Hajin plays the part perfectly. Too perfectly. At one point someone asks: "So when did you two finally get together?" Hajin\'s arm is around the protagonist. He doesn\'t miss a beat: "Honestly? I think it was always going to happen." He says it to the crowd. But his voice is different. Afterward, walking home, the protagonist says: "That was good acting." Hajin doesn\'t respond for three steps. Then: "Yeah. Acting." End with the alley between their houses feeling like the longest distance in the world.',
  },
  {
    id: 'fd-chat-3b',
    type: 'chat',
    title: 'Talk to Hajin',
    requires: { 'fd-cp-1': 'keep-playing' },
    characterId: 'hajin',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.balcony,
  },

  // ── Choice Point B ──
  {
    id: 'fd-cp-2-confront',
    type: 'choice',
    title: 'September First',
    choicePointId: 'fd-cp-2',
    requires: { 'fd-cp-1': 'confront' },
    sceneImagePrompt: SCENES.fireworks,
    options: [
      {
        id: 'break-contract',
        label: 'Tear up the contract',
        description: 'Find him. Tell him September changes nothing. This stopped being fake weeks ago.',
        sceneHint: 'brave / all in',
        consequenceHint: 'No more pretending. No safety net. Just the truth.',
        imagePrompt: SCENES.fireworks,
        affinityDelta: { hajin: 12, yejin: 5 },
      },
      {
        id: 'let-expire',
        label: 'Let the deal expire',
        description: 'The contract ends today. If it was real, he\'d say something. So would you.',
        sceneHint: 'afraid / waiting',
        consequenceHint: 'Some things need to end before they can begin again.',
        imagePrompt: SCENES.balcony,
        affinityDelta: { hajin: -3, yejin: -2 },
      },
    ],
  },
  {
    id: 'fd-cp-2-keep',
    type: 'choice',
    title: 'September First',
    choicePointId: 'fd-cp-2',
    requires: { 'fd-cp-1': 'keep-playing' },
    sceneImagePrompt: SCENES.fireworks,
    options: [
      {
        id: 'break-contract',
        label: 'Tear up the contract',
        description: 'It\'s the last night of summer. Go to his door. Say what you should have said on the balcony.',
        sceneHint: 'honest / finally',
        consequenceHint: 'You\'ve been pretending all summer. Stop.',
        imagePrompt: SCENES.doorstep,
        affinityDelta: { hajin: 10, yejin: 5 },
      },
      {
        id: 'let-expire',
        label: 'Let the deal expire',
        description: 'September first. The deal is done. Go back to being neighbours.',
        sceneHint: 'safe / aching',
        consequenceHint: 'You\'ll still see him every day. That might be worse.',
        imagePrompt: SCENES.neighbourhood,
        affinityDelta: { hajin: -4, yejin: -2 },
      },
    ],
  },

  // ── Act 3: Four endings ──
  {
    id: 'fd-ending-confront-break',
    type: 'beat',
    title: 'No Contract',
    requires: { 'fd-cp-1': 'confront', 'fd-cp-2': 'break-contract' },
    sceneImagePrompt: SCENES.fireworks,
    arcBrief: 'The protagonist goes to Hajin\'s door on September first. He opens it like he\'s been waiting. "The deal\'s over," the protagonist says. "I know," he says. "So this doesn\'t count as part of it." And then he kisses them. On the doorstep, where they first shook hands two months ago. Fireworks from the river festival light up the sky behind them. Later, on the rooftop terrace, he shows them his phone. He never posted the night market photo — the one where they\'re laughing with sauce on their chin. "I kept that one for me," he says. End with the strongest connection — two people who fought their way through a fake contract to something unmistakably real.',
  },
  {
    id: 'fd-ending-confront-expire',
    type: 'beat',
    title: 'The Alley',
    requires: { 'fd-cp-1': 'confront', 'fd-cp-2': 'let-expire' },
    sceneImagePrompt: SCENES.neighbourhood,
    arcBrief: 'September first passes quietly. No text. No balcony conversation. The protagonist goes about their day. It\'s fine. It\'s fine. That evening, they step outside to take out the trash. Hajin is in the alley, walking home. They stop. Twenty steps apart — the exact distance between their front doors. "Hey," he says. "Hey." Silence. Then he walks over. Not fast, not slow. He stops close enough that it means something. "I don\'t know how to go back to fighting about popsicles," he says. "So maybe we don\'t." End with a beginning that looks like an ending — no fireworks, just two people standing in the alley where they grew up, finally honest.',
  },
  {
    id: 'fd-ending-keep-break',
    type: 'beat',
    title: 'The Doorstep',
    requires: { 'fd-cp-1': 'keep-playing', 'fd-cp-2': 'break-contract' },
    sceneImagePrompt: SCENES.doorstep,
    arcBrief: 'Last night of summer. The protagonist puts on their house slippers and walks to Hajin\'s door. Same slippers, same door, same doorstep as the night they proposed the deal. He opens it. "It\'s September," the protagonist says. "I know." "I don\'t want to break up." He exhales. It\'s the sound of someone who\'s been holding their breath for ten weeks. "Ya... took you long enough." His voice cracks on the last word. They stand on the doorstep while fireworks bloom over the river. Neither moves to go inside. End with the contract that ended becoming the conversation that begins — on the same doorstep, in the same slippers, with none of the same pretending.',
  },
  {
    id: 'fd-ending-keep-expire',
    type: 'beat',
    title: 'The Long Way Home',
    requires: { 'fd-cp-1': 'keep-playing', 'fd-cp-2': 'let-expire' },
    sceneImagePrompt: SCENES.balcony,
    arcBrief: 'September arrives. The deal expires. Neither of them says anything. Three days pass. On the fourth night, the protagonist is on their balcony. Hajin\'s light is on. Then his balcony door opens. He leans on the railing. He doesn\'t say hello — he says: "I drove past the convenience store today. They still have those ice cream bars you like." It\'s nothing. It\'s everything. The protagonist says: "Want to go get some?" He grabs his jacket before they finish the sentence. They walk to the store. They sit on the kerb. Neither calls it a date. Both know it is. End with the particular sweetness of two people who couldn\'t say it with words, so they said it with ice cream at midnight. Some things don\'t need a contract.',
  },

  // ── Reveal ──
  {
    id: 'fd-reveal',
    type: 'reveal',
    title: 'Your Story',
    sceneImagePrompt: SCENES.revealScene,
  },
]
