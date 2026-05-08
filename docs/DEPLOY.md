# GTM Deployment Guide - CBS Server

## Vereisten

- RHEL 8/9 of Rocky Linux 9 server
- Python 3.8+
- Poort 30067 open in firewall
- Optioneel: nginx als reverse proxy voor HTTPS

## Installatie

```bash
# 1. Service account aanmaken
sudo useradd -r -s /sbin/nologin -d /opt/gtm gtm

# 2. Bestanden deployen
sudo mkdir -p /opt/gtm/static
sudo cp backend.py game-server.sh /opt/gtm/
sudo cp static/*.html /opt/gtm/static/
sudo cp requirements.txt /opt/gtm/
sudo chown -R gtm:gtm /opt/gtm

# 3. Python dependencies
sudo pip3 install -r /opt/gtm/requirements.txt

# 4. Systemd service installeren
sudo cp gtm-game.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable gtm-game.service
sudo systemctl start gtm-game.service

# 5. Firewall
sudo firewall-cmd --permanent --add-port=30067/tcp
sudo firewall-cmd --reload
```

## Admin account aanmaken

Na eerste start, maak een admin account aan:

```bash
python3 -c "
import sys; sys.path.insert(0, '/opt/gtm')
from backend import init_db, register_user
init_db()
register_user('admin', 'KIES_EEN_WACHTWOORD', 'Admin', is_admin=True)
print('Admin account aangemaakt')
"
```

## Status checken

```bash
sudo systemctl status gtm-game.service
curl -s http://localhost:30067/api/leaderboard | python3 -m json.tool
```

## Logs bekijken

```bash
sudo journalctl -u gtm-game.service -f
```

## Database backup

```bash
# De hele state zit in 1 file:
cp /opt/gtm/weekly_challenges.db /backup/gtm-$(date +%Y%m%d).db
```

## Nginx Reverse Proxy (optioneel, voor HTTPS)

```nginx
server {
    listen 443 ssl;
    server_name gtm.cbsp.nl;
    
    ssl_certificate /etc/pki/tls/certs/gtm.cbsp.nl.crt;
    ssl_certificate_key /etc/pki/tls/private/gtm.cbsp.nl.key;
    
    location / {
        proxy_pass http://127.0.0.1:30067;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_buffering off;
    }
}
```

## Schaalbaarheidsnote

SQLite is voldoende voor 2900 gebruikers die 1x per week spelen:
- ~2900 writes/week (scores) = verwaarloosbaar
- ~500 concurrent reads (leaderboard checks) = prima met WAL mode
- Geen horizontale schaling nodig bij single-server deployment

Voor WAL mode (betere concurrent performance):
```python
# Wordt automatisch ingeschakeld in backend.py
# Handmatig: sqlite3 weekly_challenges.db "PRAGMA journal_mode=WAL;"
```
