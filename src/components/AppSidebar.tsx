import { useLocation, useNavigate } from 'react-router-dom'
import { BookOpen, Users, Sparkles, Globe, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const NAV_ITEMS = [
  { icon: BookOpen, label: 'My Story', path: '/home' },
  { icon: Users, label: 'Characters To Meet', path: '/cast' },
  { icon: Sparkles, label: 'Your Twins', path: '/characters' },
  { icon: Globe, label: 'Universes', path: '/universes' },
]

export function AppSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { signOut } = useAuth()

  return (
    <div
      className="hidden md:flex flex-col shrink-0 h-screen sticky top-0"
      style={{ width: 260, background: '#0F0D14', borderRight: '1px solid #2D2538' }}
    >
      {/* Logo — matches landing page LogoMark */}
      <div className="flex items-center gap-2 px-6 h-[72px]">
        <div
          className="flex items-center justify-center shrink-0 relative"
          style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(225deg, #c84b9e 0%, #8b5cf6 100%)' }}
        >
          <span className="text-white font-bold" style={{ fontSize: 14, fontFamily: "'Space Grotesk', sans-serif" }}>C</span>
          <div className="absolute bg-white rounded-full" style={{ width: 5, height: 5, right: 2, bottom: 2, opacity: 0.9 }} />
        </div>
        <span className="text-white font-medium" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16 }}>
          chaptr
        </span>
      </div>

      {/* Divider */}
      <div className="w-full h-px" style={{ background: '#2D2538' }} />

      {/* Nav */}
      <nav className="flex flex-col gap-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path === '/cast' && location.pathname.startsWith('/cast'))
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="cursor-pointer flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors"
              style={{
                background: isActive ? 'rgba(200,75,158,0.08)' : 'transparent',
              }}
            >
              <item.icon
                size={18}
                style={{ color: isActive ? '#c84b9e' : 'rgba(255,255,255,0.33)' }}
              />
              <span
                className="text-[13px]"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.53)',
                }}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="mt-auto px-3 pb-5">
        <button
          onClick={() => signOut()}
          className="cursor-pointer flex items-center gap-2.5 rounded-lg px-3 py-2.5 w-full text-left transition-colors hover:bg-white/[0.03]"
        >
          <LogOut size={18} style={{ color: 'rgba(255,255,255,0.33)' }} />
          <span
            className="text-[13px]"
            style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500, color: 'rgba(255,255,255,0.53)' }}
          >
            Log out
          </span>
        </button>
      </div>
    </div>
  )
}
