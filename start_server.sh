#!/bin/bash

# Make sure we are in the correct directory
cd "$(dirname "$0")"

# Create logs directory if it doesn't exist
mkdir -p logs

# Kill any existing server process
echo "Stopping any running server processes..."
pkill -f 'python.*server.py' || true

# Wait for the port to be released
echo "Waiting for port to be released..."
sleep 2

# Start the server in the foreground
echo "Starting server..."
python3 src/server/server.py 2>&1 | tee logs/app.log 