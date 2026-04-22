import { STORY_STEPS } from '../../storyData'
import { CHAPTER_2_STEPS, CHAPTER_2_BRIEF } from './chapter-2'
import { CHAPTER_3_STEPS, CHAPTER_3_BRIEF } from './chapter-3'
import { CHAPTER_BRIEFS } from '../../storyData'
import type { StoryStep } from '../../storyData'

export const SEOUL_TRANSFER_CHAPTERS: Record<number, StoryStep[]> = {
  1: STORY_STEPS,
  2: CHAPTER_2_STEPS,
  3: CHAPTER_3_STEPS,
}

export const SEOUL_TRANSFER_CHAPTER_BRIEFS: Record<number, string> = {
  ...CHAPTER_BRIEFS,
  2: CHAPTER_2_BRIEF,
  3: CHAPTER_3_BRIEF,
}

export const SEOUL_TRANSFER_TOTAL_CHAPTERS = 3

export function getSeoulTransferChapter(chapter: number): StoryStep[] {
  return SEOUL_TRANSFER_CHAPTERS[chapter] ?? STORY_STEPS
}
