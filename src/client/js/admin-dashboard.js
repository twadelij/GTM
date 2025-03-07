// Admin Dashboard functionality
console.log('Admin dashboard script loaded');

document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in as admin
    checkAdminAuth();
    
    // Add event listeners for dashboard buttons
    setupDashboardButtons();
    
    // Setup logout functionality
    setupLogout();
});

// Check admin authentication
async function checkAdminAuth() {
    try {
        const response = await fetch(getApiUrl('api/auth/admin/login'), {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            // Redirect to login if not authenticated
            window.location.href = '/';
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = '/';
    }
}

// Setup dashboard button functionality
function setupDashboardButtons() {
    // User Management
    document.getElementById('manage-users').addEventListener('click', async () => {
        try {
            const response = await fetch(getApiUrl('api/users'), {
                credentials: 'include'
            });
            
            if (response.ok) {
                const users = await response.json();
                displayUsers(users);
            } else {
                alert('Failed to fetch users');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            alert('Error loading users');
        }
    });

    // Movie Management
    document.getElementById('manage-movies').addEventListener('click', async () => {
        try {
            const response = await fetch(getApiUrl('api/movies'), {
                credentials: 'include'
            });
            
            if (response.ok) {
                const movies = await response.json();
                displayMovies(movies);
            } else {
                alert('Failed to fetch movies');
            }
        } catch (error) {
            console.error('Error fetching movies:', error);
            alert('Error loading movies');
        }
    });

    // Statistics
    document.getElementById('view-statistics').addEventListener('click', async () => {
        try {
            const response = await fetch(getApiUrl('api/statistics'), {
                credentials: 'include'
            });
            
            if (response.ok) {
                const stats = await response.json();
                displayStatistics(stats);
            } else {
                alert('Failed to fetch statistics');
            }
        } catch (error) {
            console.error('Error fetching statistics:', error);
            alert('Error loading statistics');
        }
    });

    // System Settings
    document.getElementById('system-settings').addEventListener('click', async () => {
        alert('System settings functionality coming soon!');
    });
}

// Setup logout functionality
function setupLogout() {
    document.getElementById('logout-button').addEventListener('click', async () => {
        try {
            const response = await fetch(getApiUrl('api/auth/logout'), {
                method: 'POST',
                credentials: 'include'
            });
            
            if (response.ok) {
                // Clear local storage
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('isAdmin');
                
                // Redirect to home
                window.location.href = '/';
            } else {
                alert('Logout failed');
            }
        } catch (error) {
            console.error('Error during logout:', error);
            alert('Error during logout');
        }
    });
}

// Display functions for different sections
function displayUsers(users) {
    const content = document.querySelector('.dashboard-content');
    content.innerHTML = `
        <h3>User Management</h3>
        <table class="user-table">
            <thead>
                <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Admin</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${users.map(user => `
                    <tr>
                        <td>${user.username}</td>
                        <td>${user.email}</td>
                        <td>${user.is_admin ? 'Yes' : 'No'}</td>
                        <td>
                            <button onclick="editUser(${user.id})">Edit</button>
                            <button onclick="deleteUser(${user.id})">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <button onclick="showAddUserForm()">Add New User</button>
    `;
}

function displayMovies(movies) {
    const content = document.querySelector('.dashboard-content');
    content.innerHTML = `
        <h3>Movie Management</h3>
        <div class="movie-grid">
            ${movies.map(movie => `
                <div class="movie-card">
                    <img src="${movie.image_url}" alt="${movie.title}">
                    <h4>${movie.title}</h4>
                    <p>${movie.release_year}</p>
                    <button onclick="editMovie(${movie.id})">Edit</button>
                    <button onclick="deleteMovie(${movie.id})">Delete</button>
                </div>
            `).join('')}
        </div>
        <button onclick="showAddMovieForm()">Add New Movie</button>
    `;
}

function displayStatistics(stats) {
    const content = document.querySelector('.dashboard-content');
    content.innerHTML = `
        <h3>Game Statistics</h3>
        <div class="stats-grid">
            <div class="stat-card">
                <h4>Total Games</h4>
                <p>${stats.total_games}</p>
            </div>
            <div class="stat-card">
                <h4>Active Users</h4>
                <p>${stats.active_users}</p>
            </div>
            <div class="stat-card">
                <h4>Average Score</h4>
                <p>${stats.average_score}</p>
            </div>
            <div class="stat-card">
                <h4>Total Movies</h4>
                <p>${stats.total_movies}</p>
            </div>
        </div>
    `;
}

// User management functions
async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) {
        return;
    }

    try {
        const response = await fetch(getApiUrl(`api/users/${userId}`), {
            method: 'DELETE',
            credentials: 'include'
        });

        if (response.ok) {
            // Refresh user list
            const usersResponse = await fetch(getApiUrl('api/users'), {
                credentials: 'include'
            });
            const users = await usersResponse.json();
            displayUsers(users);
        } else {
            alert('Failed to delete user');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user');
    }
}
