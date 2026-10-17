from fastapi import status, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from typing import Annotated
from jose import jwt
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError
import os
from dotenv import load_dotenv
from bson.errors import InvalidId
from db import db
from bson import ObjectId

load_dotenv()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/user/login")

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    try:
        payload = jwt.decode(
            token,
            str(os.getenv("SECRET_KEY")),
            algorithms=[str(os.getenv("ALGORITHM"))]
        )
        user_id = payload.get("sub")

        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="UserID Not Found"
            )

    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token Expired",
        )
    
    except InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Token",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    try:
        user = await db.users.find_one(
            {
                "_id": ObjectId(user_id)
            },
            {
                "_id": 1, "username": 1, "email": 1, "phone": 1
            }
        )
    except InvalidId:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    return user