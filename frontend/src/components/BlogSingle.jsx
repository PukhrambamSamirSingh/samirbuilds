import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import AddBlog from './AddBlog'
import { useTheme } from '../context/ThemeContext'

const BlogSingle = ({blog}) => {
    const [openAdd, setOpenAdd] = useState(false)
    const { theme } = useTheme()
    
    const capitalizeFirstLetter = (text) => {
        if (!text) return "";
        return text.charAt(0).toUpperCase() + text.slice(1);
    }
    
    if (!blog) return null;

    return (
        <article className={`w-full flex flex-col gap-6 p-4 sm:p-6 rounded-2xl border ${theme === 'dark' ? 'bg-gray-900/60 border-gray-700 shadow-xl' : 'bg-white border-gray-200 shadow-md'}`}>
            <div className={`flex flex-col gap-3 w-full ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} italic text-xs sm:text-sm font-light`}>
                    {blog.published_at ? new Date(blog.published_at).toDateString() : ''}
                </span>
                {blog.img && (
                    <img 
                        className={`w-full h-56 sm:h-72 md:h-96 lg:h-[28rem] object-cover rounded-xl border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
                        src={blog.img} 
                        alt={blog.title || "Blog cover"} 
                    />
                )}
                <span className='inline-block self-start text-xs font-semibold px-2.5 py-1 bg-blue-900/50 text-blue-300 rounded-md border border-blue-700/50 uppercase tracking-wide'>
                    {capitalizeFirstLetter(blog.tag)}
                </span>
                <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-snug ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {blog.title}
                </h2>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-sm sm:text-base leading-relaxed`}>
                    {blog.description ? (blog.description.length > 200 ? blog.description.slice(0, 200) + "..." : blog.description) : ""}
                </p>
                <div className='pt-1'>
                    <Link to={`/blogs/${blog.slug}`} className='italic text-sm text-blue-500 hover:text-blue-400 underline inline-flex items-center gap-1 font-medium'>
                        Read Full Article →
                    </Link>
                </div>
                {blog.author && (
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} font-medium`}>by {blog.author}</p>
                )}
            </div>
            <button 
                type='button'
                className='px-5 py-2.5 border border-blue-500 text-blue-500 hover:bg-blue-600 hover:text-white font-semibold rounded-xl text-xs sm:text-sm text-center cursor-pointer transition-all w-full sm:w-auto self-start shadow-md' 
                onClick={()=>{setOpenAdd(true)}}
            >
                + Add New Blog
            </button>
            {openAdd && (
                <AddBlog openAdd={openAdd} setOpenAdd={setOpenAdd}/>
            )}
        </article>
    )
}

export default BlogSingle