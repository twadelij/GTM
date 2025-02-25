---
title: Project TODOs
created: 2024-01-09
updated: 2024-02-24
tags: [todo, planning, tasks]
aliases: [Tasks, Planning]
---

# 📋 Project TODOs

## ✅ Recently Completed

- [x] No points and time bonus in round 6
- [x] Show wrong guess count in progress counter
- [x] Prevent duplicate movies in 20 movie selection
- [x] Apply Netflix/Jellyfin styling
- [x] Cursor rules implemented
- [x] README.md in Obsidian format
- [x] Improve image loading time
- [x] Implement next image preloading
- [x] Caching mechanism for frequently used images
- [x] Test mode added
- [x] Lazy loading implementation
- [x] Improved error handling
- [x] Round 1 logic implementation for all 20 movies
- [x] Test mode removed for production
- [x] Server startup script added
- [x] Round 1 gameplay optimized
- [x] Translate all game text to English
- [x] Update Game Over screen to be more positive
- [x] Implement one-shot per week limit

## 🔥 High Priority

### Phase 1: Game Mechanics & UX
- [ ] Implement weekly game limit:
  - [ ] Add timestamp for last played game
  - [ ] Store user progress in localStorage
  - [ ] Show countdown to next available game
  - [ ] Add server-side validation
  - [ ] Implement weekly reset logic
- [ ] Enhance Game Over screen:
  - [ ] Show statistics for current game
  - [ ] Display personal best scores
  - [ ] Add share button for results
  - [ ] Show countdown to next game
- [ ] Improve feedback messages:
  - [ ] Add more varied success messages
  - [ ] Create engaging failure messages
  - [ ] Implement progressive difficulty hints

### Phase 2: User Authentication & Admin System
- [ ] Implement user authentication system:
  - [ ] User registration with email verification
  - [ ] Login/logout functionality
  - [ ] Password reset system
  - [ ] OAuth integration (Google, GitHub)
  - [ ] Session management
  - [ ] User profiles with statistics
  - [ ] Test all authentication flows
- [ ] Create admin dashboard:
  - [ ] Secure admin login system
  - [ ] Image management interface
  - [ ] Bulk image upload functionality
  - [ ] Movie metadata editor
  - [ ] Test mode activation button
  - [ ] User management tools
  - [ ] System statistics overview
  - [ ] Activity logging
  - [ ] Test all admin features

### Phase 3: TMDB API Integration
- [ ] Implement TMDB API for images:
  - [ ] Configure API key management
  - [ ] Add fallback mechanism for local images
  - [ ] Implement caching for TMDB images
  - [ ] Add rate limiting for API requests
  - [ ] Create script for fetching new movie stills
  - [ ] Implement error handling for API requests
  - [ ] Add logging for API usage
  - [ ] Create configuration file for API settings
  - [ ] Add tool for refreshing outdated images
  - [ ] Implement queue system for bulk downloads

### Personality & User Experience
- [ ] Implement rotating game feedback (30+ variations):
  - [ ] Funny reactions to correct answers
  - [ ] Cynical remarks for wrong answers
  - [ ] Surprising progress messages
  - [ ] Encouraging words for low scores
  - [ ] Sarcastic game-over messages
  - [ ] Easter eggs for special achievements

### Critical Bug Fixes
- [ ] Fix startup error "Failed to load game: Cannot read properties of undefined (reading 'title')":
  - [ ] Debug script initialization order
  - [ ] Verify all required files are loaded correctly
  - [ ] Implement better error handling during startup
  - [ ] Add clear user feedback during loading
  - [ ] Test various browser scenarios

### Performance Improvements
- [ ] Optimize loading times:
  - [ ] Compress images
  - [ ] Implement progressive loading
  - [ ] Review caching strategy
  - [ ] Optimize preloading
  - [ ] Refine lazy loading

### Movie Selection System
- [ ] Implement permanent movie exclusion system:
  - [ ] Create JSON file for excluded movies
  - [ ] Select 20 new, never-used movies at game start
  - [ ] Mark used movies as 'played' for future sessions
  - [ ] Add statistics about remaining unique movies
  - [ ] Warning system when movies are running low
  - [ ] Reset option when all movies have been used

