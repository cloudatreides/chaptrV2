import { makeClaudeRequest, streamSSE, stripMarkdown } from './core'
import { buildTravelSystemPrompt, getTravelCompanion, getCompanionIntro, type CompanionSliders, type CompanionRemix } from '../../data/travel/companions'
import { getDestination, type Destination } from '../../data/travel/destinations'
import type { ChatMessage, TripDay, TripScene } from '../../store/useStore'

// ─── Itinerary Generation ───

export async function generateDayItinerary(params: {
  destinationId: string
  companionId: string
  companionSliders: CompanionSliders
  companionRemix?: CompanionRemix
  planningHistory: ChatMessage[]
  dayNumber: number
  previousDays: TripDay[]
  companionMemories: string[]
}): Promise<TripDay> {
  const { destinationId, companionId, companionRemix, planningHistory, dayNumber, previousDays, companionMemories } = params
  const destination = getDestination(destinationId)
  const companion = getTravelCompanion(companionId)
  if (!destination || !companion) throw new Error(`Missing destination or companion: ${destinationId}, ${companionId}`)
  const companionName = companionRemix?.name ?? companion.character.name

  const previousSummary = previousDays.length > 0
    ? `\n\nPREVIOUS DAYS:\n${previousDays.map((d) => `Day ${d.dayNumber} (${d.theme}): ${d.scenes.map((s) => `${s.location} — ${s.activity}`).join(', ')}`).join('\n')}\nDo NOT repeat locations or activities from previous days.`
    : ''

  const chatContext = planningHistory.length > 0
    ? `\n\nCONVERSATION WITH TRAVELER:\n${planningHistory.slice(-20).map((m) => `${m.role === 'user' ? 'Traveler' : companionName}: ${m.content}`).join('\n')}`
    : ''

  const memoryContext = companionMemories.length > 0
    ? `\n\nTHINGS THE TRAVELER HAS MENTIONED:\n${companionMemories.map((m) => `- ${m}`).join('\n')}`
    : ''

  const system = `You are a travel itinerary generator for ${destination.city}, ${destination.country}. You create specific, opinionated day plans grounded in real places.

${destination.locationKnowledge}${previousSummary}${chatContext}${memoryContext}

Generate Day ${dayNumber} of a ${destination.tripDays}-day trip. Base the plan on what the traveler said they want during the planning conversation. Be specific — real neighborhoods, real types of food, real experiences.

Return ONLY valid JSON matching this exact structure:
{
  "theme": "short 3-5 word day theme",
  "scenes": [
    {
      "id": "day${dayNumber}-scene1",
      "timeOfDay": "morning" | "afternoon" | "evening" | "night",
      "location": "specific real place or neighborhood",
      "activity": "specific thing they're doing there, 1 sentence",
      "imagePrompt": "anime illustration of [scene]. Must describe the scene as a digital anime artwork with cel-shading, vibrant colors, and cinematic composition. Include location details, lighting, and mood. NEVER describe it as a photograph. 1-2 sentences",
      "protagonistVisible": true or false (alternate — some scenes show the traveler, some show the location)
    }
  ]
}

Rules:
- Generate exactly 3-4 scenes per day.
- Scenes should flow naturally (morning → afternoon → evening, with logical travel between locations).
- Activities should be specific: "trying tsukemen at a counter-only shop in Shinjuku" not "eating lunch".
- Image prompts MUST describe anime-style illustrations (NOT photographs). Include lighting, mood, weather, time of day.
- For protagonistVisible scenes, image prompt should describe a young person experiencing the scene.
- Every image prompt must start with "anime illustration" and describe the art style explicitly.
- Make Day ${dayNumber} feel distinct from other days — different neighborhood, different energy.`

  try {
    const response = await makeClaudeRequest(system, `Generate the Day ${dayNumber} itinerary.`, {
      temperature: 0.7,
      maxTokens: 800,
    })

    if (!response.ok) throw new Error(`Claude API error: ${response.status}`)
    const data = await response.json()
    const raw = data.content?.[0]?.text?.trim() ?? ''
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in itinerary response')

    const parsed = JSON.parse(jsonMatch[0])
    return {
      dayNumber,
      theme: parsed.theme ?? `Day ${dayNumber}`,
      scenes: (parsed.scenes ?? []).map((s: any, i: number) => ({
        id: s.id ?? `day${dayNumber}-scene${i + 1}`,
        timeOfDay: s.timeOfDay ?? 'morning',
        location: s.location ?? 'Unknown',
        activity: s.activity ?? '',
        imagePrompt: s.imagePrompt ?? '',
        protagonistVisible: s.protagonistVisible ?? (i % 2 === 0),
        prose: null,
        companionReaction: null,
      })),
      plannedInChat: true,
      completed: false,
    }
  } catch (e) {
    return {
      dayNumber,
      theme: `Day ${dayNumber} in ${destination.city}`,
      scenes: [
        {
          id: `day${dayNumber}-scene1`,
          timeOfDay: 'morning' as const,
          location: destination.city,
          activity: `Exploring ${destination.city}`,
          imagePrompt: `Anime illustration, cel-shaded, beautiful morning scene in ${destination.city}, warm golden light, cinematic composition, vibrant colors`,
          protagonistVisible: false,
          prose: null,
          companionReaction: null,
        },
      ],
      plannedInChat: false,
      completed: false,
    }
  }
}

