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
      // Fall through to Unsplash
    }
  }

  // Fallback: Unsplash (free tier, 50 req/hr, high-quality photos)
  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY
  if (unsplashKey) {
    try {
      const result = await unsplashSearch(query, unsplashKey)
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
  source: 'google' | 'unsplash'
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

async function unsplashSearch(query: string, accessKey: string): Promise<ImageResult | null> {
  const params = new URLSearchParams({
    query,
    per_page: '1',
    orientation: 'landscape',
    content_filter: 'high',
  })

  const resp = await fetch(`https://api.unsplash.com/search/photos?${params}`, {
    headers: { Authorization: `Client-ID ${accessKey}` },
  })
  if (!resp.ok) return null

  const data = await resp.json()
  const photo = data.results?.[0]
  if (!photo) return null

  return {
    url: photo.urls?.regular ?? photo.urls?.full,
    thumb: photo.urls?.small ?? photo.urls?.thumb,
    title: photo.alt_description ?? photo.description ?? query,
    source: 'unsplash',
  }
}
