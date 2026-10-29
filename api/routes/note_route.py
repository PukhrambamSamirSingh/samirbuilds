from models.note_model import CreateNote, UpdateNote
from dependencies.auth import get_current_user
from db import db
from fastapi import HTTPException, status, Depends
from typing import Annotated
from bson import ObjectId
from slugify import slugify


# Create a note ---------------------------------------------------------------

async def create_note(note: CreateNote, current_user: Annotated[dict, Depends(get_current_user)]):
    note_dict = note.model_dump()

    new_note = {
        "title": note_dict["title"],
        "content": note_dict["content"],
        "tag": note_dict["tag"],
        "author": str(current_user["_id"]),
        "published_at": note_dict["published_at"],
        "slug": (note_dict.get("slug") or slugify(note_dict["title"])).lower(),
    }

    try:
        result = await db.notes.insert_one(new_note)

        if not result.inserted_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create the Note",
            )

        return {
            "message": "Note Created Successfully",
            "_id": str(result.inserted_id),
        }
    except HTTPException:
        raise
    except Exception as e:
        print("Database error in create_note:", e)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database connection error: {str(e)}. Please verify MongoDB Atlas IP whitelist."
        )


# Get all notes ---------------------------------------------------------------

async def get_notes():
    try:
        notes = await db.notes.find({}).sort("published_at", -1).to_list(length=100)

        for note in notes:
            note["_id"] = str(note["_id"])
            if "author" in note and note["author"] is not None:
                note["author"] = str(note["author"])

        return notes
    except Exception as e:
        print("Error fetching notes from MongoDB Atlas:", e)
        return []


# Get a single note -----------------------------------------------------------

async def get_note(slug: str):
    try:
        slug_clean = slug.strip().lower()
        note = await db.notes.find_one({"$or": [{"slug": slug_clean}, {"slug": slug}]})

        if not note and ObjectId.is_valid(slug):
            note = await db.notes.find_one({"_id": ObjectId(slug)})

        if not note:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Note Not Found",
            )

        note["_id"] = str(note["_id"])
        if "author" in note and note["author"] is not None:
            note["author"] = str(note["author"])
        return note
    except HTTPException:
        raise
    except Exception as e:
        print("Error fetching note:", e)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database connection error: {str(e)}"
        )


# Update a note ---------------------------------------------------------------

async def update_note(
    id: str,
    note: UpdateNote,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    try:
        clean_id = id.strip()
        query = {}
        if ObjectId.is_valid(clean_id):
            query = {"$or": [{"_id": ObjectId(clean_id)}, {"slug": clean_id.lower()}, {"slug": clean_id}]}
        else:
            query = {"$or": [{"slug": clean_id.lower()}, {"slug": clean_id}]}

        existing = await db.notes.find_one(query)

        if not existing:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note Not Found")

        if str(existing.get("author", "")) != str(current_user["_id"]):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to update this note")

        update_data = note.model_dump(exclude_unset=True)
        if "title" in update_data:
            update_data["slug"] = slugify(update_data["title"])

        await db.notes.update_one({"_id": existing["_id"]}, {"$set": update_data})
        return {"message": "Note updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))


# Delete a note ---------------------------------------------------------------

async def delete_note(
    id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    try:
        clean_id = id.strip()
        query = {}
        if ObjectId.is_valid(clean_id):
            query = {"$or": [{"_id": ObjectId(clean_id)}, {"slug": clean_id.lower()}, {"slug": clean_id}]}
        else:
            query = {"$or": [{"slug": clean_id.lower()}, {"slug": clean_id}]}

        existing = await db.notes.find_one(query)

        if not existing:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note Not Found")

        user_id_str = str(current_user["_id"])
        note_author_str = str(existing.get("author", ""))

        if note_author_str != user_id_str:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not allowed to delete this note: only the author who uploaded it can delete."
            )

        await db.notes.delete_one({"_id": existing["_id"]})
        return {
            "message": "Note deleted successfully",
            "_id": str(existing["_id"])
        }
    except HTTPException:
        raise
    except Exception as e:
        print("Database error in delete_note:", e)
        raise HTTPException(status_code=503, detail=str(e))
