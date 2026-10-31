import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import AddBlog from '../components/AddBlog'
import AddNote from '../components/AddNote'
import DeleteBlogModal from '../components/DeleteBlogModal'
import DeleteNoteModal from '../components/DeleteNoteModal'
import { useTheme } from '../context/ThemeContext'
import {
    isAdminAuthenticated,
    getAdminSecret,
    removeAdminSecret,
    removeAdminToken,
    verifyAdminSecretApi,
    adminLoginApi,
    getAdminSettingsApi,
    updateAdminSecretKeyApi,
    getAdminStatsApi,
    deleteBlogApi,
    deleteNoteApi
} from '../utils/authUtils'
import {
    FiShield,
    FiKey,
    FiLock,
    FiUnlock,
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiExternalLink,
    FiCheck,
    FiAlertTriangle,
    FiEye,
    FiEyeOff,
    FiSearch,
    FiFileText,
    FiBookOpen,
    FiLogOut,
    FiRefreshCw
} from 'react-icons/fi'
import { HiSparkles } from 'react-icons/hi2'
import LoadingSpinner from '../components/LoadingSpinner'

const AdminDashboard = () => {
    const navigate = useNavigate()
    const { theme } = useTheme()
    const dark = theme === 'dark'

    // Authentication state
    const [authenticated, setAuthenticated] = useState(isAdminAuthenticated())
    const [authMode, setAuthMode] = useState('secret') // 'secret' | 'credentials'
    const [secretKeyInput, setSecretKeyInput] = useState('')
    const [showSecretKey, setShowSecretKey] = useState(false)
    const [emailInput, setEmailInput] = useState('')
    const [passwordInput, setPasswordInput] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [authLoading, setAuthLoading] = useState(false)
    const [authError, setAuthError] = useState('')

    // Active Dashboard Tab
    const [activeTab, setActiveTab] = useState('blogs') // 'blogs' | 'notes' | 'security'

    // Data lists & loading
    const [blogs, setBlogs] = useState([])
    const [notes, setNotes] = useState([])
    const [loadingData, setLoadingData] = useState(false)
    const [stats, setStats] = useState({ total_blogs: 0, total_notes: 0, active_secret_configured: true })

    // Search queries
    const [blogSearch, setBlogSearch] = useState('')
    const [noteSearch, setNoteSearch] = useState('')

    // Modals
    const [openAddBlog, setOpenAddBlog] = useState(false)
    const [blogToEdit, setBlogToEdit] = useState(null)
    const [blogToDelete, setBlogToDelete] = useState(null)
    const [deletingBlog, setDeletingBlog] = useState(false)
    const [deleteBlogError, setDeleteBlogError] = useState(null)

    const [openAddNote, setOpenAddNote] = useState(false)
    const [noteToEdit, setNoteToEdit] = useState(null)
    const [noteToDelete, setNoteToDelete] = useState(null)
    const [deletingNote, setDeletingNote] = useState(false)
    const [deleteNoteError, setDeleteNoteError] = useState(null)

    // Security Settings Form State
    const [keySettings, setKeySettings] = useState({ secret_key_preview: 'samirbuilds-admin-***' })
    const [currentKeyInput, setCurrentKeyInput] = useState('')
    const [newKeyInput, setNewKeyInput] = useState('')
    const [confirmKeyInput, setConfirmKeyInput] = useState('')
    const [keyUpdating, setKeyUpdating] = useState(false)
    const [keySuccess, setKeySuccess] = useState('')
    const [keyError, setKeyError] = useState('')

    // Check authentication on load
    useEffect(() => {
        const isAuth = isAdminAuthenticated()
        setAuthenticated(isAuth)
        if (isAuth) {
            loadDashboardData()
        }
    }, [])

    const loadDashboardData = async () => {
        setLoadingData(true)
        try {
            // Load stats & settings
            try {
                const s = await getAdminStatsApi()
                setStats(s)
            } catch (e) {
                console.warn('Could not load admin stats:', e.message)
            }

            try {
                const settings = await getAdminSettingsApi()
                setKeySettings(settings)
            } catch (e) {
                console.warn('Could not load admin settings:', e.message)
            }

            // Load blogs
            let localBlogs = []
            try {
                const raw = localStorage.getItem('samirbuilds_blogs')
                if (raw) localBlogs = JSON.parse(raw)
            } catch (e) {}

            let remoteBlogs = []
            try {
                const res = await fetch('http://127.0.0.1:8000/blogs')
                if (res.ok) remoteBlogs = await res.json()
            } catch (e) {}

            const blogMap = new Map()
            localBlogs.forEach(b => blogMap.set(b._id || b.slug || b.title, b))
            remoteBlogs.forEach(b => blogMap.set(b._id || b.slug || b.title, b))
            setBlogs(Array.from(blogMap.values()))

            // Load notes
            let localNotes = []
            try {
                const raw = localStorage.getItem('samirbuilds_notes')
                if (raw) localNotes = JSON.parse(raw).filter(n => n?._id !== 'default-lm-head-transformer' && n?.slug !== 'how-does-the-language-model-head-work-in-a-transformer')
            } catch (e) {}

            let remoteNotes = []
            try {
                const res = await fetch('http://127.0.0.1:8000/notes')
                if (res.ok) remoteNotes = await res.json()
            } catch (e) {}

            const noteMap = new Map()
            localNotes.forEach(n => noteMap.set(n._id || n.slug || n.title, n))
            remoteNotes.forEach(n => noteMap.set(n._id || n.slug || n.title, n))
            setNotes(Array.from(noteMap.values()))

        } finally {
            setLoadingData(false)
        }
    }

    // Handle Secret Key verification unlock
    const handleVerifySecret = async (e) => {
        e.preventDefault()
        setAuthError('')
        if (!secretKeyInput.trim()) {
            setAuthError('Please enter your Admin Secret Key.')
            return
        }

        setAuthLoading(true)
        try {
            await verifyAdminSecretApi(secretKeyInput.trim())
            setAuthenticated(true)
            loadDashboardData()
            window.dispatchEvent(new Event('authChange'))
        } catch (err) {
            setAuthError(err.message || 'Invalid Secret Key. Access denied.')
        } finally {
            setAuthLoading(false)
        }
    }

    // Handle Admin credential login
    const handleCredentialLogin = async (e) => {
        e.preventDefault()
        setAuthError('')
        if (!emailInput.trim() || !passwordInput.trim()) {
            setAuthError('Please enter both admin email and password.')
            return
        }

        setAuthLoading(true)
        try {
            await adminLoginApi({
                email: emailInput.trim(),
                password: passwordInput.trim(),
                secret_key: secretKeyInput.trim() || undefined
            })
            setAuthenticated(true)
            loadDashboardData()
            window.dispatchEvent(new Event('authChange'))
        } catch (err) {
            setAuthError(err.message || 'Admin authentication failed.')
        } finally {
            setAuthLoading(false)
        }
    }

    // Handle session lock/sign out
    const handleLockSession = () => {
        removeAdminSecret()
        removeAdminToken()
        setAuthenticated(false)
        setSecretKeyInput('')
        setPasswordInput('')
        window.dispatchEvent(new Event('authChange'))
    }

    // Handle Delete Blog
    const handleConfirmDeleteBlog = async () => {
        if (!blogToDelete) return
        setDeletingBlog(true)
        setDeleteBlogError(null)
        try {
            await deleteBlogApi(blogToDelete)
            setBlogToDelete(null)
            await loadDashboardData()
        } catch (err) {
            setDeleteBlogError(err.message || 'Failed to delete blog article.')
        } finally {
            setDeletingBlog(false)
        }
    }

    // Handle Delete Note
    const handleConfirmDeleteNote = async () => {
        if (!noteToDelete) return
        setDeletingNote(true)
        setDeleteNoteError(null)
        try {
            await deleteNoteApi(noteToDelete)
            setNoteToDelete(null)
            await loadDashboardData()
        } catch (err) {
            setDeleteNoteError(err.message || 'Failed to delete note.')
        } finally {
            setDeletingNote(false)
        }
    }

    // Handle Secret Key Update
    const handleUpdateSecretKey = async (e) => {
        e.preventDefault()
        setKeyError('')
        setKeySuccess('')

        if (!currentKeyInput.trim()) {
            setKeyError('Please provide your current secret key.')
            return
        }
        if (!newKeyInput.trim() || newKeyInput.trim().length < 8) {
            setKeyError('New secret key must be at least 8 characters long.')
            return
        }
        if (newKeyInput.trim() !== confirmKeyInput.trim()) {
            setKeyError('New secret keys do not match.')
            return
        }

        setKeyUpdating(true)
        try {
            await updateAdminSecretKeyApi(currentKeyInput.trim(), newKeyInput.trim())
            setKeySuccess('Master Secret Key updated successfully. Runtime environment reconfigured.')
            setCurrentKeyInput('')
            setNewKeyInput('')
            setConfirmKeyInput('')
            const updated = await getAdminSettingsApi()
            setKeySettings(updated)
        } catch (err) {
            setKeyError(err.message || 'Failed to update admin secret key.')
        } finally {
            setKeyUpdating(false)
        }
    }

    // Filtered lists
    const filteredBlogs = blogs.filter(b => {
        const q = blogSearch.toLowerCase().trim()
        if (!q) return true
        return (b.title?.toLowerCase().includes(q)) ||
               (b.tag?.toLowerCase().includes(q)) ||
               (b.description?.toLowerCase().includes(q))
    })

    const filteredNotes = notes.filter(n => {
        const q = noteSearch.toLowerCase().trim()
        if (!q) return true
        return (n.title?.toLowerCase().includes(q)) ||
               (n.tag?.toLowerCase().includes(q)) ||
               (n.content?.toLowerCase().includes(q))
    })

    return (
        <div className={`min-h-screen ${dark ? 'bg-[#060709] text-white' : 'bg-slate-50 text-gray-900'} pb-16 flex flex-col justify-between transition-colors duration-300 font-sans`}>
            <div>
                <Navbar />

                <main className='max-w-[1340px] mx-auto w-full px-4 sm:px-6 md:px-8 pt-8 pb-14'>
                    {!authenticated ? (
                        /* ══════════════════════════════════════════════
                           SECURITY GATEWAY: UN-AUTHENTICATED ADMIN LOGIN
                           ══════════════════════════════════════════════ */
                        <div className='max-w-lg mx-auto mt-6 sm:mt-12'>
                            <div className={`rounded-3xl border p-7 sm:p-9 shadow-2xl transition-all ${
                                dark 
                                    ? 'bg-[#0f1117] border-white/10 text-white' 
                                    : 'bg-white border-slate-200 text-slate-900'
                            }`}>
                                {/* Security Shield Badge */}
                                <div className='flex items-center justify-between mb-6'>
                                    <div className='flex items-center gap-3'>
                                        <div className='w-12 h-12 rounded-2xl flex items-center justify-center bg-blue-500/10 text-blue-500 border border-blue-500/20'>
                                            <FiShield className='text-2xl' />
                                        </div>
                                        <div>
                                            <h1 className='text-xl sm:text-2xl font-bold tracking-tight'>
                                                Admin Dashboard
                                            </h1>
                                            <p className={`text-xs ${dark ? 'text-zinc-400' : 'text-slate-500'}`}>
                                                Restricted Creator & Security Portal
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                                        dark ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-700 border-amber-200'
                                    }`}>
                                        Authentication Required
                                    </span>
                                </div>

                                <p className={`text-xs sm:text-sm leading-relaxed mb-6 ${dark ? 'text-zinc-400' : 'text-slate-600'}`}>
                                    Welcome, Samir. All public creation and editing buttons have been secured. Enter your secret passkey or credentials below to access content uploading, article editing, and system controls.
                                </p>

                                {/* Mode Switcher */}
                                <div className={`flex rounded-xl p-1 mb-6 border ${dark ? 'bg-black/40 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
                                    <button
                                        type='button'
                                        onClick={() => { setAuthMode('secret'); setAuthError('') }}
                                        className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                                            authMode === 'secret'
                                                ? dark ? 'bg-white/15 text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm'
                                                : dark ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        <FiKey className='text-xs' />
                                        <span>Master Passkey</span>
                                    </button>
                                    <button
                                        type='button'
                                        onClick={() => { setAuthMode('credentials'); setAuthError('') }}
                                        className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                                            authMode === 'credentials'
                                                ? dark ? 'bg-white/15 text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm'
                                                : dark ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        <FiLock className='text-xs' />
                                        <span>Admin Credentials</span>
                                    </button>
                                </div>

                                {/* Error Banner */}
                                {authError && (
                                    <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 mb-5 border animate-fadeIn ${
                                        dark ? 'bg-red-500/10 border-red-500/30 text-red-300' : 'bg-red-50 border-red-200 text-red-700'
                                    }`}>
                                        <FiAlertTriangle className='text-base shrink-0 text-red-400' />
                                        <span>{authError}</span>
                                    </div>
                                )}

                                {authMode === 'secret' ? (
                                    /* Passkey Form */
                                    <form onSubmit={handleVerifySecret} className='space-y-4'>
                                        <div>
                                            <label className={`block text-xs font-semibold mb-1.5 ${dark ? 'text-zinc-300' : 'text-slate-700'}`}>
                                                Admin Secret Key
                                            </label>
                                            <div className='relative'>
                                                <input
                                                    type={showSecretKey ? 'text' : 'password'}
                                                    placeholder='Enter your master secret key'
                                                    value={secretKeyInput}
                                                    onChange={e => setSecretKeyInput(e.target.value)}
                                                    required
                                                    className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl text-xs sm:text-sm border outline-none transition ${
                                                        dark 
                                                            ? 'bg-black/60 border-white/10 text-white focus:border-blue-500' 
                                                            : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                                                    }`}
                                                />
                                                <button
                                                    type='button'
                                                    onClick={() => setShowSecretKey(!showSecretKey)}
                                                    className='absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition'
                                                    aria-label='Toggle secret key visibility'
                                                >
                                                    {showSecretKey ? <FiEyeOff /> : <FiEye />}
                                                </button>
                                            </div>
                                            <p className={`text-[11px] mt-1.5 ${dark ? 'text-zinc-500' : 'text-slate-500'}`}>
                                                Configured in your backend environment (<code className='font-mono'>ADMIN_SECRET_KEY</code>).
                                            </p>
                                        </div>

                                        <button
                                            type='submit'
                                            disabled={authLoading}
                                            className='w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm transition-all duration-200 shadow-md active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60'
                                        >
                                            {authLoading ? (
                                                <span>Verifying Cryptographic Passkey...</span>
                                            ) : (
                                                <>
                                                    <FiUnlock className='text-sm' />
                                                    <span>Unlock Admin Console</span>
                                                </>
                                            )}
                                        </button>
                                    </form>
                                ) : (
                                    /* Admin Credentials Form */
                                    <form onSubmit={handleCredentialLogin} className='space-y-4'>
                                        <div>
                                            <label className={`block text-xs font-semibold mb-1.5 ${dark ? 'text-zinc-300' : 'text-slate-700'}`}>
                                                Administrator Email
                                            </label>
                                            <input
                                                type='email'
                                                placeholder='samir@example.com'
                                                value={emailInput}
                                                onChange={e => setEmailInput(e.target.value)}
                                                required
                                                className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border outline-none transition ${
                                                    dark 
                                                        ? 'bg-black/60 border-white/10 text-white focus:border-blue-500' 
                                                        : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                                                }`}
                                            />
                                        </div>

                                        <div>
                                            <label className={`block text-xs font-semibold mb-1.5 ${dark ? 'text-zinc-300' : 'text-slate-700'}`}>
                                                Password
                                            </label>
                                            <div className='relative'>
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    placeholder='••••••••••••'
                                                    value={passwordInput}
                                                    onChange={e => setPasswordInput(e.target.value)}
                                                    required
                                                    className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl text-xs sm:text-sm border outline-none transition ${
                                                        dark 
                                                            ? 'bg-black/60 border-white/10 text-white focus:border-blue-500' 
                                                            : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                                                    }`}
                                                />
                                                <button
                                                    type='button'
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className='absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition'
                                                >
                                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className={`block text-xs font-semibold mb-1.5 ${dark ? 'text-zinc-300' : 'text-slate-700'}`}>
                                                Admin Secret Key (Optional if password matches admin root)
                                            </label>
                                            <input
                                                type='password'
                                                placeholder='Optional secret key'
                                                value={secretKeyInput}
                                                onChange={e => setSecretKeyInput(e.target.value)}
                                                className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border outline-none transition ${
                                                    dark 
                                                        ? 'bg-black/60 border-white/10 text-white focus:border-blue-500' 
                                                        : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                                                }`}
                                            />
                                        </div>

                                        <button
                                            type='submit'
                                            disabled={authLoading}
                                            className='w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm transition-all duration-200 shadow-md active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60'
                                        >
                                            {authLoading ? (
                                                <span>Authenticating Administrator...</span>
                                            ) : (
                                                <>
                                                    <FiShield className='text-sm' />
                                                    <span>Sign In to Admin Portal</span>
                                                </>
                                            )}
                                        </button>
                                    </form>
                                )}

                                <div className={`mt-6 pt-5 border-t text-center ${dark ? 'border-white/10' : 'border-slate-200'}`}>
                                    <Link
                                        to='/'
                                        className={`text-xs hover:underline inline-flex items-center gap-1 ${dark ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
                                    >
                                        ← Return to Public Portfolio
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* ══════════════════════════════════════════════
                           AUTHENTICATED ADMIN COMMAND CENTER
                           ══════════════════════════════════════════════ */
                        <div className='space-y-8 animate-fadeIn'>
                            {/* Header & Session Bar */}
                            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6' style={{ borderColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                                <div>
                                    <div className='flex items-center gap-3'>
                                        <h1 className='text-2xl sm:text-3xl font-extrabold tracking-tight'>
                                            Admin Dashboard
                                        </h1>
                                        <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'>
                                            <span className='w-2 h-2 rounded-full bg-emerald-400 animate-pulse' />
                                            Admin Session Active
                                        </span>
                                    </div>
                                    <p className={`text-xs sm:text-sm mt-1 ${dark ? 'text-zinc-400' : 'text-slate-600'}`}>
                                        Manage your publications, research notes, and master security settings.
                                    </p>
                                </div>

                                <div className='flex items-center gap-2.5 flex-wrap'>
                                    <button
                                        type='button'
                                        onClick={loadDashboardData}
                                        className={`p-2.5 rounded-xl border text-xs font-semibold transition active:scale-[0.98] cursor-pointer flex items-center gap-1.5 ${
                                            dark ? 'border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300' : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
                                        }`}
                                        title='Reload Data'
                                    >
                                        <FiRefreshCw className={`text-sm ${loadingData ? 'animate-spin' : ''}`} />
                                        <span className='hidden sm:inline'>Refresh</span>
                                    </button>

                                    <button
                                        type='button'
                                        onClick={handleLockSession}
                                        className='px-4 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold transition active:scale-[0.98] cursor-pointer flex items-center gap-2'
                                    >
                                        <FiLogOut className='text-sm' />
                                        <span>Lock Session</span>
                                    </button>
                                </div>
                            </div>

                            {/* Metrics & Overview Ribbon */}
                            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                                <div className={`p-5 rounded-2xl border transition-all ${
                                    dark ? 'bg-[#0f1117] border-white/10' : 'bg-white border-slate-200'
                                }`}>
                                    <div className='flex items-center justify-between'>
                                        <span className={`text-xs font-semibold ${dark ? 'text-zinc-400' : 'text-slate-500'}`}>
                                            Published Articles
                                        </span>
                                        <div className='w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center'>
                                            <FiFileText className='text-sm' />
                                        </div>
                                    </div>
                                    <div className='text-2xl sm:text-3xl font-extrabold mt-2'>
                                        {blogs.length}
                                    </div>
                                    <p className={`text-[11px] mt-1 ${dark ? 'text-zinc-500' : 'text-slate-400'}`}>
                                        Technical blogs in portfolio
                                    </p>
                                </div>

                                <div className={`p-5 rounded-2xl border transition-all ${
                                    dark ? 'bg-[#0f1117] border-white/10' : 'bg-white border-slate-200'
                                }`}>
                                    <div className='flex items-center justify-between'>
                                        <span className={`text-xs font-semibold ${dark ? 'text-zinc-400' : 'text-slate-500'}`}>
                                            Published Notes
                                        </span>
                                        <div className='w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center'>
                                            <FiBookOpen className='text-sm' />
                                        </div>
                                    </div>
                                    <div className='text-2xl sm:text-3xl font-extrabold mt-2'>
                                        {notes.length}
                                    </div>
                                    <p className={`text-[11px] mt-1 ${dark ? 'text-zinc-500' : 'text-slate-400'}`}>
                                        Mathematical & AI/ML research notes
                                    </p>
                                </div>

                                <div className={`p-5 rounded-2xl border transition-all ${
                                    dark ? 'bg-[#0f1117] border-white/10' : 'bg-white border-slate-200'
                                }`}>
                                    <div className='flex items-center justify-between'>
                                        <span className={`text-xs font-semibold ${dark ? 'text-zinc-400' : 'text-slate-500'}`}>
                                            Security Guard Status
                                        </span>
                                        <div className='w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center'>
                                            <FiShield className='text-sm' />
                                        </div>
                                    </div>
                                    <div className='text-sm font-bold text-emerald-400 mt-2 truncate font-mono'>
                                        {keySettings.secret_key_preview || 'samirbuilds-admin-***'}
                                    </div>
                                    <p className={`text-[11px] mt-1 ${dark ? 'text-zinc-500' : 'text-slate-400'}`}>
                                        Public create buttons secured
                                    </p>
                                </div>
                            </div>

                            {/* Dashboard Navigation Tabs */}
                            <div className={`flex items-center gap-2 border-b pb-1 overflow-x-auto scrollbar-none`} style={{ borderColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                                <button
                                    type='button'
                                    onClick={() => setActiveTab('blogs')}
                                    className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                                        activeTab === 'blogs'
                                            ? dark ? 'bg-white text-black' : 'bg-blue-600 text-white'
                                            : dark ? 'text-zinc-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                    }`}
                                >
                                    <FiFileText />
                                    <span>Blogs & Articles ({blogs.length})</span>
                                </button>

                                <button
                                    type='button'
                                    onClick={() => setActiveTab('notes')}
                                    className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                                        activeTab === 'notes'
                                            ? dark ? 'bg-white text-black' : 'bg-blue-600 text-white'
                                            : dark ? 'text-zinc-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                    }`}
                                >
                                    <FiBookOpen />
                                    <span>Notes & Math Research ({notes.length})</span>
                                </button>

                                <button
                                    type='button'
                                    onClick={() => setActiveTab('security')}
                                    className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                                        activeTab === 'security'
                                            ? dark ? 'bg-white text-black' : 'bg-blue-600 text-white'
                                            : dark ? 'text-zinc-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                    }`}
                                >
                                    <FiKey />
                                    <span>Security Settings & Secret Keys</span>
                                </button>
                            </div>

                            {/* ── TAB 1: BLOGS MANAGEMENT ── */}
                            {activeTab === 'blogs' && (
                                <div className='space-y-6'>
                                    {/* Action Bar */}
                                    <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                                        <div className='relative w-full sm:w-80'>
                                            <FiSearch className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-sm ${dark ? 'text-zinc-500' : 'text-slate-400'}`} />
                                            <input
                                                type='text'
                                                placeholder='Search articles by title or tag...'
                                                value={blogSearch}
                                                onChange={e => setBlogSearch(e.target.value)}
                                                className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-xs sm:text-sm border outline-none transition ${
                                                    dark ? 'bg-black/40 border-white/10 text-white focus:border-blue-500' : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                                                }`}
                                            />
                                        </div>

                                        <button
                                            type='button'
                                            onClick={() => {
                                                setBlogToEdit(null)
                                                setOpenAddBlog(true)
                                            }}
                                            className='inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer shrink-0'
                                        >
                                            <FiPlus className='text-base' />
                                            <span>Upload New Blog Article</span>
                                        </button>
                                    </div>

                                    {/* Blogs Table / List */}
                                    {loadingData ? (
                                        <LoadingSpinner />
                                    ) : filteredBlogs.length === 0 ? (
                                        <div className={`text-center py-16 rounded-2xl border ${dark ? 'bg-[#0f1117] border-white/10 text-zinc-400' : 'bg-white border-slate-200 text-slate-500'}`}>
                                            <FiFileText className='text-3xl mx-auto mb-2 opacity-40' />
                                            <p className='text-sm font-semibold'>No articles found</p>
                                            <p className='text-xs mt-1'>Click "Upload New Blog Article" to create your first publication.</p>
                                        </div>
                                    ) : (
                                        <div className={`rounded-2xl border overflow-hidden shadow-sm ${dark ? 'bg-[#0f1117] border-white/10' : 'bg-white border-slate-200'}`}>
                                            <div className='overflow-x-auto'>
                                                <table className='w-full text-left text-xs sm:text-sm'>
                                                    <thead className={`border-b text-[11px] uppercase tracking-wider ${
                                                        dark ? 'bg-white/5 border-white/10 text-zinc-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                                                    }`}>
                                                        <tr>
                                                            <th className='py-3.5 px-4'>Article Title</th>
                                                            <th className='py-3.5 px-4'>Tag</th>
                                                            <th className='py-3.5 px-4'>Date</th>
                                                            <th className='py-3.5 px-4 text-right'>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className={`divide-y ${dark ? 'divide-white/5' : 'divide-slate-100'}`}>
                                                        {filteredBlogs.map(blog => {
                                                            const slug = blog.slug || blog._id
                                                            return (
                                                                <tr key={blog._id || slug} className={`transition ${dark ? 'hover:bg-white/[0.03]' : 'hover:bg-slate-50'}`}>
                                                                    <td className='py-3.5 px-4 font-semibold max-w-xs sm:max-w-md truncate'>
                                                                        <div className='flex items-center gap-3'>
                                                                            {blog.img && (
                                                                                <img
                                                                                    src={blog.img}
                                                                                    alt=''
                                                                                    className='w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0'
                                                                                />
                                                                            )}
                                                                            <span className='truncate'>{blog.title}</span>
                                                                        </div>
                                                                    </td>
                                                                    <td className='py-3.5 px-4 whitespace-nowrap'>
                                                                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                                            dark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-800'
                                                                        }`}>
                                                                            {blog.tag || 'general'}
                                                                        </span>
                                                                    </td>
                                                                    <td className={`py-3.5 px-4 whitespace-nowrap text-xs ${dark ? 'text-zinc-400' : 'text-slate-500'}`}>
                                                                        {blog.published_at ? new Date(blog.published_at).toLocaleDateString() : 'Recent'}
                                                                    </td>
                                                                    <td className='py-3.5 px-4 whitespace-nowrap text-right'>
                                                                        <div className='flex items-center justify-end gap-1.5'>
                                                                            <Link
                                                                                to={`/blogs/${slug}`}
                                                                                target='_blank'
                                                                                rel='noreferrer'
                                                                                className={`p-2 rounded-lg transition cursor-pointer ${
                                                                                    dark ? 'text-zinc-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                                                                                }`}
                                                                                title='View public article'
                                                                            >
                                                                                <FiExternalLink className='text-sm' />
                                                                            </Link>
                                                                            <button
                                                                                type='button'
                                                                                onClick={() => {
                                                                                    setBlogToEdit(blog)
                                                                                    setOpenAddBlog(true)
                                                                                }}
                                                                                className={`p-2 rounded-lg transition cursor-pointer ${
                                                                                    dark ? 'text-blue-400 hover:bg-blue-500/10' : 'text-blue-600 hover:bg-blue-50'
                                                                                }`}
                                                                                title='Edit article'
                                                                            >
                                                                                <FiEdit2 className='text-sm' />
                                                                            </button>
                                                                            <button
                                                                                type='button'
                                                                                onClick={() => {
                                                                                    setDeleteBlogError(null)
                                                                                    setBlogToDelete(blog)
                                                                                }}
                                                                                className={`p-2 rounded-lg transition cursor-pointer ${
                                                                                    dark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'
                                                                                }`}
                                                                                title='Delete article'
                                                                            >
                                                                                <FiTrash2 className='text-sm' />
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── TAB 2: NOTES MANAGEMENT ── */}
                            {activeTab === 'notes' && (
                                <div className='space-y-6'>
                                    {/* Action Bar */}
                                    <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                                        <div className='relative w-full sm:w-80'>
                                            <FiSearch className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-sm ${dark ? 'text-zinc-500' : 'text-slate-400'}`} />
                                            <input
                                                type='text'
                                                placeholder='Search notes by title or content...'
                                                value={noteSearch}
                                                onChange={e => setNoteSearch(e.target.value)}
                                                className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-xs sm:text-sm border outline-none transition ${
                                                    dark ? 'bg-black/40 border-white/10 text-white focus:border-blue-500' : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                                                }`}
                                            />
                                        </div>

                                        <button
                                            type='button'
                                            onClick={() => {
                                                setNoteToEdit(null)
                                                setOpenAddNote(true)
                                            }}
                                            className='inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer shrink-0'
                                        >
                                            <FiPlus className='text-base' />
                                            <span>Upload New Note / Research</span>
                                        </button>
                                    </div>

                                    {/* Notes Table / List */}
                                    {loadingData ? (
                                        <LoadingSpinner />
                                    ) : filteredNotes.length === 0 ? (
                                        <div className={`text-center py-16 rounded-2xl border ${dark ? 'bg-[#0f1117] border-white/10 text-zinc-400' : 'bg-white border-slate-200 text-slate-500'}`}>
                                            <FiBookOpen className='text-3xl mx-auto mb-2 opacity-40' />
                                            <p className='text-sm font-semibold'>No research notes found</p>
                                            <p className='text-xs mt-1'>Click "Upload New Note" to write rich LaTeX equations, vectors, and markdown.</p>
                                        </div>
                                    ) : (
                                        <div className={`rounded-2xl border overflow-hidden shadow-sm ${dark ? 'bg-[#0f1117] border-white/10' : 'bg-white border-slate-200'}`}>
                                            <div className='overflow-x-auto'>
                                                <table className='w-full text-left text-xs sm:text-sm'>
                                                    <thead className={`border-b text-[11px] uppercase tracking-wider ${
                                                        dark ? 'bg-white/5 border-white/10 text-zinc-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                                                    }`}>
                                                        <tr>
                                                            <th className='py-3.5 px-4'>Note Title</th>
                                                            <th className='py-3.5 px-4'>Domain Tag</th>
                                                            <th className='py-3.5 px-4'>Date</th>
                                                            <th className='py-3.5 px-4 text-right'>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className={`divide-y ${dark ? 'divide-white/5' : 'divide-slate-100'}`}>
                                                        {filteredNotes.map(note => {
                                                            const slug = note.slug || note._id
                                                            return (
                                                                <tr key={note._id || slug} className={`transition ${dark ? 'hover:bg-white/[0.03]' : 'hover:bg-slate-50'}`}>
                                                                    <td className='py-3.5 px-4 font-semibold max-w-xs sm:max-w-md truncate'>
                                                                        <div className='flex items-center gap-2'>
                                                                            <FiFileText className='text-purple-400 shrink-0' />
                                                                            <span className='truncate'>{note.title}</span>
                                                                        </div>
                                                                    </td>
                                                                    <td className='py-3.5 px-4 whitespace-nowrap'>
                                                                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                                            dark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-800'
                                                                        }`}>
                                                                            {note.tag || 'ai/ml'}
                                                                        </span>
                                                                    </td>
                                                                    <td className={`py-3.5 px-4 whitespace-nowrap text-xs ${dark ? 'text-zinc-400' : 'text-slate-500'}`}>
                                                                        {note.published_at ? new Date(note.published_at).toLocaleDateString() : 'Recent'}
                                                                    </td>
                                                                    <td className='py-3.5 px-4 whitespace-nowrap text-right'>
                                                                        <div className='flex items-center justify-end gap-1.5'>
                                                                            <Link
                                                                                to={`/notes/${slug}`}
                                                                                target='_blank'
                                                                                rel='noreferrer'
                                                                                className={`p-2 rounded-lg transition cursor-pointer ${
                                                                                    dark ? 'text-zinc-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                                                                                }`}
                                                                                title='View public note'
                                                                            >
                                                                                <FiExternalLink className='text-sm' />
                                                                            </Link>
                                                                            <button
                                                                                type='button'
                                                                                onClick={() => {
                                                                                    setNoteToEdit(note)
                                                                                    setOpenAddNote(true)
                                                                                }}
                                                                                className={`p-2 rounded-lg transition cursor-pointer ${
                                                                                    dark ? 'text-blue-400 hover:bg-blue-500/10' : 'text-blue-600 hover:bg-blue-50'
                                                                                }`}
                                                                                title='Edit note'
                                                                            >
                                                                                <FiEdit2 className='text-sm' />
                                                                            </button>
                                                                            <button
                                                                                type='button'
                                                                                onClick={() => {
                                                                                    setDeleteNoteError(null)
                                                                                    setNoteToDelete(note)
                                                                                }}
                                                                                className={`p-2 rounded-lg transition cursor-pointer ${
                                                                                    dark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'
                                                                                }`}
                                                                                title='Delete note'
                                                                            >
                                                                                <FiTrash2 className='text-sm' />
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── TAB 3: SECURITY SETTINGS & KEYS ── */}
                            {activeTab === 'security' && (
                                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                                    {/* Master Secret Key Manager */}
                                    <div className={`rounded-3xl border p-6 sm:p-7 transition-all ${
                                        dark ? 'bg-[#0f1117] border-white/10' : 'bg-white border-slate-200'
                                    }`}>
                                        <div className='flex items-center gap-3 mb-5'>
                                            <div className='w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center'>
                                                <FiKey className='text-lg' />
                                            </div>
                                            <div>
                                                <h3 className='text-lg font-bold'>Master Secret Key Manager</h3>
                                                <p className={`text-xs ${dark ? 'text-zinc-400' : 'text-slate-500'}`}>
                                                    Rotate or update your cryptographic admin passkey
                                                </p>
                                            </div>
                                        </div>

                                        <div className={`p-3.5 rounded-xl text-xs mb-5 border font-mono ${
                                            dark ? 'bg-black/50 border-white/10 text-zinc-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                                        }`}>
                                            Active Master Key: <span className='text-blue-400 font-bold'>{keySettings.secret_key_preview}</span>
                                        </div>

                                        {keySuccess && (
                                            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 mb-4 border ${
                                                dark ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                            }`}>
                                                <FiCheck className='text-sm shrink-0' />
                                                <span>{keySuccess}</span>
                                            </div>
                                        )}

                                        {keyError && (
                                            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 mb-4 border ${
                                                dark ? 'bg-red-500/10 border-red-500/30 text-red-300' : 'bg-red-50 border-red-200 text-red-700'
                                            }`}>
                                                <FiAlertTriangle className='text-sm shrink-0' />
                                                <span>{keyError}</span>
                                            </div>
                                        )}

                                        <form onSubmit={handleUpdateSecretKey} className='space-y-4'>
                                            <div>
                                                <label className={`block text-xs font-semibold mb-1 ${dark ? 'text-zinc-300' : 'text-slate-700'}`}>
                                                    Current Secret Key
                                                </label>
                                                <input
                                                    type='password'
                                                    placeholder='Enter your existing secret key'
                                                    value={currentKeyInput}
                                                    onChange={e => setCurrentKeyInput(e.target.value)}
                                                    required
                                                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border outline-none transition ${
                                                        dark ? 'bg-black/40 border-white/10 text-white focus:border-blue-500' : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                                                    }`}
                                                />
                                            </div>

                                            <div>
                                                <label className={`block text-xs font-semibold mb-1 ${dark ? 'text-zinc-300' : 'text-slate-700'}`}>
                                                    New Master Secret Key (Min 8 characters)
                                                </label>
                                                <input
                                                    type='password'
                                                    placeholder='Enter new master secret key'
                                                    value={newKeyInput}
                                                    onChange={e => setNewKeyInput(e.target.value)}
                                                    required
                                                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border outline-none transition ${
                                                        dark ? 'bg-black/40 border-white/10 text-white focus:border-blue-500' : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                                                    }`}
                                                />
                                            </div>

                                            <div>
                                                <label className={`block text-xs font-semibold mb-1 ${dark ? 'text-zinc-300' : 'text-slate-700'}`}>
                                                    Confirm New Master Secret Key
                                                </label>
                                                <input
                                                    type='password'
                                                    placeholder='Re-type new master secret key'
                                                    value={confirmKeyInput}
                                                    onChange={e => setConfirmKeyInput(e.target.value)}
                                                    required
                                                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border outline-none transition ${
                                                        dark ? 'bg-black/40 border-white/10 text-white focus:border-blue-500' : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                                                    }`}
                                                />
                                            </div>

                                            <button
                                                type='submit'
                                                disabled={keyUpdating}
                                                className='w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm transition-all duration-200 shadow-md active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60'
                                            >
                                                {keyUpdating ? (
                                                    <span>Updating Master Secret Key...</span>
                                                ) : (
                                                    <>
                                                        <FiCheck className='text-sm' />
                                                        <span>Update & Save Secret Key</span>
                                                    </>
                                                )}
                                            </button>
                                        </form>
                                    </div>

                                    {/* Security Architecture Brief */}
                                    <div className={`rounded-3xl border p-6 sm:p-7 flex flex-col justify-between transition-all ${
                                        dark ? 'bg-[#0f1117] border-white/10' : 'bg-white border-slate-200'
                                    }`}>
                                        <div>
                                            <div className='flex items-center gap-3 mb-5'>
                                                <div className='w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center'>
                                                    <FiShield className='text-lg' />
                                                </div>
                                                <div>
                                                    <h3 className='text-lg font-bold'>Security Architecture</h3>
                                                    <p className={`text-xs ${dark ? 'text-zinc-400' : 'text-slate-500'}`}>
                                                        How uploads and modifications are protected
                                                    </p>
                                                </div>
                                            </div>

                                            <div className='space-y-4 text-xs sm:text-sm leading-relaxed'>
                                                <div className={`p-3.5 rounded-xl border ${dark ? 'bg-black/30 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                                                    <h4 className='font-bold text-blue-400 mb-1'>1. Public Surface Hardened</h4>
                                                    <p className={dark ? 'text-zinc-400' : 'text-slate-600'}>
                                                        The "New Blog" and "New Note" action buttons have been removed from public visitor views on <code className='font-mono'>/blogs</code> and <code className='font-mono'>/notes</code>. Only this protected admin portal contains publishing triggers.
                                                    </p>
                                                </div>

                                                <div className={`p-3.5 rounded-xl border ${dark ? 'bg-black/30 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                                                    <h4 className='font-bold text-blue-400 mb-1'>2. Dual Gate Authentication</h4>
                                                    <p className={dark ? 'text-zinc-400' : 'text-slate-600'}>
                                                        All mutating endpoints (<code className='font-mono'>/blog/create</code>, <code className='font-mono'>/blog/update</code>, <code className='font-mono'>/blog/delete</code>, <code className='font-mono'>/note/create</code>, etc.) enforce <code className='font-mono'>Depends(get_current_admin)</code> requiring either an authenticated admin JWT or the cryptographic <code className='font-mono'>X-Admin-Secret</code> header.
                                                    </p>
                                                </div>

                                                <div className={`p-3.5 rounded-xl border ${dark ? 'bg-black/30 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                                                    <h4 className='font-bold text-blue-400 mb-1'>3. Zero-Tamper Local Cache</h4>
                                                    <p className={dark ? 'text-zinc-400' : 'text-slate-600'}>
                                                        Unauthorized browser attempts cannot manipulate publications; any unauthorized payload sent to the backend is rejected with a <code className='font-mono'>403 Forbidden</code> response.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className='pt-6'>
                                            <button
                                                type='button'
                                                onClick={handleLockSession}
                                                className={`w-full py-2.5 rounded-xl border transition-all text-xs font-semibold cursor-pointer flex items-center justify-center gap-2 ${
                                                    dark ? 'border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400' : 'border-red-200 bg-red-50 hover:bg-red-100 text-red-700'
                                                }`}
                                            >
                                                <FiLock className='text-sm' />
                                                <span>Invalidate Keys & Lock Session</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>

            {/* Create & Edit Blog Modal */}
            <AddBlog
                openAdd={openAddBlog}
                setOpenAdd={setOpenAddBlog}
                blogToEdit={blogToEdit}
                onBlogAdded={() => loadDashboardData()}
                onBlogUpdated={() => loadDashboardData()}
            />

            {/* Delete Blog Confirmation Modal */}
            <DeleteBlogModal
                isOpen={!!blogToDelete}
                blog={blogToDelete}
                onClose={() => {
                    setBlogToDelete(null)
                    setDeleteBlogError(null)
                }}
                onConfirm={handleConfirmDeleteBlog}
                loading={deletingBlog}
                error={deleteBlogError}
            />

            {/* Create & Edit Note Modal */}
            {openAddNote && (
                <AddNote
                    setOpenAdd={setOpenAddNote}
                    noteToEdit={noteToEdit}
                    onNoteAdded={() => loadDashboardData()}
                    onNoteUpdated={() => loadDashboardData()}
                />
            )}

            {/* Delete Note Confirmation Modal */}
            <DeleteNoteModal
                isOpen={!!noteToDelete}
                note={noteToDelete}
                onClose={() => {
                    setNoteToDelete(null)
                    setDeleteNoteError(null)
                }}
                onConfirm={handleConfirmDeleteNote}
                loading={deletingNote}
                error={deleteNoteError}
            />
        </div>
    )
}

export default AdminDashboard

