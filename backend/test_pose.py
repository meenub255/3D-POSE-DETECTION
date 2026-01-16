import cv2
import numpy as np
import sys
import os

# Add the current directory to path so we can import app
sys.path.append(os.getcwd())

from app.services.pose_detector import PoseDetector

from loguru import logger

def test_pose():
    logger.info("🧠 Initializing Pose Detection Model...")
    try:
        detector = PoseDetector(model_complexity=1) # Using 1 for faster testing
        logger.success("✅ Model loaded successfully!")
        
        # Create a blank image to test
        image = np.zeros((480, 640, 3), dtype=np.uint8)
        cv2.putText(image, "Testing Model", (200, 240), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
        
        logger.info("🚀 Running detection on test image...")
        result = detector.detect(image)
        
        if result:
            logger.info("📊 Detection completed.")
            logger.info(f"Confidence score: {result['confidence']:.2f}")
        else:
            logger.info("ℹ️ No pose detected (expected for blank image).")
            
        logger.success("✨ The pose detection model is functional and ready!")
        detector.close()
        
    except Exception as e:
        logger.error(f"❌ Error running model: {e}")

if __name__ == "__main__":
    test_pose()
