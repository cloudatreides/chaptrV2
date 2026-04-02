import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, Sparkles } from 'lucide-react'
import { useStore } from '../store/useStore'
import { trackEvent } from '../lib/supabase'

const ARCHETYPES = [
  {
    id: 'quiet',
    label: 'The Quiet One',
    bio: "I'm the quiet type who actually listens. People tell me things they don't tell anyone else — maybe because I never rush them.",
  },
  {
    id: 'bold',
    label: 'The Bold One',
    bio: "I say what I think. Life's too short for small talk and polite smiles. If something matters, I go after it.",
  },
  {
    id: 'dreamer',
    label: 'The Dreamer',
    bio: "I notice things other people miss — the way light hits a window, the pause before someone lies. I live half in my head and I like it there.",
  },
]

const LOVE_INTERESTS = [
  {
    id: 'jiwon' as const,
    name: 'Jiwon',
    label: 'Lee Jiwon',
    desc: 'Lead vocalist of NOVA. Quietly intense, guarded, perceptive.',
    emoji: '🎤',
  },
  {
    id: 'yuna' as const,
    name: 'Yuna',
    label: 'Kang Yuna',
    desc: 'Lead vocalist of LUMINA. Sharp-witted, magnetic, guarded.',
    emoji: '🎵',
  },
]

export function BioPage() {
  const navigate = useNavigate()
  const selfieUrl = useStore((s) => s.selfieUrl)
  const setBio = useStore((s) => s.setBio)
  const setLoveInterest = useStore((s) => s.setLoveInterest)
  const [selected, setSelected] = useState<string | null>(null)
  const [custom, setCustom] = useState('')
  const [isCustom, setIsCustom] = useState(false)
  const [chosenInterest, setChosenInterest] = useState<'jiwon' | 'yuna' | null>(null)

  const canContinue = chosenInterest !== null && (isCustom ? custom.trim().length > 10 : selected !== null)

  const handleContinue = () => {
    if (chosenInterest) setLoveInterest(chosenInterest)

    if (isCustom) {
      setBio(custom.trim())
    } else {
      const archetype = ARCHETYPES.find((a) => a.id === selected)
      if (archetype) setBio(archetype.bio)
    }

    trackEvent('bio_complete', { type: isCustom ? 'custom' : selected, loveInterest: chosenInterest })

    if (selfieUrl) {
      navigate('/story')
    } else {
      navigate('/upload')
    }
  }

  return (
    <div className="min-h-screen min-h-dvh bg-bg flex flex-col">
      <div className="flex flex-col flex-1 w-full max-w-[520px] mx-auto px-5">
        {/* Nav */}
        <div className="flex items-center justify-between pt-12 pb-2">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #c84b9e 0%, #8b5cf6 100%)' }}>
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-textPrimary font-semibold">chaptr</span>
          </div>
        </div>

        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-textSecondary text-sm mt-4 mb-6 hover:text-textPrimary transition-colors w-fit">
          <ChevronLeft size={16} />
          Back
        </button>

        {/* Love interest picker */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-textPrimary font-bold text-3xl mb-1">Your Story</h1>
          <p className="text-textSecondary text-base mb-4">Who catches your eye at Seoul Arts Academy?</p>
          <div className="grid grid-cols-2 gap-3">
            {LOVE_INTERESTS.map((li) => (
              <button
                key={li.id}
                className="text-left p-4 rounded-xl transition-all"
                style={{
                  background: chosenInterest === li.id ? 'rgba(200,75,158,0.12)' : '#13101c',
                  border: chosenInterest === li.id ? '1px solid rgba(200,75,158,0.6)' : '1px solid #2a2040',
                }}
                onClick={() => setChosenInterest(li.id)}
              >
                <span className="text-2xl mb-2 block">{li.emoji}</span>
                <p className="text-textPrimary font-semibold text-sm">{li.label}</p>
                <p className="text-textMuted text-xs mt-1 leading-relaxed">{li.desc}</p>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Heading */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-textPrimary font-bold text-xl mb-1">Who Are You?</h2>
          <p className="text-textSecondary text-base mb-6">Pick a personality. It shapes how characters react to you.</p>
        </motion.div>

        {/* Archetype cards */}
        <div className="space-y-3 mb-4">
          {ARCHETYPES.map((arch, i) => (
            <motion.button
              key={arch.id}
              className="w-full text-left p-4 rounded-xl transition-all"
              style={{
                background: selected === arch.id && !isCustom ? 'rgba(200,75,158,0.12)' : '#13101c',
                border: selected === arch.id && !isCustom ? '1px solid rgba(200,75,158,0.6)' : '1px solid #2a2040',
              }}
              onClick={() => { setSelected(arch.id); setIsCustom(false) }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <p className="text-textPrimary font-semibold text-sm mb-1">{arch.label}</p>
              <p className="text-textSecondary text-sm leading-relaxed">{arch.bio}</p>
            </motion.button>
          ))}
        </div>

        {/* Custom option */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <button
            className="flex items-center gap-2 text-accent text-sm font-medium mb-3"
            onClick={() => setIsCustom(!isCustom)}
          >
            <Sparkles size={14} />
            {isCustom ? 'Pick a preset instead' : 'Write your own'}
          </button>

          {isCustom && (
            <motion.textarea
              className="w-full p-4 rounded-xl text-textPrimary text-sm leading-relaxed resize-none focus:outline-none"
              style={{ background: '#13101c', border: '1px solid #2a2040', minHeight: 100 }}
              placeholder="Describe your personality in a few sentences..."
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              maxLength={200}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            />
          )}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="mt-auto space-y-3 pb-8 safe-bottom"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <button
            className="btn-accent"
            onClick={handleContinue}
            disabled={!canContinue}
            style={{ opacity: canContinue ? 1 : 0.5, cursor: canContinue ? 'pointer' : 'not-allowed' }}
          >
            Continue
          </button>
          <button
            className="w-full py-3 text-textSecondary text-sm hover:text-textPrimary transition-colors"
            onClick={() => {
              setBio(null)
              if (selfieUrl) navigate('/story')
              else navigate('/upload')
            }}
          >
            Skip for now
          </button>
        </motion.div>
      </div>
    </div>
  )
}
