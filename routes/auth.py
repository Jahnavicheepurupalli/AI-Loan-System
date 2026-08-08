import logging
import re
import secrets
import hashlib
import smtplib
import ssl
from email.mime.text import MIMEText
from datetime import datetime, timedelta

from flask import Blueprint, render_template, request, jsonify, redirect, url_for, session
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from config import Config, db
from models.db import get_user_by_email, create_user, log_audit_trail

logger = logging.getLogger("auth")

auth_bp = Blueprint('auth', __name__)

# Simple in-memory rate limiter: key -> list of epoch timestamps
_RATE_LIMIT_STORE = {}


def _rate_limited(key, limit, window_seconds):
    """Return True if the key has exceeded `limit` attempts within `window_seconds`."""
    now = datetime.utcnow().timestamp()
    hits = _RATE_LIMIT_STORE.get(key, [])
    hits = [t for t in hits if now - t < window_seconds]
    if len(hits) >= limit:
        _RATE_LIMIT_STORE[key] = hits
        return True
    hits.append(now)
    _RATE_LIMIT_STORE[key] = hits
    return False


def validate_password(password):
    """
    Password Rules:
    - Minimum 8 Characters
    - Uppercase, Lowercase, Number, Special Character
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long."
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter."
    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter."
    if not re.search(r"[0-9]", password):
        return False, "Password must contain at least one number."
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False, "Password must contain at least one special character."
    return True, ""


def _hash_reset_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def _send_reset_email(email: str, token: str) -> bool:
    """Send the reset email. Returns True if sent, False if SMTP is not configured."""
    if not Config.SMTP_HOST:
        # Development fallback: surface the link in server logs only.
        logger.warning(
            "SMTP not configured. Password reset link for %s: %s/reset-password?token=%s",
            email, Config.APP_PUBLIC_URL, token,
        )
        return False

    reset_url = f"{Config.APP_PUBLIC_URL}/reset-password?token={token}"
    subject = "AI Smart Loan - Password Reset Request"
    body = (
        "We received a request to reset your password.\n\n"
        f"Use the link below to choose a new password (valid for {Config.RESET_TOKEN_TTL_MINUTES} minutes):\n"
        f"{reset_url}\n\n"
        "If you did not request this, you can safely ignore this email."
    )
    msg = MIMEText(body, _charset="utf-8")
    msg["Subject"] = subject
    msg["From"] = Config.MAIL_FROM
    msg["To"] = email

    try:
        context = ssl.create_default_context()
        with smtplib.SMTP(Config.SMTP_HOST, Config.SMTP_PORT, timeout=10) as server:
            if Config.SMTP_USE_TLS:
                server.starttls(context=context)
            if Config.SMTP_USERNAME:
                server.login(Config.SMTP_USERNAME, Config.SMTP_PASSWORD)
            server.sendmail(Config.MAIL_FROM, [email], msg.as_string())
        return True
    except Exception as e:  # pragma: no cover - SMTP environment dependent
        logger.error("Failed to send reset email to %s: %s", email, e)
        return False


@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'GET':
        return render_template('register.html')

    data = request.get_json() or request.form
    name = (data.get('fullName') or data.get('name') or '').strip()
    email = (data.get('email') or '').strip().lower()
    mobile = (data.get('mobile') or '').strip()
    password = data.get('password', '')
    confirm_password = data.get('confirmPassword') or data.get('confirm_password') or ''
    role = (data.get('role') or 'user').lower()

    if not all([name, email, mobile, password, confirm_password]):
        return jsonify({"success": False, "message": "All fields are required"}), 400

    if password != confirm_password:
        return jsonify({"success": False, "message": "Passwords do not match"}), 400

    is_valid, msg = validate_password(password)
    if not is_valid:
        return jsonify({"success": False, "message": msg}), 400

    if role not in ['user', 'officer', 'admin']:
        return jsonify({"success": False, "message": "Invalid registration role"}), 400

    if db is not None:
        if get_user_by_email(email):
            return jsonify({"success": False, "message": "Email already exists"}), 400

    hashed_password = generate_password_hash(password)
    user_doc = {
        "name": name,
        "email": email,
        "mobile": mobile,
        "password": hashed_password,
        "role": role
    }

    if db is not None:
        created = create_user(user_doc)
        log_audit_trail(str(created["_id"]), "User Registration Successful")
        return jsonify({"success": True, "message": "Registration successful"}), 200
    else:
        logger.warning("Mock Insertion: user registered (DB unavailable).")
        return jsonify({"success": True, "message": "Registration successful (mock)"}), 200


@auth_bp.route('/login', methods=['GET', 'POST'])
def login_view():
    if request.method == 'GET':
        return render_template('login.html')

    data = request.get_json() or request.form
    email = (data.get('email') or '').strip().lower()
    password = data.get('password', '')
    role = (data.get('role') or 'user').lower()
    remember = data.get('remember', False)

    if not email or not password:
        return jsonify({"success": False, "message": "Email and Password are required"}), 400

    if _rate_limited(f"login:{email}", 10, 300):
        return jsonify({"success": False, "message": "Too many attempts. Please try again later."}), 429

    user = None
    if db is not None:
        user = get_user_by_email(email)
    else:
        mocks = {
            "admin@bank.com": {"_id": "000000000000000000000001", "name": "Admin User", "email": "admin@bank.com", "role": "admin", "password": generate_password_hash("Admin@1234")},
            "officer@bank.com": {"_id": "000000000000000000000002", "name": "Officer User", "email": "officer@bank.com", "role": "officer", "password": generate_password_hash("Officer@1234")},
            "user@bank.com": {"_id": "000000000000000000000003", "name": "Demo Customer", "email": "user@bank.com", "role": "user", "password": generate_password_hash("User@1234")},
        }
        user = mocks.get(email)

    if not user or not check_password_hash(user["password"], password):
        return jsonify({"success": False, "message": "Invalid email or password"}), 401

    if user["role"] != role:
        return jsonify({"success": False, "message": f"Selected role does not match account credentials. This account is registered as: {user['role'].upper()}"}), 403

    exp_hours = Config.JWT_EXP_HOURS if remember else 24
    payload = {
        "user_id": str(user["_id"]),
        "role": user["role"],
        "email": user["email"],
        "name": user["name"],
        "exp": datetime.utcnow() + timedelta(hours=exp_hours)
    }

    token = jwt.encode(payload, Config.SECRET_KEY, algorithm=Config.JWT_ALGORITHM)

    session['token'] = token
    session['user_id'] = str(user["_id"])
    session['user_role'] = user["role"]
    session['user_name'] = user["name"]

    if db is not None:
        log_audit_trail(str(user["_id"]), f"Login successful with role: {role}")

    user_obj = {
        "id": str(user["_id"]),
        "fullName": user.get("name", ""),
        "email": user.get("email", ""),
        "role": user.get("role", "user"),
        "theme": user.get("theme", "system"),
        "language": user.get("language", "en")
    }

    redirect_urls = {
        "admin": "/dashboard/admin",
        "officer": "/dashboard/officer",
        "user": "/dashboard/user"
    }

    return jsonify({
        "success": True,
        "message": "Login successful",
        "token": token,
        "user": user_obj,
        "redirect": redirect_urls.get(user_obj.get("role", "user"), "/dashboard/user")
    }), 200


@auth_bp.route('/forgot-password', methods=['GET', 'POST'])
def forgot_password():
    """
    Initiates a password reset. Generates a single-use, time-limited token,
    stores only its hash, and emails the reset link. The email itself is never
    accepted as proof of identity — the token is required to actually reset.
    """
    if request.method == 'GET':
        return render_template('forgot_password.html')

    data = request.get_json() or request.form
    email = (data.get('email') or '').strip().lower()

    if not email:
        return jsonify({"success": False, "message": "Email is required"}), 400

    # Rate limit per email address (protects against enumeration/abuse)
    if _rate_limited(f"forgot:{email}", Config.RESET_RATE_LIMIT, 3600):
        return jsonify({"success": False, "message": "Too many requests. Please try again later."}), 429

    user = None
    if db is not None:
        user = get_user_by_email(email)

    # Always return the same generic message to avoid account enumeration.
    generic = jsonify({"success": True, "message": "If an account with that email exists, a password reset link has been sent."})

    if user:
        token = secrets.token_urlsafe(Config.RESET_TOKEN_BYTES)
        token_hash = _hash_reset_token(token)
        expires_at = datetime.utcnow() + timedelta(minutes=Config.RESET_TOKEN_TTL_MINUTES)
        if db is not None:
            db.password_resets.insert_one({
                "email": email,
                "token_hash": token_hash,
                "expires_at": expires_at.strftime("%Y-%m-%d %H:%M:%S"),
                "used": False,
                "created_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
            })
        _send_reset_email(email, token)

    return generic, 200


@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """
    Completes a password reset using a valid, unexpired, single-use token.
    """
    data = request.get_json() or request.form
    token = (data.get('token') or '').strip()
    new_password = data.get('new_password', '')
    confirm_password = data.get('confirm_password', '')

    if not token:
        return jsonify({"success": False, "message": "Reset token is required"}), 400
    if not new_password or not confirm_password:
        return jsonify({"success": False, "message": "All fields are required"}), 400
    if new_password != confirm_password:
        return jsonify({"success": False, "message": "Passwords do not match"}), 400

    is_valid, msg = validate_password(new_password)
    if not is_valid:
        return jsonify({"success": False, "message": msg}), 400

    if _rate_limited(f"reset:{token}", 5, 3600):
        return jsonify({"success": False, "message": "Too many attempts. Please request a new link."}), 429

    token_hash = _hash_reset_token(token)
    record = None
    if db is not None:
        record = db.password_resets.find_one({"token_hash": token_hash, "used": False})

    if not record:
        return jsonify({"success": False, "message": "Invalid or already used reset token."}), 400

    expires_at = datetime.strptime(record["expires_at"], "%Y-%m-%d %H:%M:%S")
    if expires_at < datetime.utcnow():
        return jsonify({"success": False, "message": "Reset token has expired. Please request a new one."}), 400

    email = record["email"]
    user = None
    if db is not None:
        user = get_user_by_email(email)

    if not user:
        # Token valid but user gone (edge case) -> mark used and reject.
        db.password_resets.update_one({"_id": record["_id"]}, {"$set": {"used": True}})
        return jsonify({"success": False, "message": "Invalid reset token."}), 400

    hashed_password = generate_password_hash(new_password)
    if db is not None:
        db.users.update_one({"_id": user["_id"]}, {"$set": {"password": hashed_password}})
        db.password_resets.update_one({"_id": record["_id"]}, {"$set": {"used": True}})
        log_audit_trail(str(user["_id"]), "Password reset completed via token")

    return jsonify({"success": True, "message": "Password updated successfully. Please log in."}), 200


@auth_bp.route('/logout')
def logout():
    user_id = session.get('user_id')
    if user_id and db is not None:
        log_audit_trail(user_id, "User Logged Out")

    session.clear()
    return redirect('/login')


@auth_bp.route('/google', methods=['POST'])
def google_auth():
    import logging
    logger = logging.getLogger("auth")
    
    data = request.get_json() or {}
    email = (data.get('email') or '').strip().lower()
    name = (data.get('name') or '').strip()
    google_id = data.get('google_id', '')
    selected_role = (data.get('role') or 'user').strip().lower()
    
    # Normalize selected_role
    if selected_role in ['officer', 'loan officer', 'loan_officer']:
        selected_role = 'officer'
    elif selected_role in ['admin', 'system administrator', 'system_administrator', 'administrator']:
        selected_role = 'admin'
    else:
        selected_role = 'user'
    
    logger.warning("[OAUTH RUNTIME] Google OAuth request received. Processing authentication for email: %s, name: %s", email, name)
    
    picture = data.get('picture', '')
    
    if not email:
        logger.error("[OAUTH RUNTIME] Authentication failed: Email is missing.")
        return jsonify({"success": False, "message": "Email is required"}), 400
        
    user = None
    if db is not None:
        user = get_user_by_email(email)
        
    if not user:
        # Auto register Google user
        user_doc = {
            "name": name or "Google User",
            "email": email,
            "mobile": "Google",
            "role": selected_role,
            "google_id": google_id,
            "status": "Active",
            "picture": picture
        }
        if db is not None:
            user = create_user(user_doc)
            log_audit_trail(str(user["_id"]), "Google Sign Up Successful")
    else:
        if db is not None:
            up_fields = {}
            if not user.get("google_id"):
                up_fields["google_id"] = google_id
            if picture:
                up_fields["picture"] = picture
            if up_fields:
                db.users.update_one({"_id": user["_id"]}, {"$set": up_fields})
            
    # Generate JWT using the user's role saved in MongoDB (which might have been updated by admin)
    user_role = user.get("role", "user") if user else selected_role
    exp_hours = Config.JWT_EXP_HOURS
    payload = {
        "user_id": str(user["_id"]) if user else "mock_google_id",
        "role": user_role,
        "email": email,
        "name": name,
        "exp": datetime.utcnow() + timedelta(hours=exp_hours)
    }
    
    token = jwt.encode(payload, Config.SECRET_KEY, algorithm=Config.JWT_ALGORITHM)
    
    session['token'] = token
    session['user_id'] = str(user["_id"]) if user else "mock_google_id"
    session['user_role'] = user_role
    session['user_name'] = name
    session['user_picture'] = user.get("picture", "") if user else ""
    
    logger.warning("[OAUTH RUNTIME] User %s authenticated successfully. Session token, user_id (%s), role (%s), and picture stored.", email, session['user_id'], session['user_role'])
    
    if db is not None and user:
        log_audit_trail(str(user["_id"]), "Google Login successful")
        
    redirect_urls = {
        "admin": "/admin/dashboard",
        "officer": "/officer/dashboard",
        "user": "/dashboard"
    }
    redirect_url = redirect_urls.get(user_role, "/dashboard")

    return jsonify({
        "success": True,
        "token": token,
        "user": {
            "id": str(user["_id"]) if user else "mock_google_id",
            "fullName": name,
            "email": email,
            "role": user_role
        },
        "redirect": redirect_url
    }), 200
