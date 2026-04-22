#!/usr/bin/env node
// Generate static portrait images for characters missing them.
// Usage: TOGETHER_API_KEY=xxx node scripts/generate-portraits.mjs

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PUBLIC_DIR = path.join(__dirname, '..', 'public')

const API_KEY = process.env.TOGETHER_API_KEY
if (!API_KEY) {
  console.error('Set TOGETHER_API_KEY env var')
  process.exit(1)
}

const CHARACTERS = [
  { id: 'dohyun', prompt: 'Manhwa style portrait of a handsome 18 year old Korean male student, sharp angular jawline, dark swept-back hair with one strand falling over his forehead, cold piercing eyes with a hidden softness, wearing a navy school blazer over a white shirt with loosened tie, soft studio lighting, clean dark background, detailed face, high quality manhwa art, chaebol heir energy' },
  { id: 'soyeon', prompt: 'Manhwa style portrait of a cheerful 18 year old Korean female student, bright expressive eyes, high ponytail with loose strands framing her face, warm confident smile, wearing a navy school blazer with a cute pin on the collar, soft studio lighting, clean dark background, detailed face, high quality manhwa art, best friend energy' },
  { id: 'hajin', prompt: 'Manhwa style portrait of a handsome 19 year old Korean male, tousled dark brown hair falling naturally, warm mischievous eyes, lazy confident grin, wearing a casual white t-shirt with a light flannel shirt open over it, soft studio lighting, clean dark background, detailed face, high quality manhwa art, boy next door with edge' },
  { id: 'yejin', prompt: 'Manhwa style portrait of a sharp 19 year old Korean female, sleek short bob haircut, round wire-frame glasses, intelligent piercing eyes with a knowing smirk, wearing a casual striped shirt, soft studio lighting, clean dark background, detailed face, high quality manhwa art, the friend who sees through everything' },
  { id: 'sunwoo', prompt: 'Manhwa style portrait of a gentle 20 year old Korean male, soft dark hair falling over one eye, warm thoughtful brown eyes, slight shy smile, wearing a dark knit sweater with a pencil tucked behind his ear, soft studio lighting, clean dark background, detailed face, high quality manhwa art, quiet artist energy' },
  { id: 'jieun', prompt: 'Manhwa style portrait of a warm 26 year old Korean female, hair tied up in a messy bun with a few loose strands, kind knowing eyes with smile lines, wearing a canvas apron over a casual shirt, soft studio lighting, clean dark background, detailed face, high quality manhwa art, wise barista energy' },
  { id: 'taehyun', prompt: 'Manhwa style portrait of a strikingly handsome 21 year old Korean male idol, silver-blue dyed hair styled messily, tired but beautiful dark eyes, sharp jawline, wearing a plain black hoodie with the hood down, soft studio lighting, clean dark background, detailed face, high quality manhwa art, fallen idol in hiding energy' },
  { id: 'nari', prompt: 'Manhwa style portrait of an energetic 20 year old Korean female, dark hair with pink-dyed tips, bright sparkling eyes, infectious grin, wearing a casual graphic tee with a small idol pin on the collar, soft studio lighting, clean dark background, detailed face, high quality manhwa art, K-pop fangirl best friend energy' },
]

async function generatePortrait(char) {
  const outPath = path.join(PUBLIC_DIR, `${char.id}-portrait.png`)
  if (fs.existsSync(outPath)) {
    console.log(`⏭  ${char.id}-portrait.png already exists, skipping`)
    return
  }

  console.log(`🎨 Generating ${char.id}...`)
  const res = await fetch('https://api.together.xyz/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'black-forest-labs/FLUX.1-schnell',
      prompt: char.prompt,
      aspect_ratio: '1:1',
      steps: 4,
      n: 1,
      response_format: 'b64_json',
    }),
  })

  if (!res.ok) {
    console.error(`  ❌ ${char.id} failed: ${res.status} ${await res.text()}`)
    return
  }

  const data = await res.json()
  const b64 = data.data?.[0]?.b64_json
  if (!b64) {
    console.error(`  ❌ ${char.id}: no image data in response`)
    return
  }

  fs.writeFileSync(outPath, Buffer.from(b64, 'base64'))
  console.log(`  ✅ ${char.id}-portrait.png saved`)
}

;(async () => {
  for (const char of CHARACTERS) {
    await generatePortrait(char)
  }
  console.log('\nDone! Now add staticPortrait fields to the story character definitions.')
})()
