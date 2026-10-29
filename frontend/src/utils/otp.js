/**
 * OTP Utilities & Formatting Helpers
 */

export const OTP_LENGTH = 6
export const OTP_RESEND_COOLDOWN_SECONDS = 45
export const OTP_EXPIRY_SECONDS = 600 // 10 minutes

/**
 * Sanitizes input string to contain only digits up to 6 characters
 */
export const sanitizeOtp = (value) => {
    if (!value) return ''
    return String(value).replace(/\D/g, '').slice(0, OTP_LENGTH)
}

/**
 * Validates if the given string is a valid 6-digit OTP code
 */
export const isValidOtp = (otp) => {
    return /^\d{6}$/.test(String(otp || '').trim())
}

/**
 * Formats a duration in seconds into MM:SS format
 */
export const formatTimeRemaining = (seconds) => {
    if (seconds <= 0) return '00:00'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export default {
    OTP_LENGTH,
    OTP_RESEND_COOLDOWN_SECONDS,
    OTP_EXPIRY_SECONDS,
    sanitizeOtp,
    isValidOtp,
    formatTimeRemaining
}
