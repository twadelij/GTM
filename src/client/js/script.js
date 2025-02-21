console.log('script.js loaded');

// Game state variabelen
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
    TIMER_DURATION: 15000, // 15 seconden per vraag
    SPLASH_DURATION: 4000, // 4 seconden splash screen
    
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
            progressCounter.textContent = `Ronde ${this.currentRound}: nog ${this.totalMovies} films te gaan`;
        }
        if (scoreDisplay) {
            scoreDisplay.textContent = 'Score: 0';
        }
    }
};

// Basis functies
function getChoicesForRound(round) {
    // Vast aantal keuzes per ronde:
    // Ronde 1: 6 keuzes
    // Ronde 2: 5 keuzes voor ALLE foute films uit ronde 1
    // Ronde 3: 4 keuzes voor ALLE foute films uit ronde 2
    // Ronde 4: 3 keuzes voor ALLE foute films uit ronde 3
    // Ronde 5: 2 keuzes voor ALLE foute films uit ronde 4
    // Ronde 6: 1 keuze voor ALLE foute films uit ronde 5
    return Math.max(1, 7 - round); // Start met 6 keuzes, verminder met 1 per ronde
}

function getPointsForRound(round) {
    // Ronde 6 geeft geen punten
    if (round >= 6) return 0;
    // Anders normale puntentelling
    return Math.max(0, 6 - round); // 5, 4, 3, 2, 1, 0 punten voor rondes 1-6
}

function getTimeBonus() {
    // Geen tijdbonus in ronde 6
    if (GameState.currentRound >= 6) return 0;
    // Anders normale tijdbonus
    return Math.floor(GameState.remainingTime / 1000); // 1 punt per seconde over
}

// Initialisatie
async function initializeGame() {
    console.log('Initializing game...');
    const loadingDiv = document.querySelector('.loading');
    
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
        if (loadingDiv) {
            loadingDiv.textContent = 'Failed to load game: ' + error.message + '. Please refresh the page.';
            loadingDiv.style.color = 'red';
        }
    }
}

