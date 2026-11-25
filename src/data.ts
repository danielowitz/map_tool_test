import districts from './assets/berlin-bezirke.json'

export interface Measurement {
  id: number
  name: string
  value: number // 1-100
  lat: number
  lng: number
}

// Echte Bezirksgrenzen (GeoJSON, [lng, lat]) – Punkte werden nur innerhalb Berlins erzeugt.
type Ring = [number, number][]
export const polygons: Ring[][] = (districts as unknown as { features: { geometry: { coordinates: Ring[][] } }[] }).features
  .flatMap((f) => f.geometry.coordinates)

function inRing(lng: number, lat: number, ring: Ring): boolean {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

function inBerlin(lat: number, lng: number): boolean {
  return polygons.some(([outer, ...holes]) => inRing(lng, lat, outer) && !holes.some((h) => inRing(lng, lat, h)))
}

// Kleiner deterministischer Zufallsgenerator, damit die Daten bei jedem Laden gleich sind.
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function generateMeasurements(count = 500, seed = 42): Measurement[] {
  const rand = mulberry32(seed)
  const all = polygons.flatMap((p) => p[0])
  const lats = all.map((p) => p[1])
  const lngs = all.map((p) => p[0])
  const [minLat, maxLat] = [Math.min(...lats), Math.max(...lats)]
  const [minLng, maxLng] = [Math.min(...lngs), Math.max(...lngs)]

  const result: Measurement[] = []
  while (result.length < count) {
    const lat = minLat + rand() * (maxLat - minLat)
    const lng = minLng + rand() * (maxLng - minLng)
    if (!inBerlin(lat, lng)) continue
    const id = result.length + 1
    result.push({
      id,
      name: `Messpunkt ${String(id).padStart(3, '0')}`,
      value: 1 + Math.floor(rand() * 100),
      lat: Number(lat.toFixed(5)),
      lng: Number(lng.toFixed(5)),
    })
  }
  return result
}
