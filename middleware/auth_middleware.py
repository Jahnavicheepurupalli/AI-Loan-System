import logging
from functools import wraps
from flask import request, jsonify, redirect, url_for, session
import jwt
from config import Config, db
from bson import ObjectId

logger = logging.getLogger("auth_middleware")


def token_required(allowed_roles=None):
    """
    Decorator to protect routes and ensure JWT validation.
    Supports role checking ('user', 'officer', 'admin').
    Accepts the token from the session cookie OR the Authorization Bearer header.
    """
    if allowed_roles is None:
        allowed_roles = []

    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            token = None

            # 1. Retrieve token from Cookies (Session) or Authorization Header
            token_source = "header"
            if 'token' in session:
                token = session['token']
                token_source = "session"
            elif 'Authorization' in request.headers:
                auth_header = request.headers['Authorization']
                if auth_header.startswith("Bearer "):
                    token = auth_header.split(" ", 1)[1]
                else:
                    return jsonify({"error": "Invalid Authorization header format"}), 401

            # CSRF protection: if the credentials are cookie-based, enforce custom header X-CSRF-Token
            if token_source == "session" and request.method in ("POST", "PUT", "DELETE", "PATCH"):
                csrf_token = request.headers.get("X-CSRF-Token")
                if not csrf_token or csrf_token != token:
                    return jsonify({"error": "CSRF verification failed: security token mismatch or missing X-CSRF-Token header."}), 403

            if not token:
                if request.path.startswith("/api/"):
                    return jsonify({"error": "Access Denied: Missing Authentication Token"}), 401
                return redirect(url_for('login_page'))

            try:
                # 2. Decode and validate the token
                data = jwt.decode(
                    token,
                    Config.SECRET_KEY,
                    algorithms=[Config.JWT_ALGORITHM],
                )
                user_id = data.get("user_id")
                role = data.get("role")

                if not user_id or not role:
                    raise ValueError("Token missing required claims")

                # Fetch user details from DB
                current_user = None
                if db is not None:
                    current_user = db.users.find_one({"_id": ObjectId(user_id)})
                else:
                    current_user = {
                        "_id": ObjectId(user_id),
                        "name": data.get("name"),
                        "email": data.get("email"),
                        "role": role,
                        "status": "Active",
                    }

                if not current_user:
                    raise Exception("User not found")

                if current_user.get("status") != "Active":
                    raise Exception("User account deactivated")

                # 3. Check role access
                if allowed_roles and role not in allowed_roles:
                    if request.path.startswith("/api/"):
                        return jsonify({"error": "403 Unauthorized"}), 403
                    return "403 Unauthorized", 403

            except jwt.ExpiredSignatureError:
                session.pop('token', None)
                if request.path.startswith("/api/"):
                    return jsonify({"error": "Session Expired: Please login again"}), 401
                return redirect(url_for('login_page', expired="1"))
            except jwt.InvalidTokenError as e:
                logger.warning("Invalid JWT presented: %s", e)
                session.pop('token', None)
                if request.path.startswith("/api/"):
                    return jsonify({"error": "Invalid Session"}), 401
                return redirect(url_for('login_page'))
            except Exception as e:
                logger.warning("Auth failure: %s", e)
                session.pop('token', None)
                if request.path.startswith("/api/"):
                    return jsonify({"error": f"Invalid Session: {str(e)}"}), 401
                return redirect(url_for('login_page'))

            # Attach current_user to request for route handlers
            request.user = current_user
            return f(*args, **kwargs)

        return decorated

    return decorator
