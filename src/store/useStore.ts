import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Choice {
  chapter: number
  chapterTitle: string
  text: string
}

export interface Beat {
  prose: string
  choices: { text: string; gemCost?: number }[]
  isChapterEnd?: boolean
}

interface StoreState {
  // Onboarding
  selfieUrl: string | null
  setSelfieUrl: (url: string | null) => void

  // Universe
  selectedUniverse: string | null
  setSelectedUniverse: (id: string) => void

  // Gems
  gemBalance: number
  spendGems: (amount: number) => boolean

  // Story progress
  currentChapter: number
  currentBeat: number
  choices: Choice[]
  addChoice: (choice: Choice) => void
  advanceChapter: () => void
  advanceBeat: () => void
  resetStory: () => void

  // Current beat state
  currentProse: string
  setCurrentProse: (prose: string) => void
  isStreaming: boolean
  setIsStreaming: (v: boolean) => void
  isGeneratingScene: boolean
  setIsGeneratingScene: (v: boolean) => void
  selectedChoiceIndex: number | null
  setSelectedChoiceIndex: (i: number | null) => void
  continuationProse: string
  setContinuationProse: (prose: string) => void
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      selfieUrl: null,
      setSelfieUrl: (url) => set({ selfieUrl: url }),

      selectedUniverse: null,
      setSelectedUniverse: (id) => set({ selectedUniverse: id }),

      gemBalance: 50,
      spendGems: (amount) => {
        const { gemBalance } = get()
        if (gemBalance < amount) return false
        set({ gemBalance: gemBalance - amount })
        return true
      },

      currentChapter: 1,
      currentBeat: 1,
      choices: [],
      addChoice: (choice) => set((s) => ({ choices: [...s.choices, choice] })),
      advanceChapter: () => set((s) => ({ currentChapter: s.currentChapter + 1, currentBeat: 1 })),
      advanceBeat: () => set((s) => ({ currentBeat: s.currentBeat + 1 })),
      resetStory: () => set({
        currentChapter: 1,
        currentBeat: 1,
        choices: [],
        currentProse: '',
        isStreaming: false,
        isGeneratingScene: false,
        selectedChoiceIndex: null,
        continuationProse: '',
      }),

      currentProse: '',
      setCurrentProse: (prose) => set({ currentProse: prose }),
      isStreaming: false,
      setIsStreaming: (v) => set({ isStreaming: v }),
      isGeneratingScene: false,
      setIsGeneratingScene: (v) => set({ isGeneratingScene: v }),
      selectedChoiceIndex: null,
      setSelectedChoiceIndex: (i) => set({ selectedChoiceIndex: i }),
      continuationProse: '',
      setContinuationProse: (prose) => set({ continuationProse: prose }),
    }),
    {
      name: 'chaptr-v2',
      partialize: (s) => ({
        selfieUrl: s.selfieUrl,
        selectedUniverse: s.selectedUniverse,
        gemBalance: s.gemBalance,
        currentChapter: s.currentChapter,
        currentBeat: s.currentBeat,
        choices: s.choices,
      }),
    }
  )
)
