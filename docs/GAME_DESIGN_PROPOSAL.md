# 🎮 Game Design Proposal: Weekly GTM Challenge

**Doel:** Wekelijks ontspannend spel via gtm.cbsp.nl, laag maintenance, groep en individueel speelbaar

---

## 📋 Kernprobleem Analyse

**Oude Slack regels (goed werkte):**
- ✓ Rating systeem motiveerde goede plaatjes
- ✓ Anonieme inlevering via GM voorkwoged bias
- ✓ "Mysterie film E" (niet op IMDB) als extra uitdaging
- ✗ Te arbeidsintensief voor plaatjes-poster (stopte ermee)
- ✗ Handmatige Google Forms administratie

**Jouw GTM implementatie (light failure):**
- ✓ Automatische gameplay loop
- ✓ Progressive elimination werkt goed
- ✗ Single player (geen competitie)
- ✗ Geen community content generatie
- ✗ Te complex voor casual wekelijks gebruik

---

## 🎯 Nieuw Concept: "Weekly GTM League"

### Basisprincipes

**Automatisering is key**
- Geen handmatige plaatjes selectie
- Community draagt bij aan content pool
- Algoritme kiest wekelijkse selectie

**Simpel en laagdrempelig**
- 5 films per week (niet 10)
- 1 ronde per film (niet 6 rondes)
- 2 minuten speeltijd per sessie

**Social en competitief**
- Leaderboard per week en seizoen
- Team modus optioneel
- Rating systeem voor community content

---

## 🎮 Gameplay Loop

### Weekly Challenge (Individueel)

**Elke weekag (bijv. maandag 09:00):**
- Automatische selectie van 5 films uit pool
- 1 screenshot per film (willekeurig moment)
- Multiple choice met 4 opties
- 30 seconden per film
- Score: 10 punten per correct antwoord

**Puntentelling:**
- Correct antwoord: 10 punten
- Snelheidsbonus: max 5 extra punten (sneller = meer)
- Totaal per week: max 75 punten (5 × 15)

**Leaderboard:**
- Wekelijkse ranking (bijv. "Week 23 Top 10")
- Seizoen ranking (bijv. "Q2 2026")
- Streak counter (aantal weken op rij gespeeld)

### Team Mode (Optioneel)

**Teams van 3-5 personen:**
- Gemiddelde team score = team score
- Team captains kunnen samenwerken
- Chat functie om hints te delen
- Team leaderboard naast individuele leaderboard

---

## 🔄 Content Management

### TMDB API Integratie (4 van de 5 films)

**Waarom TMDB?**
- Gratis publieke API (geen whitelisting nodig)
- Rate limit: ~50 calls/second (ruimschoots genoeg)
- Heelt images API met backdrops/screenshots (16:9, minimaal 1280x720px)
- SSL ondersteund via api.themoviedb.org en image.tmdb.org CDN
- Screen captures toegestaan (precies wat je nodig hebt)

**Automatische selectie:**
```python
def select_tmdb_films():
    # Filter: vote_count > 1000 (proxy voor populariteit)
    # Sorteer: populariteit of random uit top 1000
    # Selecteer: 4 films met hoogste rating
    # Haal op: 1 willekeurige backdrop per film
    return films
```

**Voordelen:**
- Geen handmatige plaatjes selectie
- Oneindige content pool ( miljoenen films)
- Kwaliteit gegarandeerd (TMDB community moderatie)
- Volledig geautomatiseerd

### Community Content Pool (1 mystery film)

**Inleveren van mystery films:**
- Iedereen kan films aanbrengen via gtm.cbsp.nl
- Vereisten:
  - Niet op TMDB of moeilijk te vinden
  - Screenshot uploaden (automatisch geüpload naar server)
  - Film titel + jaar
  - Categorie (bijv. Netflix original, indie film)
- Approval queue: admin (jij) goedkeurt of weigert

**Rating systeem (van oude Slack regels):**
- Na afloop van weekly challenge: elke speler geeft rating 1-5 aan de 5 films
- TMDB films met hoge rating komen vaker terug
- Community mystery films met lage rating worden uitgesloten
- Motiveert mensen om goede plaatjes aan te leveren

### Mysterie Film E

**1 van de 5 films is "Mysterie E":**
- Niet te vinden via reverse image search
- Komt vanuit community (niet TMDB)
- Kan zijn: obscure film, Netflix original, indie film
- 3x punten (30 in plaats van 10) voor correct antwoord
- Extra motivatie om obscure films aan te brengen

---

## 🏆 Gamification Elementen

### Progression System

**Levels:**
- Level 1: 0-500 punten (Film Fan)
- Level 2: 500-2000 punten (Movie Buff)
- Level 3: 2000-5000 punten (Cinephile)
- Level 4: 5000-10000 punten (Film Expert)
- Level 5: 10000+ punten (Cinema Master)

**Badges:**
- "First Blood": eerste keer meedoen
- "Perfect Week": 5/5 correct in één week
- "Speed Demon": alle 5 films binnen 10 seconden
- "Streak Master": 10 weken op rij meegedaan
- "Mystery Solver": 5x Mysterie E correct geraden

### Season System

**Per kwartaal (3 maanden):**
- Seizoen leaderboard reset
- Top 3 krijgen speciale badge
- Seizoen thema's (bijv. Q2: "80s Classics", Q3: "Sci-Fi Month")
- Seizoensfinale: bonus challenge met extra punten

---

## 🛠️ Technische Implementatie

### Database Schema

