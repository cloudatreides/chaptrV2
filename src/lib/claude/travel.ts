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
      "imagePrompt": "anime style, cinematic scene description for AI image generation, include location details and mood, 1-2 sentences",
      "protagonistVisible": true or false (alternate — some scenes show the traveler, some show the location)
    }
  ]
}

Rules:
- Generate exactly 3-4 scenes per day.
- Scenes should flow naturally (morning → afternoon → evening, with logical travel between locations).
- Activities should be specific: "trying tsukemen at a counter-only shop in Shinjuku" not "eating lunch".
- Image prompts should be vivid and cinematic: mention lighting, mood, weather, time of day.
- For protagonistVisible scenes, image prompt should describe a young person experiencing the scene.
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
          imagePrompt: `Anime style, beautiful morning scene in ${destination.city}, warm golden light, cinematic composition`,
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
  signal?: AbortSignal
}): AsyncGenerator<string> {
  const { companionId, companionSliders, companionRemix, destinationId, messages, chatType, sceneContext, tripContext, companionMemories, travelAffinityScore, bio, signal } = params
  const companion = getTravelCompanion(companionId)
  const destination = getDestination(destinationId)
  if (!companion || !destination) throw new Error(`Missing companion or destination`)

  let system = buildTravelSystemPrompt(companion, companionSliders, destination.locationKnowledge, companionRemix)

  if (bio) system += `\nTraveler personality: "${bio}"`

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

  system += `\n\nPLACE TAGS — OPTIONAL:
When you mention a specific, well-known landmark, market, temple, neighborhood, or attraction by name, tag it ONCE inline:
[PLACE:Chatuchak Weekend Market] or [PLACE:Wat Arun] or [PLACE:Shibuya Crossing]
- Only tag real, specific, notable places (not "a cafe" or "the street")
- Only tag the FIRST mention per message, max 1 tag per message
- The tagged place MUST be the exact place your text is currently describing. Do NOT tag a different nearby landmark. If you're describing walking through Higashiyama streets, tag [PLACE:Higashiyama District] not [PLACE:Kiyomizu-dera].
- Place the tag right after the place name in your text
- The system will automatically show a real photo of the tagged place — you do NOT need to mention showing images, photos, or pictures. Never say you "can't show" anything. Just describe the place naturally and add the tag.

AFFINITY — MANDATORY:
After your dialogue, on a NEW line, add exactly one tag: [AFFINITY:+N] or [AFFINITY:-N] where N is 1-5.
+1 to +2: Normal good conversation. +3 to +5: Real connection moment. -1 to -5: Dismissive or rude response.

SUGGESTIONS — MANDATORY:
After the affinity tag, on a NEW line, suggest 3 things the traveler might say next.
Format: [SUGGESTIONS: "reply 1" | "reply 2" | "reply 3"]
- One adventurous, one curious, one personal/reflective
- Keep each under 50 characters
- They should be contextual to what you just said`

  const chatMessages = messages.map((m) => ({
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
}): Promise<{ content: string; suggestions?: string[] }> {
  const { companionId, companionSliders, companionRemix, destinationId, chatType, sceneContext, tripContext, bio } = params
  const companion = getTravelCompanion(companionId)
  const destination = getDestination(destinationId)
  if (!companion || !destination) return { content: '...' }

  if (chatType === 'planning') {
    return { content: getCompanionIntro(companion, destinationId) }
  }

  let system = buildTravelSystemPrompt(companion, companionSliders, destination.locationKnowledge, companionRemix)
  if (bio) system += `\nTraveler personality: "${bio}"`
  if (tripContext) system += `\n\nTRIP SO FAR: ${tripContext}`

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
