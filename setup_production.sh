#!/bin/bash
# Production setup script for Guess The Movie Game

# Exit on error
set -e

echo "Setting up Guess The Movie Game for production..."

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Create production .env file if it doesn't exist
if [ ! -f ".env.production" ]; then
    echo "Creating production environment file..."
    cp .env.example .env.production
    # Update with production values
    sed -i 's/DEBUG=True/DEBUG=False/' .env.production
    sed -i 's/DOMAIN=localhost/DOMAIN=gtm.cbsp.nl/' .env.production
fi

# Create necessary directories
echo "Creating necessary directories..."
mkdir -p logs
mkdir -p nginx

# Setup Nginx configuration
echo "Setting up Nginx configuration..."
if [ -f "/etc/nginx/sites-available" ]; then
    # Debian/Ubuntu style
    sudo cp nginx/gtm.cbsp.nl.conf /etc/nginx/sites-available/
    sudo ln -sf /etc/nginx/sites-available/gtm.cbsp.nl.conf /etc/nginx/sites-enabled/
else
    # RHEL/CentOS style
    sudo cp nginx/gtm.cbsp.nl.conf /etc/nginx/conf.d/
fi

# Setup systemd service
echo "Setting up systemd service..."
sudo cp gtm.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable gtm.service

echo "Setup complete! To start the service, run:"
echo "sudo systemctl start gtm.service"
echo ""
echo "To check the service status, run:"
echo "sudo systemctl status gtm.service"
echo ""
echo "Don't forget to restart Nginx:"
echo "sudo systemctl restart nginx"
