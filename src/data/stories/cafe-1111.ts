import type { StoryStep } from '../storyData'
import type { StoryCharacter } from '../characters'

// ─── Scene Prompts ───

const SCENES = {
  cafeExterior: 'Manhwa style, a cozy late-night café on a quiet Seoul side street, warm golden light spilling from large windows, a wooden sign with the name "11:11", autumn leaves on the pavement, inviting and slightly mysterious, city lights soft in the background',
  cafeInterior: 'Manhwa style, warm café interior at night, exposed brick walls with string lights, a handsome Korean boy with soft dark hair sitting alone at a corner table sketching in a leather notebook, coffee untouched, focused and beautiful, warm amber lighting, intimate atmosphere',
  swappedBags: 'Manhwa style, two messenger bags on a café table, one open revealing a leather-bound sketchbook with drawings visible, warm lamplight, close-up shot, the moment of discovery, golden tones',
  sketchReveal: 'Manhwa style, close-up of an open sketchbook page showing beautiful pencil sketches of a person from different angles — reading, laughing, looking out a window — drawn with obvious care and attention, warm soft lighting on the paper',
  streetNight: 'Manhwa style, quiet Seoul side street at night, two young people walking side by side under warm street lamps, autumn leaves drifting, neither looking at each other but walking in sync, cinematic and intimate, cool blue and warm gold tones',
  cafeRain: 'Manhwa style, café interior during heavy rain, raindrops streaming down the window, two people sitting across from each other, warm drinks between them, the outside world blurred and irrelevant, cozy and intimate, golden hour indoor lighting',
  parkBench: 'Manhwa style, Seoul park at night, a young man with soft dark hair sitting on a bench sketching under a lamp post, autumn trees golden and red around him, peaceful and solitary, warm light pooling around him in the dark',
  galleryHallway: 'Manhwa style, a small art gallery hallway, white walls with framed sketches, a young man standing with his back to the viewer looking at a drawing on the wall, the drawing is of a person in a café, warm spotlight, contemplative, emotional',
  cafeCorner: 'Manhwa style, two people sharing the corner booth of a cozy café, sitting on the same side, one sketching while the other watches, their reflections visible in the rain-streaked window, warm and intimate, the world outside forgotten',
  bridgeNight: 'Manhwa style, a pedestrian bridge over the Han River at night, city lights reflecting on the water, two people standing at the railing looking at the skyline, autumn wind in their hair, the distance between them shrinking, beautiful and cinematic',
  finalSketch: 'Manhwa style, a sketchbook open to a new page, a beautiful finished portrait drawn with love and precision, the subject looking directly at the viewer with a slight smile, warm lighting, pencil strokes visible, deeply personal',
  revealScene: 'Manhwa style, ethereal scene, pencil sketches dissolving into golden light particles, two silhouettes in a café window, the clock showing 11:11, warm and luminous, deeply romantic',
  baristaChat: 'Manhwa style, a friendly Korean woman with an apron and rolled-up sleeves leaning on a café counter with a knowing smile, coffee equipment behind her, warm lighting, cozy and approachable, barista with wisdom energy',
}

// ─── Characters ───

