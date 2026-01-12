"""
3D Pose Detector using MediaPipe
"""
import cv2
import mediapipe as mp
import numpy as np
from typing import Optional, Dict, List, Tuple


class PoseDetector:
    """3D pose detection using MediaPipe Pose"""
    
    def __init__(
        self,
        static_image_mode: bool = False,
        model_complexity: int = 2,
        smooth_landmarks: bool = True,
        min_detection_confidence: float = 0.5,
        min_tracking_confidence: float = 0.5
    ):
        """
        Initialize MediaPipe Pose detector
        
        Args:
            static_image_mode: Whether to treat input as static images
            model_complexity: 0, 1, or 2 (higher = more accurate but slower)
            smooth_landmarks: Whether to smooth landmarks across frames
            min_detection_confidence: Minimum confidence for detection
            min_tracking_confidence: Minimum confidence for tracking
        """
        self.mp_pose = mp.solutions.pose
        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_drawing_styles = mp.solutions.drawing_styles
        
        self.pose = self.mp_pose.Pose(
            static_image_mode=static_image_mode,
            model_complexity=model_complexity,
            smooth_landmarks=smooth_landmarks,
            min_detection_confidence=min_detection_confidence,
            min_tracking_confidence=min_tracking_confidence
        )
    
    def detect(self, image: np.ndarray) -> Optional[Dict]:
        """
        Detect pose in an image
        
        Args:
            image: Input image (BGR format)
            
        Returns:
            Dictionary containing landmarks and metadata, or None if no pose detected
        """
        # Convert BGR to RGB
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Process the image
        results = self.pose.process(image_rgb)
        
        if not results.pose_landmarks:
            return None
        
        # Extract 3D landmarks
        landmarks_3d = []
        for landmark in results.pose_landmarks.landmark:
            landmarks_3d.append({
                'x': landmark.x,
                'y': landmark.y,
                'z': landmark.z,
                'visibility': landmark.visibility
            })
        
        # Extract 2D world landmarks
        landmarks_world = []
        if results.pose_world_landmarks:
            for landmark in results.pose_world_landmarks.landmark:
                landmarks_world.append({
                    'x': landmark.x,
                    'y': landmark.y,
                    'z': landmark.z,
                    'visibility': landmark.visibility
                })
        
        return {
            'landmarks_3d': landmarks_3d,
            'landmarks_world': landmarks_world,
            'raw_landmarks': results.pose_landmarks,
            'confidence': self._calculate_confidence(landmarks_3d)
        }
    
    def _calculate_confidence(self, landmarks: List[Dict]) -> float:
        """Calculate average confidence from landmark visibility scores"""
        if not landmarks:
            return 0.0
        
        visibilities = [lm['visibility'] for lm in landmarks]
        return sum(visibilities) / len(visibilities)
    
    def draw_landmarks(
        self,
        image: np.ndarray,
        landmarks,
        draw_connections: bool = True
    ) -> np.ndarray:
        """
        Draw pose landmarks on image
        
        Args:
            image: Input image
            landmarks: Pose landmarks from detection
            draw_connections: Whether to draw skeleton connections
            
        Returns:
            Image with drawn landmarks
        """
        annotated_image = image.copy()
        
        if draw_connections:
            self.mp_drawing.draw_landmarks(
                annotated_image,
                landmarks,
                self.mp_pose.POSE_CONNECTIONS,
                landmark_drawing_spec=self.mp_drawing_styles.get_default_pose_landmarks_style()
            )
        else:
            self.mp_drawing.draw_landmarks(
                annotated_image,
                landmarks,
                None
            )
        
        return annotated_image
    
    def close(self):
        """Release resources"""
        self.pose.close()
