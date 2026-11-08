import { useMemo, useState } from 'react'
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { generateMeasurements } from './data'
import './App.css'

// Farbskala: niedrig = blau, hoch = rot
function colorFor(value: number): string {
  const hue = 240 - ((value - 1) / 99) * 240
  return `hsl(${hue}, 85%, 50%)`
}

export default function App() {
  const data = useMemo(() => generateMeasurements(500), [])
  const [selected, setSelected] = useState<number | null>(null)

  return (
    <div className="layout">
      <aside className="table-panel">
        <h1>Map Tool</h1>
        <p>{data.length} Messwerte in Berlin</p>
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
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {data.map((m) => (
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
      </MapContainer>
    </div>
  )
}
