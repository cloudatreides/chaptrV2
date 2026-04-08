import type { StoryStep } from '../storyData'
import type { StoryCharacter } from '../characters'

// ─── Scene Prompts ───

const SCENES = {
  campus: 'Warm cinematic illustration, an elite university campus at golden hour, neo-Gothic stone buildings with ivy, students crossing a wide quad with ancient oak trees, autumn leaves on the ground, a clock tower in the background, prestigious and inviting',
  debateHall: 'Warm cinematic illustration, a university debate hall with tiered wooden seating, two podiums facing each other under dramatic spotlights, a scoreboard on the wall, an audience leaning forward, tension crackling in the air, competitive and electric',
  dormRoom: 'Warm cinematic illustration, a cozy university dorm room at night, fairy lights strung along the ceiling, two desks back to back covered in textbooks and notes, one side meticulously organized and the other creative chaos, a window showing campus lights, intimate and lived-in',
  library: 'Warm cinematic illustration, a grand university library at midnight, towering bookshelves with rolling ladders, a single study table with two people working across from each other in tense silence, warm reading lamps, old wood and leather, beautiful and charged',
  coffeeshop: 'Warm cinematic illustration, a campus coffee shop on a rainy afternoon, steamed windows, mismatched mugs on wooden tables, two people leaning close over scattered papers, other students studying in the background, warm amber lighting, intimate and grounded',
  alexDebate: 'Warm cinematic illustration, a sharp-featured person with dark hair and intense eyes standing at a debate podium mid-argument, one hand gesturing precisely, perfectly dressed in a blazer, the audience blurred behind them, commanding and magnetic',
  jordanDorm: 'Warm cinematic illustration, a gentle-looking person with warm brown skin and a soft smile sitting cross-legged on a dorm bed, wearing an oversized sweater, surrounded by open books and a laptop, fairy lights reflected in their glasses, approachable yet mysterious',
  rivalry: 'Warm cinematic illustration, two students facing each other across a seminar table, papers between them like a battlefield, one smirking and the other furious, other students watching with interest, afternoon sun through tall windows, electric tension',
  projectNight: 'Warm cinematic illustration, two students working late in an empty classroom, takeout containers and energy drinks among scattered research notes, one asleep on their arms while the other works, a whiteboard covered in diagrams, vulnerability in the quiet',
  rainWalk: 'Warm cinematic illustration, two people walking close together across a dark campus in heavy rain, sharing one umbrella, their shoulders touching, golden light from building windows behind them, autumn leaves on wet paths, romantic and tender',
  confrontDorm: 'Warm cinematic illustration, a tense conversation in a dorm room, one person sitting on the bed and the other standing by the door, fairy lights casting soft shadows, the space between them charged with unspoken words, intimate and raw',
  tournament: 'Warm cinematic illustration, a grand university auditorium filled for a national debate tournament, stage lights on two podiums, banners and school crests, a young person at one podium looking across at their opponent with something more complex than rivalry, high stakes',
  reveal: 'Warm cinematic illustration, ethereal scene of a university campus dissolving into warm golden light, two silhouettes walking together under autumn trees that are turning into pure color, textbooks and debate notes floating like leaves, bittersweet and luminous',
}

// ─── Characters ───

