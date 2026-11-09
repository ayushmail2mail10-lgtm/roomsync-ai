import os

class Settings:
    PROJECT_NAME: str = "RoomSync AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "roomsync-super-secret-jwt-key-2026-ind-bangalore")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Defaults to local SQLite, but seamlessly switches to PostgreSQL if DATABASE_URL is set
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./roomsync.db")

    # Environment & Production Admin Security
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "")

settings = Settings()
