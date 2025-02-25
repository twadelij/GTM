console.log('script.js loaded');

// Game state variables
const GameState = {
    wrongAnswers: 0,
    correctAnswers: 0,
    currentScore: 0,
    incorrectMovies: [],
    nextRoundMovies: [],
    playedMovies: new Set(),
    currentRound: 1,
    remainingTime: 0,
    timerInterval: null,
    activeSplashScreen: null,
    totalMovies: 20,
    TIMER_DURATION: 15000, // 15 seconds per question
    SPLASH_DURATION: 4000, // 4 seconds splash screen
    
    reset() {
        console.log('GameState.reset() called');
        this.wrongAnswers = 0;
        this.correctAnswers = 0;
        this.currentScore = 0;
        this.incorrectMovies = [];
        this.nextRoundMovies = [];
        this.playedMovies.clear();
        this.currentRound = 1;
        this.remainingTime = this.TIMER_DURATION;
        
        const progressCounter = document.querySelector('.progress-counter');
        const scoreDisplay = document.querySelector('.score-display');
        
        if (progressCounter) {
            progressCounter.textContent = `Round ${this.currentRound}: ${this.totalMovies} movies remaining`;
        }
        if (scoreDisplay) {
            scoreDisplay.textContent = 'Score: 0';
        }
    }
};

// Base functions
function getChoicesForRound(round) {
    // Fixed number of choices per round:
    // Round 1: 6 choices
    // Round 2: 5 choices for ALL wrong movies from round 1
    // Round 3: 4 choices for ALL wrong movies from round 2
    // Round 4: 3 choices for ALL wrong movies from round 3
    // Round 5: 2 choices for ALL wrong movies from round 4
    // Round 6: 1 choice for ALL wrong movies from round 5
    return Math.max(1, 7 - round); // Start with 6 choices, decrease by 1 per round
}

function getPointsForRound(round) {
    // Round 6 gives no points
    if (round >= 6) return 0;
    // Otherwise normal point calculation
    return Math.max(0, 6 - round); // 5, 4, 3, 2, 1, 0 points for rounds 1-6
}

function getTimeBonus() {
    // No time bonus in round 6
    if (GameState.currentRound >= 6) return 0;
    // Otherwise normal time bonus
    return Math.floor(GameState.remainingTime / 1000); // 1 point per second remaining
}

// Initialization
async function initializeGame() {
    console.log('Initializing game...');
    const loadingDiv = document.querySelector('.loading');
    
    try {
        if (!window.CONFIG) {
            throw new Error('CONFIG is not loaded. Check if config.js is loaded correctly.');
        }
        console.log('CONFIG loaded:', window.CONFIG);

        if (!window.movieDb) {
            throw new Error('MovieDb is not loaded. Check if movieDb.js is loaded correctly.');
        }
        console.log('MovieDb instance found');

        if (!window.imageManager) {
            throw new Error('ImageManager is not loaded. Check if imageManager.js is loaded correctly.');
        }
        console.log('ImageManager instance found');

        GameState.reset();
        
        if (loadingDiv) {
            loadingDiv.textContent = 'Initializing database...';
        }
        
        await window.movieDb.initialize();
        
        if (window.movieDb.initializationError) {
            throw window.movieDb.initializationError;
        }
        
        if (!window.movieDb.movies || window.movieDb.movies.length === 0) {
            throw new Error('No movies found in database.');
        }
        
        console.log('Starting first round...');
        if (loadingDiv) {
            loadingDiv.textContent = 'Starting first round...';
        }
        
        await startNewRound();
    } catch (error) {
        console.error('Failed to initialize game:', error);
        if (loadingDiv) {
            loadingDiv.innerHTML = `
                <div style="color: red; text-align: center;">
                    <p>Error loading game:</p>
                    <p>${error.message}</p>
                    <p>Refresh the page to try again.</p>
                </div>
            `;
        }
    }
}

// Start when everything is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired');
    console.log('window.CONFIG:', window.CONFIG);
    console.log('window.movieDb:', window.movieDb);
    console.log('window.imageManager:', window.imageManager);
    
    if (!window.CONFIG) {
        console.error('CONFIG is not loaded!');
        return;
    }
    
    if (!window.movieDb) {
        console.error('movieDb is not loaded!');
        return;
    }
    
    if (!window.imageManager) {
        console.error('imageManager is not loaded!');
        return;
    }
    
    initializeGame();
});

