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
from app.services.exercise_analyzer import ExerciseAnalyzer
from app.services.ergonomics_analyzer import ErgonomicsAnalyzer
from app.services.activity_classifier import ActivityClassifier
from app.api.v1.endpoints.users import get_current_user
from app.api.deps import get_pose_detector
from app.tasks.pose_tasks import detect_pose_task
from celery.result import AsyncResult
import base64

router = APIRouter()


@router.post("/detect-async", status_code=status.HTTP_202_ACCEPTED)
async def detect_pose_async(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Trigger asynchronous pose detection"""
    contents = await file.read()
    image_b64 = base64.b64encode(contents).decode('utf-8')
    
    task = detect_pose_task.delay(image_b64)
    return {"job_id": task.id, "status": "Processing"}


@router.get("/task-status/{job_id}")
async def get_task_status(job_id: str):
    """Check status of a background task"""
    task_result = AsyncResult(job_id)
    return {
        "job_id": job_id,
        "status": task_result.status,
        "result": task_result.result if task_result.ready() else None
    }


@router.post("/detect", response_model=dict)
async def detect_pose_from_image(
    analysis_type: str = None,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    pose_detector: PoseDetector = Depends(get_pose_detector)
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
    
    response = {
        "landmarks_3d": result['landmarks_3d'],
        "landmarks_world": result['landmarks_world'],
        "confidence": result['confidence']
    }

    # Run exercise analysis if requested
    if analysis_type and result['landmarks_3d']:
        analyzer = ExerciseAnalyzer()
        analysis_result = {}
        
        if analysis_type.lower() == 'squat':
            analysis_result = analyzer.analyze_squat(result['landmarks_3d'])
        elif analysis_type.lower() == 'pushup':
            analysis_result = analyzer.analyze_pushup(result['landmarks_3d'])
        elif analysis_type.lower() == 'plank':
            analysis_result = analyzer.analyze_plank(result['landmarks_3d'])
        elif analysis_type.lower() == 'ergonomics':
            ergo_analyzer = ErgonomicsAnalyzer()
            analysis_result = ergo_analyzer.analyze(result['landmarks_3d'])
            
            
        if analysis_result:
            response['exercise_analysis'] = analysis_result

    # Always detect activity state
    if result['landmarks_3d']:
        activity_classifier = ActivityClassifier()
        response['detected_activity'] = activity_classifier.classify(result['landmarks_3d'])
            
    return response


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
