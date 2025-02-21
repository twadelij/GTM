# Guess The Movie Game - Voortgangsrapport

## Voortgang 8 December 2023

### Wat is er gedaan:
1. Project herstructurering:
   - Code verplaatst naar een duidelijkere mapstructuur
   - Frontend en backend code gescheiden
   - Documentatie verbeterd

2. TMDB Verwijdering:
   - Begonnen met het verwijderen van TMDB referenties
   - Overgeschakeld naar lokale film database
   - Lokale afbeeldingen worden nu gebruikt

3. Debugging:
   - Console logging toegevoegd voor betere foutopsporing
   - Test pagina gemaakt (test.html) voor geïsoleerd testen

### Huidige Problemen:
1. **Game Initialisatie Fout**:
   ```javascript
   TypeError: data.map is not a function
   at MovieDatabaseClass.initialize (movieDb.js:40)
   ```
   - Probleem met het laden van movies.json
   - Mogelijk probleem met de data structuur

2. **Dependencies Laden**:
   - "Failed to load game dependencies" melding
   - Mogelijk probleem met de volgorde van script laden

### Hulp Nodig Bij:
1. **Data Flow Analyse**:
   - Hoe de data van movies.json naar de frontend stroomt
   - Waar precies de data transformatie faalt

2. **Browser Debugging**:
   - Gedetailleerde analyse van de browser console logs
   - Network tab analyse voor request/response cyclus

### Volgende Stappen:
1. **Data Structuur**:
   - movies.json format valideren
   - Data transformatie logica controleren

2. **Script Loading**:
   - Script dependencies opnieuw evalueren
   - Laadvolgorde optimaliseren

3. **Code Clean-up**:
   - Resterende TMDB referenties verwijderen
   - Code vereenvoudigen waar mogelijk

### Hoe Je Kunt Helpen:
1. **Code Review**:
   - Extra ogen op de data transformatie logica
   - Review van de script laadvolgorde

2. **Testing**:
   - Verschillende browsers testen
   - Network requests monitoren
   - Console output analyseren

3. **Documentatie**:
   - Validatie van de data structuur
   - Beschrijving van de verwachte game flow

## Project Structuur
```
GTM/
├── src/
│   ├── client/          # Frontend code
│   │   ├── js/
│   │   │   ├── script.js
│   │   │   ├── movieDb.js
│   │   │   └── config.js
│   │   ├── css/
│   │   └── index.html
│   └── server/          # Backend code
├── data/               # Film data & afbeeldingen
└── docs/              # Documentatie
```

## Volgende Sessie
- Focus op data flow debugging
- Browser console analyse
- Stap-voor-stap validatie van de game initialisatie
