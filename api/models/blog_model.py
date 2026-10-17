from pydantic import BaseModel, Field
from datetime import datetime, UTC

class CreateBlog(BaseModel):
    title: str = Field(..., min_length=5)
    description: str = Field(..., min_length=8)
    tag: str
    img: str
    author: str | None = None
    published_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC)
    )

class UpdateBlog(BaseModel):
    title: str | None = None
    description: str | None = None
    tag: str | None = None
    img: str | None = None
    author: str | None = None