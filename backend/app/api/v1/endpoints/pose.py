"""
Pose detection endpoints
"""
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import cv2
import numpy as np
from typing import List

from app.db.session import get_db
from app.models.user import User
from app.models.pose_session import PoseSession
from app.schemas.pose import PoseSessionCreate, PoseSessionResponse
from app.services.pose_detector import PoseDetector
from app.api.v1.endpoints.users import get_current_user

router = APIRouter()
pose_detector = PoseDetector()


@router.post("/detect", response_model=dict)
async def detect_pose_from_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Detect pose from uploaded image"""
    # Read image
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if image is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image file"
        )
    
    # Detect pose
    result = pose_detector.detect(image)
    
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No pose detected in image"
        )
    
    return {
        "landmarks_3d": result['landmarks_3d'],
        "landmarks_world": result['landmarks_world'],
        "confidence": result['confidence']
    }


@router.post("/session", response_model=PoseSessionResponse, status_code=status.HTTP_201_CREATED)
async def create_pose_session(
    session_data: PoseSessionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new pose session"""
    new_session = PoseSession(
        user_id=current_user.id,
        session_type=session_data.session_type,
        landmarks_3d=session_data.landmarks_3d,
        landmarks_2d=session_data.landmarks_2d,
        confidence_score=session_data.confidence_score,
        duration_seconds=session_data.duration_seconds
    )
    
    db.add(new_session)
    await db.commit()
    await db.refresh(new_session)
    
    return new_session


@router.get("/sessions", response_model=List[PoseSessionResponse])
async def get_user_sessions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    limit: int = 10
):
    """Get user's pose sessions"""
    from sqlalchemy import select, desc
    
    result = await db.execute(
        select(PoseSession)
        .where(PoseSession.user_id == current_user.id)
        .order_by(desc(PoseSession.created_at))
        .limit(limit)
    )
    sessions = result.scalars().all()
    
    return sessions
