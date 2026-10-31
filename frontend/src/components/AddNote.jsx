import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import MarkdownRenderer from './MarkdownRenderer'
import { formatMathAndMarkdown, titleToSlug, extractAutoTitle } from '../utils/markdownUtils'
import { getCurrentUserId, getAuthToken, getAdminHeaders, getAdminToken, getAdminSecret } from '../utils/authUtils'
import { FiEye, FiEdit3, FiColumns, FiCheck, FiX, FiCode, FiGrid, FiImage, FiVideo, FiUploadCloud, FiLink } from 'react-icons/fi'
import { HiSparkles } from 'react-icons/hi2'
import { uploadMediaFile } from '../services/mediaService'

const TAG_OPTIONS = ['ai/ml', 'math', 'web', 'python', 'general', 'other']

const AddNote = ({ setOpenAdd, onNoteAdded, noteToEdit = null, onNoteUpdated = null }) => {
    const isEdit = !!noteToEdit
    const navigate = useNavigate()
    const { theme } = useTheme()
    const dark = theme === 'dark'
    const [form, setForm] = useState({
        title: noteToEdit?.title || '',
        content: noteToEdit?.content || '',
        tag: (noteToEdit?.tag || 'ai/ml').toLowerCase()
    })
    const [viewMode, setViewMode] = useState('write') // 'write' | 'preview' | 'split'
    const [loading, setLoading] = useState(false)
    const [uploadingMedia, setUploadingMedia] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [uploadType, setUploadType] = useState(null) // 'image' | 'video' | null
    const [isDraggingOver, setIsDraggingOver] = useState(false)
    const [urlModal, setUrlModal] = useState({ open: false, type: 'image', url: '', caption: '' })
    const [error, setError] = useState('')
    const [notice, setNotice] = useState('')
    const fileInputRef = useRef(null)
    const videoInputRef = useRef(null)
    const textareaRef = useRef(null)

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            setOpenAdd(false)
            navigate('/signup')
        }
    }, [])


    const handleChange = (e) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
    }

    /**
     * Smart Auto-formatter for math & notes
     */
    const handleAutoFormat = (customText = null) => {
        const textToFormat = typeof customText === 'string' ? customText : form.content
        if (!textToFormat.trim()) return

        const formatted = formatMathAndMarkdown(textToFormat)
        
        // Auto-extract title if title is empty
        let detectedTitle = form.title.trim() ? form.title : extractAutoTitle(formatted)

        // Auto-detect tag if general
        let detectedTag = form.tag
        const lower = formatted.toLowerCase()
        if (lower.includes('transformer') || lower.includes('logits') || lower.includes('softmax') || lower.includes('language model') || lower.includes('embedding') || lower.includes('tensor')) {
            detectedTag = 'ai/ml'
        } else if (lower.includes('matrix') || lower.includes('vector') || lower.includes('\\mathbf') || lower.includes('\\bmatrix')) {
            detectedTag = 'math'
        }

        setForm(prev => ({
            ...prev,
            title: detectedTitle || prev.title,
            tag: detectedTag,
            content: formatted
        }))

        setNotice('✨ LaTeX math, brackets, matrices & tables successfully styled!')
        setTimeout(() => setNotice(''), 4000)
    }

    /**
     * Intercept paste event in textarea to auto-apply styling immediately
     */
    /**
     * Helper to insert text at cursor position in textarea
     */
    const insertSnippet = (template) => {
        const textarea = textareaRef.current
        if (textarea) {
            const start = textarea.selectionStart ?? form.content.length
            const end = textarea.selectionEnd ?? form.content.length
            const current = form.content || ''
            const before = current.slice(0, start)
            const after = current.slice(end)

            const prefix = (before && !before.endsWith('\n\n')) ? (before.endsWith('\n') ? '\n' : '\n\n') : ''
            const suffix = (after && !after.startsWith('\n\n')) ? (after.startsWith('\n') ? '\n' : '\n\n') : ''

            const newContent = before + prefix + template + suffix + after
            setForm(prev => ({ ...prev, content: newContent }))

            setTimeout(() => {
                if (textareaRef.current) {
                    const newPos = start + prefix.length + template.length
                    textareaRef.current.focus()
                    textareaRef.current.setSelectionRange(newPos, newPos)
                }
            }, 50)
        } else {
            setForm(prev => ({
                ...prev,
                content: prev.content ? `${prev.content}\n\n${template}` : template
            }))
        }
    }

    /**
     * Upload an image or video to Cloudinary via backend proxy
     */
    const handleUploadMediaFile = async (file, forcedType = null) => {
        if (!file) return

        const isVideo = forcedType === 'video' || file.type?.startsWith('video/')
        const resourceType = isVideo ? 'video' : 'image'

        setUploadingMedia(true)
        setUploadType(resourceType)
        setUploadProgress(10)
        setNotice(isVideo ? '🎥 Uploading video to Cloudinary...' : '📷 Uploading image to Cloudinary...')

        try {
            const result = await uploadMediaFile(file, {
                resourceType,
                onProgress: (pct) => {
                    setUploadProgress(pct)
                    if (pct < 100) {
                        setNotice(`${isVideo ? '🎥 Uploading video' : '📷 Uploading image'} to Cloudinary... ${pct}%`)
                    } else {
                        setNotice('☁️ Processing on Cloudinary...')
                    }
                }
            })

            const rawName = file.name ? file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') : (isVideo ? 'Video' : 'Image')
            const caption = rawName.trim() || (isVideo ? 'Note Video' : 'Note Image')

            if (isVideo) {
                insertSnippet(`![video: ${caption}](${result.url})`)
                setNotice('✅ Video uploaded to Cloudinary!')
            } else {
                insertSnippet(`![${caption}](${result.url})`)
                setNotice('✅ Image uploaded to Cloudinary!')
            }

            setTimeout(() => setNotice(''), 4000)
        } catch (err) {
            console.error('Upload failed:', err)
            // For images: graceful offline fallback
            if (!isVideo) {
                try {
                    const reader = new FileReader()
                    reader.onload = () => {
                        const caption = file.name ? file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') : 'Image'
                        insertSnippet(`![${caption}](${reader.result})`)
                        setNotice('⚠️ Offline mode: Image embedded directly')
                        setTimeout(() => setNotice(''), 4000)
                    }
                    reader.readAsDataURL(file)
                } catch (fbErr) {
                    setError(err.message || 'Failed to upload image')
                    setTimeout(() => setError(''), 4000)
                }
            } else {
                setError(err.message || 'Failed to upload video to Cloudinary')
                setTimeout(() => setError(''), 5000)
            }
        } finally {
            setUploadingMedia(false)
            setUploadType(null)
            setUploadProgress(0)
        }
    }

    /**
     * Intercept paste event in textarea:
     * - Pasted screenshot / clipboard image -> uploads to Cloudinary
     * - Pasted video -> uploads to Cloudinary
     * - Pasted text / LaTeX / diagrams -> auto-styles
     */
    const handlePaste = (e) => {
        // 1. Check if an image or video was pasted from clipboard
        const items = e.clipboardData?.items
        if (items) {
            for (let i = 0; i < items.length; i++) {
                if (items[i].type && items[i].type.startsWith('image/')) {
                    const file = items[i].getAsFile()
                    if (file) {
                        e.preventDefault()
                        handleUploadMediaFile(file, 'image')
                        return
                    }
                } else if (items[i].type && items[i].type.startsWith('video/')) {
                    const file = items[i].getAsFile()
                    if (file) {
                        e.preventDefault()
                        handleUploadMediaFile(file, 'video')
                        return
                    }
                }
            }
        }

        // 2. Otherwise process pasted text
        const pasted = e.clipboardData?.getData('text')
        if (!pasted) return

        // Check if the pasted text has LaTeX math delimiters, tab tables, ChatGPT signatures, or flow diagrams
        const hasMath = pasted.includes('\\(') || pasted.includes('\\[') || pasted.includes('\\begin{') || pasted.includes('\\mathbf') || pasted.includes('$$') || pasted.includes('\\frac')
        const hasTabs = pasted.includes('\t')
        const hasSections = /Part\s+\d+|Example\s+[A-Z]|Step\s+\d+/i.test(pasted)
        const hasDiagram = /Where FFN fits|Token representations|The entire idea in one picture|Explore the logits|Final next-token probabilities|One vector per position|:::|```mermaid|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|Self-attention.*FFN/i.test(pasted)

        if (hasMath || hasTabs || hasSections || hasDiagram) {
            // Apply formatting immediately on paste
            e.preventDefault()
            const formatted = formatMathAndMarkdown(pasted)

            // Auto-detect title if empty
            let detectedTitle = form.title.trim() ? form.title : extractAutoTitle(pasted)

            // Auto-detect tag
            let detectedTag = form.tag
            const lower = pasted.toLowerCase()
            if (lower.includes('transformer') || lower.includes('logits') || lower.includes('softmax') || lower.includes('language model') || lower.includes('attention')) {
                detectedTag = 'ai/ml'
            } else if (lower.includes('matrix') || lower.includes('vector') || lower.includes('\\mathbf')) {
                detectedTag = 'math'
            }

            // Insert into textarea position
            const textarea = e.target
            const start = textarea.selectionStart || 0
            const end = textarea.selectionEnd || 0
            const currentContent = form.content
            const newContent = currentContent.slice(0, start) + formatted + currentContent.slice(end)

            setForm(prev => ({
                ...prev,
                title: detectedTitle || prev.title,
                tag: detectedTag,
                content: newContent
            }))

            setTimeout(() => {
                if (textareaRef.current) {
                    const nextPos = start + formatted.length
                    textareaRef.current.focus()
                    textareaRef.current.setSelectionRange(nextPos, nextPos)
                }
            }, 0)

            setNotice('✨ LaTeX math, equations, vectors & matrices auto-styled!')
            setTimeout(() => setNotice(''), 4500)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const token = getAuthToken() || getAdminToken() || getAdminSecret()
        if (!token) {
            setLoading(false)
            setOpenAdd(false)
            navigate('/admin')
            return
        }

        if (isEdit) {
            const noteId = noteToEdit._id || noteToEdit.slug || titleToSlug(noteToEdit.title)
            const updatePayload = {
                title: form.title,
                content: form.content,
                tag: form.tag,
                slug: titleToSlug(form.title)
            }

            try {
                const res = await fetch(`http://127.0.0.1:8000/note/update/${noteId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(updatePayload)
                })

                if (!res.ok) {
                    const data = await res.json().catch(() => ({}))
                    console.warn('Backend update failed:', data.detail)
                }
            } catch (err) {
                console.warn('API update error, updating local storage:', err.message)
            }

            // Always update local cache as well
            updateInLocalStorage(noteToEdit, updatePayload)
            const updated = { ...noteToEdit, ...updatePayload }
            onNoteUpdated && onNoteUpdated(updated)
            onNoteAdded && onNoteAdded(updated)
            setLoading(false)
            setOpenAdd(false)
            return
        }

        const finalNote = {
            ...form,
            published_at: new Date().toISOString(),
            slug: titleToSlug(form.title)
        }

        try {
            // Try server API first if token exists
            const res = await fetch('http://127.0.0.1:8000/note/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(finalNote)
            })

            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                throw new Error(data.detail || 'Server API failed')
            }

            onNoteAdded && onNoteAdded(finalNote)
            setOpenAdd(false)
        } catch (err) {
            console.warn('API save error, saving to local browser storage fallback:', err.message)
            // Fallback: save to local storage so user NEVER loses work
            saveToLocalStorage(finalNote)
            onNoteAdded && onNoteAdded(finalNote)
            setOpenAdd(false)
        } finally {
            setLoading(false)
        }
    }

    const updateInLocalStorage = (original, updateData) => {
        try {
            const raw = localStorage.getItem('samirbuilds_notes')
            if (raw) {
                const list = JSON.parse(raw)
                const updatedList = list.map(n => {
                    const match = (original._id && n._id === original._id) ||
                                  (original.slug && (n.slug === original.slug || n.slug === original._id)) ||
                                  (original.title && n.title === original.title)
                    if (match) {
                        return { ...n, ...updateData, updated_at: new Date().toISOString() }
                    }
                    return n
                })
                localStorage.setItem('samirbuilds_notes', JSON.stringify(updatedList))
            }
        } catch (e) {
            console.error('LocalStorage update error:', e)
        }
    }

    const saveToLocalStorage = (note) => {
        try {
            const currentUserId = getCurrentUserId()
            const existing = JSON.parse(localStorage.getItem('samirbuilds_notes') || '[]')
            const updated = [{ ...note, _id: `local-${Date.now()}`, author: currentUserId || 'current-user' }, ...existing]
            localStorage.setItem('samirbuilds_notes', JSON.stringify(updated))
        } catch (e) {
            console.error('LocalStorage save error:', e)
        }
    }

    const overlay = 'fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-5'
    const card = `w-full max-w-5xl max-h-[92vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ${
        dark ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'
    }`
    const inputStyle = `w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-blue-500 ${
        dark
            ? 'bg-gray-800/90 border-gray-700 text-white placeholder-gray-500'
            : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
    }`

    return (
        <div className={overlay} onClick={() => setOpenAdd(false)}>
            <div className={card} onClick={e => e.stopPropagation()}>
                {/* ── Modal Header ── */}
                <div className={`px-6 py-4 border-b flex items-center justify-between flex-wrap gap-3 ${
                    dark ? 'border-gray-800 bg-gray-900/90' : 'border-gray-200 bg-slate-50'
                }`}>
                    <div className='flex items-center gap-3'>
                        <div className='w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md'>
                            📝
                        </div>
                        <div>
                            <h2 className='text-lg font-bold tracking-tight'>
                                {isEdit ? 'Update Deep Dive Note' : 'Add Learning Note'}
                            </h2>
                            <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {isEdit ? 'Modify your note title, content, equations, matrices and uploaded media' : 'Write or paste notes — LaTeX math, matrices & formatting auto-styled'}
                            </p>
                        </div>
                    </div>

                    {/* View mode toggle */}
                    <div className='flex items-center gap-2'>
                        <div className={`inline-flex rounded-xl p-1 border text-xs font-medium ${
                            dark ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
                        }`}>
                            <button
                                type='button'
                                onClick={() => setViewMode('write')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                                    viewMode === 'write'
                                        ? 'bg-blue-600 text-white shadow-sm font-semibold'
                                        : dark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <FiEdit3 /> <span>Write</span>
                            </button>
                            <button
                                type='button'
                                onClick={() => setViewMode('preview')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                                    viewMode === 'preview'
                                        ? 'bg-blue-600 text-white shadow-sm font-semibold'
                                        : dark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <FiEye /> <span>Preview</span>
                            </button>
                            <button
                                type='button'
                                onClick={() => setViewMode('split')}
                                className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                                    viewMode === 'split'
                                        ? 'bg-blue-600 text-white shadow-sm font-semibold'
                                        : dark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <FiColumns /> <span>Split View</span>
                            </button>
                        </div>

                        <button
                            type='button'
                            onClick={() => setOpenAdd(false)}
                            className={`p-2 rounded-xl transition hover:bg-red-500/10 hover:text-red-400 cursor-pointer ${
                                dark ? 'text-gray-400' : 'text-gray-500'
                            }`}
                        >
                            <FiX className='text-xl' />
                        </button>
                    </div>
                </div>

                {/* Notice banner */}
                {notice && (
                    <div className='bg-emerald-500/10 border-b border-emerald-500/20 px-6 py-2.5 text-xs text-emerald-400 flex items-center justify-between gap-2 animate-fadeIn'>
                        <div className='flex items-center gap-2'>
                            <FiCheck className='text-emerald-400' />
                            <span>{notice}</span>
                        </div>
                        <button type='button' onClick={() => setNotice('')} className='text-emerald-400 hover:text-white'>✕</button>
                    </div>
                )}

                {error && (
                    <div className='bg-red-500/10 border-b border-red-500/20 px-6 py-2.5 text-xs text-red-400'>
                        {error}
                    </div>
                )}

                {/* ── Form Body ── */}
                <form onSubmit={handleSubmit} className='flex-1 overflow-y-auto p-6 flex flex-col gap-5'>
                    {/* Title and Tag row */}
                    <div className='grid grid-cols-1 sm:grid-cols-4 gap-4'>
                        <div className='sm:col-span-3 flex flex-col gap-1.5'>
                            <label className={`text-xs font-bold uppercase tracking-wider ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                                Note Title
                            </label>
                            <input
                                className={inputStyle}
                                name='title'
                                placeholder='e.g., How does the Language Model Head work in a Transformer?'
                                value={form.title}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className='flex flex-col gap-1.5'>
                            <label className={`text-xs font-bold uppercase tracking-wider ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                                Tag / Category
                            </label>
                            <select
                                className={inputStyle}
                                name='tag'
                                value={form.tag}
                                onChange={handleChange}
                            >
                                {TAG_OPTIONS.map(t => (
                                    <option key={t} value={t}>{t.toUpperCase()}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Quick Toolbar */}
                    <div className='flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-gray-200 dark:border-gray-800/80'>
                        <div className='flex items-center gap-1.5 flex-wrap'>
                            <span className={`text-xs font-medium mr-1 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                                Insert:
                            </span>

                            {/* Image Insert Options */}
                            <div className='relative inline-flex items-center gap-1'>
                                <button
                                    type='button'
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploadingMedia}
                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                                        dark
                                            ? 'bg-blue-600/20 border-blue-500/40 text-blue-300 hover:bg-blue-600/30 hover:border-blue-400'
                                            : 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100'
                                    } disabled:opacity-50`}
                                    title='Upload image to Cloudinary (or paste image directly into editor with Ctrl+V)'
                                >
                                    <FiImage className='text-sm text-blue-400' />
                                    <span>{uploadingMedia && uploadType === 'image' ? `Uploading...` : 'Add Image'}</span>
                                </button>
                                <button
                                    type='button'
                                    onClick={() => setUrlModal({ open: true, type: 'image', url: '', caption: '' })}
                                    className={`px-2 py-1 rounded-lg text-[11px] font-mono border transition cursor-pointer ${
                                        dark
                                            ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:bg-gray-700'
                                            : 'bg-gray-100 border-gray-200 text-gray-600 hover:text-gray-900'
                                    }`}
                                    title='Insert image via web URL'
                                >
                                    URL
                                </button>
                            </div>

                            {/* Video Insert Options */}
                            <div className='relative inline-flex items-center gap-1'>
                                <button
                                    type='button'
                                    onClick={() => videoInputRef.current?.click()}
                                    disabled={uploadingMedia}
                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                                        dark
                                            ? 'bg-purple-600/20 border-purple-500/40 text-purple-300 hover:bg-purple-600/30 hover:border-purple-400'
                                            : 'bg-purple-50 border-purple-300 text-purple-700 hover:bg-purple-100'
                                    } disabled:opacity-50`}
                                    title='Upload video to Cloudinary (MP4, WebM, MOV up to 100MB)'
                                >
                                    <FiVideo className='text-sm text-purple-400' />
                                    <span>{uploadingMedia && uploadType === 'video' ? `Uploading...` : 'Add Video'}</span>
                                </button>
                                <button
                                    type='button'
                                    onClick={() => setUrlModal({ open: true, type: 'video', url: '', caption: '' })}
                                    className={`px-2 py-1 rounded-lg text-[11px] font-mono border transition cursor-pointer ${
                                        dark
                                            ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:bg-gray-700'
                                            : 'bg-gray-100 border-gray-200 text-gray-600 hover:text-gray-900'
                                    }`}
                                    title='Insert video via web URL'
                                >
                                    URL
                                </button>
                            </div>

                            {/* Hidden file picker inputs */}
                            <input
                                type='file'
                                ref={fileInputRef}
                                accept='image/*'
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        handleUploadMediaFile(e.target.files[0], 'image')
                                        e.target.value = ''
                                    }
                                }}
                                className='hidden'
                            />
                            <input
                                type='file'
                                ref={videoInputRef}
                                accept='video/mp4,video/webm,video/ogg,video/quicktime,video/*'
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        handleUploadMediaFile(e.target.files[0], 'video')
                                        e.target.value = ''
                                    }
                                }}
                                className='hidden'
                            />

                            <button
                                type='button'
                                onClick={() => insertSnippet('$$\n\\mathbf{h}_{\\text{cold}} = \\begin{bmatrix} 0.8 & 0.2 & 0.5 \\end{bmatrix}\n$$')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition ${
                                    dark ? 'bg-gray-800 border-gray-700 text-gray-300 hover:text-white' : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
                                }`}
                                title='Insert Matrix'
                            >
                                ▦ Matrix
                            </button>
                            <button
                                type='button'
                                onClick={() => insertSnippet('$$\nP_i = \\frac{e^{z_i}}{\\sum_j e^{z_j}}\n$$')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition ${
                                    dark ? 'bg-gray-800 border-gray-700 text-gray-300 hover:text-white' : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
                                }`}
                                title='Insert Equation'
                            >
                                $$ Formula $$
                            </button>
                            <button
                                type='button'
                                onClick={() => insertSnippet('| Token | Meaning |\n| --- | --- |\n| today | Continuation |')}
                                className={`px-2.5 py-1 rounded-lg text-xs border transition ${
                                    dark ? 'bg-gray-800 border-gray-700 text-gray-300 hover:text-white' : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
                                }`}
                                title='Insert Table'
                            >
                                <FiGrid className='inline mr-1' /> Table
                            </button>
                            <button
                                type='button'
                                onClick={() => insertSnippet('```python\nself.lm_head = nn.Linear(n_embd, vocab_size, bias=False)\n```')}
                                className={`px-2.5 py-1 rounded-lg text-xs border transition ${
                                    dark ? 'bg-gray-800 border-gray-700 text-gray-300 hover:text-white' : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
                                }`}
                                title='Insert Code Block'
                            >
                                <FiCode className='inline mr-1' /> Code
                            </button>
                        </div>

                        {/* Auto Format Math Button */}
                        <button
                            type='button'
                            onClick={() => handleAutoFormat()}
                            className='flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-sm transition-all cursor-pointer'
                            title='Auto-format math equations, brackets, matrices, tables and headers'
                        >
                            <HiSparkles className='animate-pulse text-base' />
                            <span>Auto-Format Math</span>
                        </button>
                    </div>

                    {/* ── Animated Upload Progress Bar ── */}
                    {uploadingMedia && (
                        <div className='w-full mt-1.5 mb-1 p-3 rounded-xl border border-blue-500/30 bg-blue-500/10 flex flex-col gap-1.5 animate-fadeIn'>
                            <div className='flex items-center justify-between text-xs font-semibold text-blue-300'>
                                <span className='flex items-center gap-2'>
                                    <FiUploadCloud className='animate-bounce text-base text-blue-400' />
                                    <span>Uploading {uploadType === 'video' ? 'Video' : 'Image'} to Cloudinary...</span>
                                </span>
                                <span className='font-mono font-bold'>{uploadProgress}%</span>
                            </div>
                            <div className='w-full bg-gray-800/80 rounded-full h-2 overflow-hidden p-[1px]'>
                                <div
                                    className='bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 h-full rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                                    style={{ width: `${Math.max(uploadProgress, 8)}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* ── Content Area: Write, Preview, or Split with Drag & Drop ── */}
                    <div
                        className={`flex-1 min-h-[360px] flex flex-col relative transition-all rounded-xl ${
                            isDraggingOver ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-950 bg-blue-500/5' : ''
                        }`}
                        onDragOver={(e) => {
                            e.preventDefault()
                            setIsDraggingOver(true)
                        }}
                        onDragLeave={() => setIsDraggingOver(false)}
                        onDrop={(e) => {
                            e.preventDefault()
                            setIsDraggingOver(false)
                            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                handleUploadMediaFile(e.dataTransfer.files[0])
                            }
                        }}
                    >
                        {/* Drag and drop overlay banner */}
                        {isDraggingOver && (
                            <div className='absolute inset-0 z-30 flex flex-col items-center justify-center bg-blue-950/80 backdrop-blur-sm rounded-xl border-2 border-dashed border-blue-400 text-blue-200 pointer-events-none'>
                                <FiUploadCloud className='text-4xl animate-bounce mb-2 text-blue-300' />
                                <p className='text-sm font-bold'>Drop your image or video here</p>
                                <p className='text-xs opacity-75'>Uploads securely to Cloudinary</p>
                            </div>
                        )}

                        {/* WRITE MODE */}
                        {viewMode === 'write' && (
                            <div className='flex flex-col flex-1 gap-1.5'>
                                <div className='flex justify-between items-center text-xs'>
                                    <label className={`font-bold uppercase tracking-wider ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Note Content (Paste text, images, or videos here)
                                    </label>
                                    <span className={dark ? 'text-gray-500' : 'text-gray-400'}>
                                        {form.content.length} characters
                                    </span>
                                </div>
                                <textarea
                                    ref={textareaRef}
                                    className={`${inputStyle} flex-1 min-h-[340px] font-mono text-sm leading-relaxed resize-y`}
                                    name='content'
                                    placeholder='Paste or write your note here... You can paste screenshots (Ctrl+V), upload images/videos, or type LaTeX math.'
                                    value={form.content}
                                    onChange={handleChange}
                                    onPaste={handlePaste}
                                    required
                                />
                            </div>
                        )}

                        {/* PREVIEW MODE */}
                        {viewMode === 'preview' && (
                            <div className={`flex-1 min-h-[340px] rounded-xl border p-6 overflow-y-auto max-h-[500px] ${
                                dark ? 'bg-gray-950/80 border-gray-800' : 'bg-slate-50 border-gray-200'
                            }`}>
                                {form.content.trim() ? (
                                    <MarkdownRenderer content={form.content} />
                                ) : (
                                    <div className={`text-center py-16 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
                                        <p className='text-base font-semibold'>Nothing to preview yet</p>
                                        <p className='text-xs mt-1'>Paste your note in the "Write" tab to see LaTeX and media live.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* SPLIT VIEW (Side by Side) */}
                        {viewMode === 'split' && (
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-[360px]'>
                                <div className='flex flex-col gap-1.5'>
                                    <span className={`text-xs font-bold uppercase tracking-wider ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Editor (Write / Paste Text, Images or Videos)
                                    </span>
                                    <textarea
                                        ref={textareaRef}
                                        className={`${inputStyle} flex-1 min-h-[340px] font-mono text-xs leading-relaxed resize-none`}
                                        name='content'
                                        placeholder='Write or paste notes, images, or videos here...'
                                        value={form.content}
                                        onChange={handleChange}
                                        onPaste={handlePaste}
                                        required
                                    />
                                </div>
                                <div className='flex flex-col gap-1.5'>
                                    <span className={`text-xs font-bold uppercase tracking-wider ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Live KaTeX, Video & Markdown Preview
                                    </span>
                                    <div className={`flex-1 min-h-[340px] rounded-xl border p-4 overflow-y-auto max-h-[360px] ${
                                        dark ? 'bg-gray-950/80 border-gray-800' : 'bg-slate-50 border-gray-200'
                                    }`}>
                                        {form.content.trim() ? (
                                            <MarkdownRenderer content={form.content} />
                                        ) : (
                                            <span className={`text-xs italic ${dark ? 'text-gray-600' : 'text-gray-400'}`}>
                                                Live rendered output will appear here...
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Modal Footer ── */}
                    <div className={`flex items-center justify-between flex-wrap gap-3 pt-4 border-t ${
                        dark ? 'border-gray-800' : 'border-gray-200'
                    }`}>
                        <div className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Supports LaTeX math, Cloudinary images & videos, matrices, and tables
                        </div>

                        <div className='flex items-center gap-3'>
                            <button
                                type='button'
                                onClick={() => setOpenAdd(false)}
                                className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
                                    dark ? 'border-white/20 text-[#ededf1] hover:bg-white/10' : 'border-gray-300 text-gray-800 hover:bg-gray-100'
                                }`}
                            >
                                Cancel
                            </button>
                            <button
                                type='submit'
                                disabled={loading || uploadingMedia}
                                className='inline-flex items-center gap-2 bg-[#ededf1] hover:bg-white text-[#070708] font-semibold text-xs sm:text-sm px-7 py-2.5 rounded-full transition-all duration-200 active:scale-[0.98] disabled:opacity-60 shadow-sm cursor-pointer border-0 border-none'
                            >
                                {loading ? (isEdit ? 'Updating Note...' : 'Saving Note...') : (isEdit ? 'Save Changes' : 'Save Note')}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* ── Media URL Insertion Modal ── */}
            {urlModal.open && (
                <div className='fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4'>
                    <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl transition-all ${
                        dark ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'
                    }`}>
                        <div className='flex items-center justify-between mb-4 pb-2 border-b border-gray-800'>
                            <h3 className='text-sm font-bold flex items-center gap-2'>
                                {urlModal.type === 'video' ? <FiVideo className='text-purple-400 text-base' /> : <FiImage className='text-blue-400 text-base' />}
                                <span>Insert {urlModal.type === 'video' ? 'Video' : 'Image'} via URL</span>
                            </h3>
                            <button
                                type='button'
                                onClick={() => setUrlModal({ open: false, type: 'image', url: '', caption: '' })}
                                className='text-gray-400 hover:text-white p-1 cursor-pointer'
                            >
                                <FiX className='text-lg' />
                            </button>
                        </div>

                        <div className='flex flex-col gap-3.5 text-xs'>
                            <div>
                                <label className='block font-semibold mb-1 uppercase tracking-wider text-[11px] text-gray-400'>
                                    {urlModal.type === 'video' ? 'Video URL (Cloudinary, MP4, WebM)' : 'Image URL'}
                                </label>
                                <input
                                    type='url'
                                    placeholder={urlModal.type === 'video' ? 'https://res.cloudinary.com/.../video.mp4' : 'https://.../image.png'}
                                    value={urlModal.url}
                                    onChange={(e) => setUrlModal(prev => ({ ...prev, url: e.target.value }))}
                                    className={inputStyle}
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className='block font-semibold mb-1 uppercase tracking-wider text-[11px] text-gray-400'>
                                    Caption (Optional)
                                </label>
                                <input
                                    type='text'
                                    placeholder={urlModal.type === 'video' ? 'Video title or caption' : 'Image caption'}
                                    value={urlModal.caption}
                                    onChange={(e) => setUrlModal(prev => ({ ...prev, caption: e.target.value }))}
                                    className={inputStyle}
                                />
                            </div>

                            <div className='flex items-center justify-end gap-2.5 mt-2'>
                                <button
                                    type='button'
                                    onClick={() => setUrlModal({ open: false, type: 'image', url: '', caption: '' })}
                                    className={`px-4 py-2 rounded-xl font-medium border cursor-pointer ${
                                        dark ? 'border-gray-700 hover:bg-gray-800 text-gray-300' : 'border-gray-200 hover:bg-gray-100 text-gray-700'
                                    }`}
                                >
                                    Cancel
                                </button>
                                <button
                                    type='button'
                                    onClick={() => {
                                        if (urlModal.url.trim()) {
                                            const caption = urlModal.caption.trim() || (urlModal.type === 'video' ? 'Video' : 'Image')
                                            if (urlModal.type === 'video') {
                                                insertSnippet(`![video: ${caption}](${urlModal.url.trim()})`)
                                            } else {
                                                insertSnippet(`![${caption}](${urlModal.url.trim()})`)
                                            }
                                            setUrlModal({ open: false, type: 'image', url: '', caption: '' })
                                        }
                                    }}
                                    disabled={!urlModal.url.trim()}
                                    className='px-5 py-2 rounded-xl font-semibold bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white shadow-sm cursor-pointer'
                                >
                                    Insert {urlModal.type === 'video' ? 'Video' : 'Image'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AddNote
