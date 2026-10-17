import React, { useState } from 'react'
import { Link, NavLink } from 'react-router-dom';
import { CiSearch } from "react-icons/ci";
import { MdMenu, MdClose } from "react-icons/md";
import { FiSun, FiMoon } from "react-icons/fi";
import { useTheme } from '../context/ThemeContext';
import Search from './Search';
import MathNavbarBackground from './MathNavbarBackground';

const Navbar = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [toggleSearch, setToggleSearch] = useState(false)
    const { theme, toggleTheme } = useTheme()

    return (
        <>
            <header className='relative overflow-hidden w-full text-white font-display font-medium px-4 sm:px-8 md:px-12 lg:px-20 py-4 md:py-6 bg-gray-950 border-b border-gray-800 shadow-md'>
                <MathNavbarBackground />
                <div className='relative z-10 flex justify-between items-center max-w-7xl mx-auto'>
                    {/* Logo */}
                    <Link to="/" className='flex items-center'>
                        <img className='w-28 h-14 md:w-36 md:h-16 object-contain' src="../src/assets/samir_builds_logo.png" alt="Samir Builds Logo" />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className='hidden md:flex items-center space-x-4 lg:space-x-6 text-sm lg:text-base'>
                        <Link className='tracking-wider hover:text-blue-400 transition-colors' to="/">
                            Home
                        </Link>
                        <Link className='tracking-wider hover:text-blue-400 transition-colors' to="/about">
                            About
                        </Link>
                        <Link className='tracking-wider hover:text-blue-400 transition-colors' to="/blogs">
                            Blogs
                        </Link>
                        <Link className='tracking-wider hover:text-blue-400 transition-colors' to="/notes">
                            Notes
                        </Link>
                        <Link className='tracking-wider hover:text-blue-400 transition-colors' to="/projects">
                            Projects
                        </Link>
                    </nav>

                    {/* Right Actions: Search, Theme Toggle & Sign Up */}
                    <div className='hidden sm:flex items-center gap-3 md:gap-4'>
                        {/* Search Icon Button */}
                        <button
                            type="button"
                            onClick={() => setToggleSearch(prev => !prev)}
                            className='p-2 rounded-full border border-gray-700 bg-gray-900 hover:bg-gray-800 hover:text-blue-400 transition-colors cursor-pointer flex items-center justify-center text-gray-200'
                            title="Search"
                            aria-label="Search"
                        >
                            <CiSearch className='text-xl md:text-2xl' />
                        </button>

                        {/* Theme Toggle Button */}
                        <button
                            type="button"
                            onClick={toggleTheme}
                            className='p-2 rounded-full border border-gray-700 bg-gray-900 hover:bg-gray-800 transition-colors cursor-pointer flex items-center justify-center text-yellow-400'
                            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? (
                                <FiSun className='text-lg md:text-xl text-yellow-400' />
                            ) : (
                                <FiMoon className='text-lg md:text-xl text-blue-400' />
                            )}
                        </button>

                        <Link to="/signup" className='px-4 py-1.5 text-xs md:text-sm border border-white hover:border-blue-400 rounded-full flex justify-center items-center hover:bg-blue-600 transition-all'>
                            Sign Up
                        </Link>
                    </div>

                    {/* Mobile Controls */}
                    <div className='flex sm:hidden items-center gap-2'>
                        {/* Search Icon Button Mobile */}
                        <button
                            type="button"
                            onClick={() => setToggleSearch(prev => !prev)}
                            className='p-1.5 rounded-full border border-gray-700 bg-gray-900 text-gray-200 hover:text-blue-400'
                            title="Search"
                            aria-label="Search"
                        >
                            <CiSearch className='text-lg' />
                        </button>

                        {/* Theme Toggle Button Mobile */}
                        <button
                            type="button"
                            onClick={toggleTheme}
                            className='p-1.5 rounded-full border border-gray-700 bg-gray-900 text-yellow-400'
                            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? (
                                <FiSun className='text-lg text-yellow-400' />
                            ) : (
                                <FiMoon className='text-lg text-blue-400' />
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className='text-3xl p-1 text-gray-200 focus:outline-none'
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <MdClose /> : <MdMenu />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Drawer */}
                {mobileMenuOpen && (
                    <nav className='relative z-10 md:hidden mt-4 pt-4 border-t border-gray-700/60 flex flex-col gap-4 text-sm bg-gray-900/95 p-4 rounded-xl'>
                        <Link onClick={() => setMobileMenuOpen(false)} className='tracking-wider py-1 hover:text-blue-400' to="/">
                            Home
                        </Link>
                        <Link onClick={() => setMobileMenuOpen(false)} className='tracking-wider py-1 hover:text-blue-400' to="/about">
                            About
                        </Link>
                        <Link onClick={() => setMobileMenuOpen(false)} className='tracking-wider py-1 hover:text-blue-400' to="/blogs">
                            Blogs
                        </Link>
                        <Link onClick={() => setMobileMenuOpen(false)} className='tracking-wider py-1 hover:text-blue-400' to="/notes">
                            Notes
                        </Link>
                        <Link onClick={() => setMobileMenuOpen(false)} className='tracking-wider py-1 hover:text-blue-400' to="/projects">
                            Projects
                        </Link>
                        <div className='flex flex-col gap-3 pt-2 border-t border-gray-800 sm:hidden'>
                            <Link onClick={() => setMobileMenuOpen(false)} to="/signup" className='w-full py-2 text-center text-xs border border-white rounded-full hover:bg-blue-600'>
                                Sign Up
                            </Link>
                        </div>
                    </nav>
                )}
            </header>

            {toggleSearch && (
                <div className='flex justify-center'>
                    <Search setToggleSearch={setToggleSearch} />
                </div>
            )}
        </>
    )
}

export default Navbar
