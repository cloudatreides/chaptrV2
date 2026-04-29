import { rateLimit, rateLimitResponse, getClientIp } from './_rateLimit'

export const config = { runtime: 'edge' }

const MAX_REQUESTS_PER_MINUTE = 20

// Gemini 3 Pro Image Preview ("Nano Banana 2"). Falls back to 2.5 Flash Image
// ("Nano Banana") if the 3.x preview isn't available on the project's tier.
const PRIMARY_MODEL = 'gemini-3-pro-image-preview'
const FALLBACK_MODEL = 'gemini-2.5-flash-image-preview'

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
      generationConfig: { responseModalities: ['IMAGE'] },
    }),
  })
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  const ip = getClientIp(req)
  if (!rateLimit(ip, MAX_REQUESTS_PER_MINUTE)) return rateLimitResponse()

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'GEMINI_API_KEY not configured' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }

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

    let modelUsed = model || PRIMARY_MODEL
    let response = await callGemini(modelUsed, prompt, refs, apiKey)

    if (!response.ok && !model) {
      const errText = await response.text().catch(() => '')
      // Auto-fallback if the primary model is gated
      if (response.status === 404 || response.status === 403 || errText.includes('not found')) {
        modelUsed = FALLBACK_MODEL
        response = await callGemini(modelUsed, prompt, refs, apiKey)
      }
    }

    if (!response.ok) {
      const errText = await response.text().catch(() => '')
      return new Response(JSON.stringify({ error: 'Gemini error', status: response.status, details: errText.slice(0, 500), modelUsed }), {
        status: response.status,
        headers: { 'content-type': 'application/json' },
      })
    }

    const json = await response.json()
    const parts = json?.candidates?.[0]?.content?.parts ?? []
    const imagePart = parts.find((p: { inline_data?: { data?: string } }) => p?.inline_data?.data)
    const data: string | undefined = imagePart?.inline_data?.data
    const mime: string = imagePart?.inline_data?.mime_type ?? 'image/png'

    if (!data) {
      return new Response(JSON.stringify({ error: 'No image in response', modelUsed, raw: JSON.stringify(json).slice(0, 500) }), {
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
