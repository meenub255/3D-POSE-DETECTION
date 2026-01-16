import numpy as np
from typing import Dict, List, Optional

class ErgonomicsAnalyzer:
    """Analyze workstation ergonomics"""

    LANDMARKS = {
        'nose': 0,
        'left_eye': 2, 'right_eye': 5,
        'left_ear': 7, 'right_ear': 8,
        'left_shoulder': 11, 'right_shoulder': 12,
    }

    def analyze(self, landmarks: List[Dict]) -> Dict:
        """
        Check for:
        1. Screen Distance (Too close?)
        2. Tech Neck (Looking down?)
        3. Slouching (Shoulders rolled forward?)
        """
        points = self._to_numpy(landmarks)
        feedback = []
        status = "good"
        
        # 1. Screen Distance Proxy
        # We assume standard webcam field of view. 
        # Metric: Distance between eyes (IPD) in normalized coordinates.
        # Larger IPD = Closer to camera.
        l_eye = points[self.LANDMARKS['left_eye']]
        r_eye = points[self.LANDMARKS['right_eye']]
        
        ipd = np.linalg.norm(l_eye[:2] - r_eye[:2])
        
        # Thresholds need calibration, but for a standard laptop webcam:
        # IPD > 0.15 is usually very close (< 40cm)
        # IPD < 0.05 is far (> 1m)
        distance_score = ipd
        
        if ipd > 0.15: # Too Close
            feedback.append("TOO CLOSE TO SCREEN")
            status = "warning"
        
        # 2. Tech Neck / Head Tilt
        # Angle of Nose-Ear line relative to vertical? Or simple Nose vs Shoulder Z-depth?
        # Better: Neck Flexion angle (Ear - Shoulder - Vertical)
        # Simplified: Check if Nose is significantly below Ears (Looking down) - tricky in 2D
        # Alternative: Cheek vertical angle.
        
        # Let's use Ear-Shoulder alignment.
        # In side view: Ear should be aligned with shoulder.
        # Forward Head Posture: Ear is Anterior (forward) of shoulder.
        # In normalized Z: Z becomes smaller (closer) as you move w.r.t Reference frame.
        # MediaPipe Z is relative to hip center usually.
        
        l_ear = points[self.LANDMARKS['left_ear']]
        l_shoulder = points[self.LANDMARKS['left_shoulder']]
        
        # High likelihood of forward head if Ear Z is significantly less (closer to cam) than Shoulder Z
        # diff > threshold
        forward_head_dist = l_shoulder[2] - l_ear[2] # Positive means Ear is closer to camera (if facing cam)
        
        if forward_head_dist > 0.1: # Significant forward head
            feedback.append("FORWARD HEAD POSTURE")
            status = "warning"
            
        # 3. Slouching (Shoulders)
        # Shoulders elevating or rounding?
        # Rounding: Shoulders Z much closer than Chest (hard to measure without chest point).
        # Elevation: Shoulders close to Ears in Y.
        
        ear_shoulder_dist_y = l_shoulder[1] - l_ear[1] # Y is down. Shoulder Y > Ear Y.
        
        if ear_shoulder_dist_y < 0.15: # Shoulders shrugged up
            feedback.append("RELAX SHOULDERS")
            status = "warning"

        return {
            "exercise": "ergonomics",
            "is_correct": status == "good",
            "feedback": feedback,
            "metrics": {
                "screen_distance_proxy": float(ipd),
                "head_forward_depth": float(forward_head_dist),
                "shoulder_elevation": float(ear_shoulder_dist_y)
            }
        }

    def _to_numpy(self, landmarks: List[Dict]) -> np.ndarray:
        return np.array([[lm['x'], lm['y'], lm['z']] for lm in landmarks])
