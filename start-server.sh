#!/bin/bash
# Portable webserver for GTM on port 30067
PORT=30067
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/static"

echo "Starting GTM webserver on port $PORT..."
echo "Serving from: $DIR"
echo "Open http://localhost:$PORT/weekly-game.html"

cd "$DIR"
python3 -m http.server $PORT
