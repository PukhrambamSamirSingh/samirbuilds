import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import MarkdownRenderer from './MarkdownRenderer'
import { getPlainTextExcerpt, calculateReadingStats, titleToSlug, cleanDuplicateTitle } from '../utils/markdownUtils'
import { isNoteAuthor } from '../utils/authUtils'
import { FiCopy, FiCheck, FiBookOpen, FiMaximize2, FiMinimize2, FiArrowRight, FiTrash2, FiEdit2 } from 'react-icons/fi'

/* ── Tag config ─────────────────────────────────────────────────── */
const TAG_META = {
    'ai/ml':   { dark: 'bg-purple-950/60 text-purple-300', light: 'bg-purple-100 text-purple-700', bar: '#a855f7' },
    'web':     { dark: 'bg-blue-950/60 text-blue-300',       light: 'bg-blue-100 text-blue-700',       bar: '#3b82f6' },
    'python':  { dark: 'bg-yellow-950/60 text-yellow-300', light: 'bg-yellow-100 text-yellow-700', bar: '#eab308' },
    'math':    { dark: 'bg-emerald-950/60 text-emerald-300', light: 'bg-emerald-100 text-emerald-700', bar: '#10b981' },
    'general': { dark: 'bg-zinc-900 text-zinc-300',          light: 'bg-gray-100 text-gray-600',       bar: '#71717a' },
    'other':   { dark: 'bg-pink-950/60 text-pink-300',       light: 'bg-pink-100 text-pink-700',       bar: '#ec4899' },
}

const getTag = (tag, dark) => {
    const key = tag?.toLowerCase() || 'general'
    return TAG_META[key] || TAG_META['general']
}

