import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    Activity,
    ArrowUpRight,
    Calendar,
    ChevronRight,
    Dumbbell,
    History,
    Plus,
    TrendingUp,
    User,
    AlertCircle,
    CheckCircle2,
    Loader2
} from 'lucide-react'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts'
import api from '../utils/api'

export default function Dashboard() {
    const navigate = useNavigate()
    const [stats, setStats] = useState({
        avgScore: 0,
        sessionsCount: 0,
        recentAnalyses: [],
        chartData: []
    })
    const [loading, setLoading] = useState(true)
    const [userName, setUserName] = useState('User')

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true)
                const userRes = await api.get('/users/me')
                setUserName(userRes.data.full_name || userRes.data.username)

                const historyRes = await api.get('/posture/history?limit=10')
                const history = historyRes.data

                if (history.length > 0) {
                    const avg = history.reduce((acc, curr) => acc + curr.posture_score, 0) / history.length
                    const chartData = history.slice().reverse().map(item => ({
                        date: new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
                        score: Math.round(item.posture_score)
                    }))

                    setStats({
                        avgScore: Math.round(avg),
                        sessionsCount: history.length,
                        recentAnalyses: history.slice(0, 3),
                        chartData: chartData
                    })
                }
            } catch (err) {
                console.error('Failed to fetch dashboard data:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchDashboardData()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
            </div>
        )
    }

    return (
        <div className="p-6 max-w-7xl mx-auto pb-12">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight">
                        Welcome back, <span className="text-sky-400">{userName}!</span>
                    </h1>
                    <p className="text-slate-400 mt-2 flex items-center gap-2 font-medium">
                        <Calendar className="w-4 h-4 text-sky-500" />
                        Today is {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <button
                    onClick={() => navigate('/live')}
                    className="btn-primary flex items-center gap-2 px-8 py-4"
                >
                    <Plus className="w-5 h-5" /> Start New Scan
                </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatCard
                    title="Average Posture"
                    value={`${stats.avgScore}%`}
                    icon={<Activity className="text-sky-400" />}
                    color="bg-sky-500/10"
                    trend={stats.avgScore > 75 ? "Excellent" : "Needs work"}
                />
                <StatCard
                    title="Total Sessions"
                    value={stats.sessionsCount}
                    icon={<History className="text-indigo-400" />}
                    color="bg-indigo-500/10"
                />
                <StatCard
                    title="Active Exercises"
                    value="4"
                    icon={<Dumbbell className="text-emerald-400" />}
                    color="bg-emerald-500/10"
                />
                <StatCard
                    title="Streak"
                    value="2 Days"
                    icon={<TrendingUp className="text-amber-400" />}
                    color="bg-amber-500/10"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Progress Chart */}
                <div className="lg:col-span-2 card p-8 bg-[#0f172a]/80 backdrop-blur-xl border-slate-800/50">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black text-white uppercase tracking-wider">Posture Progress</h3>
                        <Link to="/history" className="text-sm text-sky-400 font-bold flex items-center gap-1 hover:text-sky-300 transition-colors uppercase tracking-widest">
                            View Full History <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="h-[350px] w-full">
                        {stats.chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                                        dy={15}
                                    />
                                    <YAxis
                                        domain={[0, 100]}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                                        dx={-10}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#0f172a',
                                            borderRadius: '16px',
                                            border: '1px solid #1e293b',
                                            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                            color: '#f8fafc'
                                        }}
                                        itemStyle={{ color: '#0ea5e9', fontWeight: 'bold' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="score"
                                        stroke="#0ea5e9"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorScore)"
                                        animationDuration={2000}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-500 bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-800">
                                <Activity className="w-16 h-16 mb-4 opacity-10" />
                                <p className="font-bold">No data to visualize yet.</p>
                                <Link to="/live" className="text-sky-400 font-black mt-2 uppercase tracking-widest hover:text-sky-300 transition-colors">Begin your first session</Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Analyses & Quick Links */}
                <div className="space-y-8">
                    <div className="card p-8 bg-[#0f172a]/80 backdrop-blur-xl border-slate-800/50">
                        <h3 className="text-xl font-black text-white mb-8 uppercase tracking-wider">Recent Reports</h3>
                        <div className="space-y-6">
                            {stats.recentAnalyses.length > 0 ? (
                                stats.recentAnalyses.map((analysis) => (
                                    <div
                                        key={analysis.id}
                                        onClick={() => navigate('/analysis', { state: { analysis } })}
                                        className="flex items-center gap-5 p-4 rounded-2xl hover:bg-slate-800/50 transition-all cursor-pointer group border border-transparent hover:border-slate-700/50 shadow-lg hover:shadow-sky-500/5"
                                    >
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black ${analysis.posture_score >= 80 ? 'bg-emerald-500/10 text-emerald-400' :
                                                analysis.posture_score >= 60 ? 'bg-amber-500/10 text-amber-400' :
                                                    'bg-rose-500/10 text-rose-400'
                                            } border border-white/5`}>
                                            {Math.round(analysis.posture_score)}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-base font-bold text-slate-100 group-hover:text-sky-400 transition-colors line-clamp-1">
                                                {analysis.issues_detected.length > 0 ? analysis.issues_detected[0].name : "Excellent Posture"}
                                            </p>
                                            <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-widest">
                                                {new Date(analysis.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-500 italic text-center py-4 font-medium">
                                    Your analysis history will appear here.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="card p-8 bg-gradient-to-br from-indigo-600 to-sky-600 text-white shadow-2xl shadow-sky-500/20 border-white/10 overflow-hidden relative group">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                        <h3 className="text-xl font-black mb-4 flex items-center gap-2 uppercase tracking-wider">
                            <Dumbbell className="w-6 h-6" />
                            Daily Goal
                        </h3>
                        <p className="text-sky-50 text-sm mb-8 leading-relaxed font-medium">
                            Completing 10 minutes of stretches today can reduce neck strain by up to <span className="font-black text-white underline decoration-sky-300">20%</span>.
                        </p>
                        <Link
                            to="/exercises"
                            className="w-full py-4 bg-white text-indigo-700 rounded-2xl font-black block text-center hover:bg-sky-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/20 uppercase tracking-widest"
                        >
                            Open Exercises <ArrowUpRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatCard({ title, value, icon, color, trend }) {
    return (
        <div className="card p-8 hover:-translate-y-2 transition-all duration-300 border-slate-800/50 bg-[#0f172a]/80 backdrop-blur-xl group hover:shadow-sky-500/10 shadow-2xl">
            <div className="flex items-center gap-5 mb-6">
                <div className={`p-4 rounded-2xl ${color} border border-white/5 ring-4 ring-black/20 group-hover:scale-110 transition-transform duration-500`}>
                    {icon}
                </div>
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest leading-tight">{title}</h4>
            </div>
            <div className="flex items-end justify-between">
                <div>
                    <span className="text-4xl font-black text-white tracking-tighter">{value}</span>
                </div>
                {trend && (
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md border ${trend === "Excellent" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-800 text-slate-400 border-slate-700"
                        }`}>
                        {trend}
                    </span>
                )}
            </div>
        </div>
    )
}
