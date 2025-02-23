---
title: Project ToDo's
created: 2024-01-09
updated: 2024-01-09
tags: [todo, planning, tasks]
aliases: [Tasks, Planning]
---

# 📋 Project ToDo's

## ✅ Recent Voltooid

- [x] Geen punten en tijdbonus in ronde 6
- [x] Toon aantal foute gokken bij de voortgangsteller
- [x] Voorkom dubbele films in de 20 films selectie
- [x] Netflix/Jellyfin styling toepassen
- [x] Cursor regels geïmplementeerd
- [x] README.md in Obsidian formaat
- [x] Laadtijd van filmafbeeldingen verbeteren
- [x] Preloading van volgende filmafbeeldingen implementeren
- [x] Caching mechanisme voor veel gebruikte afbeeldingen
- [x] Test modus toegevoegd
- [x] Lazy loading implementatie
- [x] Verbeterde error handling
- [x] Implementatie van ronde 1 logica voor alle 20 films

## 🚀 Hoge Prioriteit

### Kritieke Bug Fixes
- [ ] Fix startup error "Failed to load game: Cannot read properties of undefined (reading 'title')":
  - [ ] Debug initialisatie volgorde van scripts
  - [ ] Controleer of alle benodigde bestanden correct worden geladen
  - [ ] Implementeer betere error handling tijdens startup
  - [ ] Voeg duidelijke gebruikersfeedback toe tijdens laden
  - [ ] Test verschillende browser scenarios

- [ ] Server startup stabiliteit verbeteren:
  - [ ] Onderzoek waarom server twee keer moet worden opgestart
  - [ ] Implementeer robuustere poort verificatie
  - [ ] Voeg retry mechanisme toe voor server startup
  - [ ] Verbeter process handling en cleanup
  - [ ] Implementeer health check endpoint

- [ ] Fix dubbele films in ronde 1:
  - [ ] Debug film selectie logica
  - [ ] Implementeer strikte controle op unieke films
  - [ ] Voeg logging toe voor film selectie process
  - [ ] Garandeer dat alle 20 films exact één keer worden getoond
  - [ ] Voeg test functie toe om film distributie te verifiëren

### Performance Verbeteringen
- [ ] Optimaliseren van laadtijden:
  - [ ] Comprimeren van afbeeldingen
  - [ ] Implementeren van progressive loading
  - [ ] Caching strategie herzien
  - [ ] Preload optimalisatie
  - [ ] Lazy loading verfijnen

### Film Selectie Systeem
- [ ] Implementeer permanent film uitsluitingssysteem:
  - [ ] Maak een JSON bestand voor uitgesloten films
  - [ ] Bij start van nieuw spel: selecteer 20 nieuwe, nog nooit gebruikte films
  - [ ] Na afloop: markeer deze 20 films als 'gebruikt' voor toekomstige sessies
  - [ ] Voeg statistieken toe over hoeveel unieke films nog beschikbaar zijn
  - [ ] Waarschuwingssysteem wanneer films bijna op zijn
  - [ ] Reset optie voor wanneer alle films zijn gebruikt

### UI/UX Verbeteringen
- [ ] Laad-indicator toevoegen tijdens het laden van filmafbeeldingen
- [ ] Game Over scherm styling verbeteren
- [ ] Toevoegen van visuele feedback tijdens laden
- [ ] Implementeer roterende achtergrond met willekeurige filmafbeeldingen

### Bug Fixes
- [ ] Verificatie van tijdbonus berekening
- [ ] Edge cases testen met grote aantallen foute antwoorden
- [ ] Testen van alle mogelijke game-over scenarios

## 🔄 Medium Prioriteit

### Gebruikerservaring
- [ ] Toevoegen van een tutorial/uitleg scherm
- [ ] Betere visuele feedback bij correcte/incorrecte antwoorden
- [ ] Toevoegen van een pauze functie
- [ ] Mogelijkheid om spel te hervatten na sluiten browser

### Statistieken
- [ ] Bijhouden van speelstatistieken
- [ ] Weergave van prestaties per ronde
- [ ] Analyse van meest gemaakte fouten

## ⏳ Lage Prioriteit

### Nieuwe Features
- [ ] Implementeren van highscore systeem
- [ ] Toevoegen van verschillende moeilijkheidsgraden
- [ ] Categorieën/genres selectie toevoegen
- [ ] Multiplayer modus
- [ ] Social sharing functionaliteit

### Administratie
- [ ] Documentatie bijwerken
- [ ] Code cleanup en optimalisatie
- [ ] Unit tests schrijven
- [ ] Performance metrics implementeren

## 🆕 Cursor Rules Implementatie

### Documentatie & Structuur
- [x] Centrale ToDo.md voor alle projecten maken
- [x] Project-specifieke ToDo.md's maken
- [ ] Obsidian synchronisatie opzetten
- [x] Consistente bestandsstructuur implementeren
- [ ] Git branches workflow documenteren

### GitHub Integratie
- [x] Alle projecten als WIP op GitHub plaatsen
- [x] Branch strategie implementeren
- [ ] Code review proces opzetten
- [ ] Feedback mechanisme implementeren

### Testing & Quality
- [ ] Test frameworks opzetten
- [ ] Test documentatie schrijven
- [ ] CI/CD pipeline opzetten
- [ ] Code quality checks implementeren

### Community & Best Practices
- [ ] DRY principes documenteren
- [ ] SOLID principes implementeren
- [ ] Community richtlijnen opstellen
- [ ] Bijdrage workflow documenteren

## 📝 Notities

- Overweeg het gebruik van een CDN voor snellere afbeeldingslevering
- Onderzoek mogelijkheden voor progressive image loading
- Plan nodig voor schaalbaarheid bij groei gebruikersbase
- Regelmatige code reviews inplannen
- Feedback verzamelen van gebruikers voor nieuwe features
- Test modus is nu beschikbaar via console: runGameTest(5) 