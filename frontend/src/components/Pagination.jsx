import React from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { useTheme } from '../context/ThemeContext'

const Pagination = ({ currentPage, totalPages, onPageChange, className = '' }) => {
    const { theme } = useTheme()
    const dark = theme === 'dark'

    if (!totalPages || totalPages <= 1) return null

    // Generate page numbers with smart ellipsis windowing
    const getPageNumbers = () => {
        const pages = []
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            // Always show first page
            pages.push(1)

            if (currentPage > 3) {
                pages.push('...')
            }

            const start = Math.max(2, currentPage - 1)
            const end = Math.min(totalPages - 1, currentPage + 1)

            for (let i = start; i <= end; i++) {
                pages.push(i)
            }

            if (currentPage < totalPages - 2) {
                pages.push('...')
            }

            // Always show last page
            pages.push(totalPages)
        }
        return pages
    }

    const pages = getPageNumbers()

    return (
        <nav
            aria-label="Pagination"
            className={`flex items-center justify-center gap-1.5 sm:gap-2 my-8 select-none ${className}`}
        >
            {/* Previous Arrow Button */}
            <button
                type="button"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                aria-label="Previous page"
                className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.96] ${
                    currentPage <= 1
                        ? 'opacity-30 cursor-not-allowed pointer-events-none'
                        : dark
                            ? 'border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/15 hover:text-white cursor-pointer'
                            : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-xs cursor-pointer'
                }`}
            >
                <FiChevronLeft className="text-base" />
            </button>

            {/* Page Number Buttons */}
            <div className="flex items-center gap-1 sm:gap-1.5">
                {pages.map((item, idx) => {
                    if (item === '...') {
                        return (
                            <span
                                key={`ellipsis-${idx}`}
                                className={`w-8 h-9 sm:w-9 sm:h-10 flex items-center justify-center text-xs sm:text-sm font-semibold ${
                                    dark ? 'text-zinc-500' : 'text-slate-400'
                                }`}
                            >
                                …
                            </span>
                        )
                    }

                    const pageNum = Number(item)
                    const isActive = pageNum === currentPage

                    return (
                        <button
                            key={pageNum}
                            type="button"
                            onClick={() => onPageChange(pageNum)}
                            aria-current={isActive ? 'page' : undefined}
                            aria-label={`Page ${pageNum}`}
                            className={`flex items-center justify-center min-w-9 h-9 sm:min-w-10 sm:h-10 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 active:scale-[0.96] cursor-pointer ${
                                isActive
                                    ? dark
                                        ? 'bg-[#ededf1] text-[#070708] shadow-md border border-white'
                                        : 'bg-slate-900 text-white shadow-sm border border-slate-900'
                                    : dark
                                        ? 'border border-white/10 bg-white/5 text-zinc-400 hover:text-[#ededf1] hover:bg-white/10'
                                        : 'border border-slate-200 bg-white text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                            }`}
                        >
                            {pageNum}
                        </button>
                    )
                })}
            </div>

            {/* Next Arrow Button */}
            <button
                type="button"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                aria-label="Next page"
                className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.96] ${
                    currentPage >= totalPages
                        ? 'opacity-30 cursor-not-allowed pointer-events-none'
                        : dark
                            ? 'border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/15 hover:text-white cursor-pointer'
                            : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-xs cursor-pointer'
                }`}
            >
                <FiChevronRight className="text-base" />
            </button>
        </nav>
    )
}

export default Pagination

