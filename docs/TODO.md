# 📋 Weekly GTM League - TODO

**Laatste update:** 2026-05-08 15:45

---

## ✅ Voltooid

### Fase 1: Basis opzetten
- [x] Game design voorstel geschreven (GAME_DESIGN_PROPOSAL.md)
- [x] TMDB API onderzocht (gratis, geen whitelisting nodig)
- [x] requirements.txt opgeschoond
- [x] docs/TODO.md aangemaakt

### Fase 2: Backend MVP
- [x] Simpele Python HTTP server (backend.py) op poort 30067
- [x] SQLite database voor weekly challenge storage
- [x] TMDB API integratie (3 pages, 60 films pool)
- [x] Weekly challenge generator (5 films per week)
- [x] 9 genre-gematchte keuzes per film
- [x] Blacklist tabel in database
- [x] API endpoints:
  - `GET /api/weekly-challenge` - Huidige weekly challenge
  - `GET /api/generate-challenge` - Forceer nieuwe challenge
  - `GET /api/blacklist` - Bekijk blacklist
  - `POST /api/blacklist` - Film blacklisten
  - `DELETE /api/blacklist` - Film van blacklist verwijderen
- [x] Static file serving (frontend + admin vanuit zelfde server)
- [x] End-to-end test script (test_backend.py)

### Fase 3: Frontend game
- [x] Frontend game interface (static/weekly-game.html)
- [x] 5 films per weekly challenge
- [x] 30 seconden timer per film
- [x] 9 keuzes in 3x3 grid layout
- [x] Direct antwoord bij klikken (geen bevestig knop)
- [x] Score systeem met tijdbonus
- [x] Mystery film badge + 3x bonus
- [x] Rating interface na afloop
- [x] Resultaat scherm met totaalscore

### Fase 4: Admin panel
- [x] Admin scherm (static/admin.html)
- [x] Stills laden en bekijken
- [x] Films blacklisten via backend API
- [x] Blacklist bekijken en beheren
- [x] Films van blacklist verwijderen
- [x] Blacklist wordt meegenomen bij challenge generatie

### Fase 4b: Admin panel verbeterd
- [x] 25 willekeurige stills laden (ipv 5 gecachte)
- [x] Nieuw `/api/random-stills` endpoint
- [x] Blacklisten verwijdert card direct uit grid
- [x] Zwevende meldingen (page shift fix)
- [x] TMDB rating tonen per film in admin
- [x] Fix apostrophe bug (films met ' konden niet afgewijkt worden)
- [x] Approved films pool: goedgekeurde films worden opgeslagen in DB
- [x] Reject still: wijst alleen de foto af, film kan terugkomen met andere foto
- [x] Goedgekeurde films worden niet meer aangeboden in admin
- [x] Game pool counter in admin (toont hoeveel goedgekeurde films beschikbaar)
- [x] Game gebruikt goedgekeurde films als pool >= 10

### Fase 4c: Game verbeteringen
- [x] Score tracking (localStorage)
- [x] Per-film breakdown na afloop
- [x] Kopieer resultaat naar clipboard (voor Slack/Teams)
- [x] Responsive design (2 kolommen tablet, 1 kolom mobiel)
- [x] Content-Length header (server hing bij HTTP/1.1)

### Bugfixes
- [x] Fix: sort() vs sorted() bug (backend crashte)
- [x] Fix: 5 films in plaats van 4
- [x] Fix: 9 opties in plaats van 4 (full pool nodig)
- [x] Fix: poort conflict (backend serveert nu ook static files)
- [x] Fix: frontend BACKEND_URL dynamisch (window.location.origin)

---

## 🚀 In Progress

### Admin verbeteringen
- [ ] Tekst detectie in stills (OCR of AI) — subtitle/watermark filtering
- [ ] Bulk import: TMDB top-rated (rating > 8) auto-approve
- [ ] Admin statistieken dashboard (hoeveel films/week, reject ratio)
- [ ] Export/import approved pool (JSON backup)
- [ ] Min-rating filter slider in admin UI
- [ ] "Ban hele film" knop direct vanuit review kaartje
- [ ] Admin: verwijder film uit approved pool
- [ ] Admin: bekijk rejected stills history
- [ ] Notificatie als approved pool onder 20 zakt

---

## 🔄 Tech Stack (huidige implementatie)

**Backend:**
- Python 3 HTTP server (standalone, geen framework nodig)
- SQLite (5 tabellen: weekly_challenges, blacklist, approved_films, rejected_stills, scores)
- requests (TMDB API calls)

**Frontend:**
- HTML/CSS/JavaScript (single-page, geen build tools)
- Pagina's: weekly-game.html, admin.html, leaderboard.html

**Extern:**
- TMDB API (films, stills, backdrops, ratings)

**API Endpoints:**
- `GET /api/weekly-challenge` — Huidige challenge (auto-gen als nodig)
- `GET /api/random-stills?count=N` — Stills voor admin review
- `GET/POST /api/approve` — Goedgekeurde films pool
- `POST /api/reject-still` — Foto afkeuren (niet de film)
- `GET/POST/DELETE /api/blacklist` — Permanent ban
- `GET /api/can-play?name=X` — Check of speler al gespeeld heeft
- `POST /api/score` — Score opslaan (blokkeert dubbel)
- `GET /api/leaderboard?week=Y` — Wekelijks leaderboard

---

## 📝 Openstaande taken

### Fase 5: Deployment CBS
- [ ] Deploy naar CBS server (poort 30067)
- [ ] systemd service activeren (gtm-game.service voorbereid)
- [ ] Firewall regel voor poort 30067
- [ ] Test met collega's
- [ ] Reverse proxy (nginx) voor HTTPS

### Fase 6: Authenticatie
- [ ] Lokale login (bcrypt wachtwoorden) of AD integratie
- [ ] Session tokens (JWT of simple cookie)
- [ ] User profile met history
- [ ] Admin-only route beveiliging

### Fase 7: Seizoen en progression
- [ ] Seizoen leaderboard (per kwartaal reset)
- [ ] Badges (Perfect Week, Speed Demon, Streak Master)
- [ ] Levels (Film Fan → Cinema Master)

### Fase 8: Community content
- [ ] Mystery film upload formulier
- [ ] Approval queue voor mystery films
- [ ] Rating systeem na afloop challenge

### Fase 9: Polish en social
- [ ] Slack/Teams notificatie bij nieuwe challenge
- [ ] Team modus
- [ ] Statistics dashboard
- [ ] Performance: image preloading, lazy load

---

## 📊 Voortgang

**Fase 1 (Backend MVP):** 100% ✅
**Fase 2 (Frontend game):** 100% ✅
**Fase 3 (Admin panel basis):** 100% ✅
**Fase 4 (Admin QC + Approved pool):** 100% ✅
**Fase 4b (Scoring + Leaderboard):** 100% ✅
**Fase 5 (Deployment CBS):** 0% (0/5)
**Fase 6 (Authenticatie):** 0% (0/4)
**Fase 7 (Seizoen/progression):** 0% (0/3)
**Fase 8 (Community content):** 0% (0/3)
**Fase 9 (Polish/social):** 0% (0/4)

**Totaal:** ~55% van totale visie (kerngameplay volledig werkend, deployment en social nog open)

---

## 🎯 Next Steps

1. Test met collega's op lokaal netwerk
2. Deploy naar CBS server
3. AD integratie voor leaderboard
