import os
from dotenv import load_dotenv
from fastapi import HTTPException, status
from models.user_model import (
    RegisterUser, LoginUser, Token
)
from datetime import timedelta
from db import db
from utils.security import (
    hash_password,
    verify_password,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from fastapi.security import OAuth2PasswordBearer

load_dotenv()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/user/login")

# ---------------- Register User ------------------

async def register_user(user: RegisterUser):
    user_dict = user.model_dump()

    existing_user = await db.users.find_one(
        {
            "email": user_dict["email"]
        }
    )
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email already exists"
        )
    
    user_dict["password"] = hash_password(
        user_dict["password"]
    )

    result = await db.users.insert_one(
        user_dict
    )

    return {
        "message": "User registered successfully",
        "_id": str(result.inserted_id)
    }

# ----------------- Login User ---------------------

async def login_user(user: LoginUser):
    user_dict = user.model_dump()
    
    existing_user = await db.users.find_one(
        {
            "email": user_dict["email"]
        }
    )

    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email"
        )
    
    valid_password = verify_password(
        user_dict["password"],
        existing_user["password"]
    )

    if not valid_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password"
        )
    
    access_token_expires = timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )
    
    access_token = create_access_token(
        data={
            "sub": str(existing_user["_id"]),
            "email": existing_user["email"]
        },
        expire_time=access_token_expires
    )

    return Token(access_token=access_token, token_type="bearer")
