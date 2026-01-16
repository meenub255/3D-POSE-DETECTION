"""
Posture analysis endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.db.session import get_db
from app.models.user import User
from app.models.pose_session import PoseSession
from app.models.posture_analysis import PostureAnalysis
from app.schemas.posture import PostureAnalysisCreate, PostureAnalysisResponse
from app.services.posture_analyzer import PostureAnalyzer
from app.api.v1.endpoints.users import get_current_user
from app.api.deps import get_posture_analyzer
from app.tasks.pose_tasks import analyze_posture_task
from celery.result import AsyncResult

router = APIRouter()


@router.post("/analyze-async/{session_id}", status_code=status.HTTP_202_ACCEPTED)
async def analyze_posture_async(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Trigger asynchronous posture analysis"""
    result = await db.execute(
        select(PoseSession).where(
            PoseSession.id == session_id,
            PoseSession.user_id == current_user.id
        )
    )
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pose session not found"
        )
    
    task = analyze_posture_task.delay(session.landmarks_3d)
    return {"job_id": task.id, "status": "Processing"}


@router.post("/analyze/{session_id}", response_model=PostureAnalysisResponse, status_code=status.HTTP_201_CREATED)
async def analyze_posture(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    posture_analyzer: PostureAnalyzer = Depends(get_posture_analyzer)
):
    """Analyze posture from a pose session"""
    # Get pose session
    result = await db.execute(
        select(PoseSession).where(
            PoseSession.id == session_id,
            PoseSession.user_id == current_user.id
        )
    )
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pose session not found"
        )
    
    # Analyze posture
    analysis_result = posture_analyzer.analyze(session.landmarks_3d)
    
    # Create posture analysis record
    new_analysis = PostureAnalysis(
        user_id=current_user.id,
        pose_session_id=session_id,
        posture_score=analysis_result['posture_score'],
        issues_detected=analysis_result['issues_detected'],
        angles=analysis_result['angles'],
        deviations=analysis_result['alignment'],
        severity=analysis_result['severity'],
        recommendations=analysis_result['recommendations'],
        recommended_exercises=[]  # TODO: Map issues to exercises
    )
    
    db.add(new_analysis)
    await db.commit()
    await db.refresh(new_analysis)
    
    return new_analysis


@router.get("/history", response_model=List[PostureAnalysisResponse])
async def get_posture_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    limit: int = 10
):
    """Get user's posture analysis history"""
    from sqlalchemy import desc
    
    result = await db.execute(
        select(PostureAnalysis)
        .where(PostureAnalysis.user_id == current_user.id)
        .order_by(desc(PostureAnalysis.created_at))
        .limit(limit)
    )
    analyses = result.scalars().all()
    
    return analyses
