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
        "slug": slugify(note_dict["title"]),
    }

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


# Get all notes ---------------------------------------------------------------

async def get_notes():
    notes = await db.notes.find({}).sort("published_at", -1).to_list(length=None)

    for note in notes:
        note["_id"] = str(note["_id"])

    return notes


# Get a single note -----------------------------------------------------------

async def get_note(slug: str):
    note = await db.notes.find_one({"slug": slug})

    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note Not Found",
        )

    note["_id"] = str(note["_id"])
    return note


# Update a note ---------------------------------------------------------------

async def update_note(
    id: str,
    note: UpdateNote,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    existing = await db.notes.find_one({"_id": ObjectId(id)})

    if not existing:
        raise HTTPException(status_code=404, detail="Note Not Found")

    if existing["author"] != str(current_user["_id"]):
        raise HTTPException(status_code=401, detail="Not allowed to update this note")

    update_data = note.model_dump(exclude_unset=True)
    if "title" in update_data:
        update_data["slug"] = slugify(update_data["title"])

    await db.notes.update_one({"_id": ObjectId(id)}, {"$set": update_data})
    return {"message": "Note updated successfully"}


# Delete a note ---------------------------------------------------------------

async def delete_note(
    id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    existing = await db.notes.find_one({"_id": ObjectId(id)})

    if not existing:
        raise HTTPException(status_code=404, detail="Note Not Found")

    if existing["author"] != str(current_user["_id"]):
        raise HTTPException(status_code=401, detail="Not allowed to delete this note")

    await db.notes.delete_one({"_id": ObjectId(id)})
    return {"message": "Note deleted successfully"}
