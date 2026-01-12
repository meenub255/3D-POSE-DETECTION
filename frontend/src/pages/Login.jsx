import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import api from '../utils/api'
import { Activity, Lock, User, Loader2, ArrowRight } from 'lucide-react'

export default function Login() {
    const navigate = useNavigate()
    const setAuth = useAuthStore((state) => state.setAuth)
    const [formData, setFormData] = useState({ username: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const response = await api.post('/auth/login', formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            })

            const { access_token } = response.data

            const userResponse = await api.get('/users/me', {
                headers: { Authorization: `Bearer ${access_token}` },
            })

            setAuth(userResponse.data, access_token)
            navigate('/dashboard')
        } catch (err) {
            setError(err.response?.data?.detail || 'Authentication failed. Please check your credentials.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#020617] text-slate-100 flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-500/5 rounded-full blur-[120px] -mr-64 -mt-64"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] -ml-64 -mb-64"></div>

            <div className="max-w-md w-full relative z-10">
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-6">
                        <div className="p-5 bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl relative group">
                            <div className="absolute inset-0 bg-sky-500/20 blur-2xl group-hover:bg-sky-500/40 transition-all"></div>
                            <Activity className="w-12 h-12 text-sky-400 relative z-10 animate-pulse-slow" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                        ANTI-GRAVITY
                    </h1>
                    <p className="text-slate-500 mt-3 font-bold uppercase tracking-[0.2em] text-xs">Login to your physiological portal</p>
                </div>

                <div className="card bg-[#0f172a]/80 backdrop-blur-2xl border-slate-800/50 p-10 shadow-3xl">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {error && (
                            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-5 py-4 rounded-2xl text-xs font-bold uppercase tracking-wide animate-in slide-in-from-top-2">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                                Username
                            </label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-sky-400 transition-colors" />
                                <input
                                    type="text"
                                    required
                                    className="input-field pl-12 h-14"
                                    placeholder="your_username"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                                Password
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-sky-400 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    className="input-field pl-12 h-14"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-5 flex items-center justify-center gap-3 shadow-2xl shadow-sky-500/20 text-sm uppercase tracking-widest font-black group transition-all"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Authorize Access
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-slate-800/50 text-center">
                        <p className="text-sm text-slate-500 font-medium">
                            New to the system?{' '}
                            <Link to="/register" className="text-sky-400 hover:text-sky-300 font-black uppercase tracking-widest transition-colors ml-2">
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="mt-8 text-center text-[10px] font-black text-slate-700 uppercase tracking-[0.3em]">
                    SECURED ACCESS • VERSION 2.0.4
                </p>
            </div>
        </div>
    )
}
