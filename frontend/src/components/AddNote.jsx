import React, { useState } from 'react'
import { useTheme } from '../context/ThemeContext'

const TAG_OPTIONS = ['general', 'ai/ml', 'web', 'python', 'math', 'other']

const AddNote = ({ setOpenAdd, onNoteAdded }) => {
    const { theme } = useTheme()
    const [form, setForm] = useState({ title: '', content: '', tag: 'general' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        // Guard: user must be signed in
        const token = localStorage.getItem('token')
        if (!token) {
            setError('You must be signed in to add a note. Please sign in first.')
            return
        }

        setLoading(true)
        try {
            const res = await fetch('http://127.0.0.1:8000/note/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(form)
            })
            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.detail || 'Failed to create note')
            }
            onNoteAdded && onNoteAdded()
            setOpenAdd(false)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const overlay = 'fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4'
    const card = `w-full max-w-2xl rounded-2xl border shadow-2xl p-6 sm:p-8 flex flex-col gap-5 ${
        theme === 'dark' ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'
    }`
    const input = `w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition ${
        theme === 'dark'
            ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
            : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
    }`

    return (
        <div className={overlay} onClick={() => setOpenAdd(false)}>
            <div className={card} onClick={e => e.stopPropagation()}>
                <div className='flex justify-between items-center'>
                    <h2 className='text-xl font-bold'>📝 Add New Note</h2>
                    <button
                        type='button'
                        onClick={() => setOpenAdd(false)}
                        className={`text-2xl leading-none font-light hover:text-red-400 transition-colors ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
                    >×</button>
                </div>

                {error && (
                    <p className='text-red-400 text-sm bg-red-900/20 border border-red-700/40 rounded-lg px-3 py-2'>{error}</p>
                )}

                <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                    <div className='flex flex-col gap-1'>
                        <label className={`text-xs font-semibold uppercase tracking-wide ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Title</label>
                        <input
                            className={input}
                            name='title'
                            placeholder='What did you learn?'
                            value={form.title}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className='flex flex-col gap-1'>
                        <label className={`text-xs font-semibold uppercase tracking-wide ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Tag</label>
                        <select
                            className={input}
                            name='tag'
                            value={form.tag}
                            onChange={handleChange}
                        >
                            {TAG_OPTIONS.map(t => (
                                <option key={t} value={t}>{t.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>

                    <div className='flex flex-col gap-1'>
                        <label className={`text-xs font-semibold uppercase tracking-wide ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Content</label>
                        <textarea
                            className={`${input} min-h-[180px] resize-y`}
                            name='content'
                            placeholder='Write your notes here...'
                            value={form.content}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className='flex gap-3 justify-end pt-2'>
                        <button
                            type='button'
                            onClick={() => setOpenAdd(false)}
                            className={`px-5 py-2 rounded-xl text-sm font-medium border transition-all ${
                                theme === 'dark' ? 'border-gray-600 text-gray-400 hover:bg-gray-800' : 'border-gray-300 text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            Cancel
                        </button>
                        <button
                            type='submit'
                            disabled={loading}
                            className='px-6 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all disabled:opacity-60 shadow-md'
                        >
                            {loading ? 'Saving...' : 'Save Note'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddNote
