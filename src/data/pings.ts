// ─── Character-Initiated Messages (Pings) ───
// Pings fire between story steps as notifications. Characters "text first."

export interface PingDef {
  id: string
  characterId: string // who's texting
  afterStep: string // triggers after this step ID completes
  affinityMin?: number // minimum affinity with this character to trigger
  staticMessage?: string // fallback if Claude generation fails
  contextHint: string // passed to Claude to generate the ping message
  maxReplies: number // how many exchanges in the mini-chat (0 = notification only)
}

// ─── Seoul Transfer pings ───

export const SEOUL_TRANSFER_PINGS: PingDef[] = [
  {
    id: 'sora-after-chat1',
    characterId: 'sora',
    afterStep: 'chat-1',
    affinityMin: 0,
    staticMessage: 'omg wait, are you still at the academy? i just saw something',
    contextHint: 'Sora saw something interesting about the love interest (Jiwon/Yuna) after the protagonist\'s first conversation. She\'s excited to share gossip. Keep it teasing — don\'t reveal everything.',
    maxReplies: 2,
  },
  {
    id: 'li-after-choice1',
    characterId: 'jiwon', // resolved to love interest at runtime
    afterStep: 'cp-1',
    affinityMin: 10,
    staticMessage: '...',
    contextHint: 'The love interest is sending a cryptic, brief message after the protagonist made their first big choice. Something that shows they noticed what happened. Stay guarded — 1 sentence max.',
    maxReplies: 2,
  },
  {
    id: 'sora-after-scene2',
    characterId: 'sora',
    afterStep: 'scene-2',
    affinityMin: 20,
    staticMessage: 'ok so i definitely overheard something i wasn\'t supposed to lol',
    contextHint: 'Sora overheard something about the love interest and the label/agency drama. She\'s conflicted about sharing it but can\'t help herself. Reference what happened in scene-2 if possible.',
    maxReplies: 3,
  },
  {
    id: 'li-after-scene3',
    characterId: 'jiwon', // resolved to love interest at runtime
    afterStep: 'scene-3',
    affinityMin: 30,
    staticMessage: 'can we talk? not here.',
    contextHint: 'The love interest wants to talk privately after a tense group scene. Something is on their mind. The tone should reflect the current trust level — more open if trust is high, more cryptic if low.',
    maxReplies: 2,
  },
]

// ─── Hollow Manor pings ───

export const HOLLOW_MANOR_PINGS: PingDef[] = [
  {
    id: 'mae-after-chat1',
    characterId: 'mae',
    afterStep: 'chat-1',
    affinityMin: 0,
    staticMessage: 'I found something in the east wing. You should see this.',
    contextHint: 'Mae found something unsettling in the manor. She\'s calm but urgent. Keep it brief and creepy.',
    maxReplies: 2,
  },
  {
    id: 'ellis-after-cp1',
    characterId: 'ellis',
    afterStep: 'cp-1',
    affinityMin: 15,
    staticMessage: 'The house noticed what you did.',
    contextHint: 'Ellis is warning the protagonist that the manor reacts to choices. Ominous but not hostile. 1 sentence.',
    maxReplies: 2,
  },
]

// ─── The Last Signal pings ───

export const LAST_SIGNAL_PINGS: PingDef[] = [
  {
    id: 'noor-after-chat1',
    characterId: 'noor',
    afterStep: 'chat-1',
    affinityMin: 0,
    staticMessage: 'Check your phone. I sent you something.',
    contextHint: 'Noor has found a lead on the missing person case and is sharing it with the protagonist. Brief, professional, urgent.',
    maxReplies: 2,
  },
  {
    id: 'dex-after-cp1',
    characterId: 'dex',
    afterStep: 'cp-1',
    affinityMin: 10,
    staticMessage: 'Interesting choice. People are talking.',
    contextHint: 'Dex has noticed the protagonist\'s approach to the investigation and has opinions about it. Streetwise, slightly amused.',
    maxReplies: 2,
  },
]

// ─── Registry ───

const PING_REGISTRY: Record<string, PingDef[]> = {
  'seoul-transfer': SEOUL_TRANSFER_PINGS,
  'hollow-manor': HOLLOW_MANOR_PINGS,
  'the-last-signal': LAST_SIGNAL_PINGS,
}

/** Get all ping definitions for a universe */
export function getPingsForUniverse(universeId: string | null): PingDef[] {
  return PING_REGISTRY[universeId ?? 'seoul-transfer'] ?? SEOUL_TRANSFER_PINGS
}
