/**
 * Seed 2 completed trips for demo purposes.
 *
 * Usage: Open the app in browser as nicholas@zentry.com,
 * then paste this entire script into the browser console.
 */

(() => {
  const raw = localStorage.getItem('chaptr-v2-story')
  if (!raw) { console.error('No store found in localStorage'); return }

  const store = JSON.parse(raw)
  const state = store.state

  const charId = state.activeCharacterId
  if (!charId) { console.error('No active character found'); return }

  console.log('Active character:', charId)

  // Trip 1: Tokyo with Kai — completed 5 days
  const tokyoId = `${charId}:tokyo`
  state.travelTrips[tokyoId] = {
    destinationId: 'tokyo',
    companionId: 'kai',
    companionSliders: { chattiness: 80, planningStyle: 20, vibe: 20 },
    currentDay: 5,
    currentSceneIndex: 3,
    phase: 'complete',
    planningChatHistory: [
      { role: 'assistant', content: "Yo I already found three ramen spots within walking distance and a guy at the station told me about a yakitori alley that closes at 2am. What are we hitting first?" },
      { role: 'user', content: "Let's do the yakitori alley tonight and explore Shibuya tomorrow!" },
      { role: 'assistant', content: "Bet! I also heard about a tsukiji market morning tour — we could do that day 2 before hitting Akihabara. Let me map it out real quick." },
      { role: 'user', content: "Perfect, and I want to see Meiji Shrine too" },
      { role: 'assistant', content: "Done. Meiji Shrine morning of day 3, then Harajuku right after since it's walking distance. Day 4 I'm thinking Asakusa and Senso-ji, and day 5 we end with a sunset at Shibuya Sky. Sound good?" },
      { role: 'user', content: "Let's go!" },
    ],
    dayChatHistories: {
      1: [
        { role: 'assistant', content: "The smell from that yakitori stall is insane. I just ordered us both the tsukune — you're gonna love it." },
        { role: 'user', content: "This is amazing, I can't believe we found this place" },
        { role: 'assistant', content: "The owner just told me his family's been running this spot for 40 years. He wants to show us how he prepares the tare sauce!" },
      ],
      2: [
        { role: 'assistant', content: "5am at Tsukiji was SO worth it. That tuna was literally melting. Now Akihabara — you ready for sensory overload?" },
        { role: 'user', content: "My legs are tired but I'm hyped" },
        { role: 'assistant', content: "I found an arcade with a DDR machine from like 2003. We're doing this." },
      ],
      3: [
        { role: 'assistant', content: "Meiji Shrine at dawn hits different. It's so quiet you can hear the gravel under your feet." },
        { role: 'user', content: "This is the most peaceful I've felt all trip" },
        { role: 'assistant', content: "Harajuku is literally 5 minutes away and it's the exact opposite energy. Ready for the whiplash?" },
      ],
      4: [
        { role: 'assistant', content: "Senso-ji at golden hour is giving main character energy. The lanterns just came on." },
        { role: 'user', content: "I got the best photo from the gate" },
      ],
      5: [
        { role: 'assistant', content: "Shibuya Sky sunset. Look at that view. Five days wasn't enough for this city." },
        { role: 'user', content: "Best trip ever honestly" },
        { role: 'assistant', content: "We gotta come back. There's like 50 ramen shops we didn't even try." },
      ],
    },
    itinerary: {
      days: [
        {
          dayNumber: 1,
          theme: 'Night Street Food & Hidden Alleys',
          plannedInChat: true,
          completed: true,
          scenes: [
            { id: 'tokyo-1-1', timeOfDay: 'evening', location: 'Yurakucho Yakitori Alley', activity: 'Eating yakitori at a 40-year-old family stall', imagePrompt: 'smoky yakitori alley under the train tracks in Yurakucho Tokyo, lanterns glowing, skewers on the grill', protagonistVisible: false, prose: null, companionReaction: null },
            { id: 'tokyo-1-2', timeOfDay: 'night', location: 'Shinjuku Golden Gai', activity: 'Bar hopping through tiny bars', imagePrompt: 'narrow neon-lit alley of Golden Gai Shinjuku at night, tiny bars stacked together', protagonistVisible: false, prose: null, companionReaction: null },
          ],
        },
        {
          dayNumber: 2,
          theme: 'Markets & Arcades',
          plannedInChat: true,
          completed: true,
          scenes: [
            { id: 'tokyo-2-1', timeOfDay: 'morning', location: 'Tsukiji Outer Market', activity: 'Fresh tuna and tamagoyaki breakfast', imagePrompt: 'bustling Tsukiji outer market stalls with fresh seafood and crowds in morning light', protagonistVisible: false, prose: null, companionReaction: null },
            { id: 'tokyo-2-2', timeOfDay: 'afternoon', location: 'Akihabara', activity: 'Retro arcade gaming', imagePrompt: 'colorful retro arcade machines in Akihabara game center, neon lights flashing', protagonistVisible: false, prose: null, companionReaction: null },
          ],
        },
        {
          dayNumber: 3,
          theme: 'Sacred & Street Culture',
          plannedInChat: true,
          completed: true,
          scenes: [
            { id: 'tokyo-3-1', timeOfDay: 'morning', location: 'Meiji Shrine', activity: 'Morning walk through the shrine forest', imagePrompt: 'serene torii gate path at Meiji Shrine surrounded by ancient trees, morning mist', protagonistVisible: false, prose: null, companionReaction: null },
            { id: 'tokyo-3-2', timeOfDay: 'afternoon', location: 'Harajuku', activity: 'Takeshita Street and crepe shops', imagePrompt: 'vibrant Takeshita Street in Harajuku with colorful shops and fashion', protagonistVisible: false, prose: null, companionReaction: null },
          ],
        },
        {
          dayNumber: 4,
          theme: 'Historic Tokyo',
          plannedInChat: true,
          completed: true,
          scenes: [
            { id: 'tokyo-4-1', timeOfDay: 'afternoon', location: 'Senso-ji Temple', activity: 'Exploring Asakusa and Nakamise-dori', imagePrompt: 'Senso-ji temple gate with giant red lantern at golden hour, Asakusa Tokyo', protagonistVisible: false, prose: null, companionReaction: null },
            { id: 'tokyo-4-2', timeOfDay: 'evening', location: 'Tokyo Skytree', activity: 'Night view from the observation deck', imagePrompt: 'panoramic Tokyo city lights at night seen from Skytree observation deck', protagonistVisible: false, prose: null, companionReaction: null },
          ],
        },
        {
          dayNumber: 5,
          theme: 'Sunset Farewell',
          plannedInChat: true,
          completed: true,
          scenes: [
            { id: 'tokyo-5-1', timeOfDay: 'afternoon', location: 'Shibuya', activity: 'Shibuya crossing and last-minute shopping', imagePrompt: 'iconic Shibuya crossing from above with crowds crossing in afternoon light', protagonistVisible: false, prose: null, companionReaction: null },
            { id: 'tokyo-5-2', timeOfDay: 'evening', location: 'Shibuya Sky', activity: 'Sunset view from the rooftop', imagePrompt: 'breathtaking sunset over Tokyo skyline from Shibuya Sky rooftop observatory', protagonistVisible: false, prose: null, companionReaction: null },
          ],
        },
      ],
    },
    sceneImages: {},
    travelAffinityScore: 82,
    companionMemories: [
      'Found the 40-year-old yakitori stall together — the owner showed us his secret tare recipe',
      'Played DDR at a retro arcade in Akihabara until our legs gave out',
      'Watched the sunrise through the torii gates at Meiji Shrine in perfect silence',
      'Got lost in Golden Gai and ended up in a bar that seats 4 people',
      'Last sunset at Shibuya Sky — promised to come back',
    ],
    startedAt: Date.now() - (7 * 24 * 60 * 60 * 1000), // ~1 week ago
    totalEngagementMs: 45 * 60 * 1000, // 45 min
    extensions: 0,
  }

  // Trip 2: Seoul with Sora — completed 5 days
  const seoulId = `${charId}:seoul`
  state.travelTrips[seoulId] = {
    destinationId: 'seoul',
    companionId: 'sora',
    companionSliders: { chattiness: 70, planningStyle: 30, vibe: 30 },
    currentDay: 5,
    currentSceneIndex: 2,
    phase: 'complete',
    planningChatHistory: [
      { role: 'assistant', content: "I literally grew up here but I've been making a list of all the places I never actually go to lol. Hongdae street food, Bukchon in the morning, soju in Euljiro... what's calling you?" },
      { role: 'user', content: "I want the full local experience — no tourist traps" },
      { role: 'assistant', content: "Okay PERFECT because I know this pojangmacha in Euljiro that's been there since like the 80s. And there's a vinyl cafe in Mangwon that does the best pour-over. Day 1?" },
      { role: 'user', content: "Yes! And I want to do a palace visit too" },
      { role: 'assistant', content: "Gyeongbokgung morning of day 3 — before the crowds. Then Bukchon hanok village is right there. Day 5 we do Namsan Tower at sunset. Trust me on this one." },
    ],
    dayChatHistories: {
      1: [
        { role: 'assistant', content: "The ajumma at this pojangmacha just gave us extra tteokbokki because she said we 'look like we need feeding.' I love it here." },
        { role: 'user', content: "This is the best tteokbokki I've ever had" },
        { role: 'assistant', content: "Wait until you try the eomuk — fish cake soup on a cold night in Euljiro hits SO different." },
      ],
      2: [
        { role: 'assistant', content: "Okay the vinyl cafe was a good call. They're playing Cigarettes After Sex on actual vinyl right now. The pour-over is perfect." },
        { role: 'user', content: "I could stay here all day" },
      ],
      3: [
        { role: 'assistant', content: "Gyeongbokgung at 9am with nobody here is SURREAL. The changing of the guard ceremony starts in 10 minutes!" },
        { role: 'user', content: "The hanbok photos are going to be incredible" },
        { role: 'assistant', content: "Bukchon next — the light on the hanok rooftops right now is gorgeous. Film camera is READY." },
      ],
      4: [
        { role: 'assistant', content: "Hongdae at night is pure chaos in the best way. Street performers, food stalls, and I just found a photobooth place!" },
        { role: 'user', content: "We need to do the photobooth" },
      ],
      5: [
        { role: 'assistant', content: "Namsan Tower sunset. I've seen it a hundred times but it hits different with someone. The love locks are cheesy but... kind of perfect?" },
        { role: 'user', content: "Perfect way to end the trip" },
        { role: 'assistant', content: "I'm not crying, it's just the wind up here. ...okay maybe a little." },
      ],
    },
    itinerary: {
      days: [
        {
          dayNumber: 1,
          theme: 'Euljiro After Dark',
          plannedInChat: true,
          completed: true,
          scenes: [
            { id: 'seoul-1-1', timeOfDay: 'evening', location: 'Euljiro Pojangmacha', activity: 'Street food and soju at a classic tent bar', imagePrompt: 'warm orange-lit pojangmacha tent bar in Euljiro Seoul at night, steam rising from tteokbokki pots', protagonistVisible: false, prose: null, companionReaction: null },
            { id: 'seoul-1-2', timeOfDay: 'night', location: 'Euljiro Alley Bars', activity: 'Exploring hidden speakeasy bars', imagePrompt: 'narrow industrial alley in Euljiro at night with hidden bar doorways and warm light', protagonistVisible: false, prose: null, companionReaction: null },
          ],
        },
        {
          dayNumber: 2,
          theme: 'Mangwon & Cafe Culture',
          plannedInChat: true,
          completed: true,
          scenes: [
            { id: 'seoul-2-1', timeOfDay: 'morning', location: 'Mangwon Vinyl Cafe', activity: 'Pour-over coffee and vinyl records', imagePrompt: 'cozy Seoul vinyl cafe with record player, pour-over coffee station, warm natural light through windows', protagonistVisible: false, prose: null, companionReaction: null },
            { id: 'seoul-2-2', timeOfDay: 'afternoon', location: 'Mangwon Market', activity: 'Browsing the local market for snacks', imagePrompt: 'colorful Mangwon traditional market in Seoul with food stalls and local shoppers', protagonistVisible: false, prose: null, companionReaction: null },
          ],
        },
        {
          dayNumber: 3,
          theme: 'Palaces & Hanok Villages',
          plannedInChat: true,
          completed: true,
          scenes: [
            { id: 'seoul-3-1', timeOfDay: 'morning', location: 'Gyeongbokgung Palace', activity: 'Guard ceremony and palace grounds', imagePrompt: 'grand Gyeongbokgung Palace gate in Seoul at morning golden hour, traditional Korean architecture', protagonistVisible: false, prose: null, companionReaction: null },
            { id: 'seoul-3-2', timeOfDay: 'afternoon', location: 'Bukchon Hanok Village', activity: 'Walking through traditional hanok streets', imagePrompt: 'traditional hanok rooftops in Bukchon village Seoul with afternoon light casting shadows', protagonistVisible: false, prose: null, companionReaction: null },
          ],
        },
        {
          dayNumber: 4,
          theme: 'Hongdae Nights',
          plannedInChat: true,
          completed: true,
          scenes: [
            { id: 'seoul-4-1', timeOfDay: 'evening', location: 'Hongdae', activity: 'Street performers and food stalls', imagePrompt: 'energetic Hongdae street at night with neon signs, street performers, and crowds of young people', protagonistVisible: false, prose: null, companionReaction: null },
            { id: 'seoul-4-2', timeOfDay: 'night', location: 'Hongdae Photobooth', activity: 'Korean-style photobooth session', imagePrompt: 'cute Korean photobooth strip with fun poses and sticker decorations', protagonistVisible: false, prose: null, companionReaction: null },
          ],
        },
        {
          dayNumber: 5,
          theme: 'Sunset Farewell',
          plannedInChat: true,
          completed: true,
          scenes: [
            { id: 'seoul-5-1', timeOfDay: 'afternoon', location: 'Ikseon-dong', activity: 'Last stroll through the hanok cafe district', imagePrompt: 'charming narrow alley in Ikseon-dong Seoul with renovated hanok cafes and string lights', protagonistVisible: false, prose: null, companionReaction: null },
            { id: 'seoul-5-2', timeOfDay: 'evening', location: 'Namsan Tower', activity: 'Sunset from the observation deck', imagePrompt: 'golden sunset over Seoul skyline seen from Namsan Tower with love locks in foreground', protagonistVisible: false, prose: null, companionReaction: null },
          ],
        },
      ],
    },
    sceneImages: {},
    travelAffinityScore: 78,
    companionMemories: [
      'The pojangmacha ajumma gave us extra food because we "looked like we needed feeding"',
      'Spent an entire afternoon in a vinyl cafe listening to Cigarettes After Sex on actual vinyl',
      'Watched the Gyeongbokgung guard ceremony at dawn with no one else around',
      'Did a Korean photobooth session in Hongdae with all the cheesy stickers',
      'Namsan Tower sunset — Sora said she\'d seen it a hundred times but it hit different this time',
    ],
    startedAt: Date.now() - (3 * 24 * 60 * 60 * 1000), // ~3 days ago
    totalEngagementMs: 38 * 60 * 1000, // 38 min
    extensions: 0,
  }

  // Save back to localStorage
  localStorage.setItem('chaptr-v2-story', JSON.stringify(store))
  console.log('✅ Injected 2 completed trips:', tokyoId, seoulId)
  console.log('Reload the page to see them.')

  // Force Zustand to rehydrate
  window.location.reload()
})()
