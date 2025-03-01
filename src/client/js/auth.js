let currentUser = null;

// Check admin status and display admin link if appropriate
async function checkAdminStatus() {
    console.log('Checking admin status...');
    try {
        const response = await fetch(getApiUrl('api/auth/current-user'));
        console.log('Current user response status:', response.status);
        
        if (response.ok) {
            const userData = await response.json();
            console.log('Current user data:', userData);
            
            if (userData && userData.is_admin) {
                console.log('Admin user detected, showing admin link');
                document.getElementById('admin-link').style.display = 'inline-block';
            } else {
                console.log('Non-admin user, hiding admin link');
                document.getElementById('admin-link').style.display = 'none';
            }
            
            // Show logout button, hide login button
            document.getElementById('logout-button').style.display = 'inline-block';
            document.getElementById('login-button').style.display = 'none';
            
            // Hide login section, show game info
            document.getElementById('login-section').classList.remove('active');
            document.getElementById('game-info').classList.add('active');
        } else {
            console.log('User not logged in, showing login UI');
            // User not logged in, show login UI
            document.getElementById('admin-link').style.display = 'none';
            document.getElementById('logout-button').style.display = 'none';
            document.getElementById('login-button').style.display = 'inline-block';
            
            document.getElementById('login-section').classList.add('active');
            document.getElementById('game-info').classList.remove('active');
        }
    } catch (error) {
        console.error('Error checking admin status:', error);
    }
}

// Handle login
async function loginUser(username, password) {
    try {
        console.log('Login poging voor gebruiker:', username);
        const response = await fetch(getApiUrl('api/auth/login'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        console.log('Login response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Login response data:', data);
            currentUser = data;
            
            // Update UI based on login
            document.getElementById('login-button').style.display = 'none';
            document.getElementById('logout-button').style.display = 'inline-block';
            
            console.log('Is admin?', currentUser.is_admin);
            if (currentUser.is_admin) {
                console.log('Admin gebruiker gedetecteerd, admin link tonen en doorsturen naar /admin');
                document.querySelector('.admin-link').style.display = 'inline-block';
                
                // Voeg een kleine vertraging toe voordat we doorsturen
                setTimeout(() => {
                    console.log('Doorsturen naar admin pagina...');
                    window.location.href = getApiUrl('admin');
                }, 500);
            } else {
                // Voor normale gebruikers, toon de game info section
                console.log('Normale gebruiker gedetecteerd, game info section tonen');
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
            console.log('Login mislukt, status:', response.status);
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
        const response = await fetch(getApiUrl('api/auth/logout'), {
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
