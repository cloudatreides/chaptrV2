import { useCallback } from 'react'
import { useStore } from '../store/useStore'
import { type ChatAction, getMysteryBoxBoost, IMAGE_REACTION_ACTION_IDS, buildReactionImagePrompt, getRandomJoke, getRandomDare } from '../data/chatActions'
import { getCharacter, CHARACTERS } from '../data/characters'
import { getUniverseGenre } from '../data/storyHelpers'

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
  sceneImagePrompt: string | null
  giftImagePrompt: string | null
  letterContent: string | null
  jokeText: string | null
  dareText: string | null
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
    let jokeText: string | null = null
    let dareText: string | null = null

    // Tell a joke: pick a random joke and inject it
    if (action.id === 'tell-joke') {
      const genre = getUniverseGenre(universeId)
      jokeText = getRandomJoke(genre)
      promptInjection = `told you this joke: "${jokeText}". React to THIS SPECIFIC joke in 2-3 sentences — do you find it hilarious, cringe, or do you roast their humor? Reference the actual joke in your reaction.`
    }

    // Dare: pick a random dare the character must perform
    if (action.id === 'dare') {
      const genre = getUniverseGenre(universeId)
      dareText = getRandomDare(genre)
      promptInjection = `dares you to: "${dareText}". You MUST attempt the dare in your response. React in character — are you nervous, excited, embarrassed? Then actually DO IT. Perform the dare. Don't refuse or deflect. Commit to it fully, in your own style.`
    }

    // Mystery box: random affinity
    if (action.id === 'mystery-box') {
      affinityBoost = getMysteryBoxBoost()
    }

    // Build reaction image prompt for romantic actions that trigger it
    let reactionImagePrompt: string | null = null
    if (IMAGE_REACTION_ACTION_IDS.has(action.id)) {
      const charData = getCharacter(characterId, universeId) ?? CHARACTERS[characterId]
      if (charData?.portraitPrompt) {
        reactionImagePrompt = buildReactionImagePrompt(charData.portraitPrompt, action.id, action.label)
      }
    }

    // Build scene image prompt for actions that show both characters (uses Kontext with selfie)
    let sceneImagePrompt: string | null = null
    if (action.id === 'coffee' || action.id === 'serenade') {
      const charData = getCharacter(characterId, universeId) ?? CHARACTERS[characterId]
      if (charData?.portraitPrompt) {
        const charDesc = charData.portraitPrompt.match(/portrait of (.+?)(?:,\s*(?:soft|clean|high))/i)?.[1] ?? charData.name
        if (action.id === 'coffee') {
          sceneImagePrompt = `Anime illustration, cel-shaded, two people at a cozy café: a young person handing a warm coffee to ${charDesc}, warm smiles, gentle steam rising from the cup, soft warm café lighting, intimate casual moment, vibrant anime art, ONLY these two people in the image`
        } else if (action.id === 'serenade') {
          sceneImagePrompt = `Anime illustration, cel-shaded, romantic scene of two people: a young person singing softly to ${charDesc}, who looks deeply moved with hand over heart and tears in eyes, soft golden lighting, intimate evening atmosphere, emotional tender moment, vibrant anime art, ONLY these two people in the image`
        }
      }
    }

    return {
      label: action.label,
      emoji: action.emoji,
      gemCost: action.gemCost,
      affinityBoost,
      promptInjection,
      reactionImagePrompt,
      sceneImagePrompt,
      giftImagePrompt: action.giftImagePrompt ?? null,
      letterContent: null, // set asynchronously for love-letter actions
      jokeText,
      dareText,
    }
  }, [characterId, universeId, characterMemories, spendGems, setActionCooldown, isActionOnCooldown])

  /** Check if an action needs async letter generation */
  const isLetterAction = useCallback((actionId: string) => actionId === 'love-letter', [])

  const checkCooldown = useCallback((actionId: string) => {
    return isActionOnCooldown(characterId, actionId)
  }, [characterId, isActionOnCooldown])

  return { executeAction, checkCooldown, gemBalance, isLetterAction }
}