/* ─────────────────────────────────────────────────────────────────
   FEATURED CARD  (Exact Dark Canvas Design from Screenshots)
───────────────────────────────────────────────────────────────── */
export function NoteFeatured({ note, isLatest = true, onDelete, onEdit }) {
    const { theme } = useTheme()
    const dark = theme === 'dark'
    const [copied, setCopied] = useState(false)
    const [expanded, setExpanded] = useState(false)

    if (!note) return null

    const canDelete = isNoteAuthor(note)
    const tag = getTag(note?.tag, dark)
    const tagClass = dark ? tag.dark : tag.light
    const { wordCount, readingTime } = calculateReadingStats(note.content || '')

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(note.content || '')
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy note content: ', err)
        }
    }

    const isLongNote = (note.content?.length || 0) > 2200

    const rawContent = note.content || ''
    const titleTrimmed = (note.title || '').trim().toLowerCase()
    const contentTrimmed = rawContent.trim().toLowerCase()
    const contentWithoutFences = contentTrimmed.replace(/^```[a-z0-9_-]*\s*/i, '')
    const isTitleDiagramSyntax = /^(?:flowchart|graph)\s+(?:td|tb|bt|rl|lr)|^(?:sequencediagram|classdiagram|statediagram|erdiagram|gantt|gitgraph|mindmap|pie)/i.test(titleTrimmed)
    const hasTitleAtStart = isTitleDiagramSyntax || (contentTrimmed && (
        contentTrimmed.startsWith(titleTrimmed) ||
        contentTrimmed.startsWith('# ' + titleTrimmed) ||
        contentTrimmed.startsWith('## ' + titleTrimmed) ||
        contentTrimmed.startsWith('### ' + titleTrimmed) ||
        contentWithoutFences.startsWith(titleTrimmed)
    ))
    const hasHeadingTag = /^#{1,4}\s+/.test(rawContent.trim())
    const markdownContent = isTitleDiagramSyntax
        ? rawContent
        : (hasHeadingTag
            ? rawContent
            : (note.title
                ? `# ${note.title}\n\n${cleanDuplicateTitle(note.title, rawContent)}`
                : rawContent))

    return (
        <article className={`relative w-full flex flex-col transition-all duration-200 border-0 border-none shadow-none bg-transparent ${
            dark ? 'text-zinc-100' : 'text-gray-900'
        }`}>
            <div className='flex flex-col gap-6 px-0 py-2'>
                {/* Meta header bar */}
                <div className='flex items-center justify-between flex-wrap gap-4 pb-4 border-0 border-none'>
                    <div className='flex items-center gap-3 flex-wrap'>
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border-0 border-none ${tagClass}`}>
                            <span className='w-1.5 h-1.5 rounded-full' style={{ background: tag.bar }} />
                            {note.tag || 'general'}
                        </span>
                        {note.published_at && (
                            <span className={`text-xs font-medium ${dark ? 'text-zinc-400' : 'text-gray-500'}`}>
                                {new Date(note.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                        )}
                        <span className={`text-xs font-medium italic ${dark ? 'text-zinc-400' : 'text-gray-500'}`}>
                            · {readingTime}
                        </span>
                        {isLatest && (
                            <span className='text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border-0 border-none'>
                                Featured
                            </span>
                        )}
                    </div>

                    {/* Actions: Copy & Delete */}
                    <div className='flex items-center gap-2'>
                        <button
                            type='button'
                            onClick={handleCopy}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border-0 border-none shadow-none transition cursor-pointer ${
                                dark 
                                    ? 'bg-gray-900 text-zinc-300 hover:text-white hover:bg-gray-800' 
                                    : 'bg-slate-200/80 text-gray-700 hover:text-gray-900 hover:bg-slate-300'
                            }`}
                            title='Copy raw note content'
                        >
                            {copied ? (
                                <>
                                    <FiCheck className='text-emerald-400' />
                                    <span className='text-emerald-400 font-medium'>Copied</span>
                                </>
                            ) : (
                                <>
                                    <FiCopy />
                                    <span>Copy Note</span>
                                </>
                            )}
                        </button>

                        {canDelete && (
                            <>
                                <button
                                    type='button'
                                    onClick={() => onEdit && onEdit(note)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border-0 border-none shadow-none transition cursor-pointer ${
                                        dark 
                                            ? 'bg-blue-500/15 text-blue-400 hover:text-blue-300 hover:bg-blue-500/25' 
                                            : 'bg-blue-50 text-blue-600 hover:text-blue-700 hover:bg-blue-100'
                                    }`}
                                    title='Update this note'
                                >
                                    <FiEdit2 className='text-xs' />
                                    <span>Update Note</span>
                                </button>

                                <button
                                    type='button'
                                    onClick={() => onDelete && onDelete(note)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border-0 border-none shadow-none transition cursor-pointer ${
                                        dark 
                                            ? 'bg-red-500/15 text-red-400 hover:text-red-300 hover:bg-red-500/25' 
                                            : 'bg-red-50 text-red-600 hover:text-red-700 hover:bg-red-100'
                                    }`}
                                    title='Delete note'
                                >
                                    <FiTrash2 className='text-xs' />
                                    <span>Delete Note</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Full Rich Markdown & LaTeX Math Content */}
                <div className={`relative transition-all ${
                    isLongNote && !expanded ? 'max-h-[1100px] overflow-hidden' : ''
                }`}>
                    <MarkdownRenderer content={markdownContent} />

                    {/* Gradient Fade if Collapsed */}
                    {isLongNote && !expanded && (
                        <div className={`absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t pointer-events-none flex items-end justify-center pb-4 ${
                            dark ? 'from-black via-black/90 to-transparent' : 'from-slate-50 via-slate-50/90 to-transparent'
                        }`} />
                    )}
                </div>

                {/* Read More / Collapse Toggle for Long Notes */}
                {isLongNote && (
                    <div className='flex justify-center pt-2'>
                        <button
                            type='button'
                            onClick={() => setExpanded(prev => !prev)}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold border-0 border-none shadow-none transition-all cursor-pointer ${
                                dark 
                                    ? 'bg-gray-900 hover:bg-gray-800 text-white' 
                                    : 'bg-slate-200/90 hover:bg-slate-300 text-gray-900'
                            }`}
                        >
                            {expanded ? (
                                <>
                                    <FiMinimize2 /> Show less
                                </>
                            ) : (
                                <>
                                    <FiMaximize2 /> Continue reading full deep dive ({wordCount} words)
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* Card Footer */}
                <div className={`flex items-center justify-between flex-wrap gap-3 pt-5 border-0 border-none`}>
                    <div className={`flex items-center gap-2 text-xs ${dark ? 'text-zinc-400' : 'text-gray-500'}`}>
                        <FiBookOpen className='text-sm text-blue-400' />
                        <span>Visual LaTeX Math, Matrices & Pipeline Enabled</span>
                    </div>
                    <div className={`text-xs font-mono ${dark ? 'text-zinc-400' : 'text-gray-500'}`}>
                        {wordCount} words · {readingTime}
                    </div>
                </div>
            </div>
        </article>
    )
}

/* ─────────────────────────────────────────────────────────────────
   GRID CARD (3-4 Column Grid format matching the right card design)
   Navigates to /notes/:slug with title in small letters in URL
───────────────────────────────────────────────────────────────── */
export function NoteGridCard({ note, onDelete, onEdit }) {
    const { theme } = useTheme()
    const dark = theme === 'dark'

    if (!note) return null

    const canDelete = isNoteAuthor(note)
    const tag = getTag(note?.tag, dark)
    const tagClass = dark ? tag.dark : tag.light
    const preview = getPlainTextExcerpt(note.content, 130)
    const { readingTime } = calculateReadingStats(note.content || '')
    const slug = note.slug || titleToSlug(note.title)
    const formattedDate = note.published_at 
        ? new Date(note.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
        : 'Recently'

    return (
        <Link
            to={`/notes/${slug}`}
            className={`group relative flex flex-col justify-between rounded-2xl p-5 transition-all duration-200 select-none cursor-pointer border-0 border-none shadow-none ${
                dark 
                    ? 'bg-gray-900/60 hover:bg-gray-900' 
                    : 'bg-slate-100/80 hover:bg-slate-200/80'
            }`}
        >
            <div className='flex flex-col gap-3'>
                {/* Meta header: tag pill on left, date on right */}
                <div className='flex items-center justify-between gap-2 flex-wrap'>
                    <div className='flex items-center gap-2'>
                        <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border-0 border-none ${tagClass}`}>
                            {note.tag || 'general'}
                        </span>
                        {canDelete && (
                            <div className='flex items-center gap-0.5'>
                                {onEdit && (
                                    <button
                                        type='button'
                                        onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            onEdit(note)
                                        }}
                                        className='p-1 rounded-full text-blue-500/70 hover:text-blue-400 hover:bg-blue-500/15 transition cursor-pointer'
                                        title='Update note'
                                        aria-label='Update note'
                                    >
                                        <FiEdit2 className='text-xs' />
                                    </button>
                                )}
                                {onDelete && (
                                    <button
                                        type='button'
                                        onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            onDelete(note)
                                        }}
                                        className='p-1 rounded-full text-red-500/70 hover:text-red-400 hover:bg-red-500/15 transition cursor-pointer'
                                        title='Delete note'
                                        aria-label='Delete note'
                                    >
                                        <FiTrash2 className='text-xs' />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                    <span className={`text-[11px] font-medium ${dark ? 'text-zinc-500' : 'text-gray-400'}`}>
                        {formattedDate}
                    </span>
                </div>

                {/* Title matching heading color */}
                <h3 className={`text-base font-bold line-clamp-2 leading-snug transition-colors ${
                    dark ? 'text-white group-hover:text-zinc-300' : 'text-gray-900 group-hover:text-gray-700'
                }`}>
                    {note.title}
                </h3>

                {/* Plain-text excerpt */}
                <p className={`text-xs line-clamp-3 leading-relaxed ${dark ? 'text-zinc-400' : 'text-gray-600'}`}>
                    {preview}
                </p>
            </div>

            {/* Footer with reading time and subtle arrow */}
            <div className={`pt-4 mt-4 flex items-center justify-between text-xs border-0 border-none ${
                dark ? 'text-zinc-400' : 'text-gray-500'
            }`}>
                <span className='text-[11px] font-medium'>
                    {readingTime}
                </span>
                <span className={`inline-flex items-center gap-1 text-[11px] font-semibold transition-transform duration-200 group-hover:translate-x-1 ${
                    dark ? 'text-zinc-300' : 'text-gray-700'
                }`}>
                    Read note <FiArrowRight className='text-xs' />
                </span>
            </div>
        </Link>
    )
}

