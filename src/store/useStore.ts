import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─── Types ───

export interface ChatMessage {
  role: 'user' | 'character'
  content: string
  characterId: string
  timestamp: number
}

export interface CharacterState {
  junhoTrust: number
}

export interface PlayerCharacter {
  id: string
  name: string
  gender: 'male' | 'female'
  selfieUrl: string | null
  bio: string | null
  createdAt: number
}

export interface StoryProgress {
  currentStepIndex: number
  branchChoices: Record<string, string>
  chatHistory: ChatMessage[]
  chatSummaries: Record<string, string>
  choiceDescriptions: { label: string; description: string }[]
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
  updateCharacter: (id: string, updates: Partial<Pick<PlayerCharacter, 'name' | 'gender' | 'selfieUrl' | 'bio'>>) => void

  // ── Universe ──
  selectedUniverse: string | null
  setSelectedUniverse: (id: string) => void

  // ── Story progress (keyed by characterId:universeId) ──
  storyProgress: Record<string, StoryProgress>

  // ── Progress actions (operate on active character+universe slot) ──
  setCurrentStepIndex: (i: number) => void
  advanceStep: () => void
  setBranchChoice: (choicePointId: string, optionId: string) => void
  addChatMessage: (msg: ChatMessage) => void
  setChatSummary: (stepId: string, summary: string) => void
  getSummariesList: () => string[]
  addChoiceDescription: (desc: { label: string; description: string }) => void
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

  // ── Gems ──
  gemBalance: number
  spendGems: (amount: number) => boolean

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
        return updateProgress(s, () => ({
          characterAffinities: {
            ...p.characterAffinities,
            [characterId]: Math.max(0, Math.min(100, current + delta)),
          },
        }))
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

      // ── Gems ──
      gemBalance: 50,
      spendGems: (amount) => {
        const { gemBalance } = get()
        if (gemBalance < amount) return false
        set({ gemBalance: gemBalance - amount })
        return true
      },

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
      version: 2,
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
        return persisted
      },
      partialize: (s) => ({
        characters: s.characters,
        activeCharacterId: s.activeCharacterId,
        selectedUniverse: s.selectedUniverse,
        storyProgress: s.storyProgress,
        gemBalance: s.gemBalance,
      }),
    }
  )
)

// ─── Exported helpers for consumers ───

/** Get the active progress for the current character+universe */
export function getActiveProgress(state: StoreState): StoryProgress {
  return getProgress(state)
}
