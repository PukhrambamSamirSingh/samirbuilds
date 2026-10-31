/**
 * Authentication and Note/Blog Ownership Helpers
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

export const parseJwtPayload = (token = getAuthToken()) => {
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
        return JSON.parse(decodedJson)
    } catch {
        return null
    }
}

export const getUserIdFromToken = () => {
    const payload = parseJwtPayload()
    return payload?.sub || null
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
 * Checks whether the token has passed its expiration time plus grace period.
 */
export const isTokenExpired = (token = getAuthToken()) => {
    if (!token) return true
    const payload = parseJwtPayload(token)
    if (!payload || !payload.exp) return false
    // 30 days grace window matches backend
    const graceExpMs = (payload.exp + (30 * 86400)) * 1000
    return Date.now() >= graceExpMs
}

/**
 * Checks whether the currently logged-in user is the author of the note.
 * Only returns true if a user is signed in AND their user ID matches note.author.
 */
export const isNoteAuthor = (note) => {
    if (!note) return false
    const currentUserId = getCurrentUserId()
    const currentUser = getCurrentUser()
    if (!currentUserId && !currentUser) return false

    // System sample note has no author or is 'system'
    if (!note.author || note.author === 'system') return false

    const noteAuthor = typeof note.author === 'object'
        ? (note.author?._id || note.author?.id)
        : note.author

    if (!noteAuthor) return false

    if (currentUserId && String(noteAuthor) === String(currentUserId)) {
        return true
    }
    if (currentUser && currentUser.email && String(noteAuthor).toLowerCase() === String(currentUser.email).toLowerCase()) {
        return true
    }

    return false
}

/**
 * Deletes a note by its ID or slug using the server API and local storage.
 * Gracefully handles expired sessions, local fallbacks, and server sync.
 */
export const deleteNoteApi = async (note) => {
    const token = getAuthToken() || getAdminToken() || getAdminSecret()
    const noteId = note?._id || note?.slug || (typeof note === 'string' ? note : null)
    if (!noteId) {
        throw new Error('Invalid note identifier.')
    }

    // 1. Always purge from local storage cache first
    let removedLocally = false
    try {
        const rawLocal = localStorage.getItem('samirbuilds_notes')
        if (rawLocal) {
            const localNotes = JSON.parse(rawLocal)
            const prevLen = localNotes.length
            const filtered = localNotes.filter(n => {
                const matchId = (n._id && (n._id === note._id || n._id === noteId)) ||
                                (n.slug && (n.slug === note.slug || n.slug === noteId)) ||
                                (n.title && n.title === note.title)
                return !matchId
            })
            if (filtered.length !== prevLen) {
                removedLocally = true
                localStorage.setItem('samirbuilds_notes', JSON.stringify(filtered))
            }
        }
    } catch (e) {
        console.warn('Could not update local notes storage:', e)
    }

    // If no token exists at all
    if (!token) {
        if (removedLocally) {
            return { success: true, message: 'Note deleted from local workspace.' }
        }
        throw new Error('Please sign in or enter admin secret to delete this note.')
    }

    let serverSuccess = false
    let serverError = null

    // 2. Attempt backend server delete
    try {
        const res = await fetch(`http://127.0.0.1:8000/note/delete/${encodeURIComponent(noteId)}`, {
            method: 'DELETE',
            headers: getAdminHeaders()
        })

        if (res.ok) {
            serverSuccess = true
        } else if (res.status === 404) {
            // Note did not exist on server (may have been local-only)
            serverSuccess = true
        } else if (res.status === 401) {
            const data = await res.json().catch(() => ({}))
            const detail = String(data.detail || '')
            if (removedLocally) {
                return { success: true, message: 'Note deleted locally.' }
            }
            if (detail.toLowerCase().includes('token expired') || detail.toLowerCase().includes('expired')) {
                serverError = 'Your session has expired. Please sign in again.'
            } else {
                serverError = 'Session error. Please sign in again.'
            }
        } else if (res.status === 403) {
            const data = await res.json().catch(() => ({}))
            serverError = data.detail || 'Not authorized: only the author who uploaded this note can delete it.'
        } else {
            const data = await res.json().catch(() => ({}))
            serverError = data.detail || 'Server delete failed.'
        }
    } catch (err) {
        // Network failure (server offline, etc.)
        if (removedLocally) {
            return { success: true, message: 'Note deleted from local workspace.' }
        }
        serverError = err.message || 'Could not reach server to delete note.'
    }

    if (!serverSuccess && serverError) {
        throw new Error(serverError)
    }

    return { success: true, message: 'Note deleted successfully.' }
}

