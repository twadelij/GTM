# GTM Project Continuation Prompt - Linux Server Implementation

## Current Project Status

1. **Backend Implementation**:
   - Created Flask-based backend with PostgreSQL integration
   - Implemented user authentication and session management
   - Set up API endpoints for admin dashboard
   - Database models defined for users, sessions, and games

2. **Frontend Development**:
   - New admin dashboard implementation (admin.html)
   - Separate admin dashboard JavaScript (admin-dashboard.js)
   - API integration with backend services
   - Enhanced UI with user management, movie management, and statistics

3. **Project Structure**:
   - Main branch established as primary branch
   - Feature branch: feature/admin-dashboard-backend
   - Project rules implemented (.rules file)
   - Cross-platform compatibility added to roadmap

## Next Steps on Linux Server

1. **Environment Setup**:
   ```bash
   # Install required packages
   sudo apt-get update
   sudo apt-get install python3-pip postgresql postgresql-contrib
   
   # Create virtual environment
   python3 -m venv venv
   source venv/bin/activate
   
   # Install dependencies
   pip install -r requirements.txt
   ```

2. **Database Setup**:
   ```sql
   -- Create database and user
   CREATE DATABASE gtm;
   CREATE USER gtm_admin WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE gtm TO gtm_admin;
   
   -- Connect to database and create tables
   \c gtm
   
   -- Tables will be created automatically by SQLAlchemy
   ```

3. **Configuration**:
   - Create .env file with database credentials
   - Update config.js with correct server URL
   - Set up proper file permissions

## Implementation Tasks

1. **Database Integration**:
   - Test database connection
   - Run initial migrations
   - Create admin user
   - Verify user authentication

2. **Admin Dashboard Testing**:
   - Test user management functionality
   - Implement movie management features
   - Set up statistics tracking
   - Verify all API endpoints

3. **Cross-Platform Compatibility**:
   - Document OS-specific differences
   - Create installation guides
   - Test deployment process

## Database Schema (Unchanged)

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

## Project Rules

1. Only work on one branch at a time
2. Push to main after successful test
3. Update TODO.md after successful test
4. Don't work on main, always create a branch first
5. .rules file should be maintained but not pushed to GitHub

## Current Branch
Currently on branch: `feature/admin-dashboard-backend`

## Remote Repository
Origin: https://github.com/twadelij/GTM.git

## Next Actions
1. Clone repository on Linux server
2. Set up development environment
3. Configure PostgreSQL database
4. Test admin dashboard implementation
5. Update documentation with Linux-specific instructions

Remember to follow the project rules and update TODO.md after successful testing.
