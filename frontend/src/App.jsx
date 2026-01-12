import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'

// Pages
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import LiveDetection from './pages/LiveDetection'
import Analysis from './pages/Analysis'
import Exercises from './pages/Exercises'
import History from './pages/History'

// Components
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
    return (
        <Router>
            <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<Layout />}>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/live" element={<LiveDetection />} />
                        <Route path="/analysis" element={<Analysis />} />
                        <Route path="/exercises" element={<Exercises />} />
                        <Route path="/history" element={<History />} />
                    </Route>
                </Route>
            </Routes>
        </Router>
    )
}

export default App
