import React from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import {
    Activity,
    AlertTriangle,
    CheckCircle,
    ChevronLeft,
    Info,
    RotateCcw,
    Trophy,
    TrendingUp,
    ArrowUpRight
} from 'lucide-react'
import {
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar
} from 'recharts'

export default function Analysis() {
    const location = useLocation()
    const navigate = useNavigate()
    const { analysis } = location.state || {}

    const handleSampleReport = () => {
        const sampleAnalysis = {
            id: 'sample',
            posture_score: 85,
            severity: 'low',
            created_at: new Date().toISOString(),
            recommendations: "Maintain your current alignment but focus on softening your shoulders during prolonged desk work.",
            angles: {
                neck_tilt: 12,
                shoulder_lean: 5,
                spine_curvature: 8,
                hip_alignment: 3
            },
            deviations: {
                forward_head: 0.05,
                rounded_shoulders: 0.08,
                lateral_tilt: 0.02
            },
            issues_detected: [
                { name: "Slight Forward Head", severity: 'low', description: "Minor forward positioning of the cervical spine." }
            ]
        }
        navigate('/analysis', { state: { analysis: sampleAnalysis } })
    }

    if (!analysis) {
        return (
            <div className="p-12 text-center bg-[#020617] min-h-[calc(100vh-200px)] flex flex-col items-center justify-center">
                <div className="p-8 bg-slate-900 border border-slate-800 rounded-[3rem] shadow-3xl mb-12 relative group">
                    <div className="absolute inset-0 bg-sky-500/10 blur-3xl group-hover:bg-sky-500/20 transition-all"></div>
                    <Activity className="w-24 h-24 text-sky-400 relative z-10 animate-pulse-slow" />
                </div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">DATASTREAM <span className="text-sky-400">OFFLINE</span></h2>
                <p className="text-slate-500 mt-4 font-bold uppercase tracking-widest text-xs max-w-md mx-auto leading-relaxed">
                    Awaiting physiological synchronization. Perform a live scan or view a sample report to initialize.
                </p>
                <div className="flex gap-4 mt-12">
                    <Link to="/live" className="btn-primary flex items-center gap-3 px-10 py-5">
                        Initialize Live Scan
                    </Link>
                    <button
                        onClick={handleSampleReport}
                        className="px-10 py-5 bg-slate-800 text-slate-300 rounded-2xl font-black hover:bg-slate-700 transition-all text-sm uppercase tracking-widest border border-slate-700/50"
                    >
                        View Sample Report
                    </button>
                </div>
            </div>
        )
    }

    const radarData = analysis.angles ? Object.entries(analysis.angles).map(([key, value]) => ({
        subject: key.replace(/_/g, ' '),
        A: value,
        fullMark: 180
    })) : []

    const deviations = analysis.deviations || {}

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-emerald-400'
        if (score >= 60) return 'text-amber-400'
        return 'text-rose-400'
    }

    return (
        <div className="p-6 max-w-7xl mx-auto pb-24">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-all font-bold uppercase tracking-widest text-xs group"
            >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Detection
            </button>

            <header className="mb-12">
                <h1 className="text-4xl font-black text-white tracking-tight">Posture <span className="text-sky-400">Analysis Report</span></h1>
                <p className="text-slate-500 mt-2 font-semibold uppercase tracking-widest text-xs">Generated on {new Date(analysis.created_at).toLocaleString()}</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Summary */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Score Card */}
                    <div className="card text-center p-12 bg-gradient-to-br from-[#0f172a] to-[#1e293b] border-slate-800/50 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.5)]"></div>
                        <h3 className="text-xs font-black text-slate-400 mb-6 uppercase tracking-[0.2em]">Overall Score</h3>
                        <div className={`text-8xl font-black mb-6 tracking-tighter transition-transform group-hover:scale-110 duration-500 ${getScoreColor(analysis.posture_score)}`}>
                            {Math.round(analysis.posture_score)}<span className="text-3xl opacity-50">%</span>
                        </div>
                        <div className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${analysis.severity === 'low' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            analysis.severity === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            }`}>
                            {analysis.severity} Risk Level
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div className="card p-8 bg-[#0f172a]/80 backdrop-blur-xl border-slate-800/50">
                        <h3 className="text-sm font-black text-white mb-8 flex items-center gap-2 uppercase tracking-widest">
                            <TrendingUp className="w-4 h-4 text-sky-400" />
                            Alignment Metrics
                        </h3>
                        <div className="space-y-6">
                            {Object.entries(deviations).map(([key, value]) => (
                                <div key={key} className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center text-xs font-bold">
                                        <span className="text-slate-400 capitalize">{key.replace(/_/g, ' ')}</span>
                                        <span className={value > 0.1 ? 'text-rose-400' : 'text-emerald-400'}>
                                            {(value * 100).toFixed(1)}% Deviation
                                        </span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-1000 ${value > 0.1 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                            style={{ width: `${Math.min(100, (value * 200))}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Details & Recommendations */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Detected Issues */}
                    <div className="card p-8 bg-[#0f172a]/80 backdrop-blur-xl border-slate-800/50">
                        <h3 className="text-sm font-black text-white mb-8 flex items-center gap-2 uppercase tracking-widest">
                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                            Detected Observations
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {analysis.issues_detected && analysis.issues_detected.length > 0 ? (
                                analysis.issues_detected.map((issue, i) => (
                                    <div key={i} className="flex gap-4 p-5 rounded-2xl bg-slate-900/50 border border-slate-800/50 hover:border-slate-700 transition-colors group">
                                        <div className={`mt-0.5 p-2 rounded-xl h-fit border border-white/5 ${issue.severity === 'high' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'
                                            }`}>
                                            <Info className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-100 uppercase tracking-wider text-xs">{issue.name}</h4>
                                            <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed">{issue.description}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-12 bg-emerald-500/5 rounded-3xl border border-emerald-500/10">
                                    <CheckCircle className="w-16 h-16 text-emerald-500/20 mx-auto mb-4" />
                                    <p className="font-black text-emerald-400 uppercase tracking-widest text-sm">Perfect Alignment!</p>
                                    <p className="text-xs text-slate-500 mt-1 font-medium">No postural issues detected in this session.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Joint Angles Radar Chart */}
                    <div className="card p-8 h-[450px] bg-[#0f172a]/80 backdrop-blur-xl border-slate-800/50">
                        <h3 className="text-sm font-black text-white mb-8 uppercase tracking-widest">Joint Kinematics</h3>
                        <div className="h-full w-full">
                            <ResponsiveContainer width="100%" height="90%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                    <PolarGrid stroke="#1e293b" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                                    <PolarRadiusAxis
                                        angle={30}
                                        domain={[0, 180]}
                                        axisLine={false}
                                        tick={false}
                                    />
                                    <Radar
                                        name="Current Pose"
                                        dataKey="A"
                                        stroke="#0ea5e9"
                                        strokeWidth={3}
                                        fill="#0ea5e9"
                                        fillOpacity={0.3}
                                        animationDuration={1500}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Recommendations & Exercises */}
                    <div className="card p-10 bg-gradient-to-br from-indigo-600 to-sky-600 text-white shadow-2xl shadow-sky-500/20 border-white/10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-white/10 rounded-2xl border border-white/10 shadow-inner">
                                <Trophy className="w-8 h-8 text-amber-300" />
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-tighter">Your Action Plan</h3>
                        </div>
                        <p className="text-sky-50 leading-relaxed mb-10 text-xl font-medium italic border-l-4 border-sky-300 pl-6 py-2">
                            "{analysis.recommendations}"
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={() => navigate('/exercises')}
                                className="px-8 py-4 bg-white text-indigo-700 rounded-2xl font-black hover:bg-sky-50 transition-all flex items-center gap-2 shadow-xl shadow-black/20 uppercase tracking-widest text-sm"
                            >
                                View Exercises <ArrowUpRight className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => navigate('/live')}
                                className="px-8 py-4 bg-indigo-500/50 text-white border border-white/20 rounded-2xl font-black hover:bg-indigo-500 transition-all flex items-center gap-2 uppercase tracking-widest text-sm"
                            >
                                <RotateCcw className="w-4 h-4" /> Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
