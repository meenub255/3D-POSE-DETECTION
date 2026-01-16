"""
Asynchronous tasks for pose detection and analysis
"""
from app.core.celery_app import celery_app
from app.services.pose_detector import PoseDetector
from app.services.posture_analyzer import PostureAnalyzer
from app.core.logger import log as logger
import numpy as np
import cv2
import base64

@celery_app.task(name="detect_pose_task")
def detect_pose_task(image_b64: str):
    """
    Task to detect pose from a base64 encoded image
    """
    logger.info("Task started: detect_pose_task")
    try:
        # Decode image
        encoded_data = image_b64.split(',')[1] if ',' in image_b64 else image_b64
        nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            logger.error("Failed to decode image in task")
            return {"error": "Invalid image"}
            
        detector = PoseDetector()
        result = detector.detect(image)
        detector.close()
        
        if result is None:
            return {"error": "No pose detected"}
            
        return {
            "landmarks_3d": result['landmarks_3d'],
            "landmarks_world": result['landmarks_world'],
            "confidence": result['confidence']
        }
    except Exception as e:
        logger.exception(f"Error in detect_pose_task: {e}")
        return {"error": str(e)}

@celery_app.task(name="analyze_posture_task")
def analyze_posture_task(landmarks_3d: list):
    """
    Task to analyze posture from 3D landmarks
    """
    logger.info("Task started: analyze_posture_task")
    try:
        analyzer = PostureAnalyzer()
        result = analyzer.analyze(landmarks_3d)
        return result
    except Exception as e:
        logger.exception(f"Error in analyze_posture_task: {e}")
        return {"error": str(e)}
