/**
 * Authentication and Note Ownership Helpers
 */

export const getAuthToken = () => {
    return localStorage.getItem('token') || null
}

export const getCurrentUser = () => {
    try {
        const raw = localStorage.getItem('user')
        if (raw) return JSON.parse(raw)
    } catch {
        return null
    }
    return null
}

export const getUserIdFromToken = () => {
    const token = getAuthToken()
    if (!token) return null
    try {
        const parts = token.split('.')
        if (parts.length !== 3) return null
        const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
        const decodedJson = decodeURIComponent(
            atob(payloadBase64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        )
        const payload = JSON.parse(decodedJson)
        return payload.sub || null
    } catch (e) {
        return null
    }
}

export const getCurrentUserId = () => {
    const user = getCurrentUser()
    if (user && (user._id || user.id)) {
        return String(user._id || user.id)
    }
    const tokenUserId = getUserIdFromToken()
    return tokenUserId ? String(tokenUserId) : null
}

/**
 * Checks whether the currently logged-in user is the author of the note.
 * Only returns true if a user is signed in AND their user ID matches note.author.
 */
export const isNoteAuthor = (note) => {
    if (!note) return false
    const currentUserId = getCurrentUserId()
    if (!currentUserId) return false

    // System sample note has no author or is 'system'
    if (!note.author || note.author === 'system') return false

    const noteAuthor = typeof note.author === 'object'
        ? (note.author?._id || note.author?.id)
        : note.author

    if (!noteAuthor) return false

    return String(noteAuthor) === String(currentUserId)
}

/**
 * Deletes a note by its ID or slug using the server API and local storage.
 */
export const deleteNoteApi = async (note) => {
    const token = getAuthToken()
    if (!token) {
        throw new Error('Please sign in to delete this note.')
    }

    const noteId = note?._id || note?.slug || (typeof note === 'string' ? note : null)
    if (!noteId) {
        throw new Error('Invalid note identifier.')
    }

    let serverSuccess = false
    let serverError = null

    // 1. Try server DELETE API
    try {
        const res = await fetch(`http://127.0.0.1:8000/note/delete/${noteId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        if (res.ok) {
            serverSuccess = true
        } else if (res.status === 403 || res.status === 401) {
            const data = await res.json().catch(() => ({}))
            throw new Error(data.detail || 'Not authorized: only the author who uploaded this note can delete it.')
        } else if (res.status === 404) {
            // Might be a locally-only saved note
            serverError = 'Note not found on server (may be stored locally).'
        } else {
            const data = await res.json().catch(() => ({}))
            serverError = data.detail || 'Server delete failed'
        }
    } catch (err) {
        if (err.message && err.message.includes('Not authorized')) {
            throw err
        }
        serverError = err.message
    }

    // 2. Remove from local browser cache if present
    try {
        const rawLocal = localStorage.getItem('samirbuilds_notes')
        if (rawLocal) {
            const localNotes = JSON.parse(rawLocal)
            const filtered = localNotes.filter(n => {
                const matchId = (n._id && n._id === note._id) || (n.slug && (n.slug === note.slug || n.slug === noteId)) || (n.title && n.title === note.title)
                return !matchId
            })
            localStorage.setItem('samirbuilds_notes', JSON.stringify(filtered))
        }
    } catch (e) {
        console.warn('Could not update local notes storage:', e)
    }

    if (!serverSuccess && serverError && !serverError.includes('not found')) {
        throw new Error(serverError)
    }

    return { success: true, message: 'Note deleted successfully.' }
}