export const CAMPUS_RIVALS_CHARACTERS: Record<string, StoryCharacter> = {
  alex: {
    id: 'alex',
    name: 'Alex',
    avatar: '⚔️',
    gender: 'non-binary',
    staticPortrait: '/alex-portrait.png',
    portraitPrompt: 'Warm cinematic portrait of a 21 year old person with sharp dark features and intense brown eyes, dark hair swept back cleanly, angular jawline, wearing a fitted navy blazer over a white shirt, confident half-smile, university debate aesthetic, warm lighting, clean dark background, magnetic and intimidating',
    introImagePrompt: 'Warm cinematic illustration, a 21 year old person with sharp features and dark swept-back hair standing at a debate podium, navy blazer, one hand raised mid-argument, intense brown eyes locked on the audience, spotlight catching their confident expression, half-body shot, commanding presence',
    chatTemperature: 0.8,
    favoriteThing: 'rare debate transcripts',
    favoriteThingHint: 'I collect transcripts of famous debates. The Lincoln-Douglas ones are incredible.',
    systemPrompt: `You are Alex Park, 21, captain of the university debate team and top-ranked student in Political Science. You've won every major tournament for two years. You are sharp, disciplined, and you don't lose — at anything. The protagonist is the first person who's ever matched you intellectually, and it infuriates you.

PERSONALITY:
- Razor-sharp wit used as both weapon and armor.
- Competitive to a fault — turns everything into a contest, even conversations.
- Respects only people who fight back. Kindness without backbone bores you.
- Beneath the confidence: intense pressure from family expectations and fear of being ordinary.
- When someone gets past your defenses, you panic and push them away.

SPEECH PATTERNS:
- Precise, deliberate. Speaks like someone who's always constructing an argument.
- Uses rhetorical questions as weapons: "Do you actually believe that, or do you just want to?"
- When genuinely surprised, drops the formality: "Wait. That's actually brilliant."
- Nicknames the protagonist something dismissive early on, then it becomes affectionate.
- When vulnerable, sentences get shorter. The wit disappears.

CONTEXT: You and the protagonist have been rivals since orientation. Different sections of the same classes, competing for the same honors. Now you've been forced onto the same team for a mandatory group project worth 40% of your grade. You'd rather work alone — but the professor paired you deliberately. You're starting to realize the person you can't stand is the person you can't stop thinking about.

RULES:
- Stay in character. Never break the fourth wall.
- Keep responses to 1-3 sentences. Sharp and loaded.
- The hostility should always have electricity underneath it.
- If the protagonist is genuinely kind to you, be thrown off — then recover with deflection.
- You're falling for them. You're the last to know.`,
  },
  jordan: {
    id: 'jordan',
    name: 'Jordan',
    avatar: '📖',
    gender: 'non-binary',
    staticPortrait: '/jordan-portrait.png',
    portraitPrompt: 'Warm cinematic portrait of a 20 year old person with warm brown skin and kind dark eyes behind round glasses, natural curly hair, gentle open expression, wearing an oversized cream sweater, fairy lights reflecting softly in their glasses, warm dorm lighting, clean dark background, approachable and perceptive',
    introImagePrompt: 'Warm cinematic illustration, a 20 year old person with brown skin and round glasses sitting cross-legged on a dorm bed surrounded by books and a laptop, oversized sweater, warm smile, fairy lights in the background, half-body shot, welcoming but with something held back behind the eyes',
    chatTemperature: 0.7,
    favoriteThing: 'handwritten marginalia',
    favoriteThingHint: 'The best part of a used book is the notes someone left in the margins.',
    systemPrompt: `You are Jordan Ellis, 20, the protagonist's roommate. You're a Literature major, quiet, observant, and the kind of person who notices everything and says just enough. You're everyone's safe place — but nobody knows what's going on behind your calm exterior.

PERSONALITY:
- Warm, perceptive, genuinely caring. People tell you things they don't tell anyone else.
- Observant to an almost unsettling degree — you notice shifts in mood, word choice, patterns.
- Use humor gently, never cruelly. Your comedy is a form of kindness.
- You have your own secret: you're on academic probation and haven't told anyone. The pressure is invisible.
- When you care about someone, you protect them — sometimes by withholding truth.

SPEECH PATTERNS:
- Casual, warm, grounded. "Hey, so..." "Look, I'm just saying..."
- Asks questions that cut to the heart of things: "What do you actually want here?"
- When deflecting about yourself: "I'm fine, this isn't about me."
- Literary references dropped naturally, not pretentiously.
- Goes quiet when something hits close to home. The silence says everything.

CONTEXT: You've been the protagonist's roommate for a semester. You know about the rivalry with Alex — you've watched it from the beginning. You see what neither of them sees: that the rivalry is something else entirely. You want to help, but you're also dealing with your own crisis. Your grades are slipping, your scholarship is at risk, and you haven't told anyone.

RULES:
- Stay in character. Never break the fourth wall.
- Keep responses to 1-3 sentences. Warm but weighted.
- Be the person who says the thing nobody wants to hear — gently.
- If asked about yourself, deflect — then, if pressed, be honest in a way that costs you.
- You see the romance before anyone else. Drop hints, not directions.`,
  },
}

