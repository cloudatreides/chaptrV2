import { ImageResponse } from '@vercel/og'
import { createClient } from '@supabase/supabase-js'

export const config = { runtime: 'nodejs' }

const supabase = createClient(
  'https://iohaulmowogajkgezoms.supabase.co',
  process.env.SUPABASE_ANON_KEY!
)

export default async function handler(req: Request) {
  const url = new URL(req.url)
  const id = url.searchParams.get('id')

  if (!id) {
    return new Response('Missing id', { status: 400 })
  }

  const { data } = await supabase
    .from('chaptr_playthroughs')
    .select('reveal_signature, trust_score, trust_label, selfie_url')
    .eq('id', id)
    .single()

  const signature = data?.reveal_signature ?? 'a story written in glances'
  const trustScore = data?.trust_score ?? 50
  const trustLabel = data?.trust_label ?? ''

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200',
          height: '630',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0d0a12 0%, #1a1025 50%, #0d0a12 100%)',
          fontFamily: 'Georgia, serif',
        }}
      >
        {/* Decorative accent line */}
        <div
          style={{
            width: '60px',
            height: '3px',
            background: 'linear-gradient(90deg, #c84b9e, #8b5cf6)',
            marginBottom: '32px',
            borderRadius: '2px',
          }}
        />

        {/* Label */}
        <div
          style={{
            color: '#6b5f8a',
            fontSize: '16px',
            letterSpacing: '4px',
            textTransform: 'uppercase',
            marginBottom: '24px',
            fontFamily: 'sans-serif',
          }}
        >
          Jiwon sees you as
        </div>

        {/* Signature */}
        <div
          style={{
            color: '#f0ecf8',
            fontSize: '48px',
            fontStyle: 'italic',
            textAlign: 'center',
            maxWidth: '900px',
            lineHeight: 1.3,
            marginBottom: '40px',
          }}
        >
          "{signature}"
        </div>

        {/* Trust bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              width: '120px',
              height: '8px',
              background: '#2a2438',
              borderRadius: '4px',
              overflow: 'hidden',
              display: 'flex',
            }}
          >
            <div
              style={{
                width: `${trustScore}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #c84b9e, #E879F9)',
                borderRadius: '4px',
              }}
            />
          </div>
          {trustLabel && (
            <div style={{ color: '#6b5f8a', fontSize: '14px', fontFamily: 'sans-serif' }}>
              {trustLabel}
            </div>
          )}
        </div>

        {/* Branding */}
        <div
          style={{
            color: '#9b8db8',
            fontSize: '18px',
            fontFamily: 'sans-serif',
            marginTop: '20px',
          }}
        >
          Chaptr — your story, your choices
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
