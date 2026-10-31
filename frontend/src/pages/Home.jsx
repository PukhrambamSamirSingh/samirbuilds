import React from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useTheme } from '../context/ThemeContext'
import InteractiveMLPlayground from '../components/InteractiveMLPlayground'
import ideaBg from '../assets/idea_image3.png'

const Home = () => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    return (
        /* Earlier Home Page Background:
        <div
            className={`relative min-h-screen flex flex-col justify-between transition-colors duration-300 overflow-x-hidden ${
                isDark ? 'bg-gray-800 text-[#ededf1]' : 'bg-slate-100 text-slate-900'
            }`}
        >
        */
        <div
            className={`relative min-h-screen flex flex-col justify-between transition-colors duration-300 overflow-x-hidden ${
                isDark ? 'bg-black text-white' : 'bg-slate-50 text-gray-900'
            }`}
        >
            {/* Earlier Background Image Overlay (commented out to preserve for later):
            <div
                style={{ backgroundImage: `url(${ideaBg})` }}
                className={`absolute inset-0 bg-cover bg-center ${
                    isDark ? 'brightness-40 opacity-50' : 'brightness-90 opacity-70'
                } pointer-events-none transition-all duration-300`}
            />
            */}

            <div className="relative z-10 flex flex-col flex-1">
                <Navbar />

                <main className="px-4 sm:px-6 md:px-8 lg:px-8 pt-6 md:pt-10 pb-8 md:pb-14 max-w-[1320px] mx-auto w-full flex-1 flex flex-col justify-start">
                    <div className="grid grid-cols-1 lg:grid-cols-[9fr_11fr] gap-6 lg:gap-8 items-start w-full">
                        {/* Left Column: Samir Builds Intro (45% width, fixed at top) */}
                        <div className="w-full min-w-0 flex flex-col justify-start pt-1 sm:pt-2">
                            {/* Eyebrow / Kicker badge */}
                            <div
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3.5 sm:mb-4 w-fit border transition-all duration-300"
                                style={{
                                    background: isDark ? "rgba(14, 165, 233, 0.08)" : "rgba(2, 132, 199, 0.08)",
                                    borderColor: isDark ? "rgba(56, 189, 248, 0.25)" : "rgba(2, 132, 199, 0.25)",
                                }}
                            >
                                <span className={`w-2 h-2 rounded-full kicker-glow-dot ${isDark ? 'bg-cyan-400 text-cyan-400' : 'bg-blue-600 text-blue-600'}`} />
                                <span className={`text-[10.5px] sm:text-[11px] font-semibold tracking-wider uppercase ${isDark ? 'text-cyan-300' : 'text-blue-700'}`}>
                                    Welcome to Samir Builds
                                </span>
                            </div>

                            {/* Earlier Apple-style headline kept for reference:
                            <h1 className="type-display text-4xl sm:text-5xl lg:text-[2.6rem] xl:text-5xl font-semibold tracking-[-0.035em] leading-[1.05] mb-5 text-left">
                                <span className={`block ${isDark ? 'type-chrome' : 'text-slate-900'}`}>
                                    Exploring Code,
                                </span>
                                <span className={`block ${isDark ? 'type-chrome' : 'text-slate-900'}`}>
                                    Design &
                                </span>
                                <span className="block type-soft text-[#c4c4cc] mt-1 sm:mt-2 text-[1.05em]">
                                    Future Innovations.
                                </span>
                            </h1>
                            */}

                            {/* Main Headline - Fresh Modern Tech Layout */}
                            <h1 className="text-4xl sm:text-5xl lg:text-[2.75rem] xl:text-[3.15rem] font-black tracking-tight leading-[1.06] mb-5 text-left">
                                <span className={`block ${isDark ? 'text-white' : 'text-slate-950'}`}>
                                    Exploring Code,
                                </span>
                                <span className={`block ${isDark ? 'text-white' : 'text-slate-950'}`}>
                                    Design &
                                </span>
                                <span className="block mt-1 bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
                                    Future Innovations.
                                </span>
                            </h1>

                            {/* Original Paragraph */}
                            <p
                                className={`text-base sm:text-lg md:text-[19px] leading-relaxed font-normal mb-8 max-w-2xl ${
                                    isDark ? 'text-gray-300' : 'text-gray-700'
                                }`}
                            >
                                Explore my learning journey in full-stack development and AI/ML, where I build projects, experiment with neural networks, transformers, and self-attention mechanisms, and share what I learn along the way.
                            </p>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap items-center gap-3">
                                <Link
                                    to="/blogs"
                                    className={`btn-primary group inline-flex items-center gap-2 font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-full transition-all duration-200 active:scale-[0.98] shadow-sm ${
                                        isDark
                                            ? 'bg-[#ededf1] hover:bg-white text-[#070708]'
                                            : 'bg-slate-900 hover:bg-black text-white'
                                    }`}
                                >
                                    <span>Explore Blogs</span>
                                    <span className="text-base group-hover:translate-x-0.5 transition-transform">→</span>
                                </Link>
                                <Link
                                    to="/projects"
                                    className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-200 active:scale-[0.98] shadow-sm ${
                                        isDark
                                            ? 'border border-white/30 bg-white/10 hover:bg-white/20 hover:border-white/50 text-white'
                                            : 'border border-slate-300 hover:border-slate-800 hover:bg-slate-100 text-slate-900'
                                    }`}
                                >
                                    <span>View Projects</span>
                                </Link>
                            </div>
                        </div>

                        {/* Right Column: Interactive ML Playground (55% width) */}
                        <div className="w-full min-w-0">
                            <InteractiveMLPlayground embedded={true} />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default Home

