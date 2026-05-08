# 📋 Weekly GTM League - TODO

**Laatste update:** 2026-05-08

---

## ✅ Voltooid

- [x] Game design voorstel geschreven (GAME_DESIGN_PROPOSAL.md)
- [x] TMDB API onderzocht (gratis, geen whitelisting nodig)
- [x] Tech stack bepaald: FastAPI (Python) + PostgreSQL + HTML/CSS/JS
- [x] requirements.txt opgeschoond (Stripe, Redis, Google OAuth verwijderd, python-ldap toegevoegd)
- [x] docker-compose.yml opgeschoond (Redis, Nginx verwijderd, AD environment variables toegevoegd)
- [x] AD auth service module gemaakt (src/services/ad_auth.py)
- [x] docs/TODO.md aangemaakt
- [x] Git commit en push naar GitHub
- [x] Frontend game interface gemaakt (static/weekly-game.html)

---

## 🚀 In Progress

### Analyseer huidige codebase op herbruikbaarheid
- [x] Backend: FastAPI al aanwezig - herbruikbaar
- [x] Database: PostgreSQL al in docker-compose.yml - herbruikbaar
- [x] Models: GameSession, GameResult, Leaderboard - deels herbruikbaar
- [ ] Auth: Google OAuth moet worden vervangen door AD
- [ ] Frontend: HTML/CSS/JS kan als basis worden gebruikt

---

## 🔄 Tech Stack

**Backend:**
- Python FastAPI (al aanwezig)
- PostgreSQL (al aanwezig in docker-compose.yml)
- SQLAlchemy ORM (al aanwezig)
- Alembic migrations (al aanwezig)

**Frontend:**
- HTML/CSS/JS (al aanwezig in src/client/)
- Kan later worden uitgebreid met React

**Integraties:**
- TMDB API (httpx al in requirements.txt)
- AD/LDAP (python-ldap of ldap3 moet worden toegevoegd)

---

## 📝 Taken

### Fase 1: Opruimen en voorbereiden
- [ ] Verwijder Stripe/monetization dependencies
- [ ] Verwijder Google OAuth auth routes
- [ ] Verwijder Redis (niet nodig voor MVP)
- [ ] Update requirements.txt
- [ ] Update docker-compose.yml (verwijder nginx, redis)
- [ ] Maak docs/TODO.md aan ✅

### Fase 2: AD Integratie basis
- [ ] Voeg python-ldap of ldap3 toe aan requirements.txt
- [ ] Maak AD/LDAP auth module
- [ ] Update User model (google_id -> ad_username)
- [ ] Maak AD auth routes
- [ ] Test AD verbinding met CBS AD

### Fase 3: Database update voor nieuwe gameplay
- [ ] Update GameSession model (5 films, 1 ronde)
- [ ] Maak WeeklyChallenge model
- [ ] Maak Film model (TMDB + community)
- [ ] Maak FilmRating model
- [ ] Maak Team model
- [ ] Voeg Alembic migration toe

### Fase 4: TMDB API integratie
- [ ] Maak TMDB service module
- [ ] Implementeer film selectie logica
- [ ] Implementeer backdrop image ophalen
- [ ] Test TMDB API key setup

### Fase 5: Backend routes
- [ ] Maak weekly challenge generator
- [ ] Maak game submission endpoint
- [ ] Maak leaderboard endpoints
- [ ] Maak film rating endpoint
- [ ] Maak team management endpoints

### Fase 6: Frontend game interface (zonder login)
- [ ] Update HTML voor nieuwe gameplay (5 films)
- [ ] Update CSS voor moderne styling
- [ ] Maak JavaScript voor game logic
- [ ] Maak leaderboard view
- [ ] Maak film rating interface

### Fase 7: Frontend login
- [ ] Maak login pagina
- [ ] Koppel login aan AD auth
- [ ] Maak user profile pagina

### Fase 8: Automatisering
- [ ] Maak cron job voor weekly challenge generator
- [ ] Configureer Slack notificaties
- [ ] Test automatische weekly challenge

### Fase 9: Testing en deployment
- [ ] Test met kleine groep
- [ ] Deploy naar gtm.cbsp.nl
- [ ] Monitor performance
- [ ] Bug fixes

---

## 🗑️ Niet herbruikbaar (verwijderen)

**Code:**
- src/api/routes/auth.py (Google OAuth - vervangen door AD)
- src/models/user.py (google_id field - aanpassen voor AD)
- Stripe dependencies in requirements.txt
- Redis service in docker-compose.yml
- Nginx in docker-compose.yml (voor nu)

**Features:**
- Monetization (Stripe)
- Google OAuth
- Redis caching
- Huidige gameplay (10 films, 6 rounds) - vervangen door 5 films, 1 ronde

---

## 📊 Voortgang

**Fase 1:** 0% (0/6)
**Fase 2:** 0% (0/6)
**Fase 3:** 0% (0/7)
**Fase 4:** 0% (0/4)
**Fase 5:** 0% (0/5)
**Fase 6:** 0% (0/5)
**Fase 7:** 0% (0/3)
**Fase 8:** 0% (0/3)
**Fase 9:** 0% (0/4)

**Totaal:** 0% (0/43)

---

## 🎯 Next Steps

1. Opruimen niet-herbruikbare code
2. AD integratie basis opzetten
3. Frontend game interface bouwen (zonder login)
