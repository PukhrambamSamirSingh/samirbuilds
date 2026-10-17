import React from 'react'
import Navbar from '../components/Navbar'
import { useTheme } from '../context/ThemeContext'

const Projects = () => {
  const { theme } = useTheme()

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-slate-100 text-gray-900'} flex flex-col justify-between transition-colors duration-300`}>
        <div>
            <Navbar />
            <main className='max-w-6xl mx-auto px-4 sm:px-8 md:px-12 py-12'>
                <h1 className={`text-3xl sm:text-5xl font-extrabold mb-6 border-b ${theme === 'dark' ? 'border-gray-700 text-white' : 'border-gray-300 text-gray-900'} pb-4`}>
                  Featured Projects
                </h1>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-sm sm:text-base leading-relaxed max-w-2xl`}>
                    Explore full-stack web applications, APIs, open-source tools, and innovative coding projects.
                </p>
            </main>
        </div>
    </div>
  )
}

export default Projects