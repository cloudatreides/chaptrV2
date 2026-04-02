// ─── Side Stories / Character Quests ───
// Unlockable mini-arcs per character, gated by affinity level.

export type QuestStepType = 'beat' | 'chat'

export interface QuestStep {
  id: string
  type: QuestStepType
  title: string
  // Beat fields
  arcBrief?: string // context for Claude prose generation
  // Chat fields — uses existing chat infrastructure
  maxExchanges?: number
  minExchanges?: number
}

export interface QuestDef {
  id: string
  characterId: string // who this quest is about (resolved at runtime for love interest)
  title: string
  description: string // 1-line teaser shown in sidebar
  affinityGate: number // minimum affinity to unlock
  steps: QuestStep[]
  contextBrief: string // injected into all Claude prompts during this quest
}

// ─── Seoul Transfer quests ───

export const SEOUL_TRANSFER_QUESTS: QuestDef[] = [
  {
    id: 'sora-audition',
    characterId: 'sora',
    title: 'Audition Prep',
    description: 'Sora needs help preparing for her debut audition.',
    affinityGate: 36, // Friend tier
    contextBrief: 'Sora has asked the protagonist to help her prepare for a big audition. She\'s usually confident and bubbly, but this audition means everything — it\'s her one shot at debuting. She\'s more vulnerable than usual. The protagonist is the only person she\'s told about how nervous she is.',
    steps: [
      {
        id: 'sora-audition-beat',
        type: 'beat',
        title: 'The Practice Room',
        arcBrief: 'Sora leads the protagonist to an empty practice room after hours. She\'s been avoiding this conversation, but she finally admits she\'s terrified of the audition. She\'s practiced the choreography a hundred times but can\'t get the vocal part right. She needs someone to listen — not judge.',
      },
      {
        id: 'sora-audition-chat',
        type: 'chat',
        title: 'Real Talk',
        maxExchanges: 6,
        minExchanges: 2,
      },
    ],
  },
  {
    id: 'li-secret-song',
    characterId: 'jiwon', // resolved to love interest at runtime
    title: 'The Secret Song',
    description: 'A song they\'ve never shown anyone. Until now.',
    affinityGate: 56, // Close tier
    contextBrief: 'The love interest has brought the protagonist to a hidden corner of the studio building — a small room with an old piano that nobody uses anymore. They have a song they wrote themselves, outside of the group\'s catalogue. They\'ve never played it for anyone. This is the most vulnerable they\'ve ever been with the protagonist. The song is about feeling trapped by fame and wanting something real.',
    steps: [
      {
        id: 'li-song-beat',
        type: 'beat',
        title: 'The Hidden Room',
        arcBrief: 'The love interest leads the protagonist through a back corridor to a forgotten practice room with an old upright piano. Dust motes float in the dim light. They sit down at the keys without making eye contact. "I wrote something. I\'ve never played it for anyone." They play a few bars — raw, unpolished, heartbreakingly honest. The protagonist hears the real person behind the idol for the first time.',
      },
      {
        id: 'li-song-chat',
        type: 'chat',
        title: 'After the Last Note',
        maxExchanges: 6,
        minExchanges: 2,
      },
    ],
  },
]

// ─── Hollow Manor quests ───

export const HOLLOW_MANOR_QUESTS: QuestDef[] = [
  {
    id: 'mae-ritual',
    characterId: 'mae',
    title: 'The Binding Ritual',
    description: 'Mae found something in the manor library. She wants to try it.',
    affinityGate: 36,
    contextBrief: 'Mae discovered a protective ritual in one of the manor\'s oldest books. She believes it could protect the protagonist from whatever is in the walls. The ritual requires trust — both participants must share something they fear. Mae is practical and grounded, but this is pushing her into unfamiliar territory.',
    steps: [
      {
        id: 'mae-ritual-beat',
        type: 'beat',
        title: 'By Candlelight',
        arcBrief: 'Mae has set up candles in the manor library, arranged in a pattern from the old book. She\'s drawn symbols on the floor in chalk. She looks up when the protagonist arrives — nervous but determined. "I know how this looks. But I\'ve read every page of that book. This is real." She explains the ritual: they must face each other and share their deepest fear about the manor. The house will listen.',
      },
      {
        id: 'mae-ritual-chat',
        type: 'chat',
        title: 'What We Fear',
        maxExchanges: 5,
        minExchanges: 2,
      },
    ],
  },
  {
    id: 'ellis-memory',
    characterId: 'ellis',
    title: 'Before the Walls Changed',
    description: 'Ellis remembers something from the beginning. Something important.',
    affinityGate: 56,
    contextBrief: 'Ellis has been having fragments of a memory — from when the manor was still normal, before whatever changed it. They remember a person, a conversation, a warning they didn\'t understand at the time. This memory might explain everything, but accessing it fully means confronting what Ellis has been avoiding. They need the protagonist\'s help to stay grounded while they remember.',
    steps: [
      {
        id: 'ellis-memory-beat',
        type: 'beat',
        title: 'The Fragment',
        arcBrief: 'Ellis finds the protagonist in the hallway, visibly shaken. "I remembered something. From before." They describe fragments: warm light, a voice they trusted, a warning about the east wing. The memory keeps slipping away like smoke. Ellis needs to talk it through to hold onto it. Their hands are shaking.',
      },
      {
        id: 'ellis-memory-chat',
        type: 'chat',
        title: 'Holding On',
        maxExchanges: 5,
        minExchanges: 2,
      },
    ],
  },
]

