"""
API dependency providers
"""
from functools import lru_cache
from app.services.pose_detector import PoseDetector
from app.services.posture_analyzer import PostureAnalyzer

@lru_cache()
def get_pose_detector() -> PoseDetector:
    """Get or create singleton PoseDetector instance"""
    return PoseDetector()

@lru_cache()
def get_posture_analyzer() -> PostureAnalyzer:
    """Get or create singleton PostureAnalyzer instance"""
    return PostureAnalyzer()
