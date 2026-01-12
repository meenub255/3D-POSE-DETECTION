"""
Pydantic schemas for exercises
"""
from pydantic import BaseModel
from typing import List, Dict, Optional


class ExerciseBase(BaseModel):
    name: str
    description: str
    category: str
    difficulty: str
    target_areas: List[str]
    instructions: List[str]
    duration_minutes: int
    repetitions: Optional[int] = None
    sets: Optional[int] = None


class ExerciseCreate(ExerciseBase):
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    tags: Optional[List[str]] = None


class ExerciseResponse(ExerciseBase):
    id: int
    video_url: Optional[str]
    thumbnail_url: Optional[str]
    is_active: bool
    tags: Optional[List[str]]
    
    class Config:
        from_attributes = True
