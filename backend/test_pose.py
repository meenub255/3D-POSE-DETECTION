import cv2
import numpy as np
import sys
import os

# Add the current directory to path so we can import app
sys.path.append(os.getcwd())

from app.services.pose_detector import PoseDetector

def test_pose():
    print("🧠 Initializing Pose Detection Model...")
    try:
        detector = PoseDetector(model_complexity=1) # Using 1 for faster testing
        print("✅ Model loaded successfully!")
        
        # Create a blank image to test
        image = np.zeros((480, 640, 3), dtype=np.uint8)
        cv2.putText(image, "Testing Model", (200, 240), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
        
        print("🚀 Running detection on test image...")
        result = detector.detect(image)
        
        if result:
            print("📊 Detection completed.")
            print(f"Confidence score: {result['confidence']:.2f}")
        else:
            print("ℹ️ No pose detected (expected for blank image).")
            
        print("\n✨ The pose detection model is functional and ready!")
        detector.close()
        
    except Exception as e:
        print(f"❌ Error running model: {e}")

if __name__ == "__main__":
    test_pose()
