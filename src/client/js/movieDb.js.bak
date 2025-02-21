console.log('movieDb.js loaded');

// MovieDatabase class definitie
const MovieDatabase = (function() {
    console.log('Creating MovieDatabase instance');
    let instance = null;
    
    class MovieDatabaseClass {
        constructor() {
            console.log('MovieDatabaseClass constructor called');
            if (instance) {
                return instance;
            }
            this.movies = [];
            this.currentMovie = null;
            this.recentlyUsedMovies = new Set();
            this.initialized = false;
            instance = this;
        }

        async initialize() {
            console.log('MovieDatabase.initialize() called');
            if (this.initialized) {
                console.log('MovieDatabase already initialized');
                return true;
            }

            console.log('Initializing MovieDatabase...');
            try {
                // Haal films op van de server
                console.log('Fetching movies from:', CONFIG.MOVIES_JSON);
                const response = await fetch(CONFIG.MOVIES_JSON);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log('Received movies data:', data);
                
                // Verwerk de films uit de results array
                if (!data.results || !Array.isArray(data.results)) {
                    throw new Error('Invalid movies data format: missing results array');
                }

                // Verwijder dubbele films op basis van ID en titel
                const uniqueMovies = new Map();
                data.results.forEach(movie => {
                    const key = `${movie.id}-${movie.title}`;
                    if (!uniqueMovies.has(key)) {
                        uniqueMovies.set(key, movie);
                    }
                });

                // Converteer naar array en shuffle
                const movieArray = Array.from(uniqueMovies.values());
                for (let i = movieArray.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [movieArray[i], movieArray[j]] = [movieArray[j], movieArray[i]];
                }

                // Selecteer de eerste 20 films
                const selected = movieArray.slice(0, 20);
                console.log('Selected movies:', selected.map(m => m.title));

                // Verwerk de geselecteerde films
                this.movies = selected.map(movie => ({
                    id: movie.id,
                    title: movie.title,
                    stills: [movie.backdrop_path.replace('data/movies/', '')], // Remove the data/movies/ prefix
                    releaseYear: movie.year,
                    genres: movie.genres || []
                }));
                
                console.log(`Loaded ${this.movies.length} unique movies`);
                this.initialized = true;
                return true;
            } catch (error) {
                console.error('Error initializing MovieDatabase:', error);
                throw error;
            }
        }

        getRandomMovies(count) {
            if (!this.initialized) {
                console.error('MovieDatabase not initialized');
                return [];
            }

            // Filter out recently used movies
            const availableMovies = this.movies.filter(movie => !this.recentlyUsedMovies.has(movie.id));
            
            if (availableMovies.length < count) {
                // If we don't have enough movies, clear the recently used set
                this.recentlyUsedMovies.clear();
                return this.movies
                    .sort(() => 0.5 - Math.random())
                    .slice(0, count);
            }

            const selectedMovies = availableMovies
                .sort(() => 0.5 - Math.random())
                .slice(0, count);

            // Add selected movies to recently used set
            selectedMovies.forEach(movie => {
                this.recentlyUsedMovies.add(movie.id);
                // Keep the recently used set at a reasonable size
                if (this.recentlyUsedMovies.size > 20) {
                    const [firstId] = this.recentlyUsedMovies;
                    this.recentlyUsedMovies.delete(firstId);
                }
            });

            return selectedMovies;
        }

        getRandomStillForMovie(movie) {
            if (!this.initialized) {
                console.error('MovieDatabase not initialized');
                return null;
            }

            if (!movie || !movie.stills || movie.stills.length === 0) return null;
            const randomIndex = Math.floor(Math.random() * movie.stills.length);
            return movie.stills[randomIndex];
        }

        setCurrentMovie(movie) {
            this.currentMovie = movie;
        }

        getCurrentMovie() {
            return this.currentMovie;
        }

        getRemainingCount() {
            return this.movies.length - this.recentlyUsedMovies.size;
        }

        getTotalSessionMovies() {
            return this.movies.length;
        }
    }

    return new MovieDatabaseClass();
})();

// Exporteer de singleton instantie
console.log('Exporting MovieDatabase instance');
window.movieDb = MovieDatabase;
