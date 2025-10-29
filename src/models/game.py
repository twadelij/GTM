#!/usr/bin/env python3
"""
Game models for GTM Game database
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, JSON, ForeignKey, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from src.core.database import Base

class GameSession(Base):
    """Game session model"""
    
    __tablename__ = "game_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(255), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # nullable for guest games
    
    # Game configuration
    movie_count = Column(Integer, default=20)
    difficulty_level = Column(String(50), default="medium")
    
    # Game state (JSON)
    movies = Column(JSON, nullable=False)  # List of movie IDs
    current_round = Column(Integer, default=1)
    current_movie_index = Column(Integer, default=0)
    
    # Score tracking
    score = Column(Integer, default=0)
    max_possible_score = Column(Integer, default=0)
    
    # Session status
    is_active = Column(Boolean, default=True)
    is_completed = Column(Boolean, default=False)
    
    # Timing
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    last_activity = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="game_sessions")
    game_results = relationship("GameResult", back_populates="game_session")
    
    def __repr__(self):
        return f"<GameSession(id={self.id}, session_id={self.session_id}, score={self.score})>"

class GameResult(Base):
    """Individual game results/rounds"""
    
    __tablename__ = "game_results"
    
    id = Column(Integer, primary_key=True, index=True)
    game_session_id = Column(Integer, ForeignKey("game_sessions.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Round information
    round_number = Column(Integer, nullable=False)
    movie_id = Column(String(255), nullable=False)
    
    # Answer details
    selected_answer = Column(String(255), nullable=False)
    correct_answer = Column(String(255), nullable=False)
    is_correct = Column(Boolean, nullable=False)
    
    # Scoring
    round_score = Column(Integer, default=0)
    time_taken = Column(Float, nullable=False)  # seconds
    time_bonus = Column(Integer, default=0)
    
    # Answer options shown (JSON)
    answer_options = Column(JSON, nullable=False)
    
    # Timestamp
    answered_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    game_session = relationship("GameSession", back_populates="game_results")
    user = relationship("User", back_populates="game_results")
    
    def __repr__(self):
        return f"<GameResult(session_id={self.game_session_id}, round={self.round_number}, correct={self.is_correct})>"

class Leaderboard(Base):
    """Leaderboard entries"""
    
    __tablename__ = "leaderboard"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # nullable for guest entries
    
    # Score information
    score = Column(Integer, nullable=False)
    games_played = Column(Integer, default=1)
    movie_count = Column(Integer, default=20)
    
    # Player info (for guest entries)
    player_name = Column(String(255), nullable=True)
    
    # Achievement metadata
    achievement_date = Column(DateTime(timezone=True), server_default=func.now())
    difficulty_level = Column(String(50), default="medium")
    
    # Relationships
    user = relationship("User")
    
    def __repr__(self):
        return f"<Leaderboard(id={self.id}, score={self.score}, player={self.player_name or 'User'})>"
