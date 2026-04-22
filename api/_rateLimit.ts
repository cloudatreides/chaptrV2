const windowMs = 60_000
const store = new Map<string, { count: number; resetAt: number }>()

let lastCleanup = Date.now()

function cleanup() {
  const now = Date.now()
  if (now - lastCleanup < 30_000) return
  lastCleanup = now
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key)
  }
}

export function rateLimit(ip: string, maxRequests: number): boolean {
  cleanup()
  const now = Date.now()
  const entry = store.get(ip)

  if (!entry || entry.resetAt <= now) {
    store.set(ip, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (entry.count >= maxRequests) return false

  entry.count++
  return true
}

export function rateLimitResponse(): Response {
  return new Response(JSON.stringify({ error: 'Too many requests. Please wait a moment.' }), {
    status: 429,
    headers: {
      'content-type': 'application/json',
      'retry-after': '60',
    },
  })
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.headers.get('x-real-ip') ?? 'unknown'
}
