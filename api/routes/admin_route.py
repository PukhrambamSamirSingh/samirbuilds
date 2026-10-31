import os
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv, set_key
from fastapi import HTTPException, status, Depends
from pydantic import BaseModel
from typing import Optional
from db import db
from utils.security import (
    hash_password,
    verify_password,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from dependencies.auth import get_current_admin
from bson import ObjectId

load_dotenv()

class AdminLoginRequest(BaseModel):
    email: Optional[str] = None
    password: Optional[str] = None
    secret_key: Optional[str] = None

class VerifySecretRequest(BaseModel):
    secret_key: str

class UpdateSecretKeyRequest(BaseModel):
    current_secret_key: str
    new_secret_key: str

def get_expected_secret() -> str:
    load_dotenv(override=True)
    return os.getenv("ADMIN_SECRET_KEY", "samirbuilds-admin-master-key-2026").strip()

def get_expected_email() -> str:
    load_dotenv(override=True)
    return os.getenv("ADMIN_EMAIL", "robinsamir810@gmail.com").strip().lower()

# ----------------- Admin Login Endpoint -----------------
async def admin_login(data: AdminLoginRequest):
    expected_secret = get_expected_secret()
    expected_email = get_expected_email()
    provided_secret = (data.secret_key or "").strip()
    provided_email = (data.email or "").strip().lower()
    provided_password = (data.password or "").strip()

    admin_authenticated = False
    admin_user_doc = None

    # Path 1: Master Secret Key verification
    if provided_secret and provided_secret == expected_secret:
        admin_authenticated = True

    # Path 2: Email & Password verification against db.users
    if provided_email and provided_password:
        import re
        user_doc = await db.users.find_one({"email": {"$regex": f"^{re.escape(provided_email)}$", "$options": "i"}})
        if user_doc and verify_password(provided_password, user_doc.get("password", "")):
            # Check if this user is designated admin, has admin role, or master secret key was verified
            is_designated_admin = (
                user_doc.get("role") == "admin"
                or user_doc.get("is_admin") is True
                or provided_email == expected_email
                or provided_email in ["robinsamir810@gmail.com", "pukhrambamsamir1@gmail.com"]
                or admin_authenticated
            )
            if is_designated_admin:
                admin_authenticated = True
                admin_user_doc = user_doc
            elif not admin_authenticated:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="This account does not have administrative privileges."
                )
        elif not admin_authenticated:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password."
            )

    # If neither authentication path succeeded
    if not admin_authenticated:
        if provided_secret:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Admin Secret Key. Access denied."
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please provide valid admin credentials or master secret key."
        )

    admin_email = provided_email or (admin_user_doc.get("email") if admin_user_doc else None) or expected_email
    user_id = None
    first_name = "Samir"
    last_name = "Singh"

    if admin_user_doc:
        user_id = str(admin_user_doc["_id"])
        first_name = admin_user_doc.get("first_name", first_name)
        last_name = admin_user_doc.get("last_name", last_name)
        admin_email = admin_user_doc.get("email", admin_email)
        await db.users.update_one(
            {"_id": admin_user_doc["_id"]},
            {"$set": {"role": "admin", "is_admin": True, "last_login_at": datetime.now(timezone.utc).isoformat()}}
        )
    else:
        existing_admin = await db.users.find_one({"email": admin_email})
        if existing_admin:
            user_id = str(existing_admin["_id"])
            first_name = existing_admin.get("first_name", first_name)
            last_name = existing_admin.get("last_name", last_name)
            await db.users.update_one(
                {"_id": existing_admin["_id"]},
                {"$set": {"role": "admin", "is_admin": True, "last_login_at": datetime.now(timezone.utc).isoformat()}}
            )
        else:
            now = datetime.now(timezone.utc)
            new_admin_res = await db.users.insert_one({
                "email": admin_email,
                "first_name": first_name,
                "last_name": last_name,
                "role": "admin",
                "is_admin": True,
                "is_verified": True,
                "created_at": now.isoformat(),
                "last_login_at": now.isoformat()
            })
            user_id = str(new_admin_res.inserted_id)

    # Issue high-privilege Admin JWT
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": user_id,
            "email": admin_email,
            "role": "admin",
            "is_admin": True
        },
        expire_time=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "is_admin": True,
        "message": "Admin session authenticated successfully.",
        "user": {
            "_id": user_id,
            "email": admin_email,
            "first_name": first_name,
            "last_name": last_name,
            "role": "admin",
            "is_admin": True
        }
    }