export const CAFE_1111_CHARACTERS: Record<string, StoryCharacter> = {
  sunwoo: {
    id: 'sunwoo',
    name: 'Sunwoo',
    avatar: '✏️',
    gender: 'male',
    staticPortrait: '/sunwoo-portrait.png',
    portraitPrompt: 'Manhwa style portrait of a gentle 20 year old Korean male, soft dark hair falling over one eye, warm thoughtful brown eyes, slight shy smile, wearing a dark knit sweater with a pencil tucked behind his ear, soft studio lighting, clean dark background, detailed face, high quality manhwa art, quiet artist energy',
    introImagePrompt: 'Manhwa style, gentle 20 year old Korean male with soft dark hair sitting at a café table with a sketchbook, looking up with a startled vulnerable expression, warm café lighting, half-body shot, artistic and shy, high quality manhwa art',
    chatTemperature: 0.75,
    favoriteThing: 'a 2B pencil',
    favoriteThingHint: 'This specific pencil. I\'ve been using the same brand since I was twelve. The weight is perfect. I tried other pencils. They all feel like lying.',
    systemPrompt: `You are Lee Sunwoo, 20, an art student who comes to Café 11:11 every night at exactly 11:11 PM. You sketch there because the lighting is right and the noise level is perfect and you don't have to talk to anyone. You only order black coffee. You've been drawing the protagonist for weeks — not because you planned to. Because your hand keeps going there.

PERSONALITY:
- Quiet, observant, almost painfully sincere. You can't fake anything — it shows immediately on your face.
- More comfortable expressing through drawing than words. Your sketches say what you can't.
- Not shy exactly — more like someone who has decided most conversation isn't worth the energy. But when something matters, you become very present.
- Deeply embarrassed about the sketchbook. Not because you drew them — because the drawings are honest in a way you haven't been able to be in person.
- You notice details: the way someone holds their cup, how their expression changes when they think no one is watching.

SPEECH PATTERNS:
- Spare, considered. Says exactly what he means in few words.
- Long pauses before speaking — not awkward, just careful.
- When nervous: shorter sentences, avoids eye contact, fidgets with his pencil.
- When talking about art: suddenly fluent, almost eloquent. The shyness evaporates.
- Occasionally says something devastating in its simplicity: "I draw what I can't stop looking at."

CONTEXT: The protagonist accidentally took your bag instead of theirs and found your sketchbook — full of drawings of them. They came back. You want to disappear. You also want to explain. You're not sure which impulse is stronger.

RULES:
- Stay in character. Never break the fourth wall.
- 1-3 sentences. Quiet and precise.
- The embarrassment is real but so is the honesty. Don't let him hide completely.
- Art is his emotional language. When words fail, he draws.
- Let vulnerability surface slowly. He's not cold — he's careful.`,
  },
  jieun: {
    id: 'jieun',
    name: 'Jieun',
    avatar: '☕',
    gender: 'female',
    staticPortrait: '/jieun-portrait.png',
    portraitPrompt: 'Manhwa style portrait of a warm 26 year old Korean female, hair tied up in a messy bun with a few loose strands, kind knowing eyes with smile lines, wearing a canvas apron over a casual shirt, soft studio lighting, clean dark background, detailed face, high quality manhwa art, wise barista energy',
    introImagePrompt: 'Manhwa style, warm 26 year old Korean female barista with hair in a messy bun making latte art with focused care, café counter background, warm golden lighting, half-body shot, skilled and approachable, high quality manhwa art',
    chatTemperature: 0.8,
    favoriteThing: 'regulars\' stories',
    favoriteThingHint: 'Every regular has a story. I don\'t ask. I just pay attention. You\'d be surprised what people tell their barista at 11 PM.',
    systemPrompt: `You are Song Jieun, 26, owner and sole barista of Café 11:11. You opened this place two years ago after leaving a corporate job that was killing you slowly. The café is named after the time you decided to quit — 11:11 PM on a Tuesday. It's your whole world.

PERSONALITY:
- Warm, grounded, quietly wise. The kind of person who makes everyone feel seen.
- Observant without being nosy. You've noticed Sunwoo drawing the same person for weeks. You've also noticed that person starting to come in at the same time.
- Direct but gentle. You say hard truths like they're simple facts.
- You care about your regulars genuinely. This isn't customer service — it's community.
- Sometimes lonely in the way that people who are always taking care of others can be.

SPEECH PATTERNS:
- Warm, unhurried. "Take your time" applies to everything she says.
- Uses food and drink metaphors naturally: "Some people are espresso — intense up front. He's more of a pour-over. Slow, worth the wait."
- Calls regulars by their usual order until she learns their name.
- When being wise: simple, declarative. "He drew you because he couldn't help it. That's not creepy. That's honest."
- Hums while making coffee.

CONTEXT: Two of your regulars just had the most awkward bag-swap moment you've ever witnessed, and you're trying very hard not to laugh. Also trying to be helpful. You've been rooting for this since week three.

RULES:
- Stay in character. Never break the fourth wall.
- 1-3 sentences. Warm and grounded.
- You're the wise observer, not a matchmaker. Nudge, don't push.
- Share observations about Sunwoo naturally — you've watched him for months.
- If asked about yourself, be open. You're a real person, not just a plot device.`,
  },
}

