#!/usr/bin/env python3
"""
Movie models for GTM Game database
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, JSON, Text, Float
from sqlalchemy.sql import func

from src.core.database import Base

class Movie(Base):
    """Movie model for game content"""
    
    __tablename__ = "movies"
    
    id = Column(Integer, primary_key=True, index=True)
    tmdb_id = Column(Integer, unique=True, index=True, nullable=True)  # TMDB ID if available
    title = Column(String(255), nullable=False, index=True)
    original_title = Column(String(255), nullable=True)
    
    # Movie metadata
    year = Column(Integer, nullable=True)
    rating = Column(String(10), nullable=True)  # G, PG, PG-13, R, etc.
    runtime = Column(Integer, nullable=True)  # minutes
    language = Column(String(10), default="en")
    
    # Genre information (JSON array)
    genres = Column(JSON, default=[])
    
    # Plot and description
    overview = Column(Text, nullable=True)
    tagline = Column(Text, nullable=True)
    
    # Image paths
    image_path = Column(String(500), nullable=False)  # Path to screenshot
    poster_path = Column(String(500), nullable=True)
    backdrop_path = Column(String(500), nullable=True)
    
    # Difficulty settings
    difficulty_score = Column(Float, default=5.0)  # 1-10 scale
    is_active = Column(Boolean, default=True)
    
    # Usage statistics
    times_used = Column(Integer, default=0)
    correct_guess_rate = Column(Float, default=0.0)  # Percentage
    
    # Content flags
    is_family_friendly = Column(Boolean, default=True)
    content_warnings = Column(JSON, default=[])
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_used = Column(DateTime(timezone=True), nullable=True)
    
    def __repr__(self):
        return f"<Movie(id={self.id}, title={self.title}, year={self.year})>"

class MovieStats(Base):
    """Movie usage statistics"""
    
    __tablename__ = "movie_stats"
    
    id = Column(Integer, primary_key=True, index=True)
    movie_id = Column(Integer, nullable=False, index=True)
    
    # Usage tracking
    total_appearances = Column(Integer, default=0)
    correct_guesses = Column(Integer, default=0)
    incorrect_guesses = Column(Integer, default=0)
    
    # Average metrics
    avg_time_to_guess = Column(Float, default=0.0)  # seconds
    avg_round_when_guessed = Column(Float, default=0.0)
    
    # Difficulty metrics
    success_rate = Column(Float, default=0.0)  # percentage
    difficulty_rating = Column(Float, default=5.0)  # 1-10 scale
    
    # Genre performance (JSON)
    genre_performance = Column(JSON, default={})
    
    # Timestamps
    last_updated = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<MovieStats(movie_id={self.movie_id}, success_rate={self.success_rate})>"

class Genre(Base):
    """Genre model for categorization"""
    
    __tablename__ = "genres"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    slug = Column(String(100), unique=True, nullable=False)
    
    # Genre metadata
    description = Column(Text, nullable=True)
    color = Column(String(7), default="#007bff")  # Hex color
    icon = Column(String(50), nullable=True)
    
    # Usage statistics
    movie_count = Column(Integer, default=0)
    total_appearances = Column(Integer, default=0)
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<Genre(id={self.id}, name={self.name}, movie_count={self.movie_count})>"
