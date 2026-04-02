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

interface StoreState {
  // Onboarding
  selfieUrl: string | null
  setSelfieUrl: (url: string | null) => void

  // Universe
  selectedUniverse: string | null
  setSelectedUniverse: (id: string) => void

  // Bio / personality
  bio: string | null
  setBio: (bio: string | null) => void

  // Gems
  gemBalance: number
  spendGems: (amount: number) => boolean

  // ── V2 Step-based story progression ──
  currentStepIndex: number
  setCurrentStepIndex: (i: number) => void
  advanceStep: () => void

  // Branch choices: { 'cp-1': 'approach', 'cp-2': 'confront' }
  branchChoices: Record<string, string>
  setBranchChoice: (choicePointId: string, optionId: string) => void

  // Chat history (all messages across all chat scenes)
  chatHistory: ChatMessage[]
  addChatMessage: (msg: ChatMessage) => void

  // Chat summaries keyed by chat step id: { 'chat-1': 'summary text' }
  chatSummaries: Record<string, string>
  setChatSummary: (stepId: string, summary: string) => void

  // Ordered summaries for prompt context
  getSummariesList: () => string[]

  // Choice history for prompt context: [{ label, description }]
  choiceDescriptions: { label: string; description: string }[]
  addChoiceDescription: (desc: { label: string; description: string }) => void

  // Character state
  characterState: CharacterState
  trustStatusLabel: string
  updateTrust: (delta: number) => void
  setTrustStatusLabel: (label: string) => void

  // Reveal
  revealSignature: string | null
  setRevealSignature: (sig: string) => void

  // Scene images cache: { stepId: dataUrl }
  sceneImages: Record<string, string>
  setSceneImage: (stepId: string, url: string) => void

  // Character portrait cache: { characterId: dataUrl }
  characterPortraits: Record<string, string>
  setCharacterPortrait: (characterId: string, url: string) => void

  // Current beat streaming state
  isStreaming: boolean
  setIsStreaming: (v: boolean) => void
  isGeneratingScene: boolean
  setIsGeneratingScene: (v: boolean) => void

  // Reset
  resetStory: () => void

  // ── Legacy compat (used by some components) ──
  currentChapter: number
  currentBeat: number
  choices: { chapter: number; chapterTitle: string; text: string }[]
}

const INITIAL_STORY_STATE = {
  currentStepIndex: 0,
  branchChoices: {} as Record<string, string>,
  chatHistory: [] as ChatMessage[],
  chatSummaries: {} as Record<string, string>,
  choiceDescriptions: [] as { label: string; description: string }[],
  characterState: { junhoTrust: 50 },
  trustStatusLabel: 'strangers',
  revealSignature: null as string | null,
  sceneImages: {} as Record<string, string>,
  characterPortraits: {} as Record<string, string>,
  isStreaming: false,
  isGeneratingScene: false,
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Onboarding
      selfieUrl: null,
      setSelfieUrl: (url) => set({ selfieUrl: url }),

      selectedUniverse: null,
      setSelectedUniverse: (id) => set({ selectedUniverse: id }),

      bio: null,
      setBio: (bio) => set({ bio }),

      gemBalance: 50,
      spendGems: (amount) => {
        const { gemBalance } = get()
        if (gemBalance < amount) return false
        set({ gemBalance: gemBalance - amount })
        return true
      },

      // V2 Step progression
      ...INITIAL_STORY_STATE,

      currentStepIndex: 0,
      setCurrentStepIndex: (i) => set({ currentStepIndex: i }),
      advanceStep: () => set((s) => ({ currentStepIndex: s.currentStepIndex + 1 })),

      branchChoices: {},
      setBranchChoice: (cpId, optionId) => set((s) => ({
        branchChoices: { ...s.branchChoices, [cpId]: optionId },
      })),

      chatHistory: [],
      addChatMessage: (msg) => set((s) => ({ chatHistory: [...s.chatHistory, msg] })),

      chatSummaries: {},
      setChatSummary: (stepId, summary) => set((s) => ({
        chatSummaries: { ...s.chatSummaries, [stepId]: summary },
      })),

      getSummariesList: () => {
        const sums = get().chatSummaries
        return Object.values(sums)
      },

      choiceDescriptions: [],
      addChoiceDescription: (desc) => set((s) => ({
        choiceDescriptions: [...s.choiceDescriptions, desc],
      })),

      characterState: { junhoTrust: 50 },
      trustStatusLabel: 'strangers',
      updateTrust: (delta) => set((s) => ({
        characterState: {
          junhoTrust: Math.max(0, Math.min(100, s.characterState.junhoTrust + delta)),
        },
      })),
      setTrustStatusLabel: (label) => set({ trustStatusLabel: label }),

      revealSignature: null,
      setRevealSignature: (sig) => set({ revealSignature: sig }),

      sceneImages: {},
      setSceneImage: (stepId, url) => set((s) => ({
        sceneImages: { ...s.sceneImages, [stepId]: url },
      })),

      characterPortraits: {},
      setCharacterPortrait: (characterId, url) => set((s) => ({
        characterPortraits: { ...s.characterPortraits, [characterId]: url },
      })),

      isStreaming: false,
      setIsStreaming: (v) => set({ isStreaming: v }),
      isGeneratingScene: false,
      setIsGeneratingScene: (v) => set({ isGeneratingScene: v }),

      resetStory: () => set({
        ...INITIAL_STORY_STATE,
        currentStepIndex: 0,
        branchChoices: {},
        chatHistory: [],
        chatSummaries: {},
        choiceDescriptions: [],
        characterState: { junhoTrust: 50 },
        trustStatusLabel: 'strangers',
        revealSignature: null,
        sceneImages: {},
        isStreaming: false,
        isGeneratingScene: false,
      }),

      // Legacy compat
      currentChapter: 1,
      currentBeat: 1,
      choices: [],
    }),
    {
      name: 'chaptr-v2-story',
      partialize: (s) => ({
        selfieUrl: s.selfieUrl,
        selectedUniverse: s.selectedUniverse,
        bio: s.bio,
        gemBalance: s.gemBalance,
        currentStepIndex: s.currentStepIndex,
        branchChoices: s.branchChoices,
        chatHistory: s.chatHistory,
        chatSummaries: s.chatSummaries,
        choiceDescriptions: s.choiceDescriptions,
        characterState: s.characterState,
        trustStatusLabel: s.trustStatusLabel,
        revealSignature: s.revealSignature,
        sceneImages: s.sceneImages,
        characterPortraits: s.characterPortraits,
      }),
    }
  )
)
