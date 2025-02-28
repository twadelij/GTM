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

def check_admin():
    """Check admin user details."""
    app = create_app()
    
    with app.app_context():
        # Find admin user
        admin = User.query.filter_by(is_admin=True).first()
        if not admin:
            print("No admin user found.")
            return
        
        print(f"Admin user details:")
        print(f"Username: {admin.username}")
        print(f"Email: {admin.email}")
        print(f"Is verified: {admin.is_verified}")
        print(f"Password hash: {admin.password_hash}")

if __name__ == '__main__':
    check_admin() 