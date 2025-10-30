// GTM Game Main Script
class GTMGame {
    constructor() {
        this.currentSession = null;
        this.currentRound = 0;
        this.score = 0;
        this.timer = null;
        this.timeLeft = CONFIG.GAME_TIMER;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.showSection('game-menu');
    }
    
    bindEvents() {
        // Menu buttons
        document.getElementById('start-game-btn').addEventListener('click', () => this.startGame());
        document.getElementById('test-api-btn').addEventListener('click', () => this.showApiTest());
        document.getElementById('view-movies-btn').addEventListener('click', () => this.showMoviesList());
        
        // Game buttons
        document.getElementById('skip-btn').addEventListener('click', () => this.skipQuestion());
        document.getElementById('quit-btn').addEventListener('click', () => this.quitGame());
        
        // Results buttons
        document.getElementById('play-again-btn').addEventListener('click', () => this.playAgain());
        document.getElementById('back-menu-btn').addEventListener('click', () => this.backToMenu());
        
        // API test buttons
        document.getElementById('test-health').addEventListener('click', () => this.testHealth());
        document.getElementById('test-movies').addEventListener('click', () => this.testMovies());
        document.getElementById('test-game-start').addEventListener('click', () => this.testGameStart());
        document.getElementById('back-from-test').addEventListener('click', () => this.backToMenu());
        
        // Movies list button
        document.getElementById('back-from-movies').addEventListener('click', () => this.backToMenu());
        
        // Answer buttons
        document.querySelectorAll('.answer-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectAnswer(e.target));
        });
    }
    
    showSection(sectionId) {
        document.querySelectorAll('.game-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');
    }
    
    async startGame() {
        const movieCount = parseInt(document.getElementById('movie-count').value);
        const playerName = document.getElementById('player-name').value || null;
        
        try {
            Utils.showLoading('loading-spinner');
            
            // For original gameplay, always use 20 movies and 6 rounds
            const actualMovieCount = 20; // Original gameplay uses 20 movies
            
            const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.GAME_START}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    movie_count: actualMovieCount,
                    player_name: playerName
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.currentSession = await response.json();
            this.currentRound = 0;
            this.score = 0;
            this.roundScores = []; // Track scores per round
            
            Utils.hideLoading('loading-spinner');
            this.showSection('game-play');
            this.startRound();
            
        } catch (error) {
            Utils.hideLoading('loading-spinner');
            Utils.showError(error.message);
            console.error('Error starting game:', error);
        }
    }
    
    startRound() {
        // Original gameplay: 6 rounds maximum
        if (!this.currentSession || this.currentRound >= 6) {
            this.endGame();
            return;
        }
        
        const movie = this.currentSession.movies[this.currentRound];
        this.displayMovie(movie);
        this.updateGameInfo();
        this.startTimer();
    }
    
    displayMovie(movie) {
        // Show the real movie image
        const movieImage = document.getElementById('movie-image');
        const imagePath = movie.image_path || movie.backdrop_path;
        
        if (imagePath) {
            // Convert relative path to absolute URL
            const imageUrl = imagePath.startsWith('data/') 
                ? `http://localhost:8888/${imagePath}`
                : `http://localhost:8888/data/movies/${imagePath}`;
            
            movieImage.src = imageUrl;
            movieImage.alt = `Movie screenshot: ${movie.title}`;
        } else {
            // Fallback to placeholder
            movieImage.src = '/static/images/placeholder-movie.jpg';
            movieImage.alt = 'Movie screenshot';
        }
        
        // Generate answer options based on current round
        const currentRound = this.currentRound + 1; // 1-based
        const maxChoices = Math.max(1, 6 - currentRound + 1); // 6 -> 5 -> 4 -> 3 -> 2 -> 1
        
        // Get random wrong answers from other movies
        const wrongAnswers = this.getRandomWrongAnswers(movie.title, maxChoices - 1);
        
        // Combine correct answer with wrong answers
        const allAnswers = [movie.title, ...wrongAnswers];
        const shuffledAnswers = Utils.shuffleArray(allAnswers);
        
        const answerButtons = document.querySelectorAll('.answer-btn');
        
        // Show/hide buttons based on number of choices
        answerButtons.forEach((btn, index) => {
            if (index < shuffledAnswers.length) {
                btn.textContent = `${String.fromCharCode(65 + index)}. ${shuffledAnswers[index]}`;
                btn.dataset.answer = shuffledAnswers[index];
                btn.classList.remove('selected', 'correct', 'incorrect');
                btn.disabled = false;
                btn.style.display = 'block';
            } else {
                btn.style.display = 'none';
            }
        });
    }
    
    getRandomWrongAnswers(correctAnswer, count) {
        if (count <= 0) return [];
        
        // Get all movie titles except the correct one
        const allTitles = this.currentSession.movies
            .filter(m => m.title !== correctAnswer)
            .map(m => m.title);
        
        // Shuffle and take the required number
        const shuffled = Utils.shuffleArray(allTitles);
        return shuffled.slice(0, Math.min(count, shuffled.length));
    }
    
    updateGameInfo() {
        document.getElementById('current-round').textContent = 
            `Round ${this.currentRound + 1} of 6`;
        document.getElementById('current-score').textContent = `Score: ${this.score}`;
    }
    
    startTimer() {
        this.timeLeft = CONFIG.GAME_TIMER;
        this.updateTimer();
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimer();
            
            if (this.timeLeft <= 0) {
                this.timeUp();
            }
        }, 1000);
    }
    
    updateTimer() {
        document.getElementById('timer').textContent = `Time: ${this.timeLeft}s`;
    }
    
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    
    selectAnswer(button) {
        // Clear previous selections
        document.querySelectorAll('.answer-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // Mark selected
        button.classList.add('selected');
        
        // Process answer
        setTimeout(() => {
            this.processAnswer(button.dataset.answer);
        }, 500);
    }
    
    processAnswer(selectedAnswer) {
        this.stopTimer();
        
        const currentMovie = this.currentSession.movies[this.currentRound];
        const isCorrect = selectedAnswer === currentMovie.title;
        const currentRound = this.currentRound + 1; // 1-based
        
        // Calculate round score (original scoring system)
        let roundScore = 0;
        
        if (isCorrect) {
            // Base points per round: 5 -> 4 -> 3 -> 2 -> 1 -> 0
            const basePoints = Math.max(0, 6 - currentRound);
            
            // Time bonus: 1 point per second remaining (not in round 6)
            const timeBonus = (currentRound < 6) ? this.timeLeft : 0;
            
            roundScore = basePoints + timeBonus;
            this.score += roundScore;
        }
        
        // Track round score for results
        this.roundScores.push({
            round: currentRound,
            correct: isCorrect,
            score: roundScore,
            timeBonus: isCorrect && currentRound < 6 ? this.timeLeft : 0
        });
        
        // Show correct/incorrect feedback
        document.querySelectorAll('.answer-btn').forEach(btn => {
            if (btn.dataset.answer === currentMovie.title) {
                btn.classList.add('correct');
            } else if (btn.classList.contains('selected')) {
                btn.classList.add('incorrect');
            }
            btn.disabled = true;
        });
        
        // Move to next round after delay
        setTimeout(() => {
            this.currentRound++;
            this.startRound();
        }, 2000);
    }
    
    timeUp() {
        this.stopTimer();
        
        // Show correct answer
        const currentMovie = this.currentSession.movies[this.currentRound];
        document.querySelectorAll('.answer-btn').forEach(btn => {
            if (btn.dataset.answer === currentMovie.title) {
                btn.classList.add('correct');
            }
            btn.disabled = true;
        });
        
        // Move to next round after delay
        setTimeout(() => {
            this.currentRound++;
            this.startRound();
        }, 2000);
    }
    
    skipQuestion() {
        this.timeUp();
    }
    
    quitGame() {
        if (confirm('Are you sure you want to quit the game?')) {
            this.stopTimer();
            this.backToMenu();
        }
    }
    
    endGame() {
        this.stopTimer();
        
        const totalRounds = 6;
        const correctAnswers = this.roundScores.filter(r => r.correct).length;
        const percentage = Utils.calculatePercentage(correctAnswers, totalRounds);
        
        document.getElementById('final-score-text').textContent = 
            `Your Score: ${this.score} points`;
        document.getElementById('final-percentage').textContent = `${percentage}%`;
        
        // Detailed results summary
        let summary = `You got ${correctAnswers} out of ${totalRounds} movies correct.\n\n`;
        summary += `Round breakdown:\n`;
        
        this.roundScores.forEach(round => {
            const status = round.correct ? '✓' : '✗';
            const bonusText = round.timeBonus > 0 ? ` (+${round.timeBonus}s bonus)` : '';
            summary += `Round ${round.round}: ${status} ${round.score} points${bonusText}\n`;
        });
        
        document.getElementById('results-summary').textContent = summary;
        
        this.showSection('game-results');
    }
    
    playAgain() {
        this.currentSession = null;
        this.currentRound = 0;
        this.score = 0;
        this.roundScores = [];
        this.showSection('game-menu');
    }
    
    backToMenu() {
        this.stopTimer();
        this.currentSession = null;
        this.currentRound = 0;
        this.score = 0;
        this.roundScores = [];
        this.showSection('game-menu');
    }
    
    // API Test Functions
    showApiTest() {
        this.showSection('api-test');
    }
    
    async testHealth() {
        try {
            const response = await fetch(`http://localhost:8888/health`);
            const data = await response.json();
            document.getElementById('health-result').textContent = Utils.formatApiResponse(data);
        } catch (error) {
            document.getElementById('health-result').textContent = `Error: ${error.message}`;
        }
    }
    
    async testMovies() {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.MOVIES_LIST}`);
            const data = await response.json();
            document.getElementById('movies-result').textContent = 
                Utils.formatApiResponse(data.slice(0, 5)); // Show first 5 movies
        } catch (error) {
            document.getElementById('movies-result').textContent = `Error: ${error.message}`;
        }
    }
    
    async testGameStart() {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.GAME_START}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    movie_count: 3,
                    player_name: 'Test Player'
                })
            });
            const data = await response.json();
            document.getElementById('game-result').textContent = Utils.formatApiResponse(data);
        } catch (error) {
            document.getElementById('game-result').textContent = `Error: ${error.message}`;
        }
    }
    
    async showMoviesList() {
        try {
            Utils.showLoading('loading-spinner');
            
            const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.MOVIES_LIST}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const movies = await response.json();
            
            const container = document.getElementById('movies-container');
            container.innerHTML = '';
            
            // Limit to prevent infinite loading
            const displayCount = Math.min(movies.length, 50);
            
            for (let i = 0; i < displayCount; i++) {
                const movie = movies[i];
                const movieDiv = document.createElement('div');
                movieDiv.className = 'movie-item';
                
                // Construct image URL
                const imagePath = movie.image || movie.image_path;
                const imageUrl = imagePath 
                    ? (imagePath.startsWith('data/') 
                        ? `http://localhost:8888/${imagePath}`
                        : `http://localhost:8888/data/movies/${imagePath}`)
                    : '/static/images/placeholder-movie.jpg';
                
                movieDiv.innerHTML = `
                    <img src="${imageUrl}" alt="${movie.title}" onerror="this.src='/static/images/placeholder-movie.jpg'">
                    <h4>${movie.title}</h4>
                    <p>${movie.year || 'N/A'} • ${movie.rating || 'Not Rated'}</p>
                `;
                container.appendChild(movieDiv);
            }
            
            // Add pagination info if there are more movies
            if (movies.length > displayCount) {
                const infoDiv = document.createElement('div');
                infoDiv.className = 'movies-info';
                infoDiv.innerHTML = `<p>Showing ${displayCount} of ${movies.length} movies</p>`;
                container.appendChild(infoDiv);
            }
            
            Utils.hideLoading('loading-spinner');
            this.showSection('movies-list');
        } catch (error) {
            Utils.hideLoading('loading-spinner');
            Utils.showError(error.message);
        }
    }
}

// Global function for testing (referenced in HTML)
function runGameTest() {
    console.log('Running game test...');
    const game = new GTMGame();
    game.testHealth();
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.gtmGame = new GTMGame();
    console.log('GTM Game initialized');
});

// Export for global access
window.GTMGame = GTMGame;
window.runGameTest = runGameTest;
