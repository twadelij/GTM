let currentUser = null;

// Check admin status and display admin link if appropriate
async function checkAdminStatus() {
    try {
        const response = await fetch('/api/auth/current-user');
        if (response.ok) {
            const userData = await response.json();
            currentUser = userData;
            
            // Update UI based on login status
            document.getElementById('login-button').style.display = currentUser ? 'none' : 'inline-block';
            document.getElementById('logout-button').style.display = currentUser ? 'inline-block' : 'none';
            
            // Show admin link if admin
            if (currentUser && currentUser.is_admin) {
                document.querySelector('.admin-link').style.display = 'inline-block';
            } else {
                document.querySelector('.admin-link').style.display = 'none';
            }
        } else {
            // Not logged in
            document.querySelector('.admin-link').style.display = 'none';
            document.getElementById('login-button').style.display = 'inline-block';
            document.getElementById('logout-button').style.display = 'none';
        }
    } catch (error) {
        console.error('Error checking admin status:', error);
    }
}

// Handle login
async function loginUser(username, password) {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const data = await response.json();
            currentUser = data;
            
            // Update UI based on login
            document.getElementById('login-button').style.display = 'none';
            document.getElementById('logout-button').style.display = 'inline-block';
            
            if (currentUser.is_admin) {
                document.querySelector('.admin-link').style.display = 'inline-block';
                window.location.href = '/admin';
            } else {
                // Voor normale gebruikers, toon de game info section
                if (typeof checkLoginStatus === 'function') {
                    checkLoginStatus();
                } else {
                    // Fallback als de splash functie niet beschikbaar is
                    showSection('game-info-section');
                }
            }
            
            // Clear form
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
            document.getElementById('login-error').style.display = 'none';
            
            return true;
        } else {
            // Failed login
            document.getElementById('login-error').style.display = 'block';
            return false;
        }
    } catch (error) {
        console.error('Login error:', error);
        document.getElementById('login-error').style.display = 'block';
        return false;
    }
}

// Handle logout
async function logoutUser() {
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST'
        });

        if (response.ok) {
            currentUser = null;
            
            // Update UI for logout
            document.getElementById('login-button').style.display = 'inline-block';
            document.getElementById('logout-button').style.display = 'none';
            document.querySelector('.admin-link').style.display = 'none';
            
            // Redirect to home/login
            showSection('login-section');
        }
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Show specified section and hide others
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

// Setup event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize admin status check
    checkAdminStatus();
    
    // Login button
    document.getElementById('login-button').addEventListener('click', (e) => {
        e.preventDefault();
        showSection('login-section');
    });
    
    // Logout button
    document.getElementById('logout-button').addEventListener('click', (e) => {
        e.preventDefault();
        logoutUser();
    });
    
    // Login form submission
    document.getElementById('login-submit').addEventListener('click', async () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (username && password) {
            await loginUser(username, password);
        } else {
            document.getElementById('login-error').textContent = 'Please enter username and password';
            document.getElementById('login-error').style.display = 'block';
        }
    });
});
