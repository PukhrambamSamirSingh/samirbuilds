import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BlogSingle from '../components/BlogSingle'
import BlogChain from '../components/BlogChain'
import AddBlog from '../components/AddBlog'
import DeleteBlogModal from '../components/DeleteBlogModal'
import Navbar from '../components/Navbar'
import { useTheme } from '../context/ThemeContext'
import LoadingSpinner from '../components/LoadingSpinner'
import { deleteBlogApi } from '../utils/authUtils'
import { FiSearch, FiPlus } from 'react-icons/fi'

const Blogs = () => {
    const navigate = useNavigate()
    const { theme } = useTheme()
    const dark = theme === 'dark'

    const [blogs, setBlogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [openAdd, setOpenAdd] = useState(false)
    const [blogToDelete, setBlogToDelete] = useState(null)
    const [blogToEdit, setBlogToEdit] = useState(null)
    const [deleting, setDeleting] = useState(false)
    const [deleteError, setDeleteError] = useState(null)

    const fetchBlogs = async () => {
        setLoading(true)
        let remoteBlogs = []
        let localBlogs = []

        // 1. Read locally saved blogs
        try {
            const rawLocal = localStorage.getItem('samirbuilds_blogs')
            if (rawLocal) {
                localBlogs = JSON.parse(rawLocal)
            }
        } catch (e) {
            console.error('Error reading local blogs:', e)
        }

        // 2. Fetch server blogs
        try {
            const res = await fetch('http://127.0.0.1:8000/blogs')
            if (res.ok) {
                const result = await res.json()
                if (Array.isArray(result)) {
                    remoteBlogs = result
                }
            }
        } catch (error) {
            console.warn('Backend server blogs unreachable, using local cache:', error.message)
        }

        // 3. Combine unique blogs (local first, then remote)
        const combinedMap = new Map()
        localBlogs.forEach(b => combinedMap.set(b._id || b.slug || b.title, b))
        remoteBlogs.forEach(b => combinedMap.set(b._id || b.slug || b.title, b))

        const combined = Array.from(combinedMap.values()).sort((a, b) => {
            const dateA = a.published_at ? new Date(a.published_at).getTime() : 0
            const dateB = b.published_at ? new Date(b.published_at).getTime() : 0
            return dateB - dateA
        })

        setBlogs(combined)
        setLoading(false)
    }

    useEffect(() => {
        fetchBlogs()
    }, [])

    const handleNewBlogClick = () => {
        const token = localStorage.getItem('token')
        if (!token) {
            navigate('/signup')
            return
        }
        setBlogToEdit(null)
        setOpenAdd(true)
    }

    const handleConfirmDelete = async () => {
        if (!blogToDelete) return
        setDeleting(true)
        setDeleteError(null)
        try {
            await deleteBlogApi(blogToDelete)
            setBlogToDelete(null)
            setDeleteError(null)
            await fetchBlogs()
        } catch (err) {
            setDeleteError(err.message || 'Failed to delete article')
        } finally {
            setDeleting(false)
        }
    }

    // Filter blogs based on search query
    const filteredBlogs = blogs.filter(blog => {
        const q = searchQuery.toLowerCase().trim()
        return !q || 
            (blog.title?.toLowerCase().includes(q)) || 
            (blog.description?.toLowerCase().includes(q)) ||
            (blog.tag?.toLowerCase().includes(q))
    })

    const new_blog = filteredBlogs.slice(0, 1)
    const old_blogs = filteredBlogs.slice(1)

    return (
        <div className={`min-h-screen ${dark ? 'bg-black text-white' : 'bg-slate-50 text-gray-900'} pb-16 flex flex-col justify-between transition-colors duration-300 font-sans`}>
            <div>
                <Navbar />

                <main className='max-w-[1320px] mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-8 pt-6 md:pt-10 pb-8 md:pb-14'>
                    {/* ── Action & Search Toolbar ── */}
                    <div className='flex flex-row items-center justify-between gap-4 mb-8'>
                        {/* Left: Latest Button */}
                        <button
                            type='button'
                            onClick={() => setSearchQuery('')}
                            className='inline-flex items-center gap-2 bg-[#ededf1] hover:bg-white text-[#070708] font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-full transition-all duration-200 active:scale-[0.98] shadow-sm cursor-pointer border-0 border-none shrink-0'
                        >
                            <span>Latest</span>
                        </button>
                        {/* Right: Search Input */}
                        <div className='relative w-full max-w-xs sm:w-72'>
                            <FiSearch className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-sm ${dark ? 'text-gray-500' : 'text-gray-400'}`} />
                            <input
                                type='text'
                                placeholder='Search articles, topics...'
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm border-0 border-none outline-none transition ${
                                    dark 
                                        ? 'bg-gray-900 text-white placeholder-gray-500 focus:ring-1 focus:ring-blue-500' 
                                        : 'bg-white text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-blue-500'
                                }`}
                            />
                            {searchQuery && (
                                <button
                                    type='button'
                                    onClick={() => setSearchQuery('')}
                                    className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold hover:text-red-400 ${
                                        dark ? 'text-gray-500' : 'text-gray-400'
                                    }`}
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ── Content View ── */}
                    {loading ? (
                        <LoadingSpinner />
                    ) : filteredBlogs.length === 0 ? (
                        <div className={`flex flex-col items-center justify-center py-20 gap-4 rounded-2xl border-0 border-none text-center p-8 ${
                            dark ? 'bg-gray-900/40 text-gray-400' : 'bg-white text-gray-500'
                        }`}>
                            <div className='w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-3xl mb-2 text-blue-500'>
                                📝
                            </div>
                            <h3 className='text-lg font-bold text-gray-900 dark:text-white'>
                                No matching articles found
                            </h3>
                            <p className='text-xs sm:text-sm max-w-md'>
                                {searchQuery 
                                    ? `No articles matched query "${searchQuery}".` 
                                    : 'Be the first to publish a technical blog article!'}
                            </p>
                            <div className='flex gap-3 mt-4 flex-wrap justify-center'>
                                {searchQuery && (
                                    <button
                                        type='button'
                                        onClick={() => setSearchQuery('')}
                                        className={`px-5 py-2.5 rounded-full text-xs font-semibold border transition-all active:scale-[0.98] cursor-pointer ${
                                            dark ? 'border-white/15 bg-white/5 text-[#ededf1] hover:bg-white/10' : 'border-gray-300 bg-white text-gray-800 hover:bg-gray-50'
                                        }`}
                                    >
                                        Clear search
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* Two-Column Layout: Left 60%, Right 40% */
                        <div className='grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10 items-start relative'>
                            {/* Featured / Newest Blog (60% width) */}
                            <div className='w-full lg:col-span-3'>
                                {new_blog.map(blog => (
                                    <BlogSingle 
                                        key={blog._id || blog.slug || blog.title} 
                                        blog={blog}
                                        onEdit={(b) => {
                                            setBlogToEdit(b)
                                            setOpenAdd(true)
                                        }}
                                        onDelete={(b) => {
                                            setDeleteError(null)
                                            setBlogToDelete(b)
                                        }}
                                    />
                                ))}
                            </div>

                            {/* Sidebar / Older Blogs (40% width) */}
                            <div className='w-full lg:col-span-2 flex flex-col gap-6 sm:gap-7 lg:sticky lg:top-8 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto pr-1 scrollbar-none'>
                                {old_blogs.map(blog => (
                                    <BlogChain 
                                        key={blog._id || blog.slug || blog.title} 
                                        blog={blog}
                                        onEdit={(b) => {
                                            setBlogToEdit(b)
                                            setOpenAdd(true)
                                        }}
                                        onDelete={(b) => {
                                            setDeleteError(null)
                                            setBlogToDelete(b)
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Create & Edit Blog Modal */}
            <AddBlog 
                openAdd={openAdd}
                setOpenAdd={setOpenAdd}
                blogToEdit={blogToEdit}
                onBlogAdded={() => fetchBlogs()}
                onBlogUpdated={() => fetchBlogs()}
            />

            {/* Delete Blog Confirmation Modal */}
            <DeleteBlogModal
                isOpen={!!blogToDelete}
                blog={blogToDelete}
                onClose={() => {
                    setBlogToDelete(null)
                    setDeleteError(null)
                }}
                onConfirm={handleConfirmDelete}
                loading={deleting}
                error={deleteError}
            />
        </div>
    )
}

export default Blogs
