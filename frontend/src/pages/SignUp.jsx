import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useTheme } from '../context/ThemeContext'
import { FaEye, FaEyeSlash } from 'react-icons/fa'

const SignUp = () => {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const dark = theme === 'dark'

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('http://127.0.0.1:8000/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.detail || 'Failed to register')
      }

      setSuccess('Account created successfully! Redirecting to sign in...')
      setTimeout(() => {
        navigate('/signin')
      }, 1500)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = `w-full rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition-colors border ${
    dark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
  }`

  const labelStyle = `text-xs sm:text-sm font-semibold ${dark ? 'text-gray-300' : 'text-gray-700'}`

  return (
    <div className={`min-h-screen ${dark ? 'bg-gray-800 text-white' : 'bg-slate-100 text-gray-900'} flex flex-col justify-between transition-colors duration-300`}>
      <div>
        <Navbar />
        <main className='max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-16 flex flex-col md:flex-row items-center justify-center gap-8 lg:gap-16'>
          {/* Left Info Banner */}
          <div className='w-full md:w-1/2 text-center md:text-left flex flex-col gap-4'>
            <h1 className={`text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight ${dark ? 'text-white' : 'text-gray-900'}`}>
              Join Samir Builds Community
            </h1>
            <p className={`${dark ? 'text-gray-400' : 'text-gray-600'} text-sm sm:text-base leading-relaxed`}>
              Create an account to publish articles, share project insights, and engage with the developer community.
            </p>
          </div>

          {/* Right Sign Up Form Card */}
          <div className={`w-full md:w-1/2 max-w-md p-6 sm:p-8 rounded-2xl border ${dark ? 'bg-gray-900/80 border-gray-700 shadow-2xl' : 'bg-white border-gray-200 shadow-xl'}`}>
            <h2 className={`text-2xl font-bold mb-6 text-center ${dark ? 'text-white' : 'text-gray-900'}`}>Create Account</h2>

            {error && (
              <div className='mb-4 p-3 rounded-xl text-sm bg-red-500/10 border border-red-500/30 text-red-500'>
                {error}
              </div>
            )}

            {success && (
              <div className='mb-4 p-3 rounded-xl text-sm bg-green-500/10 border border-green-500/30 text-green-500'>
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
              {/* First Name & Last Name grid */}
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className='flex flex-col gap-1.5'>
                  <label htmlFor="first_name" className={labelStyle}>First Name</label>
                  <input
                    className={inputStyle}
                    type="text"
                    name="first_name"
                    id="first_name"
                    placeholder='First name'
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className='flex flex-col gap-1.5'>
                  <label htmlFor="last_name" className={labelStyle}>Last Name</label>
                  <input
                    className={inputStyle}
                    type="text"
                    name="last_name"
                    id="last_name"
                    placeholder='Last name'
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className='flex flex-col gap-1.5'>
                <label htmlFor="email" className={labelStyle}>Email Address</label>
                <input
                  className={inputStyle}
                  type="email"
                  name="email"
                  id="email"
                  placeholder='Enter your email'
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Password with Eye icon toggle */}
              <div className='flex flex-col gap-1.5'>
                <label htmlFor="password" className={labelStyle}>Password</label>
                <div className='relative flex items-center'>
                  <input
                    className={`${inputStyle} pr-10`}
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    id="password"
                    placeholder='New password'
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 p-1 rounded-md transition-colors ${
                      dark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                    }`}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <FaEyeSlash className='text-base' /> : <FaEye className='text-base' />}
                  </button>
                </div>
              </div>

              <button
                className='mt-2 w-full bg-blue-600 hover:bg-blue-500 rounded-xl py-3 text-white font-bold text-sm transition-colors shadow-lg cursor-pointer disabled:opacity-60'
                type="submit"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>

              <p className={`text-xs text-center mt-2 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                Already have an account? <Link to="/signin" className='text-blue-500 hover:underline font-semibold'>Sign In</Link>
              </p>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}

export default SignUp