// ─── The Last Signal quests ───

export const LAST_SIGNAL_QUESTS: QuestDef[] = [
  {
    id: 'noor-source',
    characterId: 'noor',
    title: 'The Informant',
    description: 'Noor has a source who might talk. But only to you.',
    affinityGate: 36,
    contextBrief: 'Noor has an informant who has information about the missing person, but they\'ll only talk to someone they haven\'t seen before — the protagonist. Noor is trusting the protagonist with her most valuable contact. The informant is paranoid and will bolt at the first sign of pressure. Noor briefs the protagonist on how to handle the meeting.',
    steps: [
      {
        id: 'noor-source-beat',
        type: 'beat',
        title: 'The Briefing',
        arcBrief: 'Noor pulls the protagonist aside in a quiet corner of the precinct. She speaks low — this contact is off the books. "They go by Whisper. They know where the missing person was last seen, but they\'re scared. They\'ll meet you at the noodle place on 4th. Don\'t push. Don\'t record. And whatever you do, don\'t mention my name." She hands the protagonist a photo to memorize.',
      },
      {
        id: 'noor-source-chat',
        type: 'chat',
        title: 'Meeting Whisper',
        maxExchanges: 5,
        minExchanges: 2,
      },
    ],
  },
  {
    id: 'dex-past',
    characterId: 'dex',
    title: 'Why I\'m Really Here',
    description: 'Dex has a personal stake in this case. More than they let on.',
    affinityGate: 56,
    contextBrief: 'Dex has been hiding why they\'re involved in the missing person case. The missing person isn\'t just a case to them — it\'s someone they knew, someone who disappeared from their life years ago. Dex has been carrying this weight silently. They\'re finally ready to tell someone the truth, but only because they trust the protagonist enough. This is raw, unguarded Dex.',
    steps: [
      {
        id: 'dex-past-beat',
        type: 'beat',
        title: 'The Rooftop',
        arcBrief: 'Dex texts the protagonist to meet on the rooftop of their building, late at night. The city stretches out below, all neon and shadow. Dex is leaning on the railing, looking at something in their hand — an old photo. When the protagonist approaches, Dex doesn\'t turn around. "I haven\'t been straight with you. About why I\'m doing this." They hand over the photo. It\'s the missing person. Younger. Smiling. With Dex.',
      },
      {
        id: 'dex-past-chat',
        type: 'chat',
        title: 'The Truth',
        maxExchanges: 5,
        minExchanges: 2,
      },
    ],
  },
]

// ─── Registry ───

const QUEST_REGISTRY: Record<string, QuestDef[]> = {
  'seoul-transfer': SEOUL_TRANSFER_QUESTS,
  'hollow-manor': HOLLOW_MANOR_QUESTS,
  'the-last-signal': LAST_SIGNAL_QUESTS,
}

/** Get all quest definitions for a universe */
export function getQuestsForUniverse(universeId: string | null): QuestDef[] {
  return QUEST_REGISTRY[universeId ?? 'seoul-transfer'] ?? SEOUL_TRANSFER_QUESTS
}

/** Get a specific quest by ID across all universes */
export function getQuestById(questId: string): QuestDef | null {
  for (const quests of Object.values(QUEST_REGISTRY)) {
    const found = quests.find(q => q.id === questId)
    if (found) return found
  }
  return null
}
