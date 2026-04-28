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

  // Try Google Custom Search if configured (100 free/day, better results)
  const googleKey = process.env.GOOGLE_CSE_API_KEY
  const googleCx = process.env.GOOGLE_CSE_CX
  if (googleKey && googleCx) {
    try {
      const result = await googleImageSearch(query, googleKey, googleCx)
      if (result) return jsonResponse(result)
    } catch {
      // Fall through to Wikipedia
    }
  }

  // Fallback: Wikipedia (free, no key, decent landmark coverage)
  try {
    const result = await wikipediaImageSearch(query)
    if (result) return jsonResponse(result)
  } catch {
    // No result
  }

  return jsonResponse(null)
}

interface ImageResult {
  url: string
  thumb: string
  title: string
  source: 'google' | 'wikipedia'
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

async function wikipediaImageSearch(query: string): Promise<ImageResult | null> {
  // Search for the Wikipedia page
  const searchParams = new URLSearchParams({
    action: 'query',
    format: 'json',
    list: 'search',
    srsearch: query,
    srlimit: '3',
    origin: '*',
  })

  const searchResp = await fetch(`https://en.wikipedia.org/w/api.php?${searchParams}`)
  if (!searchResp.ok) return null

  const searchData = await searchResp.json()
  const pages = searchData.query?.search
  if (!pages || pages.length === 0) return null

  // Try each result until we find one with an image
  for (const page of pages) {
    const imageParams = new URLSearchParams({
      action: 'query',
      format: 'json',
      titles: page.title,
      prop: 'pageimages',
      pithumbsize: '800',
      origin: '*',
    })

    const imageResp = await fetch(`https://en.wikipedia.org/w/api.php?${imageParams}`)
    if (!imageResp.ok) continue

    const imageData = await imageResp.json()
    const pageData = Object.values(imageData.query?.pages ?? {})[0] as any
    const thumbSrc = pageData?.thumbnail?.source
    const pageImg = pageData?.pageimage ?? ''
    if (thumbSrc && !isLogoOrIcon(pageImg)) {
      return {
        url: thumbSrc,
        thumb: thumbSrc,
        title: pageData.title ?? query,
        source: 'wikipedia',
      }
    }
  }

  return null
}

function isLogoOrIcon(filename: string): boolean {
  const lower = filename.toLowerCase()
  return /logo|icon|symbol|emblem|seal|coat.of.arms|flag.of|\.svg/i.test(lower)
}
