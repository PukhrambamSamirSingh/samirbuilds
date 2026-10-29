import secrets
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, status
from db import db

OTP_EXPIRY_MINUTES = 10
RESEND_COOLDOWN_SECONDS = 45
MAX_ATTEMPTS = 5
MAX_RESENDS_PER_WINDOW = 5

def generate_secure_otp(length: int = 6) -> str:
    """Generates an unguessable numeric OTP string."""
    digits = "0123456789"
    return "".join(secrets.choice(digits) for _ in range(length))


async def create_and_store_otp(
    email: str,
    purpose: str = "signup",
    metadata: dict = None,
    expiry_minutes: int = OTP_EXPIRY_MINUTES
) -> str:
    """
    Generates a secure OTP, validates rate limits, and persists it in MongoDB.
    """
    clean_email = email.strip().lower()
    now = datetime.now(timezone.utc)

    # Check for existing OTP record to enforce rate limit / cooldown
    existing = await db.otps.find_one({"email": clean_email, "purpose": purpose})

    if existing:
        last_created = existing.get("created_at")
        if last_created:
            if last_created.tzinfo is None:
                last_created = last_created.replace(tzinfo=timezone.utc)
            seconds_since = (now - last_created).total_seconds()
            if seconds_since < RESEND_COOLDOWN_SECONDS:
                wait_left = int(RESEND_COOLDOWN_SECONDS - seconds_since)
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Please wait {wait_left} seconds before requesting another code."
                )

        # Check total resend attempts in current window
        resend_count = existing.get("resend_count", 0)
        if resend_count >= MAX_RESENDS_PER_WINDOW:
            expires_at = existing.get("expires_at")
            if expires_at:
                if expires_at.tzinfo is None:
                    expires_at = expires_at.replace(tzinfo=timezone.utc)
                if now < expires_at:
                    raise HTTPException(
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        detail="Maximum verification attempts reached for this session. Please try again after 10 minutes."
                    )

    otp_code = generate_secure_otp(6)
    expires_at = now + timedelta(minutes=expiry_minutes)

    otp_record = {
        "email": clean_email,
        "purpose": purpose,
        "otp": otp_code,
        "created_at": now,
        "expires_at": expires_at,
        "attempts": 0,
        "metadata": metadata or {}
    }

    await db.otps.update_one(
        {"email": clean_email, "purpose": purpose},
        {
            "$set": otp_record,
            "$inc": {"resend_count": 1}
        },
        upsert=True
    )

    return otp_code


async def verify_stored_otp(
    email: str,
    otp_code: str,
    purpose: str = "signup"
) -> tuple[bool, str, dict]:
    """
    Validates an OTP against MongoDB:
    Returns (is_valid: bool, message: str, metadata: dict)
    """
    clean_email = email.strip().lower()
    clean_otp = str(otp_code).strip()
    now = datetime.now(timezone.utc)

    record = await db.otps.find_one({"email": clean_email, "purpose": purpose})

    if not record:
        return False, "No active verification code found. Please request a new one.", {}

    # Check attempt limit
    attempts = record.get("attempts", 0)
    if attempts >= MAX_ATTEMPTS:
        await db.otps.delete_one({"_id": record["_id"]})
        return False, "Too many incorrect attempts. Please request a new verification code.", {}

    # Check expiry
    expires_at = record.get("expires_at")
    if expires_at:
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if now > expires_at:
            await db.otps.delete_one({"_id": record["_id"]})
            return False, "Verification code has expired. Please request a new code.", {}

    # Verify code equality
    if record.get("otp") != clean_otp:
        await db.otps.update_one(
            {"_id": record["_id"]},
            {"$inc": {"attempts": 1}}
        )
        remaining = MAX_ATTEMPTS - (attempts + 1)
        return False, f"Incorrect verification code. {remaining} attempt(s) remaining.", {}

    # Successfully verified: clean up OTP record
    metadata = record.get("metadata", {})
    await db.otps.delete_one({"_id": record["_id"]})
    return True, "Code verified successfully.", metadata
