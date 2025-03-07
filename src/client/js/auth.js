let currentUser = null;

// Check admin status and display admin link if appropriate
async function checkAdminStatus() {
    console.log('Checking admin status...');
    try {
        const response = await fetch(getApiUrl('api/auth/current-user'), {
            credentials: 'include', // Belangrijk voor cookies
            headers: {
                'Accept': 'application/json'
            }
        });
        console.log('Current user response status:', response.status);
        
        if (response.ok) {
            const userData = await response.json();
            console.log('Current user data:', userData);
            
            const adminLink = document.getElementById('admin-link');
            const logoutButton = document.getElementById('logout-button');
            const loginButton = document.getElementById('login-button');
            const loginSection = document.getElementById('login-section');
            const gameInfo = document.getElementById('game-info');
            
            if (userData && userData.is_admin) {
                console.log('Admin user detected, showing admin link');
                if (adminLink) adminLink.style.display = 'inline-block';
            } else {
                console.log('Non-admin user, hiding admin link');
                if (adminLink) adminLink.style.display = 'none';
            }
            
            // Show logout button, hide login button
            if (logoutButton) logoutButton.style.display = 'inline-block';
            if (loginButton) loginButton.style.display = 'none';
            
            // Hide login section, show game info
            if (loginSection) loginSection.classList.remove('active');
            if (gameInfo) gameInfo.classList.add('active');
        } else {
            console.log('User not logged in, showing login UI');
            // User not logged in, show login UI
            const adminLink = document.getElementById('admin-link');
            const logoutButton = document.getElementById('logout-button');
            const loginButton = document.getElementById('login-button');
            const loginSection = document.getElementById('login-section');
            const gameInfo = document.getElementById('game-info');
            
            if (adminLink) adminLink.style.display = 'none';
            if (logoutButton) logoutButton.style.display = 'none';
            if (loginButton) loginButton.style.display = 'inline-block';
            
            if (loginSection) loginSection.classList.add('active');
            if (gameInfo) gameInfo.classList.remove('active');
        }
    } catch (error) {
        console.error('Error checking admin status:', error);
    }
}

// Login user
async function loginUser(event) {
    // Alleen preventDefault aanroepen als het event bestaat en de methode heeft
    if (event && typeof event.preventDefault === 'function') {
        event.preventDefault();
    }
    
    // Als event een string is, dan is het waarschijnlijk de username
    let username, password;
    if (typeof event === 'string') {
        username = event;
        password = arguments[1]; // Het tweede argument zou het wachtwoord moeten zijn
    } else {
        // Normale flow waarbij we de waarden uit de formuliervelden halen
        const usernameElement = document.getElementById('username');
        const passwordElement = document.getElementById('password');
        
        if (!usernameElement || !passwordElement) {
            console.error('Login formulier elementen niet gevonden');
            return;
        }
        
        username = usernameElement.value;
        password = passwordElement.value;
    }
    
    if (!username || !password) {
        console.error('Gebruikersnaam en wachtwoord zijn vereist');
        return;
    }
    
    console.log(`Login poging voor gebruiker: ${username}`);
    
    // Direct admin authentication for the specified credentials
    if (username === 'admin' && password === 'admin123') {
        console.log('Admin credentials matched, logging in directly');
        
        // Store login state in localStorage for persistence
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('isAdmin', 'true');
        
        // Redirect to admin dashboard
        window.location.href = '/admin-dashboard.html';
        return;
    }
    
    try {
        const response = await fetch(getApiUrl('api/auth/login'), {
            method: 'POST',
            credentials: 'include', // Belangrijk voor cookies
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        console.log('Login response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Login successful, user data:', data);
            
            // Store login state
            localStorage.setItem('isLoggedIn', 'true');
            
            if (data.is_admin) {
                console.log('Admin user detected, redirecting to admin page...');
                localStorage.setItem('isAdmin', 'true');
                // Redirect to the new admin dashboard
                window.location.href = '/admin-dashboard.html';
            } else {
                console.log('Normal user, showing game info section');
                localStorage.setItem('isAdmin', 'false');
                const loginSection = document.getElementById('login-section');
                const gameInfoSection = document.getElementById('game-info-section');
                
                if (loginSection) loginSection.classList.remove('active');
                if (gameInfoSection) gameInfoSection.classList.add('active');
            }
        } else {
            console.log('Login failed with status:', response.status);
            // Get the error message element
            const errorElement = document.getElementById('login-error');
            if (errorElement) {
                errorElement.textContent = 'Invalid username or password';
                errorElement.style.display = 'block';
            }
        }
    } catch (error) {
        console.error('Login error:', error);
        const errorElement = document.getElementById('login-error');
        if (errorElement) {
            errorElement.textContent = 'Error connecting to server';
            errorElement.style.display = 'block';
        }
    }
}

// Logout user
async function logoutUser(event) {
    // Alleen preventDefault aanroepen als het event bestaat en de methode heeft
    if (event && typeof event.preventDefault === 'function') {
        event.preventDefault();
    }
    
    try {
        const response = await fetch(getApiUrl('api/auth/logout'), {
            method: 'POST',
            credentials: 'include' // Belangrijk voor cookies
        });
        
        if (response.ok) {
            // Reset UI met null-checks
            const adminLink = document.getElementById('admin-link');
            const logoutButton = document.getElementById('logout-button');
            const loginButton = document.getElementById('login-button');
            const loginSection = document.getElementById('login-section');
            const gameInfo = document.getElementById('game-info');
            
            if (adminLink) adminLink.style.display = 'none';
            if (logoutButton) logoutButton.style.display = 'none';
            if (loginButton) loginButton.style.display = 'inline-block';
            
            if (loginSection) loginSection.classList.add('active');
            if (gameInfo) gameInfo.classList.remove('active');
        } else {
            console.error('Logout failed');
        }
    } catch (error) {
        console.error('Error during logout:', error);
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
    // Check if user is already logged in as admin (for persistence)
    if (localStorage.getItem('isLoggedIn') === 'true' && 
        localStorage.getItem('isAdmin') === 'true' && 
        !window.location.pathname.includes('admin-dashboard.html')) {
        // Redirect to admin dashboard if on another page
        window.location.href = '/admin-dashboard.html';
        return;
    }
    
    // Initialize admin status check
    checkAdminStatus();
    
    // Login button
    const loginButton = document.getElementById('login-button');
    if (loginButton) {
        loginButton.addEventListener('click', (e) => {
            e.preventDefault();
            showSection('login-section');
        });
    }
    
    // Logout button
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            // Clear localStorage on logout
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('isAdmin');
            logoutUser();
        });
    }
    
    // Login form submission
    const loginSubmit = document.getElementById('login-submit');
    if (loginSubmit) {
        loginSubmit.addEventListener('click', async () => {
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (username && password) {
                await loginUser(username, password);
            } else {
                const errorElement = document.getElementById('login-error');
                if (errorElement) {
                    errorElement.textContent = 'Please enter username and password';
                    errorElement.style.display = 'block';
                }
            }
        });
    }
    
    // Handle pressing Enter in password field
    const passwordField = document.getElementById('password');
    if (passwordField) {
        passwordField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                
                if (username && password) {
                    loginUser(username, password);
                } else {
                    const errorElement = document.getElementById('login-error');
                    if (errorElement) {
                        errorElement.textContent = 'Please enter username and password';
                        errorElement.style.display = 'block';
                    }
                }
            }
        });
    }
});
