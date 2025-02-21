// Initialize event handlers
function initializeEventHandlers() {
    const movieImage = document.querySelector('.movie-image img');
    movieImage.addEventListener('error', function() {
        this.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        const loadingDiv = document.querySelector('.loading');
        if (loadingDiv) {
            loadingDiv.textContent = 'Failed to load movie image';
        }
    });
}

async function fetchPopularMovies() {
    console.log('Fetching popular movies...');

    try {
        console.log('Making API request to:', `${CONFIG.TMDB_API_BASE_URL}/movie/popular`);
        const response = await fetch(
            `${CONFIG.TMDB_API_BASE_URL}/movie/popular?api_key=${CONFIG.TMDB_API_KEY}&language=en-US&page=1`
        );
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Received movies:', data.results.length);
        
        // Fetch detailed information for each movie
        for (const movie of data.results.slice(0, 20)) { // Get first 20 movies
            console.log('Fetching details for movie:', movie.title);
            const detailResponse = await fetch(
                `${CONFIG.TMDB_API_BASE_URL}/movie/${movie.id}?api_key=${CONFIG.TMDB_API_KEY}&language=en-US`
            );
            
            if (!detailResponse.ok) {
                throw new Error(`HTTP error! status: ${detailResponse.status}`);
            }
            
            const detailData = await detailResponse.json();
            movieDb.addMovie(detailData);
        }
        
        console.log('Total movies in database:', movieDb.movies.length);
        startNewRound();
    } catch (error) {
        console.error('Error fetching movies:', error);
        const loadingDiv = document.querySelector('.loading');
        if (loadingDiv) {
            loadingDiv.textContent = `Error loading movies: ${error.message}. Please refresh the page to try again.`;
            loadingDiv.style.color = '#dc3545';
        }
    }
}

function preloadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.addEventListener('load', () => resolve(url));
        img.addEventListener('error', () => reject(new Error('Failed to load image')));
        img.src = url;
    });
}

function setupButton(button, movie, isCorrect) {
    button.textContent = movie.title;
    button.dataset.movieId = movie.id;
    button.disabled = false;
    button.addEventListener('click', () => checkAnswer(movie.id), { once: true });
}

async function startNewRound() {
    console.log('Starting new round...');
    const movies = movieDb.getRandomMovies(6);
    
    if (!movies || movies.length < 6) {
        console.error('Not enough movies available');
        return;
    }

    console.log('Selected movies for round:', movies.map(m => m.title));
    const correctMovie = movies[0];
    movieDb.setCurrentMovie(correctMovie);
    console.log('Correct movie:', correctMovie.title);

    // Update the image
    const movieImage = document.querySelector('.movie-image img');
    const loadingDiv = document.querySelector('.loading');
    
    if (movieImage && loadingDiv && correctMovie) {
        const stillPath = movieDb.getRandomStillForMovie(correctMovie);
        if (stillPath) {
            const imageUrl = `${CONFIG.TMDB_IMAGE_BASE_URL}${stillPath}`;
            console.log('Setting image URL:', imageUrl);
            
            try {
                await preloadImage(imageUrl);
                movieImage.src = imageUrl;
                movieImage.alt = `Scene from ${correctMovie.title}`;
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

    // Shuffle the movies for buttons
    const shuffledMovies = movies.sort(() => 0.5 - Math.random());
    
    // Update the buttons
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach((button, index) => {
        setupButton(button, shuffledMovies[index]);
    });

    // Reset and start timer
    timeLeft = TIME_LIMIT;
    updateTimer();
    startTimer();
}

function checkAnswer(selectedMovieId) {
    if (!selectedMovieId) return;
    
    const correctMovie = movieDb.getCurrentMovie();
    if (!correctMovie) return;
    
    const isCorrect = selectedMovieId === correctMovie.id;
    
    // Clear the timer
    stopTimer();
    
    // Highlight the correct/incorrect answer
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(button => {
        const buttonId = parseInt(button.dataset.movieId);
        if (buttonId === correctMovie.id) {
            button.style.backgroundColor = '#28a745';
            button.style.color = 'white';
        } else if (buttonId === selectedMovieId && !isCorrect) {
            button.style.backgroundColor = '#dc3545';
            button.style.color = 'white';
        }
        button.disabled = true;
    });

    animateTransition(() => startNewRoundWithDelay(), 2000);
}

// Timer code
const TIME_LIMIT = 15;
let timeLeft = TIME_LIMIT;
let currentTimerInterval = null;

function updateTimer() {
    const percentage = (timeLeft / TIME_LIMIT) * 100;
    const timerBar = document.querySelector('.timer-bar');
    if (timerBar) {
        timerBar.style.width = `${percentage}%`;
        
        if (percentage > 60) {
            timerBar.style.backgroundColor = '#28a745';
        } else if (percentage > 30) {
            timerBar.style.backgroundColor = '#ffc107';
        } else {
            timerBar.style.backgroundColor = '#dc3545';
        }
    }
}

function stopTimer() {
    if (currentTimerInterval) {
        window.clearInterval(currentTimerInterval);
        currentTimerInterval = null;
    }
}

function startTimer() {
    stopTimer();
    timeLeft = TIME_LIMIT;
    updateTimer();

    function timerFunction() {
        timeLeft--;
        updateTimer();

        if (timeLeft <= 0) {
            stopTimer();
            checkAnswer(null);
        }
    }

    currentTimerInterval = window.setInterval(timerFunction, 1000);
}

// Animation frame for transitions
function animateTransition(callback, duration) {
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        
        if (elapsed < duration) {
            window.requestAnimationFrame(update);
        } else {
            callback();
        }
    }
    
    window.requestAnimationFrame(update);
}

function startNewRoundWithDelay() {
    stopTimer();
    
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(button => {
        button.style.backgroundColor = '';
        button.style.color = '';
        button.disabled = false;
        button.replaceWith(button.cloneNode(true));
    });
    
    animateTransition(() => startNewRound(), 2000);
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.game-section.active')) {
        fetchPopularMovies();
    }
});
