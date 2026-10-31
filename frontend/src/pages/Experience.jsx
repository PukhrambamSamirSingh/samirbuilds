import React from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useTheme } from '../context/ThemeContext'
import {
    FiBriefcase,
    FiTrendingUp,
    FiBookOpen,
    FiCpu,
    FiCode,
    FiLayers,
    FiCompass,
    FiTarget,
    FiArrowRight,
    FiCheckCircle,
    FiGitBranch
} from 'react-icons/fi'

const timeline = [
    {
        step: '01',
        company: 'Konfo',
        role: 'Retail',
        period: 'September 2024 – May 2025',
        type: 'Foundational Professional Experience',
        description:
            'Developed professional experience through customer interaction, product knowledge, communication, and understanding customer requirements.',
        keyTakeaway:
            'Built core competencies in clear verbal communication, client empathy, real-time problem resolution, and identifying distinct user needs.',
        skills: ['Communication', 'Customer Understanding', 'Product Knowledge', 'Active Listening']
    },
    {
        step: '02',
        company: 'XDBS',
        role: 'Research Analyst (CDQA)',
        period: 'Professional Experience',
        type: 'Data & Prospect Research',
        description:
            'Research online and capture accurate contact information according to business requirements and Maintaining and updating list/database on Excel also Make outbound calls to verify the contact information.',
        keyTakeaway:
            'Honed analytical rigor, database validation habits, methodical investigation, and transforming raw information into structured, actionable reports.',
        skills: ['Prospect Research', 'Data Analysis', 'Excel Reporting', 'Data Validation', 'Attention to Detail']
    },
    {
        step: '03',
        company: 'Interlink',
        role: 'Web Developer',
        period: 'Present',
        isCurrent: true,
        type: 'Software Engineering (Current)',
        description:
            'Currently working as a Web Developer focused on building and maintaining web applications, developing responsive user interfaces, and applying modern programming practices.',
        keyTakeaway:
            'Actively applying modern programming practices, building user interfaces, and solving real-world software engineering challenges.',
        skills: ['Web Development', 'JavaScript', 'React.js', 'Programming', 'Problem Solving']
    }
]

const learningTracks = [
    {
        title: 'Software Development',
        icon: FiCode,
        badge: 'Core Engineering',
        description:
            'Building responsive web applications, modular component architectures, and asynchronous API services.',
        topics: ['React.js', 'JavaScript', 'Python', 'FastAPI', 'Node.js', 'etc.']
    },
    {
        title: 'Artificial Intelligence & Machine Learning',
        icon: FiCpu,
        badge: 'Specialization',
        description:
            'Deep diving into modern neural architectures, self-attention mechanics, and high-dimensional representations.',
        topics: [
            'Neural Networks',
            'Transformers',
            'Self-Attention',
            'Multi-Head Attention',
            'Vector Embeddings',
            'etc.'
        ]
    },
    {
        title: 'Mathematical Foundations',
        icon: FiCompass,
        badge: 'First Principles',
        description:
            'Grounding computational concepts in linear algebra, gradient derivations, and optimization algorithms.',
        topics: [
            'Linear Algebra',
            'Calculus',
            'Backpropagation',
            'Mathematical Foundations of LLMs',
            'etc.'
        ]
    }
]

const skillCategories = [
    {
        category: 'Frontend',
        skills: ['React.js', 'JavaScript', 'HTML', 'CSS']
    },
    {
        category: 'Backend',
        skills: ['Python', 'FastAPI', 'Node.js']
    },
    {
        category: 'AI / ML',
        skills: ['Neural Networks', 'Transformers', 'Self-Attention']
    },
    {
        category: 'Tools',
        skills: ['Git', 'GitHub']
    },
    {
        category: 'Styling',
        skills: ['Tailwind CSS']
    }
]