### Images & Media
- [ ] Remove movie titles from images:
  - [ ] Implement OCR to detect text in images
  - [ ] Filter images with visible movie titles
  - [ ] Add option to mask specific image regions
  - [ ] Test different OCR libraries for best results
- [ ] Integrate external image sources:
  - [ ] Research suitable movie screenshot APIs
  - [ ] Implement TMDB/IMDB API integration
  - [ ] Add caching for external images
  - [ ] Implement fallback to local images
  - [ ] Add image quality checks
  - [ ] Filter NSFW/inappropriate content

### UI/UX Improvements
- [ ] Add loading indicator during image loading
- [ ] Improve Game Over screen styling
- [ ] Add visual feedback during loading
- [ ] Implement rotating background with random movie images

### File Structure Reorganization
- [ ] Implement new folder structure:
  ```
  GTM/
  ├── src/                    # Source code
  │   ├── client/            # Frontend code
  │   │   ├── js/           # JavaScript files
  │   │   ├── css/          # Stylesheets
  │   │   └── index.html    # Main page
  │   └── server/           # Backend code
  │       └── server.py     # Server implementation
  ├── data/                  # Data files
  │   ├── movies/           # Movie images
  │   ├── movies.json       # Movie metadata
  │   └── users.json        # User data
  ├── tools/                 # Utility programs
  │   ├── clean_images.py   # Image cleanup tool
  │   └── thumbnail_viewer.py # Thumbnail viewer
  ├── logs/                  # Log files
  │   ├── server.log        # Server logs
  │   └── app.log          # Application logs
  ├── tests/                 # Test files
  │   ├── unit/            # Unit tests
  │   └── integration/     # Integration tests
  ├── docs/                  # Documentation
  │   └── api/             # API documentation
  ├── start_server.sh       # Server startup script
  ├── requirements.txt      # Python dependencies
  ├── README.md            # Project documentation
  └── TODO.md              # Project planning
  ```

## 📝 Notes

- Consider using a CDN for faster image delivery
- Research progressive image loading possibilities
- Plan needed for scalability with growing user base
- Schedule regular code reviews
- Collect user feedback for new features

### Bestandsstructuur Reorganisatie
- [ ] Implementeer nieuwe mappenstructuur:
  ```
  GTM/
  ├── src/                    # Broncode
  │   ├── client/            # Frontend code
  │   │   ├── js/           # JavaScript bestanden
  │   │   ├── css/          # Stylesheets
  │   │   └── index.html    # Hoofdpagina
  │   └── server/           # Backend code
  │       └── server.py     # Server implementatie
  ├── data/                  # Data bestanden
  │   ├── movies/           # Film afbeeldingen
  │   ├── movies.json       # Film metadata
  │   └── users.json        # Gebruikersdata
  ├── tools/                 # Hulpprogramma's
  │   ├── clean_images.py   # Image cleanup tool
  │   └── thumbnail_viewer.py # Thumbnail viewer
  ├── logs/                  # Log bestanden
  │   ├── server.log        # Server logs
  │   └── app.log          # Applicatie logs
  ├── tests/                 # Test bestanden
  │   ├── unit/            # Unit tests
  │   └── integration/     # Integratietests
  ├── docs/                  # Documentatie
  │   └── api/             # API documentatie
  ├── start_server.sh       # Server startup script
  ├── requirements.txt      # Python dependencies
  ├── README.md            # Project documentatie
  └── TODO.md              # Project planning
  ```
- [ ] Verplaats bestanden naar nieuwe structuur:
  - [ ] Maak nieuwe `logs/` directory
  - [ ] Verplaats alle `.log` bestanden naar `logs/`
  - [ ] Verwijder dubbele `server/` directory in root
  - [ ] Verwijder ongebruikte directories (`static/`, `templates/`, `uploads/`)
  - [ ] Verwijder dubbele `images/` directory
  - [ ] Maak nieuwe `tests/` directory
- [ ] Update alle bestandsverwijzingen:
  - [ ] Update imports in Python bestanden
  - [ ] Update pad verwijzingen in JavaScript
  - [ ] Update configuratie bestanden
  - [ ] Test alle functionaliteit na verplaatsing 