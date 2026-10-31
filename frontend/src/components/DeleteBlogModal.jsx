import React from 'react'
import { useTheme } from '../context/ThemeContext'
import { FiTrash2, FiAlertTriangle, FiX } from 'react-icons/fi'

const DeleteBlogModal = ({ isOpen, blog, onClose, onConfirm, loading, error }) => {
    const { theme } = useTheme()
    const dark = theme === 'dark'

    if (!isOpen || !blog) return null

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm transition-opacity"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-blog-modal-title"
        >
            <div 
                className={`w-full max-w-md rounded-2xl p-6 shadow-2xl flex flex-col gap-5 border transition-all animate-fadeIn ${
                    dark 
                        ? 'bg-[#0f1015] border-zinc-800 text-white' 
                        : 'bg-white border-gray-200 text-gray-900'
                }`}
            >
                {/* Header with Icon and Close Button */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-500/15 text-red-500 flex-shrink-0">
                            <FiAlertTriangle className="text-xl" />
                        </div>
                        <div>
                            <h3 id="delete-blog-modal-title" className="text-lg font-bold">
                                Delete Article
                            </h3>
                            <p className={`text-xs ${dark ? 'text-zinc-400' : 'text-gray-500'}`}>
                                This action is permanent and cannot be undone.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className={`p-1.5 rounded-full transition cursor-pointer ${
                            dark 
                                ? 'text-zinc-400 hover:text-white hover:bg-white/10' 
                                : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                        aria-label="Close"
                    >
                        <FiX className="text-lg" />
                    </button>
                </div>

                {/* Body Content */}
                <div className={`p-3.5 rounded-xl text-xs sm:text-sm ${
                    dark ? 'bg-black/60 border border-zinc-800/80' : 'bg-gray-50 border border-gray-200'
                }`}>
                    <p className={`font-semibold mb-1 line-clamp-2 ${dark ? 'text-white' : 'text-gray-900'}`}>
                        "{blog.title}"
                    </p>
                    <p className={`text-xs ${dark ? 'text-zinc-400' : 'text-gray-500'}`}>
                        The article and its cover media will be permanently removed from Samir Builds.
                    </p>
                </div>

                {/* Inline Error Notice */}
                {error && (
                    <div className={`p-3 rounded-xl text-xs flex items-center justify-between gap-2 border animate-fadeIn ${
                        dark ? 'bg-red-500/10 border-red-500/30 text-red-300' : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                        <div className="flex items-center gap-2">
                            <FiAlertTriangle className="text-red-400 flex-shrink-0 text-sm" />
                            <span>{error}</span>
                        </div>
                        {error.toLowerCase().includes('sign in') && (
                            <a
                                href="/signin"
                                className="underline font-semibold ml-2 hover:opacity-80 flex-shrink-0"
                            >
                                Sign In
                            </a>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className={`px-4 py-2 rounded-full text-xs font-semibold transition active:scale-[0.98] cursor-pointer border ${
                            dark 
                                ? 'border-zinc-700 bg-white/5 hover:bg-white/10 text-zinc-300' 
                                : 'border-gray-300 bg-white hover:bg-gray-100 text-gray-700'
                        }`}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition active:scale-[0.98] cursor-pointer shadow-md disabled:opacity-50"
                    >
                        {loading ? (
                            <span>Deleting...</span>
                        ) : (
                            <>
                                <FiTrash2 className="text-sm" />
                                <span>Delete Article</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default DeleteBlogModal
