#!/usr/bin/env python3
import json
import subprocess
import sys

# Controleer en installeer requests indien nodig
try:
    import requests
except ImportError:
    print("Bezig met installeren van requests package...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "requests"])
    import requests

def test_login(username, password):
    """Test the login API directly."""
    url = "http://localhost:5000/api/auth/login"
    headers = {"Content-Type": "application/json"}
    data = {"username": username, "password": password}
    
    try:
        response = requests.post(url, headers=headers, data=json.dumps(data))
        print(f"Status code: {response.status_code}")
        print(f"Response headers: {response.headers}")
        print(f"Response body: {response.text}")
        
        if response.status_code == 200:
            print("Login successful!")
        else:
            print("Login failed!")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python test_login.py <username> <password>")
        sys.exit(1)
    
    username = sys.argv[1]
    password = sys.argv[2]
    test_login(username, password) 