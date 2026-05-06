import { rateLimit, rateLimitResponse, getClientIp } from './_rateLimit'
import { verifyAuth, unauthorizedResponse } from './_auth'

export const config = { runtime: 'edge' }

const MAX_REQUESTS_PER_MINUTE = 20

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const user = await verifyAuth(req)
  if (!user) return unauthorizedResponse()

  if (!rateLimit(`together:${user.id}`, MAX_REQUESTS_PER_MINUTE)) {
    return rateLimitResponse()
  }
  const ip = getClientIp(req)
  if (!rateLimit(`together-ip:${ip}`, MAX_REQUESTS_PER_MINUTE * 2)) {
    return rateLimitResponse()
  }

  const apiKey = process.env.TOGETHER_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }

  try {
    const body = await req.json()

    const response = await fetch('https://api.together.xyz/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.text()

    return new Response(data, {
      status: response.status,
      headers: {
        'content-type': 'application/json',
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
