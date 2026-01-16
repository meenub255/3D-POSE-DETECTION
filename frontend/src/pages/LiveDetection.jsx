import React, { useRef, useState, useEffect, Suspense } from 'react'
import Webcam from 'react-webcam'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import api from '../utils/api'
import Skeleton3D from '../components/Skeleton3D'
import { Activity, Camera, Loader2, Play, Square, CheckCircle, Info, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function LiveDetection() {
    const webcamRef = useRef(null)
    const navigate = useNavigate()
    const [landmarks, setLandmarks] = useState([])
    const [isRunning, setIsRunning] = useState(false)
    const [loading, setLoading] = useState(false)
    const [analyzing, setAnalyzing] = useState(false)
    const [error, setError] = useState(null)
    const [fps, setFps] = useState(0)
    const [targetFps, setTargetFps] = useState(10) // Default target FPS
    const [exerciseMode, setExerciseMode] = useState('free') // free, squat, pushup, plank
    const [feedback, setFeedback] = useState(null) // { message, is_correct, metrics }

    // Capture and send frame loop
    useEffect(() => {
        let animationFrameId
        let lastTime = performance.now()

        const processFrame = async () => {
            if (!isRunning || !webcamRef.current) return

            const imageSrc = webcamRef.current.getScreenshot()
            if (imageSrc) {
                try {
                    const response = await fetch(imageSrc)
                    const blob = await response.blob()

                    const formData = new FormData()
                    formData.append('file', blob, 'frame.jpg')

                    const res = await api.post(`/pose/detect?analysis_type=${exerciseMode !== 'free' ? exerciseMode : ''}`, formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    })

                    if (res.data && res.data.landmarks_3d) {
                        setLandmarks(res.data.landmarks_3d)

                        // Handle Exercise Feedback
                        if (res.data.exercise_analysis) {
                            setFeedback(res.data.exercise_analysis)
                        } else {
                            setFeedback(null)
                        }

                        const now = performance.now()
                        setFps(Math.round(1000 / (now - lastTime)))
                        lastTime = now
                    }
                } catch (err) {
                    console.error('Pose detection error:', err)
                }
            }

            if (isRunning) {
                setTimeout(() => {
                    animationFrameId = requestAnimationFrame(processFrame)
                }, 1000 / targetFps)
            }
        }

        if (isRunning) {
            processFrame()
        }

        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId)
        }
    }, [isRunning])

    const toggleDetection = () => {
        setIsRunning(!isRunning)
        if (!isRunning) {
            setError(null)
            setLandmarks([])
        }
    }

    const handleCaptureAndAnalyze = async () => {
        if (!landmarks || landmarks.length === 0) return

        setAnalyzing(true)
        setError(null)

        try {
            const sessionRes = await api.post('/pose/session', {
                session_type: "live_detection",
                landmarks_3d: landmarks,
                confidence_score: landmarks.reduce((acc, curr) => acc + curr.visibility, 0) / landmarks.length,
                duration_seconds: 0
            })

            const sessionId = sessionRes.data.id
            const analysisRes = await api.post(`/posture/analyze/${sessionId}`)
            navigate('/analysis', { state: { analysis: analysisRes.data } })
        } catch (err) {
            console.error('Capture and Analysis failed:', err)
            setError('Failed to analyze posture. Please try again.')
        } finally {
            setAnalyzing(false)
        }
    }

    return (
        <div className="p-6 max-w-7xl mx-auto pb-24">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
                        <Zap className="w-8 h-8 text-sky-400 fill-sky-400/20" />
                        LIVE <span className="text-sky-400">SESSION</span>
                    </h1>
                    <p className="text-slate-500 mt-2 font-bold uppercase tracking-[0.2em] text-xs">Real-time 3D tracking & physiological analysis</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    {isRunning && (
                        <>
                            <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-2">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                                    {fps} FPS ACTIVE
                                </span>
                            </div>

                            {/* FPS Control Slider */}
                            <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-2xl border border-slate-700">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Target: {targetFps}</span>
                                <input
                                    type="range"
                                    min="1"
                                    max="30"
                                    step="1"
                                    value={targetFps}
                                    onChange={(e) => setTargetFps(parseInt(e.target.value))}
                                    className="w-24 accent-sky-500 h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                        </>
                    )}

                    <button
                        onClick={toggleDetection}
                        className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center gap-2 shadow-2xl ${isRunning
                            ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white'
                            : 'bg-sky-500 text-white shadow-sky-500/20 hover:bg-sky-400 transform hover:-translate-y-0.5'
                            }`}
                    >
                        {isRunning ? (
                            <>
                                <Square className="w-4 h-4 fill-current" /> Terminate Scan
                            </>
                        ) : (
                            <>
                                <Play className="w-4 h-4 fill-current" /> Initialize Tracker
                            </>
                        )}
                    </button>

                    {landmarks.length > 0 && (
                        <button
                            onClick={handleCaptureAndAnalyze}
                            disabled={analyzing}
                            className="btn-primary flex items-center gap-2 px-8 py-3 disabled:opacity-50 font-black text-xs uppercase tracking-[0.2em]"
                        >
                            {analyzing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <CheckCircle className="w-4 h-4" />
                            )}
                            Sync & Analyze
                        </button>
                    )}
                </div>
            </div>


            {/* Exercise Mode Selector */}
            <div className="flex justify-center gap-4 mb-8">
                {['free', 'squat', 'pushup', 'plank', 'ergonomics'].map((mode) => (
                    <button
                        key={mode}
                        onClick={() => setExerciseMode(mode)}
                        className={`px-6 py-2 rounded-xl font-bold uppercase tracking-wider text-sm transition-all ${exerciseMode === mode
                            ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25 scale-105'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                    >
                        {mode} Mode
                    </button>
                ))}
            </div>

            {/* Feedback Overlay */}
            {
                feedback && feedback.feedback.length > 0 && (
                    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                        <div className={`px-8 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border-4 ${feedback.is_correct ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-rose-500/20 border-rose-500 text-rose-400'
                            }`}>
                            <h2 className="text-3xl font-black uppercase tracking-widest text-center stroke-text">
                                {feedback.feedback[0]}
                            </h2>
                            {feedback.metrics && feedback.exercise === 'squat' && (
                                <div className="text-center mt-2 text-white font-bold">
                                    Depth Score: {feedback.metrics.depth_score.toFixed(2)}
                                </div>
                            )}
                        </div>
                    </div>
                )
            }

            {
                error && (
                    <div className="mb-8 bg-rose-500/10 border border-rose-500/20 text-rose-400 px-6 py-4 rounded-3xl flex items-center gap-3 animate-in slide-in-from-top-4">
                        <AlertCircle className="w-5 h-5" />
                        <span className="text-sm font-bold uppercase tracking-tight">System Error: {error}</span>
                    </div>
                )
            }

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[650px]">
                {/* Webcam Preview */}
                <div className="relative card overflow-hidden bg-slate-950 border-slate-800/50 flex items-center justify-center group shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-40 z-10 pointer-events-none"></div>
                    <Webcam
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        className="w-full h-full object-cover scale-x-[-1]"
                        videoConstraints={{
                            width: 1280,
                            height: 720,
                            facingMode: "user"
                        }}
                    />

                    {/* Corner Decorations */}
                    <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-sky-500/50 rounded-tl-xl z-20"></div>
                    <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-sky-500/50 rounded-tr-xl z-20"></div>
                    <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-sky-500/50 rounded-bl-xl z-20"></div>
                    <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-sky-500/50 rounded-br-xl z-20"></div>

                    {!isRunning && (
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-white z-20">
                            <div className="p-8 rounded-[2.5rem] bg-slate-900 border border-slate-800 shadow-2xl flex flex-col items-center">
                                <Camera className="w-16 h-16 mb-6 text-slate-700" />
                                <p className="text-xl font-black uppercase tracking-widest text-slate-400">Optical Sensor Offline</p>
                                <p className="text-slate-600 text-xs mt-2 uppercase font-bold tracking-widest">Awaiting initialization...</p>
                            </div>
                        </div>
                    )}

                    {isRunning && landmarks.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center z-20">
                            <div className="bg-slate-900/80 backdrop-blur-xl px-8 py-4 rounded-[2rem] text-white flex items-center gap-4 border border-slate-700 shadow-2xl">
                                <Loader2 className="w-6 h-6 text-sky-400 animate-spin" />
                                <span className="font-black uppercase tracking-[0.2em] text-xs">Aligning neural networks...</span>
                            </div>
                        </div>
                    )}

                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
                        <div className="bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-700/50 shadow-xl flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></div>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Face Detected</span>
                        </div>
                    </div>
                </div>

                {/* 3D Visualization */}
                <div className="card bg-slate-950 border-slate-800/50 overflow-hidden relative shadow-2xl">
                    <div className="absolute top-6 left-6 z-20 p-2 bg-slate-900/50 backdrop-blur-md border border-slate-700/30 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Kinematic Workspace
                    </div>

                    <Suspense fallback={
                        <div className="flex flex-col items-center justify-center h-full text-slate-700">
                            <Loader2 className="w-10 h-10 animate-spin mb-4" />
                            <p className="font-black uppercase tracking-widest text-xs">Rendering 3D Mesh...</p>
                        </div>
                    }>
                        <Canvas shadows>
                            <PerspectiveCamera makeDefault position={[0, 1, 5]} />
                            <OrbitControls minDistance={2} maxDistance={10} enableDamping />

                            <ambientLight intensity={0.2} />
                            <pointLight position={[10, 10, 10]} intensity={1.5} color="#0ea5e9" />
                            <pointLight position={[-10, 5, -10]} intensity={0.5} color="#6366f1" />

                            <gridHelper args={[20, 20, '#1e293b', '#0f172a']} rotation={[0, 0, 0]} />

                            <Skeleton3D landmarks={landmarks} />
                        </Canvas>
                    </Suspense>

                    <div className="absolute bottom-8 left-8 right-8 z-20 flex justify-between items-end">
                        <div className="text-slate-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            Interactive Viewport <Info className="w-3 h-3" />
                        </div>
                        <div className="flex gap-2">
                            <div className="w-10 h-1 rounded-full bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.5)]"></div>
                            <div className="w-10 h-1 rounded-full bg-slate-800"></div>
                            <div className="w-10 h-1 rounded-full bg-slate-800"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats / Instructions */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="card flex items-start gap-6 p-8 bg-[#0f172a]/80 backdrop-blur-xl border-slate-800/50 group hover:border-sky-500/30 transition-all">
                    <div className="bg-sky-500/10 p-4 rounded-2xl border border-white/5 group-hover:scale-110 transition-transform">
                        <Activity className="w-6 h-6 text-sky-400" />
                    </div>
                    <div>
                        <h3 className="font-black text-white uppercase tracking-wider text-xs mb-3">Spatial Consistency</h3>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">
                            Neural engine mapping over <span className="text-slate-100 italic">33 key physiological points</span> with high-fidelity depth perception.
                        </p>
                    </div>
                </div>

                <div className="card flex items-start gap-6 p-8 bg-[#0f172a]/80 backdrop-blur-xl border-slate-800/50 group hover:border-indigo-500/30 transition-all">
                    <div className="bg-indigo-500/10 p-4 rounded-2xl border border-white/5 group-hover:scale-110 transition-transform">
                        <Info className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="font-black text-white uppercase tracking-wider text-xs mb-3">Instructions</h3>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">
                            Position yourself <span className="text-slate-100 italic">2-3 meters</span> from the camera lens for optimal kinematic accuracy.
                        </p>
                    </div>
                </div>
            </div>
        </div >
    )
}
