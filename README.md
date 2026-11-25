# Map Tool

Messwerte auf einer Berlin-Karte (React + Vite + TypeScript + Leaflet): Punktansicht oder Heatmap.
Die Karte besteht aus einfachen Umrissen von Berlin und den 12 Bezirken – komplett offline, keine Kartenserver nötig.

```bash
npm install
npm run dev
```

`npm run build` erzeugt eine einzelne, eigenständige `dist/index.html` (per Doppelklick im Browser nutzbar,
keine Adminrechte, kein Internet nötig). Eine fertige Kopie liegt als `map-tool.html` im Repo.

## Daten

- `src/assets/berlin-bezirke.json`: vereinfachte Bezirksgrenzen (GeoJSON, WGS84).
  Quelle: Amt für Statistik Berlin-Brandenburg, Lizenz CC BY
  (über <https://github.com/funkeinteraktiv/Berlin-Geodaten>, vereinfacht).
- `src/data.ts`: erzeugt 500 zufällige Messpunkte (Wert 1–100), die innerhalb der Bezirksgrenzen liegen.
