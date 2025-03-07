// User Management functionality
class UserManagement {
    constructor() {
        this.users = [];
        this.modal = document.getElementById('user-modal');
        this.userForm = document.getElementById('user-form');
        this.addUserBtn = document.getElementById('add-user-btn');
        this.searchInput = document.getElementById('user-search');
        this.usersList = document.getElementById('users-list');
        this.cancelBtn = document.getElementById('cancel-btn');
        this.currentUserId = null;

        this.initializeEventListeners();
        this.loadUsers();
    }

    initializeEventListeners() {
        // Add user button
        this.addUserBtn.addEventListener('click', () => this.showModal());

        // Search input
        this.searchInput.addEventListener('input', (e) => this.filterUsers(e.target.value));

        // Form submission
        this.userForm.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Cancel button
        this.cancelBtn.addEventListener('click', () => this.hideModal());

        // Logout functionality
        document.getElementById('logout-button').addEventListener('click', () => {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('isAdmin');
            window.location.href = '/';
        });
    }

    async loadUsers() {
        try {
            const response = await fetch('/api/users', {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                this.users = await response.json();
                this.renderUsers();
            } else {
                console.error('Failed to load users');
            }
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }

    renderUsers(filteredUsers = null) {
        const usersToRender = filteredUsers || this.users;
        this.usersList.innerHTML = '';

        usersToRender.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${new Date(user.created_at).toLocaleDateString()}</td>
                <td>${user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}</td>
                <td>${user.is_admin ? '✓' : '-'}</td>
                <td class="action-buttons">
                    <button class="edit-btn" data-id="${user.id}">Edit</button>
                    <button class="delete-btn" data-id="${user.id}">Delete</button>
                </td>
            `;

            // Add event listeners for edit and delete buttons
            row.querySelector('.edit-btn').addEventListener('click', () => this.editUser(user));
            row.querySelector('.delete-btn').addEventListener('click', () => this.deleteUser(user.id));

            this.usersList.appendChild(row);
        });
    }

    filterUsers(searchTerm) {
        if (!searchTerm) {
            this.renderUsers();
            return;
        }

        const filtered = this.users.filter(user => 
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.renderUsers(filtered);
    }

    showModal(user = null) {
        const modalTitle = document.getElementById('modal-title');
        const usernameInput = document.getElementById('username');
        const emailInput = document.getElementById('email');
        const isAdminInput = document.getElementById('is-admin');
        const passwordInput = document.getElementById('password');

        if (user) {
            modalTitle.textContent = 'Edit User';
            usernameInput.value = user.username;
            emailInput.value = user.email;
            isAdminInput.checked = user.is_admin;
            this.currentUserId = user.id;
            passwordInput.required = false;
        } else {
            modalTitle.textContent = 'Add New User';
            this.userForm.reset();
            this.currentUserId = null;
            passwordInput.required = true;
        }

        this.modal.classList.add('active');
    }

    hideModal() {
        this.modal.classList.remove('active');
        this.userForm.reset();
        this.currentUserId = null;
    }

    async handleFormSubmit(event) {
        event.preventDefault();

        const formData = {
            username: document.getElementById('username').value,
            email: document.getElementById('email').value,
            is_admin: document.getElementById('is-admin').checked
        };

        const password = document.getElementById('password').value;
        if (password) {
            formData.password = password;
        }

        try {
            const url = this.currentUserId 
                ? `/api/users/${this.currentUserId}`
                : '/api/users';

            const method = this.currentUserId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                await this.loadUsers();
                this.hideModal();
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to save user');
            }
        } catch (error) {
            console.error('Error saving user:', error);
            alert('Error saving user');
        }
    }

    editUser(user) {
        this.showModal(user);
    }

    async deleteUser(userId) {
        if (!confirm('Are you sure you want to delete this user?')) {
            return;
        }

        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                await this.loadUsers();
            } else {
                alert('Failed to delete user');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Error deleting user');
        }
    }
}

// Initialize user management when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication first
    if (!localStorage.getItem('isLoggedIn') || localStorage.getItem('isAdmin') !== 'true') {
        window.location.href = '/';
        return;
    }

    // Initialize user management
    const userManagement = new UserManagement();
});
