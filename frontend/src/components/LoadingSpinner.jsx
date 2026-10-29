import React from 'react'
import { useTheme } from '../context/ThemeContext'

/**
 * Universal Loading Spinner:
 * - Only keeps the loading icon (no text).
 * - Not blue: uses the reverse of the theme color
 *   (white in dark mode, black in light mode).
 */
export default function LoadingSpinner({ className = 'py-28 sm:py-36' }) {
    const { theme } = useTheme()
    const dark = theme === 'dark'

    return (
        <div className={`flex items-center justify-center w-full ${className}`}>
            <div
                className={`w-10 h-10 border-[3.5px] rounded-full animate-spin border-t-transparent transition-colors duration-200 ${
                    dark ? 'border-white' : 'border-black'
                }`}
                role="status"
                aria-label="Loading"
            />
        </div>
    )
}
