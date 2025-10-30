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
            
            const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.GAME_START}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    movie_count: movieCount,
                    player_name: playerName
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.currentSession = await response.json();
            this.currentRound = 0;
            this.score = 0;
            
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
        if (!this.currentSession || this.currentRound >= this.currentSession.movies.length) {
            this.endGame();
            return;
        }
        
        const movie = this.currentSession.movies[this.currentRound];
        this.displayMovie(movie);
        this.updateGameInfo();
        this.startTimer();
    }
    
    displayMovie(movie) {
        // In a real implementation, you'd show the movie image and generate answer options
        // For now, we'll show placeholder data
        const movieImage = document.getElementById('movie-image');
        movieImage.src = `/static/images/placeholder-movie.jpg`;
        movieImage.alt = 'Movie screenshot';
        
        // Generate fake answer options for demo
        const answers = [
            movie.title,
            'Wrong Answer 1',
            'Wrong Answer 2', 
            'Wrong Answer 3'
        ];
        
        const shuffledAnswers = Utils.shuffleArray(answers);
        const answerButtons = document.querySelectorAll('.answer-btn');
        
        answerButtons.forEach((btn, index) => {
            if (index < shuffledAnswers.length) {
                btn.textContent = `${String.fromCharCode(65 + index)}. ${shuffledAnswers[index]}`;
                btn.dataset.answer = shuffledAnswers[index];
                btn.classList.remove('selected', 'correct', 'incorrect');
                btn.disabled = false;
            }
        });
    }
    
    updateGameInfo() {
        document.getElementById('current-round').textContent = 
            `Round ${this.currentRound + 1} of ${this.currentSession.movies.length}`;
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
        
        if (isCorrect) {
            this.score++;
        }
        
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
        
        const totalMovies = this.currentSession.movies.length;
        const percentage = Utils.calculatePercentage(this.score, totalMovies);
        
        document.getElementById('final-score-text').textContent = 
            `Your Score: ${this.score}/${totalMovies}`;
        document.getElementById('final-percentage').textContent = `${percentage}%`;
        document.getElementById('results-summary').textContent = 
            `Great job! You got ${this.score} out of ${totalMovies} movies correct.`;
        
        this.showSection('game-results');
    }
    
    playAgain() {
        this.currentSession = null;
        this.currentRound = 0;
        this.score = 0;
        this.showSection('game-menu');
    }
    
    backToMenu() {
        this.stopTimer();
        this.currentSession = null;
        this.currentRound = 0;
        this.score = 0;
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
            const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.MOVIES_LIST}`);
            const movies = await response.json();
            
            const container = document.getElementById('movies-container');
            container.innerHTML = '';
            
            movies.slice(0, 20).forEach(movie => { // Show first 20 movies
                const movieDiv = document.createElement('div');
                movieDiv.className = 'movie-item';
                movieDiv.innerHTML = `
                    <img src="/static/images/placeholder-movie.jpg" alt="${movie.title}" onerror="this.src='/static/images/no-image.png'">
                    <h4>${movie.title}</h4>
                    <p>${movie.year} • ${movie.rating || 'Not Rated'}</p>
                `;
                container.appendChild(movieDiv);
            });
            
            this.showSection('movies-list');
        } catch (error) {
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
