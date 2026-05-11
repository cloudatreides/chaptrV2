import { TRAVEL_COMPANIONS, type TravelCompanion } from '../data/travel/companions'

// Two fixed tiers up top (4 + 4), then the remaining 6 are shuffled once
// per page load for variety/fairness. Shared between HomePage and
// TravelCityPage so the order matches across surfaces.
const COMPANION_TIER_1 = ['mina', 'sora', 'riko', 'sofia']
const COMPANION_TIER_2 = ['junseo', 'hyun', 'junho', 'jiwon']
const COMPANION_REST = ['hana', 'beomseok', 'maya', 'kai', 'yuna', 'bora']

function shuffle<T>(arr: T[]): T[] {
  const copy = arr.slice()
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export const COMPANION_DISPLAY_ORDER = [...COMPANION_TIER_1, ...COMPANION_TIER_2, ...shuffle(COMPANION_REST)]

const ORDER_INDEX = new Map(COMPANION_DISPLAY_ORDER.map((id, i) => [id, i]))

export function orderCompanions(companions: TravelCompanion[]): TravelCompanion[] {
  return companions.slice().sort((a, b) => {
    const ai = ORDER_INDEX.get(a.characterId) ?? COMPANION_DISPLAY_ORDER.length
    const bi = ORDER_INDEX.get(b.characterId) ?? COMPANION_DISPLAY_ORDER.length
    return ai - bi
  })
}

export const ORDERED_TRAVEL_COMPANIONS = orderCompanions(TRAVEL_COMPANIONS)
