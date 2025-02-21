let currentUser = {
    username: 'testuser1',
    department: 'Testing'
};

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Skip login, go straight to menu
    showSection('menu-section');
    
    // Menu buttons
    document.getElementById('play-game').addEventListener('click', () => {
        showSection('game-section');
        if (typeof startNewRound === 'function') {
            startNewRound();
        }
    });
    
    document.getElementById('upload-image').addEventListener('click', () => {
        showSection('upload-section');
    });
    
    // Back buttons
    document.getElementById('back-to-menu').addEventListener('click', () => {
        showSection('menu-section');
    });
    
    document.getElementById('back-to-menu-upload').addEventListener('click', () => {
        showSection('menu-section');
    });
});
