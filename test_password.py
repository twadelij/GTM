#!/usr/bin/env python3
import os
import sys
import importlib.util

# Voeg het juiste pad toe voor de server modules
base_path = os.path.dirname(os.path.abspath(__file__))
server_path = os.path.join(base_path, 'src', 'server')
sys.path.insert(0, server_path)

# Nu zou de import moeten werken
from models import db, User
from server import create_app

def test_password(username, password):
    """Test if a password is correct for a given user."""
    app = create_app()
    
    with app.app_context():
        # Find user
        user = User.query.filter_by(username=username).first()
        if not user:
            print(f"User '{username}' not found.")
            return
        
        # Test password
        result = user.check_password(password)
        print(f"Password check for user '{username}': {'SUCCESS' if result else 'FAILED'}")

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Usage: python test_password.py <username> <password>")
        sys.exit(1)
    
    username = sys.argv[1]
    password = sys.argv[2]
    test_password(username, password) 