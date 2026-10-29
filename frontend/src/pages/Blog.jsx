import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { useLocation, Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import LoadingSpinner from '../components/LoadingSpinner'

const Blog = () => {
  const { pathname } = useLocation()
  const { theme } = useTheme()
  
  const capitalizeFirstLetter = (text) => {
        if (!text) return "";
        return text.charAt(0).toUpperCase() + text.slice(1)
  }
  
  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchBlog = async () => {
    const slug = pathname.split("/")[2]
    const url = `http://127.0.0.1:8000/blogs/${slug}`
    try {
      const res = await fetch(url)
      if (!res.ok) {
          throw new Error(`Response status: ${res.status}`)        
      }
      const result = await res.json()
      setBlog(result)
    } catch (error) {
      console.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=>{
    fetchBlog()
  }, [pathname])
  
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-black text-white' : 'bg-slate-50 text-gray-900'} pb-16 flex flex-col justify-between transition-colors duration-300 font-sans`}>
      <div>
        <Navbar/>
        <main className='max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12'>
          <Link to="/blogs" className='text-blue-500 text-xs sm:text-sm font-semibold hover:underline inline-flex items-center gap-1 mb-6'>
            ← Back to all articles
          </Link>
          
          {loading ? (
            <LoadingSpinner />
          ) : !blog ? (
            <div className={`text-center py-20 ${theme === 'dark' ? 'text-gray-400 bg-gray-900/50 border-gray-700' : 'text-gray-600 bg-white border-gray-200'} rounded-2xl border`}>
              Blog post not found.
            </div>
          ) : (
            <article className={`flex flex-col gap-6 p-4 sm:p-8 rounded-2xl border ${theme === 'dark' ? 'bg-gray-900/60 border-gray-700 shadow-2xl' : 'bg-white border-gray-200 shadow-xl'}`}>
              <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b ${theme === 'dark' ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'} pb-4 text-xs sm:text-sm`}>
                <span>
                  Published on: <strong className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'} font-normal italic`}>{blog.published_at ? new Date(blog.published_at).toDateString() : ''}</strong>
                </span>
                {blog.tag && (
                  <span className='px-3 py-1 bg-blue-900/50 text-blue-300 rounded-md border border-blue-700/50 text-xs uppercase font-semibold tracking-wider'>
                    {capitalizeFirstLetter(blog.tag)}
                  </span>
                )}
              </div>

              {blog.img && (
                <img 
                  className={`w-full max-h-[30rem] object-cover rounded-xl border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} shadow-md`}
                  src={blog.img} 
                  alt={blog.title || "Blog detail image"} 
                />
              )}

              <h1 className={`text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {blog.title}
              </h1>

              <div className={`text-sm sm:text-base md:text-lg leading-relaxed whitespace-pre-line ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {blog.description}
              </div>

              {blog.author && (
                <div className={`pt-6 border-t ${theme === 'dark' ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'} text-xs sm:text-sm flex items-center gap-2`}>
                  <span className='w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold uppercase'>
                    {blog.author.charAt(0)}
                  </span>
                  <span>Published by: <strong className={theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}>{blog.author}</strong></span>
                </div>
              )}
            </article>
          )}
        </main>
      </div>
    </div>
  )
}

export default Blog