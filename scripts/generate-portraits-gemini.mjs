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
    id: 'sora',
    refPath: path.join(ROOT, 'char images', 'beautiful-young-asian-woman-clean-600nw-2749398081.jpg.webp'),
    prompt:
      '2D anime illustration, cel-shaded manhwa art style, NOT a photograph. Beauty editorial portrait of a beautiful 21 year old Korean woman, sleek dark hair pulled back in a low center-parted bun with a few wispy strands framing her face, looking softly over her shoulder toward the camera, glowing dewy skin, full soft brown eyes with long lashes, soft natural makeup with peach-glossy lips, wearing a fitted white sleeveless tank top with thin straps, soft warm beige minimalist background, clean editorial lighting, K-drama manhwa aesthetic with clean linework and soft cel shading, detailed anime face, polished serene quiet beauty energy. Use the reference photo to guide the facial structure, hairstyle, pose, outfit, and overall composition.',
  },
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
      '2D anime illustration, cel-shaded manhwa art style, NOT a photograph. Portrait of a 22 year old Korean woman, long flowing dark hair with a slight wave framing her face, large expressive anime almond eyes with a confident playful expression, soft natural lips with a small smirk, wearing a fitted scoop-neck pastel blue cap-sleeve tee with visible cleavage and a small silver cross pendant necklace at the collar, soft warm natural daylight from a window, clean dark background, K-drama manhwa aesthetic with clean linework and soft cel shading, detailed anime face, bold confident nightlife-savvy energy. Match the anime art style of typical Korean manhwa. Use the reference photo to guide only the facial structure, hairstyle, neckline, and pose. Head-and-shoulders framing.',
  },
  {
    id: 'maya',
    refPath: path.join(ROOT, 'char images', 'WhatsApp Image 2026-04-03 at 4.25.27 PM.jpeg'),
    prompt:
      'Anime style portrait of a 22 year old Southeast Asian woman, short tousled dark hair just past chin length with a slight wave, big warm smile showing teeth, expressive smiling almond eyes with subtle laugh lines, soft cheeks with light freckles across the nose, wearing a casual fitted black ribbed crew-neck t-shirt, soft natural daylight, clean dark background, high quality anime art style, detailed face, K-drama aesthetic, warm girl-next-door easy-going energy. Use the reference photo to guide the facial structure and overall look. Tasteful framing, head-and-shoulders only.',
  },
  {
    id: 'hana',
    refPath: path.join(ROOT, 'char images', 'square.jpeg'),
    prompt:
      'Anime style portrait of a 24 year old Asian woman, long flowing wavy dark hair with subtle caramel highlights framing her face, large gold hoop earrings, delicate silver tennis choker necklace, soft natural makeup with glossy peach-pink lips, full eyelashes, looking softly off camera, wearing a pink and coral tie-dye halter top with thin spaghetti straps and a deep V-neckline showing cleavage, soft warm golden hour lighting from the side, clean dark tropical background, high quality anime art style, detailed face, K-drama aesthetic, polished resort-vacation aesthete vibe. Use the reference photo to guide the facial structure, neckline, and overall look. Head-and-shoulders framing.',
  },
  {
    id: 'junseo',
    refPath: path.join(ROOT, 'char images', 'F-hWarWXkAAX-9K.jpg'),
    prompt:
      'Anime style portrait of a handsome 21 year old Korean male K-pop idol, three-quarter side profile view looking off camera, tousled dark brown hair with subtle lighter highlights, sharp jawline, calm focused dark eyes with quiet intensity, shirtless K-pop magazine photoshoot showing a lean athletic build with defined chest and visible abs, soft loose white linen pants visible at the bottom, sitting against a wall, soft moody editorial studio lighting with cool blue and grey tones, clean minimalist background, high quality anime art style, detailed face and body, K-drama aesthetic, idol-on-a-quiet-break editorial vibe. Use the reference photo to guide the facial structure, body, and overall composition. Tasteful artistic framing.',
  },
  {
    id: 'hyun',
    refPath: path.join(ROOT, 'char images', 'Gt917h_XYAABxEM.jpg'),
    prompt:
      'Anime style half-body portrait of a 22 year old Korean man, bold cherry red dyed messy hair with the front sticking up dramatically, sharp angular face, multiple small silver ear piercings, defined jawline with a faint smirk, wearing an open black leather biker jacket over bare chest showing a lean athletic build with defined abs, chunky silver chain necklace and a silver dog-tag pendant resting against his chest, black studded belt visible at the waist, mirror-selfie editorial framing, soft moody lighting with warm amber and shadow background tones, clean dark background, high quality anime art style, detailed face and body, K-drama aesthetic, edgy art-school-dropout Berlin-techno-scene energy. Use the reference photo to guide the facial structure, body, and overall composition.',
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
      'Anime style half-body portrait of a 24 year old Korean man, tousled dark brown hair, big bright warm smile showing teeth, friendly crinkled almond eyes, mid-flex double bicep pose with both arms raised, shirtless showing a muscular athletic build with broad shoulders, defined chest, and visible abs, thin gold chain necklace at the collar, light grey athletic shorts visible at the bottom, soft warm gym lighting with mirror reflections in the background, high quality anime art style, detailed face and body, K-drama aesthetic, golden-retriever gym-buddy energy. Use the reference photo to guide the facial structure, body, and overall composition.',
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
