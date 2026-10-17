import React from 'react'
import Navbar from '../components/Navbar'
import { useTheme } from '../context/ThemeContext'

const Home = () => {
    const { theme } = useTheme()

    return (
        <div className={`relative min-h-screen ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-slate-100 text-gray-900'} flex flex-col justify-between transition-colors duration-300`}>
            {/* Background Image Overlay */}
            <div
                className={`absolute inset-0 bg-[url("../src/assets/idea_image3.png")] bg-cover bg-center ${theme === 'dark' ? 'brightness-40 opacity-50' : 'brightness-90 opacity-70'} pointer-events-none transition-all duration-300`}
            >
            </div>
            <div className='relative z-10 flex flex-col flex-1'>
                <Navbar />
                <main className='px-4 sm:px-8 md:px-16 lg:px-20 py-12 md:py-24 max-w-7xl mx-auto w-full flex-1 flex flex-col justify-center items-start'>
                    <span className='text-blue-500 font-semibold uppercase tracking-wider text-xs sm:text-sm mb-3'>Welcome to Samir Builds</span>
                    <h1 className={`text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-6 max-w-3xl leading-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Exploring Code, Design & Future Innovations
                    </h1>
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-sm sm:text-base md:text-lg max-w-3xl mb-8 leading-relaxed`}>
                        Explore my learning journey in full-stack development and AI/ML, where I build projects, experiment with neural networks, transformers, and self-attention mechanisms, and share what I learn along the way.
                    </p>
                </main>
            </div>
        </div>
    )
}

export default Home
