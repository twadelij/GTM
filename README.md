---
title: Guess The Movie Game
created: 2024-01-09
updated: 2024-01-09
tags: [game, movies, project]
aliases: [GTM, Movie Game]
---

# 🎬 Guess The Movie Game

Een interactief spel waarbij spelers films moeten raden aan de hand van screenshots.

## 📁 Projectstructuur

- `src/` - Broncode van de applicatie
- `tools/` - Hulpprogramma's en scripts
- `data/` - Databestanden en resources
- `docs/` - Projectdocumentatie
- `server/` - Backend server code
- `templates/` - HTML templates
- `static/` - Statische bestanden (CSS, JS, afbeeldingen)
- `uploads/` - Gebruikersuploads en tijdelijke bestanden

## 🎮 Gameplay

- Start met 20 willekeurige films
- 6 rondes om alle films te raden
- Punten per ronde:
  - Ronde 1: 5 punten + tijdbonus
  - Ronde 2: 4 punten + tijdbonus
  - Ronde 3: 3 punten + tijdbonus
  - Ronde 4: 2 punten + tijdbonus
  - Ronde 5: 1 punt + tijdbonus
  - Ronde 6: Laatste kans (geen punten/tijdbonus)
- Tijdbonus: 1 punt per seconde over (niet in ronde 6)
- Foute antwoorden gaan door naar de volgende ronde
- Minder keuzes per ronde (6 -> 5 -> 4 -> 3 -> 2 -> 1)

## 🛠️ Technische Stack

- Frontend: React.js met TypeScript
- Backend: Python met FastAPI
- Database: PostgreSQL met Prisma
- Testing: Jest en Pytest
- CI/CD: GitHub Actions

## 📥 Installatie

1. Clone de repository:
```bash
git clone https://github.com/yourusername/guess-the-movie.git
cd guess-the-movie
```

2. Installeer dependencies:
```bash
pip install -r requirements.txt
```

3. Start de applicatie:
```bash
python src/main.py
```

## 👩‍💻 Ontwikkeling

1. Maak een nieuwe branch voor je feature:
```bash
git checkout -b feature/nieuwe-feature
```

2. Start de development server:
```bash
python src/main.py --dev
```

3. Run de tests:
```bash
pytest tests/
```

## 📝 Links

- [[TODO]] - Project ToDo lijst
- [[CHANGELOG]] - Versie geschiedenis
- [[CONTRIBUTING]] - Bijdrage richtlijnen

## 🤝 Bijdragen

Bijdragen zijn welkom! Zie [[CONTRIBUTING]] voor details.

## 📄 Licentie

Dit project is gelicenseerd onder de MIT License - zie het [[LICENSE]] bestand voor details.