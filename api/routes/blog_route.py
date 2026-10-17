from models.blog_model import (
    CreateBlog, UpdateBlog
)
from dependencies.auth import get_current_user
from jwt.exceptions import ExpiredSignatureError
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
    existing_blog = await db.blogs.find_one(
        {
            "_id": ObjectId(id)
        }
    )

    if not existing_blog:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Blog Not Found"
        )
    
    if existing_blog["author"] != str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You are not allowed to update this blog"
        )
    
    update_data = blog.model_dump(exclude_unset=True)

    update_data["slug"] = slugify(update_data["title"])

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields were updated"
        )
    
    await db.blogs.update_one(
        {
            "_id": ObjectId(id)
        },
        {
            "$set": update_data
        }
    )
    return {
        "message": "Blog updated successfully"
    }

# Getting all Blogs -------------------------------------------------------------------

async def get_blogs():
    blogs = await db.blogs.find({}).sort("published_at", -1).to_list(length=None)

    if not blogs:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Blogs Not Found"
        )
    
    for blog in blogs:
        blog["_id"] = str(blog["_id"])
    
    return blogs

# Deleting a Blog --------------------------------------------------------------------

async def delete_blog(id: str, current_user: Annotated[dict, Depends(get_current_user)]):
    existing_blog = await db.blogs.find_one(
        {
            "_id": ObjectId(id)
        }
    )
    if not existing_blog:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Blog Not Found"
        )
    
    if existing_blog["author"] != str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You are not allowed to delete this blog"
        )
    
    await db.blogs.delete_one(
        {
            "_id": ObjectId(id)
        }
    )
    return {
        "message": "Blog deleted successfully"
    }
