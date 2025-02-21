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
  - `client/` - Frontend code
    - `js/` - JavaScript modules
    - `css/` - Styling
  - `server/` - Backend server code
- `tools/` - Hulpprogramma's en scripts
- `data/` - Databestanden en resources
- `docs/` - Projectdocumentatie
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
- Image Management: Custom ImageManager met caching en preloading

## 🆕 Laatste Updates

- Geoptimaliseerde afbeeldingslaadtijd met caching
- Preloading van volgende ronde afbeeldingen
- Verbeterde error handling
- Lazy loading implementatie
- Test modus toegevoegd

## 📥 Installatie

1. Clone de repository:
```bash
git clone https://github.com/twadelij/GTM.git
cd GTM
```

2. Installeer dependencies:
```bash
pip install -r requirements.txt
```

3. Start de server:
```bash
python src/server/server.py
```

## 👩‍💻 Ontwikkeling

1. Maak een nieuwe branch voor je feature:
```bash
git checkout -b feature/nieuwe-feature
```

2. Start de development server:
```bash
python src/server/server.py --dev
```

3. Run de tests:
```bash
pytest tests/
```

## 🧪 Test Modus

Om het spel te testen zonder handmatig te spelen:

1. Open de browser console (F12)
2. Voer het volgende commando uit:
```javascript
runGameTest(5); // Test met 5 foute antwoorden in ronde 1
```

Parameters:
- `forcedWrongAnswers`: Aantal foute antwoorden in ronde 1 (default: 5)

## 📝 Links

- [[TODO]] - Project ToDo lijst
- [[CHANGELOG]] - Versie geschiedenis
- [[CONTRIBUTING]] - Bijdrage richtlijnen

## 🤝 Bijdragen

Bijdragen zijn welkom! Zie [[CONTRIBUTING]] voor details.

## 📄 Licentie

Dit project is gelicenseerd onder de MIT License - zie het [[LICENSE]] bestand voor details.