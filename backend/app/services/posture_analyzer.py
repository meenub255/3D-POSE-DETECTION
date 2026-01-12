"""
Posture analysis service
"""
import numpy as np
from typing import Dict, List, Tuple
import math


class PostureAnalyzer:
    """Analyze posture from 3D pose landmarks"""
    
    # MediaPipe pose landmark indices
    LANDMARKS = {
        'nose': 0,
        'left_eye_inner': 1,
        'left_eye': 2,
        'left_eye_outer': 3,
        'right_eye_inner': 4,
        'right_eye': 5,
        'right_eye_outer': 6,
        'left_ear': 7,
        'right_ear': 8,
        'mouth_left': 9,
        'mouth_right': 10,
        'left_shoulder': 11,
        'right_shoulder': 12,
        'left_elbow': 13,
        'right_elbow': 14,
        'left_wrist': 15,
        'right_wrist': 16,
        'left_pinky': 17,
        'right_pinky': 18,
        'left_index': 19,
        'right_index': 20,
        'left_thumb': 21,
        'right_thumb': 22,
        'left_hip': 23,
        'right_hip': 24,
        'left_knee': 25,
        'right_knee': 26,
        'left_ankle': 27,
        'right_ankle': 28,
        'left_heel': 29,
        'right_heel': 30,
        'left_foot_index': 31,
        'right_foot_index': 32
    }
    
    def __init__(self):
        """Initialize posture analyzer"""
        pass
    
    def analyze(self, landmarks_3d: List[Dict]) -> Dict:
        """
        Analyze posture from 3D landmarks
        
        Args:
            landmarks_3d: List of 3D landmark dictionaries
            
        Returns:
            Analysis results including score, issues, and recommendations
        """
        # Convert to numpy array for easier computation
        points = np.array([[lm['x'], lm['y'], lm['z']] for lm in landmarks_3d])
        
        # Calculate various posture metrics
        angles = self._calculate_angles(points)
        alignment = self._check_alignment(points)
        symmetry = self._check_symmetry(points)
        
        # Detect issues
        issues = self._detect_issues(angles, alignment, symmetry)
        
        # Calculate overall score
        score = self._calculate_score(issues)
        
        # Determine severity
        severity = self._determine_severity(score)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(issues)
        
        return {
            'posture_score': score,
            'angles': angles,
            'alignment': alignment,
            'symmetry': symmetry,
            'issues_detected': issues,
            'severity': severity,
            'recommendations': recommendations
        }
    
    def _calculate_angles(self, points: np.ndarray) -> Dict[str, float]:
        """Calculate important joint angles"""
        angles = {}
        
        # Neck angle (head tilt)
        angles['neck_forward'] = self._calculate_angle_3d(
            points[self.LANDMARKS['left_shoulder']],
            points[self.LANDMARKS['nose']],
            np.array([points[self.LANDMARKS['nose']][0], 0, points[self.LANDMARKS['nose']][2]])
        )
        
        # Shoulder angle
        angles['left_shoulder'] = self._calculate_angle_3d(
            points[self.LANDMARKS['left_elbow']],
            points[self.LANDMARKS['left_shoulder']],
            points[self.LANDMARKS['left_hip']]
        )
        
        angles['right_shoulder'] = self._calculate_angle_3d(
            points[self.LANDMARKS['right_elbow']],
            points[self.LANDMARKS['right_shoulder']],
            points[self.LANDMARKS['right_hip']]
        )
        
        # Hip angle
        angles['left_hip'] = self._calculate_angle_3d(
            points[self.LANDMARKS['left_knee']],
            points[self.LANDMARKS['left_hip']],
            points[self.LANDMARKS['left_shoulder']]
        )
        
        angles['right_hip'] = self._calculate_angle_3d(
            points[self.LANDMARKS['right_knee']],
            points[self.LANDMARKS['right_hip']],
            points[self.LANDMARKS['right_shoulder']]
        )
        
        # Knee angle
        angles['left_knee'] = self._calculate_angle_3d(
            points[self.LANDMARKS['left_ankle']],
            points[self.LANDMARKS['left_knee']],
            points[self.LANDMARKS['left_hip']]
        )
        
        angles['right_knee'] = self._calculate_angle_3d(
            points[self.LANDMARKS['right_ankle']],
            points[self.LANDMARKS['right_knee']],
            points[self.LANDMARKS['right_hip']]
        )
        
        return angles
    
    def _calculate_angle_3d(self, a: np.ndarray, b: np.ndarray, c: np.ndarray) -> float:
        """Calculate angle between three 3D points"""
        ba = a - b
        bc = c - b
        
        cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc))
        angle = np.arccos(np.clip(cosine_angle, -1.0, 1.0))
        
        return np.degrees(angle)
    
    def _check_alignment(self, points: np.ndarray) -> Dict[str, float]:
        """Check body alignment"""
        alignment = {}
        
        # Shoulder alignment (should be level)
        left_shoulder = points[self.LANDMARKS['left_shoulder']]
        right_shoulder = points[self.LANDMARKS['right_shoulder']]
        alignment['shoulder_tilt'] = abs(left_shoulder[1] - right_shoulder[1])
        
        # Hip alignment
        left_hip = points[self.LANDMARKS['left_hip']]
        right_hip = points[self.LANDMARKS['right_hip']]
        alignment['hip_tilt'] = abs(left_hip[1] - right_hip[1])
        
        # Spine alignment (vertical)
        mid_shoulder = (left_shoulder + right_shoulder) / 2
        mid_hip = (left_hip + right_hip) / 2
        alignment['spine_lean'] = abs(mid_shoulder[0] - mid_hip[0])
        
        return alignment
    
    def _check_symmetry(self, points: np.ndarray) -> Dict[str, float]:
        """Check left-right symmetry"""
        symmetry = {}
        
        # Shoulder height symmetry
        symmetry['shoulder_symmetry'] = abs(
            points[self.LANDMARKS['left_shoulder']][1] - 
            points[self.LANDMARKS['right_shoulder']][1]
        )
        
        # Hip height symmetry
        symmetry['hip_symmetry'] = abs(
            points[self.LANDMARKS['left_hip']][1] - 
            points[self.LANDMARKS['right_hip']][1]
        )
        
        return symmetry
    
    def _detect_issues(
        self,
        angles: Dict[str, float],
        alignment: Dict[str, float],
        symmetry: Dict[str, float]
    ) -> List[Dict]:
        """Detect posture issues based on metrics"""
        issues = []
        
        # Forward head posture
        if angles['neck_forward'] < 70:
            issues.append({
                'name': 'Forward Head Posture',
                'severity': 'medium' if angles['neck_forward'] > 60 else 'high',
                'description': 'Your head is tilted forward, which can cause neck strain',
                'affected_joints': ['neck', 'upper_back']
            })
        
        # Rounded shoulders
        if angles['left_shoulder'] < 160 or angles['right_shoulder'] < 160:
            issues.append({
                'name': 'Rounded Shoulders',
                'severity': 'medium',
                'description': 'Your shoulders are rounded forward',
                'affected_joints': ['shoulders', 'upper_back']
            })
        
        # Shoulder asymmetry
        if symmetry['shoulder_symmetry'] > 0.05:
            issues.append({
                'name': 'Shoulder Asymmetry',
                'severity': 'low',
                'description': 'Your shoulders are not level',
                'affected_joints': ['shoulders']
            })
        
        # Hip asymmetry
        if symmetry['hip_symmetry'] > 0.05:
            issues.append({
                'name': 'Hip Asymmetry',
                'severity': 'low',
                'description': 'Your hips are not level',
                'affected_joints': ['hips', 'lower_back']
            })
        
        # Spine lean
        if alignment['spine_lean'] > 0.1:
            issues.append({
                'name': 'Lateral Spine Lean',
                'severity': 'medium',
                'description': 'Your spine is leaning to one side',
                'affected_joints': ['spine', 'core']
            })
        
        return issues
    
    def _calculate_score(self, issues: List[Dict]) -> float:
        """Calculate overall posture score (0-100)"""
        if not issues:
            return 100.0
        
        # Deduct points based on severity
        score = 100.0
        severity_weights = {
            'low': 5,
            'medium': 15,
            'high': 25
        }
        
        for issue in issues:
            score -= severity_weights.get(issue['severity'], 10)
        
        return max(0.0, score)
    
    def _determine_severity(self, score: float) -> str:
        """Determine overall severity level"""
        if score >= 80:
            return 'low'
        elif score >= 60:
            return 'medium'
        else:
            return 'high'
    
    def _generate_recommendations(self, issues: List[Dict]) -> str:
        """Generate text recommendations based on issues"""
        if not issues:
            return "Your posture looks great! Keep maintaining good alignment."
        
        recommendations = []
        
        for issue in issues:
            if issue['name'] == 'Forward Head Posture':
                recommendations.append("Practice chin tucks and neck stretches to improve head alignment.")
            elif issue['name'] == 'Rounded Shoulders':
                recommendations.append("Perform shoulder blade squeezes and chest stretches.")
            elif issue['name'] == 'Shoulder Asymmetry':
                recommendations.append("Focus on unilateral exercises to balance shoulder strength.")
            elif issue['name'] == 'Hip Asymmetry':
                recommendations.append("Work on hip mobility and core strengthening exercises.")
            elif issue['name'] == 'Lateral Spine Lean':
                recommendations.append("Strengthen your core and practice side planks.")
        
        return " ".join(recommendations)
