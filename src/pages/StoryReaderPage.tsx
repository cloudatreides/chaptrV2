import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { useActiveStory } from '../hooks/useActiveStory'
import { getActiveSteps, getTotalBeats, getCurrentBeatNumber, resolveLoveInterestId, resolveText, getStepsForUniverse, UNIVERSES } from '../data/storyData'
import { GemCounter } from '../components/GemCounter'
import { ChoicePoint } from '../components/ChoicePoint'
import { ChatScene } from '../components/ChatScene'
import { SceneChat } from '../components/SceneChat'
import { GroupChatScene } from '../components/GroupChatScene'
import { YourStorySheet } from '../components/YourStorySheet'
import { YourStorySidebar } from '../components/YourStorySidebar'
import { streamBeatProse, extractTrustData } from '../lib/claudeStream'
import { generateSceneImage } from '../lib/togetherAi'
import { useStreamingTypewriter, useTypewriter } from '../hooks/useTypewriter'
import { AudioToggle } from '../components/AudioToggle'
import { ambientAudio } from '../lib/ambientAudio'
import type { AmbientMood } from '../lib/ambientAudio'
import { COMMUNITY_STATS } from '../data/communityStats'
import { ShareMomentToast } from '../components/ShareMomentToast'
import { trackEvent } from '../lib/supabase'
import { getPingsForUniverse } from '../data/pings'
import { PingNotification } from '../components/PingNotification'
import { getQuestsForUniverse } from '../data/quests'
import { QuestUnlockToast } from '../components/QuestUnlockToast'
import type { PingDef } from '../data/pings'
import type { QuestDef } from '../data/quests'
import type { StoryStep, SceneCharacter } from '../data/storyData'

