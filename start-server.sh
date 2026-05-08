#!/bin/bash
# Start GTM backend (serves both API and static files)
echo "Starting GTM backend on port 30067..."
echo "Backend serves both API and static files"
echo "Open http://localhost:30067/weekly-game.html"

cd "$(dirname "${BASH_SOURCE[0]}")"
python3 backend.py
