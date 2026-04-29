export interface NanoBananaParams {
  prompt: string
  referenceImageUrls?: string[]
  model?: string
}

export interface NanoBananaResult {
  imageDataUrl: string
  modelUsed: string
}

export async function generateNanoBananaImage(params: NanoBananaParams): Promise<NanoBananaResult | { error: string; details?: string }> {
  try {
    const response = await fetch('/api/nano-banana', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
    const json = await response.json()
    if (!response.ok || !json?.imageDataUrl) {
      // Compose a maximally informative error: include attempted-model errors,
      // the raw upstream snippet, and the proxy's own error label.
      const parts: string[] = []
      if (json?.error) parts.push(`${json.error} (${response.status})`)
      if (json?.details) parts.push(json.details)
      if (json?.attempted) {
        for (const a of json.attempted as Array<{ model: string; status: number; message: string }>) {
          parts.push(`[${a.model}] ${a.status}: ${a.message}`)
        }
      }
      if (json?.raw) parts.push(`raw: ${json.raw}`)
      return { error: parts.length > 0 ? parts.join('\n') : `HTTP ${response.status}` }
    }
    return { imageDataUrl: json.imageDataUrl, modelUsed: json.modelUsed }
  } catch (e) {
    return { error: 'Network error', details: String(e) }
  }
}
