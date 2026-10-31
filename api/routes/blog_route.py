from models.blog_model import (
    CreateBlog, UpdateBlog
)
from dependencies.auth import get_current_user
from db import db
from fastapi import HTTPException, status
from fastapi import Depends
from typing import Annotated
from bson import ObjectId
from slugify import slugify

# Create a blog --------------------------------------------------------------

async def create_blog(blog: CreateBlog, current_user: Annotated[dict, Depends(get_current_user)]):
    blog_dict = blog.model_dump()

    new_blog = {
        "title": blog_dict["title"],
        "description": blog_dict["description"],
        "tag": blog_dict["tag"],
        "img": blog_dict["img"],
        "author": str(current_user["_id"]),
        "published_at": blog_dict["published_at"],
        "slug": slugify(blog_dict["title"])
    }

    result = await db.blogs.insert_one(new_blog)

    if not result.inserted_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create the Blog"
        )
    
    return {
        "message": "Blog Created Successfully",
        "_id": str(result.inserted_id)
    }
    
# Getting a single blog -------------------------------------------------------

async def get_blog(slug: str):
    blog = await db.blogs.find_one(
        {
            "slug": slug
        }
    )
    if not blog:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Blog Not Found"
        )
    
    blog["_id"] = str(blog["_id"])
    
    return blog

# Updating a blog ------------------------------------------------------------

async def update_blog(id: str, blog: UpdateBlog, current_user: Annotated[dict, Depends(get_current_user)]):
    clean_id = (id or "").strip()
    query = {}
    if ObjectId.is_valid(clean_id):
        query = {"$or": [{"_id": ObjectId(clean_id)}, {"slug": clean_id.lower()}, {"slug": clean_id}]}
    else:
        query = {"$or": [{"slug": clean_id.lower()}, {"slug": clean_id}]}

    existing_blog = await db.blogs.find_one(query)

    if not existing_blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog Not Found"
        )
    
    user_id_str = str(current_user["_id"])
    user_email = str(current_user.get("email", "")).lower()
    author_str = str(existing_blog.get("author", ""))
    full_name = f"{current_user.get('first_name', '')} {current_user.get('last_name', '')}".strip().lower()

    is_author = (
        author_str == user_id_str or
        author_str.lower() == user_email or
        (full_name and author_str.lower() == full_name)
    )

    if not is_author:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not allowed to update this blog"
        )
    
    update_data = blog.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields were updated"
        )

    if "title" in update_data and update_data["title"]:
        update_data["slug"] = slugify(update_data["title"])
    
    await db.blogs.update_one(
        {"_id": existing_blog["_id"]},
        {"$set": update_data}
    )
    return {
        "message": "Blog updated successfully"
    }

# Getting all Blogs -------------------------------------------------------------------

async def get_blogs():
    blogs = await db.blogs.find({}).sort("published_at", -1).to_list(length=None)

    for blog in blogs:
        blog["_id"] = str(blog["_id"])
    
    return blogs

# Deleting a Blog --------------------------------------------------------------------

async def delete_blog(id: str, current_user: Annotated[dict, Depends(get_current_user)]):
    clean_id = (id or "").strip()
    query = {}
    if ObjectId.is_valid(clean_id):
        query = {"$or": [{"_id": ObjectId(clean_id)}, {"slug": clean_id.lower()}, {"slug": clean_id}]}
    else:
        query = {"$or": [{"slug": clean_id.lower()}, {"slug": clean_id}]}

    existing_blog = await db.blogs.find_one(query)
    if not existing_blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog Not Found"
        )
    
    user_id_str = str(current_user["_id"])
    user_email = str(current_user.get("email", "")).lower()
    author_str = str(existing_blog.get("author", ""))
    full_name = f"{current_user.get('first_name', '')} {current_user.get('last_name', '')}".strip().lower()

    is_author = (
        author_str == user_id_str or
        author_str.lower() == user_email or
        (full_name and author_str.lower() == full_name)
    )

    if not is_author:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not allowed to delete this blog: only the author can delete it."
        )
    
    await db.blogs.delete_one({"_id": existing_blog["_id"]})
    return {
        "message": "Blog deleted successfully",
        "_id": str(existing_blog["_id"])
    }
