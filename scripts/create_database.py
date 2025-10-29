#!/usr/bin/env python3
"""
Database creation and initialization script for GTM Game
Following 12-factor principles - treat database as attached resource
"""
import asyncio
import logging
import sys
import os

# Add src directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from sqlalchemy import text
from src.core.database import init_db, async_engine, check_db_health
from src.config.config import config

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

async def create_database():
    """Create database if it doesn't exist"""
    try:
        # Extract database info from URL
        db_info = config.get_database_config()
        db_name = db_info['database']
        db_user = db_info['user']
        db_password = db_info['password']
        db_host = db_info['host']
        db_port = db_info['port']
        
        # Connect to postgres database to create our database
        postgres_url = f"postgresql+asyncpg://{db_user}:{db_password}@{db_host}:{db_port}/postgres"
        
        from sqlalchemy.ext.asyncio import create_async_engine
        temp_engine = create_async_engine(postgres_url)
        
        async with temp_engine.connect() as conn:
            # Check if database exists
            result = await conn.execute(
                text("SELECT 1 FROM pg_database WHERE datname = :db_name"),
                {"db_name": db_name}
            )
            
            if not result.fetchone():
                logger.info(f"Creating database: {db_name}")
                await conn.execute(text(f'CREATE DATABASE "{db_name}"'))
                await conn.commit()
                logger.info(f"Database {db_name} created successfully")
            else:
                logger.info(f"Database {db_name} already exists")
        
        await temp_engine.dispose()
        
    except Exception as e:
        logger.error(f"Error creating database: {str(e)}")
        raise

async def run_migrations():
    """Run database migrations using Alembic"""
    try:
        import subprocess
        
        logger.info("Running database migrations...")
        
        # Run alembic upgrade head
        result = subprocess.run(
            ["alembic", "upgrade", "head"],
            cwd=os.path.dirname(__file__).parent,
            capture_output=True,
            text=True
        )
        
        if result.returncode != 0:
            logger.error(f"Migration failed: {result.stderr}")
            raise Exception("Database migration failed")
        
        logger.info("Database migrations completed successfully")
        logger.info(result.stdout)
        
    except Exception as e:
        logger.error(f"Error running migrations: {str(e)}")
        raise

async def seed_data():
    """Seed initial data for the application"""
    try:
        from src.models.movie import Movie, Genre
        from sqlalchemy.ext.asyncio import AsyncSession
        
        logger.info("Seeding initial data...")
        
        async with AsyncSession(async_engine) as session:
            # Check if genres already exist
            result = await session.execute(text("SELECT COUNT(*) FROM genres"))
            genre_count = result.scalar()
            
            if genre_count == 0:
                # Insert default genres
                default_genres = [
                    {"name": "Action", "slug": "action", "color": "#dc3545"},
                    {"name": "Comedy", "slug": "comedy", "color": "#ffc107"},
                    {"name": "Drama", "slug": "drama", "color": "#6f42c1"},
                    {"name": "Horror", "slug": "horror", "color": "#343a40"},
                    {"name": "Romance", "slug": "romance", "color": "#e83e8c"},
                    {"name": "Sci-Fi", "slug": "sci-fi", "color": "#20c997"},
                    {"name": "Thriller", "slug": "thriller", "color": "#fd7e14"},
                    {"name": "Animation", "slug": "animation", "color": "#28a745"},
                    {"name": "Documentary", "slug": "documentary", "color": "#17a2b8"},
                    {"name": "Family", "slug": "family", "color": "#6610f2"}
                ]
                
                for genre_data in default_genres:
                    genre = Genre(**genre_data)
                    session.add(genre)
                
                await session.commit()
                logger.info(f"Seeded {len(default_genres)} default genres")
            else:
                logger.info(f"Genres already exist ({genre_count} records)")
            
            # Note: Movie data will be loaded from existing JSON files
            # This is handled by the movie import script
            
        logger.info("Initial data seeding completed")
        
    except Exception as e:
        logger.error(f"Error seeding data: {str(e)}")
        raise

async def main():
    """Main database setup function"""
    try:
        logger.info("Starting database setup for GTM Game...")
        
        # Step 1: Create database
        await create_database()
        
        # Step 2: Run migrations
        await run_migrations()
        
        # Step 3: Initialize database schema
        await init_db()
        
        # Step 4: Seed initial data
        await seed_data()
        
        # Step 5: Verify database health
        is_healthy = await check_db_health()
        if is_healthy:
            logger.info("✅ Database setup completed successfully!")
            logger.info(f"Database: {config.DATABASE_URL}")
        else:
            logger.error("❌ Database health check failed")
            sys.exit(1)
            
    except Exception as e:
        logger.error(f"❌ Database setup failed: {str(e)}")
        sys.exit(1)
    finally:
        await async_engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
