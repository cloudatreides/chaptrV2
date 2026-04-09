import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Bug, Lightbulb, ImagePlus, Trash2, Send } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

type FeedbackType = 'bug' | 'feature'

interface FeedbackModalProps {
  open: boolean
  onClose: () => void
}

export function FeedbackModal({ open, onClose }: FeedbackModalProps) {
  const { user } = useAuth()
  const [type, setType] = useState<FeedbackType>('bug')
  const [message, setMessage] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function reset() {
    setMessage('')
    setImageFile(null)
    setImagePreview(null)
    setSubmitting(false)
    setSubmitted(false)
    setType('bug')
  }

  function handleClose() {
    reset()
    onClose()
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  function removeImage() {
    setImageFile(null)
    setImagePreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleSubmit() {
    if (!message.trim()) return
    setSubmitting(true)

    try {
      let imageUrl: string | null = null

      // Upload screenshot if present
      if (imageFile) {
        const ext = imageFile.name.split('.').pop() || 'png'
        const path = `feedback/${crypto.randomUUID()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('profile-avatars')
          .upload(path, imageFile, { contentType: imageFile.type, upsert: false })
        if (!uploadError) {
          const { data } = supabase.storage.from('profile-avatars').getPublicUrl(path)
          imageUrl = data.publicUrl
        }
      }

      await supabase.from('feedback').insert({
        user_id: user?.id ?? null,
        type,
        message: message.trim(),
        image_url: imageUrl,
        page_url: window.location.href,
        user_agent: navigator.userAgent,
      })

      setSubmitted(true)
      setTimeout(handleClose, 1200)
    } catch {
      // Still close on error — don't block the user
      handleClose()
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center px-5 pointer-events-none"
          >
            <div
              className="relative w-full max-w-sm rounded-2xl border border-[#3d3060] p-6 pointer-events-auto shadow-2xl"
              style={{
                background: '#1e1832',
              }}
            >
              {/* Close */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-textMuted hover:text-textSecondary transition-colors"
              >
                <X size={18} />
              </button>

              {/* Success state */}
              {submitted ? (
                <div className="flex flex-col items-center gap-3 py-6">
                  <div className="text-2xl">✓</div>
                  <p className="text-textPrimary font-medium">Thanks for the feedback!</p>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  <h2 className="text-textPrimary font-semibold text-lg">Send Feedback</h2>

                  {/* Type toggle */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setType('bug')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        type === 'bug'
                          ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                          : 'bg-surfaceAlt text-textSecondary border border-border/50 hover:border-border'
                      }`}
                    >
                      <Bug size={16} />
                      Bug Report
                    </button>
                    <button
                      onClick={() => setType('feature')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        type === 'feature'
                          ? 'bg-gem/15 text-gem border border-gem/30'
                          : 'bg-surfaceAlt text-textSecondary border border-border/50 hover:border-border'
                      }`}
                    >
                      <Lightbulb size={16} />
                      Feature Idea
                    </button>
                  </div>

                  {/* Message */}
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={
                      type === 'bug'
                        ? 'What went wrong? What were you doing when it happened?'
                        : 'What would make Chaptr better for you?'
                    }
                    rows={4}
                    className="w-full bg-[#13101c] rounded-xl p-3 text-textPrimary text-sm border border-[#3d3060] focus:border-accent/60 focus:outline-none resize-none placeholder:text-textMuted/70"
                  />

                  {/* Image upload — bugs only */}
                  {type === 'bug' && (
                    <div>
                      {imagePreview ? (
                        <div className="relative inline-block">
                          <img
                            src={imagePreview}
                            alt="Screenshot"
                            className="h-20 rounded-lg border border-border/50 object-cover"
                          />
                          <button
                            onClick={removeImage}
                            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center"
                          >
                            <Trash2 size={10} className="text-white" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => fileRef.current?.click()}
                          className="flex items-center gap-2 text-textMuted text-sm hover:text-textSecondary transition-colors"
                        >
                          <ImagePlus size={16} />
                          Attach screenshot (optional)
                        </button>
                      )}
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    onClick={handleSubmit}
                    disabled={!message.trim() || submitting}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      background: message.trim() && !submitting
                        ? 'linear-gradient(135deg, #c84b9e 0%, #8b5cf6 100%)'
                        : 'rgba(42, 32, 64, 0.8)',
                      color: message.trim() ? '#f0ecf8' : '#6b5f8a',
                    }}
                  >
                    <Send size={14} />
                    {submitting ? 'Sending...' : 'Send Feedback'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
