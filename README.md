---
title: Weekly GTM League
created: 2026-05-08
updated: 2026-05-08
tags: [game, movies, weekly, team]
aliases: [GTM, Weekly Movie Game]
---

# 🎬 Weekly GTM League

Wekelijks ontspannend spel via gtm.cbsp.nl, laag maintenance, groep en individueel speelbaar.

## 📁 Projectstructuur

- `src/` - Backend code (FastAPI)
  - `api/` - API routes
  - `models/` - Database models (SQLAlchemy)
  - `services/` - Business logic (AD auth, TMDB)
  - `config/` - Configuration
  - `core/` - Core functionality
- `static/` - Frontend code
  - `weekly-game.html` - Weekly challenge game interface
- `data/` - Data files (uploads, TMDB cache)
- `docs/` - Projectdocumentatie
- `scripts/` - Utility scripts
- `uploads/` - User uploads (mystery films)

## 🎮 Gameplay

**Weekly Challenge:**
- 5 films per week (4 via TMDB API, 1 mystery via community)
- 1 ronde per film, 30 seconden per film
- Multiple choice met 4 opties
- Score: 10 punten per correct antwoord + snelheidsbonus (max 5 extra)
- Mystery film: 30 punten (3x bonus)
- Totale speeltijd: 2-3 minuten per week

**Features:**
- Leaderboard (wekelijks en seizoens)
- Team modus (optioneel)
- Rating systeem voor films
- Badges en levels
- Seizoen competitie

## 🛠️ Tech Stack

**Backend:**
- Python FastAPI
- PostgreSQL (SQLAlchemy ORM)
- Alembic migrations
- python-ldap (AD integratie)
- httpx (TMDB API)

**Frontend:**
- HTML/CSS/JavaScript
- Netflix/Jellyfin inspired styling

**Infrastructure:**
- Docker Compose (PostgreSQL + Backend)
- Active Directory (CBS AD voor authenticatie)

## 📋 Setup

**1. Clone repository:**
```bash
git clone https://github.com/twadelij/GTM.git
cd GTM
```

**2. Configure environment:**
```bash
cp .env.example .env
# Edit .env with your settings:
# - TMDB_API_KEY (get from https://www.themoviedb.org/settings/api)
# - AD_SERVER, AD_BASE_DN, AD_BIND_USER, AD_BIND_PASSWORD
# - DATABASE_URL
```

**3. Start with Docker:**
```bash
docker-compose up -d
```

**4. Access game:**
- Open http://localhost:8888/static/weekly-game.html

## 📖 Documentatie

- `docs/GAME_DESIGN_PROPOSAL.md` - Volledig game design voorstel
- `docs/TODO.md` - Voortgangsbijhouding
- `docs/Technical-Details.md` - Technische details
- `docs/Troubleshooting.md` - Troubleshooting guide

## 🚀 Development

**Start development server:**
```bash
docker-compose up backend
```

**Run migrations:**
```bash
docker-compose exec backend alembic upgrade head
```

**Run tests:**
```bash
docker-compose exec backend pytest tests/
```

## 🤝 Bijdragen

Bijdragen zijn welkom! Zie docs/TODO.md voor huidige taken.

## 📄 Licentie

Dit project is gelicenseerd onder de MIT License.