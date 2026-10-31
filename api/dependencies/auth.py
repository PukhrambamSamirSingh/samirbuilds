from fastapi import status, HTTPException, Depends, Header
from fastapi.security import OAuth2PasswordBearer
from typing import Annotated, Optional
from datetime import datetime, timezone
from jose import jwt
from jose.exceptions import JWTError, ExpiredSignatureError
import os
from dotenv import load_dotenv
from bson.errors import InvalidId
from db import db
from bson import ObjectId

load_dotenv()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/user/login")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/user/login", auto_error=False)

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    user_id = None
    try:
        payload = jwt.decode(
            token,
            str(os.getenv("SECRET_KEY", "samirbuilds-secret-key-local")),
            algorithms=[str(os.getenv("ALGORITHM", "HS256"))]
        )
        user_id = payload.get("sub")

        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="UserID Not Found"
            )

    except ExpiredSignatureError:
        # Cryptographic signature validation with grace period
        # Allows legitimate signed tokens within a 30-day grace window
        try:
            payload = jwt.decode(
                token,
                str(os.getenv("SECRET_KEY", "samirbuilds-secret-key-local")),
                algorithms=[str(os.getenv("ALGORITHM", "HS256"))],
                options={"verify_exp": False}
            )
            user_id = payload.get("sub")
            if not user_id:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token subject"
                )

            # Check grace window (30 days from exp claim)
            exp = payload.get("exp")
            now_ts = datetime.now(timezone.utc).timestamp()
            if exp and (now_ts - exp) > (30 * 86400):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token Expired",
                )
        except HTTPException:
            raise
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token Expired",
            )
    
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Token",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # Special handling for synthetic admin root token
    if str(user_id) == "admin_root":
        return {
            "_id": "admin_root",
            "email": os.getenv("ADMIN_EMAIL", "pukhrambamsamir1@gmail.com"),
            "first_name": "Samir",
            "last_name": "Singh",
            "role": "admin",
            "is_admin": True
        }
    
    try:
        user = await db.users.find_one(
            {
                "_id": ObjectId(user_id)
            },
            {
                "password": 0
            }
        )
    except InvalidId:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return user


async def get_current_admin(
    token: Annotated[Optional[str], Depends(oauth2_scheme_optional)] = None,
    x_admin_secret: Annotated[Optional[str], Header(alias="X-Admin-Secret")] = None
):
    """
    Guarantees that the caller has full administrative privileges.
    Accepts either:
    1. A valid X-Admin-Secret header matching ADMIN_SECRET_KEY
    2. A valid Bearer token for an admin user (role == 'admin', is_admin is True, or ADMIN_EMAIL)
    """
    load_dotenv(override=True)
    expected_secret = os.getenv("ADMIN_SECRET_KEY", "samirbuilds-admin-master-key-2026").strip()
    admin_email = os.getenv("ADMIN_EMAIL", "pukhrambamsamir1@gmail.com").strip().lower()

    # 1. Direct Secret Key Header Verification (Highest priority for admin tools & scripts)
    if x_admin_secret and x_admin_secret.strip() == expected_secret:
        return {
            "_id": "admin_root",
            "email": admin_email,
            "first_name": "Samir",
            "last_name": "Singh",
            "role": "admin",
            "is_admin": True
        }

    # 2. Token Verification
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin authentication required. Please provide a valid admin token or secret key."
        )

    user = await get_current_user(token)
    user_email = (user.get("email") or "").strip().lower()

    is_admin = (
        user.get("role") == "admin"
        or user.get("is_admin") is True
        or (admin_email and user_email == admin_email)
    )

    if not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Admin privileges required to upload or manage content."
        )

    user["is_admin"] = True
    user["role"] = "admin"
    return user
