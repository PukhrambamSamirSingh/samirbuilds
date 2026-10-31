import React from 'react'
import { Link } from 'react-router-dom'
import { FaGithub, FaLinkedin } from 'react-icons/fa'
import { useTheme } from '../context/ThemeContext'

const Footer = () => {
    const { theme } = useTheme()
    const dark = theme === 'dark'

    return (
        <footer className={`${dark ? 'bg-black border-zinc-900 text-gray-400' : 'bg-slate-100 border-gray-200 text-gray-600'} border-t px-4 sm:px-6 md:px-8 lg:px-8 py-8 md:py-12 text-sm transition-colors duration-300`}>
            <div className='max-w-[1320px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left'>
                <div>
                    <Link
                        to="/"
                        className={`font-bold text-base transition-colors duration-200 inline-block cursor-pointer ${
                            dark ? 'text-white hover:text-blue-400' : 'text-gray-900 hover:text-blue-600'
                        }`}
                        title="Samir Builds Home"
                    >
                        Samir Builds
                    </Link>
                    <p className={`text-xs mt-1 ${dark ? 'text-zinc-400' : 'text-gray-600'}`}>
                        Sharing ideas, projects, and insights.
                    </p>
                </div>
                <div className='flex items-center gap-3 my-2 md:my-0'>
                    <a
                        href="https://github.com/PukhrambamSamirSingh"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                            dark
                                ? 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 hover:bg-zinc-800'
                                : 'bg-white border border-slate-300 text-slate-700 hover:text-slate-900 hover:border-slate-400 hover:bg-slate-50 shadow-xs'
                        }`}
                        title="GitHub Profile"
                    >
                        <FaGithub className={`text-lg ${dark ? 'text-white' : 'text-slate-900'}`} />
                        <span>GitHub</span>
                    </a>
                    <a
                        href="https://www.linkedin.com/in/samir-singh-6576bb251/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                            dark
                                ? 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 hover:bg-zinc-800'
                                : 'bg-white border border-slate-300 text-slate-700 hover:text-slate-900 hover:border-slate-400 hover:bg-slate-50 shadow-xs'
                        }`}
                        title="LinkedIn Profile"
                    >
                        <FaLinkedin className='text-lg text-blue-400' />
                        <span>LinkedIn</span>
                    </a>
                </div>
                <div className={`text-xs ${dark ? 'text-zinc-500' : 'text-gray-500'}`}>
                    © {new Date().getFullYear()}{' '}
                    <Link
                        to="/"
                        className={`font-medium transition-colors ${
                            dark ? 'text-zinc-400 hover:text-white' : 'text-gray-700 hover:text-gray-950'
                        }`}
                    >
                        Samir Builds
                    </Link>
                    . All rights reserved.
                </div>
            </div>
        </footer>
    )
}

export default Footer
