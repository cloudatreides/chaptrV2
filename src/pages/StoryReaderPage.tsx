import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { STORY_STEPS, getActiveSteps, getTotalBeats, getCurrentBeatNumber } from '../data/storyData'
import { GemCounter } from '../components/GemCounter'
import { ChoicePoint } from '../components/ChoicePoint'
import { ChatScene } from '../components/ChatScene'
import { YourStorySheet } from '../components/YourStorySheet'
import { YourStorySidebar } from '../components/YourStorySidebar'
import { streamBeatProse, extractTrustData } from '../lib/claudeStream'
import { generateSceneImage } from '../lib/togetherAi'
import { useStreamingTypewriter, useTypewriter } from '../hooks/useTypewriter'

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY ?? ''

export function StoryReaderPage() {
  const navigate = useNavigate()
  const {
    currentStepIndex, advanceStep,
    branchChoices, setBranchChoice,
    choiceDescriptions, addChoiceDescription,
    characterState, updateTrust,
    setTrustStatusLabel,
    selfieUrl, bio,
    isStreaming, setIsStreaming,
    isGeneratingScene, setIsGeneratingScene,
    sceneImages, setSceneImage,
  } = useStore()
  const summariesList = useStore.getState().getSummariesList()

  const [sheetOpen, setSheetOpen] = useState(false)

  // Compute active steps based on branch choices
  const activeSteps = getActiveSteps(branchChoices)
  const currentStep = activeSteps[currentStepIndex]
  const totalBeats = getTotalBeats(activeSteps)
  const currentBeatNum = currentStep?.type === 'beat' ? getCurrentBeatNumber(activeSteps, currentStepIndex) : 0

  // Beat-specific state
  const [beatProse, setBeatProse] = useState('')
  const [hasChosenBeat, setHasChosenBeat] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  // Scene image for current step — prefer AI-generated, then static, then gradient fallback
  const currentImage = sceneImages[currentStep?.id] ?? currentStep?.staticImage ?? null

  // Typewriter for opening prose (beat-1 only)
  const isFirstBeat = currentStep?.id === 'beat-1'
  const { displayed: openingDisplayed, done: openingDone } = useTypewriter(
    isFirstBeat ? (currentStep?.openingProse ?? '') : '',
    20,
  )

  // Streaming typewriter for AI-generated prose
  const { displayed: streamDisplayed, isTyping, append, finish, reset: resetStream } = useStreamingTypewriter(18)

  // Reset state when step changes
  useEffect(() => {
    setBeatProse('')
    setHasChosenBeat(false)
    resetStream()
    setIsStreaming(false)
    setIsGeneratingScene(false)

    // Generate scene image for beat steps
    if (currentStep?.type === 'beat' && currentStep.sceneImagePrompt && !sceneImages[currentStep.id]) {
      generateSceneImage({ prompt: currentStep.sceneImagePrompt }).then((url) => {
        if (url) setSceneImage(currentStep.id, url)
      })
    }
  }, [currentStepIndex])

  // Navigate to reveal when we hit the reveal step
  useEffect(() => {
    if (currentStep?.type === 'reveal') {
      navigate('/reveal')
    }
  }, [currentStep])

  // ── Beat: generate AI prose ──
  const handleGenerateBeat = async () => {
    if (!currentStep || currentStep.type !== 'beat' || hasChosenBeat) return

    // For beat-1 with static opening, just show choices. For other beats, generate prose.
    if (isFirstBeat) {
      // Opening prose is handled by typewriter, wait for it, then show continue
      return
    }

    setIsGeneratingScene(true)
    await new Promise((r) => setTimeout(r, 600))
    setIsGeneratingScene(false)
    setIsStreaming(true)
    resetStream()

    if (!API_KEY) {
      const fallback = 'The moment stretches between you like a held breath. Something has shifted — you can feel it in the way the air hums.\n\nNeither of you looks away.'
      append(fallback)
      finish()
      setBeatProse(fallback)
      setIsStreaming(false)
      setHasChosenBeat(true)
      return
    }

    abortRef.current = new AbortController()
    try {
      let fullProse = ''
      const gen = streamBeatProse({
        beatTitle: currentStep.title ?? 'Scene',
        arcBrief: currentStep.arcBrief,
        choiceHistory: choiceDescriptions,
        chatSummaries: summariesList,
        characterState,
        bio,
        apiKey: API_KEY,
        signal: abortRef.current.signal,
      })

      for await (const chunk of gen) {
        append(chunk)
        fullProse += chunk
      }
      finish()

      // Extract trust data
      const { prose: cleanProse, trustDelta, statusLabel } = extractTrustData(fullProse)
      if (trustDelta !== 0) updateTrust(trustDelta)
      if (statusLabel) setTrustStatusLabel(statusLabel)

      if (cleanProse !== fullProse) {
        resetStream()
        append(cleanProse)
        finish()
      }

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

  // Auto-generate prose for non-first beats
  useEffect(() => {
    if (currentStep?.type === 'beat' && !isFirstBeat && !hasChosenBeat && !isStreaming) {
      handleGenerateBeat()
    }
  }, [currentStepIndex, currentStep?.id])

  const handleAdvance = () => {
    advanceStep()
  }

  // ── Choice Point handler ──
  const handleBranchChoice = (optionId: string) => {
    if (!currentStep || currentStep.type !== 'choice') return
    const option = currentStep.options?.find((o) => o.id === optionId)
    if (!option || !currentStep.choicePointId) return

    setBranchChoice(currentStep.choicePointId, optionId)
    addChoiceDescription({ label: option.label, description: option.description })

    // After setting branch choice, we need to recompute active steps and advance
    // The step index advances by 1 in the new filtered list
    setTimeout(() => advanceStep(), 300)
  }

  // ── Chat complete handler ──
  const handleChatComplete = () => {
    advanceStep()
  }

  if (!currentStep) return null

  // Build story context for chat scenes
  const storyContext = `Chapter 1: The Seoul Transfer. The protagonist is a transfer student at Seoul Arts Academy. ` +
    (choiceDescriptions.length > 0
      ? `Choices so far: ${choiceDescriptions.map((c) => c.label).join(', ')}. `
      : '') +
    (summariesList.length > 0
      ? `Previous conversations: ${summariesList.join(' ')}`
      : '')

  // ── Render based on step type ──
  const renderStepContent = () => {
    switch (currentStep.type) {
      case 'chat':
        return (
          <ChatScene
            stepId={currentStep.id}
            characterId={currentStep.characterId!}
            maxExchanges={currentStep.maxExchanges ?? 10}
            minExchanges={currentStep.minExchanges ?? 3}
            storyContext={storyContext}
            onComplete={handleChatComplete}
          />
        )

      case 'choice':
        return (
          <ChoicePoint
            title={currentStep.title ?? 'Choose'}
            options={currentStep.options ?? []}
            onSelect={handleBranchChoice}
          />
        )

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
          />
        )

      default:
        return null
    }
  }

  // For chat/choice steps, use a different layout
  const isFullScreenStep = currentStep.type === 'chat' || currentStep.type === 'choice'

  return (
    <div className="bg-bg min-h-screen">
      {/* ─── MOBILE ─── */}
      <div className="md:hidden relative min-h-screen flex flex-col">
        {/* Scene image or atmospheric gradient fallback */}
        {!isFullScreenStep && (
          <>
            {currentImage ? (
              <div
                className="absolute inset-0 bg-cover bg-top transition-all duration-700"
                style={{ backgroundImage: `url(${currentImage})`, backgroundColor: '#1a1525' }}
              />
            ) : (
              <SceneFallbackGradient stepId={currentStep?.id} />
            )}
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to bottom, rgba(13,10,18,0) 0%, rgba(13,10,18,0.4) 45%, rgba(13,10,18,0.95) 65%, rgba(13,10,18,1) 100%)' }}
            />
          </>
        )}

        {/* Loading overlay */}
        <AnimatePresence>
          {isGeneratingScene && (
            <motion.div
              className="absolute inset-0 z-30 flex flex-col items-center justify-center"
              style={{ background: 'rgba(13,10,18,0.85)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <TheatricalLoader title={currentStep.title ?? 'Scene'} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nav */}
        <div className="relative z-10 flex items-center justify-between px-4 pt-10 pb-3 safe-top">
          <button onClick={() => setSheetOpen(true)} className="text-textSecondary hover:text-textPrimary transition-colors">
            <Menu size={22} />
          </button>
          <ProgressBar current={currentBeatNum} total={totalBeats} />
          <div className="flex items-center gap-2">
            {selfieUrl && (
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 shrink-0" style={{ borderColor: '#c84b9e' }}>
                <img src={selfieUrl} alt="You" className="w-full h-full object-cover" />
              </div>
            )}
            <GemCounter />
          </div>
        </div>

        {/* Step content */}
        {isFullScreenStep ? (
          <div className="relative z-10 flex-1 flex flex-col" style={{ background: '#0d0a12' }}>
            {renderStepContent()}
          </div>
        ) : (
          <div className="relative z-10 mt-auto px-5 pb-6 safe-bottom flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-textMuted text-xs">Chapter 1 — {currentStep.title}</p>
              <TrustIndicator />
            </div>
            {renderStepContent()}
          </div>
        )}

        <YourStorySheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
      </div>

      {/* ─── DESKTOP ─── */}
      <div className="hidden md:flex min-h-screen">
        <div className="page-container flex w-full mx-auto">
          {/* Sidebar */}
          <aside
            className="w-[260px] shrink-0 flex flex-col border-r border-border sticky top-0 h-screen overflow-y-auto"
            style={{ background: '#0f0c18' }}
          >
            <div className="flex items-center gap-2 px-5 pt-6 pb-4 border-b border-border cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #c84b9e 0%, #8b5cf6 100%)' }}>
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-textPrimary font-semibold">chaptr</span>
            </div>
            <YourStorySidebar />
          </aside>

          {/* Main area */}
          <div className="flex-1 flex flex-col h-screen overflow-hidden">
            {/* Scene — top (only for beats) */}
            {!isFullScreenStep && (
              <div className="relative flex-none" style={{ height: '45vh' }}>
                {currentImage ? (
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-all duration-700"
                    style={{ backgroundImage: `url(${currentImage})`, backgroundColor: '#1a1525' }}
                  />
                ) : (
                  <SceneFallbackGradient stepId={currentStep?.id} />
                )}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(13,10,18,0.25) 0%, rgba(13,10,18,0) 35%, rgba(13,10,18,0.9) 85%, rgba(13,10,18,1) 100%)' }} />
                <AnimatePresence>
                  {isGeneratingScene && (
                    <motion.div className="absolute inset-0 z-30 flex flex-col items-center justify-center" style={{ background: 'rgba(13,10,18,0.85)' }}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <TheatricalLoader title={currentStep.title ?? 'Scene'} />
                    </motion.div>
                  )}
                </AnimatePresence>
                {/* Nav over scene */}
                <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-8 pt-5">
                  <p className="text-textMuted text-xs uppercase tracking-widest">Chapter 1 — {currentStep.title}</p>
                  <ProgressBar current={currentBeatNum} total={totalBeats} />
                  <div className="flex items-center gap-3">
                    {selfieUrl && <div className="w-8 h-8 rounded-full overflow-hidden border-2 shrink-0" style={{ borderColor: '#c84b9e' }}><img src={selfieUrl} alt="You" className="w-full h-full object-cover" /></div>}
                    <GemCounter />
                  </div>
                </div>
              </div>
            )}

            {/* Content area */}
            <div className="flex-1 overflow-y-auto" style={{ background: '#0d0b12' }}>
              {isFullScreenStep ? (
                <div className="mx-auto w-full max-w-[680px] h-full flex flex-col">
                  {renderStepContent()}
                </div>
              ) : (
                <div className="mx-auto w-full max-w-[680px] px-8 pt-6 pb-10 flex flex-col gap-5">
                  <div className="flex items-center justify-between">
                    <TrustIndicator />
                    <p className="text-textMuted text-xs">{currentBeatNum}/{totalBeats}</p>
                  </div>
                  {renderStepContent()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Beat content sub-component ───

interface BeatContentProps {
  step: typeof STORY_STEPS[0]
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
}

function BeatContent({
  step: _step, isFirstBeat,
  openingDisplayed, openingDone,
  streamDisplayed, isTyping, isStreaming, isGeneratingScene,
  hasChosenBeat, beatProse,
  onContinue,
}: BeatContentProps) {
  const proseText = streamDisplayed || beatProse

  return (
    <div className="space-y-4">
      {/* Prose */}
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

      {/* Skeleton while streaming */}
      {isStreaming && !proseText && !isGeneratingScene && (
        <div className="space-y-2">
          <div className="skeleton h-3 w-full" />
          <div className="skeleton h-3 w-4/5" />
          <div className="skeleton h-3 w-3/4" />
        </div>
      )}

      {/* Continue button */}
      {((isFirstBeat && openingDone) || (hasChosenBeat && !isTyping && !isStreaming)) && (
        <motion.button
          className="choice-btn justify-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={onContinue}
        >
          Continue →
        </motion.button>
      )}
    </div>
  )
}

// ─── Shared components ───

function ProgressBar({ current, total }: { current: number; total: number }) {
  const progress = total > 0 ? (current / total) * 100 : 0
  return (
    <div className="flex-1 max-w-[200px] mx-4">
      <div className="h-0.5 rounded-full bg-border overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #c84b9e 0%, #8b5cf6 100%)' }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
    </div>
  )
}

const LOADING_PHRASES = [
  'placing you in Seoul...',
  'setting the scene...',
  'the story is unfolding...',
  'your world is ready',
]

function TheatricalLoader({ title }: { title: string }) {
  const [phraseIndex, setPhraseIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((i) => Math.min(i + 1, LOADING_PHRASES.length - 1))
    }, 1800)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center gap-5 text-center px-6">
      <motion.div
        className="w-14 h-14 rounded-full border-2 border-transparent border-t-accent"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      <motion.p
        className="text-textPrimary font-semibold text-sm tracking-[3px] uppercase"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      >
        Building Your World
      </motion.p>
      <AnimatePresence mode="wait">
        <motion.p
          key={phraseIndex}
          className="text-textSecondary text-sm"
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3 }}
        >
          {LOADING_PHRASES[phraseIndex]}
        </motion.p>
      </AnimatePresence>
      <div className="w-48 h-1 rounded-full bg-border overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #c84b9e 0%, #8b5cf6 100%)' }}
          initial={{ width: '5%' }} animate={{ width: '90%' }}
          transition={{ duration: 6, ease: 'easeOut' }}
        />
      </div>
      <p className="text-textMuted text-xs mt-1">{title} — Seoul Arts Academy</p>
    </div>
  )
}

// Atmospheric gradient fallback when no scene image is available
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
  return (
    <div className="absolute inset-0" style={{ background: gradient }} />
  )
}

function TrustIndicator() {
  const trust = useStore((s) => s.characterState.junhoTrust)
  const label = useStore((s) => s.trustStatusLabel)
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-border overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #c84b9e 0%, #E879F9 100%)' }}
          animate={{ width: `${trust}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      <span className="text-textMuted text-[10px] whitespace-nowrap">{label}</span>
    </div>
  )
}
