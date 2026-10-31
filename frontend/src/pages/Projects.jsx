import React from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useTheme } from '../context/ThemeContext'
import { FiCode, FiCpu, FiArrowRight, FiBookOpen } from 'react-icons/fi'

const Projects = () => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    return (
        <div className={`min-h-screen ${isDark ? 'bg-black text-white' : 'bg-slate-50 text-gray-900'} flex flex-col justify-between transition-colors duration-300 font-sans`}>
            <div>
                <Navbar />
                <main className='max-w-[1320px] mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-8 pt-6 md:pt-10 pb-12 md:pb-16 flex flex-col gap-10'>
                    {/* Header */}
                    <div>
                        <h1 className={`text-3xl sm:text-5xl font-extrabold mb-4 border-b ${isDark ? 'border-gray-800 text-white' : 'border-gray-200 text-gray-900'} pb-4`}>
                            Featured Projects
                        </h1>
                        <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-sm sm:text-base leading-relaxed max-w-2xl`}>
                            A collection of things I build, ideas I explore, and experiments that turn concepts into working software.
                        </p>
                    </div>

                    {/* In Progress / Yet to Come Content */}
                    <div className='flex flex-col items-center justify-center text-center py-10 sm:py-14 md:py-16 px-4'>
                        {/* Status Badge */}
                        <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-8 tracking-wide border ${isDark
                            ? 'bg-blue-950/50 border-blue-800/50 text-blue-300'
                            : 'bg-blue-50 border-blue-200 text-blue-700'
                            }`}>
                            <span className='w-2 h-2 rounded-full bg-blue-500 animate-pulse' />
                            <span>Currently Learning & Building</span>
                        </div>

                        {/* What's in the pipeline - 2 cards */}
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mb-10 text-left'>
                            <div className={`p-4 rounded-2xl border transition-all ${isDark
                                ? 'bg-zinc-900/40 border-zinc-800/80 hover:border-blue-500/40'
                                : 'bg-white border-gray-200/90 shadow-sm hover:border-blue-400'
                                }`}>
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${isDark ? 'bg-blue-950/60 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                    <FiCpu className='text-lg' />
                                </div>
                                <h3 className={`text-sm font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    AI & Neural Nets
                                </h3>
                                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} leading-relaxed`}>
                                    Interactive visualizers for transformers, attention, and deep learning architectures.
                                </p>
                            </div>

                            <div className={`p-4 rounded-2xl border transition-all ${isDark
                                ? 'bg-zinc-900/40 border-zinc-800/80 hover:border-blue-500/40'
                                : 'bg-white border-gray-200/90 shadow-sm hover:border-blue-400'
                                }`}>
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${isDark ? 'bg-blue-950/60 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                    <FiCode className='text-lg' />
                                </div>
                                <h3 className={`text-sm font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Full-Stack Apps
                                </h3>
                                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} leading-relaxed`}>
                                    Modern web applications crafted with React, FastAPI, Python, and clean UX.
                                </p>
                            </div>
                        </div>

                        {/* Explore other sections in the meantime */}
                        <div className='flex flex-wrap items-center justify-center gap-3'>
                            <Link
                                to='/blogs'
                                className={`inline-flex items-center gap-2 text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-200 active:scale-[0.98] shadow-sm ${isDark
                                    ? 'bg-[#ededf1] hover:bg-white text-[#070708]'
                                    : 'bg-slate-900 hover:bg-black text-white'
                                    }`}
                            >
                                <span>Read Blog Posts</span>
                                <FiArrowRight className='text-sm' />
                            </Link>
                            <Link
                                to='/notes'
                                className={`inline-flex items-center gap-2 text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-200 active:scale-[0.98] shadow-sm ${isDark
                                    ? 'border border-white/20 bg-white/5 hover:bg-white/10 text-white'
                                    : 'border border-gray-300 hover:border-gray-800 hover:bg-gray-100 text-gray-900'
                                    }`}
                            >
                                <FiBookOpen className='text-sm' />
                                <span>Explore Study Notes</span>
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default Projects