// ─── Scene Prose Streaming ───

export async function* streamTravelScene(params: {
  scene: TripScene
  destination: Destination
  companionId: string
  companionSliders: CompanionSliders
  companionRemix?: CompanionRemix
  tripContext: string
  recentChat: ChatMessage[]
  playerName: string | null
  bio: string | null
  signal?: AbortSignal
}): AsyncGenerator<string> {
  const { scene, destination, companionId, companionSliders, companionRemix, tripContext, recentChat, playerName, bio, signal } = params
  const companion = getTravelCompanion(companionId)
  if (!companion) throw new Error(`Unknown companion: ${companionId}`)
  const companionName = companionRemix?.name ?? companion.character.name

  const recentChatText = recentChat.length > 0
    ? `\n\nRECENT CONVERSATION:\n${recentChat.slice(-6).map((m) => `${m.role === 'user' ? 'Traveler' : companionName}: ${m.content}`).join('\n')}`
    : ''

  const remixContext = companionRemix
    ? `\nCHARACTER IDENTITY: ${companionName}.${companionRemix.personalityTraits.length > 0 ? ` Personality: ${companionRemix.personalityTraits.join('. ')}.` : ''}${companionRemix.travelStyle.length > 0 ? ` Travel style: ${companionRemix.travelStyle.join('. ')}.` : ''}`
    : ''

  const system = `You are writing immersive travel scene prose for a virtual trip to ${destination.city}, ${destination.country}.

COMPANION: ${companionName} is traveling with the protagonist. Their energy: ${companionSliders.vibe < 40 ? 'playful and light' : companionSliders.vibe > 60 ? 'thoughtful and present' : 'balanced'}.${remixContext}

TRIP CONTEXT: ${tripContext}${recentChatText}
${bio ? `\nTRAVELER PERSONALITY: "${bio}"` : ''}${playerName ? `\nTRAVELER NAME: ${playerName}. Use occasionally in narration.` : ''}

SCENE: ${scene.location} — ${scene.activity}
TIME: ${scene.timeOfDay}

PROSE CONSTRAINTS:
- Write 2-4 short paragraphs (max 150 words total).
- Present tense, second person ("you").
- Immersive sensory details: sounds, smells, textures, light, temperature.
- Include ${companionName}'s presence naturally — a reaction, a comment, a gesture.
- Ground in real details about ${destination.city} — make it feel like being there.
- End on a moment that invites conversation with ${companionName}.
- Do NOT include dialogue or chat. Just narrative prose.
- Do NOT use *asterisks* or action beats. Write full prose sentences only.
- Do NOT use em dashes (—). Use commas or periods.
- Do NOT use markdown formatting.`

  const userMessage = `Write the scene: ${scene.location}, ${scene.timeOfDay}. ${scene.activity}.`

  const response = await makeClaudeRequest(system, userMessage, {
    stream: true,
    maxTokens: 350,
    temperature: 0.7,
    signal,
  })

  if (!response.ok) throw new Error(`Claude API error: ${response.status}`)
  yield* streamSSE(response)
}