// UI functions
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
    optionsContainer.style.display = 'flex';
    optionsContainer.style.flexDirection = 'column';
    optionsContainer.style.gap = '10px';
    
    movies.forEach((movie, index) => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = movie.title;
        button.dataset.index = index;
        button.onclick = () => handleGuess(movie);
        button.style.width = '100%';
        button.style.margin = '0';
        optionsContainer.appendChild(button);
    });

    // Direct the visible class to add
    optionsContainer.classList.add('visible');
}

// Helper function to update progress counter
function updateProgressCounter() {
    const progressCounter = document.querySelector('.progress-counter');
    if (progressCounter) {
        let remaining;
        const totalWrong = GameState.incorrectMovies.length + GameState.nextRoundMovies.length;
        
        if (GameState.currentRound === 1) {
            remaining = GameState.totalMovies - (GameState.correctAnswers + GameState.incorrectMovies.length);
            progressCounter.innerHTML = `
                <div class="progress-text">Round ${GameState.currentRound}: ${remaining} movies remaining</div>
                <div class="wrong-count ${totalWrong > 0 ? 'has-errors' : ''}">
                    ${totalWrong} wrong${totalWrong !== 1 ? 's' : ''} total
                </div>
            `;
        } else {
            remaining = GameState.incorrectMovies.length;
            const roundWrong = GameState.nextRoundMovies.length;
            progressCounter.innerHTML = `
                <div class="progress-text">Round ${GameState.currentRound}: ${remaining} movies remaining</div>
                <div class="wrong-count ${totalWrong > 0 ? 'has-errors' : ''}">
                    ${roundWrong} wrong${roundWrong !== 1 ? 's' : ''} this round (${totalWrong} total)
                </div>
            `;
        }
    }
}

// Helper function to update score display
function updateScoreDisplay() {
    const scoreDisplay = document.querySelector('.score-display');
    if (scoreDisplay) {
        scoreDisplay.textContent = `Score: ${GameState.currentScore}`;
    }
}

function updateBackgroundImage(stillPath) {
    // We use a fixed background, so this function does nothing
    return;
}

function showGameOver() {
    const gameOverScreen = document.createElement('div');
    gameOverScreen.className = 'game-over';
    
    const message = document.createElement('h1');
    message.textContent = 'Thank You For Playing!';
    gameOverScreen.appendChild(message);
    
    const scoreElement = document.createElement('p');
    scoreElement.textContent = `Final Score: ${GameState.currentScore}`;
    gameOverScreen.appendChild(scoreElement);
    
    const nextGameInfo = document.createElement('p');
    nextGameInfo.textContent = 'New game available next week!';
    gameOverScreen.appendChild(nextGameInfo);

    if (IS_TEST_MODE) {
        const playAgainBtn = document.createElement('button');
        playAgainBtn.textContent = 'Play Again (Test Mode)';
        playAgainBtn.onclick = resetGame;
        gameOverScreen.appendChild(playAgainBtn);
    }
    
    document.body.appendChild(gameOverScreen);
}

// Timer functions
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
    
    if (GameState.currentRound === 1) {
        GameState.incorrectMovies.push(currentMovie);
    } else {
        GameState.nextRoundMovies.push(currentMovie);
    }
    GameState.playedMovies.add(currentMovie.id);
    
    updateProgressCounter();
    
    await showSplashScreen('Time Out!', [
        'You were too slow!',
        'Try again next time...',
        `Score remains: ${GameState.currentScore}`
    ]);
    
    if (GameState.currentRound === 1) {
        if (GameState.correctAnswers + GameState.incorrectMovies.length >= GameState.totalMovies) {
            // Round 1 is done, go to round 2 with all wrong movies
            GameState.nextRoundMovies = [...GameState.incorrectMovies];
            GameState.incorrectMovies = [];
            GameState.currentRound++;
            await startNextRound();
        } else {
            await startNewRound();
        }
    } else if (GameState.incorrectMovies.length > 0) {
        // There are still movies to guess in this round
        await startNextRound();
    } else {
        // Start new round with the collected wrong movies
        GameState.incorrectMovies = [...GameState.nextRoundMovies];
        GameState.nextRoundMovies = [];
        GameState.currentRound++;
        await startNextRound();
    }
}