export function StoryReaderPage() {
  const navigate = useNavigate()
  const {
    activeCharacter, loveInterest, selfieUrl, bio, selectedUniverse,
    currentStepIndex, branchChoices, choiceDescriptions, characterState,
    sceneImages, trustStatusLabel, characterAffinities, seenPings,
  } = useActiveStory()

  const {
    advanceStep, setBranchChoice,
    addChoiceDescription, updateTrust,
    setTrustStatusLabel,
    isStreaming, setIsStreaming,
    isGeneratingScene, setIsGeneratingScene,
    setSceneImage,
    unlockCastCharacter,
  } = useStore()
  const playthroughHistory = useStore((s) => s.playthroughHistory)
  const summariesList = useStore.getState().getSummariesList()

  const [sheetOpen, setSheetOpen] = useState(false)
  const [activePing, setActivePing] = useState<PingDef | null>(null)
  const [questToast, setQuestToast] = useState<QuestDef | null>(null)
  const prevStepIndexRef = useRef(currentStepIndex)

  // Redirect if no active character
  useEffect(() => {
    if (!activeCharacter) {
      navigate(selectedUniverse ? '/characters' : '/home', { replace: true })
    }
  }, [activeCharacter])

  // Compute active steps based on branch choices
  const universeSteps = getStepsForUniverse(selectedUniverse)
  const activeSteps = getActiveSteps(branchChoices, universeSteps)
  const currentStep = activeSteps[currentStepIndex]
  const totalBeats = getTotalBeats(activeSteps)
  const currentBeatNum = currentStep?.type === 'beat' ? getCurrentBeatNumber(activeSteps, currentStepIndex) : 0

  // Beat-specific state
  const [beatProse, setBeatProse] = useState('')
  const [hasChosenBeat, setHasChosenBeat] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const currentImages: string[] = (() => {
    if (!currentStep) return []
    if (currentStep.sceneImagePrompts?.length) {
      return currentStep.sceneImagePrompts
        .map((_, i) => sceneImages[`${currentStep.id}:${i}`])
        .filter(Boolean) as string[]
    }
    const single = sceneImages[currentStep.id] ?? currentStep.staticImage
    return single ? [single] : []
  })()

  const isFirstBeat = currentStep?.id === 'beat-1'
  const { displayed: openingDisplayed, done: openingDone } = useTypewriter(
    isFirstBeat ? resolveText(currentStep?.openingProse ?? '', loveInterest) : '',
    20,
  )

  const { displayed: streamDisplayed, isTyping, append, finish, reset: resetStream } = useStreamingTypewriter(18)

  useEffect(() => { trackEvent('story_start') }, [])

  // ─── Ping evaluation — check for character pings after step transitions ───
  useEffect(() => {
    if (currentStepIndex <= prevStepIndexRef.current) {
      prevStepIndexRef.current = currentStepIndex
      return
    }
    prevStepIndexRef.current = currentStepIndex

    // The step that just completed is the previous one
    const prevStep = activeSteps[currentStepIndex - 1]
    if (!prevStep) return

    const pings = getPingsForUniverse(selectedUniverse)
    const pending = pings.find(p => {
      if (seenPings.includes(p.id)) return false
      // Match afterStep against the step ID or choicePointId
      if (p.afterStep !== prevStep.id && p.afterStep !== prevStep.choicePointId) return false
      // Check affinity gate
      const resolvedCharId = p.characterId === 'jiwon'
        ? (loveInterest === 'yuna' ? 'yuna' : 'jiwon')
        : p.characterId
      const affinity = characterAffinities[resolvedCharId] ?? 0
      if (p.affinityMin && affinity < p.affinityMin) return false
      return true
    })

    if (pending && !activePing) {
      // Delay slightly so the new step renders first
      setTimeout(() => setActivePing(pending), 1500)
    }

    // Check for quest unlocks
    const quests = getQuestsForUniverse(selectedUniverse)
    const { markQuestNotified } = useStore.getState()
    const prog = useStore.getState().storyProgress
    const key = `${useStore.getState().activeCharacterId}:${selectedUniverse}`
    const currentProgress = key ? prog[key] : undefined
    const notified = currentProgress?.notifiedQuests ?? []

    const newQuest = quests.find(q => {
      if (notified.includes(q.id)) return false
      if (currentProgress?.questProgress[q.id]?.completed) return false
      const charId = q.characterId === 'jiwon'
        ? (loveInterest === 'yuna' ? 'yuna' : 'jiwon')
        : q.characterId
      return (characterAffinities[charId] ?? 0) >= q.affinityGate
    })

    if (newQuest && !questToast) {
      markQuestNotified(newQuest.id)
      setTimeout(() => setQuestToast(newQuest), pending ? 3000 : 1500)
    }
  }, [currentStepIndex])

  // ─── Cast unlock — unlock NPC characters when player enters chat/scene steps ───
  useEffect(() => {
    if (!currentStep) return
    if (currentStep.type === 'chat' && currentStep.characterId) {
      const charId = currentStep.characterId === 'jiwon' ? resolveLoveInterestId(loveInterest) : currentStep.characterId
      unlockCastCharacter(charId)
    } else if (currentStep.type === 'scene' && currentStep.sceneCharacters) {
      for (const sc of currentStep.sceneCharacters) {
        const charId = sc.characterId === 'jiwon' ? resolveLoveInterestId(loveInterest) : sc.characterId
        unlockCastCharacter(charId)
      }
    }
  }, [currentStepIndex])

  useEffect(() => {
    setBeatProse('')
    setHasChosenBeat(false)
    resetStream()
    setIsStreaming(false)
    setIsGeneratingScene(false)

    const gender = activeCharacter?.gender

    if (currentStep?.type === 'beat') {
      const incProt = currentStep.includesProtagonist !== false
      if (currentStep.sceneImagePrompts?.length) {
        const needsGeneration = currentStep.sceneImagePrompts.some((_, i) => !sceneImages[`${currentStep.id}:${i}`])
        if (needsGeneration) setIsGeneratingScene(true)
        const promises = currentStep.sceneImagePrompts.map((prompt, i) => {
          const key = `${currentStep.id}:${i}`
          if (sceneImages[key]) return Promise.resolve()
          return generateSceneImage({ prompt, referenceImageUrl: selfieUrl, protagonistGender: gender, includesProtagonist: incProt }).then((url) => {
            if (url) setSceneImage(key, url)
          })
        })
        Promise.all(promises).then(() => setIsGeneratingScene(false))
      } else if (currentStep.sceneImagePrompt && !sceneImages[currentStep.id]) {
        setIsGeneratingScene(true)
        generateSceneImage({ prompt: currentStep.sceneImagePrompt, referenceImageUrl: selfieUrl, protagonistGender: gender, includesProtagonist: incProt }).then((url) => {
          if (url) setSceneImage(currentStep.id, url)
          setIsGeneratingScene(false)
        })
      }
    }

    // Generate per-option images for choice steps (fire-and-forget, no loader needed)
    if (currentStep?.type === 'choice' && currentStep.options) {
      for (const opt of currentStep.options) {
        const key = `${currentStep.id}:${opt.id}`
        if (opt.imagePrompt && !sceneImages[key]) {
          generateSceneImage({ prompt: opt.imagePrompt, referenceImageUrl: selfieUrl, protagonistGender: gender }).then((url) => {
            if (url) setSceneImage(key, url)
          })
        }
      }
    }

    if (currentStep?.type) {
      const moodMap: Record<string, AmbientMood> = { beat: 'story', chat: 'chat', scene: 'chat', choice: 'choice', reveal: 'reveal' }
      ambientAudio.setMood(moodMap[currentStep.type] ?? 'story')
    }
  }, [currentStepIndex])

  useEffect(() => {
    const unlock = () => {
      ambientAudio.unlock()
      if (!ambientAudio.isMuted) {
        const moodMap: Record<string, AmbientMood> = { beat: 'story', chat: 'chat', scene: 'chat', choice: 'choice', reveal: 'reveal' }
        ambientAudio.setMood(moodMap[currentStep?.type ?? 'beat'] ?? 'story')
      }
      document.removeEventListener('click', unlock)
    }
    document.addEventListener('click', unlock, { once: true })
    return () => { document.removeEventListener('click', unlock); ambientAudio.stop() }
  }, [])

  useEffect(() => {
    if (currentStep?.type === 'reveal') navigate('/reveal')
  }, [currentStep])

  const handleGenerateBeat = async () => {
    if (!currentStep || currentStep.type !== 'beat' || hasChosenBeat) return
    if (isFirstBeat) return

    setIsStreaming(true)
    resetStream()

    abortRef.current = new AbortController()
    try {
      let fullProse = ''
      let jsonBuffer = '' // hold back trailing { that might be trust JSON
      const gen = streamBeatProse({
        beatTitle: currentStep.title ?? 'Scene',
        arcBrief: currentStep.arcBrief,
        choiceHistory: choiceDescriptions,
        chatSummaries: summariesList,
        characterState: characterState,
        bio,
        playerName: activeCharacter?.name ?? null,
        loveInterest,
        universeId: selectedUniverse,
        signal: abortRef.current.signal,
        previousPlaythroughs: playthroughHistory,
      })

      for await (const chunk of gen) {
        fullProse += chunk
        const text = jsonBuffer + chunk
        const braceIdx = text.lastIndexOf('{')
        if (braceIdx >= 0) {
          // Show text before potential JSON, buffer the rest
          const safe = text.slice(0, braceIdx)
          if (safe) append(safe)
          jsonBuffer = text.slice(braceIdx)
        } else {
          append(text)
          jsonBuffer = ''
        }
      }

      // Flush buffer if it's not trust JSON
      if (jsonBuffer && !jsonBuffer.includes('"trustDelta"')) {
        append(jsonBuffer)
      }
      finish()

      const { prose: cleanProse, trustDelta, statusLabel } = extractTrustData(fullProse)
      if (trustDelta !== 0) updateTrust(trustDelta)
      if (statusLabel) setTrustStatusLabel(statusLabel)

      // Always reset to clean prose (strips any remaining artifacts)
      resetStream()
      append(cleanProse)
      finish()

      setBeatProse(cleanProse)
    } catch (e) {
      if (e instanceof Error && e.name !== 'AbortError') {
        append('The story continues...')
        finish()
      }
    } finally {
      setIsStreaming(false)
      setHasChosenBeat(true)
    }
  }

  useEffect(() => {
    if (currentStep?.type === 'beat' && !isFirstBeat && !hasChosenBeat && !isStreaming) {
      handleGenerateBeat()
    }
  }, [currentStepIndex, currentStep?.id])

  const universeTitle = UNIVERSES.find(u => u.id === selectedUniverse)?.title ?? 'The Seoul Transfer'

  const handleAdvance = () => advanceStep()

  const [choiceResult, setChoiceResult] = useState<{ choicePointId: string; selectedOptionId: string } | null>(null)
  const [shareMoment, setShareMoment] = useState<{ label: string; universe: string } | null>(null)

  const handleBranchChoice = (optionId: string) => {
    if (!currentStep || currentStep.type !== 'choice') return
    const option = currentStep.options?.find((o) => o.id === optionId)
    if (!option || !currentStep.choicePointId) return

    // Handle premium gem cost
    if (option.premium && option.gemCost) {
      const success = useStore.getState().spendGems(option.gemCost)
      if (!success) return
    }

    setBranchChoice(currentStep.choicePointId, optionId)
    addChoiceDescription({ label: option.label, description: option.description })
    trackEvent('choice_made', { choicePoint: currentStep.choicePointId, option: optionId, premium: !!option.premium })

    // Show community stats + share toast
    setChoiceResult({ choicePointId: currentStep.choicePointId, selectedOptionId: optionId })
    setShareMoment({ label: option.label, universe: universeTitle })

    setTimeout(() => {
      setChoiceResult(null)
      advanceStep()
    }, 3500)

    // Auto-dismiss share toast after 8s
    setTimeout(() => setShareMoment(null), 8000)
  }

  const handleChatComplete = () => advanceStep()

  if (!currentStep) return null

  const universeDesc = UNIVERSES.find(u => u.id === selectedUniverse)?.description ?? 'The protagonist is a transfer student at Seoul Arts Academy.'
  const storyContext = `Chapter 1: ${universeTitle}. ${universeDesc} ` +
    (choiceDescriptions.length > 0
      ? `Choices so far: ${choiceDescriptions.map((c) => c.label).join(', ')}. `
      : '') +
    (summariesList.length > 0
      ? `Previous conversations: ${summariesList.join(' ')}`
      : '')

  const renderStepContent = () => {
    switch (currentStep.type) {
      case 'chat': {
        const rawCharId = currentStep.characterId!
        const chatCharId = rawCharId === 'jiwon' ? resolveLoveInterestId(loveInterest) : rawCharId
        return (
          <ChatScene
            stepId={currentStep.id}
            characterId={chatCharId}
            maxExchanges={currentStep.maxExchanges ?? 10}
            minExchanges={currentStep.minExchanges ?? 3}
            storyContext={storyContext}
            chatImagePrompt={currentStep.chatImagePrompt}
            onComplete={handleChatComplete}
          />
        )
      }

      case 'choice': {
        const resolvedOptions = (currentStep.options ?? []).map((opt) => ({
          ...opt,
          label: resolveText(opt.label, loveInterest),
          description: resolveText(opt.description, loveInterest),
          consequenceHint: opt.consequenceHint ? resolveText(opt.consequenceHint, loveInterest) : undefined,
        }))
        const optImages: Record<string, string> = {}
        for (const opt of currentStep.options ?? []) {
          const img = sceneImages[`${currentStep.id}:${opt.id}`]
          if (img) optImages[opt.id] = img
        }
        const backdrop = sceneImages[currentStep.id] ?? null
        return (
          <ChoicePoint
            title={currentStep.title ?? 'Choose'}
            options={resolvedOptions}
            onSelect={handleBranchChoice}
            optionImages={optImages}
            playerName={activeCharacter?.name ?? null}
            playerAvatar={selfieUrl}
            sceneBackdrop={backdrop}
            communityStats={choiceResult ? COMMUNITY_STATS[choiceResult.choicePointId] : undefined}
            selectedOptionId={choiceResult?.selectedOptionId ?? null}
            showStats={!!choiceResult}
          />
        )
      }

      case 'scene': {
        const resolvedSceneChars: SceneCharacter[] = (currentStep.sceneCharacters ?? []).map(sc => ({
          ...sc,
          characterId: sc.characterId === 'jiwon' ? resolveLoveInterestId(loveInterest) : sc.characterId,
        }))
        if (currentStep.groupChat) {
          const groupContext = currentStep.arcBrief
            ? `${storyContext}\n\nCurrent scene: ${currentStep.arcBrief}`
            : storyContext
          return (
            <GroupChatScene
              stepId={currentStep.id}
              characters={resolvedSceneChars}
              storyContext={groupContext}
              onComplete={handleChatComplete}
            />
          )
        }
        return (
          <SceneChat
            stepId={currentStep.id}
            characters={resolvedSceneChars}
            minCharactersTalkedTo={currentStep.minCharactersTalkedTo ?? 1}
            storyContext={storyContext}
            chatImagePrompt={currentStep.chatImagePrompt}
            onComplete={handleChatComplete}
          />
        )
      }

      case 'beat':
        return (
          <BeatContent
            step={currentStep}
            isFirstBeat={isFirstBeat}
            openingDisplayed={openingDisplayed}
            openingDone={openingDone}
            streamDisplayed={streamDisplayed}
            isTyping={isTyping}
            isStreaming={isStreaming}
            isGeneratingScene={isGeneratingScene}
            hasChosenBeat={hasChosenBeat}
            beatProse={beatProse}
            onContinue={handleAdvance}
            playerName={activeCharacter?.name ?? null}
            playerAvatar={selfieUrl}
          />
        )

      default:
        return null
    }
  }

  const isFullScreenStep = currentStep.type === 'chat' || currentStep.type === 'scene' || currentStep.type === 'choice'

  return (
    <div className="bg-bg min-h-screen">
      {/* MOBILE */}
      <div className="md:hidden relative min-h-screen flex flex-col">
        {!isFullScreenStep && (
          <>
            {currentImages.length > 0 ? (
              <SceneCarousel images={currentImages} stepId={currentStep?.id ?? ''} />
            ) : (
              <SceneFallbackGradient stepId={currentStep?.id} />
            )}
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(13,10,18,0) 0%, rgba(13,10,18,0.4) 45%, rgba(13,10,18,0.95) 65%, rgba(13,10,18,1) 100%)' }} />
          </>
        )}

        <AnimatePresence>
          {isGeneratingScene && (
            <motion.div className="absolute inset-0 z-30 flex flex-col items-center justify-center" style={{ background: 'rgba(13,10,18,0.85)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <TheatricalLoader title={currentStep.title ?? 'Scene'} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative z-10 flex items-center justify-between px-4 pt-10 pb-3 safe-top">
          <button onClick={() => setSheetOpen(true)} className="text-textSecondary hover:text-textPrimary transition-colors"><Menu size={22} /></button>
          <ProgressBar current={currentBeatNum} total={totalBeats} />
          <div className="flex items-center gap-2">
            <AudioToggle />
            {selfieUrl && (
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 shrink-0" style={{ borderColor: '#c84b9e' }}>
                <img src={selfieUrl} alt="You" className="w-full h-full object-cover" />
              </div>
            )}
            <GemCounter />
          </div>
        </div>

        {isFullScreenStep ? (
          <div className="relative z-10 flex-1 flex flex-col" style={{ background: '#0d0a12' }}>{renderStepContent()}</div>
        ) : (
          <div className="relative z-10 mt-auto px-5 pb-6 safe-bottom flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-textMuted text-xs">Chapter 1 — {currentStep.title}</p>
              <TrustIndicator trust={characterState.junhoTrust} label={trustStatusLabel} />
            </div>
            {renderStepContent()}
          </div>
        )}

        <YourStorySheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
      </div>

      {/* DESKTOP */}
      <div className="hidden md:flex min-h-screen">
        <div className="page-container flex w-full mx-auto">
          <aside className="w-[260px] shrink-0 flex flex-col border-r border-border sticky top-0 h-screen overflow-y-auto" style={{ background: '#0f0c18' }}>
            <div className="flex items-center gap-2 px-5 pt-6 pb-4 border-b border-border cursor-pointer" onClick={() => navigate('/home')}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #c84b9e 0%, #8b5cf6 100%)' }}>
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-textPrimary font-semibold">chaptr</span>
            </div>
            <YourStorySidebar />
          </aside>

          <div className="flex-1 flex flex-col h-screen overflow-hidden">
            {!isFullScreenStep && (
              <div className="relative flex-none" style={{ height: '45vh' }}>
                {currentImages.length > 0 ? (
                  <SceneCarousel images={currentImages} stepId={currentStep?.id ?? ''} />
                ) : (
                  <SceneFallbackGradient stepId={currentStep?.id} />
                )}
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(13,10,18,0.25) 0%, rgba(13,10,18,0) 35%, rgba(13,10,18,0.9) 85%, rgba(13,10,18,1) 100%)' }} />
                <AnimatePresence>
                  {isGeneratingScene && (
                    <motion.div className="absolute inset-0 z-30 flex flex-col items-center justify-center" style={{ background: 'rgba(13,10,18,0.85)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <TheatricalLoader title={currentStep.title ?? 'Scene'} />
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-8 pt-5">
                  <p className="text-textMuted text-xs uppercase tracking-widest">Chapter 1 — {currentStep.title}</p>
                  <ProgressBar current={currentBeatNum} total={totalBeats} />
                  <div className="flex items-center gap-3">
                    <AudioToggle />
                    {selfieUrl && <div className="w-8 h-8 rounded-full overflow-hidden border-2 shrink-0" style={{ borderColor: '#c84b9e' }}><img src={selfieUrl} alt="You" className="w-full h-full object-cover" /></div>}
                    <GemCounter />
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto" style={{ background: '#0d0b12' }}>
              {isFullScreenStep ? (
                <div className="mx-auto w-full max-w-[680px] h-full flex flex-col">{renderStepContent()}</div>
              ) : (
                <div className="mx-auto w-full max-w-[680px] px-8 pt-6 pb-10 flex flex-col gap-5">
                  <div className="flex items-center justify-between">
                    <TrustIndicator trust={characterState.junhoTrust} label={trustStatusLabel} />
                    <p className="text-textMuted text-xs">{currentBeatNum}/{totalBeats}</p>
                  </div>
                  {renderStepContent()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Character ping notifications */}
      {activePing && (
        <PingNotification
          ping={activePing}
          onDismiss={() => setActivePing(null)}
        />
      )}

      {/* Quest unlock toast */}
      <AnimatePresence>
        {questToast && (
          <QuestUnlockToast
            quest={questToast}
            onDismiss={() => setQuestToast(null)}
          />
        )}
      </AnimatePresence>

      {/* Share moment toast after choice */}
      <AnimatePresence>
        {shareMoment && (
          <ShareMomentToast
            optionLabel={shareMoment.label}
            universeName={shareMoment.universe}
            onDismiss={() => setShareMoment(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Sub-components ───

interface BeatContentProps {
  step: StoryStep
  isFirstBeat: boolean
  openingDisplayed: string
  openingDone: boolean
  streamDisplayed: string
  isTyping: boolean
  isStreaming: boolean
  isGeneratingScene: boolean
  hasChosenBeat: boolean
  beatProse: string
  onContinue: () => void
  playerName: string | null
  playerAvatar: string | null
}

function BeatContent({ step: _step, isFirstBeat, openingDisplayed, openingDone, streamDisplayed, isTyping, isStreaming, isGeneratingScene, hasChosenBeat, beatProse, onContinue, playerName, playerAvatar }: BeatContentProps) {
  const proseText = streamDisplayed || beatProse
  return (
    <div className="space-y-4">
      {/* Player character card */}
      {(playerAvatar || playerName) && (
        <motion.div
          className="flex items-center gap-3 py-2"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          {playerAvatar && (
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 shrink-0" style={{ borderColor: '#c84b9e' }}>
              <img src={playerAvatar} alt={playerName ?? 'You'} className="w-full h-full object-cover" />
            </div>
          )}
          <div>
            <p className="text-textPrimary text-sm font-semibold">{playerName ?? 'You'}</p>
            <p className="text-textMuted text-xs">Main character</p>
          </div>
        </motion.div>
      )}
      <div className="space-y-3 min-h-[80px]">
        {isFirstBeat ? (
          <p className="text-textPrimary text-base lg:text-lg leading-relaxed whitespace-pre-line">
            {openingDisplayed}
            {!openingDone && <span className="cursor-blink text-accent">|</span>}
          </p>
        ) : proseText ? (
          <p className="text-textPrimary text-base lg:text-lg leading-relaxed whitespace-pre-line">
            {proseText}
            {isTyping && <span className="cursor-blink text-accent">|</span>}
          </p>
        ) : null}
      </div>
      {isStreaming && !proseText && !isGeneratingScene && (
        <div className="space-y-2">
          <div className="skeleton h-3 w-full" />
          <div className="skeleton h-3 w-4/5" />
          <div className="skeleton h-3 w-3/4" />
        </div>
      )}
      {((isFirstBeat && openingDone) || (hasChosenBeat && !isTyping && !isStreaming)) && (
        <motion.button className="choice-btn justify-center" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} onClick={onContinue}>
          Continue →
        </motion.button>
      )}
    </div>
  )
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  const p = total > 0 ? (current / total) * 100 : 0
  return (
    <div className="flex-1 max-w-[200px] mx-4">
      <div className="h-0.5 rounded-full bg-border overflow-hidden">
        <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #c84b9e 0%, #8b5cf6 100%)' }} initial={{ width: 0 }} animate={{ width: `${p}%` }} transition={{ duration: 0.4 }} />
      </div>
    </div>
  )
}

const LOADING_PHRASES = ['setting the scene...', 'painting your world...', 'the story is unfolding...', 'almost there...']

function TheatricalLoader({ title }: { title: string }) {
  const [phraseIndex, setPhraseIndex] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => setPhraseIndex((i) => Math.min(i + 1, LOADING_PHRASES.length - 1)), 2500)
    return () => clearInterval(interval)
  }, [])
  return (
    <div className="flex flex-col items-center gap-5 text-center px-6">
      <motion.div className="w-14 h-14 rounded-full border-2 border-transparent border-t-accent" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
      <motion.p className="text-textPrimary font-semibold text-sm tracking-[3px] uppercase" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Building Your World</motion.p>
      <AnimatePresence mode="wait">
        <motion.p key={phraseIndex} className="text-textSecondary text-sm" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3 }}>
          {LOADING_PHRASES[phraseIndex]}
        </motion.p>
      </AnimatePresence>
      <div className="w-48 h-1 rounded-full bg-border overflow-hidden">
        <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #c84b9e 0%, #8b5cf6 100%)' }} initial={{ width: '5%' }} animate={{ width: '90%' }} transition={{ duration: 15, ease: 'easeOut' }} />
      </div>
      <p className="text-textMuted text-xs mt-1">{title}</p>
    </div>
  )
}

function SceneCarousel({ images, stepId }: { images: string[]; stepId: string }) {
  const [index, setIndex] = useState(0)

  useEffect(() => { setIndex(0) }, [stepId])

  useEffect(() => {
    if (images.length <= 1) return
    const timer = setInterval(() => setIndex((i) => (i + 1) % images.length), 2500)
    return () => clearInterval(timer)
  }, [images.length, stepId])

  return (
    <div className="absolute inset-0">
      <AnimatePresence mode="sync">
        <motion.div
          key={`${stepId}-${index}`}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${images[index]})`, backgroundColor: '#1a1525' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
        />
      </AnimatePresence>

      {images.length > 1 && (
        <>
          <button
            className="absolute left-0 top-0 w-1/2 h-2/3 z-10 cursor-pointer"
            style={{ background: 'transparent' }}
            onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
            aria-label="Previous image"
          />
          <button
            className="absolute right-0 top-0 w-1/2 h-2/3 z-10 cursor-pointer"
            style={{ background: 'transparent' }}
            onClick={() => setIndex((i) => (i + 1) % images.length)}
            aria-label="Next image"
          />
          <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center gap-1.5 pointer-events-none">
            {images.map((_, i) => (
              <button
                key={i}
                className={`rounded-full transition-all duration-300 pointer-events-auto ${
                  i === index ? 'w-3 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40'
                }`}
                onClick={(e) => { e.stopPropagation(); setIndex(i) }}
                aria-label={`Image ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

const FALLBACK_GRADIENTS: Record<string, string> = {
  'beat-1': 'radial-gradient(ellipse at 50% 30%, rgba(200,75,158,0.15) 0%, rgba(13,10,18,1) 70%)',
  'beat-2': 'radial-gradient(ellipse at 30% 40%, rgba(139,92,246,0.15) 0%, rgba(13,10,18,1) 70%)',
  'beat-3a': 'radial-gradient(ellipse at 60% 35%, rgba(200,75,158,0.12) 0%, rgba(13,10,18,1) 70%)',
  'beat-3b': 'radial-gradient(ellipse at 40% 50%, rgba(99,102,241,0.15) 0%, rgba(13,10,18,1) 70%)',
  'ending-approach-confront': 'radial-gradient(ellipse at 50% 40%, rgba(220,50,80,0.15) 0%, rgba(13,10,18,1) 70%)',
  'ending-approach-stay': 'radial-gradient(ellipse at 50% 40%, rgba(255,170,100,0.12) 0%, rgba(13,10,18,1) 70%)',
  'ending-follow-trust': 'radial-gradient(ellipse at 50% 40%, rgba(167,139,250,0.15) 0%, rgba(13,10,18,1) 70%)',
  'ending-follow-deflect': 'radial-gradient(ellipse at 50% 40%, rgba(100,130,200,0.15) 0%, rgba(13,10,18,1) 70%)',
}

function SceneFallbackGradient({ stepId }: { stepId?: string }) {
  const gradient = FALLBACK_GRADIENTS[stepId ?? ''] ?? FALLBACK_GRADIENTS['beat-1']
  return <div className="absolute inset-0 pointer-events-none" style={{ background: gradient }} />
}

function TrustIndicator({ trust, label }: { trust: number; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span style={{ color: '#c84b9e', fontSize: 11 }}>♥</span>
      <div className="w-14 h-1 rounded-full bg-border overflow-hidden">
        <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #c84b9e 0%, #E879F9 100%)' }} animate={{ width: `${trust}%` }} transition={{ duration: 0.6, ease: 'easeOut' }} />
      </div>
      <span className="text-textMuted text-[10px] whitespace-nowrap italic">{label}</span>
    </div>
  )
}
