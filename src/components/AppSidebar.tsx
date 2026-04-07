import { useLocation, useNavigate } from 'react-router-dom'
import { BookOpen, Users, Sparkles, Globe } from 'lucide-react'

const NAV_ITEMS = [
  { icon: BookOpen, label: 'My Story', path: '/home' },
  { icon: Users, label: 'Characters To Meet', path: '/cast' },
  { icon: Sparkles, label: 'Your Twins', path: '/characters' },
  { icon: Globe, label: 'Universes', path: '/universes' },
]

export function AppSidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div
      className="hidden md:flex flex-col shrink-0 h-screen sticky top-0"
      style={{ width: 260, background: '#0F0D14', borderRight: '1px solid #2D2538' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 h-[72px]">
        <div
          className="w-7 h-7 rounded-[6px]"
          style={{ background: 'linear-gradient(135deg, #E05263, #D4799A)' }}
        />
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
    </div>
  )
}
