from pydantic import BaseModel, Field
from datetime import datetime, UTC
from typing import Optional

class CreateNote(BaseModel):
    title: str = Field(..., min_length=3)
    content: str = Field(..., min_length=10)
    tag: str = Field(default="general")
    published_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC)
    )
    slug: Optional[str] = None

class UpdateNote(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    tag: Optional[str] = None
    slug: Optional[str] = None