async function handleGuess(guessedMovie) {
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(button => button.disabled = true);
    
    stopTimer();
    
    const currentMovie = movieDb.getCurrentMovie();
    const isCorrect = guessedMovie.id === currentMovie.id;
    
    if (isCorrect) {
        if (GameState.currentRound < 6) {
            const points = getPointsForRound(GameState.currentRound);
            const timeBonus = getTimeBonus();
            GameState.currentScore += points + timeBonus;
            
            await showSplashScreen('Correct!', [
                `+${points} points (Round ${GameState.currentRound})`,
                `+${timeBonus} points time bonus`,
                `Total score: ${GameState.currentScore}`
            ], timeBonus > 0 ? `Bonus: +${timeBonus}` : '');
        } else {
            // No points and no time bonus in round 6
            await showSplashScreen('Correct!', [
                'Last chance used!',
                `Total score remains: ${GameState.currentScore}`
            ]);
        }
        
        GameState.correctAnswers++;
        GameState.playedMovies.add(currentMovie.id);
        
        updateScoreDisplay();
        updateProgressCounter();

        if (GameState.currentRound === 1) {
            if (GameState.correctAnswers + GameState.incorrectMovies.length >= GameState.totalMovies) {
                // Round 1 is done, go to round 2 with all wrong movies
                if (GameState.incorrectMovies.length > 0) {
                    GameState.currentRound++;
                    await startNextRound();
                } else {
                    showGameOver();
                }
            } else {
                await startNewRound();
            }
        } else {
            // In other rounds
            if (GameState.incorrectMovies.length === 0) {
                // All movies in this round have been handled
                if (GameState.nextRoundMovies.length === 0) {
                    // No wrong movies left, game is done
                    showGameOver();
                } else {
                    // Start new round with the collected wrong movies
                    GameState.incorrectMovies = [...GameState.nextRoundMovies];
                    GameState.nextRoundMovies = [];
                    GameState.currentRound++;
                    await startNextRound();
                }
            } else {
                // There are still movies to guess in this round
                await startNextRound();
            }
        }
    } else {
        // Wrong answer
        if (GameState.currentRound === 1) {
            GameState.incorrectMovies.push(currentMovie);
        } else {
            GameState.nextRoundMovies.push(currentMovie);
        }
        GameState.playedMovies.add(currentMovie.id);
        
        updateProgressCounter();
        
        await showSplashScreen('Incorrect!', [
            'Try again in the next round',
            `Score remains: ${GameState.currentScore}`
        ]);

        if (GameState.currentRound === 1) {
            if (GameState.correctAnswers + GameState.incorrectMovies.length >= GameState.totalMovies) {
                // Round 1 is done, go to round 2 with all wrong movies
                if (GameState.incorrectMovies.length > 0) {
                    GameState.currentRound++;
                    await startNextRound();
                } else {
                    showGameOver();
                }
            } else {
                await startNewRound();
            }
        } else if (GameState.incorrectMovies.length > 0) {
            // There are still movies to guess in this round
            await startNextRound();
        } else {
            // Start new round with the collected wrong movies
            GameState.incorrectMovies = [...GameState.nextRoundMovies];
            GameState.nextRoundMovies = [];
            GameState.currentRound++;
            await startNextRound();
        }
    }
}

