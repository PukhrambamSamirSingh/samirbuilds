import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useTheme } from '../context/ThemeContext'

const SignIn = () => {
  const { theme } = useTheme()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-slate-100 text-gray-900'} flex flex-col justify-between transition-colors duration-300`}>
      <div>
        <Navbar />
        <main className='max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-16 flex flex-col md:flex-row items-center justify-center gap-8 lg:gap-16'>
            {/* Left Banner */}
            <div className='w-full md:w-1/2 text-center md:text-left flex flex-col gap-4'>
              <h1 className={`text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Welcome Back
              </h1>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm sm:text-base leading-relaxed`}>
                Sign in to manage your blogs, publish new content, and check your profile.
              </p>
            </div>

            {/* Right Sign In Form Card */}
            <div className={`w-full md:w-1/2 max-w-md p-6 sm:p-8 rounded-2xl border ${theme === 'dark' ? 'bg-gray-900/80 border-gray-700 shadow-2xl' : 'bg-white border-gray-200 shadow-xl'}`}>
              <h2 className={`text-2xl font-bold mb-6 text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Sign In</h2>
              <form action="" className='flex flex-col gap-4'>
                <div className='flex flex-col gap-1.5'>
                  <label htmlFor="email" className={`text-xs sm:text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Email Address</label>
                  <input 
                    className={`w-full rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition-colors border ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'}`}
                    type="email" 
                    name="email" 
                    id="email" 
                    placeholder='Enter your email'
                  />
                </div>
                <div className='flex flex-col gap-1.5'>
                  <label htmlFor="password" className={`text-xs sm:text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
                  <input 
                    className={`w-full rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition-colors border ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'}`}
                    type="password" 
                    name="password" 
                    id="password" 
                    placeholder='Enter your password'
                  />
                </div>
                <button className='mt-2 w-full bg-blue-600 hover:bg-blue-500 rounded-xl py-3 text-white font-bold text-sm transition-colors shadow-lg cursor-pointer' type="submit">
                  Sign In
                </button>
                <p className={`text-xs text-center mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Don't have an account? <Link to="/signup" className='text-blue-500 hover:underline font-semibold'>Sign Up</Link>
                </p>
              </form>
            </div>
        </main>
      </div>
    </div>
  )
}

export default SignIn