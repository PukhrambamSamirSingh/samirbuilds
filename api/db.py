import os
import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("MONGODB_URI") or "mongodb://localhost:27017"
DB_NAME = os.getenv("DB_NAME", "samirbuilds")

# Pass certifi CA bundle when connecting to mongodb+srv to ensure SSL validation on Windows
client_kwargs = {
    "serverSelectionTimeoutMS": 10000,
}

if "mongodb+srv" in DATABASE_URL or "ssl=true" in DATABASE_URL.lower():
    client_kwargs["tlsCAFile"] = certifi.where()

client = AsyncIOMotorClient(DATABASE_URL, **client_kwargs)

db = client[DB_NAME]