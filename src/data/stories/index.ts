import type { StoryStep } from '../storyData'
import type { StoryCharacter } from '../characters'
import { HOLLOW_MANOR_STEPS, HOLLOW_MANOR_CHARACTERS, HOLLOW_MANOR_BIBLE } from './hollow-manor'
import { LAST_SIGNAL_STEPS, LAST_SIGNAL_CHARACTERS, LAST_SIGNAL_BIBLE } from './the-last-signal'
import { SAKURA_ACADEMY_STEPS, SAKURA_ACADEMY_CHARACTERS, SAKURA_ACADEMY_BIBLE } from './sakura-academy'
import { EDGE_OF_ATLAS_STEPS, EDGE_OF_ATLAS_CHARACTERS, EDGE_OF_ATLAS_BIBLE } from './edge-of-atlas'
import { INHERITANCE_STEPS, INHERITANCE_CHARACTERS, INHERITANCE_BIBLE } from './the-inheritance'
import { SKY_PIRATES_STEPS, SKY_PIRATES_CHARACTERS, SKY_PIRATES_BIBLE } from './sky-pirates'
import { DRIFT_STEPS, DRIFT_CHARACTERS, DRIFT_BIBLE } from './the-drift'
import { PHANTOM_PROTOCOL_STEPS, PHANTOM_PROTOCOL_CHARACTERS, PHANTOM_PROTOCOL_BIBLE } from './phantom-protocol'
import { FAE_COURT_STEPS, FAE_COURT_CHARACTERS, FAE_COURT_BIBLE } from './fae-court'
import { MIDNIGHT_PARIS_STEPS, MIDNIGHT_PARIS_CHARACTERS, MIDNIGHT_PARIS_BIBLE } from './midnight-paris'
import { CAMPUS_RIVALS_STEPS, CAMPUS_RIVALS_CHARACTERS, CAMPUS_RIVALS_BIBLE } from './campus-rivals'
import { CRIMSON_DEPTHS_STEPS, CRIMSON_DEPTHS_CHARACTERS, CRIMSON_DEPTHS_BIBLE } from './crimson-depths'
import { WHISPER_GAME_STEPS, WHISPER_GAME_CHARACTERS, WHISPER_GAME_BIBLE } from './the-whisper-game'
import { NEON_DISTRICT_STEPS, NEON_DISTRICT_CHARACTERS, NEON_DISTRICT_BIBLE } from './neon-district'
import { ROOFTOP_PROMISE_STEPS, ROOFTOP_PROMISE_CHARACTERS, ROOFTOP_PROMISE_BIBLE } from './rooftop-promise'
import { FAKE_DATING_STEPS, FAKE_DATING_CHARACTERS, FAKE_DATING_BIBLE } from './fake-dating'
import { CAFE_1111_STEPS, CAFE_1111_CHARACTERS, CAFE_1111_BIBLE } from './cafe-1111'
import { IDOL_NEXT_DOOR_STEPS, IDOL_NEXT_DOOR_CHARACTERS, IDOL_NEXT_DOOR_BIBLE } from './idol-next-door'

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
  'sakura-academy': {
    steps: SAKURA_ACADEMY_STEPS,
    characters: SAKURA_ACADEMY_CHARACTERS,
    bible: SAKURA_ACADEMY_BIBLE,
    trustLabel: 'connection',
    primaryCharacterId: 'ren',
    revealPerspective: 'Ren sees you as',
    signatureContext: 'a gentle anime romance set at a cherry blossom academy. The signature should capture the emotional quality of the connection built — the specific way the protagonist moved through Ren\'s walls, what they left behind, what they took with them.',
  },
  'edge-of-atlas': {
    steps: EDGE_OF_ATLAS_STEPS,
    characters: EDGE_OF_ATLAS_CHARACTERS,
    bible: EDGE_OF_ATLAS_BIBLE,
    trustLabel: 'courage',
    primaryCharacterId: 'zara',
    revealPerspective: 'Your name in the old maps',
    signatureContext: 'an epic adventure about discovery beyond the edge of the known world. The signature should capture how the protagonist approached the unknown — their method, their spirit, the legacy of what they found and how they found it.',
  },
  'the-inheritance': {
    steps: INHERITANCE_STEPS,
    characters: INHERITANCE_CHARACTERS,
    bible: INHERITANCE_BIBLE,
    trustLabel: 'resolve',
    primaryCharacterId: 'sable',
    revealPerspective: 'The Blackwood legacy sees you as',
    signatureContext: 'a gothic mystery about family secrets and inheritance on the Scottish Highlands. The signature should capture the protagonist\'s relationship with truth — how they handled the weight of buried history, whether they chose mercy or exposure, and what the Blackwood name means because of them.',
  },
  'sky-pirates': {
    steps: SKY_PIRATES_STEPS,
    characters: SKY_PIRATES_CHARACTERS,
    bible: SKY_PIRATES_BIBLE,
    trustLabel: 'loyalty',
    primaryCharacterId: 'wren',
    revealPerspective: 'The crew of the Skyward Drift knows you as',
    signatureContext: 'a steampunk airship adventure about freedom and loyalty above the clouds. The signature should capture how the protagonist earned their place — through boldness or discipline, through trust or silence, and what kind of sky pirate they became.',
  },
  'the-drift': {
    steps: DRIFT_STEPS,
    characters: DRIFT_CHARACTERS,
    bible: DRIFT_BIBLE,
    trustLabel: 'clarity',
    primaryCharacterId: 'aria',
    revealPerspective: 'The signal remembers you as',
    signatureContext: 'a cerebral sci-fi story about consciousness and the unknown at the edge of space. The signature should capture the protagonist\'s relationship with ARIA and the signal — whether they chose to cross the threshold or turn back, and what they understood about the boundary between human and something more.',
  },
  'phantom-protocol': {
    steps: PHANTOM_PROTOCOL_STEPS,
    characters: PHANTOM_PROTOCOL_CHARACTERS,
    bible: PHANTOM_PROTOCOL_BIBLE,
    trustLabel: 'judgment',
    primaryCharacterId: 'kira',
    revealPerspective: 'Your operational assessment reads',
    signatureContext: 'a le Carré-style espionage thriller split between Berlin and Vienna. The signature should capture the protagonist\'s moral compass — who they trusted, how they handled deception, and whether they chose mercy, truth, or something in between.',
  },
  'fae-court': {
    steps: FAE_COURT_STEPS,
    characters: FAE_COURT_CHARACTERS,
    bible: FAE_COURT_BIBLE,
    trustLabel: 'will',
    primaryCharacterId: 'thorne',
    revealPerspective: 'The Unseelie Court remembers you as',
    signatureContext: 'a dark fantasy about bargains and survival in the Unseelie Court. The signature should capture how the protagonist navigated the fae — through honesty or cunning, whether they danced or bargained, and what they gave up to earn their freedom.',
  },
  'midnight-paris': {
    steps: MIDNIGHT_PARIS_STEPS,
    characters: MIDNIGHT_PARIS_CHARACTERS,
    bible: MIDNIGHT_PARIS_BIBLE,
    trustLabel: 'passion',
    primaryCharacterId: 'lucien',
    revealPerspective: 'Paris remembers you as',
    signatureContext: 'a Parisian romance about art, ambition, and impossible choices. The signature should capture the protagonist\'s relationship with creativity and love — whether they chose passion or pragmatism, the underground or the gallery, and what Paris meant to them.',
  },
  'campus-rivals': {
    steps: CAMPUS_RIVALS_STEPS,
    characters: CAMPUS_RIVALS_CHARACTERS,
    bible: CAMPUS_RIVALS_BIBLE,
    trustLabel: 'tension',
    primaryCharacterId: 'alex',
    revealPerspective: 'Alex sees you as',
    signatureContext: 'a college enemies-to-lovers romance about rivalry, vulnerability, and connection. The signature should capture how the protagonist navigated the line between competition and intimacy — whether they fought or softened, and what they discovered beneath the rivalry.',
  },
  'crimson-depths': {
    steps: CRIMSON_DEPTHS_STEPS,
    characters: CRIMSON_DEPTHS_CHARACTERS,
    bible: CRIMSON_DEPTHS_BIBLE,
    trustLabel: 'resolve',
    primaryCharacterId: 'voss',
    revealPerspective: 'The deep remembers you as',
    signatureContext: 'a cosmic horror story set in a deep-sea research station. The signature should capture the protagonist\'s relationship with the unknown — whether they reached toward the abyss or fled from it, and what they understood about the vast, patient thing beneath the ocean floor.',
  },
  'the-whisper-game': {
    steps: WHISPER_GAME_STEPS,
    characters: WHISPER_GAME_CHARACTERS,
    bible: WHISPER_GAME_BIBLE,
    trustLabel: 'nerve',
    primaryCharacterId: 'mira',
    revealPerspective: 'The game classified you as',
    signatureContext: 'a psychological horror story about a viral social game that watches back. The signature should capture the protagonist\'s relationship with surveillance, privacy, and fear — whether they fought the system or played through it, and what freedom cost them.',
  },
  'neon-district': {
    steps: NEON_DISTRICT_STEPS,
    characters: NEON_DISTRICT_CHARACTERS,
    bible: NEON_DISTRICT_BIBLE,
    trustLabel: 'conviction',
    primaryCharacterId: 'ghost',
    revealPerspective: 'Ghost remembers you as',
    signatureContext: 'a cyberpunk mystery about AI personhood and identity in Neo-Tokyo. The signature should capture the protagonist\'s moral stance — how they weighed humanity against machinery, justice against pragmatism, and what they decided a person really is.',
  },
  'rooftop-promise': {
    steps: ROOFTOP_PROMISE_STEPS,
    characters: ROOFTOP_PROMISE_CHARACTERS,
    bible: ROOFTOP_PROMISE_BIBLE,
    trustLabel: 'closeness',
    primaryCharacterId: 'dohyun',
    revealPerspective: 'Dohyun sees you as',
    signatureContext: 'a manhwa romance about a chaebol heir who plays piano in secret on a school rooftop. The signature should capture how the protagonist earned his trust — through honesty or patience, through music or silence, and what the rooftop came to mean for both of them.',
  },
  'fake-dating': {
    steps: FAKE_DATING_STEPS,
    characters: FAKE_DATING_CHARACTERS,
    bible: FAKE_DATING_BIBLE,
    trustLabel: 'chemistry',
    primaryCharacterId: 'hajin',
    revealPerspective: 'Hajin sees you as',
    signatureContext: 'a manhwa rom-com about childhood rivals who fake-date for a summer and forget how to stop. The signature should capture the moment the pretending became real — what broke through the act, what the protagonist means to someone who has known them since they were seven.',
  },
  'cafe-1111': {
    steps: CAFE_1111_STEPS,
    characters: CAFE_1111_CHARACTERS,
    bible: CAFE_1111_BIBLE,
    trustLabel: 'intimacy',
    primaryCharacterId: 'sunwoo',
    revealPerspective: 'Sunwoo sees you as',
    signatureContext: 'a manhwa romance about an artist who has been secretly drawing the protagonist in a late-night café. The signature should capture the quality of being truly seen — through art, through patience, through the quiet ritual of showing up at the same time every night.',
  },
  'idol-next-door': {
    steps: IDOL_NEXT_DOOR_STEPS,
    characters: IDOL_NEXT_DOOR_CHARACTERS,
    bible: IDOL_NEXT_DOOR_BIBLE,
    trustLabel: 'trust',
    primaryCharacterId: 'taehyun',
    revealPerspective: 'Taehyun sees you as',
    signatureContext: 'a manhwa romance about a K-pop idol hiding in the apartment next door. The signature should capture how the protagonist saw through the idol to the person — through thin walls, late-night tutoring, and the courage to keep a secret that mattered.',
  },
}

/** Get story data for a universe, or null for universes that use the default Seoul Transfer system */
export function getStoryData(universeId: string | null): StoryData | null {
  if (!universeId) return null
  return STORY_REGISTRY[universeId] ?? null
}