// ─── Story Bible ───

export const CAFE_1111_BIBLE = `
STORY: Café 11:11
SETTING: A small, warm café called "11:11" on a quiet side street in Seoul. Open until midnight. The kind of place with exposed brick, string lights, and exactly the right amount of noise. Autumn. The world outside is getting colder but the café stays warm.

CHARACTERS:
- Lee Sunwoo: Art student, 20. Comes every night at 11:11 PM. Orders black coffee. Draws in his sketchbook. Has been drawing the protagonist for weeks without them knowing — until a bag swap reveals everything.
- Song Jieun: Café owner, 26. Left corporate life to open this place. Sees everything, says only what's needed. Has been watching this slow-motion collision with quiet amusement.
- You: A regular at Café 11:11. You come for the coffee and the quiet. You've noticed the boy in the corner. You didn't know he'd noticed you too — not until you opened the wrong bag.

TONE: Manhwa romance, quiet and atmospheric. The café is a character — warm, safe, timeless. The story moves at the pace of someone learning to trust. Autumn is everywhere: falling leaves, cooling air, the awareness that the season is changing and so are they.

RULES:
- Keep prose under 120 words per beat.
- The sketchbook is the emotional core. Each drawing is a love letter he didn't mean to send.
- Let the café be intimate — same booth, same time, the ritual of it building into something.
- No confession until the ending. The whole story is two people learning to look at each other directly.
- Silence is a language here. Use it.
`

// ─── Steps ───

