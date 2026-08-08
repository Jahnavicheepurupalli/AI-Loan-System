from werkzeug.security import generate_password_hash
from config import db
import datetime

# Reference database helper to check if DB is initialized.
# We will seed default users, loans, and loan_rules if empty.

def seed_database():
    if db is None:
        print("MongoDB is not connected. Skipping seeding.")
        return
        
    try:
        # 1. Seed Users
        if db.users.count_documents({}) == 0:
            print("Seeding default users...")
            default_users = [
                {
                    "name": "System Administrator",
                    "email": "admin@bank.com",
                    "mobile": "9999999999",
                    "password": generate_password_hash("Admin@1234"),
                    "role": "admin",
                    "created_at": datetime.datetime.utcnow(),
                    "status": "Active"
                },
                {
                    "name": "Loan Officer John",
                    "email": "officer@bank.com",
                    "mobile": "8888888888",
                    "password": generate_password_hash("Officer@1234"),
                    "role": "officer",
                    "created_at": datetime.datetime.utcnow(),
                    "status": "Active"
                },
                {
                    "name": "Demo Customer",
                    "email": "user@bank.com",
                    "mobile": "7777777777",
                    "password": generate_password_hash("User@1234"),
                    "role": "user",
                    "created_at": datetime.datetime.utcnow(),
                    "status": "Active"
                }
            ]
            db.users.insert_many(default_users)
            print("Default users seeded successfully (admin@bank.com / Admin@1234, officer@bank.com / Officer@1234).")

        # 2. Seed Loan Rules
        # 2. Seed & Upsert Loan Rules
        print("Upserting loan rules...")
        default_rules = [
            {
                "loan_type": "Personal Loan",
                "interest_rate": 11.5,
                "min_income": 25000,
                "min_age": 21,
                "max_age": 60,
                "max_amount": 1500000,
                "processing_fee": 1.5,
                "required_docs": ["Aadhaar Card", "PAN Card", "Salary Slip"]
            },
            {
                "loan_type": "Education Loan",
                "interest_rate": 7.5,
                "min_income": 15000,
                "min_age": 18,
                "max_age": 35,
                "max_amount": 4000000,
                "processing_fee": 0.5,
                "required_docs": ["Aadhaar Card", "PAN Card", "College ID", "Bonafide"]
            },
            {
                "loan_type": "Home Loan",
                "interest_rate": 8.4,
                "min_income": 40000,
                "min_age": 24,
                "max_age": 65,
                "max_amount": 20000000,
                "processing_fee": 1.0,
                "required_docs": ["Aadhaar Card", "PAN Card", "Bank Statement", "Business Proof"]
            },
            {
                "loan_type": "Vehicle Loan",
                "interest_rate": 9.2,
                "min_income": 20000,
                "min_age": 18,
                "max_age": 60,
                "max_amount": 2500000,
                "processing_fee": 1.2,
                "required_docs": ["Aadhaar Card", "PAN Card", "Salary Slip", "Bank Statement"]
            },
            {
                "loan_type": "Business Loan",
                "interest_rate": 12.0,
                "min_income": 50000,
                "min_age": 25,
                "max_age": 65,
                "max_amount": 10000000,
                "processing_fee": 2.0,
                "required_docs": ["Aadhaar Card", "PAN Card", "Business Proof", "Income Proof"]
            },
            {
                "loan_type": "Agriculture Loan",
                "interest_rate": 6.0,
                "min_income": 10000,
                "min_age": 18,
                "max_age": 70,
                "max_amount": 3000000,
                "processing_fee": 0.0,
                "required_docs": ["Aadhaar Card", "PAN Card", "Land Records", "Agriculture Income"]
            },
            {
                "loan_type": "Gold Loan",
                "interest_rate": 8.0,
                "min_income": 5000,
                "min_age": 18,
                "max_age": 75,
                "max_amount": 5000000,
                "processing_fee": 0.5,
                "required_docs": ["Aadhaar Card", "PAN Card"]
            },
            {
                "loan_type": "Women Entrepreneur Loan",
                "interest_rate": 6.5,
                "min_income": 15000,
                "min_age": 18,
                "max_age": 65,
                "max_amount": 5000000,
                "processing_fee": 0.25,
                "required_docs": ["Aadhaar Card", "PAN Card", "Business Proof"]
            },
            {
                "loan_type": "Small Business Loan",
                "interest_rate": 9.5,
                "min_income": 20000,
                "min_age": 21,
                "max_age": 65,
                "max_amount": 3000000,
                "processing_fee": 1.0,
                "required_docs": ["Aadhaar Card", "PAN Card", "Business Proof", "GST Certificate"]
            },
            {
                "loan_type": "Medical Emergency Loan",
                "interest_rate": 8.0,
                "min_income": 12000,
                "min_age": 18,
                "max_age": 70,
                "max_amount": 1000000,
                "processing_fee": 0.0,
                "required_docs": ["Aadhaar Card", "PAN Card", "Hospital Estimate", "Income Proof"]
            }
        ]
        for rule in default_rules:
            db.loan_rules.update_one({"loan_type": rule["loan_type"]}, {"$set": rule}, upsert=True)
        print("Loan rules upserted successfully.")
            
    except Exception as e:
        print(f"Error seeding database: {e}")

# Helper functions to query DB safely
def get_user_by_email(email):
    if db is None: return None
    return db.users.find_one({"email": email})

def create_user(user_data):
    if db is None: return None
    user_data["created_at"] = datetime.datetime.utcnow()
    user_data["status"] = "Active"
    res = db.users.insert_one(user_data)
    user_data["_id"] = res.inserted_id
    return user_data

def log_audit_trail(user_id, action, ip_address="Localhost"):
    if db is None: return
    log = {
        "user_id": user_id,
        "action": action,
        "ip_address": ip_address,
        "timestamp": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    }
    db.audit_logs.insert_one(log)
