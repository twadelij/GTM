#!/usr/bin/env python3
"""
User service for GTM Game
Handles user management and database operations
"""
import logging
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func

from src.models.user import User, UserStats
from src.core.exceptions import AuthenticationError, ValidationError, DatabaseError
from src.config.config import config

logger = logging.getLogger(__name__)

class UserService:
    """Service for user management operations"""
    
    async def get_or_create_user(self, session: AsyncSession, user_info: Dict[str, Any]) -> User:
        """Get existing user or create new one from OAuth info"""
        try:
            # Check if user exists by Google ID
            stmt = select(User).where(User.google_id == user_info.get('id'))
            result = await session.execute(stmt)
            user = result.scalar_one_or_none()
            
            if user:
                # Update user info if needed
                if user.email != user_info.get('email') or user.name != user_info.get('name'):
                    await self.update_user_info(session, user, user_info)
                logger.info(f"Existing user found: {user.email}")
            else:
                # Create new user
                user = await self.create_user(session, user_info)
                logger.info(f"New user created: {user.email}")
            
            return user
            
        except Exception as e:
            logger.error(f"Error getting/creating user: {str(e)}")
            raise DatabaseError("Failed to get or create user")
    
    async def create_user(self, session: AsyncSession, user_info: Dict[str, Any]) -> User:
        """Create new user from OAuth info"""
        try:
            user = User(
                google_id=user_info.get('id'),
                email=user_info.get('email'),
                name=user_info.get('name'),
                picture=user_info.get('picture'),
                verified_email=user_info.get('verified_email', False),
                membership_tier='free',
                preferences={
                    'theme': 'light',
                    'difficulty': 'medium',
                    'sound_enabled': True,
                    'notifications_enabled': True
                }
            )
            
            session.add(user)
            await session.flush()  # Get the user ID
            
            # Create user stats record
            user_stats = UserStats(
                user_id=user.id,
                games_played=0,
                total_score=0,
                best_score=0,
                average_score=0,
                favorite_genres=[],
                achievements=[],
                daily_games_played=0
            )
            
            session.add(user_stats)
            await session.commit()
            
            return user
            
        except Exception as e:
            logger.error(f"Error creating user: {str(e)}")
            await session.rollback()
            raise DatabaseError("Failed to create user")
    
    async def update_user_info(self, session: AsyncSession, user: User, user_info: Dict[str, Any]) -> User:
        """Update user information from OAuth"""
        try:
            user.email = user_info.get('email', user.email)
            user.name = user_info.get('name', user.name)
            user.picture = user_info.get('picture', user.picture)
            user.verified_email = user_info.get('verified_email', user.verified_email)
            
            await session.commit()
            return user
            
        except Exception as e:
            logger.error(f"Error updating user info: {str(e)}")
            await session.rollback()
            raise DatabaseError("Failed to update user info")
    
    async def get_user_by_id(self, session: AsyncSession, user_id: int) -> Optional[User]:
        """Get user by ID"""
        try:
            stmt = select(User).where(User.id == user_id)
            result = await session.execute(stmt)
            return result.scalar_one_or_none()
            
        except Exception as e:
            logger.error(f"Error getting user by ID: {str(e)}")
            raise DatabaseError("Failed to get user")
    
    async def get_user_by_email(self, session: AsyncSession, email: str) -> Optional[User]:
        """Get user by email"""
        try:
            stmt = select(User).where(User.email == email)
            result = await session.execute(stmt)
            return result.scalar_one_or_none()
            
        except Exception as e:
            logger.error(f"Error getting user by email: {str(e)}")
            raise DatabaseError("Failed to get user")
    
    async def update_user_preferences(self, session: AsyncSession, user_id: int, preferences: Dict[str, Any]) -> bool:
        """Update user preferences"""
        try:
            stmt = update(User).where(User.id == user_id).values(preferences=preferences)
            result = await session.execute(stmt)
            await session.commit()
            
            return result.rowcount > 0
            
        except Exception as e:
            logger.error(f"Error updating user preferences: {str(e)}")
            await session.rollback()
            raise DatabaseError("Failed to update user preferences")
    
    async def get_user_stats(self, session: AsyncSession, user_id: int) -> Optional[UserStats]:
        """Get user statistics"""
        try:
            stmt = select(UserStats).where(UserStats.user_id == user_id)
            result = await session.execute(stmt)
            return result.scalar_one_or_none()
            
        except Exception as e:
            logger.error(f"Error getting user stats: {str(e)}")
            raise DatabaseError("Failed to get user stats")
    
    async def update_user_stats(self, session: AsyncSession, user_id: int, game_score: int) -> bool:
        """Update user statistics after a game"""
        try:
            # Get current stats
            stmt = select(UserStats).where(UserStats.user_id == user_id)
            result = await session.execute(stmt)
            stats = result.scalar_one_or_none()
            
            if not stats:
                # Create stats if they don't exist
                stats = UserStats(
                    user_id=user_id,
                    games_played=0,
                    total_score=0,
                    best_score=0,
                    average_score=0
                )
                session.add(stats)
            
            # Update stats
            stats.games_played += 1
            stats.total_score += game_score
            stats.best_score = max(stats.best_score, game_score)
            stats.average_score = stats.total_score // stats.games_played if stats.games_played > 0 else 0
            
            await session.commit()
            return True
            
        except Exception as e:
            logger.error(f"Error updating user stats: {str(e)}")
            await session.rollback()
            raise DatabaseError("Failed to update user stats")
    
    async def check_daily_limit(self, session: AsyncSession, user_id: int) -> Dict[str, Any]:
        """Check if user has reached daily game limit"""
        try:
            user = await self.get_user_by_id(session, user_id)
            if not user:
                raise ValidationError("User not found")
            
            # Free users have daily limits
            if user.membership_tier == 'free':
                daily_limit = 10  # 10 games per day for free users
            else:
                daily_limit = 1000  # High limit for premium users
            
            stats = await self.get_user_stats(session, user_id)
            if not stats:
                return {
                    'can_play': True,
                    'games_played_today': 0,
                    'daily_limit': daily_limit,
                    'games_remaining': daily_limit
                }
            
            # Check if we need to reset daily counter
            from datetime import datetime, date
            today = date.today()
            last_reset = stats.last_daily_reset.date() if stats.last_daily_reset else None
            
            if last_reset != today:
                # Reset daily counter
                stats.daily_games_played = 0
                stats.last_daily_reset = datetime.now()
                await session.commit()
            
            games_remaining = max(0, daily_limit - stats.daily_games_played)
            
            return {
                'can_play': games_remaining > 0,
                'games_played_today': stats.daily_games_played,
                'daily_limit': daily_limit,
                'games_remaining': games_remaining
            }
            
        except Exception as e:
            logger.error(f"Error checking daily limit: {str(e)}")
            raise DatabaseError("Failed to check daily limit")
    
    async def increment_daily_games(self, session: AsyncSession, user_id: int) -> bool:
        """Increment daily games played counter"""
        try:
            stmt = update(UserStats).where(UserStats.user_id == user_id).values(
                daily_games_played=UserStats.daily_games_played + 1
            )
            result = await session.execute(stmt)
            await session.commit()
            
            return result.rowcount > 0
            
        except Exception as e:
            logger.error(f"Error incrementing daily games: {str(e)}")
            await session.rollback()
            raise DatabaseError("Failed to increment daily games")
