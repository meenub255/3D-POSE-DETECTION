"""
Exercise database model
"""
from sqlalchemy import Column, Integer, String, Text, JSON, Boolean
from datetime import datetime

from app.db.base_class import Base


class Exercise(Base):
    """Exercise model for corrective exercises"""
    __tablename__ = "exercises"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    category = Column(String)  # "stretching", "strengthening", "mobility"
    difficulty = Column(String)  # "beginner", "intermediate", "advanced"
    
    # Exercise details
    target_areas = Column(JSON)  # List of body areas targeted
    instructions = Column(JSON)  # Step-by-step instructions
    duration_minutes = Column(Integer)
    repetitions = Column(Integer, nullable=True)
    sets = Column(Integer, nullable=True)
    
    # Media
    video_url = Column(String, nullable=True)
    thumbnail_url = Column(String, nullable=True)
    
    # Metadata
    is_active = Column(Boolean, default=True)
    tags = Column(JSON)  # Searchable tags
