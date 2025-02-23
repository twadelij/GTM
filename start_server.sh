#!/bin/bash

# Kill any existing server process
pkill -f 'python.*server.py'

# Wait a moment to ensure the port is released
sleep 1

# Start the server in the foreground
cd "$(dirname "$0")"
python3 src/server/server.py 