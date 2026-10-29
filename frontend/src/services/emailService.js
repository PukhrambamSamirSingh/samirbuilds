/**
 * Client Email & OTP Authentication Service
 * Communicates with backend endpoints utilizing Resend for secure email dispatch.
 */

const API_BASE_URL = 'http://127.0.0.1:8000'

/**
 * Initiates registration and dispatches 6-digit verification code via Resend
 */
export const requestRegistrationOtp = async (userData) => {
    const res = await fetch(`${API_BASE_URL}/user/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    })
    const data = await res.json()
    if (!res.ok) {
        throw new Error(data.detail || 'Failed to send registration verification code.')
    }
    return data
}

/**
 * Validates signup OTP, finalizes registration, and returns JWT session
 */
export const verifySignupOtp = async (email, otp) => {
    const res = await fetch(`${API_BASE_URL}/user/verify-signup-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
    })
    const data = await res.json()
    if (!res.ok) {
        throw new Error(data.detail || 'Invalid or expired verification code.')
    }
    return data
}

/**
 * Logs in user with automatic 3-4 day inactivity security check
 */
export const loginWithInactivityCheck = async (credentials) => {
    const res = await fetch(`${API_BASE_URL}/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
    })
    const data = await res.json()
    if (!res.ok) {
        throw new Error(data.detail || 'Invalid email or password.')
    }
    return data
}

/**
 * Validates sign-in OTP for inactive users (3+ days) and returns JWT session
 */
export const verifySigninOtp = async (email, otp) => {
    const res = await fetch(`${API_BASE_URL}/user/verify-signin-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
    })
    const data = await res.json()
    if (!res.ok) {
        throw new Error(data.detail || 'Invalid or expired verification code.')
    }
    return data
}

/**
 * Requests a fresh OTP code with rate limit handling
 */
export const resendVerificationOtp = async (email, purpose = 'signup') => {
    const res = await fetch(`${API_BASE_URL}/user/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose })
    })
    const data = await res.json()
    if (!res.ok) {
        throw new Error(data.detail || 'Failed to resend verification code.')
    }
    return data
}

export default {
    requestRegistrationOtp,
    verifySignupOtp,
    loginWithInactivityCheck,
    verifySigninOtp,
    resendVerificationOtp
}