# ----------------- Quick Verify Secret Key -----------------
async def verify_admin_secret(data: VerifySecretRequest):
    expected_secret = get_expected_secret()
    provided = (data.secret_key or "").strip()

    if provided != expected_secret:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Admin Secret Key."
        )

    admin_email = get_expected_email()
    # Issue admin session token directly
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(
        data={
            "sub": "admin_root",
            "email": admin_email,
            "role": "admin",
            "is_admin": True
        },
        expire_time=access_token_expires
    )

    return {
        "valid": True,
        "access_token": token,
        "token_type": "bearer",
        "is_admin": True,
        "email": admin_email,
        "message": "Admin secret key verified successfully."
    }

# ----------------- Admin Settings -----------------
async def get_admin_settings(admin_user: dict):
    expected_secret = get_expected_secret()
    admin_email = get_expected_email()

    # Mask the secret key for display (e.g., "robi***2026")
    if expected_secret and len(expected_secret) >= 8:
        masked = f"{expected_secret[:4]}***{expected_secret[-4:]}"
    elif expected_secret:
        masked = "********"
    else:
        masked = "Not configured"

    return {
        "admin_email": admin_email,
        "secret_key_configured": bool(expected_secret),
        "secret_key_hint": masked,
        "secret_key_preview": masked,
        "jwt_algorithm": os.getenv("ALGORITHM", "HS256"),
        "token_expire_minutes": int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "43200")),
        "cloudinary_connected": bool(os.getenv("CLOUDINARY_CLOUD_NAME")),
        "resend_connected": bool(os.getenv("RESEND_API_KEY")),
        "upload_mode": "Admin-Only Restricted"
    }

# ----------------- Update Secret Key -----------------
async def update_admin_secret_key(data: UpdateSecretKeyRequest, admin_user: dict):
    expected_secret = get_expected_secret()
    if (data.current_secret_key or "").strip() != expected_secret:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current Secret Key is incorrect."
        )

    new_key = (data.new_secret_key or "").strip()
    if len(new_key) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New secret key must be at least 8 characters long."
        )

    # Update runtime environment variable
    os.environ["ADMIN_SECRET_KEY"] = new_key

    # Persist to api/.env file
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
    try:
        if os.path.exists(env_path):
            set_key(env_path, "ADMIN_SECRET_KEY", new_key)
    except Exception as e:
        print("Could not update .env file directly:", e)

    new_masked = f"{new_key[:4]}***{new_key[-4:]}" if len(new_key) >= 8 else "********"

    return {
        "success": True,
        "message": "Admin Secret Key updated successfully. Use your new key for future logins.",
        "secret_key_hint": new_masked,
        "secret_key_preview": new_masked
    }

# ----------------- Admin Stats -----------------
async def get_admin_stats(admin_user: dict):
    total_blogs = 0
    total_notes = 0
    total_users = 0
    recent_blogs = []
    recent_notes = []

    try:
        total_blogs = await db.blogs.count_documents({})
        total_notes = await db.notes.count_documents({})
        total_users = await db.users.count_documents({})

        cursor_blogs = db.blogs.find({}, {"content": 0}).sort("created_at", -1).limit(5)
        raw_blogs = await cursor_blogs.to_list(length=5)
        for b in raw_blogs:
            b["_id"] = str(b["_id"])
            recent_blogs.append(b)

        cursor_notes = db.notes.find({}, {"content": 0}).sort("created_at", -1).limit(5)
        raw_notes = await cursor_notes.to_list(length=5)
        for n in raw_notes:
            n["_id"] = str(n["_id"])
            recent_notes.append(n)
    except Exception as e:
        print("Error fetching admin stats:", e)

    return {
        "total_blogs": total_blogs,
        "total_notes": total_notes,
        "total_users": total_users,
        "recent_blogs": recent_blogs,
        "recent_notes": recent_notes,
        "system_status": "Operational",
        "authenticated_as": admin_user.get("email", "admin")
    }

