console.log('script.js loaded');

// Game state variabelen
const GameState = {
    wrongAnswers: 0,
    correctAnswers: 0,
    currentScore: 0,
    incorrectMovies: [],
    playedMovies: new Set(),
    currentRound: 1,
    remainingTime: 0,
    timerInterval: null,
    activeSplashScreen: null,
    totalMovies: 20,
    TIMER_DURATION: 15000, // 15 seconden per vraag
    SPLASH_DURATION: 4000, // 4 seconden splash screen
    
    reset() {
        console.log('GameState.reset() called');
        this.wrongAnswers = 0;
        this.correctAnswers = 0;
        this.currentScore = 0;
        this.incorrectMovies = [];
        this.playedMovies.clear();
        this.currentRound = 1;
        this.remainingTime = this.TIMER_DURATION;
        
        const progressCounter = document.querySelector('.progress-counter');
        const scoreDisplay = document.querySelector('.score-display');
        
        if (progressCounter) {
            progressCounter.textContent = `Ronde ${this.currentRound}: nog ${this.totalMovies} films te gaan`;
        }
        if (scoreDisplay) {
            scoreDisplay.textContent = 'Score: 0';
        }
    }
};

// Basis functies
function getChoicesForRound(round) {
    return 7 - round; // 6, 5, 4, 3, 2, 1 keuzes voor rondes 1-6
}

function getPointsForRound(round) {
    return Math.max(0, 6 - round); // 5, 4, 3, 2, 1, 0 punten voor rondes 1-6
}

function getTimeBonus() {
    return Math.floor(GameState.remainingTime / 1000); // 1 punt per seconde over
}

// Initialisatie
async function initializeGame() {
    console.log('Initializing game...');
    try {
        if (!window.movieDb) {
            throw new Error('MovieDb not loaded');
        }
        GameState.reset();
        await window.movieDb.initialize();
        console.log('Starting first round...');
        await startNewRound();
    } catch (error) {
        console.error('Failed to initialize game:', error);
        const loadingDiv = document.querySelector('.loading');
        if (loadingDiv) {
            loadingDiv.textContent = 'Failed to load game. Please refresh.';
        }
    }
}

// Start wanneer alles geladen is
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired');
    console.log('window.CONFIG:', window.CONFIG);
    console.log('window.movieDb:', window.movieDb);
    initializeGame();
});

// UI functies
function showSplashScreen(title, messages, bonus = '') {
    if (GameState.activeSplashScreen && GameState.activeSplashScreen.parentNode) {
        GameState.activeSplashScreen.parentNode.removeChild(GameState.activeSplashScreen);
    }
    
    const splash = document.createElement('div');
    splash.className = 'splash-screen';
    
    const content = document.createElement('div');
    content.className = 'splash-content';
    content.style.backgroundColor = title === 'Correct!' ? '#28a745' : '#dc3545';
    
    const heading = document.createElement('h2');
    heading.textContent = title;
    content.appendChild(heading);
    
    messages.forEach(message => {
        const p = document.createElement('p');
        p.textContent = message;
        content.appendChild(p);
    });
    
    if (bonus) {
        const bonusElement = document.createElement('p');
        bonusElement.className = 'bonus';
        bonusElement.textContent = bonus;
        content.appendChild(bonusElement);
    }
    
    splash.appendChild(content);
    document.body.appendChild(splash);
    GameState.activeSplashScreen = splash;
    
    return new Promise(resolve => {
        setTimeout(() => {
            if (splash.parentNode) {
                splash.parentNode.removeChild(splash);
            }
            GameState.activeSplashScreen = null;
            resolve();
        }, GameState.SPLASH_DURATION);
    });
}

function updateButtons(movies) {
    const optionsContainer = document.querySelector('.options-container');
    optionsContainer.innerHTML = '';
    
    movies.forEach((movie, index) => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = movie.title;
        button.dataset.index = index;
        button.onclick = () => handleGuess(movie);
        optionsContainer.appendChild(button);
    });
}

// Helper function to update progress counter
function updateProgressCounter() {
    const progressCounter = document.querySelector('.progress-counter');
    if (progressCounter) {
        let remaining;
        if (GameState.currentRound === 1) {
            remaining = GameState.totalMovies - (GameState.correctAnswers + GameState.incorrectMovies.length);
        } else {
            remaining = GameState.incorrectMovies.length;
        }
        progressCounter.textContent = `Ronde ${GameState.currentRound}: nog ${remaining} films te gaan`;
    }
}

// Helper function to update score display
function updateScoreDisplay() {
    const scoreDisplay = document.querySelector('.score-display');
    if (scoreDisplay) {
        scoreDisplay.textContent = `Score: ${GameState.currentScore}`;
    }
}

function showGameOver() {
    const gameOverDiv = document.createElement('div');
    gameOverDiv.className = 'game-over';
    gameOverDiv.innerHTML = `
        <h2>Game Over!</h2>
        <p>Je eindscore: ${GameState.currentScore} punten</p>
        <button onclick="location.reload()">Opnieuw Spelen</button>
    `;
    
    const container = document.querySelector('.container');
    container.innerHTML = '';
    container.appendChild(gameOverDiv);
}

// Timer functies
function startTimer() {
    clearInterval(GameState.timerInterval);
    GameState.remainingTime = GameState.TIMER_DURATION;
    const timerBar = document.querySelector('.timer-bar');
    
    GameState.timerInterval = setInterval(() => {
        GameState.remainingTime = Math.max(0, GameState.remainingTime - 100);
        if (timerBar) {
            timerBar.style.width = `${(GameState.remainingTime / GameState.TIMER_DURATION) * 100}%`;
        }
        
        if (GameState.remainingTime <= 0) {
            stopTimer();
            handleTimeOut();
        }
    }, 100);
}

