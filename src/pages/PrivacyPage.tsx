import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

const SERIF = "'Playfair Display', Georgia, serif"

export function PrivacyPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-dvh bg-bg px-6 py-12 max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-textMuted text-sm mb-8 hover:text-textSecondary transition-colors">
        <ArrowLeft size={16} /> Back
      </button>
      <h1 className="text-2xl font-bold text-textPrimary mb-2" style={{ fontFamily: SERIF }}>Privacy Policy</h1>
      <p className="text-textMuted text-xs mb-8">Last updated: April 2026</p>
      <div className="flex flex-col gap-6 text-textSecondary text-sm leading-relaxed">
        <section>
          <h2 className="text-textPrimary font-semibold mb-2">1. What We Collect</h2>
          <p>We collect your Google account email and name when you sign in. If you upload a selfie, it is processed temporarily to generate your anime character and is not permanently stored on our servers.</p>
        </section>
        <section>
          <h2 className="text-textPrimary font-semibold mb-2">2. How We Use It</h2>
          <p>Your data is used solely to provide the Chaptr experience — personalising your story and saving your progress. We do not sell your data to third parties.</p>
        </section>
        <section>
          <h2 className="text-textPrimary font-semibold mb-2">3. Story Progress</h2>
          <p>Your story choices and progress are stored in your browser's local storage. We may also store anonymised analytics events (e.g. "story started") to improve the experience.</p>
        </section>
        <section>
          <h2 className="text-textPrimary font-semibold mb-2">4. Third-Party Services</h2>
          <p>We use Supabase (authentication), Together AI (image generation), and Anthropic (story generation). Each has their own privacy policy governing data they process.</p>
        </section>
        <section>
          <h2 className="text-textPrimary font-semibold mb-2">5. Your Rights</h2>
          <p>You can delete your account and associated data at any time by contacting us. We will action requests within 30 days.</p>
        </section>
        <section>
          <h2 className="text-textPrimary font-semibold mb-2">6. Contact</h2>
          <p>Privacy questions? Reach us at hello@chaptr.app</p>
        </section>
      </div>
    </div>
  )
}
