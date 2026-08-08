import os
import sys
from flask import Flask, render_template, redirect, url_for, session, jsonify, request
from config import Config
from models.db import seed_database
from routes.auth import auth_bp
from routes.api import api_bp
from middleware.auth_middleware import token_required
from flask_cors import CORS

app = Flask(__name__)
app.config.from_object(Config)
print(f"[RUNTIME CONFIG] GOOGLE_CLIENT_ID loaded: {Config.GOOGLE_CLIENT_ID[:15]}..." if Config.GOOGLE_CLIENT_ID else "[RUNTIME CONFIG] WARNING: GOOGLE_CLIENT_ID is empty!")

# Configure JWT Secret (already validated to exist by config.py)
app.secret_key = Config.SECRET_KEY

# Restrict CORS to known origins only (never wildcard in production)
CORS(app, resources={r"/api/*": {"origins": Config.CORS_ORIGINS}})

# Register Blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(api_bp, url_prefix='/api')


# ---- Security headers (defense in depth) ----
@app.after_request
def apply_security_headers(resp):
    resp.headers["X-Content-Type-Options"] = "nosniff"
    resp.headers["X-Frame-Options"] = "DENY"
    resp.headers["Referrer-Policy"] = "no-referrer"
    resp.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "img-src 'self' data: https://*.googleusercontent.com; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com https://accounts.google.com; "
        "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; "
        "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://accounts.google.com; "
        "frame-src 'self' https://accounts.google.com; "
        "connect-src 'self' https://accounts.google.com https://oauth2.googleapis.com https://www.googleapis.com"
    )
    resp.headers["Permissions-Policy"] = "camera=(self), microphone=(self), geolocation=(self)"
    if not Config.DEBUG:
        resp.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return resp


# Provide simple page routes for legacy template paths (/register, /login)
@app.route('/register')
def register_page():
    return render_template('register.html')


@app.route('/login')
def login_page():
    return render_template('login.html', google_client_id=Config.GOOGLE_CLIENT_ID)


@app.route('/logout')
def logout_redirect():
    return redirect('/api/auth/logout')


# Password reset pages
@app.route('/forgot-password')
def forgot_password_page():
    return render_template('forgot_password.html')


@app.route('/reset-password')
def reset_password_page():
    token = request.args.get('token', '')
    return render_template('reset_password.html', token=token)


# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"success": True, "message": "Backend connected successfully"}), 200


# Run database seeder on startup
seed_database()


# ----------------- VIEW ROUTES -----------------

@app.route('/')
def landing():
    """Renders main professional banking landing page."""
    if 'token' in session and 'user_role' in session:
        return redirect(f"/dashboard/{session['user_role']}")
    return render_template('landing.html')


@app.route('/oauth-callback')
def oauth_callback():
    return render_template('oauth_callback.html')


@app.route('/dashboard')
@token_required(allowed_roles=['user', 'officer', 'admin'])
def dashboard_redirect():
    role = session.get('user_role', 'user')
    if role == 'admin':
        return redirect('/admin/dashboard')
    elif role == 'officer':
        return redirect('/officer/dashboard')
    return redirect('/dashboard/user')


@app.route('/dashboard/user')
@token_required(allowed_roles=['user'])
def user_dashboard():
    return render_template('dashboard_user.html')


@app.route('/officer/dashboard')
@app.route('/dashboard/officer')
@token_required(allowed_roles=['officer'])
def officer_dashboard():
    return render_template('dashboard_officer.html')


@app.route('/admin/dashboard')
@app.route('/dashboard/admin')
@token_required(allowed_roles=['admin'])
def admin_dashboard():
    return render_template('dashboard_admin.html')


# ----------------- GLOBAL ERROR HANDLERS -----------------

@app.errorhandler(404)
def page_not_found(e):
    if request.path.startswith('/api/'):
        return jsonify({"success": False, "error": "API route not found"}), 404
    return render_template('landing.html', error="404: Page not found"), 404


@app.errorhandler(Exception)
def handle_exception(e):
    from werkzeug.exceptions import HTTPException
    if isinstance(e, HTTPException):
        if request.path.startswith('/api/'):
            return jsonify({"success": False, "error": e.description}), e.code
        return e

    import traceback
    traceback.print_exc()

    error_msg = str(e)
    return jsonify({"success": False, "error": "Internal Server Error"}), 500


if __name__ == '__main__':
    print(f"Starting Loan Verification System on port {Config.PORT} "
          f"(debug={Config.DEBUG})...")
    app.run(host=Config.HOST, port=Config.PORT, debug=Config.DEBUG)