// Test mode functies
async function runGameTest(forcedWrongAnswers = 5) {
    console.log('Starting game test...');
    console.log(`Forcing ${forcedWrongAnswers} wrong answers in round 1`);
    
    // Reset game state
    GameState.reset();
    await window.movieDb.initialize();
    
    // Override timer voor sneller testen
    const originalTimerDuration = GameState.TIMER_DURATION;
    const originalSplashDuration = GameState.SPLASH_DURATION;
    GameState.TIMER_DURATION = 100;
    GameState.SPLASH_DURATION = 100;
    
    let wrongCount = 0;
    let totalProcessed = 0;
    
    // Override de normale game loop voor testing
    const originalHandleGuess = handleGuess;
    handleGuess = async (guessedMovie) => {
        const currentMovie = movieDb.getCurrentMovie();
        console.log(`Round ${GameState.currentRound}: Processing movie ${totalProcessed + 1}`);
        
        // In ronde 1, forceer een aantal foute antwoorden
        if (GameState.currentRound === 1 && wrongCount < forcedWrongAnswers) {
            // Kies bewust het verkeerde antwoord
            const wrongMovie = guessedMovie.id === currentMovie.id ? 
                { id: currentMovie.id + 1, title: 'Wrong Answer' } : 
                guessedMovie;
            wrongCount++;
            console.log(`Forcing wrong answer ${wrongCount}/${forcedWrongAnswers}`);
            await originalHandleGuess(wrongMovie);
        } else {
            // Geef het juiste antwoord
            await originalHandleGuess(currentMovie);
        }
        
        totalProcessed++;
        
        // Log de game state
        console.log('Game State:', {
            round: GameState.currentRound,
            correctAnswers: GameState.correctAnswers,
            incorrectMovies: GameState.incorrectMovies.length,
            nextRoundMovies: GameState.nextRoundMovies.length,
            totalProcessed
        });
    };
    
    // Override updateButtons om automatisch te klikken
    const originalUpdateButtons = updateButtons;
    updateButtons = (movies) => {
        originalUpdateButtons(movies);
        // Wacht kort en klik dan automatisch
        setTimeout(() => {
            const currentMovie = movieDb.getCurrentMovie();
            // In ronde 1, kies soms bewust het verkeerde antwoord
            if (GameState.currentRound === 1 && wrongCount < forcedWrongAnswers) {
                // Kies een willekeurige knop die NIET het juiste antwoord is
                const buttons = Array.from(document.querySelectorAll('.option-btn'));
                const wrongButtons = buttons.filter(btn => 
                    btn.textContent !== currentMovie.title
                );
                if (wrongButtons.length > 0) {
                    const randomWrong = wrongButtons[Math.floor(Math.random() * wrongButtons.length)];
                    randomWrong.click();
                }
            } else {
                // Kies het juiste antwoord
                const correctButton = Array.from(document.querySelectorAll('.option-btn'))
                    .find(btn => btn.textContent === currentMovie.title);
                if (correctButton) {
                    correctButton.click();
                }
            }
        }, 100);
    };
    
    try {
        // Start het spel
        await startNewRound();
        
        // Wacht tot het spel klaar is
        while (totalProcessed < GameState.totalMovies || 
               GameState.incorrectMovies.length > 0 || 
               GameState.nextRoundMovies.length > 0) {
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        // Herstel de originele functies en waarden
        handleGuess = originalHandleGuess;
        updateButtons = originalUpdateButtons;
        GameState.TIMER_DURATION = originalTimerDuration;
        GameState.SPLASH_DURATION = originalSplashDuration;
        
        console.log('Test completed!');
        console.log('Final Game State:', {
            round: GameState.currentRound,
            correctAnswers: GameState.correctAnswers,
            incorrectMovies: GameState.incorrectMovies.length,
            nextRoundMovies: GameState.nextRoundMovies.length,
            totalProcessed
        });
    } catch (error) {
        console.error('Test failed:', error);
        // Herstel de originele functies en waarden
        handleGuess = originalHandleGuess;
        updateButtons = originalUpdateButtons;
        GameState.TIMER_DURATION = originalTimerDuration;
        GameState.SPLASH_DURATION = originalSplashDuration;
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
                <div class="progress-text">Ronde ${GameState.currentRound}: nog ${remaining} films te gaan</div>
                <div class="wrong-count ${totalWrong > 0 ? 'has-errors' : ''}">
                    ${totalWrong} fout${totalWrong !== 1 ? 'en' : ''} totaal
                </div>
            `;
        } else {
            remaining = GameState.incorrectMovies.length;
            const roundWrong = GameState.nextRoundMovies.length;
            progressCounter.innerHTML = `
                <div class="progress-text">Ronde ${GameState.currentRound}: nog ${remaining} films te gaan</div>
                <div class="wrong-count ${totalWrong > 0 ? 'has-errors' : ''}">
                    ${roundWrong} fout${roundWrong !== 1 ? 'en' : ''} deze ronde (${totalWrong} totaal)
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
    // We gebruiken nu een vaste achtergrond, dus deze functie doet niets
    return;
}

function showGameOver() {
    updateBackgroundImage(null); // Remove background when game is over
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
    
    if (GameState.currentRound === 1) {
        GameState.incorrectMovies.push(currentMovie);
    } else {
        GameState.nextRoundMovies.push(currentMovie);
    }
    GameState.playedMovies.add(currentMovie.id);
    
    updateProgressCounter();
    
    await showSplashScreen('Tijd Op!', [
        'Je was te langzaam!',
        'Volgende keer wat sneller...',
        `Score blijft: ${GameState.currentScore}`
    ]);
    
    if (GameState.currentRound === 1) {
        if (GameState.correctAnswers + GameState.incorrectMovies.length >= GameState.totalMovies) {
            // Ronde 1 is klaar, ga naar ronde 2 met alle foute films
            GameState.nextRoundMovies = [...GameState.incorrectMovies];
            GameState.incorrectMovies = [];
            GameState.currentRound++;
            await startNextRound();
        } else {
            await startNewRound();
        }
    } else if (GameState.incorrectMovies.length > 0) {
        // Er zijn nog films te raden in deze ronde
        await startNextRound();
    } else {
        // Start nieuwe ronde met de verzamelde foute films
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
                `+${points} punten (Ronde ${GameState.currentRound})`,
                `+${timeBonus} punten tijdsbonus`,
                `Totale score: ${GameState.currentScore}`
            ], timeBonus > 0 ? `Bonus: +${timeBonus}` : '');
        } else {
            // Geen punten en geen tijdbonus in ronde 6
            await showSplashScreen('Correct!', [
                'Laatste kans goed benut!',
                `Totale score blijft: ${GameState.currentScore}`
            ]);
        }
        
        GameState.correctAnswers++;
        GameState.playedMovies.add(currentMovie.id);
        
        updateScoreDisplay();
        updateProgressCounter();

        if (GameState.currentRound === 1) {
            if (GameState.correctAnswers + GameState.incorrectMovies.length >= GameState.totalMovies) {
                // Ronde 1 is klaar, ga naar ronde 2 met alle foute films
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
            // In andere rondes
            if (GameState.incorrectMovies.length === 0) {
                // Alle films uit deze ronde zijn behandeld
                if (GameState.nextRoundMovies.length === 0) {
                    // Geen foute films meer, spel is klaar
                    showGameOver();
                } else {
                    // Start nieuwe ronde met de verzamelde foute films
                    GameState.incorrectMovies = [...GameState.nextRoundMovies];
                    GameState.nextRoundMovies = [];
                    GameState.currentRound++;
                    await startNextRound();
                }
            } else {
                // Er zijn nog films te raden in deze ronde
                await startNextRound();
            }
        }
    } else {
        // Fout antwoord
        if (GameState.currentRound === 1) {
            GameState.incorrectMovies.push(currentMovie);
        } else {
            GameState.nextRoundMovies.push(currentMovie);
        }
        GameState.playedMovies.add(currentMovie.id);
        
        updateProgressCounter();
        
        await showSplashScreen('Incorrect!', [
            'Probeer het opnieuw in de volgende ronde',
            `Score blijft: ${GameState.currentScore}`
        ]);

        if (GameState.currentRound === 1) {
            if (GameState.correctAnswers + GameState.incorrectMovies.length >= GameState.totalMovies) {
                // Ronde 1 is klaar, ga naar ronde 2 met alle foute films
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
            // Er zijn nog films te raden in deze ronde
            await startNextRound();
        } else {
            // Start nieuwe ronde met de verzamelde foute films
            GameState.incorrectMovies = [...GameState.nextRoundMovies];
            GameState.nextRoundMovies = [];
            GameState.currentRound++;
            await startNextRound();
        }
    }
}

async function startNewRound() {
    console.log('Starting new round...');
    const movies = movieDb.getRandomMovies(6);
    
    if (!movies || movies.length < 6) {
        console.error('Not enough movies available');
        const loadingDiv = document.querySelector('.loading');
        if (loadingDiv) {
            loadingDiv.textContent = 'Error: Not enough movies available. Please refresh the page.';
            loadingDiv.style.color = 'red';
        }
        return;
    }

    const correctMovie = movies[0];
    movieDb.setCurrentMovie(correctMovie);
    
    // Update UI
    const movieImage = document.querySelector('.movie-image img');
    const loadingDiv = document.querySelector('.loading');
    const optionsContainer = document.querySelector('.options-container');
    
    updateProgressCounter();
    
    // Hide options while loading
    if (optionsContainer) {
        optionsContainer.style.display = 'none';
    }
    
    if (movieImage && loadingDiv && correctMovie) {
        const stillPath = movieDb.getRandomStillForMovie(correctMovie);
        if (stillPath) {
            try {
                const fullPath = CONFIG.MOVIES_DIR + stillPath;
                console.log('Loading image:', fullPath);
                
                // Gebruik ImageManager voor laden en caching
                await window.imageManager.loadImage(fullPath);
                movieImage.src = fullPath;
                movieImage.alt = `Scene from ${correctMovie.title}`;
                
                // Preload afbeeldingen voor volgende ronde
                const nextMovies = movieDb.getRandomMovies(6);
                if (nextMovies && nextMovies.length > 0) {
                    const nextStills = nextMovies
                        .map(movie => movieDb.getRandomStillForMovie(movie))
                        .filter(Boolean)
                        .map(still => CONFIG.MOVIES_DIR + still);
                    window.imageManager.preloadImages(nextStills);
                }
                
                // Update UI
                loadingDiv.style.display = 'none';
                movieImage.style.display = 'block';
                
                // Update background en toon opties
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
                // Probeer opnieuw met een andere afbeelding
                const newStillPath = movieDb.getRandomStillForMovie(correctMovie, true);
                if (newStillPath) {
                    const newFullPath = CONFIG.MOVIES_DIR + newStillPath;
                    try {
                        await window.imageManager.loadImage(newFullPath);
                        movieImage.src = newFullPath;
                        movieImage.alt = `Scene from ${correctMovie.title}`;
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
    
    // Als er geen foute films zijn om te behandelen
    if (GameState.incorrectMovies.length === 0 && GameState.nextRoundMovies.length === 0) {
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
    
    // Haal unieke films op voor de opties
    const otherMovies = movieDb.getRandomMovies(choices - 1)
        .filter(movie => movie.id !== currentMovie.id)
        .filter((movie, index, self) => 
            index === self.findIndex((m) => m.id === movie.id)
        );
    
    // Als we niet genoeg unieke films hebben, probeer het nog een keer
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
    
    // Shuffle de opties
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
    }
    
    movieDb.setCurrentMovie(currentMovie);
    
    // Update UI
    const movieImage = document.querySelector('.movie-image img');
    const loadingDiv = document.querySelector('.loading');
    const optionsContainer = document.querySelector('.options-container');
    
    // Verberg opties tijdens het laden
    if (optionsContainer) {
        optionsContainer.style.display = 'none';
    }
    
    if (movieImage && loadingDiv && currentMovie) {
        const stillPath = movieDb.getRandomStillForMovie(currentMovie);
        if (stillPath) {
            try {
                // Wacht tot de afbeelding is geladen
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
                
                // Toon opties en start timer alleen na laden van afbeelding
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
            // Grijze timer in ronde 6 (geen tijdbonus)
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