/**
 * Checks whether the currently logged-in user is the author of the blog article.
 */
export const isBlogAuthor = (blog) => {
    if (!blog) return false
    const currentUserId = getCurrentUserId()
    const currentUser = getCurrentUser()
    if (!currentUserId && !currentUser) return false

    if (!blog.author || blog.author === 'system') return false

    const blogAuthor = typeof blog.author === 'object'
        ? (blog.author?._id || blog.author?.id || blog.author?.email)
        : blog.author

    if (!blogAuthor) return false

    if (currentUserId && String(blogAuthor) === String(currentUserId)) {
        return true
    }
    if (currentUser && currentUser.email && String(blogAuthor).toLowerCase() === String(currentUser.email).toLowerCase()) {
        return true
    }

    const fullName = `${currentUser?.first_name || ''} ${currentUser?.last_name || ''}`.trim().toLowerCase()
    if (fullName && String(blogAuthor).toLowerCase() === fullName) {
        return true
    }

    return false
}

/**
 * Deletes a blog by its ID or slug using the server API and local storage.
 * Gracefully handles expired sessions, local fallbacks, and server sync.
 */
export const deleteBlogApi = async (blog) => {
    const token = getAuthToken() || getAdminToken() || getAdminSecret()
    const blogId = blog?._id || blog?.slug || (typeof blog === 'string' ? blog : null)
    if (!blogId) {
        throw new Error('Invalid blog identifier.')
    }

    // 1. Always purge from local storage cache first
    let removedLocally = false
    try {
        const rawLocal = localStorage.getItem('samirbuilds_blogs')
        if (rawLocal) {
            const localBlogs = JSON.parse(rawLocal)
            const prevLen = localBlogs.length
            const filtered = localBlogs.filter(b => {
                const matchId = (b._id && (b._id === blog._id || b._id === blogId)) ||
                                (b.slug && (b.slug === blog.slug || b.slug === blogId)) ||
                                (b.title && b.title === blog.title)
                return !matchId
            })
            if (filtered.length !== prevLen) {
                removedLocally = true
                localStorage.setItem('samirbuilds_blogs', JSON.stringify(filtered))
            }
        }
    } catch (e) {
        console.warn('Could not update local blogs storage:', e)
    }

    if (!token) {
        if (removedLocally) {
            return { success: true, message: 'Article deleted from local workspace.' }
        }
        throw new Error('Please sign in or enter admin secret to delete this article.')
    }

    let serverSuccess = false
    let serverError = null

    // 2. Attempt backend server delete
    try {
        const res = await fetch(`http://127.0.0.1:8000/blog/delete/${encodeURIComponent(blogId)}`, {
            method: 'DELETE',
            headers: getAdminHeaders()
        })

        if (res.ok) {
            serverSuccess = true
        } else if (res.status === 404) {
            serverSuccess = true
        } else if (res.status === 401) {
            const data = await res.json().catch(() => ({}))
            const detail = String(data.detail || '')
            if (removedLocally) {
                return { success: true, message: 'Article deleted locally.' }
            }
            if (detail.toLowerCase().includes('token expired') || detail.toLowerCase().includes('expired')) {
                serverError = 'Your session has expired. Please sign in again.'
            } else {
                serverError = 'Session error. Please sign in again.'
            }
        } else if (res.status === 403) {
            const data = await res.json().catch(() => ({}))
            serverError = data.detail || 'Not authorized: only the author who published this article can delete it.'
        } else {
            const data = await res.json().catch(() => ({}))
            serverError = data.detail || 'Server delete failed.'
        }
    } catch (err) {
        if (removedLocally) {
            return { success: true, message: 'Article deleted from local workspace.' }
        }
        serverError = err.message || 'Could not reach server to delete article.'
    }

    if (!serverSuccess && serverError) {
        throw new Error(serverError)
    }

    return { success: true, message: 'Article deleted successfully.' }
}

