#!/usr/bin/env python3
"""
Game API routes for GTM Game
Handles game logic, scoring, and sessions
"""
import logging
import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from src.api.routes.movies import get_random_movies
from src.core.exceptions import ValidationError, DatabaseError

logger = logging.getLogger(__name__)
router = APIRouter()

# Game session storage (in production, use Redis/database)
game_sessions = {}

class GameStartRequest(BaseModel):
    movie_count: int = 20
    player_name: Optional[str] = None

class GameAnswerRequest(BaseModel):
    session_id: str
    movie_id: str
    selected_answer: str
    time_taken: float  # seconds

class GameSession(BaseModel):
    session_id: str
    player_name: Optional[str]
    movies: List[Dict[str, Any]]
    current_round: int
    score: int
    started_at: datetime
    current_movie: Optional[Dict[str, Any]] = None

@router.post("/start", response_model=GameSession)
async def start_game(request: GameStartRequest):
    """Start a new game session"""
    try:
        # Validate request
        if request.movie_count < 1 or request.movie_count > 50:
            raise ValidationError("Movie count must be between 1 and 50")
        
        # Get random movies
        movies = await get_random_movies(request.movie_count)
        
        # Create game session
        session_id = str(uuid.uuid4())
        session = GameSession(
            session_id=session_id,
            player_name=request.player_name,
            movies=movies,
            current_round=1,
            started_at=datetime.now()
        )
        
        # Set first movie
        if movies:
            session.current_movie = movies[0]
        
        # Store session
        game_sessions[session_id] = session
        
        logger.info(f"Started new game session {session_id} with {request.movie_count} movies")
        
        return session
        
    except ValidationError:
        raise
    except Exception as e:
        logger.error(f"Error starting game: {str(e)}")
        raise DatabaseError("Failed to start game")

@router.get("/session/{session_id}", response_model=GameSession)
async def get_game_session(session_id: str):
    """Get current game session state"""
    try:
        if session_id not in game_sessions:
            raise ValidationError("Invalid session ID")
        
        return game_sessions[session_id]
        
    except ValidationError:
        raise
    except Exception as e:
        logger.error(f"Error getting game session: {str(e)}")
        raise DatabaseError("Failed to get game session")

@router.post("/answer")
async def submit_answer(request: GameAnswerRequest):
    """Submit answer for current round"""
    try:
        if request.session_id not in game_sessions:
            raise ValidationError("Invalid session ID")
        
        session = game_sessions[request.session_id]
        
        if not session.current_movie:
            raise ValidationError("No active movie in session")
        
        # Check answer
        correct_answer = session.current_movie.get('title', '')
        is_correct = request.selected_answer.strip().lower() == correct_answer.lower()
        
        # Calculate score based on round and time
        base_score = max(6 - session.current_round, 1)  # 5 points in round 1, 1 in round 5
        time_bonus = max(0, int(30 - request.time_taken)) if session.current_round < 6 else 0
        round_score = base_score + time_bonus if is_correct else 0
        
        if is_correct:
            session.score += round_score
        
        # Prepare result
        result = {
            "correct": is_correct,
            "correct_answer": correct_answer,
            "round_score": round_score,
            "total_score": session.score,
            "round": session.current_round,
            "time_taken": request.time_taken,
            "time_bonus": time_bonus if is_correct else 0
        }
        
        # Move to next round or end game
        session.current_round += 1
        
        if session.current_round <= len(session.movies):
            session.current_movie = session.movies[session.current_round - 1]
        else:
            session.current_movie = None  # Game over
        
        logger.info(f"Session {request.session_id}: Answer submitted, "
                   f"correct={is_correct}, score={session.score}")
        
        return result
        
    except ValidationError:
        raise
    except Exception as e:
        logger.error(f"Error submitting answer: {str(e)}")
        raise DatabaseError("Failed to submit answer")

@router.get("/round/{session_id}")
async def get_next_round(session_id: str):
    """Get next round movie and options"""
    try:
        if session_id not in game_sessions:
            raise ValidationError("Invalid session ID")
        
        session = game_sessions[session_id]
        
        if not session.current_movie:
            # Game over
            return {
                "game_over": True,
                "final_score": session.score,
                "total_rounds": len(session.movies),
                "session_id": session_id
            }
        
        # Generate answer options (correct + wrong answers)
        current_movie = session.current_movie
        correct_title = current_movie.get('title', '')
        
        # Get wrong answers from other movies
        wrong_movies = [m for m in session.movies if m.get('title') != correct_title]
        import random
        
        # Select wrong answers based on round
        wrong_count = max(6 - session.current_round, 1) - 1  # Total options minus correct
        wrong_answers = []
        
        if len(wrong_movies) >= wrong_count:
            wrong_answers = random.sample(wrong_movies, wrong_count)
        
        # Combine and shuffle options
        options = [correct_title] + [m.get('title', '') for m in wrong_answers]
        random.shuffle(options)
        
        return {
            "game_over": False,
            "round": session.current_round,
            "movie_image": f"/data/movies/{current_movie.get('image', '')}",
            "options": options,
            "session_id": session_id,
            "current_score": session.score
        }
        
    except ValidationError:
        raise
    except Exception as e:
        logger.error(f"Error getting next round: {str(e)}")
        raise DatabaseError("Failed to get next round")

@router.delete("/session/{session_id}")
async def end_game_session(session_id: str):
    """End and clean up game session"""
    try:
        if session_id in game_sessions:
            session = game_sessions[session_id]
            logger.info(f"Ended game session {session_id}, final score: {session.score}")
            del game_sessions[session_id]
            return {"message": "Game session ended successfully"}
        else:
            raise ValidationError("Invalid session ID")
            
    except ValidationError:
        raise
    except Exception as e:
        logger.error(f"Error ending game session: {str(e)}")
        raise DatabaseError("Failed to end game session")

@router.get("/leaderboard")
async def get_leaderboard(limit: int = 10):
    """Get top scores (placeholder - would use database in production)"""
    try:
        # This is a placeholder implementation
        # In production, this would query the database for high scores
        
        completed_sessions = [
            {
                "player_name": session.player_name or "Anonymous",
                "score": session.score,
                "completed_at": datetime.now(),
                "movie_count": len(session.movies)
            }
            for session in game_sessions.values()
            if session.current_round > len(session.movies)  # Completed games
        ]
        
        # Sort by score descending
        completed_sessions.sort(key=lambda x: x["score"], reverse=True)
        
        return completed_sessions[:limit]
        
    except Exception as e:
        logger.error(f"Error getting leaderboard: {str(e)}")
        raise DatabaseError("Failed to get leaderboard")
