import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import type { Measurement } from './data'

const TILE = 256
const CELL = 4 // Pixel pro Rasterzelle (Tile wird in 64x64 Zellen gerendert und geglättet hochskaliert)
const RADIUS = 70 // Einflussradius eines Messpunkts in Pixeln

// Farbskala: grün (1) -> gelb (50) -> rot (100)
const STOPS: [number, number, number][] = [
  [26, 152, 80],
  [255, 230, 0],
  [215, 48, 39],
]
function colorFor(t: number): [number, number, number] {
  const x = Math.min(1, Math.max(0, t)) * 2
  const i = Math.min(1, Math.floor(x))
  const f = x - i
  const a = STOPS[i]
  const b = STOPS[i + 1]
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f]
}

// Interpolierte Heatmap: Farbe = gewichteter Mittelwert der Messwerte in der Umgebung (IDW),
// Deckkraft = Nähe zu Messpunkten.
export default function HeatLayer({ data }: { data: Measurement[] }) {
  const map = useMap()

  useEffect(() => {
    class IdwLayer extends L.GridLayer {
      protected createTile(coords: L.Coords): HTMLElement {
      const size = TILE / CELL
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')!
      const img = ctx.createImageData(size, size)

      const ox = coords.x * TILE
      const oy = coords.y * TILE
      const pts = data
        .map((m) => {
          const p = map.project([m.lat, m.lng], coords.z)
          return { x: p.x - ox, y: p.y - oy, v: m.value }
        })
        .filter((p) => p.x > -RADIUS && p.x < TILE + RADIUS && p.y > -RADIUS && p.y < TILE + RADIUS)

      for (let cy = 0; cy < size; cy++) {
        for (let cx = 0; cx < size; cx++) {
          const px = cx * CELL + CELL / 2
          const py = cy * CELL + CELL / 2
          let sw = 0
          let sv = 0
          for (const p of pts) {
            const d = Math.hypot(p.x - px, p.y - py)
            if (d >= RADIUS) continue
            const w = (1 - d / RADIUS) ** 2
            sw += w
            sv += w * p.v
          }
          if (sw === 0) continue
          const [r, g, b] = colorFor((sv / sw - 1) / 99)
          const o = (cy * size + cx) * 4
          img.data[o] = r
          img.data[o + 1] = g
          img.data[o + 2] = b
          img.data[o + 3] = Math.min(255, sw * 255 * 1.2)
        }
      }
      ctx.putImageData(img, 0, 0)
      return canvas
      }
    }
    const layer = new IdwLayer({ tileSize: TILE, pane: 'overlayPane', opacity: 0.85 })
    map.addLayer(layer)
    return () => {
      map.removeLayer(layer)
    }
  }, [map, data])

  return null
}