const Experience = () => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    return (
        <div className={`min-h-screen ${isDark ? 'bg-black text-white' : 'bg-slate-50 text-gray-900'} flex flex-col justify-between transition-colors duration-300 font-sans`}>
            <div>
                <Navbar />

                <main className='max-w-[1320px] mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-8 pt-6 md:pt-10 pb-14 md:pb-20 flex flex-col gap-12 sm:gap-16 md:gap-20'>
                    {/* ── Section 1: Introduction ── */}
                    <section className='flex flex-col items-center text-center'>
                        <p
                            className={`font-serif italic text-base sm:text-lg tracking-wide mb-1 ${
                                isDark ? 'text-blue-300/90' : 'text-blue-600/90'
                            }`}
                        >
                            My professional journey
                        </p>
                        <h1
                            className={`text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight ${
                                isDark ? 'text-white' : 'text-gray-900'
                            }`}
                        >
                            Career Journey & Technical Growth
                        </h1>
                        <div
                            className={`w-24 sm:w-32 h-[2.5px] mt-3 rounded-full ${
                                isDark
                                    ? 'bg-gradient-to-r from-transparent via-cyan-400 to-transparent'
                                    : 'bg-gradient-to-r from-transparent via-blue-500 to-transparent'
                            }`}
                        />
                        <p
                            className={`mt-4 text-sm sm:text-base leading-relaxed max-w-2xl ${
                                isDark ? 'text-gray-300/90' : 'text-gray-600'
                            }`}
                        >
                            A journey through professional experiences, software development, continuous learning, and the exploration of intelligent systems.
                        </p>
                    </section>

                    {/* ── Section 2: Professional Experience (Vertical Timeline) ── */}
                    <section className='flex flex-col gap-6'>
                        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4 border-gray-200 dark:border-gray-800'>
                            <div>
                                <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Career Timeline
                                </h2>
                                <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Professional milestones and hands-on experience
                                </p>
                            </div>
                            <span
                                className={`text-xs px-3 py-1 rounded-full font-medium w-fit border ${
                                    isDark
                                        ? 'bg-blue-950/60 border-blue-800/50 text-blue-300'
                                        : 'bg-blue-50 border-blue-200 text-blue-800'
                                }`}
                            >
                                Career Progression
                            </span>
                        </div>

                        {/* Timeline Tree */}
                        <div className='relative pl-6 sm:pl-10 md:pl-12 mt-4 space-y-10 sm:space-y-12 before:absolute before:left-2.5 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-blue-500 before:via-indigo-500 before:to-purple-500/30'>
                            {timeline.map((item, idx) => (
                                <div key={idx} className='relative group'>
                                    {/* Timeline Marker Node */}
                                    <div
                                        className={`absolute -left-6 sm:-left-10 md:-left-12 top-1.5 w-5 sm:w-6 h-5 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                            item.isCurrent
                                                ? isDark
                                                    ? 'bg-black border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]'
                                                    : 'bg-white border-emerald-600 shadow-[0_0_8px_rgba(5,150,105,0.3)]'
                                                : isDark
                                                    ? 'bg-black border-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.4)] group-hover:border-cyan-300'
                                                    : 'bg-white border-blue-600 shadow-sm group-hover:border-blue-700'
                                        }`}
                                    >
                                        <div
                                            className={`w-2 h-2 rounded-full ${
                                                item.isCurrent
                                                    ? isDark
                                                        ? 'bg-emerald-400 animate-pulse'
                                                        : 'bg-emerald-600 animate-pulse'
                                                    : isDark
                                                        ? 'bg-cyan-400'
                                                        : 'bg-blue-600'
                                            }`}
                                        />
                                    </div>

                                    {/* Content Card */}
                                    <div
                                        className={`p-5 sm:p-6 rounded-2xl border transition-all ${
                                            isDark
                                                ? 'bg-zinc-900/30 border-zinc-800/80 hover:border-zinc-700/80'
                                                : 'bg-white border-gray-200/90 shadow-xs hover:border-gray-300'
                                        }`}
                                    >
                                        {/* Card Top Meta */}
                                        <div className='flex flex-wrap items-center justify-between gap-2 mb-2'>
                                            <div className='flex items-center gap-2.5'>
                                                <span
                                                    className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-md ${
                                                        isDark
                                                            ? 'bg-blue-950/70 text-blue-300 border border-blue-800/40'
                                                            : 'bg-blue-50 text-blue-700 border border-blue-200/80'
                                                    }`}
                                                >
                                                    {item.step}
                                                </span>
                                                <h3
                                                    className={`text-lg sm:text-xl font-bold tracking-tight ${
                                                        isDark ? 'text-white' : 'text-gray-900'
                                                    }`}
                                                >
                                                    {item.company}
                                                </h3>
                                                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>•</span>
                                                <span className={`text-sm font-semibold ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
                                                    {item.role}
                                                </span>
                                            </div>
                                            <span
                                                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                                                    item.isCurrent
                                                        ? isDark
                                                            ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60'
                                                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        : isDark
                                                            ? 'bg-zinc-800/80 text-gray-300 border-zinc-700/60'
                                                            : 'bg-gray-100 text-gray-700 border-gray-200'
                                                }`}
                                            >
                                                {item.isCurrent && (
                                                    <span className='w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse' />
                                                )}
                                                <span>{item.period}</span>
                                            </span>
                                        </div>

                                        {/* Description */}
                                        <p
                                            className={`text-sm sm:text-base leading-relaxed mt-2 ${
                                                isDark ? 'text-gray-300/90' : 'text-gray-700'
                                            }`}
                                        >
                                            {item.description}
                                        </p>

                                        {/* Takeaway / Impact */}
                                        <div
                                            className={`mt-3.5 pl-3 border-l-2 text-xs sm:text-sm italic ${
                                                isDark
                                                    ? 'border-blue-500/60 text-blue-200/80'
                                                    : 'border-blue-500 text-blue-900/80'
                                            }`}
                                        >
                                            {item.keyTakeaway}
                                        </div>

                                        {/* Transferable Skills Chips */}
                                        <div className='flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800/60'>
                                            {item.skills.map((skill, sIdx) => (
                                                <span
                                                    key={sIdx}
                                                    className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${
                                                        isDark
                                                            ? 'bg-zinc-800/50 border-zinc-700/50 text-gray-300'
                                                            : 'bg-gray-50 border-gray-200 text-gray-700'
                                                    }`}
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>


                    </section>

                    {/* ── Section 3: Technical Learning Journey ── */}
                    <section className='flex flex-col gap-6'>
                        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4 border-gray-200 dark:border-gray-800'>
                            <div>
                                <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Beyond Professional Work — Continuous Learning
                                </h2>
                                <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Active study, experimentation, and first-principles mastery
                                </p>
                            </div>
                            <span
                                className={`text-xs px-3 py-1 rounded-full font-medium w-fit border ${
                                    isDark
                                        ? 'bg-blue-950/60 border-blue-800/50 text-blue-300'
                                        : 'bg-blue-50 border-blue-200 text-blue-800'
                                }`}
                            >
                                Deep Work
                            </span>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
                            {learningTracks.map((track, idx) => {
                                const IconComponent = track.icon
                                return (
                                    <div
                                        key={idx}
                                        className={`p-5 sm:p-6 rounded-2xl border flex flex-col justify-between transition-all ${
                                            isDark
                                                ? 'bg-zinc-900/30 border-zinc-800/80 hover:border-blue-500/40'
                                                : 'bg-white border-gray-200/90 shadow-xs hover:border-blue-400'
                                        }`}
                                    >
                                        <div>
                                            <div className='flex items-center justify-between mb-4'>
                                                <div
                                                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                                        isDark ? 'bg-blue-950/70 text-blue-400' : 'bg-blue-50 text-blue-600'
                                                    }`}
                                                >
                                                    <IconComponent className='text-xl' />
                                                </div>
                                                <span
                                                    className={`text-xs px-2.5 py-0.5 rounded-md font-medium border ${
                                                        isDark
                                                            ? 'bg-zinc-800/60 border-zinc-700/60 text-gray-300'
                                                            : 'bg-gray-100 border-gray-200 text-gray-700'
                                                    }`}
                                                >
                                                    {track.badge}
                                                </span>
                                            </div>

                                            <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                {track.title}
                                            </h3>
                                            <p className={`text-xs sm:text-sm leading-relaxed mb-4 ${isDark ? 'text-gray-300/80' : 'text-gray-600'}`}>
                                                {track.description}
                                            </p>
                                        </div>

                                        <div className='pt-3 border-t border-gray-100 dark:border-zinc-800/60'>
                                            <div className='flex flex-wrap gap-1.5'>
                                                {track.topics.map((topic, tIdx) => (
                                                    <span
                                                        key={tIdx}
                                                        className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${
                                                            isDark
                                                                ? 'bg-blue-950/30 border-blue-900/40 text-blue-200 hover:text-white'
                                                                : 'bg-blue-50/70 border-blue-200/70 text-blue-900'
                                                        }`}
                                                    >
                                                        {topic}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </section>

                    {/* ── Section 4: Skills and Technologies ── */}
                    <section className='flex flex-col gap-6'>
                        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4 border-gray-200 dark:border-gray-800'>
                            <div>
                                <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Skills & Technologies
                                </h2>
                                <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Technologies and concepts categorized by domain
                                </p>
                            </div>
                            <span
                                className={`text-xs px-3 py-1 rounded-full font-medium w-fit border ${
                                    isDark
                                        ? 'bg-blue-950/60 border-blue-800/50 text-blue-300'
                                        : 'bg-blue-50 border-blue-200 text-blue-800'
                                }`}
                            >
                                Core Stack
                            </span>
                        </div>

                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4'>
                            {skillCategories.map((group, idx) => (
                                <div
                                    key={idx}
                                    className={`p-4 rounded-2xl border transition-all ${
                                        isDark
                                            ? 'bg-zinc-900/30 border-zinc-800/80 hover:border-zinc-700/80'
                                            : 'bg-white border-gray-200/90 shadow-2xs hover:border-gray-300'
                                    }`}
                                >
                                    <h3
                                        className={`text-xs font-bold uppercase tracking-wider mb-3 pb-2 border-b ${
                                            isDark ? 'text-blue-300 border-zinc-800' : 'text-blue-700 border-gray-100'
                                        }`}
                                    >
                                        {group.category}
                                    </h3>
                                    <div className='flex flex-col gap-2'>
                                        {group.skills.map((skill, sIdx) => (
                                            <div
                                                key={sIdx}
                                                className={`flex items-center gap-2 text-xs font-medium px-2.5 py-1.5 rounded-lg border ${
                                                    isDark
                                                        ? 'bg-zinc-800/40 border-zinc-700/40 text-gray-200'
                                                        : 'bg-gray-50 border-gray-200/80 text-gray-800'
                                                }`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-cyan-400' : 'bg-blue-500'}`} />
                                                <span>{skill}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ── Section 5: Career Direction ── */}
                    <section
                        className={`p-6 sm:p-8 md:p-10 rounded-3xl border transition-all relative overflow-hidden ${
                            isDark
                                ? 'bg-gradient-to-br from-zinc-900/60 via-black to-blue-950/20 border-zinc-800/80'
                                : 'bg-gradient-to-br from-blue-50/50 via-white to-slate-50 border-blue-100 shadow-xs'
                        }`}
                    >
                        <div className='max-w-3xl flex flex-col gap-4'>
                            <div className='flex items-center gap-2'>
                                <FiTarget className={`text-lg ${isDark ? 'text-cyan-400' : 'text-blue-600'}`} />
                                <span
                                    className={`text-xs font-bold uppercase tracking-wider ${
                                        isDark ? 'text-blue-300' : 'text-blue-700'
                                    }`}
                                >
                                    Vision & Next Milestones
                                </span>
                            </div>

                            <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Where I'm Heading
                            </h2>

                            <p
                                className={`text-sm sm:text-base leading-relaxed ${
                                    isDark ? 'text-gray-300/90' : 'text-gray-700'
                                }`}
                            >
                                I'm continuing to develop my software engineering skills while exploring the mathematical and computational foundations of Artificial Intelligence.
                            </p>

                            <p
                                className={`text-sm sm:text-base leading-relaxed ${
                                    isDark ? 'text-gray-300/90' : 'text-gray-700'
                                }`}
                            >
                                My long-term goal is to understand how intelligent systems work at a deeper level and build meaningful software using that knowledge.
                            </p>

                            {/* Action Links */}
                            <div className='flex flex-wrap items-center gap-3 pt-3'>
                                <Link
                                    to='/blogs'
                                    className={`inline-flex items-center gap-2 text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-200 active:scale-[0.98] shadow-sm ${
                                        isDark
                                            ? 'bg-[#ededf1] hover:bg-white text-[#070708]'
                                            : 'bg-slate-900 hover:bg-black text-white'
                                    }`}
                                >
                                    <span>Read Blog Posts</span>
                                    <FiArrowRight className='text-sm' />
                                </Link>
                                <Link
                                    to='/notes'
                                    className={`inline-flex items-center gap-2 text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-200 active:scale-[0.98] shadow-sm ${
                                        isDark
                                            ? 'border border-white/20 bg-white/5 hover:bg-white/10 text-white'
                                            : 'border border-gray-300 hover:border-gray-800 hover:bg-gray-100 text-gray-900'
                                    }`}
                                >
                                    <FiBookOpen className='text-sm' />
                                    <span>Explore Notes</span>
                                </Link>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    )
}

export default Experience

