// Erzeugt src/assets/berlin-map.png + berlin-map.json: ein statisches OpenStreetMap-Bild von Berlin,
// zusammengesetzt aus Standard-Kacheln. Einmalig auf einem Rechner mit Internet ausführen:
//
//   node scripts/make-berlin-image.mjs [ZOOM]     (Standard 12 ≈ 60 Kacheln; 13 ≈ 220 Kacheln, schärfer, ~4x größer)
//
// Es werden nur wenige Kacheln mit identifizierendem User-Agent geladen (OSM-Tile-Usage-Policy).
// Optional: TILE_URL="http://localhost:8000/{z}/{x}/{y}.png" für einen anderen Kachelserver.
import sharp from 'sharp'
import { mkdir, writeFile } from 'node:fs/promises'

const ZOOM = Number(process.argv[2] ?? 12)
const TILE_URL = process.env.TILE_URL ?? 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const BBOX = { west: 13.05, east: 13.8, south: 52.33, north: 52.68 }
const N = 2 ** ZOOM

const lng2x = (lng) => ((lng + 180) / 360) * N
const lat2y = (lat) => {
  const r = (lat * Math.PI) / 180
  return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * N
}
const x2lng = (x) => (x / N) * 360 - 180
const y2lat = (y) => (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / N))) * 180) / Math.PI

const x0 = Math.floor(lng2x(BBOX.west))
const x1 = Math.floor(lng2x(BBOX.east))
const y0 = Math.floor(lat2y(BBOX.north))
const y1 = Math.floor(lat2y(BBOX.south))
const cols = x1 - x0 + 1
const rows = y1 - y0 + 1
console.log(`Zoom ${ZOOM}: ${cols}x${rows} = ${cols * rows} Kacheln`)

const composites = []
for (let y = y0; y <= y1; y++) {
  for (let x = x0; x <= x1; x++) {
    const url = TILE_URL.replace('{z}', ZOOM).replace('{x}', x).replace('{y}', y)
    const res = await fetch(url, { headers: { 'User-Agent': 'map-tool-berlin/1.0 (static background image generator)' } })
    if (!res.ok) throw new Error(`Kachel ${url} -> HTTP ${res.status}`)
    composites.push({ input: Buffer.from(await res.arrayBuffer()), left: (x - x0) * 256, top: (y - y0) * 256 })
    await new Promise((r) => setTimeout(r, 120)) // höflich bleiben
  }
}

await mkdir('src/assets', { recursive: true })
await sharp({ create: { width: cols * 256, height: rows * 256, channels: 3, background: '#ddd' } })
  .composite(composites)
  .png({ palette: true, quality: 90 }) // Palette-PNG hält die Datei klein
  .toFile('src/assets/berlin-map.png')

// Grenzen des Bildes ([lat, lng] Südwest / Nordost), exakt auf dem Kachelraster
const bounds = [[y2lat(y1 + 1), x2lng(x0)], [y2lat(y0), x2lng(x1 + 1)]]
await writeFile('src/assets/berlin-map.json', JSON.stringify({ zoom: ZOOM, bounds }, null, 2))
console.log('Fertig: src/assets/berlin-map.png', bounds)
