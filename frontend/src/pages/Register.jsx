import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../utils/api'
import { Activity, User, Mail, Lock, Loader2, CheckCircle2, ArrowRight } from 'lucide-react'

export default function Register() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: ''
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match')
        }

        setLoading(true)

        try {
            await api.post('/auth/register', {
                full_name: formData.full_name,
                email: formData.email,
                username: formData.username,
                password: formData.password
            })

            setSuccess(true)
            setTimeout(() => {
                navigate('/login')
            }, 2000)
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed. Network error.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#020617] text-slate-100 flex items-center justify-center py-12 px-4 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] -ml-64 -mt-64"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-sky-500/5 rounded-full blur-[120px] -mr-64 -mb-64"></div>

            <div className="max-w-md w-full relative z-10">
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-6">
                        <div className="p-5 bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl relative group">
                            <div className="absolute inset-0 bg-indigo-500/20 blur-2xl group-hover:bg-indigo-500/40 transition-all"></div>
                            <Activity className="w-12 h-12 text-indigo-400 relative z-10" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                        CREATE <span className="text-indigo-400">PROFILE</span>
                    </h1>
                    <p className="text-slate-500 mt-3 font-bold uppercase tracking-[0.2em] text-xs">Initialize your posture tracking account</p>
                </div>

                <div className="card bg-[#0f172a]/80 backdrop-blur-2xl border-slate-800/50 p-10 shadow-3xl">
                    {success ? (
                        <div className="text-center py-12 animate-in fade-in zoom-in duration-500">
                            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-6 py-4 rounded-[2rem] mb-8 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3">
                                <CheckCircle2 className="w-5 h-5" />
                                Sequence Successful!
                            </div>
                            <p className="text-slate-400 font-medium">Redirecting to command center...</p>
                            <div className="mt-8 flex justify-center">
                                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wide">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Full Identity</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                    <input
                                        type="text"
                                        required
                                        className="input-field pl-12 h-14"
                                        placeholder="Full Name"
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Email Node</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                    <input
                                        type="email"
                                        required
                                        className="input-field pl-12 h-14"
                                        placeholder="email@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Username</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                    <input
                                        type="text"
                                        required
                                        className="input-field pl-12 h-14"
                                        placeholder="unique_handle"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                        <input
                                            type="password"
                                            required
                                            minLength={6}
                                            className="input-field pl-12 h-14"
                                            placeholder="••••••"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Confirm</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                        <input
                                            type="password"
                                            required
                                            className="input-field pl-12 h-14"
                                            placeholder="••••••"
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary py-5 mt-4 flex items-center justify-center gap-3 shadow-2xl shadow-indigo-500/20 text-sm uppercase tracking-widest font-black group transition-all"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Initialize Protocol
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    <div className="mt-10 pt-8 border-t border-slate-800/50 text-center">
                        <p className="text-sm text-slate-500 font-medium">
                            Already registered?{' '}
                            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-black uppercase tracking-widest transition-colors ml-2">
                                Authentication
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
