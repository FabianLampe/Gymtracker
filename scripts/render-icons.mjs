// Rendert die App-Icons aus einer SVG-Vorlage in PNGs.
// Einmalig auszuführen, wenn sich das Logo ändert:
//   npm install --no-save playwright && node scripts/render-icons.mjs
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const OUT = path.resolve('public/icons')

// Logo (identisch zu src/components/Logo.tsx), padded = Sicherheitsabstand
// für maskierbare Icons (Android schneidet bis zu 20 % am Rand weg).
function svg({ size, padded = false, rounded = true }) {
  const s = padded ? 0.72 : 1 // Skalierung des Motivs
  const o = (1 - s) / 2 * 512
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="${rounded && !padded ? 96 : 0}" fill="#0d0d0d"/>
  <g transform="translate(${o} ${o}) scale(${s})">
    <rect x="60" y="232" width="392" height="48" rx="24" fill="#f0f0f0"/>
    <rect x="48"  y="152" width="72" height="208" rx="18" fill="#e8192c"/>
    <rect x="128" y="184" width="44" height="144" rx="12" fill="#b81020"/>
    <rect x="340" y="184" width="44" height="144" rx="12" fill="#b81020"/>
    <rect x="392" y="152" width="72" height="208" rx="18" fill="#e8192c"/>
  </g>
</svg>`
}

const TARGETS = [
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
  { file: 'icon-maskable-512.png', size: 512, padded: true },
  // iOS ignoriert SVG als apple-touch-icon — es muss ein PNG sein.
  { file: 'apple-touch-icon.png', size: 180, rounded: false },
  { file: 'favicon-32.png', size: 32 },
]

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
})
await mkdir(OUT, { recursive: true })
for (const t of TARGETS) {
  const page = await browser.newPage({ viewport: { width: t.size, height: t.size } })
  await page.setContent(
    `<body style="margin:0">${svg({ size: t.size, padded: t.padded, rounded: t.rounded ?? true })}</body>`,
  )
  await page.screenshot({ path: path.join(OUT, t.file), omitBackground: true })
  await page.close()
  console.log('geschrieben:', t.file, `${t.size}×${t.size}`)
}
await browser.close()
