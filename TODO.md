---
title: Project TODOs
created: 2024-01-09
updated: 2025-02-28
tags: [todo, planning, tasks]
aliases: [Tasks, Planning]
---

# 📋 Project TODOs

## 🚧 In Progress

- [ ] Fix admin login issue - Authentication works but UI doesn't update correctly
- [ ] Make the game deployable via containers (Docker)

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

### Phase 1: Database & Content Management
- [x] Migrate movies to PostgreSQL database
- [x] Create `movies` table with film metadata schema
- [x] Create `movie_images` table for image paths
- [x] Write migration script to transfer data from JSON to database
- [x] Update server code to retrieve movies from database
- [x] Add admin endpoints for film management
- [x] Implement soft-delete functionality for films
- [x] Add tags and categories
- [ ] Create backup strategy

### Phase 2: Multi-user Authentication & Sessions
- [x] Create login system
- [x] Add email verification
- [x] Add admin users
- [x] Implement rate limiting
- [x] Add session management
- [ ] Fix admin login UI issues
- [ ] Add user profiles
- [ ] Add user settings
- [ ] Add password reset functionality
- [ ] Add social login options
- [ ] Add user roles and permissions
- [ ] Add user statistics
- [ ] Add user achievements
- [ ] Add user leaderboard

### Phase 3: Game Mechanics & UX
- [ ] Add animations for correct/incorrect answers
- [ ] Add sound effects
- [ ] Add different game modes
- [ ] Create tutorial for new players
- [ ] Add difficulty levels
- [ ] Add hints system
- [ ] Add bonus rounds
- [ ] Add multiplayer mode
- [ ] Add chat system
- [ ] Add friend system
- [ ] Add achievements
- [ ] Add leaderboards
- [ ] Add daily challenges
- [ ] Add weekly tournaments
- [ ] Add seasonal events

### Phase 4: TMDB API Integration
- [ ] Implement poster and backdrop downloads
- [ ] Add movie details from TMDB
- [ ] Add movie trailers
- [ ] Add movie cast information
- [ ] Add movie reviews
- [ ] Add movie recommendations
- [ ] Add movie watchlist
- [ ] Add movie favorites
- [ ] Add movie ratings
- [ ] Add movie comments
- [ ] Add movie search
- [ ] Add movie filters
- [ ] Add movie sorting
- [ ] Add movie categories
- [ ] Add movie tags

### Deployment & Distribution
- [ ] Create Docker container for easy deployment
- [ ] Set up CI/CD pipeline
- [ ] Create installation documentation
- [ ] Implement automated testing
- [ ] Create backup and restore procedures
- [ ] Add monitoring and logging
- [ ] Create scaling strategy
- [ ] Implement load balancing
- [ ] Set up production environment
- [ ] Create deployment scripts

### Personality & User Experience
- [ ] Implement rotating game feedback (30+ variations):
  - [ ] Funny reactions to correct answers
  - [ ] Cynical remarks for wrong answers
  - [ ] Surprising progress messages
  - [ ] Encouraging words for low scores
  - [ ] Sarcastic game-over messages
  - [ ] Easter eggs for special achievements

### Critical Bug Fixes
- [ ] Fix admin login UI issues:
  - [ ] Debug client-side authentication flow
  - [ ] Fix session handling
  - [ ] Ensure proper redirection after login
  - [ ] Add better error handling for login failures
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
- [ ] Move files to new structure:
  - [ ] Create new `logs/` directory
  - [ ] Move all `.log` files to `logs/`
  - [ ] Remove duplicate `server/` directory in root
  - [ ] Remove unused directories (`static/`, `templates/`, `uploads/`)
  - [ ] Remove duplicate `images/` directory
  - [ ] Create new `tests/` directory
- [ ] Update all file references:
  - [ ] Update imports in Python files
  - [ ] Update path references in JavaScript
  - [ ] Update configuration files
  - [ ] Test all functionality after moving

## 📝 Notes

- Consider using a CDN for faster image delivery
- Research progressive image loading possibilities
- Plan needed for scalability with growing user base
- Schedule regular code reviews
- Collect user feedback for new features

### Database Schema
```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_admin BOOLEAN DEFAULT FALSE
);

-- Sessions table
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Games table
CREATE TABLE games (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    score INTEGER NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    movies_played JSONB,
    wrong_guesses INTEGER
);
```

### Security Considerations
- Implement rate limiting
- Use secure password hashing (bcrypt)
- Set secure session cookies
- Implement CSRF protection
- Add input validation
- Set up proper CORS policies 