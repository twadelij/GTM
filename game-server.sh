#!/bin/bash
# GTM Game Server Control Script
# Usage: ./game-server.sh {start|stop|status|restart}

PORT=30067
PIDFILE="/tmp/gtm-server.pid"
LOGFILE="/tmp/gtm-server.log"

cd "$(dirname "${BASH_SOURCE[0]}")"

start() {
    if [ -f "$PIDFILE" ]; then
        PID=$(cat "$PIDFILE")
        if ps -p $PID > /dev/null 2>&1; then
            echo "GTM server is already running (PID: $PID)"
            return 1
        else
            rm "$PIDFILE"
        fi
    fi
    
    echo "Starting GTM backend on port $PORT..."
    echo "Backend serves both API and static files"
    echo "Open http://localhost:$PORT/weekly-game.html"
    echo "Admin panel: http://localhost:$PORT/admin.html"
    
    nohup python3 backend.py > "$LOGFILE" 2>&1 &
    echo $! > "$PIDFILE"
    
    sleep 2
    if ps -p $(cat "$PIDFILE") > /dev/null 2>&1; then
        echo "GTM server started successfully (PID: $(cat "$PIDFILE"))"
        echo "Logs: $LOGFILE"
    else
        echo "Failed to start GTM server"
        rm "$PIDFILE"
        return 1
    fi
}

stop() {
    if [ ! -f "$PIDFILE" ]; then
        echo "GTM server is not running"
        return 1
    fi
    
    PID=$(cat "$PIDFILE")
    if ps -p $PID > /dev/null 2>&1; then
        echo "Stopping GTM server (PID: $PID)..."
        kill $PID
        sleep 1
        if ps -p $PID > /dev/null 2>&1; then
            echo "Force killing GTM server..."
            kill -9 $PID
        fi
        rm "$PIDFILE"
        echo "GTM server stopped"
    else
        echo "GTM server is not running (stale PID file)"
        rm "$PIDFILE"
    fi
}

status() {
    if [ -f "$PIDFILE" ]; then
        PID=$(cat "$PIDFILE")
        if ps -p $PID > /dev/null 2>&1; then
            echo "GTM server is running (PID: $PID)"
            echo "URL: http://localhost:$PORT"
            echo "Logs: $LOGFILE"
            return 0
        else
            echo "GTM server is not running (stale PID file)"
            rm "$PIDFILE"
            return 1
        fi
    else
        echo "GTM server is not running"
        return 1
    fi
}

restart() {
    stop
    sleep 1
    start
}

case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    status)
        status
        ;;
    restart)
        restart
        ;;
    *)
        echo "Usage: $0 {start|stop|status|restart}"
        exit 1
        ;;
esac
