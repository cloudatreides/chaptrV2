#!/usr/bin/env node
// Generate static companion portraits via Gemini (Nano Banana) using a
// reference photo to guide facial structure.
// Usage: node scripts/generate-portraits-gemini.mjs

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const PUBLIC_DIR = path.join(ROOT, 'public')

// Minimal .env.local loader (no external deps)
const envPath = path.join(ROOT, '.env.local')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)="?([^"]*)"?$/)
    if (m) process.env[m[1]] ??= m[2]
  }
}

const API_KEY = process.env.GEMINI_API_KEY
if (!API_KEY) {
  console.error('GEMINI_API_KEY not set in .env.local')
  process.exit(1)
}

const MODEL_CHAIN = [
  'gemini-3.1-flash-image-preview',
  'gemini-3-pro-image-preview',
  'gemini-2.5-flash-image',
]

const CHARACTERS = [
  {
    id: 'beomseok',
    refPath: path.join(ROOT, 'char images', 'hongbeomseok.jpg'),
    prompt:
      'Anime style portrait of a handsome 31 year old Korean man, sharp clean jawline, short neatly-styled dark hair, calm thoughtful brown eyes with a quiet half-smile, wearing a fitted black crew-neck t-shirt, soft studio lighting, clean dark background, high quality anime art style, detailed face, K-drama aesthetic, mature grounded energy, looks like an off-duty chef. Use the reference photo to guide the facial structure and overall look.',
  },
  {
    id: 'mina',
    refPath: path.join(ROOT, 'char images', '8DD47325-74A6-43E9-A737-E1FDC8D8AA8F.jpeg'),
    prompt:
      'Anime style portrait of a 22 year old Korean woman, long flowing dark hair with a slight wave framing her face, expressive almond eyes with a confident playful expression, soft natural lips with a small smirk, wearing an oversized cropped denim jacket over a plain white t-shirt with a small silver cross necklace visible at the collar, soft studio lighting, clean dark background, high quality anime art style, detailed face, K-drama aesthetic, bold confident nightlife-savvy energy. Use the reference photo to guide the facial structure and overall look. Tasteful framing, head-and-shoulders only.',
  },
]

function readRef(refPath) {
  const buf = fs.readFileSync(refPath)
  const ext = path.extname(refPath).toLowerCase()
  const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg'
  return { mimeType, data: buf.toString('base64') }
}

async function callGemini(model, prompt, ref) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }, { inlineData: ref }] }],
      generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
    }),
  })
  return r
}

async function generate(char) {
  const outPath = path.join(PUBLIC_DIR, `${char.id}-portrait.png`)
  if (fs.existsSync(outPath)) {
    console.log(`⏭  ${char.id}-portrait.png already exists, skipping`)
    return
  }
  if (!fs.existsSync(char.refPath)) {
    console.error(`❌ ${char.id}: reference image not found at ${char.refPath}`)
    return
  }

  const ref = readRef(char.refPath)
  console.log(`🎨 Generating ${char.id}-portrait.png ...`)

  const errors = []
  for (const model of MODEL_CHAIN) {
    let r = await callGemini(model, char.prompt, ref)
    if (!r.ok && (r.status === 429 || r.status >= 500)) {
      await new Promise((res) => setTimeout(res, 1500))
      r = await callGemini(model, char.prompt, ref)
    }
    if (!r.ok) {
      const text = await r.text().catch(() => '')
      errors.push({ model, status: r.status, message: text.slice(0, 240) })
      if (r.status >= 500 || r.status === 429) {
        console.error(`❌ ${char.id}: ${model} ${r.status}`, text.slice(0, 240))
        return
      }
      continue
    }

    const json = await r.json()
    const parts = json?.candidates?.[0]?.content?.parts ?? []
    const imagePart = parts.find((p) => p?.inlineData?.data || p?.inline_data?.data)
    const data = imagePart?.inlineData?.data ?? imagePart?.inline_data?.data
    if (!data) {
      const finishReason = json?.candidates?.[0]?.finishReason ?? 'unknown'
      errors.push({ model, status: 200, message: `no image part (finishReason=${finishReason})` })
      continue
    }

    fs.writeFileSync(outPath, Buffer.from(data, 'base64'))
    console.log(`✅ ${char.id}-portrait.png saved (model: ${model})`)
    return
  }

  console.error(`❌ ${char.id}: all models failed`, errors)
}

for (const c of CHARACTERS) {
  await generate(c)
}
console.log('Done.')
