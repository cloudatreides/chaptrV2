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
      return { error: json?.error ?? 'Generation failed', details: json?.details }
    }
    return { imageDataUrl: json.imageDataUrl, modelUsed: json.modelUsed }
  } catch (e) {
    return { error: 'Network error', details: String(e) }
  }
}
