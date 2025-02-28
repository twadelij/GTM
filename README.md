---
title: Guess The Movie Game
created: 2024-01-09
updated: 2025-02-28
tags: [game, movies, project]
aliases: [GTM, Movie Game]
---

# 🎬 Guess The Movie Game

An interactive game where players guess movies based on screenshots.

## 📋 Current Status

The game is currently in active development. The core gameplay functionality is working, but there are some known issues:

- **Admin Login Issue**: The admin authentication works on the server side, but there's a UI issue preventing proper redirection after login. This will be fixed in a future update.
- **Database Integration**: The game now uses PostgreSQL for data storage instead of JSON files.
- **Multi-user Support**: Basic user authentication and session management are implemented.

## 📁 Project Structure

- `src/` - Source code
  - `client/` - Frontend code
    - `js/` - JavaScript modules
    - `css/` - Styling
  - `server/` - Backend server code
- `tools/` - Utility programs and scripts
- `logs/` - Server and application logs

## 🚀 Getting Started

### Prerequisites

- Python 3.9+
- PostgreSQL
- Node.js (for development)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/GTM.git
   cd GTM
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up the database:
   ```bash
   python src/server/setup_db.py
   ```

4. Create an admin user:
   ```bash
   python tools/create_admin.py
   ```

5. Start the server:
   ```bash
   ./start_server.sh
   ```

6. Access the game at http://localhost:5000

## 🔧 Development

### Running Tests

```bash
python -m pytest tests/
```

### Adding New Movies

Movies can be added through the admin interface once logged in as an admin user.

## 📝 Future Plans

- Containerization for easy deployment
- Enhanced user experience with animations and sound effects
- Integration with TMDB API for additional movie data
- Multiplayer functionality

See the [TODO.md](TODO.md) file for a complete list of planned features and improvements.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.