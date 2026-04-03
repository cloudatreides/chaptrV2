import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

const SERIF = "'Playfair Display', Georgia, serif"

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-textPrimary font-semibold text-base mb-3">{title}</h2>
      <div className="text-textSecondary text-sm leading-relaxed space-y-2">{children}</div>
    </div>
  )
}

export function PrivacyPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-dvh bg-bg">
      <div className="w-full max-w-[680px] mx-auto px-5 pb-16">
        <div className="pt-10 pb-6 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-textSecondary text-sm hover:text-textPrimary transition-colors"
          >
            <ChevronLeft size={16} />
            Back
          </button>
        </div>

        <h1 className="text-textPrimary font-bold text-3xl mb-1" style={{ fontFamily: SERIF }}>
          Privacy Policy
        </h1>
        <p className="text-textMuted text-sm mb-10">Last updated: April 2026</p>

        <Section title="1. What We Collect">
          <p>We collect the following information when you use Chaptr:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong className="text-textPrimary font-medium">Account data:</strong> Your Google account email and display name, provided via Google Sign-In.</li>
            <li><strong className="text-textPrimary font-medium">Story data:</strong> Choices you make, chat exchanges, and story progress — used to personalise your experience.</li>
            <li><strong className="text-textPrimary font-medium">Selfie (optional):</strong> If you upload a photo, it is processed by AI to create a stylised version. Only the stylised version is stored. Your original photo is never saved.</li>
            <li><strong className="text-textPrimary font-medium">Usage analytics:</strong> Anonymous events (e.g. "character created", "story started") to help us improve the product. No personally identifiable information is included.</li>
          </ul>
        </Section>

        <Section title="2. How We Use Your Data">
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>To provide and personalise the storytelling experience.</li>
            <li>To generate AI story scenes that incorporate your stylised photo.</li>
            <li>To save your story progress between sessions.</li>
            <li>To improve the product using aggregated, anonymised usage data.</li>
          </ul>
          <p>We do not sell your personal data. We do not use your data for advertising.</p>
        </Section>

        <Section title="3. Photo Processing">
          <p>When you upload a photo:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Your photo is sent to Together AI's image generation API to create a stylised anime-style portrait.</li>
            <li>The original photo is not stored on our servers at any point.</li>
            <li>The AI-generated stylised version is stored in Supabase Storage to personalise your story scenes.</li>
            <li>You can delete your account at any time, which removes all associated stored data including your stylised photo.</li>
          </ul>
        </Section>

        <Section title="4. Third-Party Services">
          <p>Chaptr uses the following third-party services to operate:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong className="text-textPrimary font-medium">Google OAuth</strong> — account authentication.</li>
            <li><strong className="text-textPrimary font-medium">Supabase</strong> — database, authentication, and file storage.</li>
            <li><strong className="text-textPrimary font-medium">Anthropic (Claude)</strong> — AI narrative and chat generation.</li>
            <li><strong className="text-textPrimary font-medium">Together AI (FLUX)</strong> — AI image generation.</li>
            <li><strong className="text-textPrimary font-medium">Vercel</strong> — hosting and edge function delivery.</li>
          </ul>
          <p>Each service operates under its own privacy policy. We share only the minimum data required for each service to function.</p>
        </Section>

        <Section title="5. Data Retention">
          <p>Your account data and story progress are retained while your account is active. You may request deletion at any time by contacting us. Upon deletion, all personal data, stored photos, and story history will be removed within 30 days.</p>
        </Section>

        <Section title="6. Cookies and Local Storage">
          <p>Chaptr uses browser local storage to save your story progress locally on your device. We do not use tracking cookies or third-party advertising cookies.</p>
        </Section>

        <Section title="7. Children's Privacy">
          <p>The Service is not directed at children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, please contact us and we will delete it promptly.</p>
        </Section>

        <Section title="8. Your Rights">
          <p>Depending on your location, you may have the right to access, correct, or delete your personal data. To exercise these rights, contact us through the app or at the email address associated with your account.</p>
        </Section>

        <Section title="9. Changes to This Policy">
          <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by updating the date at the top of this page. Continued use of the Service after changes constitutes acceptance.</p>
        </Section>

        <Section title="10. Contact">
          <p>For any privacy-related questions or requests, contact us through the app or at the email address associated with your Google account.</p>
        </Section>
      </div>
    </div>
  )
}
