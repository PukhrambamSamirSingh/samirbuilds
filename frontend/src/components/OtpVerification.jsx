import React, { useState, useEffect, useRef } from 'react'
import { useTheme } from '../context/ThemeContext'
import { sanitizeOtp, isValidOtp, formatTimeRemaining, OTP_RESEND_COOLDOWN_SECONDS, OTP_EXPIRY_SECONDS } from '../utils/otp'
import { FiMail, FiCheckCircle, FiAlertCircle, FiArrowLeft, FiRefreshCw, FiShield } from 'react-icons/fi'

const OtpVerification = ({
    email,
    purpose = 'signup', // 'signup' | 'signin'
    onVerify,
    onResend,
    onBack,
    loading = false,
    error = '',
    successMessage = ''
}) => {
    const { theme } = useTheme()
    const dark = theme === 'dark'

    const [digits, setDigits] = useState(['', '', '', '', '', ''])
    const [cooldown, setCooldown] = useState(OTP_RESEND_COOLDOWN_SECONDS)
    const [expiry, setExpiry] = useState(OTP_EXPIRY_SECONDS)
    const [resending, setResending] = useState(false)
    const [resendNotice, setResendNotice] = useState('')
    const inputRefs = useRef([])

    // Countdown timers
    useEffect(() => {
        const timer = setInterval(() => {
            setCooldown(prev => (prev > 0 ? prev - 1 : 0))
            setExpiry(prev => (prev > 0 ? prev - 1 : 0))
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    // Focus on first input on mount
    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus()
        }
    }, [])

    const handleDigitChange = (index, value) => {
        const sanitized = value.replace(/\D/g, '')

        // If user pasted multi-digit string into one box
        if (sanitized.length > 1) {
            handlePasteData(sanitized)
            return
        }

        const newDigits = [...digits]
        newDigits[index] = sanitized
        setDigits(newDigits)

        // Move to next input box if a digit was typed
        if (sanitized && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }

        // Auto-submit if all 6 digits are filled
        const fullCode = newDigits.join('')
        if (isValidOtp(fullCode)) {
            onVerify(fullCode)
        }
    }

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !digits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus()
        } else if (e.key === 'ArrowRight' && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handlePaste = (e) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData('text')
        handlePasteData(pasted)
    }

    const handlePasteData = (text) => {
        const clean = sanitizeOtp(text)
        if (!clean) return

        const newDigits = ['', '', '', '', '', '']
        for (let i = 0; i < clean.length && i < 6; i++) {
            newDigits[i] = clean[i]
        }
        setDigits(newDigits)

        const focusIndex = Math.min(clean.length, 5)
        inputRefs.current[focusIndex]?.focus()

        if (clean.length === 6) {
            onVerify(clean)
        }
    }

    const handleResendClick = async () => {
        if (cooldown > 0 || resending) return
        setResending(true)
        setResendNotice('')
        try {
            await onResend()
            setCooldown(OTP_RESEND_COOLDOWN_SECONDS)
            setExpiry(OTP_EXPIRY_SECONDS)
            setResendNotice('✨ Fresh code sent to your email!')
            setTimeout(() => setResendNotice(''), 4000)
        } catch (err) {
            console.error('Failed to resend OTP:', err)
        } finally {
            setResending(false)
        }
    }

    const fullOtp = digits.join('')
    const isComplete = fullOtp.length === 6

    const handleSubmit = (e) => {
        e.preventDefault()
        if (isComplete) {
            onVerify(fullOtp)
        }
    }

    return (
        <div className={`w-full max-w-md mx-auto p-6 sm:p-8 rounded-2xl border shadow-2xl transition-all ${
            dark 
                ? 'bg-[#0b0c10] border-zinc-800 text-white' 
                : 'bg-white border-gray-200 text-gray-900'
        }`}>
            {/* Top Security Icon */}
            <div className="flex flex-col items-center text-center mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-md ${
                    purpose === 'signin' 
                        ? 'bg-amber-500/15 text-amber-400' 
                        : 'bg-blue-500/15 text-blue-400'
                }`}>
                    {purpose === 'signin' ? (
                        <FiShield className="text-2xl" />
                    ) : (
                        <FiMail className="text-2xl" />
                    )}
                </div>

                <h2 className="text-2xl font-extrabold tracking-tight">
                    {purpose === 'signin' ? 'Security Verification' : 'Verify Your Email'}
                </h2>
                
                <p className={`text-xs sm:text-sm mt-1.5 max-w-sm ${dark ? 'text-zinc-400' : 'text-gray-600'}`}>
                    {purpose === 'signin'
                        ? 'For your security after several days of inactivity, we sent a 6-digit code to:'
                        : 'We sent a 6-digit verification code to:'}
                </p>

                <div className={`mt-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    dark ? 'bg-zinc-800/80 text-cyan-300' : 'bg-slate-100 text-blue-700'
                }`}>
                    {email}
                </div>
            </div>

            {/* Error & Notice Banners */}
            {error && (
                <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                    <FiAlertCircle className="text-base flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {successMessage && (
                <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                    <FiCheckCircle className="text-base flex-shrink-0" />
                    <span>{successMessage}</span>
                </div>
            )}

            {resendNotice && (
                <div className="mb-5 p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs flex items-center gap-2">
                    <FiCheckCircle className="text-base flex-shrink-0" />
                    <span>{resendNotice}</span>
                </div>
            )}

            {/* 6-Digit Code Inputs */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="flex items-center justify-between gap-2 sm:gap-3">
                    {digits.map((digit, idx) => (
                        <input
                            key={idx}
                            ref={el => (inputRefs.current[idx] = el)}
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            pattern="[0-9]*"
                            maxLength={1}
                            value={digit}
                            onChange={e => handleDigitChange(idx, e.target.value)}
                            onKeyDown={e => handleKeyDown(idx, e)}
                            onPaste={handlePaste}
                            disabled={loading}
                            className={`w-11 sm:w-13 h-14 text-center text-xl sm:text-2xl font-bold font-mono rounded-xl border outline-none transition-all duration-150 ${
                                dark
                                    ? 'bg-[#12131a] text-white border-zinc-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25'
                                    : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20'
                            } ${digit ? 'border-cyan-500' : ''}`}
                        />
                    ))}
                </div>

                {/* Expiry & Resend Information */}
                <div className="flex items-center justify-between text-xs px-1">
                    <span className={expiry < 60 ? 'text-red-400 font-semibold' : dark ? 'text-zinc-500' : 'text-gray-400'}>
                        Expires in: <span className="font-mono">{formatTimeRemaining(expiry)}</span>
                    </span>

                    {cooldown > 0 ? (
                        <span className={dark ? 'text-zinc-500' : 'text-gray-400'}>
                            Resend in <span className="font-mono font-semibold">{cooldown}s</span>
                        </span>
                    ) : (
                        <button
                            type="button"
                            onClick={handleResendClick}
                            disabled={resending || loading}
                            className="inline-flex items-center gap-1 font-semibold text-blue-500 hover:text-blue-400 hover:underline transition cursor-pointer disabled:opacity-50"
                        >
                            <FiRefreshCw className={`text-xs ${resending ? 'animate-spin' : ''}`} />
                            <span>Resend Code</span>
                        </button>
                    )}
                </div>

                {/* Primary Verify Button */}
                <button
                    type="submit"
                    disabled={!isComplete || loading}
                    className="w-full py-3.5 rounded-full font-semibold text-sm transition-all duration-200 active:scale-[0.98] shadow-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-[#ededf1] hover:bg-white text-[#070708] flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <span>Verifying code...</span>
                    ) : (
                        <>
                            <span>Verify & Continue</span>
                            <span>→</span>
                        </>
                    )}
                </button>

                {/* Back / Change Email Action */}
                {onBack && (
                    <button
                        type="button"
                        onClick={onBack}
                        disabled={loading}
                        className={`inline-flex items-center justify-center gap-1.5 text-xs font-medium transition cursor-pointer ${
                            dark ? 'text-zinc-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        <FiArrowLeft className="text-xs" />
                        <span>Use a different email / Back</span>
                    </button>
                )}
            </form>
        </div>
    )
}

export default OtpVerification
