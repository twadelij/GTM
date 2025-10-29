#!/usr/bin/env python3
"""
Database configuration and initialization for GTM Game
Following 12-factor principles - treat database as attached resource
"""
import logging
from typing import AsyncGenerator

from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from src.config.config import config

logger = logging.getLogger(__name__)

# Database base class for models
Base = declarative_base()

# Async engine for database operations
async_engine = create_async_engine(
    config.DATABASE_URL.replace('postgresql://', 'postgresql+asyncpg://'),
    echo=config.DEBUG,  # Log SQL in development
    future=True,
    pool_pre_ping=True,
    pool_recycle=300
)

# Async session factory
AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Sync engine for migrations (if needed)
sync_engine = create_engine(
    config.DATABASE_URL,
    echo=config.DEBUG,
    pool_pre_ping=True,
    pool_recycle=300
)

# Sync session factory
SessionLocal = sessionmaker(
    bind=sync_engine,
    autocommit=False,
    autoflush=False
)

async def init_db() -> None:
    """Initialize database tables"""
    try:
        async with async_engine.begin() as conn:
            # Import all models to ensure they're registered
            from src.models.user import User
            from src.models.game import GameSession, GameResult
            from src.models.movie import Movie
            
            # Create all tables
            await conn.run_sync(Base.metadata.create_all)
            
        logger.info("Database tables initialized successfully")
        
    except Exception as e:
        logger.error(f"Database initialization failed: {str(e)}")
        raise

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency to get database session"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception as e:
            await session.rollback()
            raise
        finally:
            await session.close()

def get_sync_db():
    """Get synchronous database session (for migrations)"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def close_db() -> None:
    """Close database connections"""
    await async_engine.dispose()
    sync_engine.dispose()
    logger.info("Database connections closed")

# Database health check
async def check_db_health() -> bool:
    """Check if database is accessible"""
    try:
        async with AsyncSessionLocal() as session:
            await session.execute("SELECT 1")
        return True
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
        return False
