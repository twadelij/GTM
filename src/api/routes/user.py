#!/usr/bin/env python3
"""
User API routes for GTM Game
Handles user profiles and preferences
"""
import logging
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel

from src.core.exceptions import AuthenticationError, ValidationError
from src.services.auth_service import AuthService
from src.config.config import config

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize auth service
auth_service = AuthService()

class UserProfile(BaseModel):
    email: str
    name: str
    picture: Optional[str] = None
    preferences: Dict[str, Any] = {}

class UserPreferences(BaseModel):
    theme: str = "light"
    difficulty: str = "medium"
    sound_enabled: bool = True
    notifications_enabled: bool = True

@router.get("/profile", response_model=UserProfile)
async def get_user_profile(request: Request):
    """Get current user profile"""
    try:
        if not config.ENABLE_AUTHENTICATION:
            raise ValidationError("Authentication is disabled")
        
        # Get token from cookie
        auth_token = request.cookies.get("auth_token")
        
        if not auth_token:
            raise AuthenticationError("No authentication token")
        
        # Validate token and get user info
        user_info = auth_service.validate_app_token(auth_token)
        
        # In production, this would fetch from database
        # For now, return basic profile from auth token
        profile = UserProfile(
            email=user_info.get('email', ''),
            name=user_info.get('name', ''),
            picture=user_info.get('picture'),
            preferences=user_info.get('preferences', {})
        )
        
        return profile
        
    except (AuthenticationError, ValidationError):
        raise
    except Exception as e:
        logger.error(f"Error getting user profile: {str(e)}")
        raise AuthenticationError("Failed to get user profile")

@router.put("/preferences")
async def update_user_preferences(
    preferences: UserPreferences,
    request: Request
):
    """Update user preferences"""
    try:
        if not config.ENABLE_AUTHENTICATION:
            raise ValidationError("Authentication is disabled")
        
        # Get token from cookie
        auth_token = request.cookies.get("auth_token")
        
        if not auth_token:
            raise AuthenticationError("No authentication token")
        
        # Validate token
        user_info = auth_service.validate_app_token(auth_token)
        
        # In production, this would update database
        # For now, just return success
        logger.info(f"Updated preferences for user {user_info.get('email')}")
        
        return {
            "message": "Preferences updated successfully",
            "preferences": preferences.dict()
        }
        
    except (AuthenticationError, ValidationError):
        raise
    except Exception as e:
        logger.error(f"Error updating user preferences: {str(e)}")
        raise AuthenticationError("Failed to update preferences")

@router.get("/stats")
async def get_user_stats(request: Request):
    """Get user game statistics"""
    try:
        if not config.ENABLE_AUTHENTICATION:
            raise ValidationError("Authentication is disabled")
        
        # Get token from cookie
        auth_token = request.cookies.get("auth_token")
        
        if not auth_token:
            raise AuthenticationError("No authentication token")
        
        # Validate token
        user_info = auth_service.validate_app_token(auth_token)
        
        # In production, this would fetch from database
        # For now, return placeholder stats
        stats = {
            "games_played": 0,
            "total_score": 0,
            "average_score": 0,
            "best_score": 0,
            "favorite_genres": [],
            "achievements": [],
            "membership_tier": "free" if not config.ENABLE_MONETIZATION else "basic"
        }
        
        return stats
        
    except (AuthenticationError, ValidationError):
        raise
    except Exception as e:
        logger.error(f"Error getting user stats: {str(e)}")
        raise AuthenticationError("Failed to get user stats")

@router.get("/membership")
async def get_user_membership(request: Request):
    """Get user membership information"""
    try:
        if not config.ENABLE_AUTHENTICATION:
            return {"membership": "guest", "features": ["basic_gameplay"]}
        
        # Get token from cookie
        auth_token = request.cookies.get("auth_token")
        
        if not auth_token:
            return {"membership": "guest", "features": ["basic_gameplay"]}
        
        # Validate token
        user_info = auth_service.validate_app_token(auth_token)
        
        # In production, this would fetch from database/payment system
        membership_info = {
            "membership": "free",
            "tier": "basic",
            "features": [
                "basic_gameplay",
                "profile_creation"
            ],
            "limits": {
                "games_per_day": 10,
                "max_movies_per_game": 20
            }
        }
        
        if config.ENABLE_MONETIZATION:
            # Add premium features placeholder
            membership_info["available_upgrades"] = [
                {
                    "name": "Premium",
                    "price": "$9.99/month",
                    "features": ["unlimited_games", "advanced_stats", "premium_themes"]
                }
            ]
        
        return membership_info
        
    except Exception as e:
        logger.error(f"Error getting user membership: {str(e)}")
        return {"membership": "guest", "features": ["basic_gameplay"]}
