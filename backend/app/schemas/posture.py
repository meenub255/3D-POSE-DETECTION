"""
Pydantic schemas for posture analysis
"""
from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime


class PostureIssue(BaseModel):
    name: str
    severity: str
    description: str
    affected_joints: List[str]


class PostureAnalysisCreate(BaseModel):
    pose_session_id: int
    posture_score: float
    issues_detected: List[Dict]
    angles: Dict
    deviations: Dict
    severity: str
    recommendations: str
    recommended_exercises: List[int]


class PostureAnalysisResponse(BaseModel):
    id: int
    user_id: int
    pose_session_id: int
    posture_score: float
    issues_detected: List[Dict]
    angles: Dict
    deviations: Dict
    severity: str
    recommendations: str
    recommended_exercises: List[int]
    created_at: datetime
    
    class Config:
        from_attributes = True
