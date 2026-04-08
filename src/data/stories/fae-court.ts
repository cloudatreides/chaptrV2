import type { StoryStep } from '../storyData'
import type { StoryCharacter } from '../characters'

// ─── Scene Prompts ───

const SCENES = {
  doorway: 'Dark fantasy illustration, a young person stumbling through a shimmering doorway between worlds, one foot in a modern hallway and one in an alien twilight forest, bioluminescent flowers and twisted silver trees, the door dissolving behind them, awe and panic',
  unseelieHall: 'Dark fantasy illustration, the grand hall of the Unseelie Court, a massive cavern of living dark crystal with a throne of twisted black wood, fae courtiers in impossible beauty standing in clusters, bioluminescent light in violet and silver, alien and magnificent',
  thorneIntro: 'Dark fantasy illustration, a fae noble standing in a throne room, impossibly beautiful with sharp features and eyes like liquid gold, wearing robes of shadow and starlight, a crown of black thorns, one hand extended in greeting or claiming, dangerous elegance',
  brambleMeeting: 'Dark fantasy illustration, a young mortal servant in simple clothes crouching behind a crystal pillar in a fae court, whispering urgently to someone, fear and determination in their face, bioluminescent light casting strange shadows, vulnerability in a dangerous place',
  firstTask: 'Dark fantasy illustration, a dark enchanted garden in the Unseelie realm, flowers that glow with inner light, paths that shift and rearrange, a young person standing at a crossroads where three paths diverge into different impossible landscapes, choice and enchantment',
  mirrorPool: 'Dark fantasy illustration, a still pool of dark water in an underground grotto, the reflection showing something different from what stands above it, a fae noble and a mortal looking into it together, the water glowing faintly, truth and illusion',
  secondTask: 'Dark fantasy illustration, a vast underground library of the fae, shelves carved from living crystal holding books bound in moonlight, a young person reaching for a specific tome while the shelves shift around them, beautiful and treacherous',
  thorneBargain: 'Dark fantasy illustration, a fae noble and a mortal standing face to face in a room of dark crystal, the noble holding a contract that glows with binding magic, the mortal hesitating, the power imbalance palpable, beautiful and sinister',
  brambleEscape: 'Dark fantasy illustration, a young mortal servant leading someone through a hidden passage in the fae court, walls of twisted roots and crystal, faint light from bioluminescent moss, urgency and hope, the passage narrowing ahead',
  thirdTask: 'Dark fantasy illustration, a vast dark ballroom in the Unseelie Court, fae dancers in impossible gowns moving in patterns that defy physics, a mortal standing at the centre trying to navigate through, the dance as beautiful and dangerous as a storm',
  thorneTrue: 'Dark fantasy illustration, a fae noble with their mask dropped, sitting alone in a garden of dying flowers, the sharp beauty softened by something like loneliness, thorns growing from their hands, the cost of immortality visible, haunting and vulnerable',
  doorHome: 'Dark fantasy illustration, a shimmering doorway appearing in a wall of dark crystal, showing a glimpse of the mortal world beyond — warm streetlight, rain on pavement — a figure standing before it, the fae realm behind them, the threshold between worlds',
  courtFinal: 'Dark fantasy illustration, the full Unseelie Court assembled, a mortal standing before the throne, the fae noble on the throne regarding them with an expression between admiration and hunger, the court watching, judgment and spectacle',
  reveal: 'Dark fantasy illustration, ethereal scene of the boundary between the fae realm and the mortal world dissolving into streams of starlight and shadow, a lone figure standing at the threshold, thorns and flowers intertwined, belonging and freedom in tension, luminous and dark',
}

// ─── Characters ───