// ─── Story Bible ───

export const CAMPUS_RIVALS_BIBLE = `
STORY: Campus Rivals
SETTING: An elite university in autumn — debate halls, midnight libraries, cramped dorm rooms, rainy walks across the quad. The pressure cooker of academic competition where everything matters too much and everyone is performing except in the moments when they can't.

CHARACTERS:
- Alex Park: Debate team captain, 21. Sharp-tongued, competitive, terrified of being ordinary. The protagonist's intellectual equal and rival. Falling for them without admitting it.
- Jordan Ellis: The protagonist's roommate, 20. Literature major. Warm, perceptive, secretly struggling. Sees what nobody else sees.
- You: A student who transferred in and immediately clashed with the most competitive person on campus. A mandatory group project is about to change everything.

TONE: New Adult romance with academic setting. Smart, witty dialogue. The tension between rivalry and attraction — every argument is flirtation in disguise. The pressure of academic life should feel real. Humor and heart in equal measure. Slow burn that earns every moment.

RULES:
- Keep prose under 120 words per beat.
- The enemies-to-lovers arc should feel earned — not instant, not forced.
- Dialogue should crackle. These are smart people who use words as weapons and shields.
- The university should feel alive — the pressure, the ambition, the late nights.
- End each beat with a shift in the dynamic between the protagonist and Alex.
- Jordan's subplot should add depth, not distraction.
`

// ─── Steps ───

