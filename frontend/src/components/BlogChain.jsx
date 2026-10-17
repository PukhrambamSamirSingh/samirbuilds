import React from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

const BlogChain = ({blog}) => {
    const { theme } = useTheme()
    const capitalizeFirstLetter = (text) => {
        if (!text) return "";
        return text.charAt(0).toUpperCase() + text.slice(1);
    }
    
    if (!blog) return null;

    return (
        <article className={`flex flex-col gap-2.5 w-full p-4 rounded-xl border transition-all ${theme === 'dark' ? 'bg-gray-900/60 border-gray-700 hover:border-gray-600 text-gray-300' : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700 shadow-sm'}`}>
            <span className={`italic text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {blog.published_at ? new Date(blog.published_at).toDateString() : ''}
            </span>
            {blog.img && (
                <img className={`w-full h-44 sm:h-48 md:h-52 object-cover rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`} src={blog.img} alt={blog.title || "Blog cover"} />
            )}
            <span className='inline-block self-start text-[10px] font-semibold px-2 py-0.5 bg-blue-900/40 text-blue-400 rounded border border-blue-700/50 uppercase tracking-wide'>
                {capitalizeFirstLetter(blog.tag)}
            </span>
            <h3 className={`text-lg font-bold line-clamp-2 leading-snug hover:text-blue-500 transition-colors ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <Link to={`/blogs/${blog.slug}`}>{blog.title}</Link>
            </h3>
            <p className={`text-xs line-clamp-3 leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {blog.description}
            </p>
            <div className='pt-1'>
                <Link to={`/blogs/${blog.slug}`} className='italic text-xs text-blue-500 hover:text-blue-400 underline font-medium'>
                    Read More →
                </Link>
            </div>
            {blog.author && (
                <p className={`text-[11px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>by {blog.author}</p>
            )}
        </article>
    )
}

export default BlogChain