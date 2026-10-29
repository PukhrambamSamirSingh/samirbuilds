import React from 'react'
import Navbar from '../components/Navbar'
import { useTheme } from '../context/ThemeContext'

import samirOriginalImg from '../assets/samir_original.jpg'
import codeWithHarryImg from '../assets/codewithharry.jpg'
import threeBlueOneBrownImg from '../assets/threeblueonebrown.jpg'
import welchLabsImg from '../assets/welchlabs.jpg'
import karpathyImg from '../assets/karpathy.jpg'
import visualAIImg from '../assets/visualai.jpg'

import { FaGithub, FaLinkedin } from 'react-icons/fa'
import { FiExternalLink, FiCode } from 'react-icons/fi'

const resources = [
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
    },
    {
        name: 'CodeWithHarry',
        description: 'Web development, programming fundamentals, and practical coding.',
        url: 'https://www.youtube.com/@CodeWithHarry',
        image: codeWithHarryImg
    }
]

const skills = [
    'React.js',
    'JavaScript',
    'Python',
    'FastAPI',
    'Neural Networks',
    'Transformers',
    'Vector Embeddings',
    'Self-Attention',
    'TailwindCSS'
]

const About = () => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    return (
        <div className={`min-h-screen ${isDark ? 'bg-black text-white' : 'bg-slate-50 text-gray-900'} flex flex-col justify-between transition-colors duration-300 font-sans`}>
            <div>
                <Navbar />

                <main className='max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-14 flex flex-col gap-10'>
                    {/* Author Section */}
                    <section
                        className={`rounded-3xl border transition-all duration-300 p-6 sm:p-10 md:p-12 flex flex-col gap-8 ${isDark
                            ? 'border-zinc-900 bg-black text-white shadow-sm'
                            : 'border-gray-200 bg-white text-gray-900 shadow-sm'
                            }`}
                    >
                        {/* Centered Header: "Building Understanding" & "Learning one concept at a time" */}
                        <div className='flex flex-col items-center text-center'>
                            <p
                                className={`font-serif italic text-base sm:text-lg tracking-wide mb-1 ${isDark ? 'text-blue-300/90' : 'text-blue-600/90'
                                    }`}
                            >
                                Learning one concept at a time
                            </p>
                            <h1
                                className={`text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'
                                    }`}
                            >
                                Building Understanding
                            </h1>
                            <div
                                className={`w-24 sm:w-32 h-[2.5px] mt-3 rounded-full ${isDark
                                    ? 'bg-gradient-to-r from-transparent via-cyan-400 to-transparent'
                                    : 'bg-gradient-to-r from-transparent via-blue-500 to-transparent'
                                    }`}
                            />
                        </div>

                        {/* Author Body: Left Circular Portrait & Right Bio Paragraphs */}
                        <div className='grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start pt-2'>
                            {/* Left Column: Circular Avatar & Label (4 cols on md) */}
                            <div className='md:col-span-4 flex flex-col items-center text-center'>
                                {/* Round profile image with drag & copy protections */}
                                <div
                                    onContextMenu={(e) => e.preventDefault()}
                                    className={`relative w-44 h-44 sm:w-48 sm:h-48 md:w-52 md:h-52 rounded-full overflow-hidden p-1 shadow-2xl transition-all duration-300 select-none group ${isDark
                                        ? 'ring-4 ring-blue-500/25 bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 shadow-blue-950/70'
                                        : 'ring-4 ring-blue-500/20 bg-gradient-to-tr from-blue-500 via-indigo-400 to-purple-500 shadow-slate-900/10'
                                        }`}
                                >
                                    <img
                                        src={samirOriginalImg}
                                        alt='Samir Singh'
                                        draggable={false}
                                        onContextMenu={(e) => e.preventDefault()}
                                        className='w-full h-full rounded-full object-cover object-[51%_38%] scale-[1.6] origin-[51%_38%] transition-transform duration-500 group-hover:scale-[1.72] pointer-events-none select-none'
                                        style={{
                                            WebkitUserSelect: 'none',
                                            userSelect: 'none',
                                            WebkitTouchCallout: 'none',
                                        }}
                                    />
                                </div>

                                {/* Author Name & Title */}
                                <h2
                                    className={`mt-4 font-bold text-xl sm:text-2xl tracking-tight ${isDark ? 'text-white' : 'text-gray-900'
                                        }`}
                                >
                                    Samir Singh
                                </h2>
                                <p
                                    className={`text-sm font-medium mt-0.5 ${isDark ? 'text-blue-300' : 'text-blue-600'
                                        }`}
                                >
                                    Developer
                                </p>

                                    {/* Social Links */}
                                    <div className='flex items-center gap-2.5 mt-4'>
                                        <a
                                            href='https://github.com/PukhrambamSamirSingh'
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all shadow-sm ${isDark
                                                ? 'bg-gray-900/80 border-gray-800 text-gray-200 hover:text-white hover:border-blue-500/60'
                                                : 'bg-white border-gray-200 text-gray-700 hover:text-gray-900 hover:border-blue-400'
                                                }`}
                                            title='GitHub Profile'
                                        >
                                            <FaGithub className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`} />
                                            <span>GitHub</span>
                                        </a>
                                        <a
                                            href='https://www.linkedin.com/in/samir-singh-6576bb251/'
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all shadow-sm ${isDark
                                                ? 'bg-gray-900/80 border-gray-800 text-gray-200 hover:text-white hover:border-blue-500/60'
                                                : 'bg-white border-gray-200 text-gray-700 hover:text-gray-900 hover:border-blue-400'
                                                }`}
                                            title='LinkedIn Profile'
                                        >
                                            <FaLinkedin className='text-sm text-blue-500' />
                                            <span>LinkedIn</span>
                                        </a>
                                    </div>
                                </div>

                                {/* Right Column: Story & Narrative (8 cols on md) */}
                                <div className='md:col-span-8 flex flex-col gap-4'>
                                    <div
                                        className={`space-y-4 text-sm sm:text-base leading-relaxed ${isDark ? 'text-gray-300/90' : 'text-gray-700'
                                            }`}
                                    >
                                        <p>
                                            My name is <strong className={isDark ? 'text-white font-semibold' : 'text-gray-900 font-semibold'}>Samir Singh</strong>. I'm a developer who enjoys building interactive web applications and exploring the core ideas powering Artificial Intelligence and Machine Learning.
                                        </p>
                                        <p>
                                            With practical experience across React.js, JavaScript, and Python, I build software while continuously deepening my knowledge in neural networks, Transformers, vector embeddings, self-attention, and the mathematics behind intelligent systems.
                                        </p>
                                        <p>
                                            I believe the best way to learn is to understand not just <em>how</em> something works, but <em>why</em> it works — by experimenting, breaking concepts down to first principles, and building from the ground up.
                                        </p>
                                    </div>

                                    {/* Tech & Focus Areas */}
                                    <div className='pt-2'>
                                        <p
                                            className={`text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${isDark ? 'text-blue-300/80' : 'text-blue-700/80'
                                                }`}
                                        >
                                            <FiCode className={isDark ? 'text-cyan-400' : 'text-blue-600'} />
                                            <span>Skills & Focus Areas</span>
                                        </p>
                                        <div className='flex flex-wrap gap-2'>
                                            {skills.map((skill, i) => (
                                                <span
                                                    key={i}
                                                    className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${isDark
                                                        ? 'bg-blue-950/40 border-blue-800/40 text-blue-200 hover:border-blue-500/60 hover:text-white'
                                                        : 'bg-blue-50/70 border-blue-200/80 text-blue-900 hover:bg-blue-100/80'
                                                        }`}
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Quote / Tagline */}
                                    <div
                                        className={`mt-2 pt-4 border-t ${isDark ? 'border-gray-800/80' : 'border-gray-200'
                                            }`}
                                    >
                                        <p
                                            className={`text-xs sm:text-sm font-serif italic pl-3 border-l-2 ${isDark
                                                ? 'text-blue-200/80 border-cyan-400/80'
                                                : 'text-blue-800/80 border-blue-500'
                                                }`}
                                        >
                                            "Always learning. Always building. Always curious."
                                        </p>
                                    </div>
                                </div>
                            </div>
                    </section>

                    {/* Card 2: Learning Resources Followed */}
                    <section
                        className={`rounded-3xl border p-6 sm:p-8 md:p-10 shadow-xl transition-all duration-300 ${isDark
                            ? 'border-blue-900/40 bg-[#060b18]/90 text-white shadow-black/40'
                            : 'border-gray-200 bg-white/95 text-gray-900 shadow-gray-200/50'
                            }`}
                    >
                        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1'>
                            <h2
                                className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'
                                    }`}
                            >
                                Learning Resources I Follow
                            </h2>
                            <span
                                className={`text-xs px-3 py-1 rounded-full font-medium w-fit border ${isDark
                                    ? 'bg-blue-950 border-blue-800/50 text-blue-300'
                                    : 'bg-blue-50 border-blue-200 text-blue-800'
                                    }`}
                            >
                                Curated Influences
                            </span>
                        </div>
                        <p
                            className={`text-xs sm:text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'
                                }`}
                        >
                            Creators and educators whose intuitive visual explanations support my learning journey.
                        </p>

                        <div
                            className={`divide-y flex flex-col ${isDark ? 'divide-gray-800/80' : 'divide-gray-200'
                                }`}
                        >
                            {resources.map((item, idx) => (
                                <div
                                    key={idx}
                                    className={`py-5 flex items-start gap-4 sm:gap-5 ${idx === 0 ? 'pt-2' : ''
                                        } ${idx === resources.length - 1 ? 'pb-2' : ''} group`}
                                >
                                    {/* Creator Thumbnail */}
                                    <div className='relative flex-shrink-0'>
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border shadow-sm transition-transform duration-300 group-hover:scale-105 ${isDark
                                                ? 'border-gray-800 bg-gray-900'
                                                : 'border-gray-200 bg-gray-100'
                                                }`}
                                        />
                                    </div>

                                    {/* Creator Details */}
                                    <div className='flex flex-col gap-1 min-w-0 flex-1'>
                                        <a
                                            href={item.url}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className={`font-bold text-base sm:text-lg transition-colors inline-flex items-center gap-1.5 w-fit ${isDark
                                                ? 'text-white hover:text-cyan-400'
                                                : 'text-gray-900 hover:text-blue-600'
                                                }`}
                                        >
                                            <span>{item.name}</span>
                                            <FiExternalLink
                                                className={`text-xs opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all ${isDark ? 'text-blue-400' : 'text-blue-600'
                                                    }`}
                                            />
                                        </a>
                                        <p
                                            className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-gray-300/80' : 'text-gray-600'
                                                }`}
                                        >
                                            {item.description}
                                        </p>
                                        <a
                                            href={item.url}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className={`inline-flex items-center gap-1 text-xs underline underline-offset-2 w-fit mt-0.5 transition-colors ${isDark
                                                ? 'text-blue-400/90 hover:text-cyan-300'
                                                : 'text-blue-600 hover:text-blue-800'
                                                }`}
                                        >
                                            <span>Visit YouTube channel</span>
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
