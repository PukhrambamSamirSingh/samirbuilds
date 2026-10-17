import React, { useEffect, useState } from 'react'
import BlogSingle from '../components/BlogSingle'
import BlogChain from '../components/BlogChain'
import Navbar from '../components/Navbar'
import { useTheme } from '../context/ThemeContext'

const Blogs = () => {
    const [blogs, setBlogs] = useState([])
    const [loading, setLoading] = useState(true)
    const { theme } = useTheme()

    const fetchBlogs = async () => {
        const url = "http://127.0.0.1:8000/blogs"
        try {
            const res = await fetch(url)
            if(!res.ok){
                throw new Error(`Response status: ${res.status}`);
            }
            const result = await res.json()
            setBlogs(result)
        } catch (error) {
            console.error(error.message)
        } finally {
            setLoading(false)
        }
    }
    
    useEffect(()=>{
        fetchBlogs()
    }, [])

    const new_blog = blogs.slice(0, 1)
    const old_blogs = blogs.slice(1)
    
    return (
        <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-slate-100 text-gray-900'} pb-12 flex flex-col justify-between transition-colors duration-300`}>
            <div>
                <Navbar />
                <main className='max-w-7xl mx-auto px-4 sm:px-8 md:px-12 lg:px-20 py-6'>
                    <h1 className={`text-3xl sm:text-4xl font-extrabold mb-8 border-b ${theme === 'dark' ? 'border-gray-700 text-white' : 'border-gray-300 text-gray-900'} pb-4`}>
                        Articles & Insights
                    </h1>
                    {loading ? (
                        <div className={`flex justify-center items-center py-20 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Loading articles...
                        </div>
                    ) : blogs.length === 0 ? (
                        <div className={`text-center py-20 ${theme === 'dark' ? 'text-gray-400 bg-gray-900/40 border-gray-700' : 'text-gray-600 bg-white border-gray-200'} rounded-2xl border`}>
                            No blogs found yet. Be the first to create one!
                        </div>
                    ) : (
                        <div className='flex flex-col lg:flex-row gap-8 items-start relative'>
                            {/* Featured / Newest Blog */}
                            <div className='w-full lg:w-2/3'>
                                {new_blog.map((blog)=>(
                                    <BlogSingle key={blog._id} blog={blog}/>
                                ))}
                            </div>

                            {/* Sidebar / Older Blogs */}
                            <div className='w-full lg:w-1/3 flex flex-col gap-6 lg:sticky lg:top-8 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto pr-1 scrollbar-none'>
                                <h3 className={`text-xl font-bold border-b ${theme === 'dark' ? 'text-gray-200 border-gray-700' : 'text-gray-800 border-gray-300'} pb-2 hidden lg:block`}>
                                    More Articles
                                </h3>
                                {old_blogs.map((blog)=>(
                                    <BlogChain key={blog._id} blog={blog}/>
                                ))}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}

export default Blogs