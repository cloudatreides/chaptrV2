import { rateLimit, rateLimitResponse, getClientIp } from './_rateLimit'
import { verifyAuth, unauthorizedResponse } from './_auth'

export const config = { runtime: 'edge' }

const MAX_REQUESTS_PER_MINUTE = 30

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const user = await verifyAuth(req)
  if (!user) return unauthorizedResponse()

  if (!rateLimit(`claude:${user.id}`, MAX_REQUESTS_PER_MINUTE)) {
    return rateLimitResponse()
  }
  // Keep IP-based rate limit as a secondary defense in case a single user
  // somehow leaks their token to many clients.
  const ip = getClientIp(req)
  if (!rateLimit(`claude-ip:${ip}`, MAX_REQUESTS_PER_MINUTE * 2)) {
    return rateLimitResponse()
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }

  try {
    const body = await req.json()

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    // Forward response (streaming SSE or JSON) with original status + content-type
    return new Response(response.body, {
      status: response.status,
      headers: {
        'content-type': response.headers.get('content-type') || 'application/json',
        'cache-control': 'no-cache',
      },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Proxy error' }), {
      status: 502,
      headers: { 'content-type': 'application/json' },
    })
  }
}
