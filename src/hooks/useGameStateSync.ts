import { useEffect } from 'react'
import { useStore } from '../store/useStore'
import { useAuth } from '../contexts/AuthContext'
import { queueSave, flushPendingSave } from '../lib/gameStateSync'

function buildPartialState(state: ReturnType<typeof useStore.getState>) {
  return {
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
}

/** Subscribe to store changes and auto-save to Supabase for logged-in users */
export function useGameStateSync() {
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    // One-shot recovery push: if the v12 migration just cleaned data: URL
    // bloat out of local state, cloud is still holding the bloated (or
    // pre-bloat-but-stale) snapshot. Force-flush the cleaned state to
    // Supabase right now so cloud catches up — otherwise the user's just-
    // created trips stay invisible to refresh because cloud doesn't know
    // about them. Wrapped in try so a failed push doesn't block subscribe.
    if (typeof localStorage !== 'undefined' && localStorage.getItem('chaptr-v2-cleanup-pushed-pending') === '1') {
      const partial = buildPartialState(useStore.getState())
      queueSave(user.id, partial)
      flushPendingSave()
        .then(() => {
          try { localStorage.removeItem('chaptr-v2-cleanup-pushed-pending') } catch {}
        })
        .catch(() => { /* leave flag set so we retry on next mount */ })
    }

    // Best-effort flush on tab close / refresh / navigation. The browser may
    // not wait for the async fetch, but if the debounce timer was already
    // close to firing, this gives us the maximum chance of getting the latest
    // state into Supabase before the page unloads.
    const onBeforeUnload = () => { flushPendingSave() }
    window.addEventListener('beforeunload', onBeforeUnload)
    window.addEventListener('pagehide', onBeforeUnload)

    const unsub = useStore.subscribe((state) => {
      queueSave(user.id, buildPartialState(state))
    })

    return () => {
      unsub()
      window.removeEventListener('beforeunload', onBeforeUnload)
      window.removeEventListener('pagehide', onBeforeUnload)
    }
  }, [user])
}
