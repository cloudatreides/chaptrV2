import { useCallback } from 'react'
import { useStore } from '../store/useStore'
import { type ChatAction, getMysteryBoxBoost, getFavoriteThingPrompt, IMAGE_REACTION_ACTION_IDS, buildReactionImagePrompt } from '../data/chatActions'
import { getCharacter, CHARACTERS } from '../data/characters'

interface UseChatActionsParams {
  characterId: string
  universeId: string | null
  characterMemories: string[]
}

interface ActionResult {
  label: string
  emoji: string
  gemCost: number
  affinityBoost: number
  promptInjection: string
  reactionImagePrompt: string | null
}

export function useChatActions({ characterId, universeId, characterMemories }: UseChatActionsParams) {
  const spendGems = useStore((s) => s.spendGems)
  const setActionCooldown = useStore((s) => s.setActionCooldown)
  const isActionOnCooldown = useStore((s) => s.isActionOnCooldown)
  const gemBalance = useStore((s) => s.gemBalance)

  const executeAction = useCallback((action: ChatAction): ActionResult | null => {
    // Check cooldown for free actions
    if (action.gemCost === 0 && isActionOnCooldown(characterId, action.id)) {
      return null
    }

    // Check and spend gems
    if (action.gemCost > 0) {
      const success = spendGems(action.gemCost)
      if (!success) return null
    }

    // Set cooldown
    setActionCooldown(characterId, action.id)

    // Handle special cases
    let affinityBoost = action.affinityBoost
    let promptInjection = action.promptInjection

    // Mystery box: random affinity
    if (action.id === 'mystery-box') {
      affinityBoost = getMysteryBoxBoost()
    }

    // Favorite thing: check memories for match
    if (action.id === 'favorite-thing') {
      const charData = getCharacter(characterId, universeId) ?? CHARACTERS[characterId]
      const { prompt, isMatch } = getFavoriteThingPrompt(charData?.favoriteThing, characterMemories)
      promptInjection = prompt
      affinityBoost = isMatch ? 10 : 3
    }

    // Build reaction image prompt for romantic actions that trigger it
    let reactionImagePrompt: string | null = null
    if (IMAGE_REACTION_ACTION_IDS.has(action.id)) {
      const charData = getCharacter(characterId, universeId) ?? CHARACTERS[characterId]
      if (charData?.portraitPrompt) {
        reactionImagePrompt = buildReactionImagePrompt(charData.portraitPrompt, action.id, action.label)
      }
    }

    return {
      label: action.label,
      emoji: action.emoji,
      gemCost: action.gemCost,
      affinityBoost,
      promptInjection,
      reactionImagePrompt,
    }
  }, [characterId, universeId, characterMemories, spendGems, setActionCooldown, isActionOnCooldown])

  const checkCooldown = useCallback((actionId: string) => {
    return isActionOnCooldown(characterId, actionId)
  }, [characterId, isActionOnCooldown])

  return { executeAction, checkCooldown, gemBalance }
}
