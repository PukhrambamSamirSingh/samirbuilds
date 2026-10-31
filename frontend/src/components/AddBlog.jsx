import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MdClose } from 'react-icons/md'
import { FiUploadCloud, FiImage, FiCheck, FiX, FiTag } from 'react-icons/fi'
import { useTheme } from '../context/ThemeContext'
import { uploadMediaFile } from '../services/mediaService'
import { getCurrentUserId, getCurrentUser, getAuthToken, getAdminHeaders, getAdminToken, getAdminSecret } from '../utils/authUtils'
import { titleToSlug } from '../utils/markdownUtils'

const DEFAULT_TAGS = ['web', 'ai/ml', 'python', 'architecture', 'design', 'general']

const AddBlog = ({ openAdd, setOpenAdd, onBlogAdded, blogToEdit = null, onBlogUpdated = null }) => {
    const isEdit = !!blogToEdit
    const navigate = useNavigate()
    const { theme } = useTheme()
    const dark = theme === 'dark'
    const modalRef = useRef(null)
    const fileInputRef = useRef(null)

    const [form, setForm] = useState({
        title: '',
        description: '',
        tag: 'web',
        img: ''
    })

    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [error, setError] = useState('')

    useEffect(() => {
        if (blogToEdit) {
            setForm({
                title: blogToEdit.title || '',
                description: blogToEdit.description || '',
                tag: (blogToEdit.tag || 'web').toLowerCase(),
                img: blogToEdit.img || ''
            })
        } else {
            setForm({
                title: '',
                description: '',
                tag: 'web',
                img: ''
            })
        }
        setError('')
    }, [blogToEdit, openAdd])

    useEffect(() => {
        if (openAdd) {
            const token = getAuthToken()
            if (!token) {
                setOpenAdd(false)
                navigate('/signup')
                return
            }
            document.body.style.overflow = 'hidden'
            setTimeout(() => {
                modalRef.current?.querySelector('input')?.focus()
            }, 0)
        } else {
            document.body.style.overflow = 'auto'
        }

        return () => {
            document.body.style.overflow = 'auto'
        }
    }, [openAdd, navigate, setOpenAdd])

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!openAdd) return
            if (e.key === 'Escape') {
                setOpenAdd(false)
            }
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [openAdd, setOpenAdd])

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
    }

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        setUploadProgress(0)
        setError('')

        try {
            const result = await uploadMediaFile(file, {
                resourceType: 'image',
                onProgress: (pct) => setUploadProgress(pct)
            })

            if (result && result.url) {
                setForm(prev => ({ ...prev, img: result.url }))
            }
        } catch (err) {
            setError(err.message || 'Image upload failed. Please try providing an image URL.')
        } finally {
            setUploading(false)
            setUploadProgress(0)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const saveToLocalStorage = (blog) => {
        try {
            const raw = localStorage.getItem('samirbuilds_blogs')
            const list = raw ? JSON.parse(raw) : []
            const exists = list.some(b => b.slug === blog.slug || (blog._id && b._id === blog._id))
            if (!exists) {
                list.unshift(blog)
                localStorage.setItem('samirbuilds_blogs', JSON.stringify(list))
            }
        } catch (e) {
            console.error('Error saving blog to local storage:', e)
        }
    }

    const updateInLocalStorage = (original, updateData) => {
        try {
            const raw = localStorage.getItem('samirbuilds_blogs')
            if (raw) {
                const list = JSON.parse(raw)
                const updatedList = list.map(b => {
                    const match = (original._id && b._id === original._id) ||
                                  (original.slug && (b.slug === original.slug || b.slug === original._id)) ||
                                  (original.title && b.title === original.title)
                    if (match) {
                        return { ...b, ...updateData }
                    }
                    return b
                })
                localStorage.setItem('samirbuilds_blogs', JSON.stringify(updatedList))
            }
        } catch (e) {
            console.error('LocalStorage blog update error:', e)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!form.title.trim() || form.title.trim().length < 5) {
            setError('Article title must be at least 5 characters.')
            return
        }

        if (!form.description.trim() || form.description.trim().length < 8) {
            setError('Article description/content must be at least 8 characters.')
            return
        }

        const token = getAuthToken() || getAdminToken() || getAdminSecret()
        if (!token) {
            setOpenAdd(false)
            navigate('/admin')
            return
        }

        setLoading(true)

        const currentUser = getCurrentUser()
        const currentUserId = getCurrentUserId()

        if (isEdit && blogToEdit) {
            const blogId = blogToEdit._id || blogToEdit.slug
            const updatePayload = {
                title: form.title.trim(),
                description: form.description.trim(),
                tag: form.tag.trim().toLowerCase(),
                img: form.img.trim()
            }

            try {
                const res = await fetch(`http://127.0.0.1:8000/blog/update/${blogId}`, {
                    method: 'PUT',
                    headers: getAdminHeaders(),
                    body: JSON.stringify(updatePayload)
                })

                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}))
                    console.warn('Backend blog update notice:', errData.detail)
                }
            } catch (err) {
                console.warn('Backend offline, updating local cache:', err.message)
            }

            const updatedBlog = {
                ...blogToEdit,
                ...updatePayload,
                slug: titleToSlug(form.title.trim())
            }

            updateInLocalStorage(blogToEdit, updatedBlog)
            onBlogUpdated && onBlogUpdated(updatedBlog)
            onBlogAdded && onBlogAdded(updatedBlog)
            setLoading(false)
            setOpenAdd(false)
            return
        }

        // Creating New Blog
        const newSlug = titleToSlug(form.title.trim())
        const newBlog = {
            title: form.title.trim(),
            description: form.description.trim(),
            tag: form.tag.trim().toLowerCase(),
            img: form.img.trim() || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
            author: currentUserId || (currentUser?.first_name ? `${currentUser.first_name} ${currentUser.last_name || ''}`.trim() : 'Author'),
            published_at: new Date().toISOString(),
            slug: newSlug
        }

        try {
            const res = await fetch('http://127.0.0.1:8000/blog/create', {
                method: 'POST',
                headers: getAdminHeaders(),
                body: JSON.stringify(newBlog)
            })

            if (res.ok) {
                const resData = await res.json().catch(() => ({}))
                if (resData._id) {
                    newBlog._id = resData._id
                }
            } else {
                const errData = await res.json().catch(() => ({}))
                console.warn('Server blog save notice:', errData.detail)
            }
        } catch (err) {
            console.warn('Server unreachable, saving blog locally:', err.message)
        }

        saveToLocalStorage(newBlog)
        onBlogAdded && onBlogAdded(newBlog)
        setLoading(false)
        setOpenAdd(false)
    }

    if (!openAdd) return null

    return (
        <div 
            className='fixed inset-0 flex justify-center items-center text-white bg-black/75 backdrop-blur-sm z-50 p-4 overflow-y-auto'
            role='dialog'
            aria-modal='true'
            aria-labelledby='add-blog-modal-title'
            onClick={(e) => {
                if (e.target === e.currentTarget) setOpenAdd(false)
            }}
        >
            <div 
                className={`relative w-full max-w-xl rounded-2xl p-6 sm:p-8 shadow-2xl my-auto border transition-all ${
                    dark ? 'bg-[#0f1015] border-zinc-800 text-white' : 'bg-white border-gray-200 text-gray-900'
                }`}
                ref={modalRef}
            >
                {/* Close Button */}
                <button 
                    type='button' 
                    className={`absolute top-4 right-4 p-1.5 rounded-full transition cursor-pointer ${
                        dark ? 'text-zinc-400 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                    onClick={() => setOpenAdd(false)}
                    aria-label='Close modal'
                >
                    <MdClose className='text-2xl' />
                </button>

                <div className='mb-6'>
                    <div className='flex items-center gap-2 mb-1'>
                        <span className='text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400'>
                            {isEdit ? 'Edit Mode' : 'New Publication'}
                        </span>
                    </div>
                    <h2 id='add-blog-modal-title' className='text-2xl font-bold tracking-tight'>
                        {isEdit ? 'Update Article' : 'Publish New Article'}
                    </h2>
                    <p className={`text-xs mt-1 ${dark ? 'text-zinc-400' : 'text-gray-500'}`}>
                        Share web engineering, AI architectures, and technical deep-dives with the community.
                    </p>
                </div>

                {error && (
                    <div className='mb-5 p-3 rounded-xl text-xs sm:text-sm bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-between'>
                        <span>{error}</span>
                        <button type='button' onClick={() => setError('')} className='text-red-400 font-bold'>✕</button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className='w-full flex flex-col gap-4'>
                    {/* Title */}
                    <div className='flex flex-col gap-1.5'>
                        <label htmlFor='blog_title' className='text-xs sm:text-sm font-semibold'>
                            Title <span className='text-red-400'>*</span>
                        </label>
                        <input 
                            type='text' 
                            name='title' 
                            id='blog_title' 
                            placeholder='e.g. Scaling Real-Time Web Architectures'
                            value={form.title}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            className={`outline-none border p-3 rounded-xl text-sm w-full transition ${
                                dark 
                                    ? 'bg-black/60 border-zinc-700 focus:border-blue-500 text-white placeholder-zinc-500' 
                                    : 'bg-gray-50 border-gray-300 focus:border-blue-500 text-gray-900 placeholder-gray-400'
                            }`}
                        />
                    </div>

                    {/* Tag Selection */}
                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs sm:text-sm font-semibold flex items-center justify-between'>
                            <span>Category / Tag</span>
                            <span className={`text-[11px] ${dark ? 'text-zinc-400' : 'text-gray-500'}`}>Select or type custom tag</span>
                        </label>
                        <div className='flex items-center gap-1.5 flex-wrap mb-1'>
                            {DEFAULT_TAGS.map(t => (
                                <button
                                    key={t}
                                    type='button'
                                    onClick={() => setForm(prev => ({ ...prev, tag: t }))}
                                    className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider transition cursor-pointer ${
                                        form.tag === t
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : dark
                                                ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                        <input 
                            type='text' 
                            name='tag' 
                            id='blog_tag' 
                            placeholder='Custom tag...'
                            value={form.tag}
                            onChange={handleChange}
                            disabled={loading}
                            className={`outline-none border px-3 py-2 rounded-xl text-xs w-full transition ${
                                dark 
                                    ? 'bg-black/60 border-zinc-700 focus:border-blue-500 text-white' 
                                    : 'bg-gray-50 border-gray-300 focus:border-blue-500 text-gray-900'
                            }`}
                        />
                    </div>

                    {/* Cover Image URL / File Upload */}
                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs sm:text-sm font-semibold flex items-center justify-between'>
                            <span>Cover Image</span>
                            <span className={`text-[11px] ${dark ? 'text-zinc-400' : 'text-gray-500'}`}>URL or upload</span>
                        </label>
                        <div className='flex items-center gap-2'>
                            <input 
                                type='text' 
                                name='img' 
                                id='blog_img' 
                                placeholder='https://images.unsplash.com/...'
                                value={form.img}
                                onChange={handleChange}
                                disabled={loading || uploading}
                                className={`outline-none border p-3 rounded-xl text-sm flex-1 transition ${
                                    dark 
                                        ? 'bg-black/60 border-zinc-700 focus:border-blue-500 text-white placeholder-zinc-500' 
                                        : 'bg-gray-50 border-gray-300 focus:border-blue-500 text-gray-900 placeholder-gray-400'
                                }`}
                            />
                            <button
                                type='button'
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading || loading}
                                className={`inline-flex items-center gap-1.5 px-4 py-3 rounded-xl text-xs font-semibold transition cursor-pointer border whitespace-nowrap ${
                                    dark 
                                        ? 'border-zinc-700 bg-white/5 hover:bg-white/10 text-zinc-200' 
                                        : 'border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-800'
                                }`}
                                title='Upload image from disk'
                            >
                                <FiUploadCloud className='text-base' />
                                <span>{uploading ? `${uploadProgress}%` : 'Upload'}</span>
                            </button>
                            <input 
                                type='file' 
                                ref={fileInputRef} 
                                onChange={handleFileUpload} 
                                accept='image/*' 
                                className='hidden' 
                            />
                        </div>

                        {/* Image Preview Box */}
                        {form.img && (
                            <div className='relative mt-1 rounded-xl overflow-hidden border border-zinc-700/80 max-h-36 w-full bg-black/40 group'>
                                <img 
                                    src={form.img} 
                                    alt='Cover preview' 
                                    className='w-full h-36 object-cover' 
                                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                                />
                                <button
                                    type='button'
                                    onClick={() => setForm(prev => ({ ...prev, img: '' }))}
                                    className='absolute top-2 right-2 p-1.5 rounded-full bg-black/75 hover:bg-red-600 text-white transition'
                                    title='Remove image'
                                >
                                    <FiX className='text-xs' />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Description / Content */}
                    <div className='flex flex-col gap-1.5'>
                        <label htmlFor='blog_description' className='text-xs sm:text-sm font-semibold'>
                            Content / Description <span className='text-red-400'>*</span>
                        </label>
                        <textarea 
                            rows={6} 
                            name='description' 
                            id='blog_description' 
                            placeholder='Write full article insights, architectural notes, and takeaways...'
                            value={form.description}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            className={`outline-none border p-3 rounded-xl text-sm w-full transition resize-y min-h-[140px] ${
                                dark 
                                    ? 'bg-black/60 border-zinc-700 focus:border-blue-500 text-white placeholder-zinc-500' 
                                    : 'bg-gray-50 border-gray-300 focus:border-blue-500 text-gray-900 placeholder-gray-400'
                            }`}
                        />
                    </div>

                    {/* Submit Actions */}
                    <div className='flex items-center justify-end gap-3 pt-3 border-t border-zinc-800/80 mt-2'>
                        <button
                            type='button'
                            onClick={() => setOpenAdd(false)}
                            disabled={loading}
                            className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition cursor-pointer border ${
                                dark 
                                    ? 'border-zinc-700 bg-white/5 hover:bg-white/10 text-zinc-300' 
                                    : 'border-gray-300 bg-white hover:bg-gray-100 text-gray-700'
                            }`}
                        >
                            Cancel
                        </button>
                        <button 
                            type='submit'
                            disabled={loading || uploading}
                            className='inline-flex items-center gap-2 bg-[#ededf1] hover:bg-white text-[#070708] font-bold py-2.5 px-6 rounded-full text-xs sm:text-sm transition-all duration-200 active:scale-[0.98] shadow-sm cursor-pointer border-0 border-none disabled:opacity-50'
                        >
                            {loading ? (
                                <span>{isEdit ? 'Updating...' : 'Publishing...'}</span>
                            ) : (
                                <>
                                    <FiCheck className='text-base' />
                                    <span>{isEdit ? 'Save Changes' : 'Publish Article'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddBlog
