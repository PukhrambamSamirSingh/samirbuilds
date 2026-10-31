from models.note_model import CreateNote, UpdateNote
from dependencies.auth import get_current_user
from db import db
from fastapi import HTTPException, status, Depends
from typing import Annotated
from bson import ObjectId
from slugify import slugify
import re

# Stop words list for natural language & technical note filtering
STOP_WORDS = {
    "the", "a", "an", "is", "are", "was", "were", "and", "or", "in", "on", "at", 
    "to", "for", "with", "about", "between", "into", "through", "during", "before", 
    "after", "above", "below", "from", "up", "down", "of", "off", "over", "under", 
    "then", "here", "there", "when", "where", "why", "how", "all", "any", "both", 
    "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", 
    "only", "own", "same", "so", "than", "too", "very", "can", "will", "just", 
    "should", "now", "it", "its", "this", "that", "these", "those", "what", "which",
    "who", "whom", "whose", "does", "did", "doing", "have", "has", "had", "having",
    "would", "could", "been", "being", "part", "note", "article", "read"
}

def extract_keywords(text: str, max_words: int = 10) -> list[str]:
    if not text:
        return []
    cleaned = re.sub(r'```[\s\S]*?```', ' ', text)
    cleaned = re.sub(r'[^a-zA-Z0-9\s-]', ' ', cleaned)
    tokens = [w.lower().strip() for w in cleaned.split() if len(w.strip()) >= 3]
    meaningful = [w for w in tokens if w not in STOP_WORDS]
    frequency = {}
    for w in meaningful:
        frequency[w] = frequency.get(w, 0) + 1
    sorted_keywords = sorted(frequency.keys(), key=lambda w: frequency[w], reverse=True)
    return sorted_keywords[:max_words]


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


# Get related notes via MongoDB Aggregation Pipeline --------------------------

async def get_related_notes(slug: str, limit: int = 24):
    try:
        slug_clean = slug.strip().lower()
        # 1. Retrieve the base note
        note = await db.notes.find_one({"$or": [{"slug": slug_clean}, {"slug": slug}]})
        if not note and ObjectId.is_valid(slug):
            note = await db.notes.find_one({"_id": ObjectId(slug)})

        if not note:
            # Fallback to latest notes if current note is not found
            fallback_notes = await db.notes.find({}).sort("published_at", -1).to_list(length=limit)
            for n in fallback_notes:
                n["_id"] = str(n["_id"])
                if "author" in n and n["author"] is not None:
                    n["author"] = str(n["author"])
            return fallback_notes

        note_id = note["_id"]
        note_tag = (note.get("tag") or "").strip().lower()
        title_keywords = extract_keywords(note.get("title", ""), max_words=8)
        content_keywords = extract_keywords(note.get("content", ""), max_words=12)

        # 2. Build MongoDB scoring expressions
        score_expressions = []

        # Tag exact match weight (15 points)
        if note_tag:
            score_expressions.append({
                "$cond": [
                    {"$eq": [{"$toLower": {"$ifNull": ["$tag", ""]}}, note_tag]},
                    15,
                    0
                ]
            })

        # Title keyword matches (5 points each)
        for kw in title_keywords:
            safe_kw = re.escape(kw)
            score_expressions.append({
                "$cond": [
                    {"$regexMatch": {"input": {"$ifNull": ["$title", ""]}, "regex": safe_kw, "options": "i"}},
                    5,
                    0
                ]
            })

        # Content keyword matches (2 points each)
        for kw in content_keywords[:8]:
            safe_kw = re.escape(kw)
            score_expressions.append({
                "$cond": [
                    {"$regexMatch": {"input": {"$ifNull": ["$content", ""]}, "regex": safe_kw, "options": "i"}},
                    2,
                    0
                ]
            })

        pipeline = [
            # Exclude current note
            {"$match": {"_id": {"$ne": note_id}}},
            # Calculate total relevance score
            {
                "$addFields": {
                    "relevance_score": {
                        "$add": score_expressions if score_expressions else [0]
                    }
                }
            },
            # Sort by relevance score descending, then publication date
            {"$sort": {"relevance_score": -1, "published_at": -1, "_id": -1}},
            {"$limit": limit}
        ]

        related_notes = await db.notes.aggregate(pipeline).to_list(length=limit)

        for n in related_notes:
            n["_id"] = str(n["_id"])
            if "author" in n and n["author"] is not None:
                n["author"] = str(n["author"])

        return related_notes

    except Exception as e:
        print("Error fetching related notes:", e)
        # Resilient fallback
        try:
            fallback = await db.notes.find({}).sort("published_at", -1).to_list(length=limit)
            results = []
            for n in fallback:
                if str(n.get("slug", "")).lower() != slug.lower() and str(n.get("_id", "")) != slug:
                    n["_id"] = str(n["_id"])
                    if "author" in n and n["author"] is not None:
                        n["author"] = str(n["author"])
                    results.append(n)
            return results
        except Exception:
            return []


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

        user_id_str = str(current_user["_id"])
        user_email = str(current_user.get("email", "")).lower()
        full_name = f"{current_user.get('first_name', '')} {current_user.get('last_name', '')}".strip().lower()
        author_str = str(existing.get("author", ""))

        is_author = (
            author_str == user_id_str or
            author_str.lower() == user_email or
            (full_name and author_str.lower() == full_name)
        )

        if not is_author:
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
        user_email = str(current_user.get("email", "")).lower()
        full_name = f"{current_user.get('first_name', '')} {current_user.get('last_name', '')}".strip().lower()
        author_str = str(existing.get("author", ""))

        is_author = (
            author_str == user_id_str or
            author_str.lower() == user_email or
            (full_name and author_str.lower() == full_name)
        )

        if not is_author:
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
