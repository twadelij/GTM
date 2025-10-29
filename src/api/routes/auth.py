#!/usr/bin/env python3
"""
Authentication API routes for GTM Game
Handles Gmail OAuth2 authentication
"""
import logging
from typing import Dict, Any
from fastapi import APIRouter, HTTPException, Request, Response
from fastapi.responses import RedirectResponse
from pydantic import BaseModel

from src.core.exceptions import AuthenticationError, ValidationError
from src.services.auth_service import AuthService
from src.config.config import config

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize auth service
auth_service = AuthService()

class AuthCallbackRequest(BaseModel):
    code: str
    state: str = None

@router.get("/google/login")
async def google_login():
    """Initiate Google OAuth2 login"""
    try:
        if not config.ENABLE_AUTHENTICATION:
            raise ValidationError("Authentication is disabled")
        
        auth_url = auth_service.get_google_auth_url()
        return RedirectResponse(url=auth_url)
        
    except ValidationError:
        raise
    except Exception as e:
        logger.error(f"Error initiating Google login: {str(e)}")
        raise AuthenticationError("Failed to initiate authentication")

@router.get("/google/callback")
async def google_callback(code: str, state: str = None):
    """Handle Google OAuth2 callback"""
    try:
        if not config.ENABLE_AUTHENTICATION:
            raise ValidationError("Authentication is disabled")
        
        # Exchange code for tokens
        tokens = await auth_service.exchange_code_for_tokens(code)
        
        # Get user info
        user_info = await auth_service.get_user_info(tokens['access_token'])
        
        # Create JWT token for our application
        app_token = auth_service.create_app_token(user_info)
        
        # Set secure HTTP-only cookie
        response = RedirectResponse(url=config.APP_URL)
        response.set_cookie(
            key="auth_token",
            value=app_token,
            httponly=True,
            secure=config.NODE_ENV == 'production',
            samesite='lax',
            max_age=3600  # 1 hour
        )
        
        logger.info(f"User {user_info.get('email')} authenticated successfully")
        
        return response
        
    except ValidationError:
        raise
    except Exception as e:
        logger.error(f"Error in Google callback: {str(e)}")
        raise AuthenticationError("Authentication failed")

@router.post("/logout")
async def logout(response: Response):
    """Logout user and clear auth cookie"""
    try:
        response.delete_cookie("auth_token")
        return {"message": "Logged out successfully"}
        
    except Exception as e:
        logger.error(f"Error during logout: {str(e)}")
        raise AuthenticationError("Logout failed")

@router.get("/me")
async def get_current_user(request: Request):
    """Get current authenticated user info"""
    try:
        if not config.ENABLE_AUTHENTICATION:
            return {"authenticated": False, "message": "Authentication disabled"}
        
        # Get token from cookie
        auth_token = request.cookies.get("auth_token")
        
        if not auth_token:
            return {"authenticated": False, "message": "No authentication token"}
        
        # Validate token and get user info
        user_info = auth_service.validate_app_token(auth_token)
        
        return {
            "authenticated": True,
            "user": user_info
        }
        
    except AuthenticationError:
        return {"authenticated": False, "message": "Invalid token"}
    except Exception as e:
        logger.error(f"Error getting current user: {str(e)}")
        return {"authenticated": False, "message": "Authentication error"}

@router.get("/status")
async def get_auth_status():
    """Get authentication service status"""
    return {
        "authentication_enabled": config.ENABLE_AUTHENTICATION,
        "oauth_provider": "Google" if config.ENABLE_AUTHENTICATION else None,
        "features": {
            "social_login": config.ENABLE_AUTHENTICATION,
            "user_profiles": config.ENABLE_AUTHENTICATION,
            "session_management": config.ENABLE_AUTHENTICATION
        }
    }
