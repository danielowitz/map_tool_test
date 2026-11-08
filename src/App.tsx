import { useMemo, useState } from 'react'
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { generateMeasurements } from './data'
import HeatLayer from './HeatLayer'
import './App.css'

type Mode = 'points' | 'heat'

// Fehlgeschlagene Kacheln (graue Lücken) bis zu 3x neu laden
function retryTile(e: { tile: HTMLImageElement }) {
  const img = e.tile
  const tries = Number(img.dataset.retries ?? 0)
  if (tries >= 3) return
  img.dataset.retries = String(tries + 1)
  const src = img.src.split('?')[0]
  setTimeout(() => { img.src = `${src}?retry=${tries + 1}` }, 500 * (tries + 1))
}

// Farbskala: niedrig = blau, hoch = rot
function colorFor(value: number): string {
  const hue = 240 - ((value - 1) / 99) * 240
  return `hsl(${hue}, 85%, 50%)`
}

export default function App() {
  const data = useMemo(() => generateMeasurements(500), [])
  const [selected, setSelected] = useState<number | null>(null)
  const [mode, setMode] = useState<Mode>('points')

  return (
    <div className={`layout ${mode === 'heat' ? 'gray' : ''}`}>
      <aside className="table-panel">
        <h1>Map Tool</h1>
        <p>{data.length} Messwerte in Berlin</p>
        <div className="toggle" role="group" aria-label="Darstellung">
          <button className={mode === 'points' ? 'active' : ''} onClick={() => setMode('points')}>Punkte</button>
          <button className={mode === 'heat' ? 'active' : ''} onClick={() => setMode('heat')}>Heatmap</button>
        </div>
        <table>
          <thead>
            <tr><th>Name</th><th>Wert</th><th>Lat</th><th>Lng</th></tr>
          </thead>
          <tbody>
            {data.map((m) => (
              <tr
                key={m.id}
                className={m.id === selected ? 'selected' : ''}
                onClick={() => setSelected(m.id)}
              >
                <td>{m.name}</td>
                <td>{m.value}</td>
                <td>{m.lat}</td>
                <td>{m.lng}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </aside>
      <MapContainer center={[52.52, 13.405]} zoom={11} className="map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          eventHandlers={{ tileerror: retryTile }}
        />
        {mode === 'heat' && <HeatLayer data={data} />}
        {mode === 'points' && data.map((m) => (
          <CircleMarker
            key={m.id}
            center={[m.lat, m.lng]}
            radius={m.id === selected ? 10 : 6}
            pathOptions={{ color: m.id === selected ? '#000' : '#fff', weight: 1, fillColor: colorFor(m.value), fillOpacity: 0.85 }}
            eventHandlers={{ click: () => setSelected(m.id) }}
          >
            <Popup>{m.name}<br />Messwert: {m.value}</Popup>
          </CircleMarker>
        ))}
        {mode === 'heat' && (
          <div className="legend">
            <span>1</span><div className="bar" /><span>100</span>
          </div>
        )}
      </MapContainer>
    </div>
  )
}
