import React, { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { CiSearch } from 'react-icons/ci'
import { MdMenu, MdClose } from 'react-icons/md'
import { FiSun, FiMoon, FiLogOut, FiUser } from 'react-icons/fi'
import { useTheme } from '../context/ThemeContext'
import Search from './Search'
import logo from '../assets/samir_builds_logo.png'

const Navbar = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [toggleSearch, setToggleSearch] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [user, setUser] = useState(null)
    const { theme, toggleTheme } = useTheme()
    const isDark = theme === 'dark'
    const navigate = useNavigate()

    const syncAuth = () => {
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
            setScrolled(window.scrollY > 20)
        }
        handleScroll()
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

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
        { name: 'Blogs', path: '/blogs' },
        { name: 'Notes', path: '/notes' },
        { name: 'Projects', path: '/projects' },
    ]

    return (
        <>
            <header className="sticky top-0 z-50 w-full px-2.5 pt-3.5 pb-2 sm:px-6 sm:pt-4">
                <nav
                    className={`mx-auto flex h-16 max-w-[1400px] items-center justify-between rounded-full border pl-3.5 sm:pl-5 pr-2 transition-all duration-500 ease-out ${
                        scrolled
                            ? 'border-white/10 bg-[#131316]/85 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-2xl'
                            : 'border-white/[0.08] bg-[#070708]/60 backdrop-blur-xl'
                    }`}
                >
                    {/* Left: Brand */}
                    <Link to="/" className="flex items-center group select-none py-1" aria-label="Samir Builds Home">
                        <img
                            src={logo}
                            alt="Samir Builds Logo"
                            className="h-8 sm:h-9 md:h-10 w-auto object-contain group-hover:opacity-90 transition-opacity"
                        />
                    </Link>

                    {/* Center: Navigation Links Island */}
                    <div className="hidden md:flex items-center gap-1 rounded-full border border-white/[0.08] bg-black/40 backdrop-blur-md p-1">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.name}
                                to={link.path}
                                className={({ isActive }) =>
                                    `rounded-full px-4 py-1.5 text-[13px] font-medium transition-all duration-200 ${
                                        isActive
                                            ? 'bg-white/10 text-[#ededf1] shadow-sm'
                                            : 'text-[#8e8e96] hover:text-[#ededf1] hover:bg-white/5'
                                    }`
                                }
                            >
                                {link.name}
                            </NavLink>
                        ))}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1.5 sm:gap-2.5">
                        {/* Search Icon Button (Desktop only - in mobile, search is placed inside the drawer) */}
                        <button
                            type="button"
                            onClick={() => setToggleSearch((prev) => !prev)}
                            className="hidden md:flex p-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-[#8e8e96] hover:text-[#ededf1] transition-all cursor-pointer items-center justify-center"
                            title="Search"
                            aria-label="Search"
                        >
                            <CiSearch className="text-lg" />
                        </button>

                        {/* Theme Toggle Button */}
                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="p-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-[#8e8e96] hover:text-[#ededf1] transition-all cursor-pointer flex items-center justify-center"
                            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? (
                                <FiSun className="text-base text-yellow-400" />
                            ) : (
                                <FiMoon className="text-base text-blue-400" />
                            )}
                        </button>

                        {/* Authentication Buttons (Desktop) */}
                        {user && (
                            <div className="hidden md:flex items-center gap-2">
                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-[#ededf1]">
                                    <FiUser className="text-blue-400" />
                                    <span className="font-medium max-w-[100px] truncate">
                                        {user.first_name || user.email?.split('@')[0] || 'User'}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleSignOut}
                                    className="p-2 rounded-full border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all cursor-pointer flex items-center justify-center"
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
                            className="md:hidden p-2 rounded-full border border-white/10 bg-white/5 text-[#ededf1] hover:bg-white/10 transition-colors focus:outline-none"
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <MdClose className="text-xl" /> : <MdMenu className="text-xl" />}
                        </button>
                    </div>
                </nav>

                {/* Left-Side Mobile Navigation Drawer (Theme Adaptive) */}
                {mobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className={`md:hidden fixed inset-0 z-50 backdrop-blur-sm transition-opacity ${
                                isDark ? 'bg-black/70' : 'bg-black/40'
                            }`}
                            onClick={() => setMobileMenuOpen(false)}
                            aria-hidden="true"
                        />

                        {/* Drawer Panel Sliding in from Left */}
                        <aside
                            className={`md:hidden fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] h-full shadow-2xl flex flex-col p-6 animate-slideInLeft overflow-y-auto transition-colors duration-200 ${
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
                                        className="h-8 w-auto object-contain"
                                    />
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`p-2 rounded-full border transition cursor-pointer ${
                                        isDark
                                            ? 'border-white/10 bg-white/5 hover:bg-white/15 text-[#ededf1]'
                                            : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-800'
                                    }`}
                                    aria-label="Close menu"
                                >
                                    <MdClose className="text-xl" />
                                </button>
                            </div>

                            {/* Search Button inside Mobile Drawer */}
                            <button
                                type="button"
                                onClick={() => {
                                    setMobileMenuOpen(false)
                                    setToggleSearch(true)
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-full border text-left text-sm transition cursor-pointer my-5 ${
                                    isDark
                                        ? 'border-white/10 bg-white/5 hover:bg-white/10 text-[#8e8e96] hover:text-[#ededf1]'
                                        : 'border-slate-200 bg-slate-100/90 hover:bg-slate-200/90 text-slate-500 hover:text-slate-900'
                                }`}
                                title="Search"
                            >
                                <CiSearch className={`text-xl ${isDark ? 'text-[#8e8e96]' : 'text-slate-400'}`} />
                                <span>Search notes, articles...</span>
                            </button>

                            {/* Navigation Links: Home, About, Blogs, Notes, Projects */}
                            <nav className="flex flex-col gap-2 flex-1">
                                {navLinks.map((link) => (
                                    <NavLink
                                        key={link.name}
                                        to={link.path}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={({ isActive }) =>
                                            `flex items-center px-4 py-3 rounded-full text-base font-medium transition-all duration-200 ${
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
                                        className={`w-full py-2.5 text-center text-xs font-semibold rounded-full border transition-all flex items-center justify-center gap-2 cursor-pointer ${
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
            </header>

            {toggleSearch && (
                <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm">
                    <Search setToggleSearch={setToggleSearch} />
                </div>
            )}
        </>
    )
}

export default Navbar
