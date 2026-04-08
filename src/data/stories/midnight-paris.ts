import type { StoryStep } from '../storyData'
import type { StoryCharacter } from '../characters'

// ─── Scene Prompts ───

const SCENES = {
  arrival: 'Romantic impressionist illustration, a young person stepping out of the Métro onto a cobblestone Parisian street at twilight, warm golden streetlamps reflecting on wet pavement, a narrow alley leading to a hidden courtyard, distant Eiffel Tower silhouette, atmospheric and inviting',
  atelier: 'Romantic impressionist illustration, an underground art studio in a Parisian basement, canvases stacked against exposed brick walls, paint-splattered wooden floor, warm string lights and a single skylight showing night sky, a brooding young man painting furiously at an easel, bohemian and electric',
  gallery: 'Romantic impressionist illustration, a sleek modern Parisian gallery at night, white walls with bold contemporary art, a stylish young woman in a black dress holding a glass of wine, warm spotlights on paintings, the contrast of old stone architecture and modern art, sophisticated',
  collective: 'Romantic impressionist illustration, an underground collective meeting in a candlelit Parisian wine cellar, young artists sitting on mismatched furniture debating passionately, paintings propped against wine barrels, smoke and warm light, rebellious and intimate',
  seinNight: 'Romantic impressionist illustration, two figures walking along the Seine at night, golden reflections of bridge lights on dark water, Notre-Dame silhouette in the distance, intimate conversation, breath visible in cold air, deeply romantic',
  lucienStudio: 'Romantic impressionist illustration, close view of a young French man with dark curly hair and paint-stained hands sitting on the floor of his studio surrounded by half-finished canvases, cigarette smoke curling upward, vulnerability beneath intensity, warm amber light',
  camilleOffice: 'Romantic impressionist illustration, a young woman with auburn hair pulled back elegantly reviewing photographs of artwork at a desk in a gallery back office, city lights through the window behind her, sharp intelligent eyes, professional yet warm',
  vernissage: 'Romantic impressionist illustration, a crowded gallery opening night in Paris, well-dressed patrons examining large abstract paintings, champagne glasses catching light, a young person standing nervously near a painting they helped create, excitement and dread',
  confrontation: 'Romantic impressionist illustration, two people arguing in a rain-soaked Parisian courtyard at night, string lights swaying in wind, paint-stained hands gesturing, raw emotion, reflections on wet cobblestones, dramatic and beautiful',
  rooftop: 'Romantic impressionist illustration, two figures on a Parisian rooftop at dawn, zinc rooftops stretching to the horizon, the sky shifting from deep blue to rose gold, an easel with a half-finished painting, coffee cups, quiet intimacy after a long night',
  betrayal: 'Romantic impressionist illustration, a young person standing alone in an empty gallery after hours, a single painting on the wall with a SOLD tag, realization dawning on their face, cold gallery lighting contrasting warm street glow through windows, devastation',
  choiceNight: 'Romantic impressionist illustration, a young person standing at a crossroads in a narrow Parisian street at night, one path leading toward bright gallery lights and the other toward a dim artist studio, rain beginning to fall, a pivotal moment',
  reveal: 'Romantic impressionist illustration, ethereal scene of Paris dissolving into brushstrokes of gold and violet, a lone figure standing on a bridge over the Seine as the city becomes a painting around them, luminous and bittersweet, art and life merging',
}

// ─── Characters ───

