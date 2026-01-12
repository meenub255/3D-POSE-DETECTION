"""
API router for v1 endpoints
"""
from fastapi import APIRouter

from app.api.v1.endpoints import auth, users, pose, posture, exercises

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(pose.router, prefix="/pose", tags=["pose detection"])
api_router.include_router(posture.router, prefix="/posture", tags=["posture analysis"])
api_router.include_router(exercises.router, prefix="/exercises", tags=["exercises"])
