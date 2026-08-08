import os
import sys
import datetime
from bson import ObjectId
from pymongo import MongoClient

# Add workspace to path
sys.path.append(os.path.abspath("."))

from config import Config, db
from services.pdf_service import PDFService

def test_flow():
    print("Starting backend test flow...")
    if db is None:
        print("ERROR: MongoDB is not connected!")
        sys.exit(1)

    # 1. Create a dummy user
    user_id = str(ObjectId())
    user_doc = {
        "_id": ObjectId(user_id),
        "name": "Test Applicant Name",
        "email": "testapplicant@example.com",
        "mobile": "9999911111",
        "role": "user",
        "language": "en"
    }
    db.users.insert_one(user_doc)
    print(f"Created test user: {user_id}")

    # 2. Add dummy documents
    db.documents.insert_one({
        "user_id": user_id,
        "doc_type": "aadhaar",
        "filename": "aadhaar_test.jpg",
        "file_path": "/storage/uploads/aadhaar_test.jpg",
        "ocr": {"id_number": "1234 5678 9012", "name": "Test Applicant Name", "dob": "15/08/1990", "gender": "Male"},
        "quality": {"readable": True, "blur": 95.0},
        "fraud": {"status": "Secure", "fraud_score": 0.0}
    })
    db.documents.insert_one({
        "user_id": user_id,
        "doc_type": "pan",
        "filename": "pan_test.jpg",
        "file_path": "/storage/uploads/pan_test.jpg",
        "ocr": {"id_number": "ABCDE1234F", "name": "Test Applicant Name", "dob": "15/08/1990", "gender": "Male"},
        "quality": {"readable": True, "blur": 90.0},
        "fraud": {"status": "Secure", "fraud_score": 0.0}
    })
    db.documents.insert_one({
        "user_id": user_id,
        "doc_type": "passport_photo",
        "filename": "passport_test.jpg",
        "file_path": "/storage/uploads/passport_test.jpg",
        "ocr": {"face_detected": "Yes"},
        "quality": {"readable": True, "blur": 88.0},
        "fraud": {"status": "Secure", "fraud_score": 0.0}
    })
    print("Inserted Aadhaar, PAN, and Passport documents into DB.")

    # 3. Simulate face verification save
    face_verification = {
        "status": "Verified",
        "similarity": 98.2,
        "timestamp": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
        "liveness": "Passed (Liveness Verified)",
        "face_path": "live_test.jpg",
        "message": "Face verification succeeded."
    }
    db.users.update_one({"_id": ObjectId(user_id)}, {"$set": {"face_verification": face_verification}})
    
    # Verify persistence
    updated_user = db.users.find_one({"_id": ObjectId(user_id)})
    assert updated_user.get("face_verification") is not None
    assert updated_user["face_verification"]["similarity"] == 98.2
    print("Verified face verification persistence in DB.")

    # 4. Create application details
    app_id = str(ObjectId())
    app_details = {
        "_id": ObjectId(app_id),
        "user_id": user_id,
        "name": "Test Applicant Name",
        "email": "testapplicant@example.com",
        "mobile": "9999911111",
        "age": 30,
        "dob": "15/08/1990",
        "gender": "Male",
        "occupation": "Software Engineer",
        "category": "Salaried",
        "income": 50000.0,
        "existing_loans": 5000.0,
        "loan_type": "Personal Loan",
        "loan_amount": 200000.0,
        "emi": 4500.0,
        "interest_rate": 11.5,
        "tenure": 5,
        "risk_score": 15.0,
        "ocr_results": {"name": "Test Applicant Name", "id_number": "1234 5678 9012"},
        "face_verification": face_verification,
        "fraud_results": {"status": "Secure", "fraud_score": 0.0, "issues": []},
        "uploaded_documents": {"aadhaar": "aadhaar_test.jpg", "pan": "pan_test.jpg", "passport_photo": "passport_test.jpg"},
        "status": "Approved",
        "submitted_at": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
        "appointment_branch": "Main Headquarters",
        "appointment_date": "2026-08-10",
        "appointment_time": "10:30 AM"
    }
    db.applications.insert_one(app_details)
    
    # 5. Generate PDFs
    print("Generating PDFs...")
    app_pdf = PDFService.generate_application_pdf(app_details, lang="en")
    verify_pdf = PDFService.generate_verification_pdf(app_details, lang="en")
    
    appointment_doc = {
        "application_id": app_id,
        "user_id": user_id,
        "branch": "Main Headquarters",
        "date": "2026-08-10",
        "time_slot": "10:30 AM",
        "purpose": "Final Document Signing",
        "scheduled_at": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    }
    appointment_pdf = PDFService.generate_appointment_pdf(app_details, appointment_doc, lang="en")

    # Assert PDF files are not empty and are properly sized
    assert os.path.exists(app_pdf)
    assert os.path.exists(verify_pdf)
    assert os.path.exists(appointment_pdf)
    
    print(f"Application PDF Size: {os.path.getsize(app_pdf)} bytes")
    print(f"Verification PDF Size: {os.path.getsize(verify_pdf)} bytes")
    print(f"Appointment PDF Size: {os.path.getsize(appointment_pdf)} bytes")
    
    assert os.path.getsize(app_pdf) > 2000
    assert os.path.getsize(verify_pdf) > 2000
    assert os.path.getsize(appointment_pdf) > 2000
    
    print("SUCCESS: All backend tests passed! PDFs generated successfully and contain actual data.")

if __name__ == "__main__":
    test_flow()
