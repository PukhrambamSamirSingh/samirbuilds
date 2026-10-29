import os
import re
import asyncio
from typing import Optional, Dict, Any, Union
import cloudinary
import cloudinary.uploader
import cloudinary.api
from dotenv import load_dotenv

load_dotenv()

# Cloudinary configuration (loaded securely from .env)
CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
API_KEY = os.getenv("CLOUDINARY_API_KEY")
API_SECRET = os.getenv("CLOUDINARY_API_SECRET")
UPLOAD_PRESET = os.getenv("CLOUDINARY_UPLOAD_PRESET")

cloudinary.config(
    cloud_name=CLOUD_NAME,
    api_key=API_KEY,
    api_secret=API_SECRET,
    secure=True
)

def _sanitize_filename(filename: Optional[str]) -> str:
    if not filename:
        return "media"
    base = os.path.splitext(os.path.basename(filename))[0]
    cleaned = re.sub(r'[^a-zA-Z0-9_-]', '-', base)
    return cleaned[:40].strip("-") or "media"

def _detect_resource_type(filename: Optional[str], mime_type: Optional[str] = None) -> str:
    """Determine whether resource is 'video' or 'image'."""
    if mime_type:
        if mime_type.startswith("video/"):
            return "video"
        if mime_type.startswith("image/"):
            return "image"
    if filename:
        ext = os.path.splitext(filename)[1].lower()
        if ext in [".mp4", ".webm", ".mov", ".ogg", ".m4v", ".avi", ".mkv"]:
            return "video"
        if ext in [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".bmp", ".avif"]:
            return "image"
    return "auto"

def _sync_upload(file_input: Any, resource_type: str = "auto", public_id_prefix: Optional[str] = None) -> Dict[str, Any]:
    """Execute upload synchronously through Cloudinary SDK."""
    options = {
        "folder": "samirbuilds/notes",
        "resource_type": resource_type,
        "unique_filename": True,
        "overwrite": False,
    }
    if UPLOAD_PRESET:
        options["upload_preset"] = UPLOAD_PRESET

    if public_id_prefix:
        options["public_id"] = f"{_sanitize_filename(public_id_prefix)}"

    # If it is a video and might be large, Cloudinary handles chunked uploads if > 20MB
    # but upload_large or upload works. For standard videos under 100MB, upload works directly.
    result = cloudinary.uploader.upload(file_input, **options)
    return result

async def upload_to_cloudinary(
    file_input: Any,
    filename: Optional[str] = None,
    mime_type: Optional[str] = None,
    explicit_resource_type: Optional[str] = None
) -> Dict[str, Any]:
    """
    Asynchronously upload image or video to Cloudinary.
    Accepts:
      - Raw bytes
      - File-like objects / SpooledTemporaryFile
      - Base64 data URI string
    """
    target_resource_type = explicit_resource_type or _detect_resource_type(filename, mime_type)

    # Run blocking network upload in thread pool
    res = await asyncio.to_thread(_sync_upload, file_input, target_resource_type, filename)

    secure_url = res.get("secure_url") or res.get("url")
    return {
        "success": True,
        "url": secure_url,
        "public_id": res.get("public_id"),
        "resource_type": res.get("resource_type", target_resource_type),
        "format": res.get("format"),
        "bytes": res.get("bytes"),
        "width": res.get("width"),
        "height": res.get("height"),
        "duration": res.get("duration"),
        "original_filename": filename or res.get("original_filename")
    }
