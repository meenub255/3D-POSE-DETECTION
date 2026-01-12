"""
Pose session database model
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Float
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.base_class import Base


class PoseSession(Base):
    """Pose session model for storing pose detection sessions"""
    __tablename__ = "pose_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_type = Column(String)  # "live", "upload", "analysis"
    landmarks_3d = Column(JSON)  # 3D pose landmarks
    landmarks_2d = Column(JSON)  # 2D pose landmarks
    confidence_score = Column(Float)
    duration_seconds = Column(Float)
    video_path = Column(String, nullable=True)
    thumbnail_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="pose_sessions")
    posture_analyses = relationship("PostureAnalysis", back_populates="pose_session", cascade="all, delete-orphan")
