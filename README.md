# Map Tool

Messwerte auf einer Berlin-Karte (React + Vite + TypeScript + Leaflet): Punktansicht oder Heatmap.

```bash
npm install
npm run dev
```

`npm run build` erzeugt eine einzelne, eigenständige `dist/index.html` (per Doppelklick im Browser nutzbar, keine Adminrechte nötig).

## Hintergrundkarte

Die App nutzt in dieser Reihenfolge:

1. **Statisches OSM-Bild** `src/assets/berlin-map.png` (+ `berlin-map.json`) – eingebettet, braucht kein Internet.
2. Vektorkarte `src/assets/berlin.pmtiles` (optional, siehe unten).
3. Online-Kacheln (CARTO, Block `ONLINE_TILES` in `src/App.tsx`).

### Statisches Bild erzeugen (empfohlen)

Einmalig auf einem Rechner **mit Internet** (Node.js nötig, keine Adminrechte):

```bash
npm install
node scripts/make-berlin-image.mjs        # Zoom 12, ~70 Kacheln
node scripts/make-berlin-image.mjs 13     # schärfer, ~280 Kacheln, größere Datei
npm run build                             # dist/index.html enthält das Bild
```

Das Skript lädt die OSM-Kacheln einmalig mit eigenem User-Agent (OSM-Tile-Usage-Policy), setzt sie zu einem PNG
zusammen und schreibt die Bildgrenzen in `berlin-map.json`. Wer das Bild ins Repo einchecken will, kann das tun
(einige MB).

### Optional: Vektorkarte (PMTiles)

`scripts/fetch-berlin-tiles.sh` erzeugt `src/assets/berlin.pmtiles` (benötigt die
[pmtiles-CLI](https://github.com/protomaps/go-pmtiles/releases)); scharf bis Zoom 14, zoombar, aber deutlich größer.

Kartendaten: © OpenStreetMap-Mitwirkende.
