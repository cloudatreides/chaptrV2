import { useEffect } from 'react'
import { useStore } from '../store/useStore'
import { useAuth } from '../contexts/AuthContext'
import { queueSave } from '../lib/gameStateSync'

/** Subscribe to store changes and auto-save to Supabase for logged-in users */
export function useGameStateSync() {
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const unsub = useStore.subscribe((state) => {
      const partialState = {
        characters: state.characters,
        activeCharacterId: state.activeCharacterId,
        selectedUniverse: state.selectedUniverse,
        storyProgress: state.storyProgress,
        gemBalance: state.gemBalance,
        globalAffinities: state.globalAffinities,
        playthroughHistory: state.playthroughHistory,
        ambientPings: state.ambientPings,
        lastSessionTimestamp: Date.now(),
        castChatThreads: state.castChatThreads,
        unlockedCastIds: state.unlockedCastIds,
        groupCastThreads: state.groupCastThreads,
        favoriteCastIds: state.favoriteCastIds,
        storyMoments: state.storyMoments,
      }
      queueSave(user.id, partialState)
    })

    return unsub
  }, [user])
}
