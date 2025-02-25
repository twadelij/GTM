console.log('movieDb.js loaded');

// MovieDatabase class definition
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
            this.sessionPool = [];  // Pool for current session
            this.currentMovie = null;
            this.recentlyUsedMovies = new Set();
            this.initialized = false;
            this.initializationError = null;
            instance = this;
        }

        async initialize() {
            console.log('MovieDatabase.initialize() called');
            if (this.initialized) {
                console.log('MovieDatabase already initialized');
                return true;
            }

            if (!window.CONFIG) {
                this.initializationError = new Error('CONFIG is not loaded');
                console.error('CONFIG is not loaded');
                throw this.initializationError;
            }

            if (!window.CONFIG.MOVIES_JSON) {
                this.initializationError = new Error('MOVIES_JSON path is not configured');
                console.error('MOVIES_JSON path is not configured');
                throw this.initializationError;
            }

            console.log('Initializing MovieDatabase...');
            console.log('Fetching movies from:', window.CONFIG.MOVIES_JSON);
            
            try {
                const response = await fetch(window.CONFIG.MOVIES_JSON);
                if (!response.ok) {
                    this.initializationError = new Error(`HTTP error! status: ${response.status}`);
                    throw this.initializationError;
                }
                
                const data = await response.json();
                console.log('Received movies data:', data);
                
                if (!data.results || !Array.isArray(data.results)) {
                    this.initializationError = new Error('Invalid movies data format: missing results array');
                    throw this.initializationError;
                }

                if (data.results.length === 0) {
                    this.initializationError = new Error('No movies found in data');
                    throw this.initializationError;
                }

                // Remove duplicate movies
                const uniqueMovies = new Map();
                data.results.forEach(movie => {
                    if (!movie.id || !movie.title) {
                        console.warn('Invalid movie data:', movie);
                        return;
                    }
                    const key = `${movie.id}-${movie.title}`;
                    if (!uniqueMovies.has(key)) {
                        uniqueMovies.set(key, movie);
                    }
                });

                if (uniqueMovies.size === 0) {
                    this.initializationError = new Error('No valid movies found after filtering');
                    throw this.initializationError;
                }

                // Convert to array
                this.movies = Array.from(uniqueMovies.values()).map(movie => ({
                    id: movie.id,
                    title: movie.title,
                    stills: movie.backdrop_path ? [movie.backdrop_path.replace('data/movies/', '')] : [],
                    releaseYear: movie.year,
                    genres: movie.genres || []
                }));

                // Create a new session pool of 20 random movies
                this.createSessionPool();
                
                console.log(`Loaded ${this.movies.length} unique movies`);
                console.log(`Created session pool with ${this.sessionPool.length} movies`);
                this.initialized = true;
                return true;
            } catch (error) {
                this.initializationError = error;
                console.error('Error initializing MovieDatabase:', error);
                throw error;
            }
        }

        createSessionPool() {
            // Debug: Log all movies before shuffle
            console.log('All available movies before shuffle:', 
                this.movies.map(m => `${m.id}: ${m.title}`).join('\n'));

            // Check for duplicate movies
            const duplicates = this.movies.filter((movie, index, self) =>
                index !== self.findIndex((m) => m.id === movie.id || m.title === movie.title)
            );
            if (duplicates.length > 0) {
                console.warn('Found duplicate movies:', 
                    duplicates.map(m => `${m.id}: ${m.title}`).join('\n'));
            }

            // Shuffle all available movies
            const shuffled = [...this.movies].sort(() => 0.5 - Math.random());
            // Take the first 20 for this session
            this.sessionPool = shuffled.slice(0, 20);
            this.recentlyUsedMovies.clear();

            // Debug: Log the session pool
            console.log('Session pool movies:', 
                this.sessionPool.map(m => `${m.id}: ${m.title}`).join('\n'));
        }

        getRandomMovies(count) {
            if (!this.initialized) {
                console.error('MovieDatabase not initialized');
                return [];
            }

            console.log('Getting random movies, count:', count);
            console.log('Session pool size:', this.sessionPool.length);
            console.log('Recently used movies:', this.recentlyUsedMovies.size);
            console.log('Recently used movie IDs:', Array.from(this.recentlyUsedMovies));

            // Filter movies that have already been used from the session pool
            let availableInPool = this.sessionPool.filter(
                movie => !this.recentlyUsedMovies.has(movie.id)
            );
            console.log('Available in pool:', availableInPool.length);
            console.log('Available movies:', 
                availableInPool.map(m => `${m.id}: ${m.title}`).join('\n'));

            // If we don't have enough movies, reset the used movies
            if (availableInPool.length < count) {
                console.log('Resetting recently used movies within session pool');
                this.recentlyUsedMovies.clear();
                availableInPool = [...this.sessionPool];
            }

            // Shuffle the available movies
            for (let i = availableInPool.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [availableInPool[i], availableInPool[j]] = [availableInPool[j], availableInPool[i]];
            }

            // Select the requested number of movies
            const selectedMovies = availableInPool.slice(0, count);

            // Debug: Log the selection
            console.log('Selected movies for this round:', 
                selectedMovies.map(m => `${m.id}: ${m.title}`).join('\n'));

            // Mark the selected movies as used
            selectedMovies.forEach(movie => {
                this.recentlyUsedMovies.add(movie.id);
                console.log('Marking as used:', `${movie.id}: ${movie.title}`);
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

// Export the singleton instance
console.log('Exporting MovieDatabase instance');
window.movieDb = MovieDatabase;
