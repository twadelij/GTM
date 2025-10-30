// GTM Game Configuration
const CONFIG = {
    API_BASE_URL: 'http://localhost:8888/api/v1',
    GAME_TIMER: 30, // seconds per question
    MAX_MOVIES: 50,
    MIN_MOVIES: 1,
    
    // API Endpoints
    ENDPOINTS: {
        HEALTH: '/health',
        MOVIES_LIST: '/movies/list',
        MOVIES_RANDOM: '/movies/random',
        MOVIES_IMAGE: '/movies/image',
        GAME_START: '/game/start',
        GAME_ROUND: '/game/round',
        GAME_ANSWER: '/game/answer',
        GAME_SESSION: '/game/session'
    },
    
    // Game Settings
    DIFFICULTY_LEVELS: {
        EASY: { timer: 45, movies: 5 },
        MEDIUM: { timer: 30, movies: 10 },
        HARD: { timer: 20, movies: 20 }
    },
    
    // UI Messages
    MESSAGES: {
        LOADING: 'Loading...',
        ERROR_NETWORK: 'Network error. Please check your connection.',
        ERROR_API: 'API error. Please try again.',
        GAME_START_SUCCESS: 'Game started successfully!',
        GAME_COMPLETE: 'Game completed!',
        NO_MOVIES: 'No movies available.'
    }
};

// Utility Functions
const Utils = {
    // Format time in MM:SS format
    formatTime: (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },
    
    // Calculate percentage
    calculatePercentage: (correct, total) => {
        return total > 0 ? Math.round((correct / total) * 100) : 0;
    },
    
    // Shuffle array
    shuffleArray: (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },
    
    // Show loading spinner
    showLoading: (elementId) => {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add('active');
        }
    },
    
    // Hide loading spinner
    hideLoading: (elementId) => {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.remove('active');
        }
    },
    
    // Show error message
    showError: (message, elementId = null) => {
        if (elementId) {
            const element = document.getElementById(elementId);
            if (element) {
                element.textContent = `Error: ${message}`;
                element.style.color = '#e53e3e';
            }
        } else {
            alert(`Error: ${message}`);
        }
    },
    
    // Format API response for display
    formatApiResponse: (response) => {
        return JSON.stringify(response, null, 2);
    }
};

// Export for use in other scripts
window.CONFIG = CONFIG;
window.Utils = Utils;
