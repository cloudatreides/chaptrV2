import { getCharacter } from './characters'

export interface CastMember {
  id: string
  name: string
  universeId: string
  universeLabel: string
  base: boolean // always unlocked
  bio: string // short character description
  unlockHint: string // how to unlock this character
}

export const CAST_ROSTER: CastMember[] = [
  // Base — always chattable
  { id: 'sora', name: 'Sora', universeId: 'seoul-transfer', universeLabel: 'Seoul Transfer', base: true, bio: 'A shy art student from Seoul with blue hair and a love for film photography. Quietly observant, fiercely loyal.', unlockHint: 'Always available' },
  { id: 'jiwon', name: 'Jiwon', universeId: 'seoul-transfer', universeLabel: 'Seoul Transfer', base: true, bio: 'Rising K-pop idol who hides vulnerability behind charm. Ambitious, witty, and surprisingly deep.', unlockHint: 'Always available' },
  { id: 'yuna', name: 'Yuna', universeId: 'seoul-transfer', universeLabel: 'Seoul Transfer', base: true, bio: 'K-pop idol with auburn highlights and a sharp tongue. Confident on stage, guarded off it.', unlockHint: 'Always available' },
  // Story-locked
  { id: 'ren', name: 'Ren', universeId: 'sakura-academy', universeLabel: 'Sakura Academy', base: false, bio: 'Student council president with quiet intensity. Precise, private, and unexpectedly gentle with those he trusts.', unlockHint: 'Chat with Ren during a Sakura Academy story' },
  { id: 'mei', name: 'Mei', universeId: 'sakura-academy', universeLabel: 'Sakura Academy', base: false, bio: 'Your enthusiastic orientation guide with a warm smile. Energetic, curious, and impossible not to like.', unlockHint: 'Chat with Mei during a Sakura Academy story' },
  { id: 'ellis', name: 'Ellis', universeId: 'hollow-manor', universeLabel: 'Hollow Manor', base: false, bio: 'The manor\'s elderly caretaker. Polite and proper, but his eyes hold decades of secrets he\'ll never volunteer.', unlockHint: 'Meet Ellis during a Hollow Manor story' },
  { id: 'mae', name: 'Mae', universeId: 'hollow-manor', universeLabel: 'Hollow Manor', base: false, bio: 'A historian investigating the manor\'s disappearances. Analytical, pragmatic, and hiding her own fear.', unlockHint: 'Meet Mae during a Hollow Manor story' },
  { id: 'dex', name: 'Dex', universeId: 'the-last-signal', universeLabel: 'The Last Signal', base: false, bio: 'Pawnshop owner and info broker with a crooked smile. Charming, morally flexible, and always knows more than he says.', unlockHint: 'Find Dex during a The Last Signal story' },
  { id: 'noor', name: 'Noor', universeId: 'the-last-signal', universeLabel: 'The Last Signal', base: false, bio: 'A litigation lawyer searching for her missing brother. Controlled, desperate, and dangerously determined.', unlockHint: 'Meet Noor during a The Last Signal story' },
  { id: 'zara', name: 'Zara', universeId: 'edge-of-atlas', universeLabel: 'Edge of Atlas', base: false, bio: 'Cartographer and explorer mapping the unknown. Methodical, ethical, and carries the weight of past expeditions.', unlockHint: 'Explore with Zara during an Edge of Atlas story' },
  { id: 'kael', name: 'Kael', universeId: 'edge-of-atlas', universeLabel: 'Edge of Atlas', base: false, bio: 'A frontier guide with trust issues and old scars. Protective of the land, wary of outsiders, loyal to a fault.', unlockHint: 'Meet Kael during an Edge of Atlas story' },
]

/** Color accent per universe for locked state hints */
export const UNIVERSE_COLORS: Record<string, string> = {
  'seoul-transfer': '#c84b9e',
  'sakura-academy': '#f472b6',
  'hollow-manor': '#6366f1',
  'the-last-signal': '#10b981',
  'edge-of-atlas': '#f59e0b',
}

/** Get a cast member's full character data (universe-aware) */
export function getCastCharacter(castMember: CastMember) {
  return getCharacter(castMember.id, castMember.universeId)
}
