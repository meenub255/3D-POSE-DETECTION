"""
Database base configuration
"""
from app.db.base_class import Base

# Import all models here for Alembic to detect them
from app.models.user import User
from app.models.pose_session import PoseSession
from app.models.posture_analysis import PostureAnalysis
from app.models.exercise import Exercise
