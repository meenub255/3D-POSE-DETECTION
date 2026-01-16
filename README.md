# 3D Pose Detection & Posture Analysis System

A comprehensive system for real-time 3D pose estimation, posture analysis, and corrective exercise recommendations.

## 🚀 Key Features

### 1. Advanced 3D Visualization
*   **Procedural Mannequin**: Replaces basic skeletons with a high-fidelity 3D robot avatar.
*   **Dynamic Metal/Robotic Aesthetics**: Visualized using Three.js with PBR materials.
*   **Real-Time Rendering**: Runs smoothly at 30+ FPS on standard CPUs.

### 2. Intelligent Analysis Modules
*   **Dynamic Exercise Form**:
    *   **Squat Analysis**: Monitors depth, knee tracking, and back angle.
    *   **Pushup Analysis**: Checks elbow depth and body alignment.
    *   **Plank Analysis**: Detects hip sagging or piking.
*   **Ergonomic Workstation Check**:
    *   **Distance Monitor**: Alerts if you are too close to the screen.
    *   **Tech Neck**: Detects forward head posture.
    *   **Slouch Detector**: Monitors shoulder rounding.
*   **Activity Recognition**:
    *   Automatically classifies user state: **Standing**, **Sitting**, or **Lying Down**.

### 3. Performance Control
*   **Dynamic FPS Slider**: Adjust tracking speed (1-30 FPS) in real-time to balance performance vs. battery life.

## 🛠 Tech Stack

### Backend
- **FastAPI**: High-performance Python web framework
- **MediaPipe**: 3D pose estimation
- **PostgreSQL**: Database for user data and pose history
- **Celery/Redis**: Asynchronous task processing

### Frontend
- **React**: Modern UI framework
- **Three.js (@react-three/fiber)**: 3D visualization
- **TailwindCSS**: Styling framework

## 📂 Project Structure

See the [File Structure](./FILE_STRUCTURE.md) for detailed organization.

## 🚦 Getting Started

### Prerequisites
- Python 3.9+
- Node.js 16+
- PostgreSQL 14+

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/meenub255/3D-POSE-DETECTION.git
   ```

2. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   # Start the server
   python main.py
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   # Start the UI
   npm run dev
   ```

4. **Access the App**
   Open http://localhost:3000

## 📝 Usage

1. Go to **Live Detection**.
2. **Select Mode**:
    *   **Free Mode**: Just visualize your 3D avatar.
    *   **Squat/Pushup/Plank**: Get rep counting and form correction.
    *   **Ergonomics**: Sit at your desk and let it check your posture.
3. **Adjust settings**: Use the FPS slider to tune performance.

## License

MIT
