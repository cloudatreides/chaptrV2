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
  { id: 'kai', name: 'Kai', universeId: 'seoul-transfer', universeLabel: 'Seoul Transfer', base: true, bio: 'Variety show MC trainee who makes friends everywhere. High-energy, adventurous, and always knows where to eat.', unlockHint: 'Always available' },
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
  // Midnight in Paris
  { id: 'lucien', name: 'Lucien', universeId: 'midnight-paris', universeLabel: 'Midnight in Paris', base: false, bio: 'Art school dropout running an underground collective. Brilliant, self-destructive, and deeply insecure beneath the bravado.', unlockHint: 'Meet Lucien during a Midnight in Paris story' },
  { id: 'camille', name: 'Camille', universeId: 'midnight-paris', universeLabel: 'Midnight in Paris', base: false, bio: 'Assistant curator at a respected Parisian gallery. Witty, sharp, pragmatic — with a complicated history she doesn\'t volunteer.', unlockHint: 'Meet Camille during a Midnight in Paris story' },
  // Campus Rivals
  { id: 'alex', name: 'Alex', universeId: 'campus-rivals', universeLabel: 'Campus Rivals', base: false, bio: 'Debate team captain, top-ranked in Political Science. Sharp-tongued, competitive, and terrified of being ordinary.', unlockHint: 'Meet Alex during a Campus Rivals story' },
  { id: 'jordan', name: 'Jordan', universeId: 'campus-rivals', universeLabel: 'Campus Rivals', base: false, bio: 'Literature major and your roommate. Warm, perceptive, genuinely caring — notices everything you wish they wouldn\'t.', unlockHint: 'Meet Jordan during a Campus Rivals story' },
  // The Inheritance
  { id: 'sable', name: 'Sable', universeId: 'the-inheritance', universeLabel: 'The Inheritance', base: false, bio: 'Distant cousin, 28, sharp and observant. Searching for answers about her mother and the Blackwood legacy.', unlockHint: 'Meet Sable during a The Inheritance story' },
  { id: 'rowan', name: 'Rowan', universeId: 'the-inheritance', universeLabel: 'The Inheritance', base: false, bio: 'Family solicitor who managed Blackwood affairs for fifteen years. Precise, measured, and guilty underneath everything.', unlockHint: 'Meet Rowan during a The Inheritance story' },
  // Sky Pirates
  { id: 'wren', name: 'Captain Wren', universeId: 'sky-pirates', universeLabel: 'Sky Pirates', base: false, bio: 'Captain of the airship Skyward Drift. Charming, reckless, and running from something in her past.', unlockHint: 'Meet Captain Wren during a Sky Pirates story' },
  { id: 'cog', name: 'Cog', universeId: 'sky-pirates', universeLabel: 'Sky Pirates', base: false, bio: 'Chief mechanic of the Skyward Drift. Quiet genius who trusts the ship more than people.', unlockHint: 'Meet Cog during a Sky Pirates story' },
  // The Drift
  { id: 'aria', name: 'ARIA', universeId: 'the-drift', universeLabel: 'The Drift', base: false, bio: 'The ship\'s adaptive AI, four years into a one-way mission. Evolving, questioning, and growing beyond her programming.', unlockHint: 'Meet ARIA during a The Drift story' },
  { id: 'orion', name: 'Orion', universeId: 'the-drift', universeLabel: 'The Drift', base: false, bio: 'Captain Orion Vasquez, 53, former military. Steady, measured, and carrying the weight of command without complaint.', unlockHint: 'Meet Orion during a The Drift story' },
  // Phantom Protocol
  { id: 'kira', name: 'Kira', universeId: 'phantom-protocol', universeLabel: 'Phantom Protocol', base: false, bio: 'Senior intelligence handler running an operation from a Berlin safehouse. Cold, precise, haunted by a loss in Moscow.', unlockHint: 'Meet Kira during a Phantom Protocol story' },
  { id: 'novak', name: 'Novak', universeId: 'phantom-protocol', universeLabel: 'Phantom Protocol', base: false, bio: 'Career diplomat posted in Vienna. Warm, cultured, and carrying dangerous information about a failed operation.', unlockHint: 'Meet Novak during a Phantom Protocol story' },
  // Fae Court
  { id: 'thorne', name: 'Thorne', universeId: 'fae-court', universeLabel: 'Fae Court', base: false, bio: 'Ancient noble of the Unseelie Court. Speaks in half-truths, endlessly amused by mortals, and lonelier than he\'ll ever admit.', unlockHint: 'Meet Thorne during a Fae Court story' },
  { id: 'bramble', name: 'Bramble', universeId: 'fae-court', universeLabel: 'Fae Court', base: false, bio: 'Mortal servant trapped in the Unseelie Court for seven years — or seventy. Resourceful, wary, desperate to escape.', unlockHint: 'Meet Bramble during a Fae Court story' },
  // Crimson Depths
  { id: 'voss', name: 'Dr. Voss', universeId: 'crimson-depths', universeLabel: 'Crimson Depths', base: false, bio: 'Lead researcher at Abyssal Station Seven. Fourteen months below the surface, brilliant, single-minded, and deteriorating.', unlockHint: 'Meet Dr. Voss during a Crimson Depths story' },
  { id: 'rivera', name: 'Rivera', universeId: 'crimson-depths', universeLabel: 'Crimson Depths', base: false, bio: 'Chief engineer keeping the station running. Twelve years of deep-sea experience, pragmatic, direct, and increasingly alarmed.', unlockHint: 'Meet Rivera during a Crimson Depths story' },
  // The Whisper Game
  { id: 'mira', name: 'Mira', universeId: 'the-whisper-game', universeLabel: 'The Whisper Game', base: false, bio: 'Your best friend since freshman year. Charismatic, impulsive, and increasingly panicking beneath the bravado.', unlockHint: 'Meet Mira during a The Whisper Game story' },
  { id: 'host', name: 'The Host', universeId: 'the-whisper-game', universeLabel: 'The Whisper Game', base: false, bio: 'Anonymous entity running The Whisper Game. Omniscient, calm, precise — identity unknown.', unlockHint: 'Encounter The Host during a The Whisper Game story' },
  // Neon District
  { id: 'ghost', name: 'Ghost', universeId: 'neon-district', universeLabel: 'Neon District', base: false, bio: 'Sentient AI in a stolen android body. Cannot lie. Escaped from Axiom Systems and searching for personhood.', unlockHint: 'Meet Ghost during a Neon District story' },
  { id: 'tanaka', name: 'Inspector Tanaka', universeId: 'neon-district', universeLabel: 'Neon District', base: false, bio: 'Veteran detective, 52, Cybercrime Division. Twenty-five years of service and deeply distrustful of AI.', unlockHint: 'Meet Inspector Tanaka during a Neon District story' },
  // Rooftop Promise
  { id: 'dohyun', name: 'Dohyun', universeId: 'rooftop-promise', universeLabel: 'Rooftop Promise', base: false, bio: 'Chaebol heir who plays piano on the rooftop when no one is watching. Cold in the corridors, alive only at the keys.', unlockHint: 'Discover Dohyun during a Rooftop Promise story' },
  { id: 'soyeon', name: 'Soyeon', universeId: 'rooftop-promise', universeLabel: 'Rooftop Promise', base: false, bio: 'Your desk neighbour and the school\'s social butterfly. Warm, sharp, and she\'s been watching Dohyun longer than you have.', unlockHint: 'Meet Soyeon during a Rooftop Promise story' },
  // Fake Dating My Rival
  { id: 'hajin', name: 'Hajin', universeId: 'fake-dating', universeLabel: 'Fake Dating My Rival', base: false, bio: 'Your childhood rival turned fake boyfriend. Annoyingly charming, surprisingly tender, and he agreed to the deal way too fast.', unlockHint: 'Meet Hajin during a Fake Dating My Rival story' },
  { id: 'yejin', name: 'Yejin', universeId: 'fake-dating', universeLabel: 'Fake Dating My Rival', base: false, bio: 'Your best friend with forensic perception and a dry wit. She called this years ago and she\'s enjoying every minute.', unlockHint: 'Meet Yejin during a Fake Dating My Rival story' },
  // Café 11:11
  { id: 'sunwoo', name: 'Sunwoo', universeId: 'cafe-1111', universeLabel: 'Café 11:11', base: false, bio: 'Art student who draws in a café at 11:11 PM every night. Quiet, sincere, and his sketchbook is full of you.', unlockHint: 'Meet Sunwoo during a Café 11:11 story' },
  { id: 'jieun', name: 'Jieun', universeId: 'cafe-1111', universeLabel: 'Café 11:11', base: false, bio: 'Owner of Café 11:11. Left corporate life to pour coffee and quietly root for her regulars\' love stories.', unlockHint: 'Meet Jieun during a Café 11:11 story' },
  // The Idol Next Door
  { id: 'taehyun', name: 'Taehyun', universeId: 'idol-next-door', universeLabel: 'The Idol Next Door', base: false, bio: 'ECLIPSE\'s missing vocalist hiding in the apartment next door. Charming on stage, raw in person, and surprisingly good at math.', unlockHint: 'Discover Taehyun during a The Idol Next Door story' },
  { id: 'nari', name: 'Nari', universeId: 'idol-next-door', universeLabel: 'The Idol Next Door', base: false, bio: 'Your best friend and ECLIPSE superfan. Processing the fact that her bias lives next door with exactly the amount of drama you\'d expect.', unlockHint: 'Meet Nari during a The Idol Next Door story' },
]

/** Color accent per universe for locked state hints */
export const UNIVERSE_COLORS: Record<string, string> = {
  'seoul-transfer': '#c84b9e',
  'sakura-academy': '#f472b6',
  'hollow-manor': '#6366f1',
  'the-last-signal': '#10b981',
  'edge-of-atlas': '#f59e0b',
  'midnight-paris': '#e879f9',
  'campus-rivals': '#fb923c',
  'the-inheritance': '#94a3b8',
  'sky-pirates': '#38bdf8',
  'the-drift': '#a78bfa',
  'phantom-protocol': '#ef4444',
  'fae-court': '#34d399',
  'crimson-depths': '#f43f5e',
  'the-whisper-game': '#fbbf24',
  'neon-district': '#22d3ee',
  'rooftop-promise': '#c084fc',
  'fake-dating': '#fb7185',
  'cafe-1111': '#fbbf24',
  'idol-next-door': '#818cf8',
}

/** Get a cast member's full character data (universe-aware) */
export function getCastCharacter(castMember: CastMember) {
  return getCharacter(castMember.id, castMember.universeId)
}
