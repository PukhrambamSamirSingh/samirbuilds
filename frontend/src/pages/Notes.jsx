import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { NoteFeatured, NoteSidebarCard } from '../components/NoteCard'
import AddNote from '../components/AddNote'
import { useTheme } from '../context/ThemeContext'

const Notes = () => {
    const [notes, setNotes] = useState([])
    const [loading, setLoading] = useState(true)
    const [openAdd, setOpenAdd] = useState(false)
    const { theme } = useTheme()
    const dark = theme === 'dark'

    const fetchNotes = async () => {
        try {
            const res = await fetch('http://127.0.0.1:8000/notes')
            if (res.ok) {
                const data = await res.json()
                setNotes(data)
            } else {
                setNotes([])
            }
        } catch (err) {
            console.error(err)
            setNotes([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchNotes()
    }, [])

    const latestNote = notes[0] || null
    const olderNotes = notes.slice(1)

    return (
        <div className={`min-h-screen ${dark ? 'bg-gray-800 text-white' : 'bg-slate-100 text-gray-900'} pb-12 flex flex-col justify-between transition-colors duration-300`}>
            <div>
                <Navbar />
                <main className='max-w-7xl mx-auto px-4 sm:px-8 md:px-12 lg:px-20 py-6'>

                    {/* ── Page heading ── */}
                    <div className={`flex items-center justify-between border-b ${dark ? 'border-gray-700' : 'border-gray-300'} pb-4 mb-8`}>
                        <h1 className={`text-3xl sm:text-4xl font-extrabold ${dark ? 'text-white' : 'text-gray-900'}`}>
                            Learning Notes
                        </h1>
                        <button
                            type='button'
                            onClick={() => setOpenAdd(true)}
                            className='px-5 py-2 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md cursor-pointer flex items-center gap-2'
                        >
                            <span className='text-base leading-none'>+</span> New Note
                        </button>
                    </div>

                    {/* ── Loading ── */}
                    {loading ? (
                        <div className={`flex flex-col items-center justify-center py-24 gap-3 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                            <svg className='animate-spin h-8 w-8 text-blue-500' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                                <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'/>
                                <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v8z'/>
                            </svg>
                            <span className='text-sm'>Loading notes...</span>
                        </div>

                    /* ── Empty state ── */
                    ) : notes.length === 0 ? (
                        <div className={`flex flex-col items-center justify-center py-24 gap-5 rounded-2xl border ${
                            dark ? 'bg-gray-900/40 border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-500'
                        }`}>
                            <span className='text-6xl select-none'>📭</span>
                            <div className='text-center'>
                                <p className='text-lg font-semibold'>No notes yet</p>
                                <p className={`text-sm mt-1 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Start capturing what you learn every day.</p>
                            </div>
                            <button
                                type='button'
                                onClick={() => setOpenAdd(true)}
                                className='px-6 py-2.5 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all shadow cursor-pointer'
                            >
                                + Add your first note
                            </button>
                        </div>

                    /* ── Notes grid ── */
                    ) : (
                        <div className='flex flex-col lg:flex-row gap-8 items-start relative'>

                            {/* Featured / Latest Note */}
                            <div className='w-full lg:w-2/3'>
                                <NoteFeatured note={latestNote} onNoteAdded={fetchNotes} />
                            </div>

                            {/* Sidebar – older notes */}
                            {olderNotes.length > 0 && (
                                <aside className='w-full lg:w-1/3 flex flex-col gap-4 lg:sticky lg:top-8 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto pr-1 scrollbar-none'>
                                    <h3 className={`text-sm font-bold uppercase tracking-widest border-b pb-2 hidden lg:block ${
                                        dark ? 'text-gray-400 border-gray-700' : 'text-gray-500 border-gray-300'
                                    }`}>
                                        Previous Notes
                                    </h3>
                                    {olderNotes.map(note => (
                                        <NoteSidebarCard key={note._id} note={note} />
                                    ))}
                                </aside>
                            )}
                        </div>
                    )}
                </main>
            </div>

            {openAdd && (
                <AddNote
                    setOpenAdd={setOpenAdd}
                    onNoteAdded={() => { fetchNotes(); setOpenAdd(false) }}
                />
            )}
        </div>
    )
}

export default Notes
