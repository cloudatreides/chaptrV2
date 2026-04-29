import { rateLimit, rateLimitResponse, getClientIp } from './_rateLimit'

export const config = { runtime: 'edge' }

const MAX_REQUESTS_PER_MINUTE = 20

// Verified model IDs (matched against Gemini ListModels output, Apr 2026):
//   gemini-3.1-flash-image-preview  → "Nano Banana 2"
//   gemini-3-pro-image-preview      → "Nano Banana Pro"
//   gemini-2.5-flash-image          → "Nano Banana" (original)
const PRIMARY_CHAIN = [
  'gemini-3.1-flash-image-preview',
  'gemini-3-pro-image-preview',
  'gemini-2.5-flash-image',
]

interface RequestBody {
  prompt: string
  referenceImageUrls?: string[]
  model?: string
}

async function fetchAsBase64(url: string): Promise<{ data: string; mimeType: string } | null> {
  try {
    if (url.startsWith('data:')) {
      const match = url.match(/^data:([^;]+);base64,(.+)$/)
      if (match) return { mimeType: match[1], data: match[2] }
      return null
    }
    const r = await fetch(url)
    if (!r.ok) return null
    const buf = await r.arrayBuffer()
    const bytes = new Uint8Array(buf)
    let bin = ''
    for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i])
    const data = btoa(bin)
    const mimeType = r.headers.get('content-type') || 'image/png'
    return { data, mimeType: mimeType.split(';')[0] }
  } catch {
    return null
  }
}

async function callGemini(model: string, prompt: string, refs: { data: string; mimeType: string }[], apiKey: string) {
  const parts: Array<{ text?: string; inline_data?: { mime_type: string; data: string } }> = [{ text: prompt }]
  for (const ref of refs) parts.push({ inline_data: { mime_type: ref.mimeType, data: ref.data } })

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
    }),
  })
}

export default async function handler(req: Request) {
  const url = new URL(req.url)
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'GEMINI_API_KEY not configured' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }

  // Debug: GET /api/nano-banana?action=list lists all models the key can see
  if (req.method === 'GET' && url.searchParams.get('action') === 'list') {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
    const text = await r.text()
    return new Response(text, {
      status: r.status,
      headers: { 'content-type': 'application/json' },
    })
  }

  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  const ip = getClientIp(req)
  if (!rateLimit(ip, MAX_REQUESTS_PER_MINUTE)) return rateLimitResponse()

  try {
    const body = (await req.json()) as RequestBody
    const { prompt, referenceImageUrls = [], model } = body
    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Missing prompt' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      })
    }

    const refs = (await Promise.all(referenceImageUrls.map((u) => fetchAsBase64(u))))
      .filter((r): r is { data: string; mimeType: string } => r !== null)

    const chain = model ? [model] : PRIMARY_CHAIN
    const errors: { model: string; status: number; message: string }[] = []
    let lastResponse: Response | null = null
    let modelUsed = ''

    for (const m of chain) {
      const r = await callGemini(m, prompt, refs, apiKey)
      if (r.ok) {
        lastResponse = r
        modelUsed = m
        break
      }
      const errText = await r.text().catch(() => '')
      errors.push({ model: m, status: r.status, message: errText.slice(0, 200) })
      // Only walk the chain on 404/403/400 (model unavailable). On 5xx or rate limit, fail fast.
      if (r.status >= 500 || r.status === 429) {
        return new Response(JSON.stringify({ error: 'Gemini upstream error', status: r.status, attempted: errors }), {
          status: r.status,
          headers: { 'content-type': 'application/json' },
        })
      }
    }

    if (!lastResponse) {
      return new Response(JSON.stringify({ error: 'No model in chain accepted the request', attempted: errors }), {
        status: 404,
        headers: { 'content-type': 'application/json' },
      })
    }

    const json = await lastResponse.json()
    const parts = json?.candidates?.[0]?.content?.parts ?? []
    const imagePart = parts.find((p: { inline_data?: { data?: string }; inlineData?: { data?: string } }) => p?.inline_data?.data || p?.inlineData?.data)
    const data: string | undefined = imagePart?.inline_data?.data ?? imagePart?.inlineData?.data
    const mime: string = imagePart?.inline_data?.mime_type ?? imagePart?.inlineData?.mimeType ?? 'image/png'

    if (!data) {
      return new Response(JSON.stringify({ error: 'No image in response', modelUsed, raw: JSON.stringify(json).slice(0, 800) }), {
        status: 502,
        headers: { 'content-type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ imageDataUrl: `data:${mime};base64,${data}`, modelUsed }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Proxy error', message: String(e) }), {
      status: 502,
      headers: { 'content-type': 'application/json' },
    })
  }
}
