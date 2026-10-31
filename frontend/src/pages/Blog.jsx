import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import LoadingSpinner from '../components/LoadingSpinner'
import AddBlog from '../components/AddBlog'
import DeleteBlogModal from '../components/DeleteBlogModal'
import MarkdownRenderer from '../components/MarkdownRenderer'
import { isBlogAuthor, deleteBlogApi } from '../utils/authUtils'
import { cleanDuplicateTitle } from '../utils/markdownUtils'
import { FiArrowLeft, FiEdit2, FiTrash2, FiTag } from 'react-icons/fi'

const Blog = () => {
    const { pathname } = useLocation()
    const navigate = useNavigate()
    const { theme } = useTheme()
    const dark = theme === 'dark'

    const capitalizeFirstLetter = (text) => {
        if (!text) return ''
        return text.charAt(0).toUpperCase() + text.slice(1)
    }

    const [blog, setBlog] = useState(null)
    const [loading, setLoading] = useState(true)
    const [openEdit, setOpenEdit] = useState(false)
    const [openDelete, setOpenDelete] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [deleteError, setDeleteError] = useState(null)

    const fetchBlog = async () => {
        setLoading(true)
        const slug = pathname.split('/')[2]
        const targetSlug = (slug || '').toLowerCase().trim()

        let foundBlog = null

        // 1. Try fetching from backend API
        try {
            const url = `http://127.0.0.1:8000/blogs/${targetSlug}`
            const res = await fetch(url)
            if (res.ok) {
                const result = await res.json()
                if (result && result.title) {
                    foundBlog = result
                }
            }
        } catch (error) {
            console.warn('Backend blog fetch failed, checking local storage:', error.message)
        }

        // 2. If not found, check local storage
        if (!foundBlog) {
            try {
                const rawLocal = localStorage.getItem('samirbuilds_blogs')
                if (rawLocal) {
                    const localBlogs = JSON.parse(rawLocal)
                    foundBlog = localBlogs.find(b => {
                        const bSlug = (b.slug || '').toLowerCase()
                        return bSlug === targetSlug || b._id === targetSlug
                    })
                }
            } catch (e) {
                console.error('Error checking local blogs:', e)
            }
        }

        setBlog(foundBlog || null)
        setLoading(false)
    }

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        fetchBlog()
    }, [pathname])

    const canManage = isBlogAuthor(blog)

    const handleConfirmDelete = async () => {
        if (!blog) return
        setDeleting(true)
        setDeleteError(null)
        try {
            await deleteBlogApi(blog)
            setOpenDelete(false)
            setDeleteError(null)
            navigate('/blogs', { replace: true })
        } catch (err) {
            setDeleteError(err.message || 'Failed to delete article')
        } finally {
            setDeleting(false)
        }
    }

    return (
        <div className={`min-h-screen ${dark ? 'bg-black text-white' : 'bg-slate-50 text-gray-900'} pb-16 flex flex-col justify-between transition-colors duration-300 font-sans`}>
            <div>
                <Navbar />

                <main className='max-w-4xl mx-auto w-full px-4 sm:px-6 md:px-8 pt-6 md:pt-10 pb-8 md:pb-14'>
                    {/* Top Navigation Bar with Back link and Author Actions */}
                    <div className='flex items-center justify-between gap-4 mb-6 flex-wrap'>
                        <Link 
                            to='/blogs' 
                            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 active:scale-[0.98] cursor-pointer ${
                                dark
                                    ? 'border border-white/20 bg-white/5 text-[#ededf1] hover:bg-white hover:text-black hover:border-white'
                                    : 'border border-gray-300 bg-white text-gray-800 hover:bg-gray-100'
                            }`}
                        >
                            <FiArrowLeft className='text-base' />
                            <span>Back to all articles</span>
                        </Link>

                        {canManage && (
                            <div className='flex items-center gap-2.5'>
                                <button
                                    type='button'
                                    onClick={() => setOpenEdit(true)}
                                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition active:scale-[0.98] cursor-pointer border ${
                                        dark 
                                            ? 'border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400' 
                                            : 'border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700'
                                    }`}
                                >
                                    <FiEdit2 className='text-xs' />
                                    <span>Edit Article</span>
                                </button>
                                <button
                                    type='button'
                                    onClick={() => {
                                        setDeleteError(null)
                                        setOpenDelete(true)
                                    }}
                                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition active:scale-[0.98] cursor-pointer border ${
                                        dark 
                                            ? 'border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400' 
                                            : 'border-red-200 bg-red-50 hover:bg-red-100 text-red-600'
                                    }`}
                                >
                                    <FiTrash2 className='text-xs' />
                                    <span>Delete Article</span>
                                </button>
                            </div>
                        )}
                    </div>
          
                    {loading ? (
                        <LoadingSpinner />
                    ) : !blog ? (
                        <div className={`text-center py-20 ${dark ? 'text-gray-400 bg-gray-900/50 border-gray-700' : 'text-gray-600 bg-white border-gray-200'} rounded-2xl border`}>
                            <h2 className='text-xl font-bold mb-2'>Blog post not found</h2>
                            <p className='text-sm mb-4'>The article you are looking for does not exist or was moved.</p>
                            <Link to='/blogs' className='text-blue-500 hover:underline text-sm font-semibold'>
                                Browse All Articles →
                            </Link>
                        </div>
                    ) : (
                        <article className='flex flex-col gap-6 p-2 sm:p-4 rounded-none border-0 border-none bg-transparent shadow-none'>
                            <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b ${dark ? 'border-gray-800 text-gray-400' : 'border-gray-200 text-gray-500'} pb-4 text-xs sm:text-sm`}>
                                <span>
                                    Published on: <strong className={`${dark ? 'text-gray-200' : 'text-gray-800'} font-normal italic`}>{blog.published_at ? new Date(blog.published_at).toDateString() : ''}</strong>
                                </span>
                                {blog.tag && (
                                    <span className='px-3 py-1 bg-blue-900/50 text-blue-300 rounded-none border-0 text-xs uppercase font-semibold tracking-wider'>
                                        {capitalizeFirstLetter(blog.tag)}
                                    </span>
                                )}
                            </div>

                            {blog.img && (
                                <img 
                                    className='w-full max-h-[32rem] object-cover rounded-none border-0 border-none shadow-sm'
                                    src={blog.img} 
                                    alt={blog.title || 'Blog detail image'} 
                                />
                            )}

                            <h1 className={`text-xl sm:text-2xl md:text-3xl font-bold leading-snug tracking-tight ${dark ? 'text-white' : 'text-gray-900'}`}>

                                {blog.title}
                            </h1>

                            <div className={`text-sm sm:text-base md:text-lg leading-relaxed ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                                <MarkdownRenderer content={cleanDuplicateTitle(blog.title, blog.description)} />
                            </div>

                            {blog.author && (
                                <div className={`pt-6 border-t ${dark ? 'border-gray-800 text-gray-400' : 'border-gray-200 text-gray-500'} text-xs sm:text-sm flex items-center gap-2`}>
                                    <span className='w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold uppercase'>
                                        {blog.author.charAt(0)}
                                    </span>
                                    <span>Published by: <strong className={dark ? 'text-gray-200' : 'text-gray-800'}>{blog.author}</strong></span>
                                </div>
                            )}
                        </article>
                    )}
                </main>
            </div>

            {/* Edit Article Modal */}
            {openEdit && blog && (
                <AddBlog 
                    openAdd={openEdit}
                    setOpenAdd={setOpenEdit}
                    blogToEdit={blog}
                    onBlogUpdated={(updatedBlog) => {
                        setBlog(updatedBlog)
                        if (updatedBlog.slug && updatedBlog.slug !== blog.slug) {
                            navigate(`/blogs/${updatedBlog.slug}`, { replace: true })
                        }
                    }}
                />
            )}

            {/* Delete Article Confirmation Modal */}
            <DeleteBlogModal
                isOpen={openDelete}
                blog={blog}
                onClose={() => {
                    setOpenDelete(false)
                    setDeleteError(null)
                }}
                onConfirm={handleConfirmDelete}
                loading={deleting}
                error={deleteError}
            />
        </div>
    )
}

export default Blog
