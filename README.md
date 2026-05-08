---
title: Weekly GTM League
created: 2026-05-08
updated: 2026-05-08
tags: [game, movies, weekly, team]
aliases: [GTM, Weekly Movie Game]
---

# 🎬 Weekly GTM League

Wekelijks ontspannend spel via gtm.cbsp.nl, laag maintenance, groep en individueel speelbaar.

## � Quick Start

1. Clone de repository:
```bash
git clone https://github.com/twadelij/GTM.git
cd GTM
```

2. Installeer dependencies:
```bash
pip install -r requirements.txt
```

3. Start de backend (serveert zowel API als static files):
```bash
./game-server.sh start
# Of direct:
python3 backend.py
```

Server beheer:
```bash
./game-server.sh status   # Check of server draait
./game-server.sh stop     # Stop server
./game-server.sh restart  # Herstart server
```

4. Open de browser:
```
http://localhost:30067/weekly-game.html
```

## 🎮 Gameplay

- **5 films** per weekly challenge
- **30 seconden** per film
- **9 keuzes** per film (genre-matched)
- **Puntentelling:**
  - Normale film: 10 punten
  - Mystery film: 30 punten
  - Tijdbonus: max 5 punten (sneller = meer bonus)
- **Max score:** 75 punten per week (5 films × 15 punten)

## 🔧 Backend API

De backend draait op poort 30067 en serveert zowel API als static files:

- `GET /api/weekly-challenge` - Huidige weekly challenge ophalen
- `GET /api/generate-challenge` - Forceer nieuwe weekly challenge genereren
- `GET /api/blacklist` - Bekijk blacklist
- `POST /api/blacklist` - Film toevoegen aan blacklist
- `DELETE /api/blacklist` - Film verwijderen van blacklist
- `GET /weekly-game.html` - Frontend game interface
- `GET /admin.html` - Admin panel voor kwaliteitscontrole
- `GET /static/*` - Static files

De backend gebruikt SQLite voor weekly challenge storage en blacklist. Iedereen krijgt dezelfde films die week.

## 🏗️ Project Structuur

```
GTM/
├── backend.py              # Backend server (API + static files)
├── game-server.sh          # Script om backend te beheren (start/stop/status)
├── static/
│   ├── weekly-game.html    # Frontend game interface
│   └── admin.html          # Admin panel voor kwaliteitscontrole
├── test_backend.py         # End-to-end tests voor backend
├── docs/
│   ├── GAME_DESIGN_PROPOSAL.md
│   └── TODO.md
├── requirements.txt
└── weekly_challenges.db    # SQLite database (wordt aangemaakt bij eerste run)
```

## 🛠️ Tech Stack

**Backend:**
- Python HTTP server (standalone, geen FastAPI nodig voor MVP)
- SQLite (weekly challenge storage)
- requests (TMDB API)

**Frontend:**
- HTML/CSS/JavaScript

## 📖 Documentatie

- `docs/GAME_DESIGN_PROPOSAL.md` - Volledig game design voorstel
- `docs/TODO.md` - Voortgangsbijhouding

## 🤝 Bijdragen

Bijdragen zijn welkom! Zie docs/TODO.md voor huidige taken.

## 📄 Licentie

Dit project is gelicenseerd onder de MIT License.