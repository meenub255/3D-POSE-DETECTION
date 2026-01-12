"""
Exercise endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.db.session import get_db
from app.models.exercise import Exercise
from app.schemas.exercise import ExerciseResponse, ExerciseCreate
from app.api.v1.endpoints.users import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=List[ExerciseResponse])
async def get_exercises(
    db: AsyncSession = Depends(get_db),
    category: str = None,
    difficulty: str = None,
    limit: int = 20
):
    """Get list of exercises with optional filters"""
    query = select(Exercise).where(Exercise.is_active == True)
    
    if category:
        query = query.where(Exercise.category == category)
    
    if difficulty:
        query = query.where(Exercise.difficulty == difficulty)
    
    query = query.limit(limit)
    
    result = await db.execute(query)
    exercises = result.scalars().all()
    
    return exercises


@router.get("/{exercise_id}", response_model=ExerciseResponse)
async def get_exercise(
    exercise_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific exercise by ID"""
    result = await db.execute(
        select(Exercise).where(Exercise.id == exercise_id)
    )
    exercise = result.scalar_one_or_none()
    
    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exercise not found"
        )
    
    return exercise


@router.post("/", response_model=ExerciseResponse, status_code=status.HTTP_201_CREATED)
async def create_exercise(
    exercise_data: ExerciseCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new exercise (admin only)"""
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create exercises"
        )
    
    new_exercise = Exercise(**exercise_data.dict())
    
    db.add(new_exercise)
    await db.commit()
    await db.refresh(new_exercise)
    
    return new_exercise
