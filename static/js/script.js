// GTM Game Main Script
class GTMGame {
    constructor() {
        this.currentSession = null;
        this.currentRound = 0;
        this.score = 0;
        this.timer = null;
        this.timeLeft = 0;
        this.roundScores = [];
        
        // Progressive elimination
        this.allMovies = [];
        this.correctMovies = [];
        this.wrongMovies = [];
        this.currentMovieIndex = 0;
        
        // Background management
        this.currentBackgroundMovie = null;
        this.backgroundMovies = [];
        
        this.init();
    }
    
    async init() {
        console.log('🎮 GTM Game initializing...');
        
        // Load background movies for Netflix-style background
        await this.loadBackgroundMovies();
        
        // Set initial random background
        this.setRandomBackground();
        
        this.bindEvents();
        console.log('✅ GTM Game initialized');
    }
    
    async loadBackgroundMovies() {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.MOVIES_LIST}`);
            if (response.ok) {
                this.backgroundMovies = await response.json();
                console.log(`🖼️ Loaded ${this.backgroundMovies.length} movies for background rotation`);
            }
        } catch (error) {
            console.error('❌ Failed to load background movies:', error);
        }
    }
    
    setRandomBackground() {
        if (this.backgroundMovies.length === 0) return;
        
        // Select a random movie different from current
        const availableMovies = this.backgroundMovies.filter(m => 
            !this.currentBackgroundMovie || m.title !== this.currentBackgroundMovie.title
        );
        
        if (availableMovies.length === 0) return;
        
        const randomMovie = availableMovies[Math.floor(Math.random() * availableMovies.length)];
        this.currentBackgroundMovie = randomMovie;
        
        // Set background image
        const backgroundElement = document.getElementById('background-image');
        const imagePath = randomMovie.image || randomMovie.image_path;
        
        if (imagePath) {
            const imageUrl = `http://localhost:8888/data/movies/${imagePath}`;
            backgroundElement.style.backgroundImage = `url(${imageUrl})`;
            console.log(`🎬 Background changed to: ${randomMovie.title}`);
        }
    }
    
    bindEvents() {
        // Menu navigation
        document.getElementById('start-game-btn').addEventListener('click', () => this.startGame());
        document.getElementById('test-api-btn').addEventListener('click', () => this.showApiTest());
        document.getElementById('view-movies-btn').addEventListener('click', () => this.showMoviesList());
        
        // Game controls
        document.getElementById('skip-btn').addEventListener('click', () => this.skipQuestion());
        document.getElementById('quit-btn').addEventListener('click', () => this.quitGame());
        
        // Answer buttons
        document.querySelectorAll('.answer-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectAnswer(e.target));
        });
        
        // Results navigation
        document.getElementById('play-again-btn').addEventListener('click', () => this.playAgain());
        document.getElementById('back-menu-btn').addEventListener('click', () => this.backToMenu());
        
        // API test buttons
        document.getElementById('test-health').addEventListener('click', () => this.testHealth());
        document.getElementById('test-movies').addEventListener('click', () => this.testMovies());
        document.getElementById('test-game-start').addEventListener('click', () => this.testGameStart());
        
        // Back navigation
        document.getElementById('back-from-test').addEventListener('click', () => this.backToMenu());
        document.getElementById('back-from-movies').addEventListener('click', () => this.backToMenu());
    }
    
    showSection(sectionId) {
        document.querySelectorAll('.game-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');
    }
    
    async startGame() {
        const playerName = document.getElementById('player-name').value || null;
        
        try {
            Utils.showLoading('loading-spinner');
            
            // Get 20 movies from API, but only use 10 for gameplay
            const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.GAME_START}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    movie_count: 20, // Get 20 from API for variety
                    player_name: playerName
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.currentSession = await response.json();
            this.currentRound = 0;
            this.score = 0;
            this.roundScores = [];
            
            // Initialize progressive elimination system with 10 movies
            this.allMovies = this.currentSession.movies.slice(0, 10); // Use only first 10
            this.correctMovies = []; // Movies answered correctly
            this.wrongMovies = []; // Movies answered incorrectly
            this.currentMovieIndex = 0; // Track which movie we're on
            
            console.log('🎮 Game started with progressive elimination');
            console.log(`📊 Total movies in pool: ${this.allMovies.length}`);
            console.log(`🎯 Round 1 will show all ${this.allMovies.length} movies with 6 choices each`);
            
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
        // Check if all movies are guessed correctly
        if (this.correctMovies.length === this.allMovies.length) {
            console.log('🎉 All movies guessed correctly! Ending game.');
            this.endGame();
            return;
        }
        
        // Check if we've shown all movies for current round
        const currentRound = this.currentRound + 1; // 1-based
        
        // Check if game should end (max 6 rounds)
        if (currentRound > 6) {
            console.log('🏁 Maximum rounds reached, ending game');
            this.endGame();
            return;
        }
        
        console.log(`🔄 Starting round ${currentRound}`);
        console.log(`📊 Movies answered so far: ${this.correctMovies.length + this.wrongMovies.length}`);
        console.log(`✅ Correct: ${this.correctMovies.length}, ❌ Wrong: ${this.wrongMovies.length}`);
        
        // Determine which movies to show in this round
        let moviesToShow = [];
        
        if (currentRound === 1) {
            // Round 1: Show all 10 movies with 6 choices each
            moviesToShow = [...this.allMovies];
            console.log(`🎯 Round 1: Showing all ${moviesToShow.length} movies with 6 choices`);
        } else {
            // Rounds 2+: Show only wrong movies from previous round with decreasing choices
            moviesToShow = [...this.wrongMovies];
            const choices = Math.max(1, 6 - currentRound + 1); // 5->4->3->2->1
            console.log(`🎯 Round ${currentRound}: Showing ${moviesToShow.length} wrong movies with ${choices} choices each`);
        }
        
        // Check if we have movies to show
        if (moviesToShow.length === 0) {
            console.log('🏁 No more wrong movies, ending game');
            this.endGame();
            return;
        }
        
        // Get current movie based on index
        if (this.currentMovieIndex >= moviesToShow.length) {
            // Move to next round - RESET wrongMovies for new round
            this.currentRound++;
            this.currentMovieIndex = 0;
            this.wrongMovies = []; // CRITICAL: Reset wrong movies for next round
            this.startRound();
            return;
        }
        
        const currentMovie = moviesToShow[this.currentMovieIndex];
        
        console.log(`🎬 Movie ${this.currentMovieIndex + 1}/${moviesToShow.length} in round ${currentRound}: ${currentMovie.title}`);
        
        this.displayMovie(currentMovie);
        this.updateGameInfo();
        this.startTimer();
    }
    
    displayMovie(movie) {
        console.log('🎬 Displaying movie:', movie);
        
        // Show the real movie image
        const movieImage = document.getElementById('movie-image');
        const imagePath = movie.image || movie.image_path || movie.backdrop_path;
        
        console.log('📸 Image path from API:', imagePath);
        
        if (imagePath) {
            // Construct proper URL - images are in data/movies/
            const imageUrl = `http://localhost:8888/data/movies/${imagePath}`;
            
            console.log('🌐 Full image URL:', imageUrl);
            
            movieImage.src = imageUrl;
            movieImage.alt = `Movie screenshot: ${movie.title}`;
            
            // Add error handling
            movieImage.onload = () => console.log('✅ Image loaded successfully');
            movieImage.onerror = (e) => {
                console.error('❌ Image failed to load:', e);
                console.log('🔄 Falling back to placeholder');
                movieImage.src = '/static/images/placeholder-movie.jpg';
            };
        } else {
            console.log('⚠️ No image path found, using placeholder');
            movieImage.src = '/static/images/placeholder-movie.jpg';
            movieImage.alt = 'Movie screenshot';
        }
        
        // Generate answer options based on current round
        const currentRound = this.currentRound + 1; // 1-based
        let maxChoices;
        
        if (currentRound === 1) {
            maxChoices = 6; // Always 6 choices in round 1
        } else {
            maxChoices = Math.max(1, 6 - currentRound + 1); // 5->4->3->2->1
        }
        
        console.log(`🎯 Round ${currentRound}: ${maxChoices} choices`);
        
        // Get random wrong answers from ALL movies (not just current round)
        const wrongAnswers = this.getRandomWrongAnswers(movie.title, maxChoices - 1);
        
        // IMPORTANT: Always include the correct answer!
        const allAnswers = [movie.title, ...wrongAnswers];
        const shuffledAnswers = Utils.shuffleArray(allAnswers);
        
        // Verify correct answer is in the choices
        if (!shuffledAnswers.includes(movie.title)) {
            console.error('❌ CRITICAL ERROR: Correct answer not in choices!');
            // Force include correct answer
            shuffledAnswers[0] = movie.title;
        }
        
        console.log('📝 Answer options:', shuffledAnswers);
        console.log(`✅ Correct answer "${movie.title}" is in choices: ${shuffledAnswers.includes(movie.title)}`);
        
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
        const currentRound = this.currentRound + 1;
        
        // Determine movies in current round for progress display
        let moviesInRound = [];
        if (currentRound === 1) {
            moviesInRound = [...this.allMovies];
        } else {
            moviesInRound = [...this.wrongMovies];
        }
        
        const movieProgress = this.currentMovieIndex + 1;
        const totalMovies = moviesInRound.length;
        
        // Update display with round and progress
        document.getElementById('current-round').textContent = 
            `Round ${currentRound} of 6 | Movie ${movieProgress}/${totalMovies}`;
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
        
        const currentRound = this.currentRound + 1; // 1-based
        
        // Find the current movie from the display
        const movieImage = document.getElementById('movie-image');
        const currentMovieTitle = movieImage.alt.replace('Movie screenshot: ', '');
        const currentMovie = this.allMovies.find(m => m.title === currentMovieTitle);
        
        if (!currentMovie) {
            console.error('❌ Could not find current movie!');
            return;
        }
        
        const isCorrect = selectedAnswer === currentMovie.title;
        
        console.log(`🎯 Answer processed: "${selectedAnswer}"`);
        console.log(`✅ Correct: ${isCorrect}`);
        
        // Calculate round score (original scoring system)
        let roundScore = 0;
        
        if (isCorrect) {
            // Base points per round: 5 -> 4 -> 3 -> 2 -> 1 -> 0
            const basePoints = Math.max(0, 6 - currentRound);
            
            // Time bonus: 1 point per second remaining (not in round 6)
            const timeBonus = (currentRound < 6) ? this.timeLeft : 0;
            
            roundScore = basePoints + timeBonus;
            this.score += roundScore;
            
            // PROGRESSIVE ELIMINATION: Add to correct list
            if (!this.correctMovies.find(m => m.title === currentMovie.title)) {
                this.correctMovies.push(currentMovie);
                console.log(`✅ Movie added to correct list: ${currentMovie.title}`);
            }
            
            // CRITICAL FIX: Remove from wrong list if it was there
            const wrongIndex = this.wrongMovies.findIndex(m => m.title === currentMovie.title);
            if (wrongIndex !== -1) {
                this.wrongMovies.splice(wrongIndex, 1);
                console.log(`🔧 Movie removed from wrong list: ${currentMovie.title}`);
            }
        } else {
            // PROGRESSIVE ELIMINATION: Add to wrong list (only if not already correct)
            const isAlreadyCorrect = this.correctMovies.find(m => m.title === currentMovie.title);
            if (!isAlreadyCorrect && !this.wrongMovies.find(m => m.title === currentMovie.title)) {
                this.wrongMovies.push(currentMovie);
                console.log(`❌ Movie added to wrong list: ${currentMovie.title}`);
            }
        }
        
        // Track round score for results
        this.roundScores.push({
            round: currentRound,
            movieTitle: currentMovie.title,
            correct: isCorrect,
            score: roundScore,
            timeBonus: isCorrect && currentRound < 6 ? this.timeLeft : 0
        });
        
        // Show correct/incorrect feedback with comments
        const encouragingComments = [
            "🎉 Brilliant! You nailed it!",
            "⭐ Absolutely stellar!",
            "🔥 You're on fire!",
            "💪 Movie buff level: Expert!",
            "🎬 Lights, camera, CORRECT!",
            "🏆 Champion of cinema!",
            "🎯 Bullseye! Perfect shot!",
            "✨ That's the magic answer!",
            "🚀 To the moon with that answer!",
            "🧠 Big brain energy!",
            "👑 Royalty of movie trivia!",
            "💎 Diamond-tier guess!",
            "🎪 You're the ringmaster!",
            "🦸 Superhero status achieved!",
            "🌟 Star of the show!",
            "🎵 Music to my ears!",
            "🎨 A masterpiece of knowledge!",
            "🏅 Gold medal performance!",
            "🎭 Oscar-worthy answer!",
            "⚡ Lightning-fast brilliance!"
        ];
        
        const snarkyComments = [
            "😬 Yikes... that's not it, chief!",
            "🤦 Maybe watch it again?",
            "❌ Not even close, buddy!",
            "😅 Did you even see this movie?",
            "🙈 Ouch! That hurt to watch.",
            "🎪 Nice try, clown!",
            "📚 Time to hit the books!",
            "🤔 Are you even trying?",
            "😴 Did you fall asleep?",
            "🎲 Random guess? Shows!",
            "🤷 Better luck next time!",
            "😂 That's... creative!",
            "🎯 You missed by a mile!",
            "🧐 Questionable choice there!",
            "🙃 So close... not!",
            "🎬 Cut! Let's do another take.",
            "🍿 Maybe less popcorn, more focus?",
            "🎰 Rolling snake eyes!",
            "🎪 This isn't a comedy show!",
            "😬 Swing and a miss!"
        ];
        
        const feedbackDiv = document.createElement('div');
        feedbackDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.95);
            padding: 30px 50px;
            border-radius: 15px;
            font-size: 1.5rem;
            font-weight: bold;
            z-index: 10000;
            text-align: center;
            border: 3px solid ${isCorrect ? '#00ff00' : '#ff0000'};
            box-shadow: 0 0 30px ${isCorrect ? '#00ff00' : '#ff0000'};
        `;
        
        if (isCorrect) {
            feedbackDiv.textContent = encouragingComments[Math.floor(Math.random() * encouragingComments.length)];
            feedbackDiv.style.color = '#00ff00';
        } else {
            feedbackDiv.textContent = snarkyComments[Math.floor(Math.random() * snarkyComments.length)];
            feedbackDiv.style.color = '#ff0000';
        }
        
        document.body.appendChild(feedbackDiv);
        setTimeout(() => feedbackDiv.remove(), 800); // Reduced from 2000ms to 800ms to not overlap with next movie
        
        document.querySelectorAll('.answer-btn').forEach(btn => {
            if (btn.classList.contains('selected')) {
                // Only show if user was correct
                if (isCorrect) {
                    btn.classList.add('correct');
                } else {
                    btn.classList.add('incorrect');
                }
            }
            btn.disabled = true;
        });
        
        // PROGRESSIVE ELIMINATION: Move to next movie or round
        setTimeout(() => {
            // Remove any lingering feedback popups
            document.querySelectorAll('div').forEach(div => {
                if (div.style.position === 'fixed' && div.style.zIndex === '10000') {
                    div.remove();
                }
            });
            this.currentMovieIndex++;
            
            // Determine movies for current round
            let moviesInRound = [];
            if (currentRound === 1) {
                moviesInRound = [...this.allMovies];
            } else if (currentRound <= 5) {
                moviesInRound = [...this.wrongMovies];
            } else {
                moviesInRound = this.wrongMovies.slice(0, 1);
            }
            
            // Check if we need to move to next round
            if (this.currentMovieIndex >= moviesInRound.length) {
                this.currentRound++;
                this.currentMovieIndex = 0;
                console.log(`🔄 Moving to round ${this.currentRound + 1}`);
            }
            
            this.startRound();
        }, 1000); // Reduced from 2000ms to 1000ms for better responsiveness
    }
    
    timeUp() {
        this.stopTimer();
        
        // Find the current movie from the display
        const movieImage = document.getElementById('movie-image');
        const currentMovieTitle = movieImage.alt.replace('Movie screenshot: ', '');
        const currentMovie = this.allMovies.find(m => m.title === currentMovieTitle);
        
        if (currentMovie) {
            // Show correct answer
            document.querySelectorAll('.answer-btn').forEach(btn => {
                if (btn.dataset.answer === currentMovie.title) {
                    btn.classList.add('correct');
                }
                btn.disabled = true;
            });
            
            // Track as incorrect (no score)
            const currentRound = this.currentRound + 1;
            this.roundScores.push({
                round: currentRound,
                movieTitle: currentMovie.title,
                correct: false,
                score: 0,
                timeBonus: 0
            });
            
            // Add to wrong list (only if not already answered correctly)
            const isAlreadyCorrect = this.correctMovies.find(m => m.title === currentMovie.title);
            if (!isAlreadyCorrect && !this.wrongMovies.find(m => m.title === currentMovie.title)) {
                this.wrongMovies.push(currentMovie);
                console.log(`⏰ Time's up - movie added to wrong list: ${currentMovie.title}`);
            }
        }
        
        // Move to next movie or round after delay
        setTimeout(() => {
            this.currentMovieIndex++;
            
            const currentRound = this.currentRound + 1;
            
            // Determine movies for current round
            let moviesInRound = [];
            if (currentRound === 1) {
                moviesInRound = [...this.allMovies];
            } else if (currentRound <= 5) {
                moviesInRound = [...this.wrongMovies];
            } else {
                moviesInRound = this.wrongMovies.slice(0, 1);
            }
            
            // Check if we need to move to next round
            if (this.currentMovieIndex >= moviesInRound.length) {
                this.currentRound++;
                this.currentMovieIndex = 0;
                console.log(`🔄 Moving to round ${this.currentRound + 1}`);
            }
            
            this.startRound();
        }, 1000); // Reduced from 2000ms to 1000ms for better responsiveness
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
        const correctAnswers = this.correctMovies.length;
        const percentage = Utils.calculatePercentage(correctAnswers, this.allMovies.length);
        
        document.getElementById('final-score-text').textContent = 
            `Your Score: ${this.score} points`;
        document.getElementById('final-percentage').textContent = `${percentage}%`;
        
        // Detailed results summary
        let summary = `You got ${correctAnswers} out of ${this.allMovies.length} movies correct.\n\n`;
        summary += `Round breakdown:\n`;
        
        this.roundScores.forEach(round => {
            const status = round.correct ? '✓' : '✗';
            const bonusText = round.timeBonus > 0 ? ` (+${round.timeBonus}s bonus)` : '';
            summary += `Round ${round.round}: ${status} ${round.score} points${bonusText} - ${round.movieTitle}\n`;
        });
        
        document.getElementById('results-summary').textContent = summary;
        
        this.showSection('game-results');
    }
    
    playAgain() {
        this.currentSession = null;
        this.currentRound = 0;
        this.score = 0;
        this.roundScores = [];
        
        // Reset progressive elimination
        this.allMovies = [];
        this.correctMovies = [];
        this.wrongMovies = [];
        this.currentMovieIndex = 0;
        
        this.showSection('game-menu');
    }
    
    backToMenu() {
        this.stopTimer();
        this.currentSession = null;
        this.currentRound = 0;
        this.score = 0;
        this.roundScores = [];
        
        // Reset progressive elimination
        this.allMovies = [];
        this.correctMovies = [];
        this.wrongMovies = [];
        this.currentMovieIndex = 0;
        
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
