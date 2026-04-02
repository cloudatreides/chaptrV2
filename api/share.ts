import { createClient } from '@supabase/supabase-js'

export const config = { runtime: 'edge' }

const supabase = createClient(
  'https://iohaulmowogajkgezoms.supabase.co',
  process.env.SUPABASE_ANON_KEY!
)

/** Returns HTML with OG meta tags for social crawlers hitting /reveal/:id */
export default async function handler(req: Request) {
  const url = new URL(req.url)
  const id = url.searchParams.get('id')

  if (!id) {
    return Response.redirect(url.origin, 302)
  }

  const { data } = await supabase
    .from('chaptr_playthroughs')
    .select('reveal_signature, trust_score')
    .eq('id', id)
    .single()

  const signature = data?.reveal_signature ?? 'a story written in glances'
  const title = `"${signature}" — Chaptr`
  const description = `Someone's unique story with Jiwon. Trust: ${data?.trust_score ?? 50}/100. Write your own story at Chaptr.`
  const ogImage = `${url.origin}/api/og?id=${id}`
  const spaUrl = `${url.origin}/reveal/${id}`
  const canonical = `${url.origin}/s/${id}`

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${ogImage}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${ogImage}" />
  <meta http-equiv="refresh" content="0;url=${spaUrl}" />
</head>
<body>
  <p>Redirecting to <a href="${spaUrl}">your story</a>...</p>
</body>
</html>`

  return new Response(html, {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  })
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
