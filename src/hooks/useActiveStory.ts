import { useStore, DEFAULT_PROGRESS } from '../store/useStore'
import type { PlayerCharacter } from '../store/useStore'
import { getStoryData } from '../data/stories'

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

  // Universe-aware primary NPC name for trust bar
  const storyData = getStoryData(selectedUniverse)
  const primaryNpcName = storyData
    ? storyData.characters[storyData.primaryCharacterId]?.name ?? 'Unknown'
    : loveInterest === 'yuna' ? 'Yuna' : 'Jiwon'

  return {
    // Character
    activeCharacter,
    selfieUrl,
    bio,
    loveInterest,
    selectedUniverse,
    primaryNpcName,
    // Progress (spread flat for easy destructuring)
    ...progress,
  }
}
