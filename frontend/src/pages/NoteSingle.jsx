import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { NoteFeatured, NoteGridCard } from '../components/NoteCard'
import { useTheme } from '../context/ThemeContext'

import { titleToSlug } from '../utils/markdownUtils'
import { isNoteAuthor, deleteNoteApi } from '../utils/authUtils'
import { calculateRelatedNotes } from '../utils/relatedNotes'
import Pagination from '../components/Pagination'
import DeleteNoteModal from '../components/DeleteNoteModal'
import AddNote from '../components/AddNote'
import { FiArrowLeft, FiTag, FiBookOpen } from 'react-icons/fi'
import LoadingSpinner from '../components/LoadingSpinner'

const RELATED_PER_PAGE = 6

const NoteSingle = () => {
    const { slug } = useParams()
    const navigate = useNavigate()
    const { theme } = useTheme()
    const dark = theme === 'dark'

    const [note, setNote] = useState(null)
    const [relatedNotes, setRelatedNotes] = useState([])
    const [relatedPage, setRelatedPage] = useState(1)
    const [allNotesCount, setAllNotesCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [deleteError, setDeleteError] = useState(null)

    const canDelete = isNoteAuthor(note)

    const handleConfirmDelete = async () => {
        if (!note) return
        setDeleting(true)
        setDeleteError(null)
        try {
            await deleteNoteApi(note)
            setDeleteModalOpen(false)
            setDeleteError(null)
            navigate('/notes', { replace: true })
        } catch (err) {
            setDeleteError(err.message || 'Failed to delete note')
        } finally {
            setDeleting(false)
        }
    }

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        setRelatedPage(1)
        fetchCurrentNote()
    }, [slug])

    const fetchCurrentNote = async () => {
        setLoading(true)
        const targetSlug = (slug || '').toLowerCase().trim()

        let localNotes = []
        let remoteNotes = []

        // 1. Check local storage
        try {
            const rawLocal = localStorage.getItem('samirbuilds_notes')
            if (rawLocal) {
                localNotes = JSON.parse(rawLocal).filter(n => n?._id !== 'default-lm-head-transformer' && n?.slug !== 'how-does-the-language-model-head-work-in-a-transformer')
            }
        } catch (e) {
            console.error('Error reading local notes:', e)
        }

        // 2. Try fetching from backend API
        try {
            const res = await fetch(`http://127.0.0.1:8000/notes/${targetSlug}`)
            if (res.ok) {
                const data = await res.json()
                if (data && data.title) {
                    setNote(data)
                }
            }
        } catch (err) {
            console.warn('Backend single note fetch failed, trying local notes or default note.')
        }

        // 3. Try fetching related notes from backend MongoDB pipeline / vector scoring endpoint
        let serverRelated = []
        try {
            const resRelated = await fetch(`http://127.0.0.1:8000/notes/${targetSlug}/related?limit=24`)
            if (resRelated.ok) {
                const relatedData = await resRelated.json()
                if (Array.isArray(relatedData) && relatedData.length > 0) {
                    serverRelated = relatedData
                }
            }
        } catch (err) {
            console.warn('Backend related notes query failed, fallback to client-side vector ranking.')
        }

        // Also fetch all notes to populate candidate pool
        try {
            const resAll = await fetch('http://127.0.0.1:8000/notes')
            if (resAll.ok) {
                const allData = await resAll.json()
                if (Array.isArray(allData)) {
                    remoteNotes = allData
                }
            }
        } catch (e) {
            // ignore network failure
        }

        // Combine all known notes
        const combinedMap = new Map()
        localNotes.forEach(n => combinedMap.set(n._id || n.slug || titleToSlug(n.title), n))
        remoteNotes.forEach(n => combinedMap.set(n._id || n.slug || titleToSlug(n.title), n))

        const allCombined = Array.from(combinedMap.values())
        setAllNotesCount(allCombined.length)

        // Find the matched note by slug, or by title-slug, or by ID
        const matched = allCombined.find(n => {
            const nSlug = (n.slug || titleToSlug(n.title) || '').toLowerCase()
            return nSlug === targetSlug || n._id === targetSlug
        })

        if (matched) {
            setNote(matched)

            // Compute powerful semantic / keyword relevance ranking in frontend as well
            const clientRanked = calculateRelatedNotes(matched, allCombined, 24)

            // Merge server-scored notes with client-scored notes, prioritizing server pipeline
            const finalRelatedMap = new Map()
            serverRelated.forEach(n => {
                const key = n._id || n.slug || titleToSlug(n.title)
                finalRelatedMap.set(key, n)
            })

            clientRanked.forEach(n => {
                const key = n._id || n.slug || titleToSlug(n.title)
                if (!finalRelatedMap.has(key)) {
                    finalRelatedMap.set(key, n)
                }
            })

            // Exclude current note
            const currentKey = matched._id || matched.slug || titleToSlug(matched.title)
            const finalRelated = Array.from(finalRelatedMap.values()).filter(n => {
                const candidateKey = n._id || n.slug || titleToSlug(n.title)
                return candidateKey !== currentKey
            })

            setRelatedNotes(finalRelated)
        }

        setLoading(false)
    }

    // Pagination calculations for related notes (6 items per page)
    const totalRelatedPages = Math.ceil(relatedNotes.length / RELATED_PER_PAGE)
    const safeRelatedPage = Math.max(1, Math.min(relatedPage, totalRelatedPages || 1))
    const startRelatedIndex = (safeRelatedPage - 1) * RELATED_PER_PAGE
    const paginatedRelatedNotes = relatedNotes.slice(startRelatedIndex, startRelatedIndex + RELATED_PER_PAGE)

    return (
        <div className={`min-h-screen ${dark ? 'bg-black text-white' : 'bg-slate-50 text-gray-900'} pb-20 flex flex-col justify-between transition-colors duration-300 font-sans`}>
            <div>
                <Navbar />

                <main className='max-w-4xl mx-auto w-full px-4 sm:px-6 md:px-8 pt-6 md:pt-10 pb-8 md:pb-14'>
                    {/* Top Navigation Bar */}
                    <div className='flex items-center justify-between gap-4 mb-6 flex-wrap'>
                        <Link
                            to='/notes'
                            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 active:scale-[0.98] cursor-pointer ${
                                dark
                                    ? 'border border-white/20 bg-white/5 text-[#ededf1] hover:bg-white hover:text-black hover:border-white'
                                    : 'border border-gray-300 bg-white text-gray-800 hover:bg-gray-100'
                            }`}
                        >
                            <FiArrowLeft className='text-base' />
                            <span>Back to all Notes</span>
                        </Link>

                        {note && (
                            <div className='flex items-center gap-3 text-xs'>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full uppercase tracking-wider font-bold text-[10px] border-0 border-none shadow-none ${
                                    dark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-700'
                                }`}>
                                    <FiTag /> {note.tag || 'AI/ML'}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    {loading ? (
                        <LoadingSpinner />
                    ) : !note ? (
                        <div className={`flex flex-col items-center justify-center py-20 gap-4 rounded-2xl border-0 border-none shadow-none text-center p-8 ${
                            dark ? 'bg-gray-900/50 text-gray-400' : 'bg-slate-100 text-gray-600'
                        }`}>
                            <div className='w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-3xl text-red-500 mb-2'>
                                📄
                            </div>
                            <h2 className='text-xl font-bold text-gray-900 dark:text-white'>
                                Note not found
                            </h2>
                            <p className='text-sm max-w-md'>
                                We couldn't find a note matching this address: <code className='text-blue-500'>{slug}</code>
                            </p>
                            <Link
                                to='/notes'
                                className='mt-2 inline-flex items-center gap-2 bg-[#ededf1] hover:bg-white text-[#070708] font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-full transition-all duration-200 active:scale-[0.98] shadow-sm'
                            >
                                Browse All Notes
                            </Link>
                        </div>
                    ) : (
                        <div className='flex flex-col gap-12'>
                            {/* Full Featured Note Reader */}
                            <NoteFeatured 
                                note={note} 
                                isLatest={false} 
                                onDelete={() => {
                                    setDeleteError(null)
                                    setDeleteModalOpen(true)
                                }} 
                                onEdit={() => setEditModalOpen(true)}
                            />

                            {/* More Notes Grid Section */}
                            {relatedNotes.length > 0 && (
                                <section className='pt-8 border-0 border-none' id="related-notes-section">
                                    <div className='flex items-center justify-between gap-4 mb-6'>
                                        <div>
                                            <h3 className={`text-xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>
                                                More Deep Dive Notes
                                            </h3>
                                            <p className={`text-xs mt-0.5 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                Related notes and mathematical formulas based on topic & contents
                                            </p>
                                        </div>
                                        <Link
                                            to='/notes'
                                            className='text-xs font-semibold text-blue-500 hover:text-blue-600 hover:underline flex items-center gap-1'
                                        >
                                            View all ({allNotesCount || relatedNotes.length + 1}) →
                                        </Link>
                                    </div>

                                    {/* 3 Column Grid of Note Cards (6 items per page) */}
                                    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5'>
                                        {paginatedRelatedNotes.map(n => (
                                            <NoteGridCard key={n._id || n.slug || n.title} note={n} />
                                        ))}
                                    </div>

                                    {/* Pagination Controls after 6 items */}
                                    {totalRelatedPages > 1 && (
                                        <Pagination
                                            currentPage={safeRelatedPage}
                                            totalPages={totalRelatedPages}
                                            onPageChange={(p) => {
                                                setRelatedPage(p)
                                                const el = document.getElementById('related-notes-section')
                                                if (el) el.scrollIntoView({ behavior: 'smooth' })
                                            }}
                                        />
                                    )}
                                </section>
                            )}
                        </div>
                    )}
                </main>
            </div>

            {/* Delete Note Confirmation Modal */}
            <DeleteNoteModal
                isOpen={deleteModalOpen}
                note={note}
                onClose={() => {
                    setDeleteModalOpen(false)
                    setDeleteError(null)
                }}
                onConfirm={handleConfirmDelete}
                loading={deleting}
                error={deleteError}
            />

            {/* Edit / Update Note Modal */}
            {editModalOpen && note && (
                <AddNote
                    setOpenAdd={setEditModalOpen}
                    noteToEdit={note}
                    onNoteUpdated={(updatedNote) => {
                        setNote(updatedNote)
                        const newSlug = updatedNote.slug || titleToSlug(updatedNote.title)
                        if (newSlug && newSlug !== slug) {
                            navigate(`/notes/${newSlug}`, { replace: true })
                        }
                    }}
                />
            )}
        </div>
    )
}

export default NoteSingle
