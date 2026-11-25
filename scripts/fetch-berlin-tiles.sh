#!/usr/bin/env bash
# Erzeugt src/assets/berlin.pmtiles (Berlin-Ausschnitt der Protomaps-Basiskarte, OpenStreetMap-Daten).
# Voraussetzung: Internetzugang und die pmtiles-CLI
#   https://github.com/protomaps/go-pmtiles/releases  (einzelne Datei, keine Installation/Adminrechte nötig)
#
# Aufruf:  scripts/fetch-berlin-tiles.sh [MAXZOOM] [BUILD_URL]
#   MAXZOOM    höchste Zoomstufe (Standard 14; 13 = deutlich kleiner, 15 = sehr detailliert)
#   BUILD_URL  z. B. https://build.protomaps.com/20261120.pmtiles
#              (Standard: neuester Build laut https://build-metadata.protomaps.dev/builds.json)
set -euo pipefail
cd "$(dirname "$0")/.."

MAXZOOM="${1:-14}"
URL="${2:-}"
if [ -z "$URL" ]; then
  KEY=$(curl -fsSL https://build-metadata.protomaps.dev/builds.json | grep -o '"key": *"[0-9]*\.pmtiles"' | tail -1 | grep -o '[0-9]*\.pmtiles')
  [ -n "$KEY" ] || { echo "Konnte neuesten Build nicht ermitteln - bitte BUILD_URL als 2. Argument angeben (siehe https://maps.protomaps.com/builds/)"; exit 1; }
  URL="https://build.protomaps.com/$KEY"
fi

mkdir -p src/assets
echo "Lade Berlin-Ausschnitt aus $URL (bis Zoom $MAXZOOM) ..."
pmtiles extract "$URL" src/assets/berlin.pmtiles --bbox=13.05,52.33,13.80,52.68 --maxzoom="$MAXZOOM"
ls -lh src/assets/berlin.pmtiles
echo "Fertig. Jetzt 'npm run build' ausführen - dist/index.html enthält die Karte."