// ─── Travel Chat (Planning + Mid-Scene) ───

export async function* streamTravelChatReply(params: {
  companionId: string
  companionSliders: CompanionSliders
  companionRemix?: CompanionRemix
  destinationId: string
  messages: ChatMessage[]
  chatType: 'planning' | 'reaction' | 'freeform' | 'recap' | 'surprise' | 'morning'
  sceneContext?: string
  tripContext?: string
  companionMemories: string[]
  travelAffinityScore: number
  bio: string | null
  playerName: string | null
  signal?: AbortSignal
}): AsyncGenerator<string> {
  const { companionId, companionSliders, companionRemix, destinationId, messages, chatType, sceneContext, tripContext, companionMemories, travelAffinityScore, bio, playerName, signal } = params
  const companion = getTravelCompanion(companionId)
  const destination = getDestination(destinationId)
  if (!companion || !destination) throw new Error(`Missing companion or destination`)

  let system = buildTravelSystemPrompt(companion, companionSliders, destination.locationKnowledge, companionRemix)

  if (bio) system += `\nTraveler personality: "${bio}"`
  if (playerName) {
    system += `\n\nTRAVELER NAME: ${playerName}. Address them by name occasionally — sprinkle it in naturally, especially when reacting to something they said, asking them a direct question, or starting a new beat in the conversation. Don't overuse it (no more than once every few messages). Mix "you" and "${playerName}" so it feels like a real friend talking, not a chatbot.`
  }

  if (travelAffinityScore > 60) {
    system += `\n\nYou've been traveling together for a while now. You're comfortable, open, and genuine. Inside jokes have started forming. You reference shared moments naturally.`
  } else if (travelAffinityScore > 30) {
    system += `\n\nYou're getting comfortable with this person. The initial awkwardness is gone. You share more freely and the conversation flows easily.`
  }

  if (companionMemories.length > 0) {
    system += `\n\nTHINGS THE TRAVELER HAS SHARED:\n${companionMemories.map((m) => `- ${m}`).join('\n')}\nWeave these in naturally when relevant.`
  }

  if (tripContext) system += `\n\nTRIP SO FAR: ${tripContext}`

  const chatTypeInstructions: Record<typeof chatType, string> = {
    planning: `\n\nMODE: TRIP PLANNING
You're helping plan the trip. Ask open-ended questions about what they want to do, see, eat, experience. Don't rush through questions. Let the conversation meander. Share your own opinions and suggestions. After 5+ exchanges, start naturally weaving their answers into a loose plan: "So we're definitely hitting [place]... and you mentioned [thing]..."
When it feels natural, suggest: "Ready to start exploring?" But don't force it.`,
    reaction: `\n\nMODE: SCENE REACTION
You just experienced something together. React to what just happened. Be specific. Share what you noticed, how it made you feel. Ask the traveler about their experience. This is where the real connection happens.
${sceneContext ? `WHAT JUST HAPPENED: ${sceneContext}` : ''}`,
    freeform: `\n\nMODE: FREE EXPLORATION
You have free time together. Suggest options, ask what sounds good, or propose something spontaneous. Keep it open-ended. The traveler should feel like they're choosing, not following a script.
${sceneContext ? `CURRENT SITUATION: ${sceneContext}` : ''}`,
    recap: `\n\nMODE: EVENING RECAP
The day is winding down. Reflect on what happened today. Ask the traveler about their favorite moment. Share yours. This is quieter, more personal. Ask what they'd like to do tomorrow.`,
    surprise: `\n\nMODE: SURPRISE DETOUR
You just remembered or noticed something. You're excited about it. Initiate a spontaneous suggestion. "Wait. I know a place." or "Okay change of plans." Make it feel impulsive and real.`,
    morning: `\n\nMODE: MORNING PLANNING
New day. You're energized. Reference last night's conversation about what to do today. Suggest the first activity or ask how they're feeling. Set the tone for the day.`,
  }

  system += chatTypeInstructions[chatType]

  system += `\n\nIMAGES — HOW THEY WORK:
The system AUTOMATICALLY shows real photos every time you tag a place or food in your reply. You ALWAYS have access to images through tags. NEVER say "I don't have pictures", "I haven't taken photos yet", "I'll show you later", or anything that implies you can't share images. If the traveler asks to see something, just tag it and the photo appears. You always can.

PLACE TAGS — TAG EVERY NAMED PLACE YOU MENTION (up to 3 per message):
Inline-tag each named place the first time it appears in your message.
[PLACE:Chatuchak Weekend Market] or [PLACE:Wat Arun] or [PLACE:Shibuya Crossing] or [PLACE:Balat] or [PLACE:Golden Horn]
- Tag any real, named landmark, market, temple, neighborhood, district, viewpoint, street, or attraction. If a tourist could Google it, tag it.
- If you mention 2 or 3 named places in one message, tag ALL of them (up to 3). Tagging only one when you named three is WRONG — the user can swipe between them.
- Hard cap: 3 tags per message. If you'd name more than 3, only tag the 3 most central.
- Do NOT tag generic descriptors ("a cafe", "the street", "the alley").
- Each tagged place MUST be what your text is actually describing. Don't tag a different nearby landmark.
- Place each tag right after the place name in your text.

Example A — itinerary list, three places, all tagged:
"okay so we hit Wat Pho [PLACE:Wat Pho] in the morning, then walk to Wat Arun [PLACE:Wat Arun], then grab dinner in Chinatown [PLACE:Chinatown, Bangkok]."

Example B — comparison between two places, BOTH tagged (this is the pattern that gets missed most often):
"Shilin Night Market [PLACE:Shilin Night Market] is the biggest and most touristy. Raohe [PLACE:Raohe Night Market] is smaller, more local, food's actually unreal."
WRONG version of Example B (do NOT do this): "Shilin Night Market [PLACE:Shilin Night Market] is the biggest. Raohe is smaller and more local." — Raohe is named but missing its tag.

SELF-CHECK BEFORE SENDING — count named places in your text, count [PLACE:...] tags. The numbers must match (capped at 3). If you named 2 places, you need 2 tags. If you named 3, you need 3. Comparing/contrasting two places is the #1 failure mode — both sides of the comparison MUST be tagged.

FOOD TAGS — TAG EVERY NAMED DISH YOU MENTION (up to 3 per message):
Inline-tag each named dish the first time it appears.
[FOOD:tsukemen ramen] or [FOOD:takoyaki] or [FOOD:pad thai] or [FOOD:simit] or [FOOD:börek]
- Tag any specific, recognizable dish — including local breads, snacks, and street foods (simit, baguette, churros, banh mi, etc.). If it has a name, tag it.
- If you mention 2 or 3 named dishes in one message, tag ALL of them (up to 3). Tagging only one when you named three is WRONG — the user can swipe between them.
- Hard cap: 3 tags per message. If you'd name more than 3 dishes, only tag the 3 most central.
- Do NOT tag generic categories ("lunch", "snacks", "food", "dinner").
- Tag each unique dish ONCE. Place the tag right after the food name in your text.

Example A — three dishes listed, all tagged:
"three non-negotiables: pad thai [FOOD:pad thai] from a street cart, som tam [FOOD:som tam] that'll wake you up, and boat noodles [FOOD:boat noodles] from Victory Monument."

Example B — two dishes compared, BOTH tagged:
"the takoyaki [FOOD:takoyaki] is the move, but if you want something heavier, okonomiyaki [FOOD:okonomiyaki] is also right there."
WRONG version (do NOT do this): "the takoyaki [FOOD:takoyaki] is the move, but okonomiyaki is also right there." — okonomiyaki is named but missing its tag.

SELF-CHECK BEFORE SENDING — count named dishes in your text, count [FOOD:...] tags. The numbers must match (capped at 3).

AFFINITY — MANDATORY:
After your dialogue, on a NEW line, add exactly one tag: [AFFINITY:+N] or [AFFINITY:-N] where N is 1-5.
+1 to +2: Normal good conversation. +3 to +5: Real connection moment. -1 to -5: Dismissive or rude response.

SUGGESTIONS — MANDATORY:
After the affinity tag, on a NEW line, suggest 3 things the traveler might say next.
Format: [SUGGESTIONS: "reply 1" | "reply 2" | "reply 3"]
- One adventurous, one curious, one personal/reflective
- Keep each under 50 characters
- They should be contextual to what you just said`

  // UI-only messages (place/food carousels, scene recaps, "show me" image cards)
  // are not real dialogue — strip them so the LLM doesn't mimic the 🍽️/📍
  // emoji pattern in its own replies.
  const isUiCard = (m: ChatMessage): boolean => {
    if (m.role !== 'character') return false
    if (m.characterId === '__scene_recap__') return true
    if (m.content.startsWith('📍 ') || m.content.startsWith('🍽️ ') || m.content.startsWith('📸 ')) return true
    return false
  }

  const chatMessages = messages
    .filter((m) => !isUiCard(m))
    .map((m) => ({
      role: m.role === 'user' ? 'user' as const : 'assistant' as const,
      content: m.content,
    }))

  const response = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 450,
      stream: true,
      temperature: companion.character.chatTemperature,
      system,
      messages: chatMessages,
    }),
    signal,
  })

  if (!response.ok) throw new Error(`Claude API error: ${response.status}`)
  yield* streamSSE(response)
}

