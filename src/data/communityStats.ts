// Static seed data — plausible percentages per choicePointId per optionId
// Will be replaced with real Supabase aggregates later

export const COMMUNITY_STATS: Record<string, Record<string, number>> = {
  // Seoul Transfer
  'cp-1': { approach: 54, follow: 38, crash: 8 },
  'cp-2': { confront: 47, stay: 53, trust: 44, deflect: 56 },

  // Hollow Manor
  'hm-cp-1': { open: 57, search: 43 },
  'hm-cp-2': { return: 39, seal: 61, 'trust-ellis': 52, 'go-deeper': 48 },

  // Sakura Academy
  'sa-cp-1': { mention: 63, 'keep-quiet': 37 },
  'sa-cp-2': { 'find-him': 58, wait: 42 },

  // The Last Signal
  'ls-cp-1': { money: 41, witness: 59 },
  'ls-cp-2': { press: 46, deal: 54, 'tell-noor': 55, protect: 45 },

  // Edge of Atlas
  'ea-cp-1': { 'press-deeper': 52, 'document-first': 48 },
  'ea-cp-2': { 'trust-the-directive': 35, 'make-your-own-call': 65 },
}
