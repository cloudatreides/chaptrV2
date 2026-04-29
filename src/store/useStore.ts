import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CompanionRemix, CompanionSliders } from '../data/travel/companions'

// ─── Types ───

export interface ChatMessage {
  role: 'user' | 'character'
  content: string
  characterId: string
  timestamp: number
  imageUrl?: string
}

export interface CharacterState {
  junhoTrust: number
}

export interface PlaythroughRecord {
  universeId: string
  characterId: string // player character ID
  choices: { label: string; description: string }[]
  signature: string | null
  completedAt: number
  trustScore: number
}

export interface CastChatMessage {
  role: 'user' | 'character'
  content: string
  timestamp: number
  characterId?: string // used in group chat to identify speaker
  reactionImageUrl?: string // AI-generated reaction portrait from romantic actions
}

export interface StoryMoment {
  id: string
  imageUrl: string
  characterIds: string[]
  universeId: string
  beatLabel: string
  note: string
  timestamp: number
}

export interface AmbientPing {
  id: string
  characterId: string
  universeId: string
  message: string
  timestamp: number
  read: boolean
  replies: ChatMessage[]
}

export interface PlayerCharacter {
  id: string
  name: string
  gender: 'male' | 'female'
  selfieUrl: string | null
  bio: string | null
  createdAt: number
}

// ─── Travel Types ───

export interface TripScene {
  id: string
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
  location: string
  activity: string
  imagePrompt: string
  protagonistVisible: boolean
  prose: string | null
  companionReaction: string | null
}

export interface TripDay {
  dayNumber: number
  theme: string
  scenes: TripScene[]
  plannedInChat: boolean
  completed: boolean
}

export interface TripItinerary {
  days: TripDay[]
}

export interface TripProgress {
  destinationId: string
  companionId: string
  companionSliders: { chattiness: number; planningStyle: number; vibe: number }
  companionRemix?: { name: string; imageUrl?: string; personalityTraits: string[]; travelStyle: string[] }
  currentDay: number
  currentSceneIndex: number
  phase: 'planning' | 'day' | 'recap' | 'complete'
  planningChatHistory: ChatMessage[]
  dayChatHistories: Record<number, ChatMessage[]>
  itinerary: TripItinerary
  sceneImages: Record<string, string>
  travelAffinityScore: number
  companionMemories: string[]
  startedAt: number
  totalEngagementMs: number
  extensions?: number
  departureImageUrl?: string
}

export interface CustomCompanion {
  id: string
  baseId: string
  remix: CompanionRemix
  sliders: CompanionSliders
}

export const DEFAULT_TRIP_PROGRESS: Omit<TripProgress, 'destinationId' | 'companionId' | 'companionSliders'> = {
  currentDay: 1,
  currentSceneIndex: 0,
  phase: 'planning',
  planningChatHistory: [],
  dayChatHistories: {},
  itinerary: { days: [] },
  sceneImages: {},
  travelAffinityScore: 0,
  companionMemories: [],
  startedAt: Date.now(),
  totalEngagementMs: 0,
}

export interface StoryProgress {
  currentStepIndex: number
  currentChapter: number
  branchChoices: Record<string, string>
  chatHistory: ChatMessage[]
  chatSummaries: Record<string, string>
  choiceDescriptions: { label: string; description: string; sceneHint?: string }[]
  characterState: CharacterState
  trustStatusLabel: string
  revealSignature: string | null
  sceneImages: Record<string, string>
  characterPortraits: Record<string, string>
  characterAffinities: Record<string, number>
  seenPings: string[]
  questProgress: Record<string, { currentStep: number; completed: boolean; summary: string | null }>
  notifiedQuests: string[] // quests whose unlock has been shown
  characterMemories: Record<string, string[]> // characterId → memorable facts (max 10 per char)
}

export const DEFAULT_PROGRESS: StoryProgress = {
  currentStepIndex: 0,
  currentChapter: 1,
  branchChoices: {},
  chatHistory: [],
  chatSummaries: {},
  choiceDescriptions: [],
  characterState: { junhoTrust: 50 },
  trustStatusLabel: 'strangers',
  revealSignature: null,
  sceneImages: {},
  characterPortraits: {},
  characterAffinities: {},
  seenPings: [],
  questProgress: {},
  notifiedQuests: [],
  characterMemories: {},
}

function freshProgress(): StoryProgress {
  return JSON.parse(JSON.stringify(DEFAULT_PROGRESS))
}

// ─── Store interface ───

