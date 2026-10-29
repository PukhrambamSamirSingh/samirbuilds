import os
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from fastapi import HTTPException, status
from models.user_model import (
    RegisterUser,
    LoginUser,
    VerifyOtpRequest,
    ResendOtpRequest,
    AuthResponse
)
from db import db
from utils.security import (
    hash_password,
    verify_password,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from utils.otp import (
    create_and_store_otp,
    verify_stored_otp
)
from services.email_service import send_otp_email

load_dotenv()

# Inactivity threshold: 3 days (approx 72 hours)
INACTIVITY_THRESHOLD_DAYS = 3.0

def format_db_error(e: Exception, action: str = "service") -> str:
    err_str = str(e)
    if "No replica set members found" in err_str or "ServerSelectionTimeoutError" in err_str or "10054" in err_str:
        return (
            "MongoDB Atlas connection timeout: If you are using ProtonVPN or a proxy, it blocks port 27017 (MongoDB). "
            "Please disconnect ProtonVPN or enable Split Tunneling for Python, then try again."
        )
    return f"{action.capitalize()} error: {err_str}"


# ---------------- Register Request (Step 1 & 2: Send OTP) ------------------

async def register_user(user: RegisterUser):
    user_dict = user.model_dump()
    email_clean = user_dict["email"].strip().lower()

    try:
        existing_user = await db.users.find_one({"email": email_clean})
        if existing_user and existing_user.get("is_verified", True):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email already exists. Please sign in."
            )

        hashed_pw = hash_password(user_dict["password"])

        # Store registration payload in metadata along with secure OTP
        otp_code = await create_and_store_otp(
            email=email_clean,
            purpose="signup",
            metadata={
                "first_name": user_dict["first_name"].strip(),
                "last_name": user_dict["last_name"].strip(),
                "password": hashed_pw
            }
        )

        # Dispatch email via Resend
        await send_otp_email(
            to_email=email_clean,
            otp_code=otp_code,
            purpose="signup",
            user_name=user_dict["first_name"].strip()
        )

        return {
            "requires_otp": True,
            "email": email_clean,
            "message": "Verification code sent to your email. Please enter the 6-digit code to complete registration."
        }
    except HTTPException:
        raise
    except Exception as e:
        print("Error in register_user:", e)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=format_db_error(e, "registration")
        )


# ---------------- Verify Signup OTP (Step 3 & 4: Validate OTP & Register) ------------------

