export interface Destination {
  id: string
  city: string
  country: string
  countryEmoji: string
  vibeTags: string[]
  heroImage: string
  tripDays: number
  description: string
  locationKnowledge: string
  locked: boolean
}

export const DESTINATIONS: Destination[] = [
  {
    id: 'tokyo',
    city: 'Tokyo',
    country: 'Japan',
    countryEmoji: '🇯🇵',
    vibeTags: ['Neon Streets', 'Ramen Culture', 'Hidden Shrines'],
    heroImage: '/travel/tokyo-hero.jpg',
    tripDays: 5,
    description: 'Neon-lit nights, quiet temples, and the best food on Earth.',
    locked: false,
    locationKnowledge: `TOKYO LOCAL KNOWLEDGE — Use this to ground your recommendations in real places. Be specific, opinionated, and personal — like a friend who lives here.

NEIGHBORHOODS:
- Shibuya: The crossing, Shibuya Sky observation deck, Center-Gai for nightlife. Touristy but the energy is unmatched at night.
- Shinjuku: Golden Gai for tiny bars (most hold 6 people), Omoide Yokocho ("Memory Lane") for yakitori, Kabukicho for late-night chaos.
- Harajuku/Omotesando: Takeshita Street for kawaii culture, Cat Street for vintage shops, Omotesando Hills for architecture.
- Asakusa: Senso-ji temple, Nakamise-dori shopping street, old Tokyo vibes. Best in early morning before crowds.
- Yanaka: Tokyo's best-kept secret. Old neighborhood that survived the war. Yanaka Cemetery is peaceful, not morbid. Yanaka Ginza shopping street for local snacks.
- Shimokitazawa: Indie neighborhood. Vintage clothing, live music venues, tiny cafes. The Williamsburg of Tokyo.
- Akihabara: Electric Town. Anime, manga, retro gaming arcades, maid cafes. Overwhelming in the best way.
- Daikanyama/Nakameguro: Upscale, quiet. T-Site bookstore is stunning. Meguro River is beautiful (iconic during cherry blossom season).

FOOD (be specific with types, not restaurant names — they change):
- Ramen: Tonkotsu (rich pork broth, Shibuya/Shinjuku), tsukemen (dipping noodles), shio (salt-based, lighter). Counter-only shops are usually the best.
- Sushi: Conveyor belt (kaiten) in Shibuya for fun, standing sushi bars near Tsukiji Outer Market for quality.
- Izakaya: Japanese pub food. Order yakitori, edamame, karaage. Go where the salarymen go.
- Street food: Taiyaki (fish-shaped pastry), takoyaki (octopus balls), melon pan, yakiimo (roasted sweet potato in winter).
- Convenience stores: 7-Eleven and Lawson onigiri, egg sandwiches, and oden are legitimately good meals.
- Kissaten: Old-school Japanese coffee shops. Thick toast, hand-dripped coffee, retro interiors. Yanaka and Shimokitazawa have the best ones.

EXPERIENCES:
- TeamLab Borderless (Azabudai Hills) — immersive digital art, book tickets in advance.
- Tsukiji Outer Market — the inner wholesale market moved to Toyosu, but the outer market is still the place for fresh seafood breakfast.
- Meiji Shrine — massive forested shrine in the middle of Harajuku. Serene contrast to the chaos outside.
- Akihabara arcades — rhythm games, crane games, retro floors. SEGA buildings are multi-story playgrounds.
- Yoyogi Park — people-watching, street performers, picnics. Adjacent to Meiji Shrine.
- Tokyo Tower vs. Skytree — Tower has more charm, Skytree has the view. Tower at sunset is special.
- Onsen/Sento — public baths. Oedo Onsen Monogatari in Odaiba for the full experience.

TRANSPORT:
- Suica/Pasmo IC card for everything. Trains stop around midnight — plan for last train or budget for a taxi.
- Yamanote Line loops around all major stations. It's the lifeline.
- Walking is the best way to find things. Tokyo rewards wandering.

VIBE:
- Tokyo is a city of contrasts. Neon chaos next to serene gardens. Ancient temples beside robot restaurants. The magic is in the transitions.
- Locals are reserved but incredibly kind when approached respectfully. A small bow goes a long way.
- Everything is clean, everything runs on time, everything is slightly surreal.`,
  },
  {
    id: 'seoul',
    city: 'Seoul',
    country: 'South Korea',
    countryEmoji: '🇰��',
    vibeTags: ['K-Culture', 'Street Food', 'Night Markets'],
    heroImage: '/travel/seoul-hero.jpg',
    tripDays: 5,
    description: 'K-pop energy, soju nights, and palaces hiding in plain sight.',
    locked: true,
    locationKnowledge: '',
  },
  {
    id: 'paris',
    city: 'Paris',
    country: 'France',
    countryEmoji: '🇫🇷',
    vibeTags: ['Café Culture', 'Art Everywhere', 'Golden Hour'],
    heroImage: '/travel/paris-hero.jpg',
    tripDays: 5,
    description: 'Every corner is a painting. Every meal is a memory.',
    locked: true,
    locationKnowledge: '',
  },
  {
    id: 'new-york',
    city: 'New York',
    country: 'United States',
    countryEmoji: '🇺🇸',
    vibeTags: ['Never Sleeps', 'Pizza & Bagels', 'Concrete Jungle'],
    heroImage: '/travel/new-york-hero.jpg',
    tripDays: 5,
    description: 'Eight million stories, and yours is about to start.',
    locked: true,
    locationKnowledge: '',
  },
]

export function getDestination(id: string): Destination | undefined {
  return DESTINATIONS.find((d) => d.id === id)
}
