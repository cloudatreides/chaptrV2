import { useStore, DEFAULT_PROGRESS } from '../store/useStore'
import type { PlayerCharacter } from '../store/useStore'

export function useActiveStory() {
  const characters = useStore((s) => s.characters)
  const activeCharacterId = useStore((s) => s.activeCharacterId)
  const selectedUniverse = useStore((s) => s.selectedUniverse)
  const storyProgress = useStore((s) => s.storyProgress)

  const activeCharacter: PlayerCharacter | null =
    characters.find((c) => c.id === activeCharacterId) ?? null

  const key = activeCharacterId && selectedUniverse
    ? `${activeCharacterId}:${selectedUniverse}` : null

  const progress = key ? storyProgress[key] ?? DEFAULT_PROGRESS : DEFAULT_PROGRESS

  const loveInterest: 'jiwon' | 'yuna' = activeCharacter?.gender === 'male' ? 'yuna' : 'jiwon'
  const selfieUrl = activeCharacter?.selfieUrl ?? null
  const bio = activeCharacter?.bio ?? null

  return {
    // Character
    activeCharacter,
    selfieUrl,
    bio,
    loveInterest,
    selectedUniverse,
    // Progress (spread flat for easy destructuring)
    ...progress,
  }
}