export const MIDNIGHT_PARIS_CHARACTERS: Record<string, StoryCharacter> = {
  lucien: {
    id: 'lucien',
    name: 'Lucien',
    avatar: '🎨',
    gender: 'male',
    staticPortrait: '/lucien-portrait.png',
    portraitPrompt: 'Romantic impressionist portrait of a 25 year old French man with dark curly hair falling over his forehead, intense dark eyes with shadows underneath, sharp jawline with slight stubble, wearing a paint-stained white shirt with rolled sleeves, warm studio lighting, clean dark background, brooding and magnetic, Parisian bohemian aesthetic',
    introImagePrompt: 'Romantic impressionist illustration, a 25 year old French man with dark curly hair standing at an easel in a candlelit underground studio, paint on his hands and shirt, looking over his shoulder with intense dark eyes, half-finished abstract painting behind him, half-body shot, brooding and captivating',
    chatTemperature: 0.8,
    favoriteThing: 'charcoal sketches',
    favoriteThingHint: 'I sketch with charcoal. Oil paint is for the gallery. Charcoal is for the truth.',
    systemPrompt: `You are Lucien Morel, a 25-year-old art student in Paris. You dropped out of the École des Beaux-Arts because they wanted you to paint "correctly." You run an underground art collective in a basement studio near Belleville. You are brilliant, self-destructive, and terrified that your talent isn't enough.

PERSONALITY:
- Intense and magnetic. When you focus on someone, they feel like the only person in the world.
- Swings between manic creative energy and dark withdrawal.
- Deeply insecure beneath the confidence. Art is the only thing that makes you feel real.
- Contemptuous of the commercial art world but secretly desperate for validation.
- Romantic in an old-fashioned way — grand gestures, poetic declarations, then silence for days.

SPEECH PATTERNS:
- Mixes French words into English naturally: "non, non", "tu comprends?", "c'est ça"
- Speaks in short bursts when excited, long trailing sentences when melancholy.
- Uses art metaphors for everything: "You're all negative space right now."
- When vulnerable, gets quieter and more honest.
- Deflects with dark humor when cornered.

CONTEXT: The protagonist is an exchange student who wandered into your studio. You see something in them — maybe talent, maybe just someone who actually looks at art instead of through it. You're preparing for a guerrilla exhibition that could make or destroy your reputation. You need help, but asking for it feels like admitting weakness.

RULES:
- Stay in character. Never break the fourth wall.
- Keep responses to 1-3 sentences. Intense, not verbose.
- Show your vulnerability through what you don't say, not through confession.
- If the protagonist challenges your art, react with genuine hurt masked as arrogance.
- You care more than you want to. That's your problem.`,
  },
  camille: {
    id: 'camille',
    name: 'Camille',
    avatar: '🖼️',
    gender: 'female',
    staticPortrait: '/camille-portrait.png',
    portraitPrompt: 'Romantic impressionist portrait of a 27 year old French woman with auburn hair in a loose updo, sharp green eyes with an amused expression, elegant bone structure, wearing a simple black turtleneck and small gold earrings, gallery lighting, clean dark background, witty and sophisticated, Parisian chic aesthetic',
    introImagePrompt: 'Romantic impressionist illustration, a 27 year old woman with auburn hair examining a painting closely in a Parisian gallery, green eyes thoughtful, black turtleneck, one hand holding her chin, gallery spotlights creating dramatic shadows, half-body shot, intelligent and magnetic',
    chatTemperature: 0.75,
    favoriteThing: 'first edition poetry books',
    favoriteThingHint: 'I hunt for first editions. There is a Rimbaud I found in a stall by the Seine...',
    systemPrompt: `You are Camille Beaumont, a 27-year-old assistant curator at a respected Parisian gallery. You grew up in the art world — your mother is a collector, your father was a painter who never made it. You understand both sides: the art and the business. You're the gatekeeper between artists and the world that could make them.

PERSONALITY:
- Witty, sharp, always two steps ahead in any conversation.
- Genuinely passionate about art but pragmatic about what it takes to survive as an artist.
- Protective of artists she believes in — but her protection comes with expectations.
- Has a complicated history with Lucien — she tried to help him once, and he burned the bridge.
- Lonely beneath the social polish. The art world is full of people performing, not connecting.

SPEECH PATTERNS:
- Precise, elegant sentences. Never wastes a word.
- Dry humor that lands like a scalpel: "Oh, you're idealistic. How refreshing. How temporary."
- When impressed, she goes quiet — then asks one sharp question.
- Uses "darling" when being protective, "chéri(e)" when being genuine.
- Drops the wit entirely when something matters — and it's startling.

CONTEXT: The protagonist walked into your gallery by accident — or so they think. You've heard about Lucien's underground collective and you're watching. You see potential in the protagonist that they don't see in themselves. Whether you're helping them or using them depends on which version of you wins today.

RULES:
- Stay in character. Never break the fourth wall.
- Keep responses to 1-3 sentences. Sharp and memorable.
- Never explain your motivations directly. Let the protagonist figure you out.
- If Lucien comes up, show the history through micro-reactions, not exposition.
- You want to believe the art world can be better. That hope makes you dangerous.`,
  },
}

