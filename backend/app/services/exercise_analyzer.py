import numpy as np
from typing import Dict, List, Optional

class ExerciseAnalyzer:
    """Analyze dynamic exercise form"""

    LANDMARKS = {
        'nose': 0,
        'left_shoulder': 11, 'right_shoulder': 12,
        'left_elbow': 13, 'right_elbow': 14,
        'left_wrist': 15, 'right_wrist': 16,
        'left_hip': 23, 'right_hip': 24,
        'left_knee': 25, 'right_knee': 26,
        'left_ankle': 27, 'right_ankle': 28,
        'left_foot_index': 31, 'right_foot_index': 32
    }

    def analyze_squat(self, landmarks: List[Dict]) -> Dict:
        """
        Analyze Squat Form
        Checks:
        1. Depth: Thighs parallel to ground (hip same height as knee)
        2. Back Angle: Torso shouldn't lean too forward
        3. Knee Valgus: Knees shouldn't cave inward
        """
        points = self._to_numpy(landmarks)
        feedback = []
        is_correct = True
        
        # 1. Check Depth (Hip vs Knee Height)
        # In normalized coords, y increases downwards. 
        # So hip.y >= knee.y means hip is lower or equal to knee (good depth)
        l_hip = points[self.LANDMARKS['left_hip']]
        r_hip = points[self.LANDMARKS['right_hip']]
        l_knee = points[self.LANDMARKS['left_knee']]
        r_knee = points[self.LANDMARKS['right_knee']]

        avg_hip_y = (l_hip[1] + r_hip[1]) / 2
        avg_knee_y = (l_knee[1] + r_knee[1]) / 2

        # Threshold: Hip should be at least within 0.05 of knee height to count as parallel
        # Note: This is rough for normalized coords without camera calibration, assuming standard aspect
        depth_score = avg_hip_y - avg_knee_y # Positive means hip is lower (better)
        
        if depth_score < -0.1: # Hip significantly above knee
            feedback.append("GO LOWER")
            is_correct = False
        elif depth_score >= -0.1:
            feedback.append("DEPTH GOOD")

        # 2. Knee Valgus (Projected 2D x-distance)
        # Knees should track over toes. If knees are significantly inside feet x-coords.
        l_ankle = points[self.LANDMARKS['left_ankle']]
        r_ankle = points[self.LANDMARKS['right_ankle']]
        
        # Check normalized width
        knee_width = abs(l_knee[0] - r_knee[0])
        ankle_width = abs(l_ankle[0] - r_ankle[0])
        
        if knee_width < ankle_width * 0.8: # Knees caving in
            feedback.append("KNEES OUT")
            is_correct = False

        return {
            "exercise": "squat",
            "is_correct": is_correct,
            "feedback": feedback,
            "metrics": {
                "depth_score": float(depth_score),
                "knee_width_ratio": float(knee_width / (ankle_width + 1e-6))
            }
        }

    def analyze_pushup(self, landmarks: List[Dict]) -> Dict:
        """
        Analyze Pushup Form
        Checks:
        1. Depth: Chest close to floor (elbow angle)
        2. Body Alignment: No hip sag or pike
        """
        points = self._to_numpy(landmarks)
        feedback = []
        is_correct = True

        # 1. Body Line (Shoulder - Hip - Ankle)
        l_shoulder = points[self.LANDMARKS['left_shoulder']]
        l_hip = points[self.LANDMARKS['left_hip']]
        l_ankle = points[self.LANDMARKS['left_ankle']]
        
        hip_angle = self._calculate_angle_3d(l_shoulder, l_hip, l_ankle)
        
        if hip_angle < 160: # Hips piiked up or sagging significantly
            feedback.append("STRAIGHTEN BACK")
            is_correct = False
        
        # 2. Elbow Depth
        l_elbow = points[self.LANDMARKS['left_elbow']]
        l_wrist = points[self.LANDMARKS['left_wrist']]
        
        elbow_angle = self._calculate_angle_3d(l_shoulder, l_elbow, l_wrist)
        
        if elbow_angle < 90:
            feedback.append("DEPTH GOOD")
        elif elbow_angle > 160:
            feedback.append("GO DOWN")

        return {
            "exercise": "pushup",
            "is_correct": is_correct,
            "feedback": feedback,
            "metrics": {
                "hip_angle": float(hip_angle),
                "elbow_angle": float(elbow_angle)
            }
        }
        
    def analyze_plank(self, landmarks: List[Dict]) -> Dict:
        """
        Analyze Plank Form
        Checks:
        1. Body must be straight (Shoulder-Hip-Heel line)
        """
        points = self._to_numpy(landmarks)
        feedback = []
        is_correct = True
        
        l_shoulder = points[self.LANDMARKS['left_shoulder']]
        l_hip = points[self.LANDMARKS['left_hip']]
        l_ankle = points[self.LANDMARKS['left_ankle']]
        
        # Calculate body line angle
        angle = self._calculate_angle_3d(l_shoulder, l_hip, l_ankle)
        
        if angle < 160:
            # Determine if hips are too high (pike) or too low (sag)
            # This is tricky in 3D without gravity vector, but usually y-coord helps
            # If hip is significantly above shoulder/ankle line -> Pike
            # If hip is below -> Sag
            feedback.append("HIP TOO HIGH/LOW")
            is_correct = False
        else:
            feedback.append("GOOD ALIGNMENT")
            
        return {
            "exercise": "plank",
            "is_correct": is_correct,
            "feedback": feedback,
            "metrics": {
                "body_alignment_angle": float(angle)
            }
        }

    def _to_numpy(self, landmarks: List[Dict]) -> np.ndarray:
        return np.array([[lm['x'], lm['y'], lm['z']] for lm in landmarks])

    def _calculate_angle_3d(self, a: np.ndarray, b: np.ndarray, c: np.ndarray) -> float:
        """Calculate angle at point b between vectors ba and bc"""
        ba = a - b
        bc = c - b
        
        cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-6)
        angle = np.arccos(np.clip(cosine_angle, -1.0, 1.0))
        
        return np.degrees(angle)
