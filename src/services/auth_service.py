#!/usr/bin/env python3
"""
Authentication service for GTM Game
Handles Gmail OAuth2 and JWT token management
"""
import logging
import json
import secrets
from typing import Dict, Any, Optional
from datetime import datetime, timedelta

import jwt
import httpx
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow

from src.core.exceptions import AuthenticationError, ExternalServiceError
from src.config.config import config

logger = logging.getLogger(__name__)

class AuthService:
    """Service for handling authentication with Google OAuth2"""
    
    def __init__(self):
        self.client_config = {
            "web": {
                "client_id": config.GOOGLE_CLIENT_ID,
                "client_secret": config.GOOGLE_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [config.GOOGLE_REDIRECT_URI]
            }
        }
        
        # OAuth2 scopes
        self.scopes = [
            "openid",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile"
        ]
    
    def get_google_auth_url(self) -> str:
        """Generate Google OAuth2 authorization URL"""
        try:
            flow = Flow.from_client_config(
                self.client_config,
                scopes=self.scopes,
                redirect_uri=config.GOOGLE_REDIRECT_URI
            )
            
            # Generate state parameter for security
            state = secrets.token_urlsafe(16)
            
            auth_url, _ = flow.authorization_url(
                access_type='offline',
                include_granted_scopes='true',
                state=state,
                prompt='consent'
            )
            
            logger.info("Generated Google OAuth2 authorization URL")
            return auth_url
            
        except Exception as e:
            logger.error(f"Error generating auth URL: {str(e)}")
            raise ExternalServiceError("Google OAuth", "Failed to generate authorization URL")
    
    async def exchange_code_for_tokens(self, code: str) -> Dict[str, Any]:
        """Exchange authorization code for access tokens"""
        try:
            flow = Flow.from_client_config(
                self.client_config,
                scopes=self.scopes,
                redirect_uri=config.GOOGLE_REDIRECT_URI
            )
            
            flow.fetch_token(code=code)
            
            credentials = flow.credentials
            
            tokens = {
                "access_token": credentials.token,
                "refresh_token": credentials.refresh_token,
                "token_uri": credentials.token_uri,
                "client_id": credentials.client_id,
                "client_secret": credentials.client_secret,
                "scopes": credentials.scopes,
                "expires_at": credentials.expiry.isoformat() if credentials.expiry else None
            }
            
            logger.info("Successfully exchanged code for tokens")
            return tokens
            
        except Exception as e:
            logger.error(f"Error exchanging code for tokens: {str(e)}")
            raise ExternalServiceError("Google OAuth", "Failed to exchange authorization code")
    
    async def get_user_info(self, access_token: str) -> Dict[str, Any]:
        """Get user information from Google using access token"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    "https://www.googleapis.com/oauth2/v2/userinfo",
                    headers={"Authorization": f"Bearer {access_token}"}
                )
                
                if response.status_code != 200:
                    raise ExternalServiceError("Google API", f"User info request failed: {response.status_code}")
                
                user_info = response.json()
                
                # Normalize user info
                normalized_info = {
                    "id": user_info.get("id"),
                    "email": user_info.get("email"),
                    "name": user_info.get("name"),
                    "picture": user_info.get("picture"),
                    "verified_email": user_info.get("verified_email", False)
                }
                
                logger.info(f"Retrieved user info for {normalized_info.get('email')}")
                return normalized_info
                
        except httpx.HTTPError as e:
            logger.error(f"HTTP error getting user info: {str(e)}")
            raise ExternalServiceError("Google API", "Failed to retrieve user information")
        except Exception as e:
            logger.error(f"Error getting user info: {str(e)}")
            raise ExternalServiceError("Google API", "Failed to retrieve user information")
    
    def create_app_token(self, user_info: Dict[str, Any]) -> str:
        """Create JWT token for application use"""
        try:
            payload = {
                "user_id": user_info.get("id"),
                "email": user_info.get("email"),
                "name": user_info.get("name"),
                "picture": user_info.get("picture"),
                "verified_email": user_info.get("verified_email", False),
                "exp": datetime.utcnow() + timedelta(hours=1),  # 1 hour expiration
                "iat": datetime.utcnow(),
                "iss": config.APP_NAME
            }
            
            token = jwt.encode(payload, config.JWT_SECRET, algorithm="HS256")
            
            logger.info(f"Created app token for user {user_info.get('email')}")
            return token
            
        except Exception as e:
            logger.error(f"Error creating app token: {str(e)}")
            raise AuthenticationError("Failed to create authentication token")
    
    def validate_app_token(self, token: str) -> Dict[str, Any]:
        """Validate JWT token and return user info"""
        try:
            payload = jwt.decode(token, config.JWT_SECRET, algorithms=["HS256"])
            
            # Check expiration
            if datetime.utcnow() > datetime.fromtimestamp(payload['exp']):
                raise AuthenticationError("Token has expired")
            
            # Validate issuer
            if payload.get('iss') != config.APP_NAME:
                raise AuthenticationError("Invalid token issuer")
            
            user_info = {
                "id": payload.get("user_id"),
                "email": payload.get("email"),
                "name": payload.get("name"),
                "picture": payload.get("picture"),
                "verified_email": payload.get("verified_email", False)
            }
            
            return user_info
            
        except jwt.ExpiredSignatureError:
            raise AuthenticationError("Token has expired")
        except jwt.InvalidTokenError as e:
            logger.error(f"Invalid token error: {str(e)}")
            raise AuthenticationError("Invalid authentication token")
        except Exception as e:
            logger.error(f"Error validating token: {str(e)}")
            raise AuthenticationError("Token validation failed")
    
    def refresh_app_token(self, refresh_token: str) -> str:
        """Refresh application token using refresh token"""
        try:
            # This would implement token refresh logic
            # For now, just create a new token (simplified)
            # In production, you'd validate the refresh token and create new access token
            
            payload = {
                "refreshed": True,
                "exp": datetime.utcnow() + timedelta(hours=1),
                "iat": datetime.utcnow()
            }
            
            new_token = jwt.encode(payload, config.JWT_SECRET, algorithm="HS256")
            
            logger.info("Refreshed app token")
            return new_token
            
        except Exception as e:
            logger.error(f"Error refreshing token: {str(e)}")
            raise AuthenticationError("Failed to refresh authentication token")
