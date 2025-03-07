# GTM Project Continuation Prompt

## What Has Been Done So Far

1. **Admin Login Fix Implementation**:
   - Created a simplified admin login system that bypasses the server-side authentication issues
   - Implemented client-side validation for "admin" username and "admin123" password
   - Created a basic admin dashboard with 4 buttons (admin-dashboard.html)
   - Used localStorage for maintaining login state

2. **Rules File Creation**:
   - Created a .rules file in the project root
   - Added rules for project development and workflow
   - Configured it to be updated whenever "add rule:" is typed
   - Ensured it will not be added to git or uploaded to GitHub

3. **Changes to auth.js**:
   - Modified authentication flow to handle direct admin login
   - Added localStorage for session persistence
   - Improved error handling with null checks
   - Added support for Enter key in login form

4. **Backend Implementation Progress**:
   - Created a Flask-based backend in app.py with PostgreSQL integration
   - Set up user authentication endpoints for admin login
   - Implemented database models for users, sessions, and games
   - Added environment configuration with .env.example

5. **Project Structure Updates**:
   - Created a .gitignore file to prevent tracking of sensitive files
   - Prepared requirements.txt with necessary dependencies
   - Updated TODO.md with current priorities

## What Needs to Be Done

1. **Enhanced Admin Dashboard**:
   - Improve styling with movie images in the background with proper opacity
   - Implement more relevant admin functions based on the TODO list
   - Functions should include movie management, user management, statistics, settings, etc.
   - Make buttons visually appealing and representative of their functions

2. **Working Logout Functionality**:
   - Complete the logout button functionality to clear localStorage
   - Add proper redirection after logout
   - Ensure all session data is properly cleared

3. **User Management Implementation**:
   - Create a user management interface
   - Allow viewing, adding, editing, and deleting users
   - Include fields for username, email, admin status, etc.
   - Implement proper validation and error handling

4. **Movie Management Implementation**:
   - Allow admins to add, edit, and delete movies
   - Include fields for movie title, release year, description, images, etc.
   - Implement image uploading or linking
   - Add proper validation and error handling

5. **Authentication Improvement**:
   - Connect the admin dashboard to the Flask backend authentication
   - Use secure HTTP-only cookies for session management
   - Test the password hashing with bcrypt that's implemented in app.py
   - Deploy database setup on RHEL server

6. **Database Integration**:
   - Set up PostgreSQL database on the RHEL server
   - Test database connection with app.py
   - Create initial migrations and admin user
   - Verify authentication flow works end-to-end

## Implementation Notes

- The current authentication method is temporary and NOT suitable for production
- The admin dashboard should follow the visual style of the main game
- All admin functions should have proper error handling
- Code should be well-documented for future maintenance
- Flask application needs proper environment setup on RHEL server

## Database Schema Reference

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_admin BOOLEAN DEFAULT FALSE
);

-- Sessions table
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Games table
CREATE TABLE games (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    score INTEGER NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    movies_played JSONB,
    wrong_guesses INTEGER
);
```

## RHEL Server Setup Steps

When continuing on the RHEL server, follow these steps:

1. **Environment Setup**:
   ```bash
   # Install required packages
   sudo dnf update
   sudo dnf install python3-pip postgresql postgresql-server postgresql-contrib
   
   # Initialize PostgreSQL
   sudo postgresql-setup --initdb --unit postgresql
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   
   # Create virtual environment
   python3 -m venv venv
   source venv/bin/activate
   
   # Install dependencies
   pip install -r requirements.txt
   ```

2. **Database Configuration**:
   ```bash
   # Create .env file from example
   cp .env.example .env
   # Edit with your actual credentials
   nano .env
   ```

3. **Run Flask Application**:
   ```bash
   # Navigate to server directory
   cd src/server
   # Run application
   python app.py
   ```

## Project Status

Currently on branch: `fix/admin-login-and-docs`

Priority issues from TODO.md:
- Fix admin login issues (in progress)
- Implement proper session management
- Add user management features
- Implement movie management features
- Enhance admin dashboard UI

## Project Rules

1. Only work on one branch at a time
2. Push to main after successful test
3. .rules file should be maintained but not pushed to GitHub
4. Current branch: fix/admin-login-and-docs
