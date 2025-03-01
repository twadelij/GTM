console.log('config.js loaded');

window.CONFIG = {
    MOVIES_JSON: '/data/movies.json',
    MOVIES_DIR: '/data/movies/'
};

// Server configuration
const SERVER_CONFIG = {
    baseUrl: 'http://localhost:5000', // Base URL for API requests
    timeout: 10000, // Default timeout in milliseconds
    useAbsoluteUrls: true // Whether to use absolute URLs
};

// Function to get API URL
function getApiUrl(endpoint) {
    // Remove leading slash if present
    if (endpoint.startsWith('/')) {
        endpoint = endpoint.substring(1);
    }
    
    if (SERVER_CONFIG.useAbsoluteUrls) {
        return `${SERVER_CONFIG.baseUrl}/${endpoint}`;
    } else {
        return `/${endpoint}`;
    }
}
