import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const SERIF = "'Playfair Display', Georgia, serif"

export function LoginPage() {
  const { signInWithGoogle } = useAuth()

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center px-6"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(200,75,158,0.12) 0%, #0d0a12 60%)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex flex-col items-center gap-8 w-full max-w-sm"
      >
        {/* Logo / wordmark */}
        <div className="flex flex-col items-center gap-2">
          <div
            className="text-4xl font-bold tracking-tight text-textPrimary"
            style={{ fontFamily: SERIF }}
          >
            Chaptr
          </div>
          <p className="text-textSecondary text-sm text-center leading-relaxed">
            Your face. Your story.<br />Step into an AI-powered narrative.
          </p>
        </div>

        {/* Decorative divider */}
        <div className="w-full flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-textMuted text-xs">Begin your story</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Google sign-in button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl font-medium text-textPrimary text-sm transition-colors"
          style={{
            background: 'rgba(26, 21, 37, 0.9)',
            border: '1px solid rgba(167, 139, 250, 0.3)',
          }}
        >
          {/* Google icon */}
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.20455C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4"/>
            <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4205 9 14.4205C6.65591 14.4205 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853"/>
            <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957275C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
            <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </motion.button>

        <p className="text-textMuted text-xs text-center leading-relaxed">
          By continuing, you agree to our{' '}
          <Link to="/terms" className="underline hover:text-textSecondary transition-colors">Terms of Service</Link>
          {' '}and{' '}
          <Link to="/privacy" className="underline hover:text-textSecondary transition-colors">Privacy Policy</Link>.
        </p>
      </motion.div>
    </div>
  )
}
