#!/bin/sh
# Obrasci (HTML u ovom folderu) → PDF u public/files/, preko Chrome-a bez prozora. Pokretanje iz korena projekta:
#   sh docs/obrasci/napravi.sh
# Datum u imenu fajla je datum izdanja; kad se tekst promeni, promeni se i datum, pa i putanje u src/lib/dokumenti.ts.
set -e
DATUM=27-10-2026
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
DIR="$(cd "$(dirname "$0")" && pwd)"
OUT="$DIR/../../public/files"
mkdir -p "$OUT"
for ime in izjava-o-odustanku dodatak-uz-izjavu-o-odustanku; do
  "$CHROME" --headless=new --disable-gpu --no-pdf-header-footer --user-data-dir="$(mktemp -d)" \
    --print-to-pdf="$OUT/HTZ-Shop-$ime-$DATUM.pdf" "file://$DIR/$ime.html" 2>/dev/null
  echo "public/files/HTZ-Shop-$ime-$DATUM.pdf"
done