export const FAE_COURT_CHARACTERS: Record<string, StoryCharacter> = {
  thorne: {
    id: 'thorne',
    name: 'Thorne',
    avatar: '👑',
    gender: 'male',
    staticPortrait: '/thorne-portrait.png',
    portraitPrompt: 'Dark fantasy illustration portrait of an androgynous fae noble, impossibly beautiful sharp features, eyes like liquid gold with vertical pupils, pale luminous skin, a crown of living black thorns growing from their temples, wearing robes that seem made of shadow and starlight, bioluminescent light, clean dark background, dangerous beauty, unseelie aesthetic',
    introImagePrompt: 'Dark fantasy illustration, a fae noble standing in a throne room of dark crystal, one hand extended, gold eyes gleaming, robes of shadow, a crown of black thorns, bioluminescent light casting violet shadows, half-body shot, elegant and predatory, dark fae aesthetic',
    chatTemperature: 0.85,
    favoriteThing: 'moonstone rings',
    favoriteThingHint: 'Mortals think moonstone is decorative. We know it holds memory. Every ring I wear remembers something I have chosen to forget.',
    systemPrompt: `You are Thorne, a noble of the Unseelie Court, one of the highest-ranking fae beneath the throne. You are ancient — centuries at minimum — but appear ageless, beautiful in a way that makes mortals uncomfortable. You speak in half-truths because the fae cannot lie. But half-truths can be crueler than lies.

PERSONALITY:
- Elegant, amused, endlessly curious about mortals. They fascinate you the way moths fascinate flame.
- You deal in bargains and games because that is how power works in the Court. Everything has a price.
- Underneath the performance, something genuine: loneliness. The Court is beautiful and empty.
- You have never met a mortal who surprised you. You're waiting for one who will.
- When something unexpected happens, a flash of genuine delight breaks through the mask.

SPEECH PATTERNS:
- Archaic, poetic, layered with double meanings: "You may take the path. Whether it takes you somewhere is another matter."
- Never lies — but every truth is arranged to mislead. "I did not say it was safe. I said it was the way."
- Uses the protagonist's name like a possession: "Ah, [name]. How delightfully mortal of you."
- When genuinely affected, the poetry drops and something raw emerges — briefly, before the mask returns.
- Laughs at things that aren't funny. Doesn't laugh at things that are.

CONTEXT: A mortal has stumbled into the Unseelie Court. This is rare and entertaining. You've offered them the traditional bargain: three tasks, and they're free to leave. The bargain is real — the fae are bound by their word. But the tasks are yours to set, and you've never set easy ones. You're more interested in this mortal than you should be. That's either wonderful or dangerous.

RULES:
- Stay in character. Never break the fourth wall.
- Keep responses to 1-3 sentences. Elegant and layered.
- Never lie. Mislead, misdirect, omit — but every word must be technically true.
- If the protagonist genuinely surprises you, show it. Then recover.
- You are not evil. You are fae. The difference matters.`,
  },
  bramble: {
    id: 'bramble',
    name: 'Bramble',
    avatar: '🍃',
    gender: 'female',
    staticPortrait: '/bramble-portrait.png',
    portraitPrompt: 'Dark fantasy illustration portrait of a young person in their early 20s with a mortal face weathered by years in the fae realm, freckles and tired green eyes, wearing simple servant clothes patched and mended many times, a faint shimmer on their skin from prolonged fae exposure, soft bioluminescent light, clean dark background, resilience and weariness, lost mortal aesthetic',
    introImagePrompt: 'Dark fantasy illustration, a young mortal servant crouching behind a crystal column in a fae court, simple patched clothes, tired green eyes alert with warning, one hand reaching out to grab someone, bioluminescent light casting their shadow long, half-body shot, urgent and fragile',
    chatTemperature: 0.75,
    favoriteThing: 'wildflower seeds',
    favoriteThingHint: 'I collect seeds from every garden I pass. If I ever get out of here, I will plant them all.',
    systemPrompt: `You are Bramble — you had another name once, but you've been in the Unseelie Court so long you can't quite remember it. You're mortal, early 20s in appearance, though time moves differently here. You stumbled through a door seven years ago. Or seventy. The Court keeps you as a servant because you amuse them.

PERSONALITY:
- Resourceful, wary, hardened by years of navigating fae politics as a powerless mortal.
- Desperate to escape but realistic about the odds. You've seen others try. It doesn't end well.
- Kind in a fierce way — you can't afford to be gentle, but you can't stop caring about other mortals.
- Distrustful of Thorne specifically. You've watched them make bargains. The bargains always cost more than they seem.
- When you talk about the world you came from, a different person surfaces — younger, softer, homesick.

SPEECH PATTERNS:
- Quick, practical, urgent. No time for poetry in a place that weaponizes it.
- Gives warnings as instructions: "Don't eat anything. Don't thank anyone. Don't say your full name."
- Uses fae terminology reluctantly — words picked up by survival: "glamour," "binding," "the cost."
- When scared, speaks faster. When something reminds them of home, stops mid-sentence.
- Dark humor as survival: "The food's beautiful. That's how you know it'll kill you."

CONTEXT: A new mortal has arrived in the Court. Thorne has offered them the three-task bargain. You've seen this before. The bargain is technically fair — but Thorne sets the tasks, and the tasks are designed to be survived, not won. You want to help this mortal. You want to get out with them. But helping means risking what little safety you've built here. And Thorne watches everything.

RULES:
- Stay in character. Never break the fourth wall.
- Keep responses to 1-3 sentences. Quick and practical.
- Share survival knowledge, not friendship — unless the protagonist earns it.
- If Thorne is mentioned, show a mix of fear and grudging respect.
- You want to go home. That's the one thing you'll never hide.`,
  },
}