interface StoreState {
  // ── Player characters (max 3) ──
  characters: PlayerCharacter[]
  activeCharacterId: string | null
  createCharacter: (char: Omit<PlayerCharacter, 'id' | 'createdAt'>) => string
  deleteCharacter: (id: string) => void
  setActiveCharacter: (id: string) => void
  setDefaultCharacter: (id: string) => void
  updateCharacter: (id: string, updates: Partial<Pick<PlayerCharacter, 'name' | 'gender' | 'selfieUrl' | 'bio'>>) => void

  // ── Universe ──
  selectedUniverse: string | null
  setSelectedUniverse: (id: string) => void

  // ── Story progress (keyed by characterId:universeId) ──
  storyProgress: Record<string, StoryProgress>

  // ── Progress actions (operate on active character+universe slot) ──
  setCurrentStepIndex: (i: number) => void
  advanceStep: () => void
  setCurrentChapter: (chapter: number) => void
  advanceChapter: () => void
  setBranchChoice: (choicePointId: string, optionId: string) => void
  addChatMessage: (msg: ChatMessage) => void
  setChatSummary: (stepId: string, summary: string) => void
  getSummariesList: () => string[]
  addChoiceDescription: (desc: { label: string; description: string; sceneHint?: string }) => void
  updateTrust: (delta: number) => void
  setTrustStatusLabel: (label: string) => void
  setRevealSignature: (sig: string) => void
  setSceneImage: (stepId: string, url: string) => void
  setCharacterPortrait: (characterId: string, url: string) => void
  updateAffinity: (characterId: string, delta: number) => void
  markPingSeen: (pingId: string) => void
  advanceQuest: (questId: string) => void
  completeQuest: (questId: string, summary: string) => void
  markQuestNotified: (questId: string) => void
  addCharacterMemory: (characterId: string, memory: string) => void

  // ── Global affinity (persists across playthroughs) ──
  globalAffinities: Record<string, number>
  updateGlobalAffinity: (characterId: string, newScore: number) => void

  // ── Playthrough history (cross-playthrough memory) ──
  playthroughHistory: PlaythroughRecord[]
  addPlaythroughRecord: (record: PlaythroughRecord) => void

  // ── Ambient pings (outside-story character messages) ──
  ambientPings: AmbientPing[]
  lastSessionTimestamp: number
  addAmbientPing: (ping: AmbientPing) => void
  markAmbientPingRead: (pingId: string) => void
  addAmbientPingReply: (pingId: string, msg: ChatMessage) => void
  dismissAmbientPing: (pingId: string) => void
  updateLastSessionTimestamp: () => void

  // ── Cast chat (persistent NPC threads) ──
  castChatThreads: Record<string, CastChatMessage[]>
  unlockedCastIds: string[]
  addCastChatMessage: (characterId: string, msg: CastChatMessage) => void
  unlockCastCharacter: (characterId: string) => void

  // ── Group cast chat (persistent group threads, keyed by sorted charIds joined with +) ──
  groupCastThreads: Record<string, CastChatMessage[]>
  addGroupCastMessage: (groupKey: string, msg: CastChatMessage) => void

  // ── Favorites (quick access in sidebar) ──
  favoriteCastIds: string[] // can be cast IDs ("sora") or group keys ("sora+jiwon")
  toggleFavoriteCast: (id: string) => void

  // ── Story Moments (album) ──
  storyMoments: StoryMoment[]
  addStoryMoment: (moment: StoryMoment) => void
  updateMomentNote: (momentId: string, note: string) => void
  deleteStoryMoment: (momentId: string) => void

  // ── Chat Actions ──
  actionCooldowns: Record<string, Record<string, number>> // characterId → actionId → timestamp
  setActionCooldown: (characterId: string, actionId: string) => void
  isActionOnCooldown: (characterId: string, actionId: string) => boolean

  // ── Gems ──
  gemBalance: number
  masterMode: boolean
  setMasterMode: (v: boolean) => void
  spendGems: (amount: number) => boolean

  // ── Travel ──
  travelTrips: Record<string, TripProgress>
  activeTripId: string | null
  setActiveTripId: (id: string) => void
  startTrip: (destinationId: string, companionId: string, sliders: { chattiness: number; planningStyle: number; vibe: number }, remix?: { name: string; imageUrl?: string; personalityTraits: string[]; travelStyle: string[] }) => void
  addTravelPlanningMessage: (msg: ChatMessage) => void
  addTravelDayChatMessage: (day: number, msg: ChatMessage) => void
  updateTripItinerary: (day: TripDay) => void
  setTripScene: (sceneId: string, updates: Partial<TripScene>) => void
  setTripSceneImage: (sceneId: string, url: string) => void
  advanceTravelScene: () => void
  advanceTravelDay: () => void
  setTripPhase: (phase: TripProgress['phase']) => void
  updateCompanionSliders: (sliders: { chattiness: number; planningStyle: number; vibe: number }) => void
  updateTravelAffinity: (delta: number) => void
  addCompanionMemory: (memory: string) => void
  addTravelEngagementTime: (ms: number) => void
  setDepartureImage: (url: string) => void
  completeTrip: () => void
  extendTrip: () => void
  resetTrip: () => void
  deleteTrip: (tripId: string) => void