async def verify_signup_otp(data: VerifyOtpRequest):
    email_clean = data.email.strip().lower()

    try:
        is_valid, msg, metadata = await verify_stored_otp(
            email=email_clean,
            otp_code=data.otp,
            purpose="signup"
        )

        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=msg
            )

        now = datetime.now(timezone.utc)
        user_record = {
            "first_name": metadata.get("first_name", ""),
            "last_name": metadata.get("last_name", ""),
            "email": email_clean,
            "password": metadata.get("password"),
            "is_verified": True,
            "created_at": now.isoformat(),
            "last_login_at": now.isoformat()
        }

        # Save user to MongoDB
        result = await db.users.update_one(
            {"email": email_clean},
            {"$set": user_record},
            upsert=True
        )

        user_doc = await db.users.find_one({"email": email_clean})
        user_id = str(user_doc["_id"])

        # Issue JWT Access Token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user_id, "email": email_clean},
            expire_time=access_token_expires
        )

        return {
            "requires_otp": False,
            "access_token": access_token,
            "token_type": "bearer",
            "message": "Account verified and registered successfully!",
            "user": {
                "_id": user_id,
                "email": email_clean,
                "first_name": user_record["first_name"],
                "last_name": user_record["last_name"]
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        print("Error in verify_signup_otp:", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=format_db_error(e, "verification")
        )


# ----------------- Login User (With 3-4 Day Inactivity OTP Check) ---------------------

async def login_user(user: LoginUser):
    user_dict = user.model_dump()
    email_clean = user_dict["email"].strip().lower()

    try:
        existing_user = await db.users.find_one({"email": email_clean})

        if not existing_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        valid_password = verify_password(
            user_dict["password"],
            existing_user["password"]
        )

        if not valid_password:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        now = datetime.now(timezone.utc)
        last_login_raw = existing_user.get("last_login_at")
        needs_reauth = False
        days_inactive = 0.0

        if last_login_raw:
            try:
                if isinstance(last_login_raw, str):
                    last_login_dt = datetime.fromisoformat(last_login_raw.replace("Z", "+00:00"))
                else:
                    last_login_dt = last_login_raw

                if last_login_dt.tzinfo is None:
                    last_login_dt = last_login_dt.replace(tzinfo=timezone.utc)

                diff = now - last_login_dt
                days_inactive = diff.total_seconds() / 86400.0

                # Check if user has not logged in for 3 or more days
                if days_inactive >= INACTIVITY_THRESHOLD_DAYS:
                    needs_reauth = True
            except Exception as parse_err:
                print("Could not parse last_login_at date:", parse_err)
                needs_reauth = True
        else:
            # If no login date was recorded previously, trigger verification for safety
            needs_reauth = True

        # CASE 1: Inactivity >= 3 days -> Trigger OTP Verification
        if needs_reauth:
            otp_code = await create_and_store_otp(
                email=email_clean,
                purpose="signin"
            )

            await send_otp_email(
                to_email=email_clean,
                otp_code=otp_code,
                purpose="signin",
                user_name=existing_user.get("first_name", "there")
            )

            inactive_msg = (
                f"For your security, because you haven't signed in for {int(days_inactive)} days, a 6-digit verification code has been sent to your email."
                if days_inactive >= 1.0
                else "For your security, please verify your identity with the 6-digit code sent to your email."
            )

            return {
                "requires_otp": True,
                "email": email_clean,
                "message": inactive_msg
            }

        # CASE 2: Active user (< 3 days) -> Issue JWT directly
        await db.users.update_one(
            {"_id": existing_user["_id"]},
            {"$set": {"last_login_at": now.isoformat()}}
        )

        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={
                "sub": str(existing_user["_id"]),
                "email": existing_user["email"]
            },
            expire_time=access_token_expires
        )

        return {
            "requires_otp": False,
            "access_token": access_token,
            "token_type": "bearer",
            "message": "Signed in successfully",
            "user": {
                "_id": str(existing_user["_id"]),
                "email": existing_user["email"],
                "first_name": existing_user.get("first_name", ""),
                "last_name": existing_user.get("last_name", "")
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        print("Database error in login_user:", e)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=format_db_error(e, "login")
        )


# ---------------- Verify Signin OTP (For Inactive Users) ------------------

async def verify_signin_otp(data: VerifyOtpRequest):
    email_clean = data.email.strip().lower()

    try:
        is_valid, msg, _ = await verify_stored_otp(
            email=email_clean,
            otp_code=data.otp,
            purpose="signin"
        )

        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=msg
            )

        existing_user = await db.users.find_one({"email": email_clean})
        if not existing_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User account not found."
            )

        now = datetime.now(timezone.utc)
        await db.users.update_one(
            {"_id": existing_user["_id"]},
            {"$set": {"last_login_at": now.isoformat()}}
        )

        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={
                "sub": str(existing_user["_id"]),
                "email": existing_user["email"]
            },
            expire_time=access_token_expires
        )

        return {
            "requires_otp": False,
            "access_token": access_token,
            "token_type": "bearer",
            "message": "Identity verified! Welcome back.",
            "user": {
                "_id": str(existing_user["_id"]),
                "email": existing_user["email"],
                "first_name": existing_user.get("first_name", ""),
                "last_name": existing_user.get("last_name", "")
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        print("Error in verify_signin_otp:", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=format_db_error(e, "sign-in verification")
        )


# ---------------- Resend OTP ------------------

async def resend_otp(data: ResendOtpRequest):
    email_clean = data.email.strip().lower()
    purpose = data.purpose or "signup"

    try:
        existing_user = await db.users.find_one({"email": email_clean})
        user_name = existing_user.get("first_name") if existing_user else "there"

        # Check existing metadata if signup
        metadata = None
        if purpose == "signup":
            existing_otp = await db.otps.find_one({"email": email_clean, "purpose": "signup"})
            if existing_otp:
                metadata = existing_otp.get("metadata")

        otp_code = await create_and_store_otp(
            email=email_clean,
            purpose=purpose,
            metadata=metadata
        )

        await send_otp_email(
            to_email=email_clean,
            otp_code=otp_code,
            purpose=purpose,
            user_name=user_name
        )

        return {
            "success": True,
            "message": "A fresh 6-digit verification code has been sent to your email."
        }
    except HTTPException:
        raise
    except Exception as e:
        print("Error in resend_otp:", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to resend code: {str(e)}"
        )
