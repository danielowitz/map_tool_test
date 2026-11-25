# Map Tool

Messwerte auf einer Berlin-Karte (React + Vite + TypeScript + Leaflet): Punktansicht oder Heatmap.

```bash
npm install
npm run dev
```

`npm run build` erzeugt eine einzelne, eigenständige `dist/index.html` (per Doppelklick im Browser nutzbar, keine Adminrechte nötig).

## Offline-Straßenkarte

Ohne weitere Schritte lädt die App die Karte online von OpenStreetMap. Für den Offline-Betrieb:

1. [pmtiles-CLI](https://github.com/protomaps/go-pmtiles/releases) herunterladen (einzelne Datei) und in den `PATH` legen.
2. Auf einem Rechner **mit Internet**: `scripts/fetch-berlin-tiles.sh` ausführen
   (optional `scripts/fetch-berlin-tiles.sh 13` für eine kleinere Datei mit weniger Zoomstufen).
   Das erzeugt `src/assets/berlin.pmtiles`.
3. `npm run build` – `dist/index.html` enthält jetzt die Karte und funktioniert komplett offline.

Liegt `src/assets/berlin.pmtiles` nicht vor, nutzt die App automatisch wieder die Online-Kacheln.
Kartendaten: © OpenStreetMap-Mitwirkende, aufbereitet von Protomaps.
