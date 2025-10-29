#!/usr/bin/env python3
"""
FastAPI main application for GTM Game
Modern backend following 12-factor principles
"""
import logging
import os
from pathlib import Path
from typing import Dict, Any

from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import uvicorn

from src.config.config import config
from src.api.routes import movies, auth, game, user
from src.core.database import init_db
from src.core.exceptions import GTMException

# Configure logging based on environment
logging.basicConfig(
    level=getattr(logging, config.LOG_LEVEL.upper()),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('server.log')
    ]
)

logger = logging.getLogger(__name__)

# Initialize FastAPI application
app = FastAPI(
    title=config.APP_NAME,
    description="Interactive movie guessing game with modern backend",
    version=config.API_VERSION,
    debug=config.DEBUG
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[config.CORS_ORIGIN, "http://localhost:3000"],  # Allow frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add trusted host middleware for production
if config.NODE_ENV == 'production':
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["*"]  # Configure based on your domain
    )

# Exception handler for custom exceptions
@app.exception_handler(GTMException)
async def gtm_exception_handler(request: Request, exc: GTMException):
    """Handle custom GTM exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.error_code,
            "message": exc.message,
            "details": exc.details
        }
    )

# Health check endpoint
@app.get("/health")
async def health_check() -> Dict[str, Any]:
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "environment": config.NODE_ENV,
        "version": config.API_VERSION,
        "features": {
            "authentication": config.ENABLE_AUTHENTICATION,
            "monetization": config.ENABLE_MONETIZATION,
            "analytics": config.ENABLE_ANALYTICS,
            "social_features": config.ENABLE_SOCIAL_FEATURES
        }
    }

# Root endpoint - serve the game
@app.get("/", response_class=HTMLResponse)
async def read_root():
    """Serve the main game HTML"""
    try:
        client_dir = Path(__file__).parent.parent / "client"
        index_file = client_dir / "index.html"
        
        if not index_file.exists():
            raise HTTPException(status_code=404, detail="Game interface not found")
            
        with open(index_file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Inject configuration into HTML
        config_script = f"""
        <script>
            window.CONFIG = {{
                API_BASE_URL: window.location.origin,
                ENABLE_AUTHENTICATION: {str(config.ENABLE_AUTHENTICATION).lower()},
                ENABLE_MONETIZATION: {str(config.ENABLE_MONETIZATION).lower()},
                ENABLE_ANALYTICS: {str(config.ENABLE_ANALYTICS).lower()},
                APP_NAME: "{config.APP_NAME}"
            }};
        </script>
        """
        
        # Insert config script before closing head tag
        content = content.replace('</head>', f'{config_script}</head>')
        
        return HTMLResponse(content=content)
        
    except Exception as e:
        logger.error(f"Error serving root endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Include API routers
app.include_router(movies.router, prefix="/api/v1/movies", tags=["movies"])
app.include_router(game.router, prefix="/api/v1/game", tags=["game"])

# Include conditional routers based on feature flags
if config.ENABLE_AUTHENTICATION:
    app.include_router(auth.router, prefix="/api/v1/auth", tags=["authentication"])
    app.include_router(user.router, prefix="/api/v1/users", tags=["users"])

# Mount static files
static_dir = Path(__file__).parent.parent.parent / "static"
if static_dir.exists():
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

# Mount data directory for movies
data_dir = Path(__file__).parent.parent.parent / "data"
if data_dir.exists():
    app.mount("/data", StaticFiles(directory=str(data_dir)), name="data")

# Application startup events
@app.on_event("startup")
async def startup_event():
    """Initialize application on startup"""
    logger.info(f"Starting {config.APP_NAME} in {config.NODE_ENV} mode")
    
    # Initialize database
    try:
        await init_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Database initialization failed: {str(e)}")
        if config.NODE_ENV == 'production':
            raise  # Fail fast in production
    
    # Log configuration (without sensitive data)
    logger.info(f"Server will run on {config.HOST}:{config.PORT}")
    logger.info(f"Features enabled: auth={config.ENABLE_AUTHENTICATION}, "
                f"monetization={config.ENABLE_MONETization}, "
                f"analytics={config.ENABLE_ANALYTICS}")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on application shutdown"""
    logger.info("Shutting down application")

# Development server entry point
def run_dev_server():
    """Run development server with auto-reload"""
    uvicorn.run(
        "src.server.main:app",
        host=config.HOST,
        port=config.PORT,
        reload=config.DEBUG,
        log_level=config.LOG_LEVEL,
        access_log=True
    )

# Production server entry point
def run_prod_server():
    """Run production server"""
    uvicorn.run(
        "src.server.main:app",
        host=config.HOST,
        port=config.PORT,
        workers=4,  # Multiple workers for production
        log_level=config.LOG_LEVEL,
        access_log=True,
        loop="uvloop",
        http="httptools"
    )

if __name__ == "__main__":
    if config.NODE_ENV == 'production':
        run_prod_server()
    else:
        run_dev_server()
