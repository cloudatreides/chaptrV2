import { useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Upload, Shield, ChevronLeft, RefreshCw } from 'lucide-react'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'
import { useStore } from '../store/useStore'
import { stylizeSelfie } from '../lib/togetherAi'
import { getCroppedImg } from '../lib/cropImage'

export function UploadPage() {
  const navigate = useNavigate()
  const setSelfieUrl = useStore((s) => s.setSelfieUrl)
  const fileRef = useRef<HTMLInputElement>(null)

  // Raw image from file picker (before crop)
  const [rawImage, setRawImage] = useState<string | null>(null)

  // Crop state
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  // Cropped/confirmed photo
  const [originalPhoto, setOriginalPhoto] = useState<string | null>(null)
  const [styledPhoto, setStyledPhoto] = useState<string | null>(null)
  const [isStylizing, setIsStylizing] = useState(false)
  const [stylizeFailed, setStylizeFailed] = useState(false)
  const [dragging, setDragging] = useState(false)

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels)
  }, [])

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      setRawImage(dataUrl)
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      setCroppedAreaPixels(null)
      // Reset any previous confirmed photo
      setOriginalPhoto(null)
      setStyledPhoto(null)
      setStylizeFailed(false)
    }
    reader.readAsDataURL(file)
  }

  const handleCropConfirm = async () => {
    if (!rawImage || !croppedAreaPixels) return
    const cropped = await getCroppedImg(rawImage, croppedAreaPixels)
    setOriginalPhoto(cropped)
    setRawImage(null) // exit crop mode

    // Auto-stylize
    setIsStylizing(true)
    const result = await stylizeSelfie(cropped)
    setIsStylizing(false)
    if (result) {
      setStyledPhoto(result)
    } else {
      setStylizeFailed(true)
    }
  }

  const handleRetry = async () => {
    if (!originalPhoto) return
    setStylizeFailed(false)
    setIsStylizing(true)
    const result = await stylizeSelfie(originalPhoto)
    setIsStylizing(false)
    if (result) {
      setStyledPhoto(result)
    } else {
      setStylizeFailed(true)
    }
  }

  const finalPhoto = styledPhoto ?? originalPhoto
  const hasPhoto = !!originalPhoto
  const isCropping = !!rawImage

  const handleConfirm = () => {
    if (finalPhoto) setSelfieUrl(finalPhoto)
    navigate('/story')
  }

  const handleSkip = () => {
    setSelfieUrl(null)
    navigate('/story')
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <div className="flex flex-col flex-1 w-full max-w-[520px] mx-auto px-6">
        {/* Nav */}
        <div className="flex items-center justify-between pt-12 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #c84b9e 0%, #8b5cf6 100%)' }}>
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-textPrimary font-semibold">chaptr</span>
          </div>
          <span className="text-textSecondary text-sm">Step 3 of 3</span>
        </div>

        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-textSecondary text-sm mt-4 mb-6 hover:text-textPrimary transition-colors w-fit">
          <ChevronLeft size={16} />
          Back
        </button>

        {/* Heading */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-textPrimary font-bold text-3xl mb-2">Add Your Photo</h1>
          <p className="text-textSecondary text-base mb-8">
            {isCropping ? 'Drag to reposition. Pinch or scroll to zoom.' : hasPhoto ? "We'll turn you into a story character." : 'Your face becomes the main character in every scene.'}
          </p>
        </motion.div>

        {/* Crop mode */}
        {isCropping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-4"
          >
            <div className="rounded-2xl overflow-hidden" style={{ background: '#13101c' }}>
              <div style={{ position: 'relative', width: '100%', height: 320 }}>
                <Cropper
                  image={rawImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>
            </div>

            {/* Zoom slider */}
            <div className="flex items-center gap-3 mt-3 px-1">
              <span className="text-textMuted text-xs">&minus;</span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 accent-accent h-1"
              />
              <span className="text-textMuted text-xs">+</span>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                className="flex-1 py-3 rounded-xl text-sm font-medium text-textPrimary"
                style={{ background: 'linear-gradient(90deg, #c84b9e 0%, #8b5cf6 100%)' }}
                onClick={handleCropConfirm}
              >
                Confirm crop
              </button>
              <button
                className="flex-1 py-3 rounded-xl text-sm font-medium text-textSecondary hover:text-textPrimary transition-colors"
                style={{ background: '#1a1525', border: '1px solid #2a2040' }}
                onClick={() => { setRawImage(null); setCrop({ x: 0, y: 0 }); setZoom(1) }}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {/* Upload / Preview zone (when NOT cropping) */}
        {!isCropping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative rounded-2xl overflow-hidden mb-4"
            style={{
              border: `2px dashed ${dragging ? '#c84b9e' : hasPhoto ? 'transparent' : '#2a2040'}`,
              background: '#13101c',
              transition: 'border-color 0.2s',
            }}
          >
            {hasPhoto ? (
              <div className="relative">
                <AnimatePresence mode="wait">
                  {isStylizing ? (
                    <motion.div
                      key="loading"
                      className="w-full h-72 flex flex-col items-center justify-center gap-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${originalPhoto})`, filter: 'blur(20px) brightness(0.4)', transform: 'scale(1.1)' }}
                      />
                      <div className="relative z-10 flex flex-col items-center gap-3">
                        <motion.div
                          className="w-10 h-10 rounded-full border-2 border-transparent border-t-accent"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        />
                        <p className="text-textPrimary text-sm font-medium">Creating your character...</p>
                        <p className="text-textMuted text-xs">Turning your photo into anime</p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.img
                      key={styledPhoto ? 'styled' : 'original'}
                      src={finalPhoto!}
                      alt="Your character"
                      className="w-full h-72 object-cover"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4 }}
                    />
                  )}
                </AnimatePresence>

                {styledPhoto && !isStylizing && (
                  <motion.div
                    className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{ background: 'rgba(200,75,158,0.9)', color: 'white' }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    Story version
                  </motion.div>
                )}
              </div>
            ) : (
              <div
                className="flex flex-col items-center justify-center py-12 px-6 cursor-pointer"
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
              >
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
        )}

        {/* Actions below preview */}
        {hasPhoto && !isStylizing && !isCropping && (
          <motion.div
            className="flex gap-2 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <button
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-textSecondary hover:text-textPrimary transition-colors"
              style={{ background: '#1a1525', border: '1px solid #2a2040' }}
              onClick={() => fileRef.current?.click()}
            >
              <Camera size={14} />
              Change photo
            </button>
            {stylizeFailed && (
              <button
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-textSecondary hover:text-textPrimary transition-colors"
                style={{ background: '#1a1525', border: '1px solid #2a2040' }}
                onClick={handleRetry}
              >
                <RefreshCw size={14} />
                Retry anime style
              </button>
            )}
          </motion.div>
        )}

        {/* Privacy note */}
        {!isCropping && (
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
        )}

        {/* Hidden input */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); if (e.target) e.target.value = '' }}
        />

        {/* CTA */}
        {!isCropping && (
          <motion.div
            className="mt-auto space-y-3 pb-8 safe-bottom"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <button
              className="btn-accent"
              onClick={handleConfirm}
              disabled={!hasPhoto || isStylizing}
              style={{ opacity: hasPhoto && !isStylizing ? 1 : 0.5, cursor: hasPhoto && !isStylizing ? 'pointer' : 'not-allowed' }}
            >
              {isStylizing ? 'Creating character...' : styledPhoto ? 'Enter as this character' : 'Use This Photo'}
            </button>
            <button
              className="w-full py-3 text-textSecondary text-sm hover:text-textPrimary transition-colors"
              onClick={handleSkip}
            >
              Skip for now
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
