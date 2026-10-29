import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { NoteGridCard } from '../components/NoteCard'
import AddNote from '../components/AddNote'
import DeleteNoteModal from '../components/DeleteNoteModal'
import { useTheme } from '../context/ThemeContext'
import { SAMPLE_TRANSFORMER_NOTE } from '../utils/defaultNotes'
import { deleteNoteApi } from '../utils/authUtils'
import { FiSearch, FiPlus, FiTag, FiBookOpen } from 'react-icons/fi'
import LoadingSpinner from '../components/LoadingSpinner'

const TAG_FILTERS = ['all', 'ai/ml', 'math', 'web', 'python', 'general']

const Notes = () => {
    const navigate = useNavigate()
    const [notes, setNotes] = useState([])
    const [selectedTag, setSelectedTag] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(true)
    const [openAdd, setOpenAdd] = useState(false)
    const [noteToDelete, setNoteToDelete] = useState(null)
    const [noteToEdit, setNoteToEdit] = useState(null)
    const [deleting, setDeleting] = useState(false)
    const { theme } = useTheme()
    const dark = theme === 'dark'

    const handleConfirmDelete = async () => {
        if (!noteToDelete) return
        setDeleting(true)
        try {
            await deleteNoteApi(noteToDelete)
            setNoteToDelete(null)
            await fetchNotes()
        } catch (err) {
            alert(err.message || 'Failed to delete note')
        } finally {
            setDeleting(false)
        }
    }

    const handleNewNoteClick = () => {
        const token = localStorage.getItem('token')
        if (!token) {
            navigate('/signup')
            return
        }
        setOpenAdd(true)
    }

    const fetchNotes = async () => {
        setLoading(true)
        let remoteNotes = []
        let localNotes = []

        // 1. Read locally saved notes
        try {
            const rawLocal = localStorage.getItem('samirbuilds_notes')
            if (rawLocal) {
                localNotes = JSON.parse(rawLocal)
            }
        } catch (e) {
            console.error('Error reading local notes:', e)
        }

        // 2. Fetch server notes
        try {
            const res = await fetch('http://127.0.0.1:8000/notes')
            if (res.ok) {
                const data = await res.json()
                if (Array.isArray(data)) {
                    remoteNotes = data
                }
            }
        } catch (err) {
            console.warn('Backend server notes unreachable, relying on local/sample notes.')
        }

        // 3. Combine unique notes (local notes first, then remote)
        const combinedMap = new Map()
        localNotes.forEach(n => combinedMap.set(n._id || n.slug || n.title, n))
        remoteNotes.forEach(n => combinedMap.set(n._id || n.slug || n.title, n))

        let combined = Array.from(combinedMap.values())

        // 4. If no notes exist anywhere, initialize with the Transformer LM Head sample note
        if (combined.length === 0) {
            combined = [SAMPLE_TRANSFORMER_NOTE]
        } else if (!combined.some(n => n.title.includes('Language Model Head'))) {
            // Also append the sample note if not present so user can always explore it
            combined.push(SAMPLE_TRANSFORMER_NOTE)
        }

        setNotes(combined)
        setLoading(false)
    }

    useEffect(() => {
        fetchNotes()
    }, [])

    // Filter notes based on active tag and search query
    const filteredNotes = notes.filter(note => {
        const matchesTag = selectedTag === 'all' || (note.tag?.toLowerCase() === selectedTag.toLowerCase())
        const q = searchQuery.toLowerCase().trim()
        const matchesSearch = !q || 
            (note.title?.toLowerCase().includes(q)) || 
            (note.content?.toLowerCase().includes(q)) ||
            (note.tag?.toLowerCase().includes(q))
        return matchesTag && matchesSearch
    })

    return (
        <div className={`min-h-screen ${dark ? 'bg-black text-white' : 'bg-slate-50 text-gray-900'} pb-16 flex flex-col justify-between transition-colors duration-300 font-sans`}>
            <div>
                <Navbar />

                <main className='max-w-7xl mx-auto px-4 sm:px-8 md:px-12 lg:px-20 py-8'>
                    {/* ── Page Header ── */}
                    <div className='flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 mb-6 border-0 border-none'>
                        <div>
                            <div className='flex items-center gap-2 mb-1'>
                                <span className='text-xs font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border-0 border-none'>
                                    Deep Dive Notes
                                </span>
                                <span className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    KaTeX Math & Markdown
                                </span>
                            </div>
                            <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${dark ? 'text-white' : 'text-gray-900'}`}>
                                Learning & Research Notes
                            </h1>
                            <p className={`text-sm mt-1 max-w-xl ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Write notes with full support for mathematical symbols, matrices, code and tables.
                            </p>
                        </div>

                        {/* Top Action */}
                        <div className='flex items-center gap-3 self-start md:self-center'>
                            <button
                                type='button'
                                onClick={handleNewNoteClick}
                                className='inline-flex items-center gap-2 bg-[#ededf1] hover:bg-white text-[#070708] font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-full transition-all duration-200 active:scale-[0.98] shadow-sm cursor-pointer border-0 border-none'
                            >
                                <FiPlus className='text-base' />
                                <span>New Note</span>
                            </button>
                        </div>
                    </div>

                    {/* ── Filter & Search Toolbar ── */}
                    <div className='flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8'>
                        {/* Tag Chips */}
                        <div className='flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none'>
                            <FiTag className={`text-sm mr-1 ${dark ? 'text-gray-500' : 'text-gray-400'}`} />
                            {TAG_FILTERS.map(t => (
                                <button
                                    key={t}
                                    type='button'
                                    onClick={() => setSelectedTag(t)}
                                    className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200 active:scale-[0.98] cursor-pointer whitespace-nowrap ${
                                        selectedTag === t
                                            ? 'bg-[#ededf1] hover:bg-white text-[#070708] font-bold shadow-sm border-0 border-none'
                                            : dark
                                                ? 'border border-white/15 bg-white/5 text-[#8e8e96] hover:text-[#ededf1] hover:border-white/30 hover:bg-white/10'
                                                : 'border border-gray-300 bg-white text-gray-700 hover:text-black hover:border-gray-400 hover:bg-gray-50'
                                    }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>

                        {/* Search Input */}
                        <div className='relative w-full md:w-72'>
                            <FiSearch className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-sm ${dark ? 'text-gray-500' : 'text-gray-400'}`} />
                            <input
                                type='text'
                                placeholder='Search notes, math, logits...'
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
                    ) : filteredNotes.length === 0 ? (
                        <div className={`flex flex-col items-center justify-center py-20 gap-4 rounded-2xl border-0 border-none text-center p-8 ${
                            dark ? 'bg-gray-900/40 text-gray-400' : 'bg-white text-gray-500'
                        }`}>
                            <div className='w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-3xl mb-2 text-blue-500'>
                                🔍
                            </div>
                            <h3 className='text-lg font-bold text-gray-900 dark:text-white'>
                                No matching notes found
                            </h3>
                            <p className='text-xs sm:text-sm max-w-md'>
                                {searchQuery || selectedTag !== 'all' 
                                    ? `No notes matched tag "${selectedTag}" and query "${searchQuery}".` 
                                    : 'Start capturing what you learn every day.'}
                            </p>
                            <div className='flex gap-3 mt-4 flex-wrap justify-center'>
                                {(searchQuery || selectedTag !== 'all') && (
                                    <button
                                        type='button'
                                        onClick={() => { setSearchQuery(''); setSelectedTag('all') }}
                                        className={`px-5 py-2.5 rounded-full text-xs font-semibold border transition-all active:scale-[0.98] cursor-pointer ${
                                            dark ? 'border-white/15 bg-white/5 text-[#ededf1] hover:bg-white/10' : 'border-gray-300 bg-white text-gray-800 hover:bg-gray-50'
                                        }`}
                                    >
                                        Clear filters
                                    </button>
                                )}
                                <button
                                    type='button'
                                    onClick={handleNewNoteClick}
                                    className='inline-flex items-center gap-2 bg-[#ededf1] hover:bg-white text-[#070708] font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-full transition-all duration-200 active:scale-[0.98] shadow-sm cursor-pointer border-0 border-none'
                                >
                                    <FiPlus className='text-base' />
                                    <span>New Note</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            {/* Grid format of 3 to 4 columns */}
                            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                                {filteredNotes.map(note => (
                                    <NoteGridCard
                                        key={note._id || note.slug || note.title}
                                        note={note}
                                        onDelete={setNoteToDelete}
                                        onEdit={setNoteToEdit}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Add Note Modal */}
            {openAdd && (
                <AddNote
                    setOpenAdd={setOpenAdd}
                    onNoteAdded={() => {
                        fetchNotes()
                        setOpenAdd(false)
                    }}
                />
            )}

            {/* Delete Note Confirmation Modal */}
            <DeleteNoteModal
                isOpen={Boolean(noteToDelete)}
                note={noteToDelete}
                onClose={() => setNoteToDelete(null)}
                onConfirm={handleConfirmDelete}
                loading={deleting}
            />

            {/* Edit Note Modal */}
            {noteToEdit && (
                <AddNote
                    setOpenAdd={() => setNoteToEdit(null)}
                    noteToEdit={noteToEdit}
                    onNoteUpdated={() => {
                        fetchNotes()
                        setNoteToEdit(null)
                    }}
                />
            )}
        </div>
    )
}

export default Notes
