import React from 'react'
import { useTheme } from '../context/ThemeContext'

/* ── Tag config ─────────────────────────────────────────────────── */
const TAG_META = {
    'ai/ml':   { dark: 'bg-purple-900/50 text-purple-300 border-purple-700/50', light: 'bg-purple-100 text-purple-700 border-purple-200', bar: '#a855f7' },
    'web':     { dark: 'bg-blue-900/50 text-blue-300 border-blue-700/50',       light: 'bg-blue-100 text-blue-700 border-blue-200',       bar: '#3b82f6' },
    'python':  { dark: 'bg-yellow-900/50 text-yellow-300 border-yellow-700/50', light: 'bg-yellow-100 text-yellow-700 border-yellow-200', bar: '#eab308' },
    'math':    { dark: 'bg-green-900/50 text-green-300 border-green-700/50',    light: 'bg-green-100 text-green-700 border-green-200',    bar: '#22c55e' },
    'general': { dark: 'bg-gray-800/80 text-gray-300 border-gray-600/50',       light: 'bg-gray-100 text-gray-600 border-gray-200',       bar: '#6b7280' },
    'other':   { dark: 'bg-pink-900/50 text-pink-300 border-pink-700/50',       light: 'bg-pink-100 text-pink-700 border-pink-200',       bar: '#ec4899' },
}

const getTag = (tag, dark) => {
    const key = tag?.toLowerCase() || 'general'
    return TAG_META[key] || TAG_META['general']
}

const readingTime = (text = '') => {
    const words = text.trim().split(/\s+/).length
    const mins = Math.max(1, Math.ceil(words / 200))
    return `${mins} min read`
}

/* ─────────────────────────────────────────────────────────────────
   FEATURED CARD  (left 2/3 – mirrors BlogSingle)
───────────────────────────────────────────────────────────────── */
export function NoteFeatured({ note, onNoteAdded }) {
    const { theme } = useTheme()
    const dark = theme === 'dark'
    const tag = getTag(note?.tag, dark)
    const tagClass = dark ? tag.dark : tag.light

    if (!note) return null

    const preview = note.content?.length > 500
        ? note.content.slice(0, 500) + '…'
        : note.content

    return (
        <article className={`relative w-full flex flex-col gap-5 rounded-2xl border overflow-hidden transition-all shadow-xl ${
            dark ? 'bg-gray-900/70 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300'
        }`}>
            {/* Coloured accent bar at top */}
            <div className='h-1.5 w-full' style={{ background: tag.bar }} />

            <div className='flex flex-col gap-4 px-5 sm:px-7 pb-6'>
                {/* Meta row */}
                <div className='flex items-center gap-3 flex-wrap'>
                    <span className={`inline-block text-[10px] font-semibold px-2.5 py-1 rounded-md border uppercase tracking-wide ${tagClass}`}>
                        {note.tag || 'general'}
                    </span>
                    <span className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {note.published_at ? new Date(note.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                    </span>
                    <span className={`text-xs italic ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
                        · {readingTime(note.content)}
                    </span>
                </div>

                {/* Title */}
                <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-snug ${dark ? 'text-white' : 'text-gray-900'}`}>
                    {note.title}
                </h2>

                {/* Divider */}
                <div className={`w-16 h-1 rounded-full`} style={{ background: tag.bar }} />

                {/* Content preview */}
                <p className={`text-sm sm:text-base leading-relaxed whitespace-pre-line ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {preview}
                </p>

                {/* Footer */}
                <div className={`flex items-center justify-between flex-wrap gap-3 pt-3 border-t ${dark ? 'border-gray-700/60' : 'border-gray-200'}`}>
                    <span className={`text-xs font-medium ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
                        📝 Latest note
                    </span>
                    <span className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {note.content?.split(/\s+/).length || 0} words
                    </span>
                </div>
            </div>
        </article>
    )
}

/* ─────────────────────────────────────────────────────────────────
   SIDEBAR CARD  (right 1/3 – mirrors BlogChain)
───────────────────────────────────────────────────────────────── */
export function NoteSidebarCard({ note }) {
    const { theme } = useTheme()
    const dark = theme === 'dark'
    const tag = getTag(note?.tag, dark)
    const tagClass = dark ? tag.dark : tag.light

    if (!note) return null

    const preview = note.content?.length > 120
        ? note.content.slice(0, 120) + '…'
        : note.content

    return (
        <article className={`relative flex flex-col gap-2.5 rounded-xl border overflow-hidden transition-all ${
            dark ? 'bg-gray-900/60 border-gray-700 hover:border-gray-600 text-gray-300' : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700 shadow-sm'
        }`}>
            {/* Thin coloured left accent */}
            <div className='absolute left-0 top-0 bottom-0 w-1 rounded-l-xl' style={{ background: tag.bar }} />

            <div className='pl-5 pr-4 py-4 flex flex-col gap-2'>
                {/* Meta */}
                <div className='flex items-center gap-2 flex-wrap'>
                    <span className={`inline-block text-[9px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wide ${tagClass}`}>
                        {note.tag || 'general'}
                    </span>
                    <span className={`italic text-[10px] ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {note.published_at ? new Date(note.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                    </span>
                </div>

                {/* Title */}
                <h3 className={`text-sm font-bold line-clamp-2 leading-snug ${dark ? 'text-white' : 'text-gray-900'}`}>
                    {note.title}
                </h3>

                {/* Excerpt */}
                <p className={`text-xs line-clamp-3 leading-relaxed ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {preview}
                </p>

                <span className={`text-[10px] ${dark ? 'text-gray-600' : 'text-gray-400'}`}>
                    {readingTime(note.content)}
                </span>
            </div>
        </article>
    )
}

/* Default export keeps backward compat */
export default NoteFeatured