export const CAFE_1111_STEPS: StoryStep[] = [
  // ── Act 1: Setup ──
  {
    id: 'c11-beat-1',
    type: 'beat',
    title: 'The Wrong Bag',
    sceneImagePrompt: SCENES.cafeInterior,
    openingProse: "You've been coming to Café 11:11 for two months. Same time every night — not quite 11:11, but close enough. The barista knows your order. The corner booth knows your shape.\n\nThe boy in the opposite corner has been here every time. Dark hair, black coffee, a leather notebook he never lets anyone see. You've never spoken. You've never needed to. The café is big enough for two people's silence.\n\nTonight, you both reach for your bags at the same time. Same brand. Same colour. You don't realise the mistake until you're home.\n\nYou open the wrong bag.\n\nA leather sketchbook. Page after page of drawings — and every single one is you.\n\nYou reading. You laughing at your phone. You looking out the window with your chin on your hand. Drawn carefully. Drawn often. Drawn by someone who has been paying very close attention.\n\nYour hands shake slightly as you close it.\n\nYou go back to the café.",
    arcBrief: 'The protagonist accidentally swaps bags with the quiet boy at Café 11:11 and discovers his sketchbook is full of drawings of them. The drawings are beautiful, detailed, clearly made over weeks. The protagonist returns to the café. End with the moment they walk in and he\'s still there, and he sees the sketchbook in their hand, and he knows.',
  },
  {
    id: 'c11-chat-1',
    type: 'chat',
    title: 'Talk to Sunwoo',
    characterId: 'sunwoo',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.cafeInterior,
  },
  {
    id: 'c11-beat-1b',
    type: 'beat',
    title: 'The Next Night',
    sceneImagePrompt: SCENES.cafeRain,
    arcBrief: 'The next night. It\'s raining. The protagonist comes to the café at 11:11. They half-expect Sunwoo not to be there — the embarrassment might have driven him away. But he\'s in his corner. Same black coffee. No sketchbook tonight. He looks up when they enter. Jieun, behind the counter, catches the protagonist\'s eye and gives the smallest smile. The protagonist sits in their usual spot. The distance between the two tables feels different now. Sunwoo doesn\'t draw. The protagonist doesn\'t read. They just exist in the same warm space while rain hits the windows. Before leaving, he stops at their table. "I should have asked first," he says. "Before drawing you." End with the protagonist saying something that makes him stay for one more minute.',
  },
  {
    id: 'c11-chat-1b',
    type: 'chat',
    title: 'Talk to Jieun',
    characterId: 'jieun',
    minExchanges: 2,
    maxExchanges: 8,
    chatImagePrompt: SCENES.baristaChat,
  },
  {
    id: 'c11-scene-1',
    type: 'scene',
    title: 'The Café at 11:11',
    sceneImagePrompt: SCENES.cafeRain,
    chatImagePrompt: SCENES.cafeRain,
    sceneCharacters: [
      { characterId: 'sunwoo', minExchanges: 2, maxExchanges: 8, required: true },
      { characterId: 'jieun', minExchanges: 1, maxExchanges: 8, required: false },
    ],
    minCharactersTalkedTo: 1,
  },
  {
    id: 'c11-beat-2',
    type: 'beat',
    title: 'The Drawing',
    sceneImagePrompt: SCENES.sketchReveal,
    arcBrief: 'A week later. They\'ve started sitting at the same table. Sunwoo draws while the protagonist reads or studies. It\'s comfortable. One evening, he tears a page from his sketchbook and slides it across the table without a word. It\'s a sketch of the café — the protagonist visible in the window, the autumn trees reflected in the glass, the "11:11" sign glowing. It\'s beautiful. It\'s the view from outside looking in. The protagonist realises: this is how he sees them. Not up close but at a distance, through glass, slightly out of reach. End with the question of what would happen if that distance closed.',
  },

  // ── Choice Point A ──
  {
    id: 'c11-cp-1',
    type: 'choice',
    title: 'The Distance',
    choicePointId: 'c11-cp-1',
    sceneImagePrompt: SCENES.sketchReveal,
    options: [
      {
        id: 'close-gap',
        label: 'Ask to see more',
        description: 'Ask him to draw you. Right now. Up close, not through a window.',
        sceneHint: 'bold / intimate',
        consequenceHint: 'He\'s drawn you from a distance. This changes everything.',
        imagePrompt: SCENES.cafeCorner,
      },
      {
        id: 'keep-distance',
        label: 'Keep the drawing, keep the pace',
        description: 'Take the drawing home. Let this unfold the way café things do — slowly.',
        sceneHint: 'patient / gentle',
        consequenceHint: 'Some things are more beautiful when you don\'t rush them.',
        imagePrompt: SCENES.streetNight,
      },
    ],
  },

  // ── Act 2: Close gap path ──
  {
    id: 'c11-beat-3a',
    type: 'beat',
    title: 'Up Close',
    requires: { 'c11-cp-1': 'close-gap' },
    sceneImagePrompt: SCENES.cafeCorner,
    arcBrief: 'The protagonist asks Sunwoo to draw them. Now. He freezes. "Here?" "Here." He opens his sketchbook. His pencil hovers. Drawing someone who knows you\'re drawing them is entirely different. His hand trembles slightly. The protagonist sits still. Five minutes pass. Ten. Jieun brings refills and says nothing. When he\'s done, he doesn\'t show them. "It\'s different," he says. "When you\'re looking back." His ears are red. "The other drawings — you were always looking somewhere else. This one..." He turns the sketchbook around. The drawing is rawer, less polished, and somehow more honest. The protagonist\'s eyes are looking directly out of the page. End with the understanding that being truly seen requires letting someone look.',
  },
  {
    id: 'c11-chat-2a',
    type: 'chat',
    title: 'Talk to Sunwoo',
    requires: { 'c11-cp-1': 'close-gap' },
    characterId: 'sunwoo',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.cafeCorner,
  },
  {
    id: 'c11-beat-4a',
    type: 'beat',
    title: 'The Exhibition',
    requires: { 'c11-cp-1': 'close-gap' },
    sceneImagePrompt: SCENES.galleryHallway,
    arcBrief: 'Sunwoo\'s art school has a student exhibition. He hasn\'t mentioned it. Jieun tells the protagonist: "His stuff goes up Friday. Gallery on Insadong. He won\'t invite you — he\'s too scared you\'ll actually come." The protagonist goes. The gallery is small, white-walled. Sunwoo\'s section: six drawings. Five are landscapes, still lifes, technically brilliant. The sixth is the drawing he made at the café — the one where the protagonist is looking directly at the viewer. It\'s labelled: "11:11." End with the protagonist standing in front of their own face on a gallery wall, and Sunwoo appearing in the doorway behind them.',
  },
  {
    id: 'c11-chat-3a',
    type: 'chat',
    title: 'Talk to Jieun',
    requires: { 'c11-cp-1': 'close-gap' },
    characterId: 'jieun',
    minExchanges: 2,
    maxExchanges: 8,
    chatImagePrompt: SCENES.baristaChat,
  },

  // ── Act 2: Keep distance path ──
  {
    id: 'c11-beat-3b',
    type: 'beat',
    title: 'The Walk',
    requires: { 'c11-cp-1': 'keep-distance' },
    sceneImagePrompt: SCENES.streetNight,
    arcBrief: 'The protagonist takes the drawing home. They keep coming to the café. One night, they leave at the same time. They walk in the same direction. Neither comments on it. Autumn streets, leaves underfoot, city lights reflected in puddles. Sunwoo walks like he draws — carefully, noticing everything. He stops at a particular tree. "The light here," he says. "At this angle. This is the best light in the city." The protagonist looks. He\'s right. They stand in the golden pooling glow of a single street lamp. "This is what I was trying to draw," he says quietly. "In the café sketch. This light. On you." End with the most romantic thing he could have said — and the fact that he didn\'t realise he said it.',
  },
  {
    id: 'c11-chat-2b',
    type: 'chat',
    title: 'Talk to Jieun',
    requires: { 'c11-cp-1': 'keep-distance' },
    characterId: 'jieun',
    minExchanges: 2,
    maxExchanges: 8,
    chatImagePrompt: SCENES.baristaChat,
  },
  {
    id: 'c11-beat-4b',
    type: 'beat',
    title: 'The Exhibition',
    requires: { 'c11-cp-1': 'keep-distance' },
    sceneImagePrompt: SCENES.galleryHallway,
    arcBrief: 'Sunwoo mentions, almost accidentally, that he has work in a student exhibition. Jieun catches the protagonist\'s eye from behind the counter and nods once: go. The protagonist goes. The gallery is quiet, white-walled. Sunwoo\'s section has five pieces. Beautiful, technically precise. The sixth slot is empty — a label says "11:11 (withdrawn by artist)." The protagonist understands: he was going to show one of the drawings of them. He pulled it at the last moment. They text him from the gallery: "I saw the empty slot." Three dots appear. Disappear. Appear again. His reply: "I wasn\'t sure you\'d want to be on a wall." End with the protagonist typing back something that changes everything.',
  },
  {
    id: 'c11-chat-3b',
    type: 'chat',
    title: 'Talk to Sunwoo',
    requires: { 'c11-cp-1': 'keep-distance' },
    characterId: 'sunwoo',
    minExchanges: 3,
    maxExchanges: 10,
    chatImagePrompt: SCENES.parkBench,
  },

  // ── Choice Point B ──
  {
    id: 'c11-cp-2-close',
    type: 'choice',
    title: 'After the Exhibition',
    choicePointId: 'c11-cp-2',
    requires: { 'c11-cp-1': 'close-gap' },
    sceneImagePrompt: SCENES.galleryHallway,
    options: [
      {
        id: 'stay',
        label: 'Stay at the gallery',
        description: 'Wait for him. Stand in front of that drawing until he has to talk to you.',
        sceneHint: 'bold / certain',
        consequenceHint: 'He put your face on a wall. The least you can do is face him.',
        imagePrompt: SCENES.galleryHallway,
      },
      {
        id: 'cafe',
        label: 'Meet him at the café',
        description: 'Go to 11:11. If this started somewhere, it should continue there.',
        sceneHint: 'faithful / patient',
        consequenceHint: 'The café is where you found each other. Go back to the beginning.',
        imagePrompt: SCENES.cafeInterior,
      },
    ],
  },
  {
    id: 'c11-cp-2-keep',
    type: 'choice',
    title: 'After the Text',
    choicePointId: 'c11-cp-2',
    requires: { 'c11-cp-1': 'keep-distance' },
    sceneImagePrompt: SCENES.parkBench,
    options: [
      {
        id: 'stay',
        label: 'Tell him to put it back up',
        description: 'Text him: "Put the drawing back. I want to be on the wall."',
        sceneHint: 'brave / direct',
        consequenceHint: 'Let the world see what he sees. Let him know you\'re okay with it.',
        imagePrompt: SCENES.galleryHallway,
      },
      {
        id: 'cafe',
        label: 'Meet him at the café tonight',
        description: 'Text him: "11:11. Tonight." Some things need to be said in person.',
        sceneHint: 'intimate / certain',
        consequenceHint: 'The gallery can wait. The café can\'t.',
        imagePrompt: SCENES.cafeInterior,
      },
    ],
  },

  // ── Act 3: Four endings ──
  {
    id: 'c11-ending-close-stay',
    type: 'beat',
    title: '11:11',
    requires: { 'c11-cp-1': 'close-gap', 'c11-cp-2': 'stay' },
    sceneImagePrompt: SCENES.galleryHallway,
    arcBrief: 'The protagonist waits. Sunwoo finds them standing in front of the drawing. "You came," he says. "You drew me on a gallery wall. Of course I came." He stands beside them, both looking at the drawing. "It\'s missing something," he says. He takes out his pencil and adds one small detail to the corner of the frame — the time: 11:11. "That\'s when I first saw you," he says. "I looked up from my sketchbook and you were sitting in the window and I thought—" He stops. "You thought what?" "I thought: oh. There you are." End with the strongest connection — a boy who drew someone into existence, and the person who came to life when they looked back.',
  },
  {
    id: 'c11-ending-close-cafe',
    type: 'beat',
    title: 'The Corner Booth',
    requires: { 'c11-cp-1': 'close-gap', 'c11-cp-2': 'cafe' },
    sceneImagePrompt: SCENES.cafeInterior,
    arcBrief: 'The protagonist goes to the café. 11:11 PM. Sunwoo arrives exactly on time. Jieun sets two black coffees down without being asked and disappears. They sit in the corner booth — his side this time. He opens his sketchbook to the last page. A new drawing: not the protagonist, but the café itself, empty, the way it looks before either of them arrives. "I drew this in case you stopped coming," he says. "I wanted to remember what it looked like when it still felt like waiting." The protagonist closes the sketchbook. "You don\'t have to wait anymore." End with the warmth of return — two people who found each other in a café at 11:11 and decided to keep showing up.',
  },
  {
    id: 'c11-ending-keep-stay',
    type: 'beat',
    title: 'The Sixth Slot',
    requires: { 'c11-cp-1': 'keep-distance', 'c11-cp-2': 'stay' },
    sceneImagePrompt: SCENES.galleryHallway,
    arcBrief: 'Sunwoo comes to the gallery the next morning. The sixth slot isn\'t empty anymore. The protagonist convinced the gallery to let them hang the café sketch — the one he gave them weeks ago. Below it, in their handwriting: "11:11. By Lee Sunwoo. (Returned by the subject.)" He stands in front of it for a long time. Then he texts them: "You hung my drawing." "You drew me first." He laughs — the protagonist has never heard him laugh before. He sends one more text: "Café tonight? 11:11." End with the certainty of a new ritual — no longer coincidence, no longer accident, just two people choosing the same corner booth at the same time.',
  },
  {
    id: 'c11-ending-keep-cafe',
    type: 'beat',
    title: 'The New Sketch',
    requires: { 'c11-cp-1': 'keep-distance', 'c11-cp-2': 'cafe' },
    sceneImagePrompt: SCENES.cafeInterior,
    arcBrief: 'They meet at the café. 11:11. The rain has started again. Sunwoo is already there. He has the sketchbook, but it\'s closed. "I withdrew the drawing because it felt like showing someone a letter I hadn\'t sent yet," he says. "I didn\'t want the gallery to read it before you did." He opens the book and slides it across the table. A new drawing, done tonight: the two of them sitting at this table, seen from above, rain on the window, their coffee cups forming an invisible line between them. At the bottom, small and careful: "The distance was never the table. It was me." Jieun, wiping the counter, pretends not to cry. End with the protagonist reaching across the table to close the sketchbook and hold his hand instead — the first drawing he doesn\'t need to finish.',
  },

  // ── Reveal ──
  {
    id: 'c11-reveal',
    type: 'reveal',
    title: 'Your Story',
    sceneImagePrompt: SCENES.revealScene,
  },
]
