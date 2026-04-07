import { getCharacter } from './characters'

export interface CastMember {
  id: string
  name: string
  universeId: string
  universeLabel: string
  base: boolean // always unlocked
}

export const CAST_ROSTER: CastMember[] = [
  // Base — always chattable
  { id: 'sora', name: 'Sora', universeId: 'seoul-transfer', universeLabel: 'Seoul Transfer', base: true },
  { id: 'jiwon', name: 'Jiwon', universeId: 'seoul-transfer', universeLabel: 'Seoul Transfer', base: true },
  { id: 'yuna', name: 'Yuna', universeId: 'seoul-transfer', universeLabel: 'Seoul Transfer', base: true },
  // Story-locked
  { id: 'ren', name: 'Ren', universeId: 'sakura-academy', universeLabel: 'Sakura Academy', base: false },
  { id: 'mei', name: 'Mei', universeId: 'sakura-academy', universeLabel: 'Sakura Academy', base: false },
  { id: 'ellis', name: 'Ellis', universeId: 'hollow-manor', universeLabel: 'Hollow Manor', base: false },
  { id: 'mae', name: 'Mae', universeId: 'hollow-manor', universeLabel: 'Hollow Manor', base: false },
  { id: 'dex', name: 'Dex', universeId: 'the-last-signal', universeLabel: 'The Last Signal', base: false },
  { id: 'noor', name: 'Noor', universeId: 'the-last-signal', universeLabel: 'The Last Signal', base: false },
  { id: 'zara', name: 'Zara', universeId: 'edge-of-atlas', universeLabel: 'Edge of Atlas', base: false },
  { id: 'kael', name: 'Kael', universeId: 'edge-of-atlas', universeLabel: 'Edge of Atlas', base: false },
]

/** Color accent per universe for locked state hints */
export const UNIVERSE_COLORS: Record<string, string> = {
  'seoul-transfer': '#c84b9e',
  'sakura-academy': '#c84b9e',
  'hollow-manor': '#6366f1',
  'the-last-signal': '#10b981',
  'edge-of-atlas': '#f59e0b',
}

/** Get a cast member's full character data (universe-aware) */
export function getCastCharacter(castMember: CastMember) {
  return getCharacter(castMember.id, castMember.universeId)
}
