import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { NoteGridCard } from '../components/NoteCard'
import AddNote from '../components/AddNote'
import DeleteNoteModal from '../components/DeleteNoteModal'
import Pagination from '../components/Pagination'
import { useTheme } from '../context/ThemeContext'

import { deleteNoteApi } from '../utils/authUtils'
import { FiSearch, FiPlus } from 'react-icons/fi'
import LoadingSpinner from '../components/LoadingSpinner'

const ITEMS_PER_PAGE = 8

const Notes = () => {
    const navigate = useNavigate()
    const [notes, setNotes] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [openAdd, setOpenAdd] = useState(false)
    const [noteToDelete, setNoteToDelete] = useState(null)
    const [noteToEdit, setNoteToEdit] = useState(null)
    const [deleting, setDeleting] = useState(false)
    const [deleteError, setDeleteError] = useState(null)
    const { theme } = useTheme()
    const dark = theme === 'dark'

    const handleConfirmDelete = async () => {
        if (!noteToDelete) return
        setDeleting(true)
        setDeleteError(null)
        try {
            await deleteNoteApi(noteToDelete)
            setNoteToDelete(null)
            setDeleteError(null)
            await fetchNotes()
        } catch (err) {
            setDeleteError(err.message || 'Failed to delete note')
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
                localNotes = JSON.parse(rawLocal).filter(n => n?._id !== 'default-lm-head-transformer' && n?.slug !== 'how-does-the-language-model-head-work-in-a-transformer')
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

        setNotes(combined)
        setLoading(false)
    }

    useEffect(() => {
        fetchNotes()
    }, [])

    // Reset pagination to first page when searching
    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery])

    // Filter notes based on search query
    const filteredNotes = notes.filter(note => {
        const q = searchQuery.toLowerCase().trim()
        return !q || 
            (note.title?.toLowerCase().includes(q)) || 
            (note.content?.toLowerCase().includes(q)) ||
            (note.tag?.toLowerCase().includes(q))
    })

    // Pagination calculations (8 items per page)
    const totalPages = Math.ceil(filteredNotes.length / ITEMS_PER_PAGE)
    const safeCurrentPage = Math.max(1, Math.min(currentPage, totalPages || 1))
    const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE
    const paginatedNotes = filteredNotes.slice(startIndex, startIndex + ITEMS_PER_PAGE)

    return (
        <div className={`min-h-screen ${dark ? 'bg-black text-white' : 'bg-slate-50 text-gray-900'} pb-16 flex flex-col justify-between transition-colors duration-300 font-sans`}>
            <div>
                <Navbar />

                <main className='max-w-[1320px] mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-8 pt-6 md:pt-10 pb-8 md:pb-14'>
                    {/* ── Action & Search Toolbar ── */}
                    <div className='flex flex-row items-center justify-between gap-4 mb-8'>
                        {/* Left: Notes Button */}
                        <button
                            type='button'
                            onClick={() => setSearchQuery('')}
                            className='inline-flex items-center gap-2 bg-[#ededf1] hover:bg-white text-[#070708] font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-full transition-all duration-200 active:scale-[0.98] shadow-sm cursor-pointer border-0 border-none shrink-0'
                        >
                            <span>Notes</span>
                        </button>
                        {/* Right: Search Input */}
                        <div className='relative w-full max-w-xs sm:w-72'>
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
                                {searchQuery 
                                    ? `No notes matched query "${searchQuery}".` 
                                    : 'Start capturing what you learn every day.'}
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
                        <div>
                            {/* Grid format of 3 to 4 columns */}
                            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                                {paginatedNotes.map(note => (
                                    <NoteGridCard
                                        key={note._id || note.slug || note.title}
                                        note={note}
                                        onDelete={(n) => {
                                            setNoteToDelete(n)
                                            setDeleteError(null)
                                        }}
                                        onEdit={setNoteToEdit}
                                    />
                                ))}
                            </div>

                            {/* Pagination Controls after 8 items */}
                            {totalPages > 1 && (
                                <Pagination
                                    currentPage={safeCurrentPage}
                                    totalPages={totalPages}
                                    onPageChange={(page) => {
                                        setCurrentPage(page)
                                        window.scrollTo({ top: 0, behavior: 'smooth' })
                                    }}
                                />
                            )}
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
                onClose={() => {
                    setNoteToDelete(null)
                    setDeleteError(null)
                }}
                onConfirm={handleConfirmDelete}
                loading={deleting}
                error={deleteError}
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
