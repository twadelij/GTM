# Guess The Movie Game

Een spel waarbij spelers filmscènes moeten raden uit een selectie van mogelijke antwoorden.

## Project Structuur

```
GTM/
├── README.md                 # Hoofddocumentatie
├── src/                      # Broncode
│   ├── client/              # Frontend code
│   │   ├── js/             # JavaScript bestanden
│   │   │   ├── script.js   # Hoofdgame logica
│   │   │   ├── movieDb.js  # Film database beheer
│   │   │   ├── auth.js     # Authenticatie
│   │   │   └── config.js   # Configuratie
│   │   ├── css/            # Styling
│   │   │   └── styles.css
│   │   └── index.html      # Hoofdpagina
│   └── server/             # Backend code
│       ├── server.py       # Python server
│       └── start_server.sh # Server startup script
├── tools/                   # Hulpprogramma's
│   ├── clean_movies.py     # Database opschoning
│   └── import_movies.py    # Film import script
├── data/                    # Data bestanden
│   ├── movies.json         # Film database
│   └── movies/             # Film afbeeldingen
└── docs/                    # Documentatie
    ├── README.md           # Gedetailleerde docs
    ├── Technical-Details.md
    └── Troubleshooting.md
```

## Gameplay Mechanics

- Start met 20 willekeurig geselecteerde films
- Per ronde minder keuzemogelijkheden:
  - Ronde 1: 6 keuzes voor alle 20 films
  - Ronde 2: 5 keuzes voor alle foute films uit ronde 1
  - Ronde 3: 4 keuzes voor alle foute films uit ronde 2
  - Ronde 4: 3 keuzes voor alle foute films uit ronde 3
  - Ronde 5: 2 keuzes voor alle foute films uit ronde 4
  - Ronde 6: 1 keuze voor alle foute films uit ronde 5
- Tijdbonus: 1 punt per seconde die over is
- Basis punten per ronde nemen af (5 -> 4 -> 3 -> 2 -> 1 -> 0)
- 15 seconden per vraag

## Huidige Status (20 December 2024)

### Wat Werkt
- Basis gameplay mechanica
- Film selectie en weergave
- Score systeem met tijdbonus
- Ronde progressie met correct aantal keuzes
- Voortgangsteller toont juiste aantal films
- Verticale layout voor filmkeuzes
- Voorkomen van dubbele films in keuzes
- Database cleanup script
- Git versie beheer geïmplementeerd

### Recent Opgeloste Issues
1. **Gameplay Fixes**:
   - ✅ Voortgangsteller begint bij 20 films
   - ✅ Correcte ronde-progressie geïmplementeerd
   - ✅ Consistent aantal keuzes per ronde
   - ✅ Voorkom dubbele films in keuzes
   - ✅ Spel gaat correct door na 20 films als er foute antwoorden zijn

2. **UI Verbeteringen**:
   - ✅ Verticale layout voor filmkeuzes
   - ✅ Duidelijkere weergave van huidige ronde

### Openstaande Punten
1. **Bug Fixes**:
   - Laadtijd van afbeeldingen optimaliseren
   - Verificatie van tijdbonus berekening

2. **UI Verbeteringen**:
   - Game Over scherm styling verbeteren
   - Laad-indicator voor filmafbeeldingen

3. **Toekomstige Features**:
   - Highscore systeem
   - Verschillende moeilijkheidsgraden
   - Categorieën/genres selectie

## Installatie

1. Clone de repository
2. Installeer de vereiste dependencies
3. Start de server met `python3 src/server/server.py`
4. Open de game in je browser op `http://localhost:8888`

## Development Notes

- Server draait op poort 8888
- Films worden opgeslagen in `data/movies.json`
- Gebruik `tools/clean_movies.py` voor database onderhoud
- Git repository geïnitialiseerd voor versiebeheer