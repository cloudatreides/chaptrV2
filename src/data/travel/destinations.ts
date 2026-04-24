export interface Destination {
  id: string
  city: string
  country: string
  countryEmoji: string
  lat: number
  lng: number
  vibeTags: string[]
  heroImage: string
  tripDays: number
  description: string
  highlights: string[]
  locationKnowledge: string
  locked: boolean
}

export const DESTINATIONS: Destination[] = [
  {
    id: 'tokyo',
    city: 'Tokyo',
    country: 'Japan',
    countryEmoji: '🇯🇵',
    lat: 35.6762,
    lng: 139.6503,
    vibeTags: ['Neon Streets', 'Ramen Culture', 'Hidden Shrines'],
    heroImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
    tripDays: 5,
    description: 'Neon-lit nights, quiet temples, and the best food on Earth.',
    highlights: ['Most Michelin-starred city in the world', 'Ancient temples hidden between skyscrapers', '14 million people, yet strangely serene', 'Vending machines on every corner — for everything'],
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
- Yamanote Line loops around all major stations. It is the lifeline.
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
    lat: 37.5665,
    lng: 126.9780,
    vibeTags: ['K-Culture', 'Street Food', 'Night Markets'],
    heroImage: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&q=80',
    tripDays: 5,
    description: 'K-pop energy, soju nights, and palaces hiding in plain sight.',
    highlights: ['The city that never sleeps — cafes open past 2am', '600-year-old palaces next to neon-lit streets', 'Street food capital: tteokbokki, hotteok, fried chicken', 'K-beauty, K-pop, K-everything — culture exports central'],
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
- Bukchon Hanok Village — traditional houses on steep narrow streets. Respect residents (it is a real neighborhood, not a theme park).
- Gwangjang Market — oldest market in Seoul. Bindaetteok (mung bean pancakes), mayak kimbap (addictive mini rolls). Go hungry.
- Han River Parks — rent bikes, order chicken delivery to the park (yes, they deliver to your exact bench), watch the Banpo Bridge fountain show at night.
- Lotte World / Everland — theme parks if that is your thing. Lotte World is indoor, convenient. Everland is better but far.
- Jjimjilbang — Korean spa/sauna. Dragon Hill Spa in Yongsan is the famous one. Egg sauna, sleeping rooms, the works.

TRANSPORT:
- T-money card for everything (subway, bus, convenience stores). Seoul subway is clean, efficient, and well-signed in English.
- Subway runs until ~midnight. Taxis are cheap and safe (Kakao Taxi app is the Korean Uber).
- Walking is great in individual neighborhoods but Seoul is spread out — subway between areas.

VIBE:
- Seoul moves fast. It is a city obsessed with the new — trends cycle in weeks, not months. But ancient palaces sit untouched between skyscrapers.
- K-culture is everywhere and it is genuine, not performative. People take food, fashion, and skincare seriously.
- Nightlife goes late. Really late. 2am is early. Some neighborhoods do not really start until midnight.
- Koreans are warm once you break through initial formality. A few Korean phrases go a long way. "Kamsahamnida" (thank you) opens doors.`,
  },
  {
    id: 'paris',
    city: 'Paris',
    country: 'France',
    countryEmoji: '🇫🇷',
    lat: 48.8566,
    lng: 2.3522,
    vibeTags: ['Café Culture', 'Art Everywhere', 'Golden Hour'],
    heroImage: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80',
    tripDays: 5,
    description: 'Every corner is a painting. Every meal is a memory.',
    highlights: [],
    locked: true,
    locationKnowledge: '',
  },
  {
    id: 'new-york',
    city: 'New York',
    country: 'United States',
    countryEmoji: '🇺🇸',
    lat: 40.7128,
    lng: -74.0060,
    vibeTags: ['Never Sleeps', 'Pizza & Bagels', 'Concrete Jungle'],
    heroImage: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&q=80',
    tripDays: 5,
    description: 'Eight million stories, and yours is about to start.',
    highlights: ['Dollar-slice pizza at 3am hits different', 'Central Park is 843 acres of calm inside the chaos', 'Every neighborhood is its own city — Chinatown to Harlem in one subway ride', 'The Met alone could take a week'],
    locked: false,
    locationKnowledge: '',
  },
  {
    id: 'bangkok',
    city: 'Bangkok',
    country: 'Thailand',
    countryEmoji: '🇹🇭',
    lat: 13.7563,
    lng: 100.5018,
    vibeTags: ['Street Food Capital', 'Temple Hopping', 'Night Bazaars'],
    heroImage: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80',
    tripDays: 5,
    description: 'Chaos, temples, and the best $2 meal of your life.',
    highlights: ['Street food so good it has Michelin stars', '400+ temples — each one more ornate than the last', 'Floating markets, rooftop bars, tuk-tuk chaos', 'Thai massage for less than a coffee back home'],
    locked: false,
    locationKnowledge: `BANGKOK LOCAL KNOWLEDGE — Use this to ground your recommendations in real places.

NEIGHBORHOODS:
- Sukhumvit: Expat hub. BTS accessible. Thonglor (Soi 55) for upscale Thai dining and rooftop bars. Ekkamai for cafes and brunch.
- Khao San Road: Backpacker central. Chaotic, cheap, fun for one night. Pad thai carts, bucket drinks, street performers.
- Chinatown (Yaowarat): Best street food in Bangkok, arguably in the world. Go at night. Seafood, noodles, desserts on every corner.
- Old City (Rattanakosin): Grand Palace, Wat Pho, Wat Arun. The historic core. Go early morning to beat heat and crowds.
- Silom/Sathorn: Business district by day, night market and Patpong by night. Sky bars on rooftops.
- Ari: Hipster neighborhood. Independent coffee shops, vintage stores, Thai-fusion restaurants. Local, not touristy.
- Thonburi: West bank of the river. Quieter, more traditional. Canal boat tours, Wat Arun up close, local markets.

FOOD:
- Pad Thai: Best from street carts, not restaurants. Thipsamai on Mahachai Road is legendary but expect a queue.
- Som Tum: Green papaya salad. Ranges from mild to face-melting spicy. Isaan-style is the authentic version.
- Boat Noodles: Tiny bowls of intensely flavored broth with pork or beef. Victory Monument area or Khlong boats.
- Mango Sticky Rice: The perfect Thai dessert. Available everywhere but peak season is April-June.
- Street food rules: If there is a queue of Thai people, eat there. If the cart only makes one thing, it will be incredible.
- Thai Iced Tea: Sweet, creamy, orange. Available everywhere. Non-negotiable in the heat.

EXPERIENCES:
- Grand Palace + Wat Pho: Do them together, early morning. Wat Pho has the reclining Buddha and best traditional massage school.
- Chatuchak Weekend Market: 15,000+ stalls. Go Saturday morning. Sections for vintage, plants, food, clothes. Overwhelming in the best way.
- Rooftop bars: Sky Bar at Lebua (from The Hangover), Octave at Marriott, Vertigo at Banyan Tree. Dress code applies.
- Canal boat tour: Khlong boats through Thonburi canals. See the old Bangkok that tourism missed.
- Muay Thai: Watch a fight at Lumpinee or Rajadamnern stadium. Or take a beginner class.

TRANSPORT:
- BTS Skytrain and MRT subway cover central Bangkok well. Rabbit card for BTS, separate card for MRT.
- Tuk-tuks: fun but always negotiate the price first. Never accept the first offer.
- Grab (Southeast Asian Uber) works perfectly. Use it for anything the BTS does not cover.
- River boats: Chao Phraya Express boats are cheap and skip traffic entirely.

VIBE:
- Bangkok is sensory overload in the best way. The heat, the smells, the noise, the food — it hits you all at once and you either love it or need a day to adjust.
- Thai people are genuinely warm. A wai (slight bow with hands together) goes a long way.
- The contrast between ancient temples and futuristic malls, street carts and Michelin restaurants, chaos and calm — that is Bangkok.`,
  },
  {
    id: 'london',
    city: 'London',
    country: 'United Kingdom',
    countryEmoji: '🇬🇧',
    lat: 51.5074,
    lng: -0.1278,
    vibeTags: ['Pubs & History', 'West End', 'Markets'],
    heroImage: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80',
    tripDays: 5,
    description: 'Ancient pubs, world-class theatre, and rain you learn to love.',
    highlights: [],
    locked: true,
    locationKnowledge: '',
  },
  {
    id: 'istanbul',
    city: 'Istanbul',
    country: 'Turkey',
    countryEmoji: '🇹🇷',
    lat: 41.0082,
    lng: 28.9784,
    vibeTags: ['East Meets West', 'Spice Markets', 'Rooftop Views'],
    heroImage: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80',
    tripDays: 5,
    description: 'Two continents, one city. Tea, bazaars, and call to prayer at sunset.',
    highlights: ['Hagia Sophia — 1,500 years of history under one dome', 'Grand Bazaar: 4,000 shops in a covered labyrinth', 'Bosphorus ferry at sunset splits Europe and Asia in real time', 'Turkish breakfast spreads that take up the entire table'],
    locked: false,
    locationKnowledge: '',
  },
  {
    id: 'mexico-city',
    city: 'Mexico City',
    country: 'Mexico',
    countryEmoji: '🇲🇽',
    lat: 19.4326,
    lng: -99.1332,
    vibeTags: ['Tacos & Mezcal', 'Murals', 'Vibrant Chaos'],
    heroImage: 'https://images.unsplash.com/photo-1585464231875-d9ef1f5ad396?w=800&q=80',
    tripDays: 5,
    description: 'Colors, flavors, and a creative energy that never stops.',
    highlights: [],
    locked: true,
    locationKnowledge: '',
  },
  {
    id: 'lisbon',
    city: 'Lisbon',
    country: 'Portugal',
    countryEmoji: '🇵🇹',
    lat: 38.7223,
    lng: -9.1393,
    vibeTags: ['Pastel de Nata', 'Tram Rides', 'Fado Nights'],
    heroImage: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80',
    tripDays: 5,
    description: 'Steep hills, warm light, and pastries worth the climb.',
    highlights: ['Tram 28 rattles through the oldest neighborhoods', 'Pastel de nata fresh from the oven — crispy, creamy, perfect', 'Fado music in Alfama bars that seat twelve people', 'Europe\'s sunniest capital, and it\'s still affordable'],
    locked: false,
    locationKnowledge: '',
  },
  {
    id: 'taipei',
    city: 'Taipei',
    country: 'Taiwan',
    countryEmoji: '🇹🇼',
    lat: 25.0330,
    lng: 121.5654,
    vibeTags: ['Night Markets', 'Hot Springs', 'Bubble Tea'],
    heroImage: 'https://images.unsplash.com/photo-1470004914212-05527e49370b?w=800&q=80',
    tripDays: 5,
    description: 'Night markets, mountain trails, and the friendliest city in Asia.',
    highlights: ['12 night markets — Raohe and Shilin are legendary', 'Bubble tea was invented here', 'Hot springs and mountain hikes within city limits', 'One of the safest cities in the world'],
    locked: false,
    locationKnowledge: `TAIPEI LOCAL KNOWLEDGE — Use this to ground your recommendations in real places.

NEIGHBORHOODS:
- Ximending: The Harajuku of Taipei. Pedestrian shopping streets, street performers, bubble tea on every corner. Young, loud, fun.
- Da'an: Residential but full of cafes, bookshops, and Yongkang Street (the food street). Mature, walkable, excellent eating.
- Zhongshan: Art galleries, indie boutiques, Japanese-era architecture. Quieter sophistication.
- Songshan: Raohe Night Market, Ciyou Temple, creative parks in converted tobacco factories. Local vibes.
- Beitou: Hot spring district. Thermal Valley, public and private onsen, mountain trails. 30 minutes from downtown by MRT.
- Jiufen: Mountain town above the coast. Narrow lantern-lit alleys, tea houses, ocean views. Miyazaki vibes. Day trip essential.
- Tamsui: Riverside district at the end of the red MRT line. Sunset views, street food boardwalk, old fort.

FOOD:
- Night markets: Shilin (biggest, most famous), Raohe (best food), Ningxia (locals' favorite). Go hungry.
- Beef noodle soup: Taipei's signature dish. Rich braised broth, hand-pulled noodles, tender beef shank. Every neighborhood has a champion.
- Xiao long bao: Soup dumplings. Din Tai Fung started here but the mom-and-pop shops are just as good.
- Bubble tea: Born in Taiwan. Get it fresh from any tea shop. 50 Lan and CoCo are reliable chains. Adjust sugar and ice levels.
- Gua bao: Taiwanese hamburger. Steamed bun with braised pork belly, pickled greens, peanut powder, cilantro.
- Stinky tofu: Smells terrible, tastes incredible. Fried version at night markets is the gateway. Deep-fried with pickled cabbage.
- Breakfast shops: Local morning shops serve egg crepes (dan bing), soy milk, and youtiao. Cheap, filling, everywhere.

EXPERIENCES:
- Elephant Mountain (Xiangshan): Short hike (20 min) for the best Taipei 101 skyline view. Go for sunset.
- Taipei 101: Was the world's tallest building. Observation deck is worth it on a clear day. The damper ball inside is engineering art.
- Hot springs in Beitou: Public baths are cheap (~$2). Private rooms available. Bring your own towel.
- Jiufen day trip: Take the bus from Zhongxiao Fuxing. Walk the old street, drink tea overlooking the ocean, stay for lantern-lit dusk.
- Maokong Gondola: Cable car up to tea plantations above the city. Tea houses with valley views.

TRANSPORT:
- MRT is fast, clean, cheap. EasyCard works on MRT, buses, convenience stores, and YouBike.
- YouBike: Public bike share. First 30 minutes free with EasyCard. Stations everywhere.
- Taiwan HSR: Bullet train to other cities. Taichung in 1 hour, Tainan in 1.5 hours.

VIBE:
- Taipei is the friendliest city in Asia. People will go out of their way to help you, even with a language barrier.
- It is safe at every hour. Night markets are packed at midnight. Solo travelers love it here.
- The pace is relaxed compared to Tokyo or Seoul. There is a gentleness to daily life that is hard to explain but easy to feel.`,
  },
  {
    id: 'sydney',
    city: 'Sydney',
    country: 'Australia',
    countryEmoji: '🇦🇺',
    lat: -33.8688,
    lng: 151.2093,
    vibeTags: ['Beach Culture', 'Harbour Views', 'Brunch Capital'],
    heroImage: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&q=80',
    tripDays: 5,
    description: 'Sun, surf, and a harbour that never gets old.',
    highlights: [],
    locked: true,
    locationKnowledge: '',
  },
  {
    id: 'marrakech',
    city: 'Marrakech',
    country: 'Morocco',
    countryEmoji: '🇲🇦',
    lat: 31.6295,
    lng: -7.9811,
    vibeTags: ['Souks & Riads', 'Spice Route', 'Desert Gateway'],
    heroImage: '/dest-marrakech.png',
    tripDays: 5,
    description: 'Get lost in the medina. Find yourself over mint tea.',
    highlights: ['Jemaa el-Fnaa — the world\'s wildest town square', 'Riads: hidden palaces behind unmarked doors', 'Gateway to the Sahara Desert', 'Haggling is a sport, and the souks are the arena'],
    locked: false,
    locationKnowledge: `MARRAKECH LOCAL KNOWLEDGE — Use this to ground your recommendations in real places.

NEIGHBORHOODS:
- Medina: The old walled city. A labyrinth of souks, riads, mosques, and street food. You will get lost. That is the point.
- Jemaa el-Fna: The main square. Snake charmers, orange juice stalls, storytellers by day. Food carts, musicians, and chaos by night. The heart of Marrakech.
- Souks: Branching north from Jemaa el-Fna. Each souk specializes: leather, spices, metalwork, carpets, lamps. Haggling is expected and part of the fun.
- Gueliz: The new city. French colonial architecture, modern cafes, art galleries, wine bars. A breather from the medina intensity.
- Kasbah: Southern medina. Saadian Tombs, El Badi Palace ruins, quieter residential streets. Less tourist chaos.
- Mellah: The old Jewish quarter. Spice market, jewelry shops, and the beautiful Bahia Palace nearby.

FOOD:
- Tagine: Slow-cooked stew in a conical clay pot. Lamb with prunes, chicken with preserved lemon, vegetable — all incredible.
- Couscous: Friday is couscous day in Morocco. Fluffy semolina with seven vegetables and tender meat.
- Pastilla: Sweet and savory pie. Pigeon or chicken with almonds, cinnamon, and powdered sugar in flaky pastry. Unique to Morocco.
- Street food: Snail soup (better than it sounds), merguez sausage, msemen (flatbread), freshly squeezed orange juice for 4 dirhams.
- Mint tea: Moroccan hospitality in a glass. Sweet, strong, poured from a height. Accept every cup offered.
- Tanjia: Marrakech-specific slow-cooked meat pot. Traditionally prepared by men for celebrations. Rich and falling apart tender.

EXPERIENCES:
- Jemaa el-Fna at night: The food stalls set up at sunset. Grilled meats, harira soup, pastries. Choose the busy stalls. Watch out for aggressive touts.
- Hammam: Traditional steam bath. Beldi (local) hammams are authentic and cheap. Tourist ones are more comfortable. Both involve vigorous scrubbing.
- Bahia Palace: Stunning tilework, carved cedar ceilings, tranquil gardens. One of the best-preserved palaces.
- Majorelle Garden: Yves Saint Laurent's blue garden. Cactus collection, Berber museum. Book tickets online to skip the queue.
- Day trip to Atlas Mountains or Ourika Valley: 1 hour drive. Berber villages, waterfalls, mountain lunch. Dramatic contrast to the city.

TRANSPORT:
- Walking is the only way in the medina. GPS barely works in the narrow alleys. Learn landmarks instead.
- Petit taxis (beige) for trips within the city. Always insist on the meter or agree on a price first.
- CTM buses or shared grand taxis for day trips. Hiring a driver for Atlas Mountains is worth the cost.

VIBE:
- Marrakech is intense. The medina is loud, fragrant, disorienting, and beautiful. Embrace the sensory overload.
- Haggling is a social ritual, not a confrontation. Start at 30% of the asking price, smile, walk away if needed. The seller will enjoy it too.
- Riads (traditional courtyard houses turned guesthouses) are the way to stay. Step through an unmarked door in a dusty alley into a tiled paradise with a plunge pool.`,
  },
  {
    id: 'buenos-aires',
    city: 'Buenos Aires',
    country: 'Argentina',
    countryEmoji: '🇦🇷',
    lat: -34.6037,
    lng: -58.3816,
    vibeTags: ['Tango', 'Steak & Malbec', 'Late Nights'],
    heroImage: '/dest-buenos-aires.png',
    tripDays: 5,
    description: 'A city that eats at midnight and dances until dawn.',
    highlights: ['Dinner starts at 10pm — and that\'s considered early', 'World-class steak for a fraction of what you\'d pay anywhere else', 'La Boca\'s colorful houses and street tango', 'Malbec by the glass in every corner bodega'],
    locked: false,
    locationKnowledge: '',
  },
  {
    id: 'reykjavik',
    city: 'Reykjavik',
    country: 'Iceland',
    countryEmoji: '🇮🇸',
    lat: 64.1466,
    lng: -21.9426,
    vibeTags: ['Northern Lights', 'Hot Springs', 'Volcanic Landscapes'],
    heroImage: '/dest-reykjavik.png',
    tripDays: 5,
    description: 'Fire and ice. Midnight sun or aurora, depending on when you go.',
    highlights: [],
    locked: true,
    locationKnowledge: '',
  },
  {
    id: 'hanoi',
    city: 'Hanoi',
    country: 'Vietnam',
    countryEmoji: '🇻🇳',
    lat: 21.0278,
    lng: 105.8342,
    vibeTags: ['Egg Coffee', 'Old Quarter', 'Motorbike Madness'],
    heroImage: '/dest-hanoi.png',
    tripDays: 5,
    description: 'Egg coffee, train streets, and a pace that pulls you in.',
    highlights: [],
    locked: true,
    locationKnowledge: '',
  },
  {
    id: 'cape-town',
    city: 'Cape Town',
    country: 'South Africa',
    countryEmoji: '🇿🇦',
    lat: -33.9249,
    lng: 18.4241,
    vibeTags: ['Table Mountain', 'Wine Country', 'Ocean Views'],
    heroImage: '/dest-cape-town.png',
    tripDays: 5,
    description: 'Where mountains meet ocean and every sunset is unreal.',
    highlights: ['Table Mountain cable car — flat-topped peak with views for days', 'World-class wine farms 45 minutes from downtown', 'Penguins on Boulders Beach, just casually', 'Chapman\'s Peak Drive is one of the most scenic roads on Earth'],
    locked: false,
    locationKnowledge: '',
  },
  {
    id: 'porto',
    city: 'Porto',
    country: 'Portugal',
    countryEmoji: '🇵🇹',
    lat: 41.1579,
    lng: -8.6291,
    vibeTags: ['Port Wine', 'Azulejo Tiles', 'River Views'],
    heroImage: '/dest-porto.png',
    tripDays: 5,
    description: 'Lisbon gets the hype. Porto gets the soul.',
    highlights: [],
    locked: true,
    locationKnowledge: '',
  },
  {
    id: 'cartagena',
    city: 'Cartagena',
    country: 'Colombia',
    countryEmoji: '🇨🇴',
    lat: 10.3910,
    lng: -75.5364,
    vibeTags: ['Colonial Color', 'Caribbean Vibes', 'Ceviche'],
    heroImage: '/dest-cartagena.png',
    tripDays: 5,
    description: 'Pastel walls, cumbia beats, and ceviche by the sea.',
    highlights: [],
    locked: true,
    locationKnowledge: '',
  },
  {
    id: 'kyoto',
    city: 'Kyoto',
    country: 'Japan',
    countryEmoji: '🇯🇵',
    lat: 35.0116,
    lng: 135.7681,
    vibeTags: ['Temples', 'Bamboo Groves', 'Kaiseki'],
    heroImage: '/dest-kyoto.png',
    tripDays: 5,
    description: 'Tokyo is the future. Kyoto is the dream.',
    highlights: ['2,000+ temples and shrines across the city', 'Geisha district Gion — Japan\'s most photographed street', 'Bamboo groves that feel like another planet', 'Kaiseki: multi-course dining elevated to art form'],
    locked: false,
    locationKnowledge: `KYOTO LOCAL KNOWLEDGE — Use this to ground your recommendations in real places.

NEIGHBORHOODS:
- Higashiyama: The classic Kyoto walk. Kiyomizu-dera, Ninenzaka and Sannenzaka slopes, stone-paved lanes. Touristy but unavoidable — go at dawn.
- Gion: Geisha district. Hanamikoji-dori is the main street. Evening is when you might spot a maiko. Tea houses, kaiseki restaurants.
- Arashiyama: Bamboo Grove, Togetsukyo Bridge, monkey park. West side of the city. Worth a full day.
- Fushimi: Fushimi Inari shrine — thousands of orange torii gates up a mountain. Start early to beat crowds. The higher you go, the fewer people.
- Nishiki Market: "Kyoto's Kitchen." Narrow covered arcade with pickles, mochi, matcha everything, and street snacks.
- Philosopher's Path: Canal-side walking path between Ginkaku-ji and Nanzen-ji. Cherry blossom season is peak. Small cafes and temples along the way.
- Kita-ku/Kinkaku-ji area: Golden Pavilion. Stunning but always packed. Ryoan-ji rock garden nearby is more contemplative.

FOOD:
- Kaiseki: Kyoto's multi-course haute cuisine. Seasonal, beautiful, expensive. Worth one splurge meal.
- Matcha everything: Uji is the matcha capital, just south of Kyoto. Matcha parfaits, matcha soba, matcha soft serve.
- Yudofu: Hot tofu in dashi broth. Sounds simple, tastes transcendent. Nanzen-ji area is the spot.
- Obanzai: Kyoto home-style cooking. Small dishes, seasonal vegetables, simple flavors. Look for it at lunch.
- Street food at Nishiki: Dango, senbei, tamago on a stick, pickled vegetables.

EXPERIENCES:
- Tea ceremony: Book a small group one, not a tourist factory. Urasenke tradition is most common.
- Kiyomizu-dera at sunrise: The wooden terrace overlooking the city, before the crowds. Worth the early alarm.
- Bamboo Grove at 7am: By 9am it is a theme park. At dawn it is a cathedral.
- Cycling: Kyoto is flat and bike-friendly. Rent one and cover more ground than walking.
- Day trip to Nara: 45 minutes by train. Friendly deer, massive Buddha, ancient temples.

VIBE:
- Kyoto is Tokyo's opposite. Slow, traditional, restrained. The beauty is in the details — a perfectly raked garden, a seasonal wagashi sweet, light through paper screens.
- Temples close early (usually 4-5pm). Plan accordingly. Evenings are for kaiseki, sake bars, and walking empty streets.`,
  },
  {
    id: 'dubrovnik',
    city: 'Dubrovnik',
    country: 'Croatia',
    countryEmoji: '🇭🇷',
    lat: 42.6507,
    lng: 18.0944,
    vibeTags: ['Walled City', 'Adriatic Blue', 'Game of Thrones'],
    heroImage: '/dest-dubrovnik.png',
    tripDays: 5,
    description: 'Stone walls, impossible blue water, and orange rooftops for miles.',
    highlights: ['Walk the city walls — 2km loop with Adriatic views the entire way', 'Cliff bars carved into the rock face above the sea', 'Lokrum Island is a 15-minute ferry to a car-free paradise', 'The Old Town limestone streets glow golden at sunset'],
    locked: false,
    locationKnowledge: '',
  },
  {
    id: 'luang-prabang',
    city: 'Luang Prabang',
    country: 'Laos',
    countryEmoji: '🇱🇦',
    lat: 19.8840,
    lng: 102.1347,
    vibeTags: ['Monks at Dawn', 'Mekong River', 'Waterfalls'],
    heroImage: '/dest-luang-prabang.png',
    tripDays: 5,
    description: 'Wake up to monks collecting alms. Slow down to Mekong speed.',
    highlights: [],
    locked: true,
    locationKnowledge: '',
  },
  {
    id: 'medellin',
    city: 'Medellin',
    country: 'Colombia',
    countryEmoji: '🇨🇴',
    lat: 6.2476,
    lng: -75.5658,
    vibeTags: ['Eternal Spring', 'Street Art', 'Reinvention'],
    heroImage: '/dest-medellin.png',
    tripDays: 5,
    description: 'The city of eternal spring, reinvented from the ground up.',
    highlights: ['75°F year-round — perfect weather, every single day', 'Comuna 13: from most dangerous to open-air art gallery', 'Paragliding over the valley for $30', 'Coffee country is a day trip away'],
    locked: false,
    locationKnowledge: `MEDELLIN LOCAL KNOWLEDGE — Use this to ground your recommendations in real places.

NEIGHBORHOODS:
- El Poblado: Where most visitors stay. Parque Lleras is the nightlife center. Provenza street for trendy restaurants and cafes. Safe, walkable, but can feel like a bubble.
- Laureles/Estadio: More local, more affordable. La 70 is the main strip — bars, restaurants, arepas. Where Paisas actually hang out.
- Comuna 13: Former most dangerous neighborhood, now an open-air art gallery. Graffiti tours, escalators up the hillside, hip-hop culture. Must-visit.
- Centro: Gritty, real, overwhelming. Botero Plaza with his massive sculptures. Avoid at night but fascinating during the day.
- Envigado: Southern suburb. Local food scene, less touristy. Good for authentic bandeja paisa.
- Santa Elena: Mountain village above the city. Silleteros flower farms, hiking, cool mountain air.

FOOD:
- Bandeja Paisa: The national plate. Beans, rice, chicharron, avocado, egg, plantain, arepa, ground beef, chorizo. One plate, 2000 calories, zero regrets.
- Arepas: Corn cakes everywhere. Arepa de choclo (sweet corn) with cheese is the Medellin specialty.
- Empanadas: Fried, filled with potato and meat. Street corners everywhere, 1000-2000 pesos each.
- Mondongo: Tripe soup. Sounds scary, tastes incredible. A Paisa comfort food classic.
- Coffee: Colombia's coffee region (Eje Cafetero) is a day trip away. In the city, specialty coffee shops are everywhere in Poblado and Laureles.
- Aguardiente: Anise-flavored spirit. The national drink. Shared in shots at any celebration.

EXPERIENCES:
- Comuna 13 graffiti tour: Book with a local guide. The history is as powerful as the art.
- Guatape day trip: 2 hours east. Climb La Piedra del Penol (740 steps) for one of Colombia's best views. Colorful lakeside town below.
- Paragliding in San Felix: Tandem flights over the Aburra Valley. ~$30-50 USD. Surreal.
- Metro cable cars: Part of the public transit. Ride Line K or J for panoramic valley views. Cheap and amazing.
- Parque Arvi: Nature reserve accessible by cable car. Hiking, markets, fresh mountain air above the city.

VIBE:
- Medellin is warm in every sense. The weather is 75F year-round ("City of Eternal Spring") and the people match it. Paisas are famously friendly.
- The city's transformation story is real and ongoing. You will feel the pride everywhere.
- Nightlife is serious. Pre-game starts at 10pm, clubs open at midnight, close at 4am. Reggaeton and crossover dominate.`,
  },
  {
    id: 'chiang-mai',
    city: 'Chiang Mai',
    country: 'Thailand',
    countryEmoji: '🇹🇭',
    lat: 18.7883,
    lng: 98.9853,
    vibeTags: ['Temples', 'Night Bazaar', 'Mountain Air'],
    heroImage: '/dest-chiang-mai.png',
    tripDays: 5,
    description: '300 temples, one night bazaar, and a slower way to be.',
    highlights: [],
    locked: true,
    locationKnowledge: '',
  },
  {
    id: 'tbilisi',
    city: 'Tbilisi',
    country: 'Georgia',
    countryEmoji: '🇬🇪',
    lat: 41.7151,
    lng: 44.8271,
    vibeTags: ['Natural Wine', 'Sulfur Baths', 'Hidden Gem'],
    heroImage: '/dest-tbilisi.png',
    tripDays: 5,
    description: 'Europe\'s best-kept secret. Natural wine, cheese bread, and zero pretension.',
    highlights: [],
    locked: true,
    locationKnowledge: '',
  },
  {
    id: 'oaxaca',
    city: 'Oaxaca',
    country: 'Mexico',
    countryEmoji: '🇲🇽',
    lat: 17.0732,
    lng: -96.7266,
    vibeTags: ['Mezcal', 'Mole', 'Artisan Culture'],
    heroImage: '/dest-oaxaca.png',
    tripDays: 5,
    description: 'Where mezcal was born and every meal is a ceremony.',
    highlights: [],
    locked: true,
    locationKnowledge: '',
  },
  {
    id: 'jaipur',
    city: 'Jaipur',
    country: 'India',
    countryEmoji: '🇮🇳',
    lat: 26.9124,
    lng: 75.7873,
    vibeTags: ['Pink City', 'Palaces', 'Sensory Overload'],
    heroImage: '/dest-jaipur.png',
    tripDays: 5,
    description: 'Pink palaces, elephant rides, and sensory overload in the best way.',
    highlights: [],
    locked: true,
    locationKnowledge: '',
  },
  {
    id: 'valletta',
    city: 'Valletta',
    country: 'Malta',
    countryEmoji: '🇲🇹',
    lat: 35.8989,
    lng: 14.5146,
    vibeTags: ['Knights', 'Baroque', 'Mediterranean Blue'],
    heroImage: '/dest-valletta.png',
    tripDays: 5,
    description: 'A tiny capital built by knights, surrounded by the bluest sea.',
    highlights: [],
    locked: true,
    locationKnowledge: '',
  },
  {
    id: 'cairo',
    city: 'Cairo',
    country: 'Egypt',
    countryEmoji: '🇪🇬',
    lat: 30.0444,
    lng: 31.2357,
    vibeTags: ['Pyramids', 'Nile Nights', 'Ancient Wonders'],
    heroImage: '/dest-cairo.png',
    tripDays: 5,
    description: 'Pyramids at sunset. Shisha by the Nile. 5,000 years of stories.',
    highlights: [],
    locked: true,
    locationKnowledge: '',
  },
  {
    id: 'zanzibar',
    city: 'Zanzibar',
    country: 'Tanzania',
    countryEmoji: '🇹🇿',
    lat: -6.1659,
    lng: 39.2026,
    vibeTags: ['Spice Island', 'Dhow Boats', 'Crystal Water'],
    heroImage: '/dest-zanzibar.png',
    tripDays: 5,
    description: 'Spice-scented alleys, dhow boats, and water so clear it hurts.',
    highlights: [],
    locked: true,
    locationKnowledge: '',
  },
  {
    id: 'sarajevo',
    city: 'Sarajevo',
    country: 'Bosnia and Herzegovina',
    countryEmoji: '🇧🇦',
    lat: 43.8563,
    lng: 18.4131,
    vibeTags: ['Ottoman Meets Habsburg', 'Coffee Culture', 'Resilience'],
    heroImage: '/dest-sarajevo.png',
    tripDays: 5,
    description: 'Where Ottoman coffee meets Austro-Hungarian pastries on the same street.',
    highlights: [],
    locked: true,
    locationKnowledge: '',
  },
]

export function getDestination(id: string): Destination | undefined {
  return DESTINATIONS.find((d) => d.id === id)
}