// ── Admin Security & Master Passkey Helpers ──

export const getAdminSecret = () => {
    return localStorage.getItem('samirbuilds_admin_secret') || ''
}

export const setAdminSecret = (secret) => {
    if (secret) {
        localStorage.setItem('samirbuilds_admin_secret', secret.trim())
    } else {
        localStorage.removeItem('samirbuilds_admin_secret')
    }
}

export const removeAdminSecret = () => {
    localStorage.removeItem('samirbuilds_admin_secret')
}

export const getAdminToken = () => {
    return localStorage.getItem('samirbuilds_admin_token') || getAuthToken()
}

export const setAdminToken = (token) => {
    if (token) {
        localStorage.setItem('samirbuilds_admin_token', token)
    } else {
        localStorage.removeItem('samirbuilds_admin_token')
    }
}

export const removeAdminToken = () => {
    localStorage.removeItem('samirbuilds_admin_token')
}

export const isAdminAuthenticated = () => {
    const adminSecret = getAdminSecret()
    if (adminSecret) return true

    const token = getAdminToken()
    if (!token) return false

    const payload = parseJwtPayload(token)
    if (!payload) return false

    if (payload.role === 'admin' || payload.is_admin === true) {
        return true
    }

    const currentUser = getCurrentUser()
    if (currentUser?.role === 'admin' || currentUser?.is_admin === true) {
        return true
    }

    return false
}

export const getAdminHeaders = (extraHeaders = {}) => {
    const headers = {
        'Content-Type': 'application/json',
        ...extraHeaders
    }
    const token = getAdminToken()
    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }
    const secret = getAdminSecret()
    if (secret) {
        headers['X-Admin-Secret'] = secret
    }
    return headers
}

export const adminLoginApi = async ({ email, password, secret_key }) => {
    const res = await fetch('http://127.0.0.1:8000/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, secret_key })
    })

    const data = await res.json()
    if (!res.ok) {
        throw new Error(data.detail || 'Admin login failed.')
    }

    if (data.access_token) {
        setAdminToken(data.access_token)
    }
    if (secret_key) {
        setAdminSecret(secret_key)
    }
    return data
}

export const verifyAdminSecretApi = async (secret_key) => {
    const res = await fetch('http://127.0.0.1:8000/admin/verify-secret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret_key })
    })

    const data = await res.json()
    if (!res.ok) {
        throw new Error(data.detail || 'Invalid admin secret key.')
    }

    if (data.access_token) {
        setAdminToken(data.access_token)
    }
    setAdminSecret(secret_key)
    return data
}

export const getAdminSettingsApi = async () => {
    const res = await fetch('http://127.0.0.1:8000/admin/settings', {
        headers: getAdminHeaders()
    })
    const data = await res.json()
    if (!res.ok) {
        throw new Error(data.detail || 'Failed to load admin settings.')
    }
    return data
}

export const updateAdminSecretKeyApi = async (current_secret_key, new_secret_key) => {
    const res = await fetch('http://127.0.0.1:8000/admin/settings/secret-key', {
        method: 'PUT',
        headers: getAdminHeaders(),
        body: JSON.stringify({ current_secret_key, new_secret_key })
    })
    const data = await res.json()
    if (!res.ok) {
        throw new Error(data.detail || 'Failed to update admin secret key.')
    }
    setAdminSecret(new_secret_key)
    return data
}

export const getAdminStatsApi = async () => {
    const res = await fetch('http://127.0.0.1:8000/admin/stats', {
        headers: getAdminHeaders()
    })
    const data = await res.json()
    if (!res.ok) {
        throw new Error(data.detail || 'Failed to load admin statistics.')
    }
    return data
}
