let selectedMovie = null;

async function searchMovies(query) {
    if (!query) {
        document.getElementById('search-results').classList.remove('active');
        return;
    }
    
    try {
        const response = await fetch(
            `${CONFIG.TMDB_API_BASE_URL}/search/movie?api_key=${CONFIG.TMDB_API_KEY}&query=${encodeURIComponent(query)}`
        );
        const data = await response.json();
        
        const resultsDiv = document.getElementById('search-results');
        resultsDiv.innerHTML = '';
        
        data.results.slice(0, 5).forEach(movie => {
            const div = document.createElement('div');
            div.className = 'search-result-item';
            div.textContent = `${movie.title} (${new Date(movie.release_date).getFullYear()})`;
            div.addEventListener('click', () => selectMovie(movie));
            resultsDiv.appendChild(div);
        });
        
        resultsDiv.classList.add('active');
    } catch (error) {
        console.error('Movie search error:', error);
    }
}

function selectMovie(movie) {
    selectedMovie = movie;
    document.getElementById('search-results').classList.remove('active');
    document.getElementById('movie-search').value = movie.title;
    document.getElementById('selected-movie').textContent = 
        `Selected: ${movie.title} (${new Date(movie.release_date).getFullYear()})`;
    document.getElementById('upload-submit').disabled = false;
}

async function handleImageUpload(event) {
    event.preventDefault();
    
    const fileInput = document.getElementById('image-upload');
    const file = fileInput.files[0];
    
    if (!file || !selectedMovie) {
        alert('Please select both a movie and an image');
        return;
    }
    
    // Read file as base64
    const reader = new FileReader();
    reader.onload = async () => {
        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image: reader.result,
                    movieId: selectedMovie.id,
                    username: currentUser.username
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert('Image uploaded successfully!');
                // Reset form
                fileInput.value = '';
                document.getElementById('movie-search').value = '';
                document.getElementById('selected-movie').textContent = '';
                document.getElementById('upload-submit').disabled = true;
                selectedMovie = null;
            } else {
                alert(data.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload failed. Please try again.');
        }
    };
    reader.readAsDataURL(file);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('movie-search');
    let searchTimeout;
    
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchMovies(searchInput.value);
        }, 300);
    });
    
    document.getElementById('upload-submit').addEventListener('click', handleImageUpload);
});
