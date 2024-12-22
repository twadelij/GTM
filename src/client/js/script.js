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
        if (GameState.currentRound === 1) {
            remaining = GameState.totalMovies - (GameState.correctAnswers + GameState.incorrectMovies.length);
            const wrongCount = GameState.incorrectMovies.length;
            progressCounter.innerHTML = `
                <div class="progress-text">Ronde ${GameState.currentRound}: nog ${remaining} films te gaan</div>
                <div class="wrong-count ${wrongCount > 0 ? 'has-errors' : ''}">
                    ${wrongCount} fout${wrongCount !== 1 ? 'en' : ''}
                </div>
            `;
        } else {
            remaining = GameState.incorrectMovies.length;
            const nextRoundCount = GameState.nextRoundMovies.length;
            progressCounter.innerHTML = `
                <div class="progress-text">Ronde ${GameState.currentRound}: nog ${remaining} films te gaan</div>
                <div class="wrong-count ${nextRoundCount > 0 ? 'has-errors' : ''}">
                    ${nextRoundCount} fout${nextRoundCount !== 1 ? 'en' : ''} in deze ronde
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
        const points = getPointsForRound(GameState.currentRound);
        const timeBonus = getTimeBonus();
        GameState.currentScore += points + timeBonus;
        GameState.correctAnswers++;
        GameState.playedMovies.add(currentMovie.id);
        
        updateScoreDisplay();
        updateProgressCounter();
        
        await showSplashScreen('Correct!', [
            `+${points} punten (Ronde ${GameState.currentRound})`,
            `+${timeBonus} punten tijdsbonus`,
            `Totale score: ${GameState.currentScore}`
        ], timeBonus > 0 ? `Bonus: +${timeBonus}` : '');

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
    const choices = getChoicesForRound(GameState.currentRound);
    // Haal unieke films op voor de eerste ronde
    const movies = movieDb.getRandomMovies(choices).filter((movie, index, self) => 
        index === self.findIndex((m) => m.id === movie.id)
    );
    
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
    const optionsContainer = document.querySelector('.options-container');
    
    updateProgressCounter();
    
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
                    movieImage.src = stillPath;
                    movieImage.alt = `Scene from ${currentMovie.title}`;
                });
                
                loadingDiv.style.display = 'none';
                movieImage.style.display = 'block';
                
                // Toon opties en start timer alleen na laden van afbeelding
                if (optionsContainer) {
                    optionsContainer.style.display = 'flex';
                    optionsContainer.style.flexDirection = 'column';
                    optionsContainer.style.gap = '10px';
                    updateButtons(movies);
                    startTimer();
                }
            } catch (error) {
                console.error('Failed to load movie image:', error);
                loadingDiv.textContent = 'Failed to load movie image';
            }
        } else {
            loadingDiv.textContent = 'No movie still available';
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
                    movieImage.src = stillPath;
                    movieImage.alt = `Scene from ${currentMovie.title}`;
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
            }
        } else {
            loadingDiv.textContent = 'No movie still available';
        }
    }
}
