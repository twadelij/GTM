class MovieDatabase {
    constructor() {
        this.movies = [];
        this.currentMovie = null;
        this.recentlyUsedMovies = new Set(); // Keep track of recently used movies
    }

    async addMovie(movie) {
        // Fetch movie images (stills)
        try {
            const response = await fetch(
                `${CONFIG.TMDB_API_BASE_URL}/movie/${movie.id}/images?api_key=${CONFIG.TMDB_API_KEY}`
            );
            const imageData = await response.json();
            
            // Get stills (backdrops) if available
            const stills = imageData.backdrops || [];
            if (stills.length > 0) {
                this.movies.push({
                    id: movie.id,
                    title: movie.title,
                    stills: stills.map(still => still.file_path),
                    releaseYear: new Date(movie.release_date).getFullYear(),
                    genres: movie.genres.map(g => g.name),
                    voteCount: movie.vote_count,
                    voteAverage: movie.vote_average,
                    overview: movie.overview
                });
            }
        } catch (error) {
            console.error('Error fetching movie images:', error);
        }
    }

    getRandomMovies(count) {
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
}

const movieDb = new MovieDatabase();
