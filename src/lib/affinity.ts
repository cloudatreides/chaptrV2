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

/** Get the affinity tier for a given score */
export function getAffinityTier(score: number): AffinityTier {
  const clamped = Math.max(0, Math.min(100, score))
  for (let i = AFFINITY_TIERS.length - 1; i >= 0; i--) {
    if (clamped >= AFFINITY_TIERS[i].min) return AFFINITY_TIERS[i]
  }
  return AFFINITY_TIERS[0]
}

/** Calculate affinity growth for a given exchange number (diminishing returns) */
export function getAffinityGrowth(exchangeNumber: number): number {
  if (exchangeNumber <= 3) return 5
  if (exchangeNumber <= 6) return 3
  return 2
}
