import { rateLimit, rateLimitResponse, getClientIp } from './_rateLimit'

export const config = { runtime: 'edge' }

const MAX_REQUESTS_PER_MINUTE = 30

export default async function handler(req: Request) {
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 })
  }

  const ip = getClientIp(req)
  if (!rateLimit(ip, MAX_REQUESTS_PER_MINUTE)) {
    return rateLimitResponse()
  }

  const url = new URL(req.url)
  const query = url.searchParams.get('q')
  if (!query) {
    return new Response(JSON.stringify({ error: 'Missing query parameter' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    })
  }

  // Try Google Custom Search if configured (100 free/day, best results)
  const googleKey = process.env.GOOGLE_CSE_API_KEY
  const googleCx = process.env.GOOGLE_CSE_CX
  if (googleKey && googleCx) {
    try {
      const result = await googleImageSearch(query, googleKey, googleCx)
      if (result) return jsonResponse(result)
    } catch {
      // Fall through to Pexels
    }
  }

  // Fallback: Pexels (free, 200 req/hr, high-quality photos)
  const pexelsKey = process.env.PEXELS_API_KEY
  if (pexelsKey) {
    try {
      const result = await pexelsSearch(query, pexelsKey)
      if (result) return jsonResponse(result)
    } catch {
      // No result
    }
  }

  return jsonResponse(null)
}

interface ImageResult {
  url: string
  thumb: string
  title: string
  source: 'google' | 'pexels'
}

function jsonResponse(data: ImageResult | null) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'public, max-age=86400',
    },
  })
}

async function googleImageSearch(query: string, apiKey: string, cx: string): Promise<ImageResult | null> {
  const params = new URLSearchParams({
    key: apiKey,
    cx,
    q: query,
    searchType: 'image',
    num: '1',
    imgSize: 'large',
    safe: 'active',
  })

  const resp = await fetch(`https://www.googleapis.com/customsearch/v1?${params}`)
  if (!resp.ok) return null

  const data = await resp.json()
  const item = data.items?.[0]
  if (!item) return null

  return {
    url: item.link,
    thumb: item.image?.thumbnailLink ?? item.link,
    title: item.title ?? query,
    source: 'google',
  }
}

async function pexelsSearch(query: string, apiKey: string): Promise<ImageResult | null> {
  const params = new URLSearchParams({
    query,
    per_page: '1',
    orientation: 'landscape',
  })

  const resp = await fetch(`https://api.pexels.com/v1/search?${params}`, {
    headers: { Authorization: apiKey },
  })
  if (!resp.ok) return null

  const data = await resp.json()
  const photo = data.photos?.[0]
  if (!photo) return null

  return {
    url: photo.src?.large2x ?? photo.src?.large,
    thumb: photo.src?.medium ?? photo.src?.small,
    title: photo.alt ?? query,
    source: 'pexels',
  }
}
