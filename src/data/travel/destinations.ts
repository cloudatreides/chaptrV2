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
    heroImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
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
    countryEmoji: '🇰🇷',
    vibeTags: ['K-Culture', 'Street Food', 'Night Markets'],
    heroImage: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&q=80',
    tripDays: 5,
    description: 'K-pop energy, soju nights, and palaces hiding in plain sight.',
    locked: false,
    locationKnowledge: `SEOUL LOCAL KNOWLEDGE — Use this to ground your recommendations in real places. Be specific, opinionated, and personal — like a friend who lives here.

NEIGHBORHOODS:
- Gangnam: Glossy, upscale. COEX Mall underground, Bongeunsa Temple for contrast. Good coffee shops everywhere.
- Hongdae: University district. Street performers, indie shops, clubs, live music. The creative heart of Seoul. Best nightlife for non-Koreans.
- Itaewon: International district. Diverse food scene, rooftop bars, Yongsan Park nearby. More relaxed vibe.
- Myeongdong: Shopping central. K-beauty flagship stores, street food stalls everywhere. Touristy but the food is legit.
- Bukchon/Samcheong-dong: Traditional hanok villages between two palaces. Narrow alleys, tea houses, galleries. Best in early morning.
- Ikseon-dong: Tiny hanok alley turned hipster cafe district. Instagram-famous but genuinely charming. Go on weekdays.
- Euljiro: Old industrial district going through a revival. Hidden bars behind printing shops, retro vibes, the "Brooklyn of Seoul."
- Jongno: Historic center. Gwangjang Market, Cheonggyecheon Stream, Insadong for traditional crafts.

FOOD (be specific with types, not restaurant names):
- Korean BBQ: Samgyeopsal (pork belly) is the classic. Cook it yourself at table grills. Pair with soju and lettuce wraps.
- Street food: Tteokbokki (spicy rice cakes), hotteok (sweet pancakes), odeng (fish cake skewers), mandu (dumplings). Myeongdong and Gwangjang Market are the spots.
- Fried chicken: Korean fried chicken is its own category. Yangnyeom (sweet-spicy glazed) or plain crispy. Always with beer (chimaek culture).
- Jjigae/Stew: Kimchi jjigae, sundubu-jjigae (soft tofu), budae-jjigae (army stew with ramyeon). Comfort food, especially in winter.
- Bibimbap: Mixed rice bowl. Jeonju-style is the gold standard but good everywhere.
- Convenience stores: CU and GS25 have surprisingly good triangle kimbap, instant ramyeon stations, and snacks. Banana milk is a must.
- Cafe culture: Seoul has more cafes per capita than almost anywhere. Multi-story themed cafes, rooftop cafes, hanok cafes. Coffee quality is high.

EXPERIENCES:
- Gyeongbokgung Palace — rent a hanbok (traditional dress) for free entry and great photos. Go for the guard-changing ceremony.
- N Seoul Tower — take the cable car up Namsan Mountain. Lock wall is touristy but the sunset view is real.
- Bukchon Hanok Village — traditional houses on steep narrow streets. Respect residents (it's a real neighborhood, not a theme park).
- Gwangjang Market — oldest market in Seoul. Bindaetteok (mung bean pancakes), mayak kimbap (addictive mini rolls). Go hungry.
- Han River Parks — rent bikes, order chicken delivery to the park (yes, they deliver to your exact bench), watch the Banpo Bridge fountain show at night.
- Lotte World / Everland — theme parks if that's your thing. Lotte World is indoor, convenient. Everland is better but far.
- Jjimjilbang — Korean spa/sauna. Dragon Hill Spa in Yongsan is the famous one. Egg sauna, sleeping rooms, the works.

TRANSPORT:
- T-money card for everything (subway, bus, convenience stores). Seoul subway is clean, efficient, and well-signed in English.
- Subway runs until ~midnight. Taxis are cheap and safe (Kakao Taxi app is the Korean Uber).
- Walking is great in individual neighborhoods but Seoul is spread out — subway between areas.

VIBE:
- Seoul moves fast. It's a city obsessed with the new — trends cycle in weeks, not months. But ancient palaces sit untouched between skyscrapers.
- K-culture is everywhere and it's genuine, not performative. People take food, fashion, and skincare seriously.
- Nightlife goes late. Really late. 2am is early. Some neighborhoods don't really start until midnight.
- Koreans are warm once you break through initial formality. A few Korean phrases go a long way. "Kamsahamnida" (thank you) opens doors.`,
  },
  {
    id: 'paris',
    city: 'Paris',
    country: 'France',
    countryEmoji: '🇫🇷',
    vibeTags: ['Café Culture', 'Art Everywhere', 'Golden Hour'],
    heroImage: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80',
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
    heroImage: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&q=80',
    tripDays: 5,
    description: 'Eight million stories, and yours is about to start.',
    locked: true,
    locationKnowledge: '',
  },
]

export function getDestination(id: string): Destination | undefined {
  return DESTINATIONS.find((d) => d.id === id)
}