```sql
-- Films pool
films (
  id, title, year, imdb_votes, 
  screenshot_path, category, 
  is_mystery, avg_rating, times_shown
)

-- Weekly challenges
weekly_challenges (
  id, week_number, year,
  film_1_id, film_2_id, film_3_id, film_4_id, film_5_id,
  created_at
)

-- User scores
user_scores (
  user_id, challenge_id,
  score_1, score_2, score_3, score_4, score_5,
  total_score, time_taken,
  submitted_at
)

-- Film ratings
film_ratings (
  user_id, film_id, rating (1-5),
  rated_at
)

-- Teams
teams (
  id, name, captain_id,
  created_at
)

team_members (
  team_id, user_id,
  joined_at
)
```

### Automatisering

**Weekly challenge generator (cron job):**
```python
def generate_weekly_challenge():
    # Selecteer 4 normale films (high rating, niet recent shown)
    normal_films = get_high_rated_films(limit=10, exclude_recent=4)
    selected = random.sample(normal_films, 4)
    
    # Selecteer 1 mysterie film (low rating of obscure)
    mystery_films = get_mystery_films(limit=5)
    selected.append(random.choice(mystery_films))
    
    # Shuffle volgorde
    random.shuffle(selected)
    
    # Sla op in database
    create_weekly_challenge(selected)
    
    # Stuur Slack notificatie
    send_slack_notification("Nieuwe weekly challenge live!")
```

**Maintenance:**
- Cron job draait automatisch elke week
- Geen handmatige interventie nodig
- Content pool groeit via community bijdragen
- Rating systeem houdt kwaliteit hoog

---

## 📊 Maintenance Workload

**Initieel (one-time):**
- Setup database en backend (~4 uur)
- Importeer bestaande movies.json (~1 uur)
- Configureer cron job (~30 min)
- Test run met kleine groep (~2 uur)
- **Totaal: ~7.5 uur**

**Wekelijks (automatisch):**
- Cron job genereert challenge (0 min)
- Slack notificatie gaat uit (0 min)
- **Totaal: 0 minuten**

**Maandelijks (optioneel):**
- Review approval queue (~30 min)
- Check statistics (~15 min)
- Seizoensfinale voorbereiden (~1 uur)
- **Totaal: ~2 uur per maand**

**Jaarlijks:**
- Seizoens evaluatie (~2 uur)
- Database cleanup (~1 uur)
- **Totaal: ~3 uur per jaar**

---

## 🎯 User Journey

### Nieuwe Speler

1. **Ontdek:** Ziet Slack notificatie "Nieuwe weekly challenge!"
2. **Registreert:** Klik op link, kiest username (Slack integratie?)
3. **Speelt:** 5 films in 2-3 minuten
4. **Ziet score:** Direct feedback + leaderboard positie
5. **Rate films:** Geeft rating 1-5 aan de 5 films
6. **Komt terug:** Volgende week weer, competitie met collega's

### Actieve Speler

1. **Checkt leaderboard:** Ziet of hij gestegen is
2. **Speelt challenge:** Probeert perfect score te halen
3. **Levert films in:** Voegt nieuwe films toe aan pool
4. **Bekijkt stats:** Ziet zijn progressie, badges, streak
5. **Doet mee aan team:** Optioneel team modus met vrienden

---

## 💡 Optional Features (Future)

**Hardcore Mode:**
- Geen multiple choice, open antwoord
- Extra punten voor moeilijkere modus

**Daily Quick Challenge:**
- 1 film per dag, 10 seconden
- Voor mensen die elke dag even willen spelen

**Theme Weeks:**
- "Oscar Winners Week"
- "80s Action Week"
- "Horror Month"

**Integration:**
- Slack bot voor directe notificaties
- Calendar integration (weekly reminder)
- Share result op Slack/Teams

---

## 🚀 Implementatie Roadmap

### Fase 1: MVP (4 weken)
- [ ] Backend met weekly challenge generator
- [ ] Frontend met 5-film gameplay
- [ ] Leaderboard (wekelijks)
- [ ] Basic user registration
- [ ] Film rating systeem

### Fase 2: Community (2 weken)
- [ ] Film inlever formulier
- [ ] Approval queue
- [ ] Mysterie film E logica
- [ ] Badges en levels

### Fase 3: Social (2 weken)
- [ ] Team modus
- [ ] Seizoen systeem
- [ ] Slack integration
- [ ] Statistics dashboard

### Fase 4: Polish (1 week)
- [ ] UI/UX verbeteringen
- [ ] Performance optimalisatie
- [ ] Documentation
- [ ] Beta test met volledige groep

---

## 📈 Verwachte Resultaten

**Engagement:**
- 70-80% van groep speelt wekelijks
- Gemiddelde speeltijd: 3-5 minuten per week
- 30-40% levert films aan naar pool

**Maintenance:**
- < 2 uur per maand
- Volledig geautomatiseerde weekly challenges
- Community content groeit organisch

**Fun factor:**
- Competitie met collega's
- Badges en levels geven progressie
- Rating systeem motiveert kwaliteit
- Mysterie films geven extra uitdaging

---

## 🎯 Conclusie

Dit voorstel combineert:
- **Het beste van oude Slack regels:** rating systeem, mysterie films, competitie
- **Het beste van jouw GTM:** automatische gameplay, multiple choice
- **Nieuw:** community content, low maintenance, seizoen structuur

**Kernvoordeel:** Eenmalige setup, daarna volledig geautomatiseerd. Community groeit de content pool, rating systeem houdt kwaliteit hoog.

**Time investment:** ~7.5 uur initieel, < 2 uur per maand daarna.

**Resultaat:** Wekelijks ontspannend ritueel voor het team, zonder dat het jou tijd kost.
