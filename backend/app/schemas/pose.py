"""
Pydantic schemas for pose detection
"""
from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime


class Landmark3D(BaseModel):
    x: float
    y: float
    z: float
    visibility: Optional[float] = None


class PoseData(BaseModel):
    landmarks: List[Landmark3D]
    confidence: float


class PoseSessionCreate(BaseModel):
    session_type: str
    landmarks_3d: List[Dict]
    landmarks_2d: Optional[List[Dict]] = None
    confidence_score: float
    duration_seconds: Optional[float] = None


class PoseSessionResponse(BaseModel):
    id: int
    user_id: int
    session_type: str
    confidence_score: float
    duration_seconds: Optional[float]
    created_at: datetime
    
    class Config:
        from_attributes = True
