import type { StoryStep } from '../storyData'
import type { StoryCharacter } from '../characters'
import { HOLLOW_MANOR_STEPS, HOLLOW_MANOR_CHARACTERS, HOLLOW_MANOR_BIBLE } from './hollow-manor'
import { LAST_SIGNAL_STEPS, LAST_SIGNAL_CHARACTERS, LAST_SIGNAL_BIBLE } from './the-last-signal'

export interface StoryData {
  steps: StoryStep[]
  characters: Record<string, StoryCharacter>
  bible: string
  /** Label for the trust/relationship metric in this story */
  trustLabel: string
  /** Who "sees you as" on the reveal page */
  revealPerspective: string
  /** ID of the primary NPC whose name appears in the trust bar */
  primaryCharacterId: string
  /** Genre-appropriate reveal signature prompt context */
  signatureContext: string
}

export const STORY_REGISTRY: Record<string, StoryData> = {
  'hollow-manor': {
    steps: HOLLOW_MANOR_STEPS,
    characters: HOLLOW_MANOR_CHARACTERS,
    bible: HOLLOW_MANOR_BIBLE,
    trustLabel: 'nerve',
    primaryCharacterId: 'ellis',
    revealPerspective: 'The manor remembers you as',
    signatureContext: 'a supernatural horror story set in a haunted manor. The signature should capture the emotional essence of the protagonist\'s relationship with the house and its secrets — dread, courage, belonging, or escape.',
  },
  'the-last-signal': {
    steps: LAST_SIGNAL_STEPS,
    characters: LAST_SIGNAL_CHARACTERS,
    bible: LAST_SIGNAL_BIBLE,
    trustLabel: 'credibility',
    primaryCharacterId: 'dex',
    revealPerspective: 'Your reputation in this city',
    signatureContext: 'a noir mystery about finding a missing person. The signature should capture the protagonist\'s approach — their moral compass, their methods, the weight of truth they chose to carry or reveal.',
  },
}

/** Get story data for a universe, or null for universes that use the default Seoul Transfer system */
export function getStoryData(universeId: string | null): StoryData | null {
  if (!universeId) return null
  return STORY_REGISTRY[universeId] ?? null
}
