const cache = new Map<string, string | null>()

export async function fetchPlaceImage(placeName: string, city: string): Promise<string | null> {
  const query = `${placeName} ${city}`
  if (cache.has(query)) return cache.get(query)!

  try {
    const resp = await fetch(`/api/image-search?q=${encodeURIComponent(query)}`)
    if (!resp.ok) return null

    const data = await resp.json()
    const url = data?.url ?? null
    cache.set(query, url)
    return url
  } catch {
    cache.set(query, null)
    return null
  }
}

export function parsePlaceTags(text: string): { cleanText: string; places: string[] } {
  const places: string[] = []
  const cleanText = text.replace(/\[PLACE:([^\]]+)\]/g, (_, name) => {
    places.push(name.trim())
    return ''
  })
  return { cleanText: cleanText.trim(), places }
}
