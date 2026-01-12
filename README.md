# 3D Pose Detection & Posture Analysis System

A comprehensive system for real-time 3D pose estimation, posture analysis, and corrective exercise recommendations.

## Features

- **Real-time 3D Pose Detection**: Capture and analyze body pose in 3D space
- **Posture Analysis**: Identify postural issues and deviations
- **Exercise Recommendations**: AI-powered suggestions for corrective exercises
- **Progress Tracking**: Monitor posture improvements over time
- **Multi-user Support**: User authentication and personalized tracking

## Tech Stack

### Backend
- **FastAPI**: High-performance Python web framework
- **PostgreSQL**: Database for user data and pose history
- **MediaPipe/OpenPose**: 3D pose estimation
- **PyTorch/TensorFlow**: Deep learning models

### Frontend
- **React**: Modern UI framework
- **Three.js**: 3D visualization
- **TailwindCSS**: Styling framework

## Project Structure

See the [File Structure](./FILE_STRUCTURE.md) for detailed organization.

## Getting Started

### Prerequisites
- Python 3.9+
- Node.js 16+
- PostgreSQL 14+

### Installation

1. Clone the repository
2. Install backend dependencies: `cd backend && pip install -r requirements.txt`
3. Install frontend dependencies: `cd frontend && npm install`
4. Set up environment variables (see `.env.example`)
5. Run database migrations
6. Start the development servers

## License

MIT
