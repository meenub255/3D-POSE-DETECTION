import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Activity, Camera, History, Dumbbell, LogOut, User } from 'lucide-react'

export default function Layout() {
    const location = useLocation()
    const navigate = useNavigate()
    const { user, logout } = useAuthStore()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const navItems = [
        { path: '/dashboard', icon: Activity, label: 'Dashboard' },
        { path: '/live', icon: Camera, label: 'Live Detection' },
        { path: '/history', icon: History, label: 'History' },
        { path: '/exercises', icon: Dumbbell, label: 'Exercises' },
    ]

    return (
        <div className="min-h-screen bg-[#020617] text-slate-100">
            {/* Header */}
            <header className="bg-[#0f172a] border-b border-slate-800/50 sticky top-0 z-50 backdrop-blur-md bg-opacity-80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-2">
                            <Activity className="w-8 h-8 text-sky-500" />
                            <h1 className="text-xl font-bold bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent italic">
                                ANTI-GRAVITY
                            </h1>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50">
                                <User className="w-4 h-4 text-slate-400" />
                                <span className="text-xs font-semibold text-slate-200">{user?.username}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-2 text-slate-400 hover:text-white transition-all group"
                            >
                                <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                <span className="text-xs font-bold uppercase tracking-widest">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Navigation */}
            <nav className="bg-[#0f172a]/50 border-b border-slate-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const isActive = location.pathname === item.path

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`
                                        flex items-center space-x-2 px-3 py-4 border-b-2 transition-all duration-300
                                        ${isActive
                                            ? 'border-sky-500 text-sky-400 font-bold'
                                            : 'border-transparent text-slate-400 hover:text-slate-100 hover:border-slate-700'
                                        }
                                    `}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? 'animate-pulse-slow' : ''}`} />
                                    <span className="text-xs font-bold uppercase tracking-wider">{item.label}</span>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </nav>

            {/* Main content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>
        </div>
    )
}
