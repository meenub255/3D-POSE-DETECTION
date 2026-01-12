import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { History, Calendar, ChevronRight, Activity, Trash2, Filter, Loader2 } from 'lucide-react'
import api from '../utils/api'

export default function HistoryPage() {
    const navigate = useNavigate()
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setLoading(true)
                const response = await api.get('/posture/history?limit=50')
                setHistory(response.data)
            } catch (err) {
                console.error('Failed to fetch history:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchHistory()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
            </div>
        )
    }

    return (
        <div className="p-6 max-w-7xl mx-auto pb-24">
            <header className="mb-12 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight italic">
                        SCAN <span className="text-indigo-400">ARCHIVES</span>
                    </h1>
                    <p className="text-slate-500 mt-2 font-bold uppercase tracking-[0.2em] text-xs">Phased historical analysis of your posture evolution.</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-slate-700 transition-all flex items-center gap-2">
                        <Filter className="w-4 h-4" /> Filter Logs
                    </button>
                </div>
            </header>

            <div className="grid gap-6">
                {history.length > 0 ? (
                    history.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => navigate('/analysis', { state: { analysis: item } })}
                            className="card group hover:bg-slate-900/50 border-slate-800 p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 cursor-pointer transition-all hover:scale-[1.01] hover:border-slate-700"
                        >
                            <div className="flex items-center gap-8">
                                <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-2xl font-black ${item.posture_score >= 80 ? 'bg-emerald-500/10 text-emerald-400' :
                                        item.posture_score >= 60 ? 'bg-amber-500/10 text-amber-400' :
                                            'bg-rose-500/10 text-rose-400'
                                    } border border-white/5 ring-8 ring-black/10 group-hover:scale-110 transition-transform`}>
                                    {Math.round(item.posture_score)}%
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tight group-hover:text-sky-400 transition-colors">
                                        {item.issues_detected.length > 0 ? item.issues_detected[0].name : "Optimal Alignment"}
                                    </h3>
                                    <div className="flex items-center gap-6 mt-2">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                            <Calendar className="w-3.5 h-3.5 text-slate-600" />
                                            {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                            <Activity className="w-3.5 h-3.5 text-slate-600" />
                                            {item.severity} Risk
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="hidden lg:block text-right pr-6 border-r border-slate-800">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Observations</p>
                                    <p className="text-xs font-bold text-slate-300">{item.issues_detected.length} anomalies recorded</p>
                                </div>
                                <ChevronRight className="w-6 h-6 text-slate-700 group-hover:text-white group-hover:translate-x-2 transition-all" />
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-32 text-center bg-slate-900/20 rounded-[3rem] border-2 border-dashed border-slate-800">
                        <History className="w-20 h-20 text-slate-800 mx-auto mb-6 opacity-50" />
                        <h3 className="text-xl font-black text-slate-500 uppercase tracking-widest">No Archives Found</h3>
                        <p className="text-slate-600 mt-2 font-medium">Your physiological journey begins with your first scan.</p>
                        <button
                            onClick={() => navigate('/live')}
                            className="btn-primary mt-10 px-10 py-4 font-black uppercase tracking-widest text-xs"
                        >
                            Initiate First Scan
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
