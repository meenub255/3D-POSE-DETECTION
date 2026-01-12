# 3D Pose Detection System - File Structure

## Complete Project Structure

```
E:\3D pose detection\
│
├── README.md                          # Project documentation
├── .gitignore                         # Git ignore rules
│
├── backend/                           # FastAPI Backend
│   ├── main.py                        # Application entry point
│   ├── requirements.txt               # Python dependencies
│   ├── .env.example                   # Environment variables template
│   │
│   ├── app/
│   │   ├── __init__.py
│   │   │
│   │   ├── core/                      # Core configurations
│   │   │   ├── __init__.py
│   │   │   ├── config.py              # Settings & configuration
│   │   │   └── security.py            # JWT & password hashing
│   │   │
│   │   ├── db/                        # Database
│   │   │   ├── __init__.py
│   │   │   ├── base.py                # SQLAlchemy base
│   │   │   └── session.py             # Database session
│   │   │
│   │   ├── models/                    # Database models
│   │   │   ├── __init__.py
│   │   │   ├── user.py                # User model
│   │   │   ├── pose_session.py        # Pose session model
│   │   │   ├── posture_analysis.py    # Posture analysis model
│   │   │   └── exercise.py            # Exercise model
│   │   │
│   │   ├── schemas/                   # Pydantic schemas
│   │   │   ├── __init__.py
│   │   │   ├── user.py                # User schemas
│   │   │   ├── pose.py                # Pose schemas
│   │   │   ├── posture.py             # Posture schemas
│   │   │   └── exercise.py            # Exercise schemas
│   │   │
│   │   ├── api/                       # API routes
│   │   │   ├── __init__.py
│   │   │   └── v1/
│   │   │       ├── __init__.py
│   │   │       ├── router.py          # Main API router
│   │   │       └── endpoints/
│   │   │           ├── __init__.py
│   │   │           ├── auth.py        # Authentication endpoints
│   │   │           ├── users.py       # User endpoints
│   │   │           ├── pose.py        # Pose detection endpoints
│   │   │           ├── posture.py     # Posture analysis endpoints
│   │   │           └── exercises.py   # Exercise endpoints
│   │   │
│   │   └── services/                  # Business logic
│   │       ├── __init__.py
│   │       ├── pose_detector.py       # 3D pose detection (MediaPipe)
│   │       └── posture_analyzer.py    # Posture analysis logic
│   │
│   ├── alembic/                       # Database migrations
│   │   ├── versions/
│   │   └── env.py
│   │
│   ├── tests/                         # Backend tests
│   │   ├── __init__.py
│   │   ├── test_auth.py
│   │   ├── test_pose.py
│   │   └── test_posture.py
│   │
│   └── uploads/                       # File uploads directory
│
├── frontend/                          # React Frontend
│   ├── index.html                     # HTML entry point
│   ├── package.json                   # Node dependencies
│   ├── vite.config.js                 # Vite configuration
│   ├── tailwind.config.js             # Tailwind CSS config
│   ├── postcss.config.js              # PostCSS config
│   │
│   ├── public/                        # Static assets
│   │   └── vite.svg
│   │
│   └── src/
│       ├── main.jsx                   # React entry point
│       ├── App.jsx                    # Main App component
│       ├── index.css                  # Global styles
│       │
│       ├── pages/                     # Page components
│       │   ├── Login.jsx              # Login page
│       │   ├── Register.jsx           # Registration page
│       │   ├── Dashboard.jsx          # Dashboard
│       │   ├── LiveDetection.jsx      # Live pose detection
│       │   ├── Analysis.jsx           # Posture analysis results
│       │   ├── Exercises.jsx          # Exercise library
│       │   └── History.jsx            # User history
│       │
│       ├── components/                # Reusable components
│       │   ├── Layout.jsx             # Main layout
│       │   ├── ProtectedRoute.jsx     # Route guard
│       │   ├── Webcam.jsx             # Webcam component
│       │   ├── PoseVisualizer.jsx     # 3D pose visualization
│       │   ├── PostureCard.jsx        # Posture score card
│       │   └── ExerciseCard.jsx       # Exercise card
│       │
│       ├── store/                     # State management
│       │   ├── authStore.js           # Authentication state
│       │   └── poseStore.js           # Pose detection state
│       │
│       ├── utils/                     # Utilities
│       │   ├── api.js                 # Axios instance
│       │   └── helpers.js             # Helper functions
│       │
│       └── hooks/                     # Custom React hooks
│           ├── useWebcam.js           # Webcam hook
│           └── usePoseDetection.js    # Pose detection hook
│
├── models/                            # ML Models
│   ├── pretrained/                    # Pre-trained models
│   │   └── .gitkeep
│   └── custom/                        # Custom trained models
│       └── .gitkeep
│
├── data/                              # Data directory
│   ├── raw/                           # Raw data
│   ├── processed/                     # Processed data
│   └── .gitkeep
│
└── docs/                              # Documentation
    ├── API.md                         # API documentation
    ├── SETUP.md                       # Setup instructions
    └── ARCHITECTURE.md                # Architecture overview
```

## Key Features by Directory

### Backend (`/backend`)
- **FastAPI** REST API with async support
- **PostgreSQL** database with SQLAlchemy ORM
- **JWT** authentication
- **MediaPipe** for 3D pose detection
- **Posture analysis** algorithms
- **Exercise recommendation** system

### Frontend (`/frontend`)
- **React** with Vite for fast development
- **TailwindCSS** for styling
- **React Router** for navigation
- **Zustand** for state management
- **Three.js** for 3D visualization
- **Webcam integration** for live detection

### Services
- Real-time pose detection
- Posture scoring (0-100)
- Issue identification
- Exercise recommendations
- Progress tracking

## Next Steps

1. **Set up environment**:
   - Copy `.env.example` to `.env` and configure
   - Install PostgreSQL
   - Create database

2. **Install dependencies**:
   ```bash
   # Backend
   cd backend
   pip install -r requirements.txt
   
   # Frontend
   cd frontend
   npm install
   ```

3. **Run the application**:
   ```bash
   # Backend (from backend directory)
   python main.py
   
   # Frontend (from frontend directory)
   npm run dev
   ```

4. **Implement remaining features**:
   - Complete frontend pages
   - Add 3D visualization
   - Implement webcam integration
   - Add exercise database
   - Create progress tracking charts
