import numpy as np
from typing import Dict, List, Optional

class ActivityClassifier:
    """Classify user activity state (Standing, Sitting, Lying Down)"""

    LANDMARKS = {
        'nose': 0,
        'left_shoulder': 11, 'right_shoulder': 12,
        'left_hip': 23, 'right_hip': 24,
        'left_knee': 25, 'right_knee': 26,
        'left_ankle': 27, 'right_ankle': 28
    }

    def classify(self, landmarks: List[Dict]) -> str:
        """
        Classify the current activity based on pose geometry.
        Returns: "Standing", "Sitting", "Lying Down", or "Unknown"
        """
        points = self._to_numpy(landmarks)
        
        # Key metrics:
        # 1. Torso Alignment (Vertical vs Horizontal)
        # 2. Leg extension (Hip-Knee-Ankle)
        
        l_shoulder = points[self.LANDMARKS['left_shoulder']]
        r_shoulder = points[self.LANDMARKS['right_shoulder']]
        l_hip = points[self.LANDMARKS['left_hip']]
        r_hip = points[self.LANDMARKS['right_hip']]
        l_knee = points[self.LANDMARKS['left_knee']]
        r_knee = points[self.LANDMARKS['right_knee']]
        
        # 1. Torso angle (Shoulder midpoint to Hip midpoint)
        mid_shoulder = (l_shoulder + r_shoulder) / 2
        mid_hip = (l_hip + r_hip) / 2
        
        # Vector from Hip to Shoulder (Up vector)
        torso_vec = mid_shoulder - mid_hip
        
        # Angle with vertical (Y-axis is [0, 1, 0] in some systems, but normalized Y is down [0 -> 1])
        # In normalized coords:
        # Standing: Shoulder Y < Hip Y. vector is ~[0, -1, 0]
        # Lying: Shoulder Y ~ Hip Y. vector is ~[?, 0, ?]
        
        vertical_dist = abs(mid_shoulder[1] - mid_hip[1]) # Y distance
        horizontal_dist = abs(mid_shoulder[0] - mid_hip[0]) # X distance
        
        # Check Lying Down
        if vertical_dist < horizontal_dist:
            return "Lying Down"
        
        # If vertical, check Sitting vs Standing
        # Sitting: Significant hip flexion (thighs horizontal-ish)
        # Thigh vector: Hip to Knee
        l_thigh = l_knee - l_hip
        r_thigh = r_knee - r_hip
        
        # Check thigh verticality
        # Standing: Thigh is vertical (large Y diff, small Z diff?)
        # Sitting: Thigh is horizontal (small Y diff, large Z diff)
        
        l_thigh_y = abs(l_thigh[1])
        r_thigh_y = abs(r_thigh[1])
        
        # Threshold needs calibration. Normalized height of thigh ~0.2-0.3 usually.
        # If projected Y length is small, it's horizontal.
        if l_thigh_y < 0.15 and r_thigh_y < 0.15:
            return "Sitting"
            
        return "Standing"

    def _to_numpy(self, landmarks: List[Dict]) -> np.ndarray:
        return np.array([[lm['x'], lm['y'], lm['z']] for lm in landmarks])
