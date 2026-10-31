import React, { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { CiSearch } from 'react-icons/ci'
import { MdMenu, MdClose } from 'react-icons/md'
import { FiSun, FiMoon, FiLogOut, FiUser, FiShield } from 'react-icons/fi'
import { isAdminAuthenticated } from '../utils/authUtils'
import { useTheme } from '../context/ThemeContext'
import Search from './Search'
import logo from '../assets/samir_builds_logo.png'

const Navbar = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [toggleSearch, setToggleSearch] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [user, setUser] = useState(null)
    const [isAdmin, setIsAdmin] = useState(isAdminAuthenticated())
    const { theme, toggleTheme } = useTheme()
    const isDark = theme === 'dark'
    const navigate = useNavigate()

    const syncAuth = () => {
        setIsAdmin(isAdminAuthenticated())
        const token = localStorage.getItem('token')
        if (token) {
            try {
                const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
                setUser(storedUser)
            } catch {
                setUser({ email: 'Logged in' })
            }
        } else {
            setUser(null)
        }
    }

    useEffect(() => {
        syncAuth()
        window.addEventListener('storage', syncAuth)
        window.addEventListener('authChange', syncAuth)
        return () => {
            window.removeEventListener('storage', syncAuth)
            window.removeEventListener('authChange', syncAuth)
        }
    }, [])

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10)
        }
        handleScroll()
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden'
            const handleKeyDown = (e) => {
                if (e.key === 'Escape') setMobileMenuOpen(false)
            }
            window.addEventListener('keydown', handleKeyDown)
            return () => {
                document.body.style.overflow = ''
                window.removeEventListener('keydown', handleKeyDown)
            }
        } else {
            document.body.style.overflow = ''
        }
    }, [mobileMenuOpen])

    const handleSignOut = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
        window.dispatchEvent(new Event('authChange'))
        navigate('/signin')
    }

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
        { name: 'Experience', path: '/experience' },
        { name: 'Blogs', path: '/blogs' },
        { name: 'Notes', path: '/notes' },
        { name: 'Projects', path: '/projects' },
    ]

    return (
        <>
            <header className={`sticky top-0 z-50 w-full py-4 sm:py-5 md:py-6 transition-colors duration-200 border-0 border-none ${
                isDark
                    ? scrolled ? 'bg-black/95 text-white backdrop-blur-md shadow-md' : 'bg-black/90 text-white backdrop-blur-md'
                    : scrolled ? 'bg-white/95 text-slate-900 backdrop-blur-md shadow-xs' : 'bg-white/90 text-slate-900 backdrop-blur-md'
            }`}>
                <nav className="mx-auto flex max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
                    {/* Left: Brand */}
                    <Link to="/" className="flex items-center group select-none py-1" aria-label="Samir Builds Home">
                        <img
                            src={logo}
                            alt="Samir Builds Logo"
                            className={`h-8 sm:h-9 md:h-10 w-auto object-contain group-hover:opacity-90 transition-opacity ${
                                isDark ? 'brightness-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.18)]' : ''
                            }`}
                        />
                    </Link>

                    {/* Center: Normal Format Navigation Links */}
                    <div className="hidden md:flex items-center gap-7 lg:gap-9">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.name}
                                to={link.path}
                                className={({ isActive }) =>
                                    `text-base lg:text-[17px] font-semibold transition-colors duration-150 py-1 tracking-[-0.01em] ${
                                        isActive
                                            ? isDark
                                                ? 'text-white border-b-2 border-white'
                                                : 'text-blue-600 border-b-2 border-blue-600'
                                            : isDark
                                                ? 'text-zinc-400 hover:text-white'
                                                : 'text-slate-600 hover:text-slate-950'
                                    }`
                                }
                            >
                                {link.name}
                            </NavLink>
                        ))}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 sm:gap-2.5">
                        {/* Theme Toggle Button */}
                        <button
                            type="button"
                            onClick={toggleTheme}
                            className={`p-2 rounded-full transition-all cursor-pointer flex items-center justify-center border-0 border-none outline-none ${
                                isDark
                                    ? 'hover:bg-white/10 text-zinc-300 hover:text-white'
                                    : 'hover:bg-slate-200/80 text-slate-600 hover:text-slate-900'
                            }`}
                            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? (
                                <FiSun className="text-xl sm:text-[22px] text-yellow-400" />
                            ) : (
                                <FiMoon className="text-xl sm:text-[22px] text-blue-400" />
                            )}
                        </button>

                        {isAdmin && (
                            <Link
                                to="/admin"
                                className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-semibold transition ${
                                    isDark 
                                        ? 'border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20' 
                                        : 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
                                }`}
                                title="Admin Console"
                            >
                                <FiShield className="text-xs" />
                                <span>Admin</span>
                            </Link>
                        )}

                        {/* Authentication Buttons (Desktop) */}
                        {user && (
                            <div className="hidden md:flex items-center gap-2">
                                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs ${
                                    isDark ? 'border-white/10 bg-white/5 text-zinc-200' : 'border-slate-200 bg-slate-100 text-slate-700'
                                }`}>
                                    <FiUser className="text-blue-400" />
                                    <span className="font-medium max-w-[100px] truncate">
                                        {user.first_name || user.email?.split('@')[0] || 'User'}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleSignOut}
                                    className="p-2 rounded-md border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all cursor-pointer flex items-center justify-center"
                                    title="Sign Out"
                                >
                                    <FiLogOut className="text-sm" />
                                </button>
                            </div>
                        )}

                        {/* Mobile Hamburger Button */}
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className={`md:hidden p-2 rounded-md border transition-colors focus:outline-none ${
                                isDark
                                    ? 'border-white/10 bg-white/5 text-white hover:bg-white/10'
                                    : 'border-slate-200 bg-slate-100 text-slate-900 hover:bg-slate-200'
                            }`}
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <MdClose className="text-xl" /> : <MdMenu className="text-xl" />}
                        </button>
                    </div>
                {isAdmin && (
                                <NavLink
                                    to="/admin"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center gap-2 px-4 py-3 rounded-md text-lg font-semibold transition-all duration-200 ${
                                            isActive
                                                ? isDark ? 'bg-white text-black font-semibold shadow-sm' : 'bg-slate-900 text-white font-semibold shadow-sm'
                                                : isDark ? 'text-blue-400 hover:text-white hover:bg-white/5' : 'text-blue-600 hover:text-slate-950 hover:bg-slate-100'
                                        }`
                                    }
                                >
                                    <FiShield />
                                    <span>Admin Console</span>
                                </NavLink>
                            )}
                        </nav>
            </header>

            {/* Left-Side Mobile Navigation Drawer (Placed OUTSIDE header so backdrop-filter does NOT trap fixed positioning) */}
            {mobileMenuOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className={`md:hidden fixed inset-0 z-[99] backdrop-blur-sm transition-opacity ${
                            isDark ? 'bg-black/70' : 'bg-black/40'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                        aria-hidden="true"
                    />

                    {/* Drawer Panel Sliding in from Left */}
                    <aside
                        className={`md:hidden fixed inset-y-0 left-0 z-[100] w-72 max-w-[85vw] h-screen shadow-2xl flex flex-col p-6 animate-slideInLeft overflow-y-auto transition-colors duration-200 ${
                            isDark
                                ? 'bg-[#000000] border-r border-zinc-800 text-[#ededf1]'
                                : 'bg-white border-r border-slate-200 text-slate-900'
                        }`}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Mobile Navigation"
                    >
                        {/* Drawer Header: Logo + Close Button */}
                        <div className={`flex items-center justify-between pb-4 border-b ${
                            isDark ? 'border-zinc-900' : 'border-slate-200'
                        }`}>
                            <Link
                                to="/"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center select-none"
                            >
                                <img
                                    src={logo}
                                    alt="Samir Builds Logo"
                                    className={`h-8 w-auto object-contain ${
                                        isDark ? 'brightness-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.18)]' : ''
                                    }`}
                                />
                            </Link>
                            <button
                                type="button"
                                onClick={() => setMobileMenuOpen(false)}
                                className={`p-2 rounded-md border transition cursor-pointer ${
                                    isDark
                                        ? 'border-white/10 bg-white/5 hover:bg-white/15 text-[#ededf1]'
                                        : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-800'
                                }`}
                                aria-label="Close menu"
                            >
                                <MdClose className="text-xl" />
                            </button>
                        </div>

                        {/* Navigation Links: Home, About, Blogs, Notes, Projects */}
                        <nav className="flex flex-col gap-2 flex-1">
                            {navLinks.map((link) => (
                                <NavLink
                                    key={link.name}
                                    to={link.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center px-4 py-3 rounded-md text-base font-medium transition-all duration-200 ${
                                            isActive
                                                ? isDark
                                                    ? 'bg-white text-black font-semibold shadow-sm'
                                                    : 'bg-slate-900 text-white font-semibold shadow-sm'
                                                : isDark
                                                    ? 'text-[#8e8e96] hover:text-white hover:bg-white/5'
                                                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                                        }`
                                    }
                                >
                                    {link.name}
                                </NavLink>
                            ))}
                        </nav>

                        {/* Optional User Info & Sign Out (if logged in) */}
                        {user && (
                            <div className={`pt-4 border-t mt-auto flex flex-col gap-2 ${
                                isDark ? 'border-zinc-900' : 'border-slate-200'
                            }`}>
                                <div className={`flex items-center gap-2 px-3 py-1.5 text-xs ${
                                    isDark ? 'text-[#8e8e96]' : 'text-slate-600'
                                }`}>
                                    <FiUser className="text-blue-500" />
                                    <span className="truncate">{user.first_name || user.email}</span>
                                </div>
                                <button
                                    onClick={() => {
                                        setMobileMenuOpen(false)
                                        handleSignOut()
                                    }}
                                    className={`w-full py-2.5 text-center text-xs font-semibold rounded-md border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                        isDark
                                            ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30'
                                            : 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200'
                                    }`}
                                >
                                    <FiLogOut /> Sign Out
                                </button>
                            </div>
                        )}
                    </aside>
                </>
            )}

            {toggleSearch && (
                <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm">
                    <Search setToggleSearch={setToggleSearch} />
                </div>
            )}
        </>
    )
}

export default Navbar
