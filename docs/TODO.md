# 📋 Weekly GTM League - TODO

**Laatste update:** 2026-05-08 12:40

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

### Bugfixes
- [x] Fix: sort() vs sorted() bug (backend crashte)
- [x] Fix: 5 films in plaats van 4
- [x] Fix: 9 opties in plaats van 4 (full pool nodig)
- [x] Fix: poort conflict (backend serveert nu ook static files)
- [x] Fix: frontend BACKEND_URL dynamisch (window.location.origin)

---

## 🚀 In Progress

### Kwaliteitscontrole
- [ ] Tekst detectie in stills (OCR of AI)
- [ ] Automatische filtering van stills met ondertitels/watermarks

---

## 🔄 Tech Stack (huidige implementatie)

**Backend:**
- Python 3 HTTP server (standalone, geen framework nodig)
- SQLite (weekly challenges + blacklist)
- requests (TMDB API calls)

**Frontend:**
- HTML/CSS/JavaScript (single-page)
- Geen build tools nodig

**Extern:**
- TMDB API (films, stills, backdrops)

---

## 📝 Openstaande taken

### Fase 5: Deployment CBS
- [ ] Deploy naar CBS server (poort 30067)
- [ ] start-server.sh als systemd service
- [ ] Firewall regel voor poort 30067
- [ ] Test met collega's

### Fase 6: AD Integratie
- [ ] Login via CBS Active Directory
- [ ] User scores koppelen aan AD username
- [ ] Leaderboard per gebruiker

### Fase 7: Leaderboard en scores
- [ ] Score opslaan in database per gebruiker
- [ ] Wekelijks leaderboard
- [ ] Seizoen leaderboard
- [ ] Streak counter

### Fase 8: Community content
- [ ] Mystery film upload formulier
- [ ] Approval queue voor mystery films
- [ ] Rating systeem na afloop challenge

### Fase 9: Polish
- [ ] Slack/Teams notificatie bij nieuwe challenge
- [ ] Responsive design verbeteren
- [ ] Performance optimalisatie

---

## 📊 Voortgang

**Fase 1:** 100% ✅
**Fase 2:** 100% ✅
**Fase 3:** 100% ✅
**Fase 4:** 100% ✅
**Fase 5:** 0% (0/4)
**Fase 6:** 0% (0/3)
**Fase 7:** 0% (0/4)
**Fase 8:** 0% (0/3)
**Fase 9:** 0% (0/3)

**Totaal:** ~60% (kern gameplay en admin werkend)

---

## 🎯 Next Steps

1. Test met collega's op lokaal netwerk
2. Deploy naar CBS server
3. AD integratie voor leaderboard
