import type { StoryStep } from '../../storyData'

const SCENE_PROMPTS = {
  morningAfter: 'Anime style, early morning Seoul skyline from an academy dormitory window, golden light, messy desk with music sheets, phone screen glowing with an unread message, peaceful but charged atmosphere',
  morningAfterAlt: 'Anime style, close-up of a hand reaching for a phone on a nightstand, soft morning light through curtains, Seoul cityscape beyond, quiet intimacy',
  hallwayTension: 'Anime style, crowded academy hallway, a Korean male idol in a black jacket walking past a young person, brief intense eye contact while everyone else is oblivious, fluorescent lights, motion blur on background students',
  hallwayTensionAlt: 'Anime style, POV shot through a crowd of students, catching a glimpse of dark messy hair and broad shoulders disappearing around a corner, academy setting, warm afternoon light',
  practiceConflict: 'Anime style, a handsome Korean male idol with dark hair arguing with a stern older man in a suit in a glass-walled office, visible tension, the young person watching from outside through the glass, dramatic lighting',
  practiceConflictAlt: 'Anime style, a young person pressed against a wall outside an office, hand over their mouth, overhearing something they shouldn\'t, dramatic shadow and light',
  soraWarning: 'Anime style, a blue-haired girl grabbing a young person\'s arm in an empty stairwell, urgent expression, harsh fluorescent lighting, sense of secrecy and warning',
  soraWarningAlt: 'Anime style, two figures in a stairwell shot from above, one with blue hair leaning in close to whisper, geometric shadows from the railings',
  rooftopSecret: 'Anime style, a handsome Korean idol sitting alone on an academy rooftop playing guitar, city lights below, wind in his dark hair, vulnerable and beautiful, nobody watching except the viewer',
  rooftopSecretAlt: 'Anime style, a guitar leaning against a rooftop railing at night, Seoul city lights stretching to the horizon, a jacket draped over the railing beside it, lonely but peaceful',
  labelMeeting: 'Anime style, a sleek entertainment company boardroom, monitors showing performance metrics, a stern older man at the head of the table, cold blue lighting, corporate K-pop industry atmosphere',
  labelMeetingAlt: 'Anime style, close-up of hands on a polished conference table, documents with NOVA\'s photos scattered, cold corporate lighting, tense atmosphere',
  backstageRain: 'Anime style, two young people standing under an awning while rain pours down outside the academy, close together, one holding a jacket over both their heads, warm golden light from inside contrasting with blue rain, romantic tension',
  backstageRainAlt: 'Anime style, rain falling on Seoul streets at night, neon reflections in puddles, two silhouettes sharing shelter under a narrow awning, cinematic and romantic',
  confrontManager: 'Anime style, a young person facing a stern man in a suit in a cold office, standing their ground, dramatic low angle, the idol watching from the doorway with a conflicted expression',
  confrontManagerAlt: 'Anime style, close-up of two faces in profile, one determined and one surprised, dramatic lighting split between warm and cold',
  quietSupport: 'Anime style, two people sitting back to back against a practice room wall after hours, one with eyes closed and head tilted back, shared earbuds, warm dim lighting, emotional exhaustion turned tender',
  quietSupportAlt: 'Anime style, overhead shot of two people sitting on a practice room floor, legs stretched out, a phone between them playing music, scattered sheet music around, quiet golden light',
  convenienceStoreNight: 'Anime style, three young people at a convenience store counter at 2AM, one with blue hair eating ice cream, a handsome Korean idol in a cap and mask pulled down, and the protagonist, fluorescent lights, casual and warm',
}

export const CHAPTER_2_BRIEF = 'By the end of this chapter, the protagonist has learned about the threat to Jiwon\'s career (label pressure to drop him from NOVA). They\'ve chosen whether to confront the danger head-on or protect the relationship quietly. Jiwon has shown real vulnerability. Sora has revealed she knows more than she lets on. The stakes are no longer just romantic — they\'re existential for Jiwon.'

