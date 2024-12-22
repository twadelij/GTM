#!/bin/bash

# Functie om te controleren of de poort in gebruik is
check_port() {
    netstat -tuln | grep ":8888 "
}

# Functie om oude server processen te vinden en te stoppen
cleanup_old_server() {
    echo "Checking for old server processes..."
    
    # Zoek en stop alle python server processen
    OLD_PIDS=$(pgrep -f "python3.*server.py")
    if [ ! -z "$OLD_PIDS" ]; then
        echo "Found old server processes (PIDs: $OLD_PIDS). Stopping them..."
        kill $OLD_PIDS 2>/dev/null
        sleep 2
        # Force kill if still running
        kill -9 $OLD_PIDS 2>/dev/null
    fi
    
    # Wacht tot de poort vrij is (max 30 seconden)
    WAIT_COUNT=0
    while check_port > /dev/null; do
        echo "Waiting for port 8888 to be released... ($WAIT_COUNT/30)"
        sleep 1
        WAIT_COUNT=$((WAIT_COUNT + 1))
        if [ $WAIT_COUNT -ge 30 ]; then
            echo "Error: Port 8888 is still in use after 30 seconds"
            echo "Trying to force close the port..."
            # Probeer het socket te sluiten
            fuser -k 8888/tcp
            sleep 2
            if check_port > /dev/null; then
                echo "Error: Could not free port 8888. Please restart the system."
                exit 1
            fi
            break
        fi
    done
}

# Ga naar de project root directory
cd "$(dirname "$0")/../.."
PROJECT_ROOT=$(pwd)

# Controleer of we in de juiste directory zijn
if [ ! -d "src/server" ] || [ ! -d "src/client" ]; then
    echo "Error: Not in the correct project directory"
    echo "Current directory: $(pwd)"
    echo "Please run this script from the project root or server directory"
    exit 1
fi

# Stop oude server processen en maak poort vrij
cleanup_old_server

# Start de server
echo "Starting server..."
cd src/server

# Start in productie modus (blijft draaien na sluiten terminal)
nohup python3 server.py > server.out 2>&1 &
SERVER_PID=$!

# Wacht even en check of de server nog draait
sleep 2
if ps -p $SERVER_PID > /dev/null; then
    echo "Server started successfully (PID: $SERVER_PID)"
    echo "You can now access the game at:"
    echo "- http://localhost:8888"
    echo "- http://127.0.0.1:8888"
    echo "- http://$(hostname -I | cut -d' ' -f1):8888"
    echo ""
    echo "To stop the server, run: kill $SERVER_PID"
    echo "Server logs available in: src/server/server.log"
    echo "Server output available in: src/server/server.out"
else
    echo "Error: Server failed to start. Check server.out for details"
    cat server.out
    exit 1
fi