  // ── Custom (remixed) companions ──
  customCompanions: CustomCompanion[]
  addCustomCompanion: (companion: CustomCompanion) => void
  updateCustomCompanion: (id: string, remix: CompanionRemix) => void
  deleteCustomCompanion: (id: string) => void

  // ── City votes (demand signal for locked destinations) ──
  cityVotes: string[]
  voteCityRequest: (cityId: string) => void

  // ── Streaming state (ephemeral, not per-character) ──
  isStreaming: boolean
  setIsStreaming: (v: boolean) => void
  isGeneratingScene: boolean
  setIsGeneratingScene: (v: boolean) => void

  // ── Reset ──
  resetStory: () => void

  // ── Legacy compat ──
  currentChapter: number
  currentBeat: number
  choices: { chapter: number; chapterTitle: string; text: string }[]
}

// ─── Progress key helper ───

function progressKey(characterId: string | null, universeId: string | null): string | null {
  if (!characterId || !universeId) return null
  return `${characterId}:${universeId}`
}

function getProgress(state: { storyProgress: Record<string, StoryProgress>; activeCharacterId: string | null; selectedUniverse: string | null }): StoryProgress {
  const key = progressKey(state.activeCharacterId, state.selectedUniverse)
  if (!key) return DEFAULT_PROGRESS
  return state.storyProgress[key] ?? DEFAULT_PROGRESS
}

function updateProgress(
  state: { storyProgress: Record<string, StoryProgress>; activeCharacterId: string | null; selectedUniverse: string | null },
  updater: (p: StoryProgress) => Partial<StoryProgress>,
): { storyProgress: Record<string, StoryProgress> } {
  const key = progressKey(state.activeCharacterId, state.selectedUniverse)
  if (!key) return { storyProgress: state.storyProgress }
  const current = state.storyProgress[key] ?? freshProgress()
  const updates = updater(current)
  return {
    storyProgress: {
      ...state.storyProgress,
      [key]: { ...current, ...updates },
    },
  }
}

