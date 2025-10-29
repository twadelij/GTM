#!/usr/bin/env python3
"""
Configuration management for GTM Game
Following 12-factor app principles - environment-based configuration
"""
import os
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

class Config:
    """Application configuration following 12-factor principles"""
    
    # Server Configuration
    PORT: int = int(os.getenv('PORT', 8888))
    HOST: str = os.getenv('HOST', '0.0.0.0')
    NODE_ENV: str = os.getenv('NODE_ENV', 'development')
    DEBUG: bool = NODE_ENV == 'development'
    
    # Database Configuration
    DATABASE_URL: str = os.getenv('DATABASE_URL', 'postgresql://username:password@localhost:5432/gtm_game')
    DATABASE_HOST: str = os.getenv('DATABASE_HOST', 'localhost')
    DATABASE_PORT: int = int(os.getenv('DATABASE_PORT', 5432))
    DATABASE_NAME: str = os.getenv('DATABASE_NAME', 'gtm_game')
    DATABASE_USER: str = os.getenv('DATABASE_USER', 'username')
    DATABASE_PASSWORD: str = os.getenv('DATABASE_PASSWORD', 'password')
    
    # Gmail OAuth2 Configuration
    GOOGLE_CLIENT_ID: str = os.getenv('GOOGLE_CLIENT_ID', '')
    GOOGLE_CLIENT_SECRET: str = os.getenv('GOOGLE_CLIENT_SECRET', '')
    GOOGLE_REDIRECT_URI: str = os.getenv('GOOGLE_REDIRECT_URI', 'http://localhost:8888/auth/google/callback')
    JWT_SECRET: str = os.getenv('JWT_SECRET', 'your-super-secret-jwt-key-here')
    
    # Redis Configuration
    REDIS_URL: str = os.getenv('REDIS_URL', 'redis://localhost:6379')
    REDIS_HOST: str = os.getenv('REDIS_HOST', 'localhost')
    REDIS_PORT: int = int(os.getenv('REDIS_PORT', 6379))
    
    # Monetization Configuration
    STRIPE_PUBLIC_KEY: str = os.getenv('STRIPE_PUBLIC_KEY', '')
    STRIPE_SECRET_KEY: str = os.getenv('STRIPE_SECRET_KEY', '')
    STRIPE_WEBHOOK_SECRET: str = os.getenv('STRIPE_WEBHOOK_SECRET', '')
    
    # Application Configuration
    APP_NAME: str = os.getenv('APP_NAME', 'Guess The Movie Game')
    APP_URL: str = os.getenv('APP_URL', 'http://localhost:8888')
    API_VERSION: str = os.getenv('API_VERSION', 'v1')
    
    # Logging Configuration
    LOG_LEVEL: str = os.getenv('LOG_LEVEL', 'info')
    LOG_FORMAT: str = os.getenv('LOG_FORMAT', 'json')
    
    # Security Configuration
    CORS_ORIGIN: str = os.getenv('CORS_ORIGIN', 'http://localhost:8888')
    SESSION_SECRET: str = os.getenv('SESSION_SECRET', 'your-session-secret-here')
    RATE_LIMIT_WINDOW_MS: int = int(os.getenv('RATE_LIMIT_WINDOW_MS', 900000))  # 15 minutes
    RATE_LIMIT_MAX_REQUESTS: int = int(os.getenv('RATE_LIMIT_MAX_REQUESTS', 100))
    
    # Feature Flags
    ENABLE_AUTHENTICATION: bool = os.getenv('ENABLE_AUTHENTICATION', 'true').lower() == 'true'
    ENABLE_MONETIZATION: bool = os.getenv('ENABLE_MONETIZATION', 'false').lower() == 'true'
    ENABLE_ANALYTICS: bool = os.getenv('ENABLE_ANALYTICS', 'true').lower() == 'true'
    ENABLE_SOCIAL_FEATURES: bool = os.getenv('ENABLE_SOCIAL_FEATURES', 'false').lower() == 'true'
    
    # File Upload Configuration
    MAX_FILE_SIZE: int = int(os.getenv('MAX_FILE_SIZE', 10485760))  # 10MB
    UPLOAD_DIR: str = os.getenv('UPLOAD_DIR', 'uploads')
    ALLOWED_FILE_TYPES: list = os.getenv('ALLOWED_FILE_TYPES', 'jpg,jpeg,png,gif').split(',')
    
    # External Services
    TMDB_API_KEY: str = os.getenv('TMDB_API_KEY', '')
    EMAIL_SERVICE_API_KEY: str = os.getenv('EMAIL_SERVICE_API_KEY', '')
    
    # Directory Configuration (12-factor principle: treat backing services as attached resources)
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    DATA_DIR: str = os.path.join(BASE_DIR, 'data')
    STATIC_DIR: str = os.path.join(BASE_DIR, 'static')
    UPLOAD_DIR_FULL: str = os.path.join(BASE_DIR, UPLOAD_DIR)
    
    @classmethod
    def validate_config(cls) -> list[str]:
        """Validate required configuration variables"""
        errors = []
        
        # Required for production
        if cls.NODE_ENV == 'production':
            required_vars = [
                'DATABASE_URL',
                'JWT_SECRET',
                'SESSION_SECRET'
            ]
            
            for var in required_vars:
                if not getattr(cls, var):
                    errors.append(f"Missing required environment variable: {var}")
        
        # Required if authentication is enabled
        if cls.ENABLE_AUTHENTICATION:
            auth_vars = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET']
            for var in auth_vars:
                if not getattr(cls, var):
                    errors.append(f"Authentication enabled but missing: {var}")
        
        # Required if monetization is enabled
        if cls.ENABLE_MONETIZATION:
            monetization_vars = ['STRIPE_PUBLIC_KEY', 'STRIPE_SECRET_KEY']
            for var in monetization_vars:
                if not getattr(cls, var):
                    errors.append(f"Monetization enabled but missing: {var}")
        
        return errors
    
    @classmethod
    def get_database_config(cls) -> dict:
        """Get database configuration as dictionary"""
        return {
            'url': cls.DATABASE_URL,
            'host': cls.DATABASE_HOST,
            'port': cls.DATABASE_PORT,
            'database': cls.DATABASE_NAME,
            'user': cls.DATABASE_USER,
            'password': cls.DATABASE_PASSWORD
        }
    
    @classmethod
    def get_redis_config(cls) -> dict:
        """Get Redis configuration as dictionary"""
        return {
            'url': cls.REDIS_URL,
            'host': cls.REDIS_HOST,
            'port': cls.REDIS_PORT
        }
    
    @classmethod
    def get_oauth_config(cls) -> dict:
        """Get OAuth configuration as dictionary"""
        return {
            'client_id': cls.GOOGLE_CLIENT_ID,
            'client_secret': cls.GOOGLE_CLIENT_SECRET,
            'redirect_uri': cls.GOOGLE_REDIRECT_URI
        }

# Development configuration overrides
class DevelopmentConfig(Config):
    """Development environment configuration"""
    DEBUG: bool = True
    LOG_LEVEL: str = 'debug'

# Production configuration overrides
class ProductionConfig(Config):
    """Production environment configuration"""
    DEBUG: bool = False
    LOG_LEVEL: str = 'info'

# Test configuration overrides
class TestConfig(Config):
    """Test environment configuration"""
    DATABASE_URL: str = 'sqlite:///test.db'
    REDIS_URL: str = 'redis://localhost:6379/1'  # Use different database
    LOG_LEVEL: str = 'debug'

# Configuration mapping
config_map = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'test': TestConfig,
    'default': DevelopmentConfig
}

def get_config() -> Config:
    """Get configuration based on environment"""
    env = os.getenv('NODE_ENV', 'default')
    return config_map.get(env, DevelopmentConfig)()

# Global configuration instance
config = get_config()

# Validate configuration on import
validation_errors = config.validate_config()
if validation_errors:
    raise ValueError(f"Configuration validation failed: {validation_errors}")
