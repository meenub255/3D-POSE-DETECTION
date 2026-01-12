"""
Posture analysis database model
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Float, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.base_class import Base


class PostureAnalysis(Base):
    """Posture analysis model for storing analysis results"""
    __tablename__ = "posture_analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    pose_session_id = Column(Integer, ForeignKey("pose_sessions.id"), nullable=False)
    
    # Analysis results
    posture_score = Column(Float)  # Overall posture score (0-100)
    issues_detected = Column(JSON)  # List of detected issues
    angles = Column(JSON)  # Joint angles
    deviations = Column(JSON)  # Deviations from ideal posture
    
    # Recommendations
    severity = Column(String)  # "low", "medium", "high"
    recommendations = Column(Text)
    recommended_exercises = Column(JSON)  # List of exercise IDs
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="posture_analyses")
    pose_session = relationship("PoseSession", back_populates="posture_analyses")
