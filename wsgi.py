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
def application(environ, start_response):
    # Create a handler instance
    handler = MovieGameHandler()
    # Set the environment and start_response for the handler
    handler.environ = environ
    handler.start_response = start_response
    # Handle the request
    return handler.handle_request()

# For direct execution
if __name__ == "__main__":
    from src.server.server import run_server
    run_server()
