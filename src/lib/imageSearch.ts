const cache = new Map<string, string | null>()

export async function fetchPlaceImage(placeName: string, city: string): Promise<string | null> {
  const query = `${placeName} ${city}`
  const cacheKey = `place:${query}`
  if (cache.has(cacheKey)) return cache.get(cacheKey)!

  try {
    const resp = await fetch(`/api/image-search?type=place&q=${encodeURIComponent(query)}`)
    if (!resp.ok) return null

    const data = await resp.json()
    const url = data?.url ?? null
    cache.set(cacheKey, url)
    return url
  } catch {
    cache.set(cacheKey, null)
    return null
  }
}

export function parsePlaceTags(text: string): { cleanText: string; places: string[] } {
  const places: string[] = []
  const cleanText = text.replace(/\[PLACE:([^\]]+)\]/g, (_, name) => {
    places.push(name.trim())
    return name.trim()
  })
  return { cleanText: cleanText.trim(), places }
}

export async function fetchFoodImage(dishName: string, _city: string): Promise<string | null> {
  const query = dishName
  const cacheKey = `food:${query}`
  if (cache.has(cacheKey)) return cache.get(cacheKey)!

  try {
    const resp = await fetch(`/api/image-search?type=food&q=${encodeURIComponent(query)}`)
    if (!resp.ok) return null

    const data = await resp.json()
    const url = data?.url ?? null
    cache.set(cacheKey, url)
    return url
  } catch {
    cache.set(cacheKey, null)
    return null
  }
}

export function parseFoodTags(text: string): { cleanText: string; foods: string[] } {
  const foods: string[] = []
  const cleanText = text.replace(/\[FOOD:([^\]]+)\]/g, (_, name) => {
    foods.push(name.trim())
    return name.trim()
  })
  return { cleanText: cleanText.trim(), foods }
}
