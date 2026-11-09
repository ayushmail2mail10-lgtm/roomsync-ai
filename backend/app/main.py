from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import engine, Base
from .seed_data import seed_database
from .routes import auth, profiles, matches, expenses, chat, verification, admin, properties, applications

# Initialize database schema
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Modern Indian startup platform for AI roommate matching, fair rent splitting, and verified co-living."
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(profiles.router, prefix=settings.API_V1_STR)
app.include_router(matches.router, prefix=settings.API_V1_STR)
app.include_router(expenses.router, prefix=settings.API_V1_STR)
app.include_router(chat.router, prefix=settings.API_V1_STR)
app.include_router(verification.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(properties.router, prefix=settings.API_V1_STR)
app.include_router(applications.router, prefix=settings.API_V1_STR)


@app.on_event("startup")
def startup_event():
    # Automatically seed realistic Indian demo data on boot
    seed_database()

@app.get("/")
def root():
    return {
        "platform": "RoomSync AI",
        "tagline": "Modern Indian Roommate Matching & Shared Rent Intelligence",
        "status": "operational",
        "docs_url": "/docs",
        "version": settings.VERSION
    }

@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "database": "connected",
        "ai_engine": "ready",
        "upi_gateway": "simulated_ready"
    }