async function startNewRound() {
    console.log('Starting new round...');
    console.log('Current round:', GameState.currentRound);
    console.log('Played movies:', Array.from(GameState.playedMovies));
    let movies;

    if (GameState.currentRound === 1) {
        // In round 1: use the session pool in order
        const unusedMovies = movieDb.sessionPool.filter(
            movie => !GameState.playedMovies.has(movie.id)
        );
        console.log('Unused movies in pool:', unusedMovies.map(m => m.title));
        
        if (unusedMovies.length === 0) {
            console.error('No unused movies available');
            const loadingDiv = document.querySelector('.loading');
            if (loadingDiv) {
                loadingDiv.textContent = 'Error: No movies available. Please refresh the page.';
                loadingDiv.style.color = 'red';
            }
            return;
        }

        // Take the first unused film as the current film
        const currentMovie = unusedMovies[0];
        console.log('Selected current movie:', currentMovie.title);
        
        // Get 5 random other films for the options
        const otherMovies = movieDb.sessionPool
            .filter(m => m.id !== currentMovie.id) // Exclude current movie
            .sort(() => 0.5 - Math.random()) // Shuffle
            .slice(0, 5); // Take 5
        
        // Combine and shuffle the options
        movies = [currentMovie, ...otherMovies];
        movies.sort(() => 0.5 - Math.random());
        
        // Set the current film
        movieDb.setCurrentMovie(currentMovie);
        
        console.log('Final movies for options:', movies.map(m => m.title));
    } else {
        // In other rounds: use getRandomMovies as before
        movies = movieDb.getRandomMovies(6);
        if (!movies || movies.length < 6) {
            console.error('Not enough movies available');
            const loadingDiv = document.querySelector('.loading');
            if (loadingDiv) {
                loadingDiv.textContent = 'Error: Not enough movies available. Please refresh the page.';
                loadingDiv.style.color = 'red';
            }
            return;
        }
        
        // Choose a random film as the correct answer
        const correctIndex = Math.floor(Math.random() * movies.length);
        const correctMovie = movies[correctIndex];
        movieDb.setCurrentMovie(correctMovie);
    }

    // Update UI
    const movieImage = document.querySelector('.movie-image img');
    const loadingDiv = document.querySelector('.loading');
    const optionsContainer = document.querySelector('.options-container');
    
    updateProgressCounter();
    
    // Hide options while loading
    if (optionsContainer) {
        optionsContainer.style.display = 'none';
    }
    
    if (movieImage && loadingDiv) {
        const currentMovie = movieDb.getCurrentMovie();
        const stillPath = movieDb.getRandomStillForMovie(currentMovie);
        if (stillPath) {
            try {
                const fullPath = CONFIG.MOVIES_DIR + stillPath;
                console.log('Loading image:', fullPath);
                
                // Use ImageManager for loading and caching
                await window.imageManager.loadImage(fullPath);
                movieImage.src = fullPath;
                movieImage.alt = `Scene from ${currentMovie.title}`;
                
                // Preload images for next round
                if (GameState.currentRound === 1) {
                    // In round 1: preload the next unused film
                    const nextUnused = movieDb.sessionPool.find(
                        movie => !GameState.playedMovies.has(movie.id) && movie.id !== currentMovie.id
                    );
                    if (nextUnused) {
                        const nextStill = movieDb.getRandomStillForMovie(nextUnused);
                        if (nextStill) {
                            window.imageManager.preloadImages([CONFIG.MOVIES_DIR + nextStill]);
                        }
                    }
                } else {
                    // In other rounds: preload as before
                    const nextMovies = movieDb.getRandomMovies(6);
                    if (nextMovies && nextMovies.length > 0) {
                        const nextStills = nextMovies
                            .map(movie => movieDb.getRandomStillForMovie(movie))
                            .filter(Boolean)
                            .map(still => CONFIG.MOVIES_DIR + still);
                        window.imageManager.preloadImages(nextStills);
                    }
                }
                
                // Update UI
                loadingDiv.style.display = 'none';
                movieImage.style.display = 'block';
                
                // Update background and show options
                updateBackgroundImage(fullPath);
                if (optionsContainer) {
                    optionsContainer.style.display = 'flex';
                    optionsContainer.style.flexDirection = 'column';
                    optionsContainer.style.gap = '10px';
                    updateButtons(movies);
                    startTimer();
                }
            } catch (error) {
                console.error('Failed to load movie image:', error);
                loadingDiv.textContent = 'Failed to load movie image. Retrying...';
                // Try again with a different image
                const newStillPath = movieDb.getRandomStillForMovie(currentMovie, true);
                if (newStillPath) {
                    const newFullPath = CONFIG.MOVIES_DIR + newStillPath;
                    try {
                        await window.imageManager.loadImage(newFullPath);
                        movieImage.src = newFullPath;
                        movieImage.alt = `Scene from ${currentMovie.title}`;
                        loadingDiv.style.display = 'none';
                        movieImage.style.display = 'block';
                        updateBackgroundImage(newFullPath);
                    } catch (retryError) {
                        console.error('Retry failed:', retryError);
                        loadingDiv.textContent = 'Failed to load movie image';
                        updateBackgroundImage(null);
                    }
                } else {
                    loadingDiv.textContent = 'No alternative movie still available';
                    updateBackgroundImage(null);
                }
            }
        } else {
            loadingDiv.textContent = 'No movie still available';
            updateBackgroundImage(null);
        }
    }
}