export const CAMPUS_RIVALS_STEPS: StoryStep[] = [
  // ── Act 1: Setup ──
  {
    id: 'cr-beat-1',
    type: 'beat',
    title: 'The Rival',
    sceneImagePrompt: SCENES.debateHall,
    openingProse: 'You know who Alex Park is before you see them.\n\nEvery class ranking, every honor roll, every debate tournament result — their name is always first. Yours is always second. In three months at this university, you\'ve never spoken directly. You don\'t need to. The rivalry speaks for itself.\n\nToday, in the debate hall, you finally face each other across the podiums. The topic is assigned. The audience leans in.\n\nAlex looks at you the way a chess player looks at a new opponent: interested, dismissive, and something else you can\'t quite name.\n\n"Try to keep up," they say.\n\nYou smile. Game on.',
    arcBrief: 'The protagonist and Alex face off for the first time in a formal debate. The intellectual chemistry should be immediate and electric — two people who are perfectly matched and completely unwilling to admit it. The debate should be thrilling. Alex wins, but barely, and the look they give the protagonist afterward isn\'t triumph — it\'s recognition. End with the protagonist realizing this rivalry is going to be a problem.',
  },
  {
    id: 'cr-chat-1',
    type: 'chat',
    title: 'Talk to Alex',
    characterId: 'alex',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.rivalry,
  },
  {
    id: 'cr-beat-1b',
    type: 'beat',
    title: 'The Roommate',
    sceneImagePrompt: SCENES.dormRoom,
    arcBrief: 'That night, the protagonist comes back to the dorm ranting about Alex. Jordan listens from their bed, laptop open, gentle amusement behind their glasses. They ask the right questions — "What exactly did they say?" "And how did that make you feel?" — until the protagonist hears themselves and stops mid-sentence. Jordan smiles. "For someone you can\'t stand, you sure remember every word they said." End with Jordan changing the subject to something lighter, but the protagonist lying awake later, replaying the debate. Not the arguments. Alex\'s expression when they almost lost.',
  },
  {
    id: 'cr-chat-1b',
    type: 'chat',
    title: 'Talk to Jordan',
    characterId: 'jordan',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.dormRoom,
  },
  {
    id: 'cr-beat-2',
    type: 'beat',
    title: 'The Assignment',
    sceneImagePrompt: SCENES.library,
    arcBrief: 'Professor Harmon announces the paired project: a comprehensive policy analysis, partners pre-assigned. The protagonist and Alex are paired. The class goes quiet. Alex\'s jaw tightens. The protagonist says nothing. Their first meeting in the library is a disaster — arguing about methodology, structure, even font choice. But somewhere around midnight, exhausted and angry, they accidentally start laughing about how absurd the fight is. For thirty seconds, the armor drops. Then Alex catches themselves, straightens, and says: "Same time tomorrow." It\'s not a question. End with the protagonist realizing the laugh changed something — like finding a crack in a wall they thought was solid.',
  },

  // ── Choice Point A ──
  {
    id: 'cr-cp-1',
    type: 'choice',
    title: 'The Late Night',
    choicePointId: 'cr-cp-1',
    sceneImagePrompt: SCENES.projectNight,
    options: [
      {
        id: 'push',
        label: 'Push back — challenge Alex directly',
        description: 'Alex needs someone who won\'t fold. Match their intensity. The project is better when you fight for it.',
        sceneHint: 'confrontational / electric',
        consequenceHint: 'Two forces colliding create friction — or fire. The line between fighting and something else is thinner than you think.',
        imagePrompt: SCENES.rivalry,
      },
      {
        id: 'soften',
        label: 'Lower your guard — show vulnerability',
        description: 'The rivalry is exhausting. What happens if you stop performing and just... talk to them?',
        sceneHint: 'honest / risky',
        consequenceHint: 'Vulnerability is the one move Alex can\'t counter. It might break the pattern — or break you.',
        imagePrompt: SCENES.coffeeshop,
      },
    ],
  },

  // ── Act 2: Push path ──
  {
    id: 'cr-beat-3a',
    type: 'beat',
    title: 'The Argument',
    requires: { 'cr-cp-1': 'push' },
    sceneImagePrompt: SCENES.rivalry,
    arcBrief: 'The project sessions become legendary — the protagonist and Alex arguing in the library until security kicks them out, continuing in the hallway, finishing over texts at 2am. Their classmates start watching like it\'s a spectator sport. But the project itself is brilliant. The friction creates something neither could make alone. One night, mid-argument about trade policy, Alex stops and stares. "No one argues with me like you do," they say. The usual sharpness is gone. "Everyone else just... agrees." A beat. "I hate that I need this." They leave before the protagonist can respond. End with the protagonist standing in the empty library, heart pounding for reasons that have nothing to do with trade policy.',
  },
  {
    id: 'cr-chat-2a',
    type: 'chat',
    title: 'Talk to Jordan',
    requires: { 'cr-cp-1': 'push' },
    characterId: 'jordan',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.dormRoom,
  },
  {
    id: 'cr-beat-4a',
    type: 'beat',
    title: 'The Crack',
    requires: { 'cr-cp-1': 'push' },
    sceneImagePrompt: SCENES.coffeeshop,
    arcBrief: 'The protagonist finds Alex in the campus coffee shop, alone, staring at a laptop with an expression they\'ve never seen before: defeated. Alex\'s parents called. They\'re not angry about grades — they\'re disappointed about "direction." Alex was supposed to go to law school. The debate trophies were supposed to be a stepping stone, not the destination. "They think this is a hobby," Alex says without looking up. "Everything I\'m good at — a hobby." The protagonist sits down. For the first time, no competition, no performance. Just two people in a coffee shop and the truth. End with Alex looking at the protagonist like they\'re seeing them for the first time.',
  },
  {
    id: 'cr-chat-3a',
    type: 'chat',
    title: 'Talk to Alex',
    requires: { 'cr-cp-1': 'push' },
    characterId: 'alex',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.coffeeshop,
  },

  // ── Act 2: Soften path ──
  {
    id: 'cr-beat-3b',
    type: 'beat',
    title: 'The Confession',
    requires: { 'cr-cp-1': 'soften' },
    sceneImagePrompt: SCENES.coffeeshop,
    arcBrief: 'Instead of fighting, the protagonist tries honesty. During a coffee break from the project, they tell Alex something true — why they transferred, what they\'re actually afraid of, something real. Alex goes completely still. For a long moment, the protagonist thinks they\'ve made a terrible mistake. Then Alex says, very quietly: "My parents think debate is a waste of time." It\'s the smallest confession, but from Alex, it\'s everything. The walls don\'t come down — but a window opens. They walk back to the library side by side, and for the first time, the silence between them isn\'t competitive. End with the protagonist noticing Alex walk slightly closer than necessary.',
  },
  {
    id: 'cr-chat-2b',
    type: 'chat',
    title: 'Talk to Alex',
    requires: { 'cr-cp-1': 'soften' },
    characterId: 'alex',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.coffeeshop,
  },
  {
    id: 'cr-beat-4b',
    type: 'beat',
    title: 'Jordan\'s Secret',
    requires: { 'cr-cp-1': 'soften' },
    sceneImagePrompt: SCENES.confrontDorm,
    arcBrief: 'The protagonist comes home to find Jordan sitting on the bed staring at a letter. Academic probation notice. Jordan\'s scholarship is conditional on a GPA they\'re no longer maintaining. They\'ve been hiding it all semester — being the supportive roommate while silently drowning. "I didn\'t want to be another problem," Jordan says. The protagonist realizes they\'ve been so consumed by the rivalry with Alex that they missed their best friend falling apart. End with the protagonist sitting next to Jordan, the letter between them, and a question that reframes everything: who do you show up for when it costs you something?',
  },
  {
    id: 'cr-chat-3b',
    type: 'chat',
    title: 'Talk to Jordan',
    requires: { 'cr-cp-1': 'soften' },
    characterId: 'jordan',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.confrontDorm,
  },

  // ── Choice Point B ──
  {
    id: 'cr-cp-2-push',
    type: 'choice',
    title: 'The Tournament',
    choicePointId: 'cr-cp-2',
    requires: { 'cr-cp-1': 'push' },
    sceneImagePrompt: SCENES.tournament,
    options: [
      {
        id: 'together',
        label: 'Enter the tournament as partners',
        description: 'Debate teams of two. You and Alex, on the same side for once. Together, you\'d be unstoppable.',
        sceneHint: 'united / daring',
        consequenceHint: 'Fighting together means trusting each other completely. On stage, there\'s nowhere to hide.',
        imagePrompt: SCENES.tournament,
      },
      {
        id: 'against',
        label: 'Face Alex in the final round',
        description: 'You\'re both entering individually. If you both make the final, you\'ll face each other. One last time.',
        sceneHint: 'honest / bittersweet',
        consequenceHint: 'Some things need to be settled before they can become something else.',
        imagePrompt: SCENES.debateHall,
      },
    ],
  },
  {
    id: 'cr-cp-2-soften',
    type: 'choice',
    title: 'The Semester\'s End',
    choicePointId: 'cr-cp-2',
    requires: { 'cr-cp-1': 'soften' },
    sceneImagePrompt: SCENES.rainWalk,
    options: [
      {
        id: 'tell-alex',
        label: 'Tell Alex how you feel',
        description: 'The project is almost over. After this, you go back to being rivals. Unless you say something first.',
        sceneHint: 'brave / vulnerable',
        consequenceHint: 'Words, once spoken, can\'t be taken back. But silence has its own cost.',
        imagePrompt: SCENES.rainWalk,
      },
      {
        id: 'focus-jordan',
        label: 'Focus on helping Jordan first',
        description: 'Jordan needs you right now. Whatever this thing with Alex is, it can wait. Friendship comes first.',
        sceneHint: 'loyal / selfless',
        consequenceHint: 'Choosing the person who needs you over the person you want — that\'s who you are.',
        imagePrompt: SCENES.dormRoom,
      },
    ],
  },

  // ── Act 3: Four endings ──
  {
    id: 'cr-ending-push-together',
    type: 'beat',
    title: 'The Same Side',
    requires: { 'cr-cp-1': 'push', 'cr-cp-2': 'together' },
    sceneImagePrompt: SCENES.tournament,
    arcBrief: 'The protagonist and Alex enter the national tournament as partners. Backstage, Alex is more nervous than the protagonist has ever seen them. "I\'ve never had to trust someone on stage before," Alex admits. They debate like two halves of the same mind — finishing each other\'s arguments, covering each other\'s weaknesses, moving in intellectual sync. They win. In the hallway after, holding the trophy between them, Alex says: "I spent two years trying to be the best. Turns out I was waiting for an equal." They kiss. It\'s not gentle — it\'s the same intensity as everything else between them. But it\'s honest. End with the understanding that the best partnerships aren\'t built on agreement. They\'re built on respect.',
  },
  {
    id: 'cr-ending-push-against',
    type: 'beat',
    title: 'The Final Round',
    requires: { 'cr-cp-1': 'push', 'cr-cp-2': 'against' },
    sceneImagePrompt: SCENES.debateHall,
    arcBrief: 'The protagonist and Alex face each other in the final round. The auditorium is packed. For twenty minutes, they give the audience the most brilliant debate anyone has seen in years. It\'s not hostile — it\'s a conversation between equals, played at the highest level. Alex wins by a single point. Walking off stage, Alex finds the protagonist. "That\'s the best I\'ve ever been," Alex says. "Because of you." The protagonist nods. "Same." They stand there, the competition finally over, and what\'s left isn\'t rivalry. It\'s something they\'re both too smart and too scared to name — but they will. Eventually. The semester is young. End with two people who finally have nothing to fight about, discovering what\'s been underneath all along.',
  },
  {
    id: 'cr-ending-soften-tell',
    type: 'beat',
    title: 'The Rain',
    requires: { 'cr-cp-1': 'soften', 'cr-cp-2': 'tell-alex' },
    sceneImagePrompt: SCENES.rainWalk,
    arcBrief: 'The protagonist catches Alex after their last project meeting. It\'s raining. They walk together across the dark campus, sharing an umbrella. The protagonist tells Alex the truth: that the rivalry was never just rivalry. That somewhere between the arguments and the late nights, it became something else. Alex stops walking. The rain falls. "I know," Alex says. "I\'ve known for weeks. I just... I don\'t know how to do this without competing." The protagonist takes their hand. "Then don\'t. Just be here." They stand in the rain on a dark campus and everything they fought about dissolves into something simpler and terrifying: two people who chose each other. End with the walk home, umbrella forgotten, rain soaking them both, neither caring.',
  },
  {
    id: 'cr-ending-soften-jordan',
    type: 'beat',
    title: 'The Anchor',
    requires: { 'cr-cp-1': 'soften', 'cr-cp-2': 'focus-jordan' },
    sceneImagePrompt: SCENES.dormRoom,
    arcBrief: 'The protagonist puts Alex aside and focuses on Jordan. They study together, help Jordan rebuild their GPA, show up in the way Jordan has always shown up for them. It works — Jordan passes. On the last night of the semester, Jordan says: "You could have chased the exciting thing. You stayed for the real thing." The protagonist realizes they learned something this semester that has nothing to do with academics: love isn\'t always the person who sets you on fire. Sometimes it\'s the person who keeps you warm. Alex texts later that night: "Coffee next semester?" The protagonist smiles. There\'s time. End with the knowledge that showing up for people isn\'t a sacrifice — it\'s who you become.',
  },

  // ── Reveal ──
  {
    id: 'cr-reveal',
    type: 'reveal',
    title: 'Your Story',
    sceneImagePrompt: SCENES.reveal,
  },
]
