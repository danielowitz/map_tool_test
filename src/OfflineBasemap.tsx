import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import { PMTiles } from 'pmtiles'
import type { RangeResponse, Source } from 'pmtiles'
import type { Layer } from 'leaflet'
import { leafletLayer } from 'protomaps-leaflet'

// PMTiles-Quelle, die direkt aus dem Arbeitsspeicher liest (kein HTTP-Range-Request nötig,
// funktioniert deshalb auch bei file://).
class MemorySource implements Source {
  private buf: ArrayBuffer
  constructor(buf: ArrayBuffer) {
    this.buf = buf
  }
  getKey() {
    return 'bundled-berlin'
  }
  async getBytes(offset: number, length: number): Promise<RangeResponse> {
    return { data: this.buf.slice(offset, offset + length) }
  }
}

// Zeichnet die Vektorkarte aus der eingebetteten berlin.pmtiles-Datei.
export default function OfflineBasemap({ dataUrl }: { dataUrl: string }) {
  const map = useMap()

  useEffect(() => {
    let cancelled = false
    let layer: Layer | undefined
    fetch(dataUrl)
      .then((r) => r.arrayBuffer())
      .then((buf) => {
        if (cancelled) return
        layer = leafletLayer({
          url: new PMTiles(new MemorySource(buf)),
          flavor: 'light',
          maxDataZoom: 14,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende, Protomaps',
        }) as unknown as Layer
        map.addLayer(layer)
      })
      .catch((e) => console.error('Offline-Karte konnte nicht geladen werden', e))
    return () => {
      cancelled = true
      if (layer) map.removeLayer(layer)
    }
  }, [map, dataUrl])

  return null
}