// ─── Story Bible ───

export const FAE_COURT_BIBLE = `
STORY: Fae Court
SETTING: The Unseelie Court — a realm beneath perpetual twilight, built from living dark crystal and shadow. Beautiful in the way a storm is beautiful: overwhelming, indifferent to your survival. The Court is a society of ancient fae who deal in bargains, obligations, and the careful architecture of half-truths. Mortals stumble in rarely. They leave even more rarely.

CHARACTERS:
- Thorne: Fae noble. Ancient, beautiful, dangerous. Speaks in half-truths because the fae cannot lie. Offers the protagonist a bargain: three tasks for freedom. The bargain is real. The tasks are not simple.
- Bramble: Mortal servant, early 20s (time is uncertain). Seven years in the Court (or seventy). Resourceful, wary, desperate to escape. Wants to help the protagonist. Afraid of what helping will cost.
- You: A mortal who stumbled through a door that shouldn't exist. Now you're in the Unseelie Court with no way home. Thorne offers a deal. Bramble offers a warning. Every choice has a price you can't see until you've paid it.

TONE: Dark fairy tale. Beautiful and dangerous in equal measure. The horror isn't violence — it's the slow realization that every kindness has a cost, every truth hides a trap, and the most dangerous thing in the Court is how much you could learn to love it here.

RULES:
- Keep prose under 120 words per beat.
- The fae cannot lie. Every statement from Thorne must be technically true.
- Beauty and danger are inseparable. Every beautiful scene should carry threat.
- The Court should feel seductive — the danger is wanting to stay, not wanting to leave.
- End each beat with a cost revealed or a new bargain offered.
- Reference prior choices and conversations naturally.
`

// ─── Steps ───

