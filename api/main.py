from fastapi import FastAPI, Depends
from models.user_model import (
    RegisterUser, LoginUser
)
from dependencies.auth import get_current_user
from models.blog_model import (
    CreateBlog, UpdateBlog
)
from models.note_model import (
    CreateNote, UpdateNote
)
from routes.user_route import (
    register_user, login_user
)
from routes.blog_route import (
    create_blog, get_blog, update_blog, get_blogs, delete_blog
)
from routes.note_route import (
    create_note, get_notes, get_note, update_note, delete_note
)
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

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

# ---------------- Users -------------------

# Creating user
@app.post("/user/register")
async def user_creation(user: RegisterUser):
    return await register_user(user)

# Logging user
@app.post("/user/login")
async def user_login(user: LoginUser):
    return await login_user(user)

# Getting a user
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