/* ─────────────────────────────────────────────────────────────────
   SIDEBAR CARD (Selectable card for sidebars or lists)
───────────────────────────────────────────────────────────────── */
export function NoteSidebarCard({ note, isSelected = false, onSelect }) {
    const { theme } = useTheme()
    const dark = theme === 'dark'

    if (!note) return null

    const tag = getTag(note?.tag, dark)
    const tagClass = dark ? tag.dark : tag.light
    const preview = getPlainTextExcerpt(note.content, 110)
    const { readingTime } = calculateReadingStats(note.content || '')
    const slug = note.slug || titleToSlug(note.title)

    const content = (
        <article
            onClick={() => onSelect && onSelect(note)}
            className={`group relative flex flex-col gap-2 rounded-xl p-4 cursor-pointer transition-all duration-200 select-none border-0 border-none shadow-none ${
                isSelected
                    ? dark
                        ? 'bg-[#0f1118]'
                        : 'bg-blue-50/50'
                    : dark
                        ? 'bg-[#060608] hover:bg-zinc-900/40 text-zinc-300'
                        : 'bg-white hover:bg-gray-50/80 text-gray-700'
            }`}
        >
            <div className='flex flex-col gap-2'>
                {/* Meta */}
                <div className='flex items-center justify-between gap-2 flex-wrap'>
                    <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border-0 border-none ${tagClass}`}>
                        {note.tag || 'general'}
                    </span>
                    <span className={`italic text-[10px] ${dark ? 'text-zinc-500' : 'text-gray-400'}`}>
                        {note.published_at ? new Date(note.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                    </span>
                </div>

                {/* Title */}
                <h3 className={`text-sm font-bold line-clamp-2 leading-snug transition-colors ${
                    isSelected 
                        ? dark ? 'text-white' : 'text-gray-900'
                        : dark ? 'text-white group-hover:text-zinc-300' : 'text-gray-900 group-hover:text-gray-700'
                }`}>
                    {note.title}
                </h3>

                {/* Excerpt */}
                <p className={`text-xs line-clamp-2 leading-relaxed ${dark ? 'text-zinc-400' : 'text-gray-600'}`}>
                    {preview}
                </p>

                <div className='flex items-center justify-between text-[10px] pt-1'>
                    <span className={dark ? 'text-zinc-500' : 'text-gray-400'}>
                        {readingTime}
                    </span>
                    {isSelected && (
                        <span className='text-blue-400 font-semibold text-[10px]'>
                            ● Active
                        </span>
                    )}
                </div>
            </div>
        </article>
    )

    if (onSelect) {
        return content
    }

    return (
        <Link to={`/notes/${slug}`} className='block'>
            {content}
        </Link>
    )
}

export const NoteCard = NoteGridCard
export default NoteFeatured

