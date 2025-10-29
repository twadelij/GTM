#!/usr/bin/env python3
"""
User models for GTM Game database
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, JSON, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from src.core.database import Base

class User(Base):
    """User model for authentication and profiles"""
    
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    google_id = Column(String(255), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    picture = Column(Text, nullable=True)
    verified_email = Column(Boolean, default=False)
    
    # Membership and monetization
    membership_tier = Column(String(50), default="free")  # free, premium, enterprise
    subscription_id = Column(String(255), nullable=True)
    subscription_expires = Column(DateTime(timezone=True), nullable=True)
    
    # User preferences (stored as JSON)
    preferences = Column(JSON, default={})
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    game_sessions = relationship("GameSession", back_populates="user")
    game_results = relationship("GameResult", back_populates="user")
    
    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, tier={self.membership_tier})>"

class UserStats(Base):
    """User statistics and achievements"""
    
    __tablename__ = "user_stats"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    
    # Game statistics
    games_played = Column(Integer, default=0)
    total_score = Column(Integer, default=0)
    best_score = Column(Integer, default=0)
    average_score = Column(Integer, default=0)
    
    # Genre preferences (JSON)
    favorite_genres = Column(JSON, default=[])
    
    # Achievements (JSON)
    achievements = Column(JSON, default=[])
    
    # Usage tracking
    daily_games_played = Column(Integer, default=0)
    last_daily_reset = Column(DateTime(timezone=True), server_default=func.now())
    
    # Timestamps
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<UserStats(user_id={self.user_id}, games_played={self.games_played})>"