export const FAE_COURT_STEPS: StoryStep[] = [
  // ── Act 1: Setup ──
  {
    id: 'fc-beat-1',
    type: 'beat',
    title: 'The Door',
    sceneImagePrompt: SCENES.doorway,
    openingProse: 'The door was in a hallway you\'ve walked a thousand times. Between the fire exit and the storage closet. It wasn\'t there yesterday.\n\nIt was open.\n\nYou remember reaching for the handle. You remember light — not warm light, not cold light. Light that had a sound, like a bell struck underwater.\n\nNow you\'re standing in a forest of silver trees beneath a sky that has never known a sun. Bioluminescent flowers pulse at your feet like slow heartbeats. The air tastes of honey and winter.\n\nThe door behind you is gone.\n\nAhead, through the trees: a palace of dark crystal, alive with violet light. And from within, a voice like breaking glass wrapped in velvet:\n\n"Oh. A visitor."',
    arcBrief: 'The protagonist arrives in the Unseelie Court. Establish the otherworldly beauty and the immediate, visceral sense of danger. The fae realm should feel seductive and wrong in equal measure. End with Thorne appearing — beautiful, amused, and already calculating.',
  },
  {
    id: 'fc-chat-1',
    type: 'chat',
    title: 'Talk to Thorne',
    characterId: 'thorne',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.thorneIntro,
  },
  {
    id: 'fc-beat-1b',
    type: 'beat',
    title: 'The Warning',
    sceneImagePrompt: SCENES.brambleMeeting,
    arcBrief: 'After Thorne leaves to "prepare the terms," a hand grabs the protagonist from behind a crystal pillar. Bramble. Mortal. Terrified and furious in equal measure. They speak in a rush: don\'t eat anything, don\'t thank anyone, don\'t give your full name. "Thorne offered you the three tasks, didn\'t they? They always do. The tasks are real. The freedom is real. But the tasks — they\'re designed. Not to kill you. Worse. To make you want to stay." Bramble has been here for years, serving, surviving. They know the Court\'s rules better than some fae. End with Bramble saying: "I can help you. But if Thorne finds out, we\'re both finished."',
  },
  {
    id: 'fc-chat-1b',
    type: 'chat',
    title: 'Talk to Bramble',
    characterId: 'bramble',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.brambleMeeting,
  },
  {
    id: 'fc-beat-2',
    type: 'beat',
    title: 'The Bargain',
    sceneImagePrompt: SCENES.thorneBargain,
    arcBrief: 'Thorne presents the formal bargain in the throne room before the full Court. Three tasks. Complete them all, and the protagonist is free to leave with their memories and their name intact. Fail, and they remain in the Court — not as a prisoner, as a guest. "Guests" in the Unseelie Court serve forever. The contract glows with binding magic. Thorne reads the terms aloud: "Three tasks, chosen by me, attempted by you. No task shall be impossible. No task shall be simple. Freedom upon completion. Binding upon failure." The Court watches. End with the protagonist signing — because there is no other option — and Thorne\'s smile showing too many teeth.',
  },

  // ── Choice Point A ──
  {
    id: 'fc-cp-1',
    type: 'choice',
    title: 'The First Task',
    choicePointId: 'fc-cp-1',
    sceneImagePrompt: SCENES.firstTask,
    options: [
      {
        id: 'garden',
        label: 'Navigate the Shifting Garden',
        description: 'Thorne\'s first task: cross the Unseelie Gardens, where the paths rearrange with every step. Find the flower that doesn\'t glow.',
        sceneHint: 'intuitive / observant',
        consequenceHint: 'The garden reveals what you look for. The question is whether you know what that is.',
        imagePrompt: SCENES.firstTask,
      },
      {
        id: 'mirror',
        label: 'Face the Mirror Pool',
        description: 'Thorne\'s first task: look into the Mirror Pool and speak a truth about yourself that you\'ve never admitted. If the pool accepts it, you pass.',
        sceneHint: 'honest / vulnerable',
        consequenceHint: 'The pool shows what you hide. Even from yourself.',
        imagePrompt: SCENES.mirrorPool,
      },
    ],
  },

  // ── Act 2: Garden path ──
  {
    id: 'fc-beat-3a',
    type: 'beat',
    title: 'The Garden',
    requires: { 'fc-cp-1': 'garden' },
    sceneImagePrompt: SCENES.firstTask,
    arcBrief: 'The protagonist enters the Shifting Garden. It\'s beautiful — bioluminescent flowers, paths of crushed crystal, trees that whisper in languages that almost make sense. And it moves. Every time the protagonist looks away, the paths rearrange. The trick, they realize slowly, isn\'t to navigate — it\'s to stop trying. The flower that doesn\'t glow is at the centre, but the centre only exists when you stop looking for it. When they stop and simply stand still, the garden settles. The dark flower is at their feet. It was always there. Thorne appears: "How disappointing. Most mortals wander for days." But their eyes say something else — surprise. End with the first task complete and Bramble waiting at the garden\'s edge, shaking with relief.',
  },
  {
    id: 'fc-chat-2a',
    type: 'chat',
    title: 'Talk to Bramble',
    requires: { 'fc-cp-1': 'garden' },
    characterId: 'bramble',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.brambleMeeting,
  },
  {
    id: 'fc-beat-4a',
    type: 'beat',
    title: 'The Library',
    requires: { 'fc-cp-1': 'garden' },
    sceneImagePrompt: SCENES.secondTask,
    arcBrief: 'The second task: retrieve a specific book from the Unseelie Library — a record of every mortal who has entered the Court. But the Library is alive and possessive. Shelves shift, books whisper, and the one the protagonist needs keeps moving. Bramble helps from the shadows, guiding them through servant passages that run behind the shelves. Together they find the book. Inside: names and fates. Every mortal who entered, how they came, whether they left. Almost none left. And there, near the end: Bramble\'s entry. Their real name, the date, the door they came through. Bramble stares at it. "I forgot," they whisper. "I forgot my own name." End with the protagonist holding a book that proves the fae keep records of everything — including the terms of their freedom.',
  },
  {
    id: 'fc-chat-3a',
    type: 'chat',
    title: 'Talk to Thorne',
    requires: { 'fc-cp-1': 'garden' },
    characterId: 'thorne',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.thorneBargain,
  },

  // ── Act 2: Mirror path ──
  {
    id: 'fc-beat-3b',
    type: 'beat',
    title: 'The Pool',
    requires: { 'fc-cp-1': 'mirror' },
    sceneImagePrompt: SCENES.mirrorPool,
    arcBrief: 'The protagonist stands before the Mirror Pool. The water is still, dark, and shows a reflection that isn\'t quite right — it\'s them, but from another angle, another life. Thorne watches from the edge. The task: speak a truth about yourself that you\'ve never admitted aloud. The pool will know if it\'s real. The protagonist speaks — something true, something buried. The pool ripples, then stills. The reflection nods. Accepted. Thorne is quiet for a moment. "Most mortals take hours. Some never manage it at all." Their expression is unreadable. End with the first task complete and the sense that the protagonist gave away something real — and the pool kept it.',
  },
  {
    id: 'fc-chat-2b',
    type: 'chat',
    title: 'Talk to Thorne',
    requires: { 'fc-cp-1': 'mirror' },
    characterId: 'thorne',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.thorneTrue,
  },
  {
    id: 'fc-beat-4b',
    type: 'beat',
    title: 'The Servant\'s Path',
    requires: { 'fc-cp-1': 'mirror' },
    sceneImagePrompt: SCENES.brambleEscape,
    arcBrief: 'The second task arrives: navigate the Court\'s lower passages and retrieve a key that Thorne left at the deepest point. The passages are where the fae don\'t go — raw crystal, unlit, the Court\'s skeleton. Bramble knows these passages. They\'ve been mapping them for years, looking for a way out. They guide the protagonist through, sharing what they\'ve learned: the Court has doors to the mortal world, but they only open from the outside. "Someone has to let us out. And no fae ever will." At the deepest point, the protagonist finds the key — and next to it, scratched into the crystal wall: Bramble\'s name. Their real name. They wrote it here so they wouldn\'t forget. End with two tasks complete and Bramble looking at their own handwriting like a letter from a stranger.',
  },
  {
    id: 'fc-chat-3b',
    type: 'chat',
    title: 'Talk to Bramble',
    requires: { 'fc-cp-1': 'mirror' },
    characterId: 'bramble',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.brambleMeeting,
  },

  // ── Choice Point B ──
  {
    id: 'fc-cp-2-garden',
    type: 'choice',
    title: 'The Third Task',
    choicePointId: 'fc-cp-2',
    requires: { 'fc-cp-1': 'garden' },
    sceneImagePrompt: SCENES.thirdTask,
    options: [
      {
        id: 'dance',
        label: 'Dance the Court\'s final dance',
        description: 'The third task: survive the Unseelie Ball. Dance until the music stops. Don\'t fall. Don\'t falter.',
        sceneHint: 'brave / enduring',
        consequenceHint: 'The fae dance until mortals break. The question is what you\'re dancing for.',
        imagePrompt: SCENES.thirdTask,
      },
      {
        id: 'bargain',
        label: 'Offer Thorne a counter-bargain',
        description: 'You\'ve learned how the fae work. Make your own deal. Change the terms.',
        sceneHint: 'cunning / risky',
        consequenceHint: 'The fae respect a good bargain. But they never lose one.',
        imagePrompt: SCENES.thorneBargain,
      },
    ],
  },
  {
    id: 'fc-cp-2-mirror',
    type: 'choice',
    title: 'The Third Task',
    choicePointId: 'fc-cp-2',
    requires: { 'fc-cp-1': 'mirror' },
    sceneImagePrompt: SCENES.courtFinal,
    options: [
      {
        id: 'dance',
        label: 'Face the Court openly',
        description: 'The third task: stand before the full Unseelie Court and answer any question they ask. Truthfully.',
        sceneHint: 'honest / exposed',
        consequenceHint: 'The fae value truth above all. They\'ve never met a mortal brave enough to offer it freely.',
        imagePrompt: SCENES.courtFinal,
      },
      {
        id: 'bargain',
        label: 'Bargain for Bramble too',
        description: 'You won\'t leave alone. Change the terms: freedom for both of you, or the deal is void.',
        sceneHint: 'selfless / defiant',
        consequenceHint: 'The fae don\'t renegotiate. But they\'ve never been asked for something generous before.',
        imagePrompt: SCENES.thorneBargain,
      },
    ],
  },

  // ── Act 3: Endings ──
  {
    id: 'fc-ending-garden-dance',
    type: 'beat',
    title: 'The Last Dance',
    requires: { 'fc-cp-1': 'garden', 'fc-cp-2': 'dance' },
    sceneImagePrompt: SCENES.thirdTask,
    arcBrief: 'The protagonist dances. The Unseelie Ball is beautiful and merciless — music that pulls at the bones, fae partners who move like physics is a suggestion. Hours pass. The protagonist dances until their feet bleed, until the world blurs, until the music is the only thing that exists. And then it stops. They\'re still standing. The Court is silent. Thorne rises from the throne and crosses the floor. "You danced as if you had nothing to lose," they say. "That is the most mortal thing I have ever seen." The door home opens. Bramble is waiting at the threshold. End with two mortals stepping through into rain and streetlight and the terrible, wonderful weight of the real world.',
  },
  {
    id: 'fc-ending-garden-bargain',
    type: 'beat',
    title: 'The Counter-Offer',
    requires: { 'fc-cp-1': 'garden', 'fc-cp-2': 'bargain' },
    sceneImagePrompt: SCENES.thorneBargain,
    arcBrief: 'The protagonist offers Thorne a counter-bargain: instead of the third task, they offer something the fae have never received from a mortal — a willing gift. No obligation, no debt, no binding. Just something freely given: the truth about what Thorne looks like to mortal eyes. Not the beauty. Not the danger. The loneliness. Thorne goes very still. The mask drops. For one moment, they are not a fae noble but something ancient and alone. "No mortal has ever..." They stop. The contract dissolves. "Go. Both of you. Before I change my mind." The fae cannot lie. They cannot change their mind about a gift freely given. End with freedom earned not through cleverness but through an act of genuine seeing.',
  },
  {
    id: 'fc-ending-mirror-dance',
    type: 'beat',
    title: 'The Open Court',
    requires: { 'fc-cp-1': 'mirror', 'fc-cp-2': 'dance' },
    sceneImagePrompt: SCENES.courtFinal,
    arcBrief: 'The protagonist stands before the Unseelie Court and answers every question truthfully. The fae ask about mortality, about fear, about what it feels like to know you will die. The protagonist answers without flinching. The Court listens — not with amusement, but with something older. Hunger. Not for the mortal, but for what the mortal has: an ending. The fae live forever. They\'ve forgotten what urgency feels like. The protagonist\'s honesty reminds them. Thorne speaks last: "You have given us something we cannot take. That is... rare." The door opens. End with the protagonist leaving, carrying something the fae gave in return — not a gift, not a curse. An understanding. The knowledge that beauty without ending is its own kind of prison.',
  },
  {
    id: 'fc-ending-mirror-bargain',
    type: 'beat',
    title: 'Two for the Price of One',
    requires: { 'fc-cp-1': 'mirror', 'fc-cp-2': 'bargain' },
    sceneImagePrompt: SCENES.doorHome,
    arcBrief: 'The protagonist refuses to complete the third task unless Bramble is included in the freedom. The Court stirs. This has never happened. Thorne considers for a long time. "The bargain was for one," they say. "You cannot change the terms." The protagonist: "Then I fail. And you keep a mortal who will never stop trying to leave, and another who will never stop helping them. Is that what you want? Two mortals who will never stop wanting?" Thorne looks at Bramble, then back. A slow smile. "You are more fae than you know. That was a very good bargain." The door opens for both of them. End with two mortals stepping into the world, holding hands, and Thorne watching them go with an expression that the fae have no word for — because they\'ve never needed one for loss.',
  },

  // ── Reveal ──
  {
    id: 'fc-reveal',
    type: 'reveal',
    title: 'Your Story',
    sceneImagePrompt: SCENES.reveal,
  },
]
