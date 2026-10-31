import React from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { isBlogAuthor } from '../utils/authUtils'
import { cleanDuplicateTitle } from '../utils/markdownUtils'
import { FiEdit2, FiTrash2 } from 'react-icons/fi'

const BlogChain = ({ blog, onDelete, onEdit }) => {
    const { theme } = useTheme()
    const dark = theme === 'dark'

    if (!blog) return null

    const canManage = isBlogAuthor(blog)

    // Formatted date (e.g., "Feb 16, 2026")
    const formattedDate = blog.published_at 
        ? new Date(blog.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'Recently'

    // Estimated read time
    const textContent = `${blog.description || ''} ${blog.content || ''}`.trim()
    const wordCount = textContent ? textContent.split(/\s+/).filter(Boolean).length : 0
    const readTime = Math.max(1, Math.ceil(wordCount / 180)) || 3

    const targetUrl = `/blogs/${blog.slug || blog._id}`

    return (
        <article className="group flex flex-row items-start gap-4 sm:gap-5 w-full bg-transparent border-0 border-none transition-all duration-200">
            {/* Left: Thumbnail Image (Aspect ~ 16:10 / 4:3) */}
            <Link 
                to={targetUrl} 
                className={`shrink-0 w-28 sm:w-36 md:w-40 aspect-[16/10] rounded-lg overflow-hidden relative block ${
                    dark ? 'bg-zinc-900 border border-zinc-800' : 'bg-slate-100 border border-slate-200'
                }`}
                tabIndex={-1}
                aria-hidden="true"
            >
                {blog.img ? (
                    <img 
                        src={blog.img} 
                        alt={blog.title || 'Blog cover'} 
                        className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10">
                        <span className="text-[10px] font-bold tracking-wider uppercase text-blue-500">
                            {blog.tag || 'TECH'}
                        </span>
                    </div>
                )}
            </Link>

            {/* Right: Content details */}
            <div className="flex-1 min-w-0 flex flex-col justify-start">
                {/* Title */}
                <h4 className={`text-sm sm:text-base font-bold line-clamp-2 leading-snug tracking-tight transition-colors duration-150 ${
                    dark ? 'text-white group-hover:text-blue-400' : 'text-gray-900 group-hover:text-blue-600'
                }`}>
                    <Link to={targetUrl}>
                        {blog.title}
                    </Link>
                </h4>

                {/* Excerpt / Summary */}
                <p className={`text-xs sm:text-[13px] line-clamp-2 mt-1 leading-relaxed ${
                    dark ? 'text-zinc-400' : 'text-gray-600'
                }`}>
                    {cleanDuplicateTitle(blog.title, blog.description)}
                </p>

                {/* Meta Row: Date, Reading time, and Author controls */}
                <div className="flex items-center justify-between gap-2 mt-2 pt-0.5 text-xs text-zinc-500 dark:text-zinc-400 font-normal">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span>{formattedDate}</span>
                        <span>•</span>
                        <span>{readTime} min read</span>
                    </div>

                    {/* Author Controls */}
                    {canManage && (
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            {onEdit && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        onEdit(blog)
                                    }}
                                    className="p-1 rounded-md text-blue-400 hover:bg-blue-500/15 transition cursor-pointer"
                                    title="Edit article"
                                    aria-label="Edit article"
                                >
                                    <FiEdit2 className="text-xs" />
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        onDelete(blog)
                                    }}
                                    className="p-1 rounded-md text-red-400 hover:bg-red-500/15 transition cursor-pointer"
                                    title="Delete article"
                                    aria-label="Delete article"
                                >
                                    <FiTrash2 className="text-xs" />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </article>
    )
}

export default BlogChain
