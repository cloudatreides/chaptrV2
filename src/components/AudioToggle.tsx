import { useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { ambientAudio } from '../lib/ambientAudio'

export function AudioToggle() {
  const [muted, setMuted] = useState(ambientAudio.isMuted)

  const toggle = () => {
    ambientAudio.unlock()
    const nowMuted = ambientAudio.toggleMute()
    setMuted(nowMuted)
    // If unmuting and no mood playing, start story mood
    if (!nowMuted && ambientAudio.currentMood === 'silent') {
      ambientAudio.setMood('story')
    }
  }

  return (
    <button
      onClick={toggle}
      className="w-8 h-8 rounded-full flex items-center justify-center text-textMuted hover:text-textPrimary transition-colors"
      style={{ background: 'rgba(200,75,158,0.1)' }}
      title={muted ? 'Unmute ambient audio' : 'Mute ambient audio'}
    >
      {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
    </button>
  )
}
