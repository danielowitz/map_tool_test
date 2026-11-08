export interface Measurement {
  id: number
  name: string
  value: number // 1-100
  lat: number
  lng: number
}

// Grobe Umrisslinie Berlins ([lat, lng]) für die Verteilung der Punkte.
export const BERLIN_POLYGON: [number, number][] = [
  [52.655, 13.3], [52.645, 13.37], [52.62, 13.47], [52.57, 13.56],
  [52.54, 13.62], [52.51, 13.7], [52.42, 13.76], [52.38, 13.64],
  [52.38, 13.52], [52.4, 13.4], [52.42, 13.25], [52.4, 13.15],
  [52.45, 13.09], [52.53, 13.15], [52.54, 13.23], [52.6, 13.2],
  [52.65, 13.25],
]

function inPolygon(lat: number, lng: number, poly: [number, number][]): boolean {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [yi, xi] = poly[i]
    const [yj, xj] = poly[j]
    if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      inside = !inside
    }
  }
  return inside
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
  const lats = BERLIN_POLYGON.map((p) => p[0])
  const lngs = BERLIN_POLYGON.map((p) => p[1])
  const [minLat, maxLat] = [Math.min(...lats), Math.max(...lats)]
  const [minLng, maxLng] = [Math.min(...lngs), Math.max(...lngs)]

  const result: Measurement[] = []
  while (result.length < count) {
    const lat = minLat + rand() * (maxLat - minLat)
    const lng = minLng + rand() * (maxLng - minLng)
    if (!inPolygon(lat, lng, BERLIN_POLYGON)) continue
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
