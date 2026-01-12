import React, { useState, useEffect } from 'react'
import api from '../utils/api'
import {
    Search,
    Filter,
    Clock,
    ChevronRight,
    Dumbbell,
    Tag,
    X,
    PlayCircle,
    Info,
    Loader2,
    Play
} from 'lucide-react'

export default function Exercises() {
    const [exercises, setExercises] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [selectedExercise, setSelectedExercise] = useState(null)

    useEffect(() => {
        fetchExercises()
    }, [])

    const fetchExercises = async () => {
        try {
            setLoading(true)
            const response = await api.get('/exercises/')
            setExercises(response.data)
        } catch (err) {
            console.error('Failed to fetch exercises:', err)
        } finally {
            setLoading(false)
        }
    }

    const filteredExercises = exercises.filter(ex => {
        const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ex.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ex.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

        const matchesCategory = selectedCategory === 'all' || ex.category === selectedCategory

        return matchesSearch && matchesCategory
    })

    const categories = ['all', 'stretching', 'strengthening', 'mobility']

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
            </div>
        )
    }

    return (
        <div className="p-6 max-w-7xl mx-auto pb-12">
            <header className="mb-12">
                <h1 className="text-4xl font-black text-white tracking-tight italic">
                    CORRECTIVE <span className="text-sky-400">EXERCISES</span>
                </h1>
                <p className="text-slate-500 mt-2 font-bold uppercase tracking-[0.2em] text-xs">Personalized routines for your posture improvement.</p>
            </header>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-6 mb-12">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-400 transition-colors w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search exercises or posture issues..."
                        className="input-field pl-12 h-14 bg-slate-900/50 border-slate-800 focus:bg-slate-900"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-6 py-2 rounded-2xl text-xs font-black transition-all capitalize whitespace-nowrap border-2 ${selectedCategory === cat
                                    ? 'bg-sky-500 border-sky-400 text-white shadow-lg shadow-sky-500/20'
                                    : 'bg-slate-800/50 text-slate-400 border-slate-800 hover:border-slate-700'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Exercises Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredExercises.map(ex => (
                    <div
                        key={ex.id}
                        className="card group hover:scale-[1.02] transition-all cursor-pointer border-slate-800/50 bg-[#0f172a]/80 backdrop-blur-xl hover:border-sky-500/30 hover:shadow-2xl hover:shadow-sky-500/5 p-0 overflow-hidden"
                        onClick={() => setSelectedExercise(ex)}
                    >
                        <div className="p-8 flex flex-col h-full relative">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-4 rounded-2xl ${ex.category === 'stretching' ? 'bg-indigo-500/10 text-indigo-400' :
                                        ex.category === 'strengthening' ? 'bg-emerald-500/10 text-emerald-400' :
                                            'bg-amber-500/10 text-amber-400'
                                    } border border-white/5`}>
                                    <Dumbbell className="w-6 h-6" />
                                </div>
                                <span className="px-3 py-1 bg-slate-800/80 text-slate-400 border border-slate-700 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                    {ex.difficulty}
                                </span>
                            </div>

                            <h3 className="text-xl font-black text-white mb-3 group-hover:text-sky-400 transition-colors uppercase tracking-tight">{ex.name}</h3>
                            <p className="text-slate-500 text-sm line-clamp-2 mb-8 flex-grow font-medium leading-relaxed">
                                {ex.description}
                            </p>

                            <div className="flex items-center gap-6 text-[10px] font-black text-slate-500 border-t border-slate-800 pt-6 uppercase tracking-widest">
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-sky-400" /> {ex.duration_minutes}m
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Tag className="w-3.5 h-3.5 text-indigo-400" /> {ex.target_areas.slice(0, 2).join(', ')}
                                </div>
                                <div className="ml-auto text-sky-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                    Details <Play className="w-3 h-3 ml-1 fill-current" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredExercises.length === 0 && (
                <div className="text-center py-24 bg-slate-900/30 rounded-3xl border-2 border-dashed border-slate-800">
                    <Info className="w-16 h-16 text-slate-800 mx-auto mb-6 opacity-50" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest">No matching routines found.</p>
                </div>
            )}

            {/* Exercise Detail Modal */}
            {selectedExercise && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020617]/90 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="bg-[#0f172a] rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-800/50 animate-in zoom-in-95 duration-300">
                        <div className="relative h-56 bg-gradient-to-br from-indigo-600 to-sky-600 flex items-center justify-center p-12 text-center text-white overflow-hidden">
                            {/* Decorative bubbles */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-sky-400/20 rounded-full blur-3xl -ml-16 -mb-16"></div>

                            <button
                                onClick={() => setSelectedExercise(null)}
                                className="absolute right-8 top-8 p-3 bg-black/20 hover:bg-black/40 rounded-2xl text-white transition-all transform hover:rotate-90"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="relative z-10">
                                <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">{selectedExercise.name}</h2>
                                <div className="flex justify-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] opacity-80">
                                    <span className="bg-white/10 px-3 py-1 rounded-full border border-white/5">{selectedExercise.category}</span>
                                    <span className="bg-white/10 px-3 py-1 rounded-full border border-white/5">{selectedExercise.difficulty}</span>
                                    <span className="bg-white/10 px-3 py-1 rounded-full border border-white/5">{selectedExercise.duration_minutes} mins</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-10 overflow-y-auto">
                            <div className="mb-10">
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Functional Goal</h4>
                                <p className="text-slate-300 text-lg leading-relaxed font-medium">
                                    {selectedExercise.description}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-6 mb-10">
                                <div className="p-6 bg-slate-900/50 rounded-3xl border border-slate-800/50">
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Target Reps</h4>
                                    <p className="text-3xl font-black text-white tracking-tighter">{selectedExercise.repetitions || '--'}</p>
                                </div>
                                <div className="p-6 bg-slate-900/50 rounded-3xl border border-slate-800/50">
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Target Sets</h4>
                                    <p className="text-3xl font-black text-white tracking-tighter">{selectedExercise.sets || '--'}</p>
                                </div>
                            </div>

                            <div className="mb-12">
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Execution Guide</h4>
                                <div className="space-y-6">
                                    {selectedExercise.instructions.map((step, i) => (
                                        <div key={i} className="flex gap-6 group">
                                            <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 text-sky-400 flex items-center justify-center font-black text-sm group-hover:bg-sky-500 group-hover:text-white group-hover:border-sky-400 transition-all duration-300">
                                                {i + 1}
                                            </div>
                                            <p className="text-slate-400 pt-2 font-medium leading-relaxed group-hover:text-slate-200 transition-colors">{step}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button className="flex-1 btn-primary py-5 flex items-center justify-center gap-3 shadow-2xl shadow-sky-500/20 text-sm uppercase tracking-widest">
                                    <PlayCircle className="w-6 h-6" /> Begin Routine
                                </button>
                                <button
                                    onClick={() => setSelectedExercise(null)}
                                    className="flex-1 px-8 py-5 bg-slate-800 text-slate-300 rounded-2xl font-black hover:bg-slate-700 transition-all text-sm uppercase tracking-widest border border-slate-700/50"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