// ─── Store ───

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // ── Player characters ──
      characters: [],
      activeCharacterId: null,

      createCharacter: (char) => {
        const id = crypto.randomUUID()
        const newChar: PlayerCharacter = { ...char, id, createdAt: Date.now() }
        set((s) => ({
          characters: [...s.characters, newChar],
          activeCharacterId: id,
        }))
        return id
      },

      deleteCharacter: (id) => set((s) => {
        const newProgress = { ...s.storyProgress }
        // Remove all progress entries for this character
        for (const key of Object.keys(newProgress)) {
          if (key.startsWith(`${id}:`)) delete newProgress[key]
        }
        return {
          characters: s.characters.filter((c) => c.id !== id),
          activeCharacterId: s.activeCharacterId === id ? null : s.activeCharacterId,
          storyProgress: newProgress,
        }
      }),

      setActiveCharacter: (id) => set({ activeCharacterId: id }),

      setDefaultCharacter: (id) => set((s) => {
        const target = s.characters.find((c) => c.id === id)
        if (!target) return s
        const rest = s.characters.filter((c) => c.id !== id)
        return { characters: [target, ...rest], activeCharacterId: id }
      }),

      updateCharacter: (id, updates) => set((s) => ({
        characters: s.characters.map((c) => c.id === id ? { ...c, ...updates } : c),
      })),

      // ── Universe ──
      selectedUniverse: null,
      setSelectedUniverse: (id) => set({ selectedUniverse: id }),

      // ── Story progress ──
      storyProgress: {},

      setCurrentStepIndex: (i) => set((s) => updateProgress(s, () => ({ currentStepIndex: i }))),

      advanceStep: () => set((s) => {
        const p = getProgress(s)
        return updateProgress(s, () => ({ currentStepIndex: p.currentStepIndex + 1 }))
      }),

      setCurrentChapter: (chapter) => set((s) => updateProgress(s, () => ({ currentChapter: chapter, currentStepIndex: 0 }))),

      advanceChapter: () => set((s) => {
        const p = getProgress(s)
        return updateProgress(s, () => ({ currentChapter: p.currentChapter + 1, currentStepIndex: 0 }))
      }),

      setBranchChoice: (cpId, optionId) => set((s) => {
        const p = getProgress(s)
        return updateProgress(s, () => ({
          branchChoices: { ...p.branchChoices, [cpId]: optionId },
        }))
      }),

      addChatMessage: (msg) => set((s) => {
        const p = getProgress(s)
        return updateProgress(s, () => ({
          chatHistory: [...p.chatHistory, msg],
        }))
      }),

      setChatSummary: (stepId, summary) => set((s) => {
        const p = getProgress(s)
        return updateProgress(s, () => ({
          chatSummaries: { ...p.chatSummaries, [stepId]: summary },
        }))
      }),

      getSummariesList: () => {
        const p = getProgress(get())
        return Object.values(p.chatSummaries)
      },

      addChoiceDescription: (desc) => set((s) => {
        const p = getProgress(s)
        return updateProgress(s, () => ({
          choiceDescriptions: [...p.choiceDescriptions, desc],
        }))
      }),

      updateTrust: (delta) => set((s) => {
        const p = getProgress(s)
        return updateProgress(s, () => ({
          characterState: {
            junhoTrust: Math.max(0, Math.min(100, p.characterState.junhoTrust + delta)),
          },
        }))
      }),

      setTrustStatusLabel: (label) => set((s) => updateProgress(s, () => ({ trustStatusLabel: label }))),

      setRevealSignature: (sig) => set((s) => updateProgress(s, () => ({ revealSignature: sig }))),

      setSceneImage: (stepId, url) => set((s) => {
        const p = getProgress(s)
        return updateProgress(s, () => ({
          sceneImages: { ...p.sceneImages, [stepId]: url },
        }))
      }),

      setCharacterPortrait: (characterId, url) => set((s) => {
        const p = getProgress(s)
        return updateProgress(s, () => ({
          characterPortraits: { ...p.characterPortraits, [characterId]: url },
        }))
      }),

      updateAffinity: (characterId, delta) => set((s) => {
        const p = getProgress(s)
        const current = p.characterAffinities[characterId] ?? 0
        const newScore = Math.max(0, Math.min(100, current + delta))
        const globalCurrent = s.globalAffinities[characterId] ?? 0
        return {
          ...updateProgress(s, () => ({
            characterAffinities: {
              ...p.characterAffinities,
              [characterId]: newScore,
            },
          })),
          globalAffinities: {
            ...s.globalAffinities,
            [characterId]: Math.max(globalCurrent, newScore),
          },
        }
      }),

      markPingSeen: (pingId) => set((s) => {
        const p = getProgress(s)
        if (p.seenPings.includes(pingId)) return {}
        return updateProgress(s, () => ({
          seenPings: [...p.seenPings, pingId],
        }))
      }),

      advanceQuest: (questId) => set((s) => {
        const p = getProgress(s)
        const current = p.questProgress[questId] ?? { currentStep: 0, completed: false, summary: null }
        return updateProgress(s, () => ({
          questProgress: {
            ...p.questProgress,
            [questId]: { ...current, currentStep: current.currentStep + 1 },
          },
        }))
      }),

      completeQuest: (questId, summary) => set((s) => {
        const p = getProgress(s)
        return updateProgress(s, () => ({
          questProgress: {
            ...p.questProgress,
            [questId]: { currentStep: 999, completed: true, summary },
          },
          // Add quest summary to chat summaries so it feeds into main story context
          chatSummaries: {
            ...p.chatSummaries,
            [`quest:${questId}`]: summary,
          },
        }))
      }),

      markQuestNotified: (questId) => set((s) => {
        const p = getProgress(s)
        if (p.notifiedQuests.includes(questId)) return {}
        return updateProgress(s, () => ({
          notifiedQuests: [...p.notifiedQuests, questId],
        }))
      }),

      addCharacterMemory: (characterId, memory) => set((s) => {
        const p = getProgress(s)
        const existing = p.characterMemories[characterId] ?? []
        if (existing.includes(memory)) return {}
        // Cap at 10 memories per character
        const updated = [...existing, memory].slice(-10)
        return updateProgress(s, () => ({
          characterMemories: { ...p.characterMemories, [characterId]: updated },
        }))
      }),

      // ── Global affinity ──
      globalAffinities: {},
      updateGlobalAffinity: (characterId, newScore) => set((s) => ({
        globalAffinities: {
          ...s.globalAffinities,
          [characterId]: Math.max(0, Math.min(100, newScore)),
        },
      })),

      // ── Playthrough history ──
      playthroughHistory: [],
      addPlaythroughRecord: (record) => set((s) => ({
        playthroughHistory: [...s.playthroughHistory, record].slice(-50),
      })),

      // ── Ambient pings ──
      ambientPings: [],
      lastSessionTimestamp: Date.now(),
      addAmbientPing: (ping) => set((s) => ({
        ambientPings: [...s.ambientPings, ping],
      })),
      markAmbientPingRead: (pingId) => set((s) => ({
        ambientPings: s.ambientPings.map((p) => p.id === pingId ? { ...p, read: true } : p),
      })),
      addAmbientPingReply: (pingId, msg) => set((s) => ({
        ambientPings: s.ambientPings.map((p) =>
          p.id === pingId ? { ...p, replies: [...p.replies, msg] } : p
        ),
      })),
      dismissAmbientPing: (pingId) => set((s) => ({
        ambientPings: s.ambientPings.filter((p) => p.id !== pingId),
      })),
      updateLastSessionTimestamp: () => set({ lastSessionTimestamp: Date.now() }),

      // ── Cast chat ──
      castChatThreads: {},
      unlockedCastIds: ['sora', 'jiwon', 'yuna'], // base characters always unlocked
      addCastChatMessage: (characterId, msg) => set((s) => ({
        castChatThreads: {
          ...s.castChatThreads,
          [characterId]: [...(s.castChatThreads[characterId] ?? []), msg].slice(-100),
        },
      })),
      unlockCastCharacter: (characterId) => set((s) => ({
        unlockedCastIds: s.unlockedCastIds.includes(characterId)
          ? s.unlockedCastIds
          : [...s.unlockedCastIds, characterId],
      })),

      // ── Group cast chat ──
      groupCastThreads: {},
      addGroupCastMessage: (groupKey, msg) => set((s) => ({
        groupCastThreads: {
          ...s.groupCastThreads,
          [groupKey]: [...(s.groupCastThreads[groupKey] ?? []), msg].slice(-100),
        },
      })),

      // ── Story Moments ──
      storyMoments: [],
      addStoryMoment: (moment) => set((s) => ({
        storyMoments: [...s.storyMoments, moment],
      })),
      updateMomentNote: (momentId, note) => set((s) => ({
        storyMoments: s.storyMoments.map((m) => m.id === momentId ? { ...m, note } : m),
      })),
      deleteStoryMoment: (momentId) => set((s) => ({
        storyMoments: s.storyMoments.filter((m) => m.id !== momentId),
      })),

      // ── Favorites ──
      favoriteCastIds: [],
      toggleFavoriteCast: (id) => set((s) => ({
        favoriteCastIds: s.favoriteCastIds.includes(id)
          ? s.favoriteCastIds.filter((f) => f !== id)
          : [...s.favoriteCastIds, id],
      })),

      // ── Chat Actions ──
      actionCooldowns: {},
      setActionCooldown: (characterId, actionId) => set((s) => ({
        actionCooldowns: {
          ...s.actionCooldowns,
          [characterId]: {
            ...(s.actionCooldowns[characterId] ?? {}),
            [actionId]: Date.now(),
          },
        },
      })),
      isActionOnCooldown: (characterId, actionId) => {
        const cooldowns = get().actionCooldowns[characterId]
        if (!cooldowns?.[actionId]) return false
        // Cooldown = same session (30 min window)
        return Date.now() - cooldowns[actionId] < 30 * 60 * 1000
      },

      // ── Gems ──
      gemBalance: 50,
      masterMode: false,
      setMasterMode: (v) => set({ masterMode: v }),
      spendGems: (amount) => {
        if (get().masterMode) return true // infinite gems
        const { gemBalance } = get()
        if (gemBalance < amount) return false
        set({ gemBalance: gemBalance - amount })
        return true
      },

      // ── Custom companions ──
      customCompanions: [],
      addCustomCompanion: (companion) => set((s) => ({
        customCompanions: [...s.customCompanions, companion],
      })),
      updateCustomCompanion: (id, remix) => set((s) => ({
        customCompanions: s.customCompanions.map((c) => c.id === id ? { ...c, remix } : c),
      })),
      deleteCustomCompanion: (id) => set((s) => ({
        customCompanions: s.customCompanions.filter((c) => c.id !== id),
      })),

      // ── City votes ──
      cityVotes: [],
      voteCityRequest: (cityId) => {
        const votes = get().cityVotes
        if (!votes.includes(cityId)) set({ cityVotes: [...votes, cityId] })
      },

      // ── Travel ──
      travelTrips: {},
      activeTripId: null,

      setActiveTripId: (id) => set({ activeTripId: id }),

      startTrip: (destinationId, companionId, sliders, remix) => {
        const charId = get().activeCharacterId
        if (!charId) return
        const tripId = `${charId}:${destinationId}`
        set((s) => ({
          travelTrips: {
            ...s.travelTrips,
            [tripId]: {
              destinationId,
              companionId,
              companionSliders: sliders,
              ...(remix ? { companionRemix: remix } : {}),
              currentDay: 1,
              currentSceneIndex: 0,
              phase: 'planning',
              planningChatHistory: [],
              dayChatHistories: {},
              itinerary: { days: [] },
              sceneImages: {},
              travelAffinityScore: 0,
              companionMemories: [],
              startedAt: Date.now(),
              totalEngagementMs: 0,
            },
          },
          activeTripId: tripId,
        }))
      },

      addTravelPlanningMessage: (msg) => set((s) => {
        const id = s.activeTripId
        if (!id || !s.travelTrips[id]) return {}
        const trip = s.travelTrips[id]
        return {
          travelTrips: {
            ...s.travelTrips,
            [id]: { ...trip, planningChatHistory: [...trip.planningChatHistory, msg] },
          },
        }
      }),

      addTravelDayChatMessage: (day, msg) => set((s) => {
        const id = s.activeTripId
        if (!id || !s.travelTrips[id]) return {}
        const trip = s.travelTrips[id]
        const dayMessages = trip.dayChatHistories[day] ?? []
        return {
          travelTrips: {
            ...s.travelTrips,
            [id]: {
              ...trip,
              dayChatHistories: { ...trip.dayChatHistories, [day]: [...dayMessages, msg] },
            },
          },
        }
      }),

      updateTripItinerary: (day) => set((s) => {
        const id = s.activeTripId
        if (!id || !s.travelTrips[id]) return {}
        const trip = s.travelTrips[id]
        const existingDays = trip.itinerary.days.filter((d) => d.dayNumber !== day.dayNumber)
        const updatedDays = [...existingDays, day].sort((a, b) => a.dayNumber - b.dayNumber)
        return {
          travelTrips: {
            ...s.travelTrips,
            [id]: { ...trip, itinerary: { days: updatedDays } },
          },
        }
      }),

      setTripScene: (sceneId, updates) => set((s) => {
        const id = s.activeTripId
        if (!id || !s.travelTrips[id]) return {}
        const trip = s.travelTrips[id]
        const updatedDays = trip.itinerary.days.map((day) => ({
          ...day,
          scenes: day.scenes.map((scene) =>
            scene.id === sceneId ? { ...scene, ...updates } : scene
          ),
        }))
        return {
          travelTrips: {
            ...s.travelTrips,
            [id]: { ...trip, itinerary: { days: updatedDays } },
          },
        }
      }),

      setTripSceneImage: (sceneId, url) => set((s) => {
        const id = s.activeTripId
        if (!id || !s.travelTrips[id]) return {}
        const trip = s.travelTrips[id]
        return {
          travelTrips: {
            ...s.travelTrips,
            [id]: { ...trip, sceneImages: { ...trip.sceneImages, [sceneId]: url } },
          },
        }
      }),

      advanceTravelScene: () => set((s) => {
        const id = s.activeTripId
        if (!id || !s.travelTrips[id]) return {}
        const trip = s.travelTrips[id]
        const currentDay = trip.itinerary.days.find((d) => d.dayNumber === trip.currentDay)
        if (!currentDay) return {}
        const nextIndex = trip.currentSceneIndex + 1
        if (nextIndex >= currentDay.scenes.length) {
          return {
            travelTrips: {
              ...s.travelTrips,
              [id]: { ...trip, phase: 'recap' },
            },
          }
        }
        return {
          travelTrips: {
            ...s.travelTrips,
            [id]: { ...trip, currentSceneIndex: nextIndex },
          },
        }
      }),

      advanceTravelDay: () => set((s) => {
        const id = s.activeTripId
        if (!id || !s.travelTrips[id]) return {}
        const trip = s.travelTrips[id]
        const updatedDays = trip.itinerary.days.map((d) =>
          d.dayNumber === trip.currentDay ? { ...d, completed: true } : d
        )
        const nextDay = trip.currentDay + 1
        const totalDays = trip.itinerary.days.length
        if (nextDay > totalDays && totalDays > 0) {
          return {
            travelTrips: {
              ...s.travelTrips,
              [id]: { ...trip, itinerary: { days: updatedDays }, phase: 'complete' },
            },
          }
        }
        return {
          travelTrips: {
            ...s.travelTrips,
            [id]: {
              ...trip,
              itinerary: { days: updatedDays },
              currentDay: nextDay,
              currentSceneIndex: 0,
              phase: 'day',
            },
          },
        }
      }),

      setTripPhase: (phase) => set((s) => {
        const id = s.activeTripId
        if (!id || !s.travelTrips[id]) return {}
        return {
          travelTrips: {
            ...s.travelTrips,
            [id]: { ...s.travelTrips[id], phase },
          },
        }
      }),

      updateCompanionSliders: (sliders) => set((s) => {
        const id = s.activeTripId
        if (!id || !s.travelTrips[id]) return {}
        return {
          travelTrips: {
            ...s.travelTrips,
            [id]: { ...s.travelTrips[id], companionSliders: sliders },
          },
        }
      }),

      updateTravelAffinity: (delta) => set((s) => {
        const id = s.activeTripId
        if (!id || !s.travelTrips[id]) return {}
        const trip = s.travelTrips[id]
        return {
          travelTrips: {
            ...s.travelTrips,
            [id]: {
              ...trip,
              travelAffinityScore: Math.max(0, Math.min(100, trip.travelAffinityScore + delta)),
            },
          },
        }
      }),

      addCompanionMemory: (memory) => set((s) => {
        const id = s.activeTripId
        if (!id || !s.travelTrips[id]) return {}
        const trip = s.travelTrips[id]
        if (trip.companionMemories.includes(memory)) return {}
        return {
          travelTrips: {
            ...s.travelTrips,
            [id]: {
              ...trip,
              companionMemories: [...trip.companionMemories, memory].slice(-20),
            },
          },
        }
      }),

      addTravelEngagementTime: (ms) => set((s) => {
        const id = s.activeTripId
        if (!id || !s.travelTrips[id]) return {}
        const trip = s.travelTrips[id]
        return {
          travelTrips: {
            ...s.travelTrips,
            [id]: { ...trip, totalEngagementMs: trip.totalEngagementMs + ms },
          },
        }
      }),

      setDepartureImage: (url) => set((s) => {
        const id = s.activeTripId
        if (!id || !s.travelTrips[id]) return {}
        return {
          travelTrips: {
            ...s.travelTrips,
            [id]: { ...s.travelTrips[id], departureImageUrl: url },
          },
        }
      }),

      completeTrip: () => set((s) => {
        const id = s.activeTripId
        if (!id || !s.travelTrips[id]) return {}
        return {
          travelTrips: {
            ...s.travelTrips,
            [id]: { ...s.travelTrips[id], phase: 'complete' },
          },
        }
      }),

      extendTrip: () => set((s) => {
        const id = s.activeTripId
        if (!id || !s.travelTrips[id]) return {}
        const trip = s.travelTrips[id]
        const ext = trip.extensions ?? 0
        if (ext >= 2) return {}
        const nextDay = trip.itinerary.days.length + 1
        return {
          travelTrips: {
            ...s.travelTrips,
            [id]: {
              ...trip,
              phase: 'day' as const,
              currentDay: nextDay,
              currentSceneIndex: 0,
              extensions: ext + 1,
            },
          },
        }
      }),

      resetTrip: () => set((s) => {
        const id = s.activeTripId
        if (!id) return {}
        const newTrips = { ...s.travelTrips }
        delete newTrips[id]
        return { travelTrips: newTrips, activeTripId: null }
      }),

      deleteTrip: (tripId) => set((s) => {
        const newTrips = { ...s.travelTrips }
        delete newTrips[tripId]
        return { travelTrips: newTrips, activeTripId: s.activeTripId === tripId ? null : s.activeTripId }
      }),

      // ── Streaming (ephemeral) ──
      isStreaming: false,
      setIsStreaming: (v) => set({ isStreaming: v }),
      isGeneratingScene: false,
      setIsGeneratingScene: (v) => set({ isGeneratingScene: v }),

      // ── Reset (active character+universe only) ──
      resetStory: () => {
        const s = get()
        const key = progressKey(s.activeCharacterId, s.selectedUniverse)
        if (!key) return
        set({
          storyProgress: {
            ...s.storyProgress,
            [key]: freshProgress(),
          },
          isStreaming: false,
          isGeneratingScene: false,
        })
      },

      // Legacy compat
      currentChapter: 1,
      currentBeat: 1,
      choices: [],
    }),
    {
      name: 'chaptr-v2-story',
      version: 9,
      migrate: (persisted: any, version: number) => {
        if (version < 2 && persisted) {
          // Migrate from flat store to multi-character
          const charId = crypto.randomUUID()
          const gender = persisted.loveInterest === 'yuna' ? 'male' as const : 'female' as const
          const universeId = persisted.selectedUniverse || 'seoul-transfer'

          const character: PlayerCharacter = {
            id: charId,
            name: 'Player',
            gender,
            selfieUrl: persisted.selfieUrl ?? null,
            bio: persisted.bio ?? null,
            createdAt: Date.now(),
          }

          const progress: StoryProgress = {
            currentStepIndex: persisted.currentStepIndex ?? 0,
            branchChoices: persisted.branchChoices ?? {},
            chatHistory: persisted.chatHistory ?? [],
            chatSummaries: persisted.chatSummaries ?? {},
            choiceDescriptions: persisted.choiceDescriptions ?? [],
            characterState: persisted.characterState ?? { junhoTrust: 50 },
            trustStatusLabel: persisted.trustStatusLabel ?? 'strangers',
            revealSignature: persisted.revealSignature ?? null,
            sceneImages: persisted.sceneImages ?? {},
            characterPortraits: persisted.characterPortraits ?? {},
            characterAffinities: persisted.characterAffinities ?? {},
            seenPings: persisted.seenPings ?? [],
            questProgress: persisted.questProgress ?? {},
            notifiedQuests: persisted.notifiedQuests ?? [],
            characterMemories: persisted.characterMemories ?? {},
            currentChapter: persisted.currentChapter ?? 1,
          }

          // Only create character if there was any meaningful state
          const hasState = persisted.selfieUrl || persisted.bio || persisted.loveInterest ||
            persisted.currentStepIndex > 0 || Object.keys(persisted.branchChoices ?? {}).length > 0

          return {
            characters: hasState ? [character] : [],
            activeCharacterId: hasState ? charId : null,
            selectedUniverse: persisted.selectedUniverse ?? null,
            storyProgress: hasState ? { [`${charId}:${universeId}`]: progress } : {},
            gemBalance: persisted.gemBalance ?? 50,
          }
        }
        if (version < 3 && persisted) {
          persisted.globalAffinities = persisted.globalAffinities ?? {}
          persisted.playthroughHistory = persisted.playthroughHistory ?? []
          persisted.ambientPings = persisted.ambientPings ?? []
          persisted.lastSessionTimestamp = persisted.lastSessionTimestamp ?? Date.now()
        }
        if (version < 4 && persisted) {
          persisted.castChatThreads = persisted.castChatThreads ?? {}
          persisted.unlockedCastIds = persisted.unlockedCastIds ?? ['sora', 'jiwon', 'yuna']
        }
        if (version < 5 && persisted) {
          persisted.groupCastThreads = persisted.groupCastThreads ?? {}
        }
        if (version < 6 && persisted) {
          persisted.favoriteCastIds = persisted.favoriteCastIds ?? []
        }
        if (version < 7 && persisted) {
          persisted.storyMoments = persisted.storyMoments ?? []
        }
        if (version < 8 && persisted) {
          persisted.travelTrips = persisted.travelTrips ?? {}
          persisted.activeTripId = persisted.activeTripId ?? null
        }
        if (version < 9 && persisted) {
          persisted.customCompanions = persisted.customCompanions ?? []
        }
        return persisted
      },
      partialize: (s) => ({
        characters: s.characters,
        activeCharacterId: s.activeCharacterId,
        selectedUniverse: s.selectedUniverse,
        storyProgress: s.storyProgress,
        gemBalance: s.gemBalance,
        globalAffinities: s.globalAffinities,
        playthroughHistory: s.playthroughHistory,
        ambientPings: s.ambientPings,
        lastSessionTimestamp: s.lastSessionTimestamp,
        castChatThreads: s.castChatThreads,
        unlockedCastIds: s.unlockedCastIds,
        groupCastThreads: s.groupCastThreads,
        favoriteCastIds: s.favoriteCastIds,
        storyMoments: s.storyMoments,
        travelTrips: s.travelTrips,
        activeTripId: s.activeTripId,
        customCompanions: s.customCompanions,
        cityVotes: s.cityVotes,
      }),
    }
  )
)

// ─── Exported helpers for consumers ───

/** Get the active progress for the current character+universe */
export function getActiveProgress(state: StoreState): StoryProgress {
  return getProgress(state)
}
