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
  {
    id: 'nia',
    refPath: path.join(ROOT, 'char images', 'WhatsApp Image 2026-04-03 at 4.25.27 PM.jpeg'),
    prompt:
      'Anime style portrait of a 22 year old Southeast Asian woman, short tousled dark hair just past chin length with a slight wave, big warm smile showing teeth, expressive smiling almond eyes with subtle laugh lines, soft cheeks with light freckles across the nose, wearing a casual fitted black ribbed crew-neck t-shirt, soft natural daylight, clean dark background, high quality anime art style, detailed face, K-drama aesthetic, warm girl-next-door easy-going energy. Use the reference photo to guide the facial structure and overall look. Tasteful framing, head-and-shoulders only.',
  },
  {
    id: 'hana',
    refPath: path.join(ROOT, 'char images', 'square.jpeg'),
    prompt:
      'Anime style portrait of a 24 year old Asian woman, long flowing wavy dark hair with subtle caramel highlights framing her face, large gold hoop earrings, delicate silver choker necklace, soft natural makeup with glossy peach-pink lips, full eyelashes, wearing a tasteful sleeveless coral pink sundress with a modest scoop neckline, soft golden hour lighting, clean dark background, high quality anime art style, detailed face, K-drama aesthetic, polished travel-aesthete vibe. Use the reference photo to guide the facial structure and overall look. Tasteful framing, head-and-shoulders only.',
  },
  {
    id: 'junseo',
    refPath: path.join(ROOT, 'char images', 'F-hWarWXkAAX-9K.jpg'),
    prompt:
      'Anime style portrait of a handsome 21 year old Korean male K-pop idol, three-quarter view looking off camera, tousled dark brown hair with subtle lighter highlights, sharp jawline, calm focused dark eyes with quiet intensity, wearing a soft loose-fitting white linen button-up shirt with the top two buttons open, soft moody studio lighting with cool blue tones, clean dark background, high quality anime art style, detailed face, K-drama aesthetic, polished idol-on-a-quiet-break energy. Use the reference photo to guide the facial structure and overall look. Tasteful framing, head-and-shoulders only.',
  },
  {
    id: 'hyun',
    refPath: path.join(ROOT, 'char images', 'Gt917h_XYAABxEM.jpg'),
    prompt:
      'Anime style portrait of a 22 year old Korean man, bold cherry red dyed messy hair with the front sticking up dramatically, sharp angular face, multiple small silver ear piercings, defined jawline with a faint smirk, wearing an open black leather biker jacket over a fitted plain black t-shirt, chunky silver chain necklace at the collar, soft moody lighting with warm amber and shadow background tones, clean dark background, high quality anime art style, detailed face, K-drama aesthetic, edgy art-school-dropout Berlin-techno-scene energy. Use the reference photo to guide the facial structure and overall look. Tasteful framing, head-and-shoulders only.',
  },
  {
    id: 'riko',
    refPath: path.join(ROOT, 'char images', '62dd347aad42fad9cc0277ab88a11c4b0078b9bf8c7e9ce1afd0126d8fb9f1d4.webp'),
    prompt:
      'Anime style portrait of a 25 year old Asian woman, dark hair pulled back in a high tousled ponytail with a few loose strands framing her face, calm content half-smile, glowing dewy skin, soft brown eyes, wearing a fitted cobalt blue athletic tank top with thin straps and a matching cobalt blue sweatband on her wrist, soft natural studio daylight, clean dark background, high quality anime art style, detailed face, K-drama aesthetic, calm wellness-yoga-teacher energy. Use the reference photo to guide the facial structure and overall look. Tasteful framing, head-and-shoulders only.',
  },
  {
    id: 'junho',
    refPath: path.join(ROOT, 'char images', 'GcB02niXYAAY0kj.jpg'),
    prompt:
      'Anime style portrait of a 24 year old Korean man, tousled dark brown hair styled neatly, big bright warm smile showing teeth, friendly crinkled almond eyes, defined athletic shoulders and neck, wearing a fitted heather grey short-sleeve athletic t-shirt with a thin gold chain necklace just visible at the collar, soft warm directional lighting, clean dark background, high quality anime art style, detailed face, K-drama aesthetic, golden-retriever gym-buddy energy. Use the reference photo to guide the facial structure and overall look. Tasteful framing, head-and-shoulders only.',
  },
]

function readRef(refPath) {
  const buf = fs.readFileSync(refPath)
  const ext = path.extname(refPath).toLowerCase()
  const mimes = { '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg' }
  const mimeType = mimes[ext] ?? 'image/jpeg'
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
