import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { isBlogAuthor } from '../utils/authUtils'
import { cleanDuplicateTitle } from '../utils/markdownUtils'
import { FiEdit2, FiTrash2, FiArrowRight } from 'react-icons/fi'

const BlogSingle = ({ blog, onDelete, onEdit }) => {
    const navigate = useNavigate()
    const { theme } = useTheme()
    const dark = theme === 'dark'

    const capitalizeFirstLetter = (text) => {
        if (!text) return ''
        return text.charAt(0).toUpperCase() + text.slice(1)
    }

    if (!blog) return null

    const canManage = isBlogAuthor(blog)

    return (
        <article className="w-full flex flex-col gap-4 p-2 sm:p-4 rounded-none border-0 border-none transition-all duration-300 ease-out hover:-translate-y-1 bg-transparent">
            <div className={`flex flex-col gap-2.5 sm:gap-3 w-full ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                {/* Header Meta with Tag, Date, and Author Actions */}
                <div className='flex items-center justify-between gap-3 flex-wrap'>
                    <div className='flex items-center gap-2.5 flex-wrap'>
                        <span className='inline-block text-xs font-semibold px-2.5 py-1 bg-blue-900/50 text-blue-300 rounded-none border-0 border-none uppercase tracking-wide'>
                            {capitalizeFirstLetter(blog.tag || 'web')}
                        </span>
                        <span className={`${dark ? 'text-gray-400' : 'text-gray-500'} italic text-xs sm:text-sm font-light`}>
                            {blog.published_at ? new Date(blog.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}
                        </span>
                    </div>

                    {/* Author Controls */}
                    {canManage && (
                        <div className='flex items-center gap-2'>
                            {onEdit && (
                                <button
                                    type='button'
                                    onClick={() => onEdit(blog)}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer border ${
                                        dark 
                                            ? 'border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400' 
                                            : 'border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700'
                                    }`}
                                    title='Edit Article'
                                >
                                    <FiEdit2 className='text-xs' />
                                    <span>Edit</span>
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    type='button'
                                    onClick={() => onDelete(blog)}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer border ${
                                        dark 
                                            ? 'border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400' 
                                            : 'border-red-200 bg-red-50 hover:bg-red-100 text-red-600'
                                    }`}
                                    title='Delete Article'
                                >
                                    <FiTrash2 className='text-xs' />
                                    <span>Delete</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Cover Image - Height matched to screenshot level (~320-330px) */}
                {blog.img && (
                    <Link to={`/blogs/${blog.slug || blog._id}`} className='group overflow-hidden rounded-none block'>
                        <img 
                            className='w-full h-56 sm:h-64 md:h-80 lg:h-[330px] object-cover rounded-none border-0 border-none transition-transform duration-300 group-hover:scale-[1.01]'
                            src={blog.img} 
                            alt={blog.title || 'Blog cover'} 
                        />
                    </Link>
                )}

                {/* Title */}
                <h2 className={`text-xl sm:text-2xl font-bold tracking-tight leading-snug hover:text-blue-500 transition-colors ${
                    dark ? 'text-white' : 'text-gray-900'
                }`}>
                    <Link to={`/blogs/${blog.slug || blog._id}`}>{blog.title}</Link>
                </h2>

                {/* Excerpt */}
                <p className={`${dark ? 'text-gray-300' : 'text-gray-600'} text-sm leading-relaxed`}>
                    {(() => { const desc = cleanDuplicateTitle(blog.title, blog.description); return desc ? (desc.length > 220 ? desc.slice(0, 220) + '...' : desc) : ''; })()}
                </p>

                {/* Author attribution & Read More */}
                <div className='flex items-center justify-between gap-4 pt-1 flex-wrap'>
                    <Link to={`/blogs/${blog.slug || blog._id}`} className='italic text-xs sm:text-sm text-blue-500 hover:text-blue-400 underline inline-flex items-center gap-1 font-medium'>
                        <span>Read Full Article</span>
                        <FiArrowRight className='text-sm' />
                    </Link>
                    {blog.author && (
                        <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'} font-medium`}>
                            by {blog.author}
                        </p>
                    )}
                </div>
            </div>
        </article>
    )
}

export default BlogSingle
