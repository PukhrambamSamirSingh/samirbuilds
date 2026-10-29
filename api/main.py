from models.user_model import (
    RegisterUser, LoginUser, VerifyOtpRequest, ResendOtpRequest
)
from dependencies.auth import get_current_user
from models.blog_model import (
    CreateBlog, UpdateBlog
)
from models.note_model import (
    CreateNote, UpdateNote
)
from routes.user_route import (
    register_user, login_user, verify_signup_otp, verify_signin_otp, resend_otp
)
from routes.blog_route import (
    create_blog, get_blog, update_blog, get_blogs, delete_blog
)
from routes.note_route import (
    create_note, get_notes, get_note, update_note, delete_note
)
from fastapi import FastAPI, Depends, HTTPException, Request, File, UploadFile, Form
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
import base64
import uuid
import re
from services.cloudinary_service import upload_to_cloudinary

app = FastAPI()
samirbuilds = app

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Static file serving for fallback local files
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

class MediaUploadRequest(BaseModel):
    image: Optional[str] = None
    video: Optional[str] = None
    file: Optional[str] = None
    filename: Optional[str] = "media"
    resource_type: Optional[str] = None

# Unified Cloudinary Media Upload (Base64 JSON)
@app.post("/upload/media")
@app.post("/upload/image")
@app.post("/upload/video")
async def upload_media_endpoint(data: MediaUploadRequest, request: Request):
    try:
        raw_content = data.file or data.image or data.video
        if not raw_content:
            raise HTTPException(status_code=400, detail="No media content provided for upload.")

        raw_str = raw_content.strip()
        filename = data.filename or "media"
        explicit_type = data.resource_type

        # Check path or body for specific resource type hint
        path = request.url.path
        if "/video" in path or data.video:
            explicit_type = "video"
        elif "/image" in path or data.image:
            explicit_type = explicit_type or "image"

        try:
            # Upload directly to Cloudinary
            cloud_res = await upload_to_cloudinary(
                file_input=raw_str,
                filename=filename,
                explicit_resource_type=explicit_type
            )
            return cloud_res
        except Exception as cloud_err:
            print("Cloudinary upload failed, attempting local fallback if image:", cloud_err)
            if explicit_type != "video":
                # Local image fallback
                encoded = raw_str.split(",", 1)[1] if "," in raw_str else raw_str
                file_bytes = base64.b64decode(encoded)
                clean_name = re.sub(r'[^a-zA-Z0-9-]', '-', os.path.splitext(filename)[0])[:30].strip("-")
                unique_name = f"{uuid.uuid4().hex[:8]}-{clean_name or 'img'}.png"
                target_path = os.path.join(UPLOAD_DIR, unique_name)
                with open(target_path, "wb") as f:
                    f.write(file_bytes)
                host = request.headers.get("host") or "127.0.0.1:8000"
                return {
                    "success": True,
                    "url": f"http://{host}/uploads/{unique_name}",
                    "filename": unique_name,
                    "resource_type": "image"
                }
            raise HTTPException(status_code=500, detail=f"Cloudinary upload failed: {str(cloud_err)}")

    except HTTPException:
        raise
    except Exception as e:
        print("Upload endpoint error:", e)
        raise HTTPException(status_code=400, detail=f"Upload failed: {str(e)}")

# Multipart Form-Data Media Upload (Optimized for large images & videos up to 100MB)
@app.post("/upload/file")
async def upload_file_multipart(
    file: UploadFile = File(...),
    resource_type: Optional[str] = Form(None)
):
    try:
        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Empty file submitted.")

        # Limit: 100MB
        if len(content) > 100 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File exceeds maximum 100MB size limit.")

        cloud_res = await upload_to_cloudinary(
            file_input=content,
            filename=file.filename,
            mime_type=file.content_type,
            explicit_resource_type=resource_type
        )
        return cloud_res
    except HTTPException:
        raise
    except Exception as e:
        print("Multipart upload error:", e)
        raise HTTPException(status_code=400, detail=f"Multipart upload failed: {str(e)}")

# ---------------- Users -------------------

# Registration Request (Sends OTP via Resend)
@app.post("/user/register")
async def user_creation(user: RegisterUser):
    return await register_user(user)

# Verify Registration OTP
@app.post("/user/verify-signup-otp")
async def verify_registration(data: VerifyOtpRequest):
    return await verify_signup_otp(data)

# Logging user (with 3-4 day inactivity OTP check)
@app.post("/user/login")
async def user_login(user: LoginUser):
    return await login_user(user)

# Verify Login OTP (For inactive users)
@app.post("/user/verify-signin-otp")
async def verify_login_code(data: VerifyOtpRequest):
    return await verify_signin_otp(data)

# Resend OTP
@app.post("/user/resend-otp")
async def resend_code(data: ResendOtpRequest):
    return await resend_otp(data)

# Getting a user profile
@app.get("/user/profile")
async def get_me(
    current_user = Depends(get_current_user)
):
    current_user["_id"] = str(current_user["_id"])
    return current_user

# ------------------- Blogs ---------------------

# Creating a blog
@app.post("/blog/create")
async def blog(blog: CreateBlog, current_user = Depends(get_current_user)):
    print(current_user)
    return await create_blog(blog, current_user)

# Getting a blog
@app.get("/blogs/{slug}")
async def getting_blog(slug: str):
    return await get_blog(slug)
    
# Updating a blog
@app.put("/blog/update/{id}")
async def updating_blog(id: str, blog: UpdateBlog, current_user = Depends(get_current_user)):
    return await update_blog(id, blog, current_user)

# Get all blogs
@app.get("/blogs")
async def get_all_blogs():
    return await get_blogs()

# Deleting a blog
@app.delete("/blog/delete/{id}")
async def deleting_blog(id: str, current_user = Depends(get_current_user)):
    return await delete_blog(id, current_user)

# ------------------- Notes ---------------------

# Creating a note
@app.post("/note/create")
async def create_note_route(note: CreateNote, current_user = Depends(get_current_user)):
    return await create_note(note, current_user)

# Get all notes
@app.get("/notes")
async def get_all_notes():
    return await get_notes()

# Get a single note
@app.get("/notes/{slug}")
async def get_single_note(slug: str):
    return await get_note(slug)

# Update a note
@app.put("/note/update/{id}")
async def update_note_route(id: str, note: UpdateNote, current_user = Depends(get_current_user)):
    return await update_note(id, note, current_user)

# Delete a note
@app.delete("/note/delete/{id}")
async def delete_note_route(id: str, current_user = Depends(get_current_user)):
    return await delete_note(id, current_user)