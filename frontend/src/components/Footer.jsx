import React from 'react'
import { FaGithub, FaLinkedin } from 'react-icons/fa'

const Footer = () => {
    return (
        <footer className='bg-gray-950 border-t border-gray-800 px-4 sm:px-8 md:px-16 lg:px-20 py-8 md:py-12 text-gray-400 text-sm'>
            <div className='max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left'>
                <div>
                    <p className='font-semibold text-gray-200 text-base'>Samir Builds</p>
                    <p className='text-xs text-gray-500 mt-1'>Sharing ideas, projects, and insights.</p>
                </div>
                <div className='flex items-center gap-3 my-2 md:my-0'>
                    <a
                        href="https://github.com/PukhrambamSamirSingh"
                        target="_blank"
                        rel="noopener noreferrer"
                        className='flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-900 border border-gray-800 text-gray-300 hover:text-white hover:border-gray-700 hover:bg-gray-800 transition-all text-xs font-medium'
                        title="GitHub Profile"
                    >
                        <FaGithub className='text-lg text-white' />
                        <span>GitHub</span>
                    </a>
                    <a
                        href="https://www.linkedin.com/in/samir-singh-6576bb251/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className='flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-900 border border-gray-800 text-gray-300 hover:text-white hover:border-gray-700 hover:bg-gray-800 transition-all text-xs font-medium'
                        title="LinkedIn Profile"
                    >
                        <FaLinkedin className='text-lg text-blue-400' />
                        <span>LinkedIn</span>
                    </a>
                </div>
                <div className='text-xs text-gray-500'>
                    © {new Date().getFullYear()} Samir Builds. All rights reserved.
                </div>
            </div>
        </footer>
    )
}

export default Footer