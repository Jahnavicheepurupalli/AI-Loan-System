import os
import sys
from dotenv import load_dotenv
from pymongo import MongoClient

# Load environment variables from .env (never commit real secrets)
load_dotenv()

BASE_DIR = os.path.abspath(os.path.dirname(__file__))


class Config:
    """
    Central application configuration.

    SECURITY: JWT_SECRET has NO default. The application refuses to start if it
    is missing, eliminating the use of a predictable, hard-coded signing key.
    """

    # --- JWT / Session security ---
    SECRET_KEY = os.getenv("JWT_SECRET")  # No fallback by design
    JWT_ALGORITHM = "HS256"
    JWT_EXP_HOURS = int(os.getenv("JWT_EXP_HOURS", "24"))

    # --- Runtime mode ---
    # Debug is OFF unless explicitly enabled for development.
    DEBUG = os.getenv("FLASK_ENV", "production").lower() == "development" or \
        os.getenv("FLASK_DEBUG", "0") == "1"

    # --- Allowed CORS origins (comma separated). Same-origin by default. ---
    CORS_ORIGINS = [
        o.strip()
        for o in os.getenv("CORS_ORIGINS", "http://localhost:5000").split(",")
        if o.strip()
    ]

    # --- Database ---
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/loan_db")

    # --- Google OAuth Credentials ---
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")

    # --- AI ---
    GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

    # --- Networking ---
    PORT = int(os.getenv("PORT", "5000"))
    HOST = os.getenv("HOST", "0.0.0.0")

    # --- File storage (MOVED OUT of /static so files are never web-served) ---
    STORAGE_FOLDER = os.path.join(BASE_DIR, "storage")
    UPLOAD_FOLDER = os.path.join(STORAGE_FOLDER, "uploads")
    REPORT_FOLDER = os.path.join(STORAGE_FOLDER, "reports")

    # Allowed upload extensions (validated again via magic bytes at runtime)
    ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "pdf"}
    MAX_UPLOAD_BYTES = 5 * 1024 * 1024  # 5 MB

    # --- Email / SMTP (used for password reset & notifications) ---
    SMTP_HOST = os.getenv("SMTP_HOST", "")
    SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
    SMTP_USE_TLS = os.getenv("SMTP_USE_TLS", "1") == "1"
    MAIL_FROM = os.getenv("MAIL_FROM", "no-reply@loansmart.example")
    APP_PUBLIC_URL = os.getenv("APP_PUBLIC_URL", "http://localhost:5000")

    # --- Password reset token policy ---
    RESET_TOKEN_BYTES = 32
    RESET_TOKEN_TTL_MINUTES = 30
    # Max reset requests per email per hour
    RESET_RATE_LIMIT = 5


# Ensure storage directories exist (kept outside the static tree)
os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
os.makedirs(Config.REPORT_FOLDER, exist_ok=True)


# Fail fast if the signing secret is missing in production.
if not Config.SECRET_KEY:
    sys.stderr.write(
        "FATAL: JWT_SECRET environment variable is not set. "
        "Refusing to start with an insecure default signing key.\n"
    )
    sys.exit(1)


# Database connection (degrades gracefully but logs clearly)
try:
    mongo_client = MongoClient(Config.MONGO_URI, serverSelectionTimeoutMS=5000)
    # The client connects lazily; verify availability.
    mongo_client.admin.command("ping")
    db = mongo_client.get_default_database()
except Exception as e:  # pragma: no cover - environment dependent
    print(f"Database connection warning: {e}. Running in degraded state.")
    db = None