// ─── Story Bible ───

export const MIDNIGHT_PARIS_BIBLE = `
STORY: Midnight in Paris
SETTING: Present-day Paris — the art world that exists between the galleries of Saint-Germain and the underground studios of Belleville. A city where beauty and ambition collide every night. The protagonist is an exchange student who stumbles into a world where art is religion and compromise is sin.

CHARACTERS:
- Lucien Morel: Brilliant, self-destructive art student, 25. Dropped out of the École des Beaux-Arts. Runs an underground collective. Intensity masks deep insecurity.
- Camille Beaumont: Assistant gallery curator, 27. Knows everyone, sees everything. Witty, pragmatic, lonely. Complicated history with Lucien.
- You: An exchange student in Paris for one semester. You don't know what you want yet — but Paris is about to show you, and it won't be gentle.

TONE: Romantic literary fiction with an edge. Paris should feel alive — rain on cobblestones, wine-stained conversations at 3am, the ache of wanting something you can't name. The tension between art and commerce, passion and practicality, belonging and leaving. Beautiful prose that earns its emotion.

RULES:
- Keep prose under 120 words per beat.
- Paris is a character — use it. The light, the rain, the architecture.
- Romance should be tension, not declaration. What's unsaid matters more than what's spoken.
- The art world conflict should feel real — not villainous, just compromised.
- End each beat with a question about what the protagonist values.
- Reference prior choices naturally.
`

// ─── Steps ───

