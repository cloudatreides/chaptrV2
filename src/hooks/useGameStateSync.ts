import { useEffect } from 'react'
import { useStore } from '../store/useStore'
import { useAuth } from '../contexts/AuthContext'
import { queueSave, flushPendingSave } from '../lib/gameStateSync'

/** Subscribe to store changes and auto-save to Supabase for logged-in users */
export function useGameStateSync() {
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    // Best-effort flush on tab close / refresh / navigation. The browser may
    // not wait for the async fetch, but if the debounce timer was already
    // close to firing, this gives us the maximum chance of getting the latest
    // state into Supabase before the page unloads.
    const onBeforeUnload = () => { flushPendingSave() }
    window.addEventListener('beforeunload', onBeforeUnload)
    window.addEventListener('pagehide', onBeforeUnload)

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
        customCompanions: state.customCompanions,
        // Travel state — was previously local-only and silently lost on logout.
        travelTrips: state.travelTrips,
        activeTripId: state.activeTripId,
      }
      queueSave(user.id, partialState)
    })

    return () => {
      unsub()
      window.removeEventListener('beforeunload', onBeforeUnload)
      window.removeEventListener('pagehide', onBeforeUnload)
    }
  }, [user])
}
