import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, LogOut, User, Mail, Calendar, Shield } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useStore } from '../store/useStore'
import { supabase } from '../lib/supabase'
import { AppSidebar } from '../components/AppSidebar'

export function AccountPage() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const characters = useStore((s) => s.characters)
  const playthroughHistory = useStore((s) => s.playthroughHistory)
  const gemBalance = useStore((s) => s.gemBalance)

  const fullName = user?.user_metadata?.full_name ?? ''
  const email = user?.email ?? ''
  const avatarUrl = user?.user_metadata?.avatar_url ?? null
  const createdAt = user?.created_at ? new Date(user.created_at) : null
  const provider = user?.app_metadata?.provider ?? 'email'

  const [displayName, setDisplayName] = useState(fullName)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const nameChanged = displayName.trim() !== fullName

  const handleSaveName = async () => {
    if (!nameChanged || !displayName.trim()) return
    setSaving(true)
    setError(null)
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        data: { full_name: displayName.trim() },
      })
      if (updateError) throw updateError
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update name')
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const stats = {
    twins: characters.length,
    playthroughs: playthroughHistory.length,
    gems: gemBalance,
  }

  const content = (
    <div className="flex-1 min-h-screen overflow-y-auto" style={{ background: '#0d0b12' }}>
      <div className="w-full max-w-[600px] mx-auto px-5 md:px-8 py-8 md:py-12">
        {/* Mobile back button */}
        <button
          onClick={() => navigate('/home')}
          className="md:hidden flex items-center gap-2 text-white/50 text-sm mb-6 cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <h1
          className="text-2xl font-bold text-white mb-8"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          My Account
        </h1>

        {/* Avatar + Name */}
        <div className="flex items-center gap-4 mb-8">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover"
              style={{ border: '2px solid rgba(200,75,158,0.4)' }}
            />
          ) : (
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #c84b9e 0%, #8b5cf6 100%)' }}
            >
              <User size={28} className="text-white" />
            </div>
          )}
          <div>
            <p className="text-white font-semibold text-lg" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {fullName || 'Player'}
            </p>
            <p className="text-white/40 text-sm">{email}</p>
          </div>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-5">
          {/* Display Name */}
          <div className="rounded-xl p-5" style={{ background: '#161222', border: '1px solid #2D2538' }}>
            <label className="text-white/40 text-xs font-medium uppercase tracking-wider mb-2 block">
              Display Name
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="flex-1 bg-white/[0.04] rounded-lg px-4 py-2.5 text-white text-sm outline-none transition-colors"
                style={{
                  border: '1px solid rgba(255,255,255,0.08)',
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(200,75,158,0.4)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                placeholder="Your name"
              />
              {nameChanged && (
                <button
                  onClick={handleSaveName}
                  disabled={saving || !displayName.trim()}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium transition-opacity cursor-pointer disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #c84b9e 0%, #8b5cf6 100%)',
                    color: 'white',
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  {saving ? 'Saving...' : saved ? 'Saved' : 'Save'}
                </button>
              )}
            </div>
            {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
            {saved && <p className="text-green-400 text-xs mt-2">Name updated</p>}
          </div>

          {/* Email (read-only) */}
          <div className="rounded-xl p-5" style={{ background: '#161222', border: '1px solid #2D2538' }}>
            <label className="text-white/40 text-xs font-medium uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Mail size={12} />
              Email
            </label>
            <p className="text-white/70 text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {email}
            </p>
          </div>

          {/* Auth provider */}
          <div className="rounded-xl p-5" style={{ background: '#161222', border: '1px solid #2D2538' }}>
            <label className="text-white/40 text-xs font-medium uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Shield size={12} />
              Sign-in Method
            </label>
            <p className="text-white/70 text-sm capitalize" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {provider === 'google' ? 'Google' : provider}
            </p>
          </div>

          {/* Member since */}
          {createdAt && (
            <div className="rounded-xl p-5" style={{ background: '#161222', border: '1px solid #2D2538' }}>
              <label className="text-white/40 text-xs font-medium uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar size={12} />
                Member Since
              </label>
              <p className="text-white/70 text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {createdAt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="rounded-xl p-5" style={{ background: '#161222', border: '1px solid #2D2538' }}>
            <label className="text-white/40 text-xs font-medium uppercase tracking-wider mb-3 block">
              Your Stats
            </label>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-white font-bold text-xl" style={{ fontFamily: "'Syne', sans-serif" }}>
                  {stats.twins}
                </p>
                <p className="text-white/30 text-xs mt-0.5">Twins</p>
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-xl" style={{ fontFamily: "'Syne', sans-serif" }}>
                  {stats.playthroughs}
                </p>
                <p className="text-white/30 text-xs mt-0.5">Stories</p>
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-xl" style={{ fontFamily: "'Syne', sans-serif" }}>
                  {stats.gems}
                </p>
                <p className="text-white/30 text-xs mt-0.5">Gems</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="mt-8 w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-medium transition-colors cursor-pointer hover:bg-white/[0.06]"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid #2D2538',
            color: 'rgba(255,255,255,0.5)',
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </div>
  )

  return (
    <div className="bg-bg min-h-screen min-h-dvh">
      {/* Mobile */}
      <div className="md:hidden">{content}</div>

      {/* Desktop */}
      <div className="hidden md:flex min-h-screen">
        <AppSidebar />
        {content}
      </div>
    </div>
  )
}
