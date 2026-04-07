// ─── Ambient Pings ───
// Characters reach out when you're away from the app.
// Gated by global affinity tier + hours since last session.

export interface AmbientPingDef {
  id: string
  characterId: string
  universeId: string
  /** Minimum global affinity to trigger (0–100) */
  affinityMin: number
  /** Minimum hours inactive before this can fire */
  hoursInactive: number
  /** The message the character sends */
  message: string
  /** Context hint for Claude to generate replies */
  contextHint: string
  /** Max back-and-forth exchanges (protagonist replies) */
  maxReplies: number
}

// ─── Seoul Transfer ───

const SEOUL_TRANSFER_AMBIENT: AmbientPingDef[] = [
  {
    id: 'ap-jiwon-miss',
    characterId: 'jiwon',
    universeId: 'seoul-transfer',
    affinityMin: 20,
    hoursInactive: 4,
    message: 'Been quiet around here. The practice room feels different.',
    contextHint: 'Jiwon noticed the protagonist has been away. He won\'t say he misses them directly — he\'ll deflect with something about the academy feeling quieter. Stay guarded but let warmth slip through.',
    maxReplies: 3,
  },
  {
    id: 'ap-sora-update',
    characterId: 'sora',
    universeId: 'seoul-transfer',
    affinityMin: 10,
    hoursInactive: 2,
    message: 'ok so you\'re never gonna believe what just happened at rehearsal lol',
    contextHint: 'Sora has gossip about something that happened at the academy while the protagonist was away. She\'s excited and wants to share. Classic Sora energy — teasing, fun, makes you feel like you missed out on something good.',
    maxReplies: 3,
  },
  {
    id: 'ap-jiwon-song',
    characterId: 'jiwon',
    universeId: 'seoul-transfer',
    affinityMin: 45,
    hoursInactive: 8,
    message: 'I wrote something. Not sure if it\'s any good. Probably shouldn\'t have sent this.',
    contextHint: 'Jiwon impulsively shared that he wrote a song — possibly inspired by the protagonist. He\'s already regretting being this open. If they respond warmly, let a tiny bit more vulnerability through. If they tease, he shuts down.',
    maxReplies: 3,
  },
]

// ─── Hollow Manor ───

const HOLLOW_MANOR_AMBIENT: AmbientPingDef[] = [
  {
    id: 'ap-ellis-warning',
    characterId: 'ellis',
    universeId: 'hollow-manor',
    affinityMin: 15,
    hoursInactive: 4,
    message: 'I found something in the east wing. You should see this before anyone else does.',
    contextHint: 'Ellis discovered something unsettling in the manor while the protagonist was away. She\'s trying to stay calm but there\'s urgency underneath. She trusts the protagonist enough to show them first.',
    maxReplies: 3,
  },
  {
    id: 'ap-mae-check',
    characterId: 'mae',
    universeId: 'hollow-manor',
    affinityMin: 25,
    hoursInactive: 6,
    message: 'The house has been... restless. Are you coming back?',
    contextHint: 'Mae is checking in on the protagonist. The manor feels different when they\'re not around — more active, more hostile. There\'s genuine concern beneath her measured exterior.',
    maxReplies: 3,
  },
]

// ─── The Last Signal ───

const LAST_SIGNAL_AMBIENT: AmbientPingDef[] = [
  {
    id: 'ap-dex-lead',
    characterId: 'dex',
    universeId: 'the-last-signal',
    affinityMin: 15,
    hoursInactive: 3,
    message: 'New lead. Can\'t say more over text. Where are you?',
    contextHint: 'Dex has a new development in the case and needs the protagonist. He\'s paranoid about being surveilled, so he\'s cryptic over text. There\'s urgency — the 48-hour clock is ticking.',
    maxReplies: 3,
  },
  {
    id: 'ap-noor-warning',
    characterId: 'noor',
    universeId: 'the-last-signal',
    affinityMin: 30,
    hoursInactive: 6,
    message: 'Someone\'s been asking about you. Watch your back.',
    contextHint: 'Noor heard through her network that someone is looking into the protagonist. She\'s warning them — not out of kindness, but because their fates are intertwined now.',
    maxReplies: 3,
  },
]

// ─── Sakura Academy ───

const SAKURA_ACADEMY_AMBIENT: AmbientPingDef[] = [
  {
    id: 'ap-ren-roof',
    characterId: 'ren',
    universeId: 'sakura-academy',
    affinityMin: 20,
    hoursInactive: 4,
    message: 'The rooftop is empty today. Kind of wished it wasn\'t.',
    contextHint: 'Ren is at the academy rooftop — their usual meeting spot — and the protagonist isn\'t there. He won\'t say he misses them directly, but the implication is clear. Soft, a bit wistful.',
    maxReplies: 3,
  },
  {
    id: 'ap-mei-photo',
    characterId: 'mei',
    universeId: 'sakura-academy',
    affinityMin: 10,
    hoursInactive: 3,
    message: 'I took the prettiest photo of the cherry blossoms today! You have to see it~',
    contextHint: 'Mei is sharing a happy moment — she saw cherry blossoms and thought of the protagonist. She\'s warm, bubbly, and wants to brighten their day. Classic Mei energy.',
    maxReplies: 3,
  },
]

// ─── Edge of Atlas ───

const EDGE_OF_ATLAS_AMBIENT: AmbientPingDef[] = [
  {
    id: 'ap-zara-discovery',
    characterId: 'zara',
    universeId: 'edge-of-atlas',
    affinityMin: 20,
    hoursInactive: 5,
    message: 'Found markings on the canyon wall that don\'t match any known civilisation. We need to talk.',
    contextHint: 'Zara made a discovery at the expedition site and needs the protagonist\'s input. She\'s excited but measured — this could change everything about their mission.',
    maxReplies: 3,
  },
  {
    id: 'ap-kael-campfire',
    characterId: 'kael',
    universeId: 'edge-of-atlas',
    affinityMin: 15,
    hoursInactive: 4,
    message: 'Camp\'s too quiet without you. Even the fire seems bored.',
    contextHint: 'Kael is at camp and the protagonist has been gone. He\'s the type to mask genuine feeling with humor. The fire comment is playful but there\'s real warmth underneath.',
    maxReplies: 3,
  },
]

// ─── Registry ───

export const ALL_AMBIENT_PINGS: AmbientPingDef[] = [
  ...SEOUL_TRANSFER_AMBIENT,
  ...HOLLOW_MANOR_AMBIENT,
  ...LAST_SIGNAL_AMBIENT,
  ...SAKURA_ACADEMY_AMBIENT,
  ...EDGE_OF_ATLAS_AMBIENT,
]

/** Get eligible ambient pings based on global affinities and hours inactive */
export function getEligibleAmbientPings(
  globalAffinities: Record<string, number>,
  hoursInactive: number,
  alreadyFiredIds: string[],
): AmbientPingDef[] {
  return ALL_AMBIENT_PINGS.filter((ping) => {
    if (alreadyFiredIds.includes(ping.id)) return false
    if (hoursInactive < ping.hoursInactive) return false
    const affinity = globalAffinities[ping.characterId] ?? 0
    return affinity >= ping.affinityMin
  })
}
