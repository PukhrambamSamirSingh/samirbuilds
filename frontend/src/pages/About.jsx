import React from 'react'
import Navbar from '../components/Navbar'
import { useTheme } from '../context/ThemeContext'

import codeWithHarryImg from '../assets/codewithharry.jpg'
import threeBlueOneBrownImg from '../assets/threeblueonebrown.jpg'
import welchLabsImg from '../assets/welchlabs.jpg'
import karpathyImg from '../assets/karpathy.jpg'
import visualAIImg from '../assets/visualai.jpg'

const resources = [
    {
        name: 'CodeWithHarry',
        description: 'Web development, programming fundamentals, and practical coding.',
        url: 'https://www.youtube.com/@CodeWithHarry',
        image: codeWithHarryImg
    },
    {
        name: '3Blue1Brown',
        description: 'Visual intuition for linear algebra, calculus, and neural networks.',
        url: 'https://www.youtube.com/@3blue1brown',
        image: threeBlueOneBrownImg
    },
    {
        name: 'Welch Labs',
        description: 'Visual explanations of mathematical concepts and machine learning.',
        url: 'https://www.youtube.com/@welchlabs',
        image: welchLabsImg
    },
    {
        name: 'Andrej Karpathy',
        description: 'Neural networks, backpropagation, Transformers, and building AI from scratch.',
        url: 'https://www.youtube.com/@AndrejKarpathy',
        image: karpathyImg
    },
    {
        name: 'Visual AI',
        description: 'Visual explanations, animations, and intuitive guides for Artificial Intelligence & Data Science.',
        url: 'https://www.youtube.com/@VisualAIOfficial',
        image: visualAIImg
    }
]

const About = () => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    return (
        <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-slate-50 text-gray-900'} flex flex-col justify-between transition-colors duration-300`}>
            <div>
                <Navbar />

                <main className='max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-10 md:py-16 flex flex-col gap-8'>
                    {/* Card 1: About Me */}
                    <section className={`rounded-2xl border ${isDark ? 'border-gray-800 bg-gray-950/90' : 'border-gray-200 bg-white'} p-6 sm:p-8 md:p-10 shadow-sm transition-colors`}>
                        <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            About Me
                        </h1>

                        <hr className={`my-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`} />

                        <h2 className={`text-base sm:text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Building for the Web. Exploring the Intelligence Behind AI.
                        </h2>

                        <div className={`space-y-4 text-xs sm:text-sm md:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            <p>
                                I'm a passionate developer who enjoys building interactive web applications and exploring the ideas behind Artificial Intelligence and Machine Learning.
                            </p>
                            <p>
                                With hands-on knowledge of React.js, JavaScript, and Python, I build projects while continuously strengthening my fundamentals. I'm currently exploring neural networks, Transformers, vector embeddings, self-attention, and the mathematics behind modern AI systems.
                            </p>
                            <p>
                                I believe the best way to learn is to understand not just how something works, but why it works — by experimenting, building, and learning from the ground up.
                            </p>
                        </div>

                        <p className={`text-xs sm:text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-6 pt-4 border-t ${isDark ? 'border-gray-800/60' : 'border-gray-100'}`}>
                            Always learning. Always building. Always curious.
                        </p>
                    </section>

                    {/* Card 2: My Learning Resources */}
                    <section className={`rounded-2xl border ${isDark ? 'border-gray-800 bg-gray-950/90' : 'border-gray-200 bg-white'} p-6 sm:p-8 md:p-10 shadow-sm transition-colors`}>
                        <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Learning Resources I Follow
                        </h2>
                        <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-6`}>
                            A few creators whose tutorials and explanations support my learning journey.
                        </p>

                        <div className='divide-y divide-gray-800/60 flex flex-col'>
                            {resources.map((item, idx) => (
                                <div key={idx} className={`py-5 flex items-start gap-4 sm:gap-5 ${idx === 0 ? 'pt-2' : ''} ${idx === resources.length - 1 ? 'pb-2' : ''}`}>
                                    {/* Creator Thumbnail */}
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-gray-100'} flex-shrink-0`}
                                    />

                                    {/* Creator Details */}
                                    <div className='flex flex-col gap-1 min-w-0 flex-1'>
                                        <a
                                            href={item.url}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className={`font-bold text-base sm:text-lg underline underline-offset-2 ${isDark ? 'text-white hover:text-blue-400' : 'text-gray-900 hover:text-blue-600'} transition-colors inline-block w-fit`}
                                        >
                                            {item.name}
                                        </a>
                                        <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} leading-relaxed`}>
                                            {item.description}
                                        </p>
                                        <a
                                            href={item.url}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className={`inline-flex items-center gap-1 text-xs sm:text-sm ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} underline underline-offset-2 w-fit mt-0.5`}
                                        >
                                            <span>YouTube channel</span>
                                            <span className='text-xs'>↗</span>
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </main>
            </div>
        </div>
    )
}

export default About