export const CHAPTER_2_STEPS: StoryStep[] = [
  // ── Default opening: adapts based on Ch1 ending via arcBrief ──
  {
    id: 'ch2-beat-1',
    type: 'beat',
    chapter: 2,
    title: 'The Morning After',
    sceneImagePrompts: [SCENE_PROMPTS.morningAfter, SCENE_PROMPTS.morningAfterAlt],
    openingProse: 'Your phone has been on silent since last night. Three missed calls from Sora. One unread message from an unknown number.\n\nSeoul is waking up outside your window. The academy bell will ring in forty minutes.\n\nWhatever happened on that rooftop changed something. You can feel it in the way your chest tightens when you think about going back.',
    arcBrief: 'Morning after Chapter 1\'s climax. The protagonist wakes up changed by what happened. Reference the player\'s Chapter 1 choices naturally: if they confronted Jiwon, they feel exposed but brave; if they stayed quiet, they feel the weight of unsaid things; if they trusted, they feel fragile hope; if they deflected, they feel regret. Sora has been trying to reach them. End with the protagonist deciding to face the day — and whatever Jiwon is to them now.',
  },
  {
    id: 'ch2-chat-sora-1',
    type: 'chat',
    chapter: 2,
    title: 'Sora\'s Warning',
    characterId: 'sora',
    minExchanges: 3,
    maxExchanges: 8,
    chatImagePrompt: SCENE_PROMPTS.soraWarning,
  },
  {
    id: 'ch2-beat-2',
    type: 'beat',
    chapter: 2,
    title: 'The Hallway',
    sceneImagePrompts: [SCENE_PROMPTS.hallwayTension, SCENE_PROMPTS.hallwayTensionAlt],
    arcBrief: 'The protagonist runs into Jiwon in the academy hallway. But something is different. He\'s flanked by two men in suits — label people. He sees the protagonist and his expression shifts, just for a second, before the mask goes back on. He doesn\'t stop. Sora appears beside the protagonist: "They\'re from the label. Something\'s happening." The protagonist notices Jiwon\'s hand is shaking slightly as he walks away. End with dread — something is very wrong.',
  },
  {
    id: 'ch2-beat-3',
    type: 'beat',
    chapter: 2,
    title: 'The Truth About NOVA',
    sceneImagePrompts: [SCENE_PROMPTS.practiceConflict, SCENE_PROMPTS.practiceConflictAlt],
    arcBrief: 'The protagonist discovers what\'s happening: NOVA\'s label is restructuring. The manager, Director Kang, wants to drop Jiwon from the group — replace him with a younger trainee who\'s "more marketable." Jiwon has been fighting this alone. The protagonist overhears part of a heated conversation through an office door. Jiwon\'s voice: quiet, controlled, furious. Director Kang\'s voice: cold, corporate. "Your contract gives us the right." End with the protagonist reeling — the stakes are suddenly much higher than a school crush.',
  },

  // ── Choice Point: How to respond to the threat ──
  {
    id: 'ch2-cp-1',
    type: 'choice',
    chapter: 2,
    choicePointId: 'ch2-cp-1',
    title: 'What You Know',
    sceneImagePrompt: SCENE_PROMPTS.practiceConflict,
    options: [
      {
        id: 'confront-label',
        label: 'Go to Jiwon — tell him you know',
        description: 'He\'s been carrying this alone. No more secrets between you.',
        sceneHint: 'brave / honest / all in',
        consequenceHint: 'He might push you away for crossing the line. Or he might finally let someone in.',
        imagePrompt: SCENE_PROMPTS.confrontManager,
        affinityDelta: { jiwon: 8 },
      },
      {
        id: 'protect-quietly',
        label: 'Stay quiet — protect him from a distance',
        description: 'You heard something you weren\'t supposed to. Don\'t make it harder for him.',
        sceneHint: 'protective / selfless / patient',
        consequenceHint: 'You\'ll carry the weight of knowing. But at least he won\'t have to carry your worry too.',
        imagePrompt: SCENE_PROMPTS.quietSupport,
        affinityDelta: { jiwon: 3, sora: 5 },
      },
      {
        id: 'investigate',
        label: 'Dig deeper — find out what the label is really planning',
        description: 'Something about Director Kang\'s tone didn\'t add up. There\'s more to this.',
        sceneHint: 'sharp / determined / risky',
        consequenceHint: 'Knowledge is power. But the label doesn\'t take kindly to outsiders asking questions.',
        imagePrompt: SCENE_PROMPTS.labelMeeting,
        premium: true,
        gemCost: 15,
        affinityDelta: { jiwon: 5, sora: 8 },
      },
    ],
  },

  // ── Confront path ──
  {
    id: 'ch2-beat-4-confront',
    type: 'beat',
    chapter: 2,
    requires: { 'ch2-cp-1': 'confront-label' },
    title: 'No More Walls',
    sceneImagePrompts: [SCENE_PROMPTS.confrontManager, SCENE_PROMPTS.confrontManagerAlt],
    arcBrief: 'The protagonist finds Jiwon after the meeting. "I heard." Jiwon\'s first reaction is anger — not at the protagonist, at himself for not hiding it better. Walls go up. Then the protagonist says the thing that breaks through: something specific to their relationship, referencing their history from Chapter 1. Jiwon\'s defences crack. He admits he\'s scared. First time he\'s said it out loud. End with raw vulnerability — he didn\'t ask for help, but he didn\'t push them away either.',
  },
  {
    id: 'ch2-chat-jiwon-confront',
    type: 'chat',
    chapter: 2,
    requires: { 'ch2-cp-1': 'confront-label' },
    title: 'After the Walls Come Down',
    characterId: 'jiwon',
    minExchanges: 4,
    maxExchanges: 10,
    chatImagePrompt: SCENE_PROMPTS.confrontManager,
  },

  // ── Protect path ──
  {
    id: 'ch2-beat-4-protect',
    type: 'beat',
    chapter: 2,
    requires: { 'ch2-cp-1': 'protect-quietly' },
    title: 'Carrying It Alone',
    sceneImagePrompts: [SCENE_PROMPTS.quietSupport, SCENE_PROMPTS.quietSupportAlt],
    arcBrief: 'The protagonist says nothing to Jiwon about what they overheard. Instead, they show up. At practice. In the hallway. Texting about nothing important. Jiwon notices the extra presence without understanding why. "You\'ve been around a lot lately." The protagonist deflects. Sora sees through it immediately: "You know, don\'t you." The protagonist confides in Sora. End with a quiet scene: the protagonist sitting outside the practice room, listening to Jiwon sing through the wall, holding their phone with a message they can\'t send.',
  },
  {
    id: 'ch2-chat-sora-protect',
    type: 'chat',
    chapter: 2,
    requires: { 'ch2-cp-1': 'protect-quietly' },
    title: 'Sora Knows',
    characterId: 'sora',
    minExchanges: 3,
    maxExchanges: 8,
    chatImagePrompt: SCENE_PROMPTS.soraWarning,
  },

  // ── Investigate path (premium) ──
  {
    id: 'ch2-beat-4-investigate',
    type: 'beat',
    chapter: 2,
    requires: { 'ch2-cp-1': 'investigate' },
    title: 'Down the Rabbit Hole',
    sceneImagePrompts: [SCENE_PROMPTS.labelMeeting, SCENE_PROMPTS.labelMeetingAlt],
    arcBrief: 'The protagonist starts digging. With Sora\'s help, they find out Director Kang\'s "restructuring" isn\'t about marketability — it\'s personal. Kang has a protégé he wants in the group. The evidence is in schedule changes, cancelled appearances, a leaked internal email Sora found through a trainee friend. The protagonist now has information that could help Jiwon fight back, but using it means going against a powerful industry figure. End with the weight of a decision: do they give Jiwon the ammunition, knowing it means putting themselves on Kang\'s radar?',
  },
  {
    id: 'ch2-scene-investigate',
    type: 'scene',
    chapter: 2,
    requires: { 'ch2-cp-1': 'investigate' },
    title: 'War Room',
    chatImagePrompt: SCENE_PROMPTS.convenienceStoreNight,
    groupChat: true,
    sceneCharacters: [
      { characterId: 'sora', minExchanges: 2, maxExchanges: 6, required: true },
      { characterId: 'jiwon', minExchanges: 2, maxExchanges: 6, required: true },
    ],
    minCharactersTalkedTo: 2,
    arcBrief: 'Late night at the convenience store. The protagonist and Sora lay out what they\'ve found. Jiwon is brought in — reluctantly. He\'s angry that they went behind his back but can\'t deny the evidence changes things. The three of them form an uneasy alliance. End with Jiwon looking at the protagonist differently: "Why do you care this much?"',
  },

  // ── Convergence: all paths lead here ──
  {
    id: 'ch2-beat-5',
    type: 'beat',
    chapter: 2,
    title: 'The Rain',
    shareable: true,
    sceneImagePrompts: [SCENE_PROMPTS.backstageRain, SCENE_PROMPTS.backstageRainAlt],
    arcBrief: 'It starts raining after evening practice. The protagonist and Jiwon end up under the same awning outside the academy. Regardless of which path they took, the emotional charge is the same: something has shifted between them. Jiwon is quieter than usual. He looks at the rain. Then he says something honest — not about NOVA, not about the label, about what the protagonist means to him. It\'s not a confession. It\'s a crack in the armor. Something like: "I don\'t know what happens next with any of it. But I know I keep looking for you in the hallway." End with the rain, the silence, and something unnamed hanging between them.',
  },

  // ── Choice Point B: The chapter cliffhanger ──
  {
    id: 'ch2-cp-2',
    type: 'choice',
    chapter: 2,
    choicePointId: 'ch2-cp-2',
    title: 'Under the Rain',
    sceneImagePrompt: SCENE_PROMPTS.backstageRain,
    options: [
      {
        id: 'stay-close',
        label: 'Close the distance',
        description: 'Step closer. Let the rain be your excuse.',
        sceneHint: 'bold / tender / irreversible',
        consequenceHint: 'There\'s no going back to "just friends" after this.',
        imagePrompt: SCENE_PROMPTS.backstageRain,
        affinityDelta: { jiwon: 12 },
      },
      {
        id: 'give-space',
        label: 'Give him the space he needs',
        description: 'He just opened up. Don\'t push. Let the moment breathe.',
        sceneHint: 'patient / respectful / aching',
        consequenceHint: 'The right thing doesn\'t always feel good. But he\'ll remember you gave him room.',
        imagePrompt: SCENE_PROMPTS.quietSupport,
        affinityDelta: { jiwon: 5, sora: 3 },
      },
    ],
  },

  // ── Chapter 2 endings ──
  {
    id: 'ch2-ending-close',
    type: 'beat',
    chapter: 2,
    shareable: true,
    requires: { 'ch2-cp-2': 'stay-close' },
    title: 'Gravity',
    sceneImagePrompts: [SCENE_PROMPTS.backstageRain, SCENE_PROMPTS.backstageRainAlt],
    arcBrief: 'The protagonist steps closer. Jiwon doesn\'t move away. The rain is loud enough to drown out everything except the two of them. A moment of absolute stillness. He reaches out — not to touch, but to adjust the protagonist\'s collar, something absurdly mundane in a moment this charged. "You\'re getting rained on." A small smile. The warmth of proximity. Then his phone rings. It\'s the label. His face changes. He answers. Listens. Hangs up. "Emergency meeting. Tomorrow morning." He looks at the protagonist like he\'s memorizing them. "I have to go." End with: the rain, his retreating figure, and the dread of what tomorrow brings. Chapter 2 cliffhanger.',
  },
  {
    id: 'ch2-ending-space',
    type: 'beat',
    chapter: 2,
    shareable: true,
    requires: { 'ch2-cp-2': 'give-space' },
    title: 'The Space Between',
    sceneImagePrompts: [SCENE_PROMPTS.quietSupport, SCENE_PROMPTS.quietSupportAlt],
    arcBrief: 'The protagonist holds still. Jiwon notices the restraint. For a long moment, neither moves. Then Jiwon laughs — soft, almost surprised. "You\'re the only person who doesn\'t try to close the gap." It\'s a compliment and a wound at the same time. He leans against the wall beside them, shoulder to shoulder, and they watch the rain together. His phone rings. The label. His face hardens. He answers, listens, hangs up. "They want me tomorrow. Early." He pushes off the wall. Pauses. "Thank you. For not pushing." He walks into the rain without looking back. End with the protagonist alone under the awning, the warmth where his shoulder was, and the question: will there be a tomorrow for whatever this is? Chapter 2 cliffhanger.',
  },
]