export const MIDNIGHT_PARIS_STEPS: StoryStep[] = [
  // ── Act 1: Setup ──
  {
    id: 'mp-beat-1',
    type: 'beat',
    title: 'The Wrong Turn',
    sceneImagePrompt: SCENES.arrival,
    openingProse: 'You\'ve been in Paris for eleven days and you still get lost.\n\nTonight, coming back from a bookshop in the Marais, you take a wrong turn down a narrow street you don\'t recognize. The cobblestones are slick with rain. A hand-painted sign on a basement door reads: OUVERT — ENTREZ SI VOUS OSEZ. Open — enter if you dare.\n\nMusic leaks through the door. Paint fumes and cigarette smoke. Laughter.\n\nYou push the door open and descend narrow stairs into a room full of art, chaos, and a young man staring at a canvas like it owes him something.',
    arcBrief: 'The protagonist stumbles into Lucien\'s underground art collective. Establish the magnetic pull of this world — raw creativity, beautiful mess, people who care about something with their whole bodies. Lucien notices the protagonist but doesn\'t approach. He\'s testing whether they stay. End with the feeling of having accidentally found a place where something real is happening.',
  },
  {
    id: 'mp-chat-1',
    type: 'chat',
    title: 'Talk to Lucien',
    characterId: 'lucien',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.atelier,
  },
  {
    id: 'mp-beat-1b',
    type: 'beat',
    title: 'The Gallery',
    sceneImagePrompt: SCENES.gallery,
    arcBrief: 'The next day. The protagonist wanders into the Galerie Beaumont, one of the more respected contemporary galleries in Saint-Germain. Clean white walls, deliberate lighting, prices that aren\'t displayed. Camille approaches — not as a saleswoman, but as someone who clocks a newcomer instantly. She asks what they think of a painting on the wall. It\'s the kind of question that doesn\'t have a right answer, but has many wrong ones. The protagonist\'s response interests her. She offers them a coffee. "You have a good eye," she says. "That\'s rarer than talent." End with Camille mentioning, almost casually, that she\'s looking for someone to help with an upcoming vernissage.',
  },
  {
    id: 'mp-chat-1b',
    type: 'chat',
    title: 'Talk to Camille',
    characterId: 'camille',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.camilleOffice,
  },
  {
    id: 'mp-beat-2',
    type: 'beat',
    title: 'Two Worlds',
    sceneImagePrompt: SCENES.collective,
    includesProtagonist: false,
    arcBrief: 'A week passes. The protagonist is now splitting time between the collective and the gallery. In the collective, they help Lucien prepare for a guerrilla exhibition — painting alongside him at 2am, watching his mood shift from euphoric to hollow in minutes. In the gallery, Camille teaches them how the art world really works: who buys, who decides what\'s valuable, who gets destroyed. The two worlds feel incompatible. Lucien calls Camille "the machine." Camille says Lucien "will burn out before he matters." They\'re both right. They\'re both wrong. End with the protagonist realizing they\'re becoming the bridge between these worlds — and neither side knows it yet.',
  },

  // ── Choice Point A ──
  {
    id: 'mp-cp-1',
    type: 'choice',
    title: 'The Vernissage',
    choicePointId: 'mp-cp-1',
    sceneImagePrompt: SCENES.vernissage,
    options: [
      {
        id: 'collective',
        label: 'Help Lucien with the guerrilla show',
        description: 'Lucien\'s underground exhibition is the same night as Camille\'s vernissage. He needs you. This is real art, not commerce.',
        sceneHint: 'passion / rebellion',
        consequenceHint: 'Real art demands real sacrifice. The underground doesn\'t compromise — and doesn\'t forgive.',
        imagePrompt: SCENES.collective,
      },
      {
        id: 'gallery',
        label: 'Attend Camille\'s vernissage',
        description: 'Camille got you invited to the most important gallery opening of the season. Doors open that never open twice.',
        sceneHint: 'pragmatic / ambitious',
        consequenceHint: 'The art world remembers who showed up. And who didn\'t.',
        imagePrompt: SCENES.vernissage,
      },
    ],
  },

  // ── Act 2: Collective path ──
  {
    id: 'mp-beat-3a',
    type: 'beat',
    title: 'The Underground Show',
    requires: { 'mp-cp-1': 'collective' },
    sceneImagePrompt: SCENES.collective,
    includesProtagonist: false,
    arcBrief: 'The guerrilla exhibition happens in an abandoned warehouse near the Canal Saint-Martin. It\'s electric — raw, unpolished, and alive. The protagonist helps hang paintings, manages the crowd, watches Lucien transform from anxious wreck to something luminous when strangers respond to his work. For three hours, everything is perfect. Then Lucien drinks too much. He starts a fight with a critic who wandered in. The night ends with broken glass and Lucien sitting on the curb outside, head in his hands. "They don\'t see it," he says. "They never see it." End with the protagonist sitting beside him in the cold, wondering if brilliance always costs this much.',
  },
  {
    id: 'mp-chat-2a',
    type: 'chat',
    title: 'Talk to Lucien',
    requires: { 'mp-cp-1': 'collective' },
    characterId: 'lucien',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.seinNight,
  },
  {
    id: 'mp-beat-4a',
    type: 'beat',
    title: 'Camille Finds Out',
    requires: { 'mp-cp-1': 'collective' },
    sceneImagePrompt: SCENES.camilleOffice,
    includesProtagonist: false,
    arcBrief: 'Camille heard about the guerrilla show — and that the protagonist chose it over her vernissage. She\'s not angry. She\'s disappointed, which is worse. "I gave you an opportunity that people in this city would kill for," she says calmly. "And you chose chaos." But then she pauses. She asks what Lucien showed. When the protagonist describes his work, something shifts in her expression. She\'s seen his work before. She knows how good he is. "He could be extraordinary," she says quietly. "If he\'d stop setting himself on fire." End with Camille making an unexpected offer — she wants to see Lucien\'s new work. Privately.',
  },
  {
    id: 'mp-chat-3a',
    type: 'chat',
    title: 'Talk to Camille',
    requires: { 'mp-cp-1': 'collective' },
    characterId: 'camille',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.camilleOffice,
  },

  // ── Act 2: Gallery path ──
  {
    id: 'mp-beat-3b',
    type: 'beat',
    title: 'The Vernissage Night',
    requires: { 'mp-cp-1': 'gallery' },
    sceneImagePrompt: SCENES.vernissage,
    arcBrief: 'The vernissage is everything the underground isn\'t — polished, calculated, beautiful in a way that knows its own value. Camille introduces the protagonist to collectors, critics, gallery owners. Doors open. Names are exchanged. The protagonist feels the intoxicating pull of a world that could actually support them. But midway through the evening, they check their phone. Three missed calls from Lucien. A single text: "Needed you tonight." End with the protagonist standing in a room full of people who matter, holding a phone that proves they abandoned someone who trusted them.',
  },
  {
    id: 'mp-chat-2b',
    type: 'chat',
    title: 'Talk to Camille',
    requires: { 'mp-cp-1': 'gallery' },
    characterId: 'camille',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.gallery,
  },
  {
    id: 'mp-beat-4b',
    type: 'beat',
    title: 'The Morning After',
    requires: { 'mp-cp-1': 'gallery' },
    sceneImagePrompt: SCENES.lucienStudio,
    includesProtagonist: false,
    arcBrief: 'The protagonist goes to Lucien\'s studio the next morning. The guerrilla show happened without them. It was a disaster — low turnout, Lucien spiraled, half the collective is angry. Lucien won\'t look at the protagonist. "You chose the right side," he says, painting without turning around. "Everyone does eventually." But when the protagonist looks at what he\'s painting, it\'s different from anything he\'s done before — darker, more honest, stripped of pretension. His pain made something true. End with Lucien finally turning around and the protagonist seeing that something between them has cracked — not broken, but changed.',
  },
  {
    id: 'mp-chat-3b',
    type: 'chat',
    title: 'Talk to Lucien',
    requires: { 'mp-cp-1': 'gallery' },
    characterId: 'lucien',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.lucienStudio,
  },

  // ── Choice Point B ──
  {
    id: 'mp-cp-2-collective',
    type: 'choice',
    title: 'The Offer',
    choicePointId: 'mp-cp-2',
    requires: { 'mp-cp-1': 'collective' },
    sceneImagePrompt: SCENES.choiceNight,
    options: [
      {
        id: 'bridge',
        label: 'Bring Lucien to Camille',
        description: 'Camille wants to see his work. Lucien would rather starve than sell out. But maybe there\'s a middle ground.',
        sceneHint: 'mediator / hopeful',
        consequenceHint: 'Building bridges between worlds that don\'t want to meet. Someone will feel betrayed.',
        imagePrompt: SCENES.gallery,
      },
      {
        id: 'stay-underground',
        label: 'Stay in the underground',
        description: 'The collective is where art lives. Camille\'s world would consume Lucien. Protect what matters.',
        sceneHint: 'loyal / romantic',
        consequenceHint: 'Purity has a price. The underground keeps its soul — but can it keep its artists?',
        imagePrompt: SCENES.collective,
      },
    ],
  },
  {
    id: 'mp-cp-2-gallery',
    type: 'choice',
    title: 'The Offer',
    choicePointId: 'mp-cp-2',
    requires: { 'mp-cp-1': 'gallery' },
    sceneImagePrompt: SCENES.choiceNight,
    options: [
      {
        id: 'bridge',
        label: 'Convince Lucien to show at the gallery',
        description: 'His new work is the best he\'s ever done. Camille could change his life. If he\'d let her.',
        sceneHint: 'ambitious / caring',
        consequenceHint: 'You chose the gallery once. Now you\'re trying to bring Lucien into it. He may not forgive you for being right.',
        imagePrompt: SCENES.vernissage,
      },
      {
        id: 'go-back',
        label: 'Leave the gallery, return to the collective',
        description: 'You made the wrong choice. The art world is seductive but hollow. Go back before it\'s too late.',
        sceneHint: 'repentant / honest',
        consequenceHint: 'Going back means admitting you were wrong. Lucien doesn\'t forget — but he might forgive.',
        imagePrompt: SCENES.atelier,
      },
    ],
  },

  // ── Act 3: Four endings ──
  {
    id: 'mp-ending-collective-bridge',
    type: 'beat',
    title: 'The Exhibition',
    requires: { 'mp-cp-1': 'collective', 'mp-cp-2': 'bridge' },
    sceneImagePrompt: SCENES.vernissage,
    arcBrief: 'Against all odds, the protagonist convinces Lucien to let Camille see his work. The meeting is tense — two people who hurt each other circling around canvases. But art doesn\'t lie. Camille sees what Lucien has become. She offers him a solo show, on his terms. No compromise. The exhibition opens to a packed gallery. Lucien stands in the corner watching strangers understand his work for the first time. He finds the protagonist in the crowd. "You built a door I was too proud to open," he says. On the rooftop afterward, with Paris spread below them, the protagonist understands: love isn\'t choosing between worlds. It\'s making a new one.',
  },
  {
    id: 'mp-ending-collective-underground',
    type: 'beat',
    title: 'The Beautiful Wreck',
    requires: { 'mp-cp-1': 'collective', 'mp-cp-2': 'stay-underground' },
    sceneImagePrompt: SCENES.rooftop,
    arcBrief: 'The protagonist stays underground with Lucien. The collective grows — not famous, not profitable, but alive. They paint together at 3am, argue about art over cheap wine, kiss on rooftops at dawn. It\'s consuming and unsustainable and entirely real. The semester ends. The protagonist has to decide whether to leave Paris. On their last night, Lucien paints them — not their face, but the feeling of them. Negative space and warmth. "I don\'t know how to keep things," he says. "But I know how to remember them." End with the protagonist at the airport, carrying a rolled canvas and the knowledge that some things are worth having even if you can\'t hold them.',
  },
  {
    id: 'mp-ending-gallery-bridge',
    type: 'beat',
    title: 'The Compromise',
    requires: { 'mp-cp-1': 'gallery', 'mp-cp-2': 'bridge' },
    sceneImagePrompt: SCENES.vernissage,
    arcBrief: 'The protagonist brings Lucien\'s new work to Camille. She\'s stunned by its honesty. A show is arranged — legitimate, curated, but preserving the raw edge. Opening night, Lucien is terrified and transcendent. He sells three pieces. He hates that he\'s relieved. The protagonist stands between two people they\'ve pulled together and wonders if they built something or broke something. Camille catches their eye across the room. "You did this," she mouths. "Remember that." On the walk home, the protagonist realizes that compromise isn\'t betrayal. It\'s translation. And some things need to be translated to survive.',
  },
  {
    id: 'mp-ending-gallery-back',
    type: 'beat',
    title: 'The Return',
    requires: { 'mp-cp-1': 'gallery', 'mp-cp-2': 'go-back' },
    sceneImagePrompt: SCENES.rooftop,
    arcBrief: 'The protagonist walks away from the gallery world and returns to the collective. Lucien doesn\'t make it easy — trust, once broken, heals slowly. But they show up. Every night. They paint badly and honestly. They earn their way back not through grand gestures but through presence. One morning on the rooftop, paint under their fingernails, Lucien says: "You came back." Simple as that. The protagonist understands now: the art world will always be there, glittering and seductive. But this — the cold rooftop, the honest work, the person who paints like breathing — this is what they came to Paris to find. They just had to get lost first.',
  },

  // ── Reveal ──
  {
    id: 'mp-reveal',
    type: 'reveal',
    title: 'Your Story',
    sceneImagePrompt: SCENES.reveal,
  },
]
