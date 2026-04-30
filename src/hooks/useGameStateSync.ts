import { useEffect } from 'react'
import { useStore } from '../store/useStore'
import { useAuth } from '../contexts/AuthContext'
import { queueSave, flushPendingSave } from '../lib/gameStateSync'

// Per-thread message cap when writing to cloud. Mirrors the existing
// castChatThreads .slice(-100) pattern so all chat collections share one
// rule. Local store keeps the full history (zustand persist → localStorage);
// cloud only sees the tail. Trade-off: cross-device hydrate gives the user
// the last 50 messages of each thread instead of all-time. That's massively
// better than the alternative (state grows past Supabase's payload limit
// and ALL saves silently fail, reverting trips on refresh).
const CLOUD_CHAT_TAIL = 50

function trimMessages<T>(arr: T[] | undefined): T[] | undefined {
  if (!Array.isArray(arr)) return arr
  return arr.length > CLOUD_CHAT_TAIL ? arr.slice(-CLOUD_CHAT_TAIL) : arr
}

/** Slim a trip for cloud sync. Strip Claude-generated scene prose +
 *  companionReaction (regenerable from imagePrompt+location at next view).
 *  Cap planning + per-day chat to last CLOUD_CHAT_TAIL messages. */
function trimTripForCloud(trip: any) {
  if (!trip) return trip
  const trimmed: any = { ...trip }
  if (Array.isArray(trip.planningChatHistory)) {
    trimmed.planningChatHistory = trimMessages(trip.planningChatHistory)
  }
  if (trip.dayChatHistories && typeof trip.dayChatHistories === 'object') {
    const slim: Record<number, any[]> = {}
    for (const [k, v] of Object.entries(trip.dayChatHistories)) {
      slim[k as unknown as number] = trimMessages(v as any[]) ?? []
    }
    trimmed.dayChatHistories = slim
  }
  if (trip.itinerary && Array.isArray(trip.itinerary.days)) {
    trimmed.itinerary = {
      ...trip.itinerary,
      days: trip.itinerary.days.map((d: any) => ({
        ...d,
        scenes: Array.isArray(d.scenes)
          ? d.scenes.map((s: any) => ({ ...s, prose: null, companionReaction: null }))
          : d.scenes,
      })),
    }
  }
  return trimmed
}

function trimStoryProgressForCloud(progress: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {}
  for (const [k, p] of Object.entries(progress ?? {})) {
    out[k] = p && Array.isArray(p.chatHistory)
      ? { ...p, chatHistory: trimMessages(p.chatHistory) }
      : p
  }
  return out
}

function buildPartialState(state: ReturnType<typeof useStore.getState>) {
  // Cloud-shaped state — chat tails capped, regenerable scene prose stripped.
  // Local store is untouched; only the payload to Supabase is slimmed.
  const slimTrips: Record<string, any> = {}
  for (const [id, trip] of Object.entries(state.travelTrips ?? {})) {
    slimTrips[id] = trimTripForCloud(trip)
  }
  return {
    characters: state.characters,
    activeCharacterId: state.activeCharacterId,
    selectedUniverse: state.selectedUniverse,
    storyProgress: trimStoryProgressForCloud(state.storyProgress as Record<string, any>),
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
    travelTrips: slimTrips,
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