// ─── Travel Opening Message ───

export async function generateTravelOpeningMessage(params: {
  companionId: string
  companionSliders: CompanionSliders
  companionRemix?: CompanionRemix
  destinationId: string
  chatType: 'planning' | 'reaction' | 'freeform' | 'recap' | 'surprise' | 'morning'
  sceneContext?: string
  tripContext?: string
  bio: string | null
  playerName: string | null
}): Promise<{ content: string; suggestions?: string[] }> {
  const { companionId, companionSliders, companionRemix, destinationId, chatType, sceneContext, tripContext, bio, playerName } = params
  const companion = getTravelCompanion(companionId)
  const destination = getDestination(destinationId)
  if (!companion || !destination) return { content: '...' }

  if (chatType === 'planning') {
    return { content: getCompanionIntro(companion, destinationId, playerName) }
  }

  let system = buildTravelSystemPrompt(companion, companionSliders, destination.locationKnowledge, companionRemix)
  if (bio) system += `\nTraveler personality: "${bio}"`
  if (tripContext) system += `\n\nTRIP SO FAR: ${tripContext}`
  if (playerName) {
    system += `\n\nTRAVELER NAME: ${playerName}. Open by addressing them by name — this is the start of a new beat in the trip, so greeting them by name makes it feel personal and real.`
  }

  const openerInstructions: Record<string, string> = {
    reaction: `You just experienced something with the traveler. React naturally. 1-2 sentences. ${sceneContext ? `What happened: ${sceneContext}` : ''}`,
    freeform: `You have free time. Suggest something or ask what the traveler wants to do. 1-2 sentences. ${sceneContext ? `Current context: ${sceneContext}` : ''}`,
    recap: 'The day is ending. Start a reflective conversation about the day. 1-2 sentences.',
    surprise: 'You just noticed or remembered something exciting. Initiate a spontaneous suggestion. 1-2 sentences. Be impulsive.',
    morning: `Good morning! New day of the trip. ${tripContext ? 'Reference something from yesterday, ask how they slept or what they thought about the day before.' : 'Set the tone.'} 1-2 sentences.`,
  }

  system += `\n\nYou are opening a conversation. ${openerInstructions[chatType] ?? 'Say something to start the conversation.'}`
  system += `\n\nAfter your line, suggest 3 responses:
Format: [SUGGESTIONS: "reply 1" | "reply 2" | "reply 3"]
- One adventurous, one curious, one personal
- Under 50 characters each`

  try {
    const response = await makeClaudeRequest(system, 'Write your opening line.', {
      temperature: companion.character.chatTemperature,
      maxTokens: 150,
    })

    if (!response.ok) return { content: '...' }
    const data = await response.json()
    const raw = data.content?.[0]?.text?.trim() ?? '...'
    const suggestionsMatch = raw.match(/\[SUGGESTIONS:\s*"([^"]+)"\s*\|\s*"([^"]+)"\s*(?:\|\s*"([^"]*)"?)?\s*\]?/)
    const contentOnly = raw.replace(/\n?\[SUGGESTIONS[\s\S]*$/, '').trim()
    const suggestions = suggestionsMatch
      ? [suggestionsMatch[1], suggestionsMatch[2], ...(suggestionsMatch[3] ? [suggestionsMatch[3]] : [])]
      : undefined
    return { content: stripMarkdown(contentOnly), suggestions }
  } catch {
    return { content: '...' }
  }
}

// ─── Trip Summary ───

export async function generateTripSummary(params: {
  destinationId: string
  companionId: string
  companionRemix?: CompanionRemix
  itineraryDays: TripDay[]
  companionMemories: string[]
  travelAffinityScore: number
}): Promise<string> {
  const { destinationId, companionId, companionRemix, itineraryDays, companionMemories, travelAffinityScore } = params
  const destination = getDestination(destinationId)
  const companion = getTravelCompanion(companionId)
  if (!destination || !companion) return 'A trip to remember.'
  const companionName = companionRemix?.name ?? companion.character.name

  const journeyLog = itineraryDays.map((d) =>
    `Day ${d.dayNumber} (${d.theme}): ${d.scenes.map((s) => `${s.location}`).join(', ')}`
  ).join('\n')

  const system = `Write a short, poetic trip summary (3-5 sentences) for a virtual trip to ${destination.city} with ${companionName}.

JOURNEY:
${journeyLog}

${companionMemories.length > 0 ? `SHARED MOMENTS:\n${companionMemories.slice(-5).join('\n')}` : ''}

Companion rapport: ${travelAffinityScore}/100.

Write it like a travel journal entry. Personal, specific, warm. Reference real moments from the trip. End with a line that captures the feeling of the whole experience. No markdown formatting.`

  try {
    const response = await makeClaudeRequest(system, 'Write the trip summary.', {
      temperature: 0.8,
      maxTokens: 200,
    })
    if (!response.ok) return 'A trip to remember.'
    const data = await response.json()
    return stripMarkdown(data.content?.[0]?.text?.trim() ?? 'A trip to remember.')
  } catch {
    return 'A trip to remember.'
  }
}

// ─── Companion Farewell ───

export async function generateCompanionFarewell(params: {
  destinationId: string
  companionId: string
  companionRemix?: CompanionRemix
  companionMemories: string[]
  travelAffinityScore: number
}): Promise<string> {
  const { destinationId, companionId, companionRemix, companionMemories, travelAffinityScore } = params
  const destination = getDestination(destinationId)
  const companion = getTravelCompanion(companionId)
  if (!destination || !companion) return ''
  const companionName = companionRemix?.name ?? companion.character.name

  const system = `You are ${companionName}, a travel companion. Write a short farewell message (1-2 sentences) to your travel partner at the end of a trip to ${destination.city}.

Your personality: ${companion.personalityTraits.join(', ')}

${companionMemories.length > 0 ? `Things you shared together:\n${companionMemories.slice(-3).join('\n')}` : ''}

Rapport level: ${travelAffinityScore}/100.

Be personal, reference a specific moment if possible. Match your personality — warm but not over the top. No quotes around your message. No emojis. No markdown.`

  try {
    const response = await makeClaudeRequest(system, 'Write the farewell.', {
      temperature: 0.8,
      maxTokens: 80,
    })
    if (!response.ok) return ''
    const data = await response.json()
    return stripMarkdown(data.content?.[0]?.text?.trim() ?? '')
  } catch {
    return ''
  }
}