function stopTimer() {
    clearInterval(GameState.timerInterval);
    GameState.timerInterval = null;
}

async function handleTimeOut() {
    const currentMovie = movieDb.getCurrentMovie();
    GameState.incorrectMovies.push(currentMovie);
    GameState.playedMovies.add(currentMovie.id);
    
    updateProgressCounter();
    
    await showSplashScreen('Tijd Op!', [
        'Je was te langzaam!',
        'Volgende keer wat sneller...',
        `Score blijft: ${GameState.currentScore}`
    ]);
    
    if (GameState.correctAnswers + GameState.incorrectMovies.length >= GameState.totalMovies) {
        GameState.currentRound++;
        await startNextRound();
    } else {
        await startNewRound();
    }
}

async function handleGuess(guessedMovie) {
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(button => button.disabled = true);
    
    stopTimer();
    
    const currentMovie = movieDb.getCurrentMovie();
    const isCorrect = guessedMovie.id === currentMovie.id;
    
    if (isCorrect) {
        const points = getPointsForRound(GameState.currentRound);
        const timeBonus = getTimeBonus();
        GameState.currentScore += points + timeBonus;
        GameState.correctAnswers++;
        GameState.playedMovies.add(currentMovie.id);
        
        updateScoreDisplay(); // Update score display after changing score
        updateProgressCounter(); // Update counter after correct guess
        
        await showSplashScreen('Correct!', [
            `+${points} punten (Ronde ${GameState.currentRound})`,
            `+${timeBonus} punten tijdsbonus`,
            `Totale score: ${GameState.currentScore}`
        ], timeBonus > 0 ? `Bonus: +${timeBonus}` : '');
        
        if (GameState.correctAnswers + GameState.incorrectMovies.length >= GameState.totalMovies) {
            if (GameState.incorrectMovies.length === 0) {
                showGameOver();
            } else {
                GameState.currentRound++;
                await startNextRound();
            }
        } else {
            await startNewRound();
        }
    } else {
        GameState.incorrectMovies.push(currentMovie);
        GameState.playedMovies.add(currentMovie.id);
        
        updateProgressCounter(); // Update counter after incorrect guess
        
        await showSplashScreen('Incorrect!', [
            'Probeer het opnieuw in de volgende ronde',
            `Score blijft: ${GameState.currentScore}`
        ]);
        
        if (GameState.correctAnswers + GameState.incorrectMovies.length >= GameState.totalMovies) {
            GameState.currentRound++;
            await startNextRound();
        } else {
            await startNewRound();
        }
    }
}

async function startNewRound() {
    const choices = getChoicesForRound(GameState.currentRound);
    const movies = movieDb.getRandomMovies(choices);
    
    if (!movies || movies.length < choices) {
        console.error('Not enough movies available');
        showGameOver();
        return;
    }

    const currentMovie = movies[Math.floor(Math.random() * movies.length)];
    movieDb.setCurrentMovie(currentMovie);

    // Update UI
    const movieImage = document.querySelector('.movie-image img');
    const loadingDiv = document.querySelector('.loading');
    
    updateProgressCounter();
    
    if (movieImage && loadingDiv && currentMovie) {
        const stillPath = movieDb.getRandomStillForMovie(currentMovie);
        if (stillPath) {
            try {
                movieImage.src = stillPath;
                movieImage.alt = `Scene from ${currentMovie.title}`;
                loadingDiv.style.display = 'none';
                movieImage.style.display = 'block';
            } catch (error) {
                console.error('Failed to load movie image:', error);
                loadingDiv.textContent = 'Failed to load movie image';
            }
        } else {
            loadingDiv.textContent = 'No movie still available';
        }
    }

    // Update buttons
    updateButtons(movies);
    startTimer();
}

async function startNextRound() {
    if (GameState.currentRound > 6 || GameState.incorrectMovies.length === 0) {
        showGameOver();
        return;
    }
    
    const choices = getChoicesForRound(GameState.currentRound);
    const points = getPointsForRound(GameState.currentRound);
    
    updateProgressCounter();
    
    // Kies een willekeurige film uit de incorrecte films
    const currentIndex = Math.floor(Math.random() * GameState.incorrectMovies.length);
    const currentMovie = GameState.incorrectMovies[currentIndex];
    GameState.incorrectMovies.splice(currentIndex, 1);
    
    // Genereer opties voor deze ronde
    const options = [currentMovie];
    
    // Voeg willekeurige andere films toe als opties
    const otherMovies = movieDb.getRandomMovies(choices - 1);
    options.push(...otherMovies);
    
    // Shuffle de opties
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
    }
    
    movieDb.setCurrentMovie(currentMovie);
    
    // Update UI
    const movieImage = document.querySelector('.movie-image img');
    const loadingDiv = document.querySelector('.loading');
    
    if (movieImage && loadingDiv && currentMovie) {
        const stillPath = movieDb.getRandomStillForMovie(currentMovie);
        if (stillPath) {
            try {
                movieImage.src = stillPath;
                movieImage.alt = `Scene from ${currentMovie.title}`;
                loadingDiv.style.display = 'none';
                movieImage.style.display = 'block';
            } catch (error) {
                console.error('Failed to load movie image:', error);
                loadingDiv.textContent = 'Failed to load movie image';
            }
        } else {
            loadingDiv.textContent = 'No movie still available';
        }
    }
    
    // Update buttons
    updateButtons(options);
    startTimer();
}
