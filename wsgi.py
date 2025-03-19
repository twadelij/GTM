#!/usr/bin/env python3
import os
import sys
from pathlib import Path

# Add the project directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Load environment variables
try:
    from dotenv import load_dotenv
    env_path = Path(os.path.dirname(os.path.abspath(__file__))).joinpath('.env')
    load_dotenv(dotenv_path=env_path)
except ImportError:
    print("python-dotenv not installed, using default environment variables")

# Import the server module
from src.server.server import MovieGameHandler

# Create a WSGI application
def create_app():
    return MovieGameHandler

# For direct execution
if __name__ == "__main__":
    from src.server.server import run_server
    run_server()
