---
title: Guess The Movie Game
created: 2024-01-09
updated: 2024-02-24
tags: [game, movies, project]
aliases: [GTM, Movie Game]
---

# 🎬 Guess The Movie Game

An interactive game where players guess movies based on screenshots.

## 📁 Project Structure

- `src/` - Source code
  - `client/` - Frontend code
    - `js/` - JavaScript modules
    - `css/` - Styling
  - `server/` - Backend server code
- `tools/` - Utility programs and scripts
- `data/` - Data files and resources
- `docs/` - Project documentation
- `templates/` - HTML templates
- `static/` - Static files (CSS, JS, images)
- `uploads/` - User uploads and temporary files

## 🎮 Gameplay

- Start with 20 random movies
- 6 rounds to guess all movies
- Points per round:
  - Round 1: 5 points + time bonus
  - Round 2: 4 points + time bonus
  - Round 3: 3 points + time bonus
  - Round 4: 2 points + time bonus
  - Round 5: 1 point + time bonus
  - Round 6: Last chance (no points/time bonus)
- Time bonus: 1 point per second remaining (not in round 6)
- Wrong answers move to the next round
- Fewer choices per round (6 -> 5 -> 4 -> 3 -> 2 -> 1)

## 🛠️ Technical Stack

- Frontend: React.js with TypeScript
- Backend: Python with FastAPI
- Database: PostgreSQL with Prisma
- Testing: Jest and Pytest
- CI/CD: GitHub Actions
- Image Management: Custom ImageManager with caching and preloading

## 🆕 Latest Updates

- Optimized image loading time with caching
- Preloading of next round images
- Improved error handling
- Lazy loading implementation
- Test mode added

## 📥 Installation

1. Clone the repository:
```bash
git clone https://github.com/twadelij/GTM.git
cd GTM
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Start the server:
```bash
python src/server/server.py
```

## 👩‍💻 Development

1. Create a new branch for your feature:
```bash
git checkout -b feature/new-feature
```

2. Start the development server:
```bash
python src/server/server.py --dev
```

3. Run the tests:
```bash
pytest tests/
```

## 🧪 Test Mode

To test the game without manual play:

1. Open the browser console (F12)
2. Execute the following command:
```javascript
runGameTest(5); // Test with 5 wrong answers in round 1
```

Parameters:
- `forcedWrongAnswers`: Number of wrong answers in round 1 (default: 5)

## 📝 Links

- [[TODO]] - Project TODO list
- [[CHANGELOG]] - Version history
- [[CONTRIBUTING]] - Contribution guidelines

## 🤝 Contributing

Contributions are welcome! See [[CONTRIBUTING]] for details.

## 📄 License

This project is licensed under the MIT License - see the [[LICENSE]] file for details.