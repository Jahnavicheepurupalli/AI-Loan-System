import logging
import hashlib
import os

logger = logging.getLogger("fraud")

# Guard heavy imaging libs
CV2_AVAILABLE = False
NP_AVAILABLE = False
try:
    import cv2
    CV2_AVAILABLE = True
except Exception:
    cv2 = None

try:
    import numpy as np
    NP_AVAILABLE = True
except Exception:
    np = None


class FraudService:
    @staticmethod
    def calculate_file_hash(file_path):
        """Calculates SHA-256 hash of a file to detect duplicate submissions."""
        hash_sha = hashlib.sha256()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(8192), b""):
                hash_sha.update(chunk)
        return hash_sha.hexdigest()

    @staticmethod
    def check_metadata_tampering(file_path):
        """
        Inspects raw file bytes for signatures of common image editors
        (Photoshop, GIMP, Canva, PicsArt, Pixlr).
        """
        tampering_software = [b"photoshop", b"adobe", b"gimp", b"canva", b"picsart", b"pixlr", b"spliced", b"edited"]
        detected = []
        try:
            with open(file_path, 'rb') as f:
                content = f.read().lower()
                for software in tampering_software:
                    if software in content:
                        detected.append(software.decode('utf-8'))
        except Exception as e:
            logger.error("Error reading file metadata: %s", e)
        return detected

    @staticmethod
    def detect_splicing_anomalies(file_path):
        """
        Analyzes the image for splicing anomalies using edge-density analysis.
        """
        if not CV2_AVAILABLE or not NP_AVAILABLE:
            return {"is_spliced": False, "score": 0.1}
        try:
            img = cv2.imread(file_path)
            if img is None:
                return {"is_spliced": False, "score": 0.0}

            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            edges = cv2.Canny(gray, 50, 150)

            h, w = edges.shape
            grid_h, grid_w = max(1, h // 4), max(1, w // 4)
            edge_densities = []
            for i in range(4):
                for j in range(4):
                    cell = edges[i * grid_h:(i + 1) * grid_h, j * grid_w:(j + 1) * grid_w]
                    edge_densities.append(float(np.mean(cell)))

            max_dense = max(edge_densities)
            min_dense = min(edge_densities) + 0.1
            ratio = max_dense / min_dense

            is_spliced = ratio > 150.0
            return {"is_spliced": bool(is_spliced), "score": round(min(1.0, ratio / 300.0), 3)}
        except Exception as e:
            logger.error("Splicing detection error: %s", e)
            return {"is_spliced": False, "score": 0.1}

    @staticmethod
    def analyze_document_fraud(file_path, doc_type, ocr_results, db_connection=None, user_id=None):
        """
        Compiles all fraud detection modules:
        1. Duplicate file hash validation against other applications/documents (excluding self/retries).
        2. EXIF/editor metadata tampering scan.
        3. Local edge splicing checks.
        4. OCR keyword check (wrong document upload).
        """
        issues = []
        status = "No issue detected"
        score = 0.0

        # 1. File Hash Check (duplicate detection across documents)
        file_hash = FraudService.calculate_file_hash(file_path)
        if db_connection is not None:
            try:
                query = {"fraud.file_hash": file_hash}
                if user_id:
                    query["user_id"] = {"$ne": user_id}
                duplicate = db_connection.documents.find_one(query)
                if duplicate:
                    issues.append("Possible duplicate: This exact file has already been uploaded by another user.")
                    score += 0.8
                    status = "Possible duplicate"
            except Exception as e:
                logger.error("Database duplicate scan failed: %s", e)

        # 2. Metadata Tampering Scan
        tampered_tools = FraudService.check_metadata_tampering(file_path)
        if tampered_tools:
            issues.append(f"Low confidence warning: File metadata contains editor signatures ({', '.join(tampered_tools)}).")
            score += 0.2

        # 3. Splicing Edge Scanner
        splicing_res = FraudService.detect_splicing_anomalies(file_path)
        if splicing_res.get("is_spliced", False) and splicing_res.get("score", 0) > 0.8:
            issues.append("Manual review required: High edge density variance indicating possible content manipulation.")
            score += 0.3

        # 4. OCR Keyword Check (Wrong Document Upload)
        raw_text = (ocr_results.get("raw_text", "") or "").upper()
        norm_type = doc_type.strip().lower().replace(" ", "_").replace("-", "_")
        if "aadhaar" in norm_type:
            keywords = ["GOVERNMENT OF INDIA", "UNIQUE IDENTIFICATION", "AADHAAR", "HELP@UIDAI"]
            matches = sum(1 for kw in keywords if kw in raw_text)
            if matches == 0 and len(raw_text) > 50:
                issues.append("Wrong Document: Expected Aadhaar Card, but document structure did not match UIDAI standards.")
                score += 0.6
        elif "pan" in norm_type:
            keywords = ["INCOME TAX", "DEPARTMENT", "PERMANENT ACCOUNT NUMBER", "CARD"]
            matches = sum(1 for kw in keywords if kw in raw_text)
            if matches == 0 and len(raw_text) > 50:
                issues.append("Wrong Document: Expected PAN Card, but document structure did not match Income Tax Dept standards.")
                score += 0.6

        # Determine status
        score = min(1.0, score)
        if status != "Possible duplicate":
            if score >= 0.7 and len(issues) >= 2:
                status = "Manual review required"
            elif score >= 0.3:
                status = "Low confidence warning"
            elif len(issues) > 0:
                status = "Low confidence warning"
            else:
                status = "No issue detected"

        if not issues:
            issues.append("Security scan completed. No major issue detected.")

        return {
            "status": status,
            "fraud_score": round(score * 100, 2),
            "issues": issues,
            "file_hash": file_hash,
        }
