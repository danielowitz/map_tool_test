import { useMemo, useState } from 'react'
import { CircleMarker, GeoJSON, MapContainer, Pane, Popup } from 'react-leaflet'
import type { Feature } from 'geojson'
import type { Layer, LatLngBoundsLiteral } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { generateMeasurements } from './data'
import districts from './assets/berlin-bezirke.json'
import HeatLayer from './HeatLayer'
import './App.css'

type Mode = 'points' | 'heat'

const BERLIN_BOUNDS: LatLngBoundsLiteral = [[52.33, 13.08], [52.68, 13.77]]

// Pastellfarbe je Bezirk (im Heatmap-Modus per CSS auf Grau gesetzt)
const districtNames: string[] = (districts as unknown as { features: Feature[] }).features.map(
  (f) => f.properties?.name as string,
)
const fillFor = (name?: string) => `hsl(${(districtNames.indexOf(name ?? '') * 47) % 360}, 45%, 88%)`

// Farbskala: niedrig = blau, hoch = rot
function colorFor(value: number): string {
  const hue = 240 - ((value - 1) / 99) * 240
  return `hsl(${hue}, 85%, 50%)`
}

function labelDistrict(feature: Feature, layer: Layer) {
  layer.bindTooltip(feature.properties?.name, { permanent: true, direction: 'center', className: 'district-label' })
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
      <MapContainer
        bounds={BERLIN_BOUNDS}
        maxBounds={[[52.2, 12.9], [52.8, 13.95]]}
        minZoom={9}
        maxZoom={16}
        zoomSnap={0.5}
        className="map"
        attributionControl
      >
        {/* Ebenen von unten nach oben: Bezirksflächen, Heatmap, Grenzen + Punkte */}
        <Pane name="fill" style={{ zIndex: 300 }}>
          <GeoJSON
            data={districts as unknown as GeoJSON.FeatureCollection}
            style={(f) => ({ stroke: false, fillColor: fillFor(f?.properties?.name), fillOpacity: 1, className: 'district-fill' })}
          />
        </Pane>
        <Pane name="heat" style={{ zIndex: 350 }}>
          {mode === 'heat' && <HeatLayer data={data} />}
        </Pane>
        <GeoJSON
          data={districts as unknown as GeoJSON.FeatureCollection}
          style={{ color: '#666', weight: 1.2, fill: false }}
          attribution='Bezirksgrenzen: <a href="https://www.statistik-berlin-brandenburg.de">Amt für Statistik Berlin-Brandenburg</a> (CC BY)'
          onEachFeature={labelDistrict}
          interactive={false}
        />
        {mode === 'points' &&
          data.map((m) => (
            <CircleMarker
              key={m.id}
              center={[m.lat, m.lng]}
              radius={m.id === selected ? 10 : 6}
              pathOptions={{ color: m.id === selected ? '#000' : '#fff', weight: 1, fillColor: colorFor(m.value), fillOpacity: 0.9 }}
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
