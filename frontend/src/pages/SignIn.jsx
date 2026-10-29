import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import OtpVerification from '../components/OtpVerification'
import { useTheme } from '../context/ThemeContext'
import { loginWithInactivityCheck, verifySigninOtp, resendVerificationOtp } from '../services/emailService'
import { FaEye, FaEyeSlash } from 'react-icons/fa'

const SignIn = () => {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const dark = theme === 'dark'

  const [step, setStep] = useState('form') // 'form' | 'otp'
  const [formData, setFormData] = useState({
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

  // Handle Login: checks credentials & 3-4 day inactivity security check
  const handleSubmitForm = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const data = await loginWithInactivityCheck(formData)

      // CASE 1: Inactive for 3+ days -> Prompt for OTP
      if (data.requires_otp) {
        setStep('otp')
        setSuccess(data.message || 'Security check: please verify the code sent to your email.')
        return
      }

      // CASE 2: Active login (< 3 days) -> Store session directly
      if (data.access_token) {
        localStorage.setItem('token', data.access_token)
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user))
      }

      window.dispatchEvent(new Event('authChange'))
      setSuccess('Signed in successfully! Redirecting...')

      setTimeout(() => {
        navigate('/notes')
      }, 1000)
    } catch (err) {
      setError(err.message || 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  // Validate OTP for inactive users (3-4+ days)
  const handleVerifyOtp = async (otpCode) => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const data = await verifySigninOtp(formData.email, otpCode)

      if (data.access_token) {
        localStorage.setItem('token', data.access_token)
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user))
      }

      window.dispatchEvent(new Event('authChange'))
      setSuccess('Identity verified! Redirecting...')

      setTimeout(() => {
        navigate('/notes')
      }, 1000)
    } catch (err) {
      setError(err.message || 'Invalid or expired verification code.')
    } finally {
      setLoading(false)
    }
  }

  // Resend Signin OTP
  const handleResendOtp = async () => {
    setError('')
    return await resendVerificationOtp(formData.email, 'signin')
  }

  const inputStyle = `w-full rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition-colors border ${
    dark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
  }`

  const labelStyle = `text-xs sm:text-sm font-semibold ${dark ? 'text-gray-300' : 'text-gray-700'}`

  return (
    <div className={`min-h-screen ${dark ? 'bg-black text-white' : 'bg-slate-50 text-gray-900'} flex flex-col justify-between transition-colors duration-300 font-sans`}>
      <div>
        <Navbar />
        <main className='max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-16 flex flex-col md:flex-row items-center justify-center gap-8 lg:gap-16'>
          {/* Left Info Banner */}
          <div className='w-full md:w-1/2 text-center md:text-left flex flex-col gap-4'>
            <span className='inline-block self-center md:self-start text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20'>
              Authentication
            </span>
            <h1 className={`text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight ${dark ? 'text-white' : 'text-gray-900'}`}>
              Welcome Back
            </h1>
            <p className={`${dark ? 'text-gray-400' : 'text-gray-600'} text-sm sm:text-base leading-relaxed`}>
              Sign in to manage your deep-dive mathematical notes, experiments, and technical publications on Samir Builds.
            </p>
          </div>

          {/* Right Card: Login Form or Inactivity Security OTP */}
          <div className='w-full md:w-1/2 flex justify-center'>
            {step === 'otp' ? (
              <OtpVerification
                email={formData.email}
                purpose="signin"
                onVerify={handleVerifyOtp}
                onResend={handleResendOtp}
                onBack={() => {
                  setStep('form')
                  setError('')
                  setSuccess('')
                }}
                loading={loading}
                error={error}
                successMessage={success}
              />
            ) : (
              <div className={`w-full max-w-md p-6 sm:p-8 rounded-2xl border ${dark ? 'bg-gray-900/80 border-gray-700 shadow-2xl' : 'bg-white border-gray-200 shadow-xl'}`}>
                <h2 className={`text-2xl font-bold mb-6 text-center ${dark ? 'text-white' : 'text-gray-900'}`}>
                  Sign In
                </h2>

                {error && (
                  <div className='mb-4 p-3 rounded-xl text-sm bg-red-500/10 border border-red-500/30 text-red-400'>
                    {error}
                  </div>
                )}

                {success && (
                  <div className='mb-4 p-3 rounded-xl text-sm bg-green-500/10 border border-green-500/30 text-green-400'>
                    {success}
                  </div>
                )}

                <form onSubmit={handleSubmitForm} className='flex flex-col gap-4'>
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
                      disabled={loading}
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
                        placeholder='Enter your password'
                        value={formData.password}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      />
                      <button
                        type='button'
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute right-3 p-1 rounded-md transition-colors cursor-pointer ${
                          dark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                        }`}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <FaEyeSlash className='text-base' /> : <FaEye className='text-base' />}
                      </button>
                    </div>
                  </div>

                  <button
                    className='mt-3 w-full bg-[#ededf1] hover:bg-white rounded-full py-3 px-6 text-[#070708] font-bold text-sm transition-all duration-200 active:scale-[0.98] shadow-sm cursor-pointer disabled:opacity-60 border-0 border-none'
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Authenticating...' : 'Sign In'}
                  </button>

                  <p className={`text-xs text-center mt-2 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Don't have an account? <Link to="/signup" className='text-blue-500 hover:underline font-semibold'>Sign Up</Link>
                  </p>
                </form>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default SignIn