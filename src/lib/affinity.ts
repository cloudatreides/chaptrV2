// ─── Affinity Tier System ───

export interface AffinityTier {
  label: string
  min: number
  max: number
  color: string
  promptModifier: string
}

export const AFFINITY_TIERS: AffinityTier[] = [
  {
    label: 'Stranger',
    min: 0, max: 15,
    color: 'rgba(255,255,255,0.3)',
    promptModifier: 'You barely know this person. Keep your guard up. Polite but distant.',
  },
  {
    label: 'Acquaintance',
    min: 16, max: 35,
    color: 'rgba(200,75,158,0.4)',
    promptModifier: 'You\'re getting to know this person. You\'re curious but still cautious. Small talk comes easier now.',
  },
  {
    label: 'Friend',
    min: 36, max: 55,
    color: 'rgba(200,75,158,0.6)',
    promptModifier: 'You consider this person a friend. You can be more relaxed, share opinions freely, and joke around. You might bring up things they\'ve mentioned before.',
  },
  {
    label: 'Close',
    min: 56, max: 80,
    color: 'rgba(200,75,158,0.8)',
    promptModifier: 'This person is close to you. You trust them with real feelings. You can be vulnerable, admit doubts, and talk about things you don\'t share with most people.',
  },
  {
    label: 'Confidant',
    min: 81, max: 100,
    color: '#c84b9e',
    promptModifier: 'This person knows you deeply. No pretense left. You can say what you really think, share secrets, show the parts of yourself you normally hide. The connection is rare and real.',
  },
]

// ─── Romance-specific affinity tiers (Change A) ───
// These replace the generic tiers for ROMANCE genre universes.
// They guide the character through romantic escalation that matches
// what the target audience (14-21) expects from interactive fiction.

export const ROMANCE_AFFINITY_TIERS: AffinityTier[] = [
  {
    label: 'Stranger',
    min: 0, max: 15,
    color: 'rgba(255,255,255,0.3)',
    promptModifier: 'You just met this person. You notice them but keep your distance. Maybe a stolen glance, but nothing more. Guarded and cool.',
  },
  {
    label: 'Acquaintance',
    min: 16, max: 35,
    color: 'rgba(200,75,158,0.4)',
    promptModifier: 'You\'re noticing this person more than you should. You find excuses to talk to them. Small moments linger. You\'re curious and slightly nervous around them, though you\'d never admit it.',
  },
  {
    label: 'Drawn to them',
    min: 36, max: 55,
    color: 'rgba(200,75,158,0.6)',
    promptModifier: 'There\'s real tension between you. You tease them, test them, look for excuses to be near them. When they say something genuine, it catches you off guard. Your guard is slipping and you both know it. You might say something accidentally honest, then try to cover it up.',
  },
  {
    label: 'Falling',
    min: 56, max: 80,
    color: 'rgba(200,75,158,0.8)',
    promptModifier: 'You\'re fighting feelings and losing. When they\'re bold, you get flustered. When they\'re sweet, something in your chest tightens. You say things you didn\'t plan to. Your cool exterior cracks when they catch you off guard. Push-pull: you might say something vulnerable, then deflect with humor because it scared you. But the warmth keeps leaking through.',
  },
  {
    label: 'All in',
    min: 81, max: 100,
    color: '#c84b9e',
    promptModifier: 'The walls are down. You can\'t pretend anymore and you don\'t want to. When they say something romantic, you don\'t deflect. You might be shy about it, but you lean in. You can admit what they mean to you. You\'re protective, tender, honest. This person changed something in you and you want them to know it.',
  },
]

/** Get the affinity tier for a given score, genre-aware */
export function getAffinityTier(score: number, genre?: string): AffinityTier {
  const clamped = Math.max(0, Math.min(100, score))
  const tiers = genre === 'ROMANCE' ? ROMANCE_AFFINITY_TIERS : AFFINITY_TIERS
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (clamped >= tiers[i].min) return tiers[i]
  }
  return tiers[0]
}

/** Calculate affinity growth for a given exchange number (diminishing returns) */
export function getAffinityGrowth(exchangeNumber: number): number {
  if (exchangeNumber <= 3) return 5
  if (exchangeNumber <= 6) return 3
  return 2
}
