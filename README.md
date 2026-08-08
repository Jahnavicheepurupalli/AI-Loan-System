# AI Smart Loan Eligibility, Recommendation & Document Verification System

An automated full-stack banking portal designed to process loan applications end-to-end. It features real-time eligibility checking, Groq AI loan recommendations, EasyOCR document parsing, live biometric face-recognition matching, metadata-based fraud detection, and automated ReportLab PDF audit reports.

---

## Key Features

1. **AI Recommendations**: Analyzes profiles via the Groq Llama 3 API and suggests loan options with repayment terms, EMIs, and approval probabilities.
2. **OCR Parsing**: Scans Aadhaar and PAN documents, extracting Name, DOB, ID Number, and Gender details dynamically.
3. **Biometric Face Verification**: Compares webcam frame snapshots against Aadhaar Card pictures using facial distance similarity metrics.
4. **EXIF Fraud Scanner**: Scans metadata logs to detect Photoshop/Canva manipulation headers and checks MD5 hashes for duplicate applications.
5. **PDF Exports**: Generates styled PDF files for application receipts, verification audits, and appointment letters.
6. **Bilingual Support**: Instant client-side switching between English and Telugu.
7. **Dark Mode Theme**: Premium theme variables persisted via LocalStorage.

---

## Project Structure

```
├── app.py
├── config.py
├── requirements.txt
├── .env
├── .env.example
├── .gitignore
├── static/
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── main.js
│       └── dashboard.js
├── templates/
│   ├── base.html
│   ├── landing.html
│   ├── login.html
│   ├── register.html
│   ├── forgot_password.html
│   ├── dashboard_user.html
│   ├── dashboard_officer.html
│   └── dashboard_admin.html
├── routes/
│   ├── auth.py
│   └── api.py
├── services/
│   ├── ai_service.py
│   ├── ocr_service.py
│   ├── face_service.py
│   ├── fraud_service.py
│   └── pdf_service.py
├── models/
│   └── db.py
└── middleware/
    └── auth_middleware.py
```

---

## Getting Started

### 1. Prerequisites
Ensure you have **Python 3.8+** installed. If using real OCR features, you can optionally install `Tesseract-OCR` or `EasyOCR`. If C++ bindings fail, the system runs on built-in mock/OpenCV heuristic algorithms seamlessly.

### 2. Set Up Virtual Environment
```bash
# Clone or open the folder
cd FINAL

# Create virtual environment
python -m venv venv

# Activate on Windows
venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Environment Configuration
Create or configure the `.env` file in the root directory:
```env
MONGO_URI=mongodb://localhost:27017/loan_db
GROQ_API_KEY=your_groq_api_key
JWT_SECRET=loan_secret_jwt_key_2026_secure_key
PORT=5000
```

### 5. Running the Application
Ensure MongoDB is running locally (default: port 27017) or configure a remote URI in `.env`.
```bash
python app.py
```
Open your browser and navigate to: `http://localhost:5000`

---

## Seed Accounts (Preloaded on Boot)

Upon startup, the database auto-seeds the following accounts for demonstration purposes:

| Role | Username / Email | Password |
|---|---|---|
| **Customer (User)** | `user@bank.com` | `User@1234` |
| **Credit Officer** | `officer@bank.com` | `Officer@1234` |
| **System Admin** | `admin@bank.com` | `Admin@1234` |
