import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Camera, Upload, Shield, ChevronLeft } from 'lucide-react'
import { useStore } from '../store/useStore'

export function UploadPage() {
  const navigate = useNavigate()
  const setSelfieUrl = useStore((s) => s.setSelfieUrl)
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleConfirm = () => {
    if (preview) setSelfieUrl(preview)
    navigate('/universes')
  }

  const handleSkip = () => {
    setSelfieUrl(null)
    navigate('/universes')
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <div className="page-container flex flex-col flex-1 max-w-[480px] mx-auto w-full px-6">
        {/* Nav */}
        <div className="flex items-center justify-between pt-12 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #c84b9e 0%, #8b5cf6 100%)' }}>
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-textPrimary font-semibold">chaptr</span>
          </div>
          <span className="text-textSecondary text-sm">Step 1 of 3</span>
        </div>

        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-textSecondary text-sm mt-4 mb-6 hover:text-textPrimary transition-colors w-fit">
          <ChevronLeft size={16} />
          Back
        </button>

        {/* Heading */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-textPrimary font-bold text-3xl mb-2">Add Your Photo</h1>
          <p className="text-textSecondary text-base mb-8">Your face becomes the main character in every scene.</p>
        </motion.div>

        {/* Upload zone */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative rounded-2xl overflow-hidden mb-4 cursor-pointer"
          style={{
            border: `2px dashed ${dragging ? '#c84b9e' : '#2a2040'}`,
            background: '#13101c',
            transition: 'border-color 0.2s',
          }}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
        >
          {preview ? (
            <div className="relative">
              <img src={preview} alt="Your selfie" className="w-full h-64 object-cover" />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <p className="text-white text-sm font-medium">Click to change</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-6">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: 'rgba(200,75,158,0.12)', border: '1px solid rgba(200,75,158,0.3)' }}>
                <Camera size={24} className="text-accent" />
              </div>
              <p className="text-textPrimary font-medium mb-1">Upload your photo</p>
              <p className="text-textMuted text-sm mb-4">JPG or PNG · Max 5MB</p>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-textPrimary transition-colors"
                style={{ background: '#2a2040', border: '1px solid #3a3058' }}
                onClick={(e) => { e.stopPropagation(); fileRef.current?.click() }}
              >
                <Upload size={14} />
                Choose photo
              </button>
            </div>
          )}
        </motion.div>

        {/* Privacy note */}
        <motion.div
          className="flex items-start gap-2 px-3 py-3 rounded-xl mb-8"
          style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Shield size={14} className="text-gem shrink-0 mt-0.5" />
          <p className="text-textSecondary text-xs">Your photo is never stored beyond your session.</p>
        </motion.div>

        {/* Hidden input */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />

        {/* CTA */}
        <motion.div
          className="mt-auto space-y-3 pb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <button
            className="btn-accent"
            onClick={handleConfirm}
            disabled={!preview}
            style={{ opacity: preview ? 1 : 0.5, cursor: preview ? 'pointer' : 'not-allowed' }}
          >
            Use This Photo
          </button>
          <button
            className="w-full py-3 text-textSecondary text-sm hover:text-textPrimary transition-colors"
            onClick={handleSkip}
          >
            Skip for now
          </button>
        </motion.div>
      </div>
    </div>
  )
}
