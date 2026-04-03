import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

const SERIF = "'Playfair Display', Georgia, serif"

export function TermsPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-dvh bg-bg px-6 py-12 max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-textMuted text-sm mb-8 hover:text-textSecondary transition-colors">
        <ArrowLeft size={16} /> Back
      </button>
      <h1 className="text-2xl font-bold text-textPrimary mb-2" style={{ fontFamily: SERIF }}>Terms of Service</h1>
      <p className="text-textMuted text-xs mb-8">Last updated: April 2026</p>
      <div className="flex flex-col gap-6 text-textSecondary text-sm leading-relaxed">
        <section>
          <h2 className="text-textPrimary font-semibold mb-2">1. Acceptance</h2>
          <p>By accessing or using Chaptr, you agree to be bound by these Terms. If you disagree, please do not use the service.</p>
        </section>
        <section>
          <h2 className="text-textPrimary font-semibold mb-2">2. Use of Service</h2>
          <p>Chaptr is an AI-powered interactive story experience. You must be 13 or older to use this service. You agree not to misuse the service or attempt to access it using methods other than the interface we provide.</p>
        </section>
        <section>
          <h2 className="text-textPrimary font-semibold mb-2">3. User Content</h2>
          <p>You retain ownership of any photos you upload. By uploading, you grant us a limited licence to process your image solely for the purpose of generating your in-story character. We do not store or share your photos beyond this use.</p>
        </section>
        <section>
          <h2 className="text-textPrimary font-semibold mb-2">4. AI-Generated Content</h2>
          <p>Story content, dialogue, and images are AI-generated and for entertainment purposes only. They do not represent real people, events, or endorsements.</p>
        </section>
        <section>
          <h2 className="text-textPrimary font-semibold mb-2">5. Changes</h2>
          <p>We may update these Terms at any time. Continued use of Chaptr after changes constitutes acceptance of the new Terms.</p>
        </section>
        <section>
          <h2 className="text-textPrimary font-semibold mb-2">6. Contact</h2>
          <p>Questions? Reach us at hello@chaptr.app</p>
        </section>
      </div>
    </div>
  )
}