async function startNextRound() {
    if (GameState.currentRound > 6) {
        showGameOver();
        return;
    }
    
    // If there are no wrong movies to handle
    if (GameState.incorrectMovies.length === 0 && GameState.nextRoundMovies.length === 0) {
        showGameOver();
        return;
    }
    
    const choices = getChoicesForRound(GameState.currentRound);
    const points = getPointsForRound(GameState.currentRound);
    
    updateProgressCounter();
    
    // Choose a random movie from the wrong movies
    const currentIndex = Math.floor(Math.random() * GameState.incorrectMovies.length);
    const currentMovie = GameState.incorrectMovies[currentIndex];
    GameState.incorrectMovies.splice(currentIndex, 1);
    
    // Generate options for this round
    const options = [currentMovie];
    
    // Get unique movies for the options
    const otherMovies = movieDb.getRandomMovies(choices - 1)
        .filter(movie => movie.id !== currentMovie.id)
        .filter((movie, index, self) => 
            index === self.findIndex((m) => m.id === movie.id)
        );
    
    // If we don't have enough unique movies, try again
    if (otherMovies.length < choices - 1) {
        const remainingCount = choices - 1 - otherMovies.length;
        const moreMovies = movieDb.getRandomMovies(remainingCount * 2)
            .filter(movie => movie.id !== currentMovie.id)
            .filter(movie => !otherMovies.some(m => m.id === movie.id))
            .filter((movie, index, self) => 
                index === self.findIndex((m) => m.id === movie.id)
            )
            .slice(0, remainingCount);
        otherMovies.push(...moreMovies);
    }
    
    options.push(...otherMovies);
    
    // Shuffle the options
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
    }
    
    movieDb.setCurrentMovie(currentMovie);
    
    // Update UI
    const movieImage = document.querySelector('.movie-image img');
    const loadingDiv = document.querySelector('.loading');
    const optionsContainer = document.querySelector('.options-container');
    
    // Hide options while loading
    if (optionsContainer) {
        optionsContainer.style.display = 'none';
    }
    
    if (movieImage && loadingDiv && currentMovie) {
        const stillPath = movieDb.getRandomStillForMovie(currentMovie);
        if (stillPath) {
            try {
                // Wait for the image to load
                await new Promise((resolve, reject) => {
                    movieImage.onload = resolve;
                    movieImage.onerror = reject;
                    const fullPath = CONFIG.MOVIES_DIR + stillPath;
                    movieImage.src = fullPath;
                    movieImage.alt = `Scene from ${currentMovie.title}`;
                    // Update background
                    updateBackgroundImage(fullPath);
                });
                
                loadingDiv.style.display = 'none';
                movieImage.style.display = 'block';
                
                // Show options and start timer only after image loaded
                if (optionsContainer) {
                    optionsContainer.style.display = 'flex';
                    optionsContainer.style.flexDirection = 'column';
                    optionsContainer.style.gap = '10px';
                    updateButtons(options);
                    startTimer();
                }
            } catch (error) {
                console.error('Failed to load movie image:', error);
                loadingDiv.textContent = 'Failed to load movie image';
                updateBackgroundImage(null);
            }
        } else {
            loadingDiv.textContent = 'No movie still available';
            updateBackgroundImage(null);
        }
    }
}

function updateTimer() {
    const percentage = (GameState.remainingTime / GameState.TIMER_DURATION) * 100;
    const timerBar = document.querySelector('.timer-bar');
    if (timerBar) {
        timerBar.style.width = `${percentage}%`;
        
        if (GameState.currentRound >= 6) {
            // Gray timer in round 6 (no time bonus)
            timerBar.style.background = '#6c757d';
            timerBar.style.boxShadow = 'none';
        } else if (percentage > 60) {
            timerBar.style.background = 'linear-gradient(to right, var(--accent-color), #FF4B4B)';
            timerBar.style.boxShadow = '0 0 10px rgba(229, 9, 20, 0.5)';
        } else if (percentage > 30) {
            timerBar.style.background = 'linear-gradient(to right, #ffc107, #FF9800)';
            timerBar.style.boxShadow = '0 0 10px rgba(255, 193, 7, 0.5)';
        } else {
            timerBar.style.background = 'linear-gradient(to right, #dc3545, #FF4B4B)';
            timerBar.style.boxShadow = '0 0 10px rgba(220, 53, 69, 0.5)';
        }
    }
}
