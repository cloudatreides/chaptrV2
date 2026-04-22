import { getStoryData } from './stories'
import { UNIVERSES, STORY_STEPS, CHAPTER_BRIEFS, resolveText, getCharacterBible } from './storyData'
import type { StoryStep } from './storyData'

export function getUniverseGenre(universeId: string | null): string {
  if (!universeId) return 'ROMANCE'
  return UNIVERSES.find(u => u.id === universeId)?.genre ?? 'ROMANCE'
}

export function getStepsForUniverse(universeId: string | null, chapter?: number): StoryStep[] {
  const storyData = getStoryData(universeId ?? 'seoul-transfer')
  if (storyData?.chapters && chapter) {
    return storyData.chapters[chapter] ?? storyData.steps
  }
  if (storyData) return storyData.steps
  return STORY_STEPS
}

export function getTotalChapters(universeId: string | null): number {
  const storyData = getStoryData(universeId ?? 'seoul-transfer')
  return storyData?.totalChapters ?? 1
}

export function getBibleForUniverse(universeId: string | null, preference?: 'jiwon' | 'yuna' | null): string {
  const storyData = getStoryData(universeId ?? 'seoul-transfer')
  if (storyData) {
    return resolveText(storyData.bible, preference ?? null)
  }
  return getCharacterBible(preference ?? null)
}

export function getChapterBrief(universeId: string | null, chapter: number): string | undefined {
  const storyData = getStoryData(universeId ?? 'seoul-transfer')
  if (storyData?.chapterBriefs) return storyData.chapterBriefs[chapter]
  return CHAPTER_BRIEFS[chapter]
}

export function getRevealPerspective(universeId: string | null, loveInterest?: 'jiwon' | 'yuna' | null): string {
  const storyData = getStoryData(universeId ?? 'seoul-transfer')
  if (storyData) {
    return resolveText(storyData.revealPerspective, loveInterest ?? null)
  }
  return loveInterest === 'yuna' ? 'Yuna sees you as' : 'Jiwon sees you as'
}
