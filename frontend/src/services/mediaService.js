/**
 * Cloudinary Media Upload Service (Via Secure Backend)
 * 
 * IMPORTANT: Cloudinary API secret and API key reside exclusively on the backend.
 * All uploads stream through the FastAPI backend proxy to prevent exposing credentials to the browser.
 */

const getApiBase = () => {
    return window.location.hostname === 'localhost' ? 'http://localhost:8000' : 'http://127.0.0.1:8000'
}

/**
 * Upload an image or video file with real-time progress tracking
 * @param {File} file 
 * @param {Object} options - { resourceType: 'image' | 'video' | 'auto', onProgress: (pct) => void }
 * @returns {Promise<{ url: string, resource_type: string, format: string, duration?: number }>}
 */
export const uploadMediaFile = (file, { resourceType = 'auto', onProgress = null } = {}) => {
    return new Promise((resolve, reject) => {
        if (!file) {
            return reject(new Error('No file provided for upload'))
        }

        const isVideo = file.type?.startsWith('video/') || resourceType === 'video'
        const maxLimitBytes = isVideo ? 100 * 1024 * 1024 : 25 * 1024 * 1024

        if (file.size > maxLimitBytes) {
            const limitMb = isVideo ? '100MB' : '25MB'
            return reject(new Error(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds ${limitMb} limit.`))
        }

        const formData = new FormData()
        formData.append('file', file)
        if (resourceType && resourceType !== 'auto') {
            formData.append('resource_type', resourceType)
        } else if (isVideo) {
            formData.append('resource_type', 'video')
        }

        const xhr = new XMLHttpRequest()
        xhr.open('POST', `${getApiBase()}/upload/file`)

        if (onProgress && xhr.upload) {
            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = Math.round((event.loaded / event.total) * 100)
                    onProgress(percentComplete)
                }
            }
        }

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const data = JSON.parse(xhr.responseText)
                    if (data && data.url) {
                        resolve(data)
                    } else {
                        reject(new Error(data?.detail || 'Upload completed but no URL was returned.'))
                    }
                } catch (parseErr) {
                    reject(new Error('Invalid response from upload server.'))
                }
            } else {
                try {
                    const errData = JSON.parse(xhr.responseText)
                    reject(new Error(errData?.detail || `Upload failed with HTTP ${xhr.status}`))
                } catch {
                    reject(new Error(`Upload failed with HTTP ${xhr.status}`))
                }
            }
        }

        xhr.onerror = () => {
            reject(new Error('Network error during media upload. Please verify the backend server is running.'))
        }

        xhr.send(formData)
    })
}

/**
 * Upload base64 encoded media (e.g. from clipboard screenshots)
 */
export const uploadMediaBase64 = async (base64Data, filename = 'pasted-media', resourceType = 'auto') => {
    const apiBase = getApiBase()
    const res = await fetch(`${apiBase}/upload/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            file: base64Data,
            filename,
            resource_type: resourceType
        })
    })

    const data = await res.json()
    if (!res.ok) {
        throw new Error(data?.detail || `Upload failed with HTTP ${res.status}`)
    }
    return data
}
