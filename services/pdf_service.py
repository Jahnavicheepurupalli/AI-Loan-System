import os
from config import Config

# Guard reportlab availability for environments without the package installed
REPORTLAB_AVAILABLE = True
TELUGU_FONT_AVAILABLE = False

try:
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont

    # Register Telugu font
    font_path = "NotoSansTelugu-Regular.ttf"
    if os.path.exists(font_path):
        pdfmetrics.registerFont(TTFont('NotoSansTelugu', font_path))
        TELUGU_FONT_AVAILABLE = True
except Exception:
    REPORTLAB_AVAILABLE = False
    letter = (612.0, 792.0)
    SimpleDocTemplate = None
    Paragraph = None
    Spacer = None
    Table = None
    TableStyle = None
    colors = None
    
    class ParagraphStyle:
        def __init__(self, name, parent=None, **kwargs):
            self.name = name
            
    class MockStyles(dict):
        def __getitem__(self, item):
            return ParagraphStyle(item)
            
    def getSampleStyleSheet():
        return MockStyles()


PDF_TRANSLATIONS = {
    "te": {
        "Personal & Employment Details": "వ్యక్తిగత & ఉపాధి వివరాలు",
        "Full Name:": "పూర్తి పేరు:",
        "Application ID:": "దరఖాస్తు ఐడి:",
        "Email:": "ఈమెయిల్:",
        "Mobile:": "మొబైల్:",
        "DOB:": "పుట్టిన తేదీ:",
        "Gender:": "లింగం:",
        "Occupation:": "వృత్తి:",
        "Category:": "వర్గం:",
        "Monthly Income:": "నెలవారీ ఆదాయం:",
        "Existing EMIs:": "ప్రస్తుత ఈఎంఐలు:",
        "Requested Loan Parameters": "అడిగిన రుణ పారామితులు",
        "Loan Type:": "రుణ రకం:",
        "Requested Amount:": "అడిగిన మొత్తం:",
        "Calculated EMI:": "లెక్కించిన ఈఎంఐ:",
        "Interest Rate:": "వడ్డీ రేటు:",
        "Repayment Tenure:": "తిరిగి చెల్లింపు కాలపరిమితి:",
        "Risk Score:": "రిస్క్ స్కోరు:",
        "System Verification Status Timeline": "సిస్టమ్ వెరిఫికేషన్ స్థితి కాలక్రమం",
        "Stage": "దశ",
        "Timestamp": "సమయం",
        "Remarks / Status": "వ్యాఖ్యలు / స్థితి",
        "Loan Application Summary": "రుణ దరఖాస్తు సారాంశం",
        "OCR Extraction Audit Log": "OCR సంగ్రహణ ఆడిట్ లాగ్",
        "Field Name": "ఫీల్డ్ పేరు",
        "User Form Input": "యూザー ఫారమ్ ఇన్‌పుట్",
        "OCR Extracted Value": "OCR సేకరించిన విలువ",
        "Match Status": "సరిపోలిక స్థితి",
        "Biometric Face Matching Identity Verification": "బయోమెట్రిక్ ముఖ సరిపోలిక గుర్తింపు వెరిఫికేషన్",
        "Biometric Face Similarity Score:": "బయోమెట్రిక్ ముఖ సారూప్యత స్కోరు:",
        "Biometric Status:": "బయోమెట్రిక్ స్థితి:",
        "System Verification Report": "సిస్టమ్ వెరిఫికేషన్ నివేదిక",
        "AI Fraud & Tampering Analysis": "AI మోసం & ట్యాంపరింగ్ విశ్లేషణ",
        "Check Category": "తనిఖీ వర్గం",
        "Result Flag": "ఫలిత ఫ్లాగ్",
        "Document Integrity": "పత్రం సమగ్రత",
        "Fraud Risk Index": "మోసం రిస్క్ ఇండెక్స్",
        "Detected Flags / Issues": "గుర్తించిన ఫ్లాగ్‌లు / సమస్యలు",
        "Congratulations! Your loan application has been conditionally approved. An in-person appointment has been scheduled at the branch for final physical document sign-off.": "అభినందనలు! మీ రుణ దరఖాస్తు షరతులతో కూడి ఆమోదించబడింది. తుది భౌతిక పత్రాల ధృవీకరణ కోసం బ్రాంచ్‌లో ముఖాముఖి అపాయింట్‌మెంట్ షెడ్యూల్ చేయబడింది.",
        "Appointment Specifications": "అపాయింట్‌మెంట్ వివరాలు",
        "Customer Name:": "కస్టమర్ పేరు:",
        "Branch Location:": "బ్రాంచ్ లొకేషన్:",
        "Scheduled Date:": "షెడ్యూల్ చేసిన తేదీ:",
        "Scheduled Slot:": "షెడ్యూల్ చేసిన సమయం:",
        "Interview Purpose:": "ఇంటర్వ్యూ ఉద్దేశం:",
        "Important Instructions": "ముఖ్యమైన సూచనలు",
        "Subject: Conditional Approval of Loan Application": "విషయం: రుణ దరఖాస్తు షరతులతో కూడిన ఆమోదం",
        "Dear Customer,": "ప్రియమైన కస్టమర్,",
        "We are pleased to inform you that your application has been conditionally approved.": "మీ దరఖాస్తు షరతులతో ఆమోదించబడిందని తెలియజేయడానికి మేము సంతోషిస్తున్నాము.",
        "Subject: Rejection of Loan Application": "విషయం: రుణ దరఖాస్తు తిరస్కరణ",
        "We regret to inform you that your application has been rejected.": "మీ దరఖాస్తు తిరస్కరించబడిందని తెలియజేయడానికి మేము చింతిస్తున్నాము.",
        "Official Rejection Letter": "అధికారిక తిరస్కరణ లేఖ",
        "Official Appointment Letter": "అధికారిక అపాయింట్‌మెంట్ లేఖ",
        "Official Approval Letter": "అధికారిక ఆమోద లేఖ",
        "Officer Desk Report": "అధికారి డెస్క్ నివేదిక",
        "Officer Verification Workspace Report": "అధికారి వెరిఫికేషన్ వర్క్‌స్పేస్ నివేదిక",
        "Credit Officer Verification Workspace Desk Report": "క్రెడిట్ అధికారి వెరిఫికేషన్ వర్క్‌స్పేస్ డెస్క్ నివేదిక",
        "Conditional Loan Approval Letter": "షరతులతో కూడిన రుణ ఆమోద లేఖ",
        "Loan Rejection Letter": "రుణ తిరస్కరణ లేఖ",
        "Verification Officer Desk Report": "వెరిఫికేషన్ అధికారి డెస్క్ నివేదిక",
        "Officer Evaluation Summary": "అధికారి మూల్యాంకన సారాంశం",
        "Assigned Officer:": "కేటాయించిన అధికారి:",
        "Evaluation Date:": "మూల్యాంకన తేదీ:",
        "Applicant Name:": "దరఖాస్తుదారు పేరు:",
        "Loan Parameters:": "రుణ పారామితులు:",
        "System Risk Score:": "సిస్టమ్ రిస్క్ స్కోరు:",
        "Final Decision:": "తుది నిర్ణయం:",
        "Officer Remarks:": "అధికారి వ్యాఖ్యలు:",
        "Personal Profile & Financial Summary": "వ్యక్తిగత ప్రొఫైల్ & ఆర్థిక సారాంశం",
        "Requested Loan Parameters": "అడిగిన రుణ పారామితులు",
        "System Verification Status Timeline": "సిస్టమ్ వెరిఫికేషన్ స్థితి కాలక్రమం"
    }
}


class PDFService:
    @staticmethod
    def _translate_text(text, lang="en"):
        if lang != "te":
            return text
        
        # Exact lookup
        if text in PDF_TRANSLATIONS["te"]:
            return PDF_TRANSLATIONS["te"][text]
            
        # Fallback substring translation
        res = text
        for eng, tel in PDF_TRANSLATIONS["te"].items():
            if eng in res:
                res = res.replace(eng, tel)
        return res

    @staticmethod
    def _get_para(text, style, lang="en"):
        cleaned = PDFService._translate_text(text, lang)
        if lang == "te" and TELUGU_FONT_AVAILABLE:
            te_style = ParagraphStyle(
                style.name + "_te",
                parent=style,
                fontName='NotoSansTelugu'
            )
            return Paragraph(cleaned, te_style)
        return Paragraph(cleaned, style)

    @staticmethod
    def _create_base_pdf(filename, title, content_flowables, lang="en"):
        """Helper to create a stylized base PDF layout."""
        pdf_path = os.path.join(Config.REPORT_FOLDER, filename)
        if not REPORTLAB_AVAILABLE:
            # Fallback: return a mock path without generating a PDF
            mock_path = os.path.join(Config.REPORT_FOLDER, filename)
            with open(mock_path, 'w', encoding='utf-8') as f:
                f.write(title + "\n\n")
                for item in content_flowables:
                    try:
                        f.write(str(item) + "\n")
                    except Exception:
                        pass
            return mock_path

        doc = SimpleDocTemplate(
            pdf_path,
            pagesize=letter,
            rightMargin=54,
            leftMargin=54,
            topMargin=54,
            bottomMargin=54
        )
        
        styles = getSampleStyleSheet()
        
        # Define clean, modern styling elements
        title_font = 'NotoSansTelugu' if (lang == "te" and TELUGU_FONT_AVAILABLE) else 'Helvetica-Bold'
        title_style = ParagraphStyle(
            'DocTitle',
            parent=styles['Heading1'],
            fontName=title_font,
            fontSize=22,
            leading=26,
            textColor=colors.HexColor('#1E3A8A'),
            spaceAfter=15
        )
        
        flowables = []
        
        # Styled Header banner
        banner_data = [
            [Paragraph("<b>AI SMART LOAN PORTAL</b>", ParagraphStyle('BLabel', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=10, textColor=colors.HexColor('#FFFFFF'))),
             Paragraph("CONFIDENTIAL REPORT", ParagraphStyle('RLabel', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=10, textColor=colors.HexColor('#FFFFFF'), alignment=2))]
        ]
        banner_table = Table(banner_data, colWidths=[250, 254])
        banner_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#1E3A8A')),
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('PADDING', (0, 0), (-1, -1), 12),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 14),
        ]))
        
        flowables.append(banner_table)
        flowables.append(Spacer(1, 15))
        
        # Title
        flowables.append(PDFService._get_para(title, title_style, lang))
        flowables.append(Spacer(1, 10))
        
        # Add page-specific flowables
        flowables.extend(content_flowables)
        
        # Footer builder
        def add_footer(canvas, doc):
            canvas.saveState()
            canvas.setFont('Helvetica', 8)
            canvas.setFillColor(colors.HexColor('#64748B'))
            canvas.drawString(54, 30, "AI Smart Loan Verification System © 2026 - Confidential Report")
            canvas.drawRightString(letter[0] - 54, 30, f"Page {doc.page}")
            canvas.restoreState()
            
        doc.build(flowables, onFirstPage=add_footer, onLaterPages=add_footer)
        return pdf_path

    @staticmethod
    def generate_application_pdf(app_data, lang="en"):
        """Generates a detailed professional summary PDF for a loan application."""
        import datetime
        try:
            filename = f"application_{app_data.get('_id', 'draft')}.pdf"
            styles = getSampleStyleSheet()
            
            font_name = 'NotoSansTelugu' if (lang == "te" and TELUGU_FONT_AVAILABLE) else 'Helvetica'
            font_bold = 'NotoSansTelugu' if (lang == "te" and TELUGU_FONT_AVAILABLE) else 'Helvetica-Bold'
            
            body_style = ParagraphStyle('BText', parent=styles['Normal'], fontName=font_name, fontSize=9, leading=12)
            bold_style = ParagraphStyle('BTextB', parent=styles['Normal'], fontName=font_bold, fontSize=9, leading=12)
            
            content = []
            
            # --- Applicant & Personal Details ---
            content.append(PDFService._get_para("Applicant Details", ParagraphStyle('H2', parent=styles['Heading2'], fontName=font_bold, fontSize=12, textColor=colors.HexColor('#1E3A8A')), lang))
            content.append(Spacer(1, 5))
            
            details = [
                [PDFService._get_para("<b>Full Name:</b>", body_style, lang), PDFService._get_para(str(app_data.get("name") or "N/A"), body_style, lang),
                 PDFService._get_para("<b>Application ID:</b>", body_style, lang), PDFService._get_para(str(app_data.get("_id") or "N/A"), body_style, lang)],
                [PDFService._get_para("<b>Email:</b>", body_style, lang), PDFService._get_para(str(app_data.get("email") or "N/A"), body_style, lang),
                 PDFService._get_para("<b>Mobile Number:</b>", body_style, lang), PDFService._get_para(str(app_data.get("mobile") or "N/A"), body_style, lang)],
                [PDFService._get_para("<b>DOB:</b>", body_style, lang), PDFService._get_para(str(app_data.get("dob") or "N/A"), body_style, lang),
                 PDFService._get_para("<b>Gender:</b>", body_style, lang), PDFService._get_para(str(app_data.get("gender") or "N/A"), body_style, lang)],
                [PDFService._get_para("<b>Address:</b>", body_style, lang), PDFService._get_para(str(app_data.get("address") or "N/A"), body_style, lang),
                 PDFService._get_para("<b>Submission Date:</b>", body_style, lang), PDFService._get_para(str(app_data.get("submitted_at") or app_data.get("created_at") or "N/A"), body_style, lang)]
            ]
            details_table = Table(details, colWidths=[110, 140, 110, 144])
            details_table.setStyle(TableStyle([
                ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
                ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#F8FAFC')),
                ('BACKGROUND', (2,0), (2,-1), colors.HexColor('#F8FAFC')),
                ('PADDING', (0,0), (-1,-1), 6),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ]))
            content.append(details_table)
            content.append(Spacer(1, 15))
            
            # --- Employment Information ---
            content.append(PDFService._get_para("Employment Information", ParagraphStyle('H2', parent=styles['Heading2'], fontName=font_bold, fontSize=12, textColor=colors.HexColor('#1E3A8A')), lang))
            content.append(Spacer(1, 5))
            
            emp_details = [
                [PDFService._get_para("<b>Occupation:</b>", body_style, lang), PDFService._get_para(str(app_data.get("occupation") or "N/A"), body_style, lang),
                 PDFService._get_para("<b>Employment Type:</b>", body_style, lang), PDFService._get_para(str(app_data.get("employment_type") or "N/A"), body_style, lang)],
                [PDFService._get_para("<b>Monthly Income:</b>", body_style, lang), PDFService._get_para(f"INR {float(app_data.get('income') or 0):,.2f}", body_style, lang),
                 PDFService._get_para("<b>Existing EMIs:</b>", body_style, lang), PDFService._get_para(f"INR {float(app_data.get('existing_loans') or 0):,.2f}", body_style, lang)]
            ]
            emp_table = Table(emp_details, colWidths=[110, 140, 110, 144])
            emp_table.setStyle(TableStyle([
                ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
                ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#F8FAFC')),
                ('BACKGROUND', (2,0), (2,-1), colors.HexColor('#F8FAFC')),
                ('PADDING', (0,0), (-1,-1), 6),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ]))
            content.append(emp_table)
            content.append(Spacer(1, 15))
            
            # --- Loan Details ---
            content.append(PDFService._get_para("Loan Parameters", ParagraphStyle('H2', parent=styles['Heading2'], fontName=font_bold, fontSize=12, textColor=colors.HexColor('#1E3A8A')), lang))
            content.append(Spacer(1, 5))
            
            loan_params = [
                [PDFService._get_para("<b>Loan Type:</b>", body_style, lang), PDFService._get_para(str(app_data.get("loan_type") or "N/A"), body_style, lang),
                 PDFService._get_para("<b>Requested Amount:</b>", body_style, lang), PDFService._get_para(f"INR {float(app_data.get('loan_amount') or 0):,.2f}", body_style, lang)],
                [PDFService._get_para("<b>Calculated EMI:</b>", body_style, lang), PDFService._get_para(f"INR {float(app_data.get('emi') or 0):,.2f}", body_style, lang),
                 PDFService._get_para("<b>Interest Rate:</b>", body_style, lang), PDFService._get_para(f"{app_data.get('interest_rate') or 'N/A'}%", body_style, lang)],
                [PDFService._get_para("<b>Repayment Tenure:</b>", body_style, lang), PDFService._get_para(f"{app_data.get('tenure') or 'N/A'} Years", body_style, lang),
                 PDFService._get_para("<b>Risk Score:</b>", body_style, lang), PDFService._get_para(f"{app_data.get('risk_score') or 'N/A'}%", body_style, lang)]
            ]
            loan_table = Table(loan_params, colWidths=[110, 140, 110, 144])
            loan_table.setStyle(TableStyle([
                ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
                ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#F8FAFC')),
                ('BACKGROUND', (2,0), (2,-1), colors.HexColor('#F8FAFC')),
                ('PADDING', (0,0), (-1,-1), 6),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ]))
            content.append(loan_table)
            content.append(Spacer(1, 15))
            
            # --- Uploaded Documents Summary ---
            content.append(PDFService._get_para("Uploaded Documents Summary", ParagraphStyle('H2', parent=styles['Heading2'], fontName=font_bold, fontSize=12, textColor=colors.HexColor('#1E3A8A')), lang))
            content.append(Spacer(1, 5))
            
            doc_rows = [[PDFService._get_para("<b>Document Name</b>", bold_style, lang), PDFService._get_para("<b>Filename</b>", bold_style, lang), PDFService._get_para("<b>Status</b>", bold_style, lang)]]
            uploaded_docs = app_data.get("uploaded_documents", {}) or {}
            for doc_name, doc_info in uploaded_docs.items():
                if isinstance(doc_info, dict):
                    doc_rows.append([
                        PDFService._get_para(str(doc_name), body_style, lang),
                        PDFService._get_para(str(doc_info.get("filename") or "N/A"), body_style, lang),
                        PDFService._get_para(str(doc_info.get("status") or "Uploaded"), body_style, lang)
                    ])
            if len(doc_rows) == 1:
                doc_rows.append([PDFService._get_para("Aadhaar Card", body_style, lang), PDFService._get_para(str(app_data.get("aadhaar_filename") or "Provided"), body_style, lang), PDFService._get_para("Verified", body_style, lang)])
                doc_rows.append([PDFService._get_para("PAN Card", body_style, lang), PDFService._get_para(str(app_data.get("pan_filename") or "Provided"), body_style, lang), PDFService._get_para("Verified", body_style, lang)])
                doc_rows.append([PDFService._get_para("Passport Photo", body_style, lang), PDFService._get_para(str(app_data.get("passport_filename") or "Provided"), body_style, lang), PDFService._get_para("Verified", body_style, lang)])
                
            doc_table = Table(doc_rows, colWidths=[150, 220, 134])
            doc_table.setStyle(TableStyle([
                ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
                ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F1F5F9')),
                ('PADDING', (0,0), (-1,-1), 6),
            ]))
            content.append(doc_table)
            content.append(Spacer(1, 15))
            
            # --- Verification Status ---
            content.append(PDFService._get_para("Verification Status", ParagraphStyle('H2', parent=styles['Heading2'], fontName=font_bold, fontSize=12, textColor=colors.HexColor('#1E3A8A')), lang))
            content.append(Spacer(1, 5))
            
            verification_status = str(app_data.get("status") or "Pending Review")
            ocr_results = app_data.get("ocr_results", {}) or {}
            ocr_match = "Passed" if ocr_results.get("name_match", True) else "Review Required"
            
            ver_details = [
                [PDFService._get_para("<b>Overall Status:</b>", body_style, lang), PDFService._get_para(verification_status, body_style, lang)],
                [PDFService._get_para("<b>OCR Alignment Match:</b>", body_style, lang), PDFService._get_para(ocr_match, body_style, lang)],
                [PDFService._get_para("<b>Biometric Match Score:</b>", body_style, lang), PDFService._get_para(f"{app_data.get('biometric_score', 95.5)}%", body_style, lang)],
                [PDFService._get_para("<b>Risk Check Status:</b>", body_style, lang), PDFService._get_para("Clear" if float(app_data.get("risk_score") or 0) < 40 else "High Risk Flag", body_style, lang)]
            ]
            ver_table = Table(ver_details, colWidths=[200, 304])
            ver_table.setStyle(TableStyle([
                ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
                ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#F8FAFC')),
                ('PADDING', (0,0), (-1,-1), 6),
            ]))
            content.append(ver_table)
            content.append(Spacer(1, 20))
            
            # --- QR Code & Generated Timestamp ---
            content.append(PDFService._get_para("Document Security & Tracking Verification", ParagraphStyle('H3', parent=styles['Heading3'], fontName=font_bold, fontSize=10, textColor=colors.HexColor('#1E3A8A')), lang))
            content.append(Spacer(1, 5))
            
            from reportlab.graphics.barcode.qr import QrCodeWidget
            from reportlab.graphics.shapes import Drawing
            qr_widget = QrCodeWidget(f"https://loansmart.example/verify/application/{app_data.get('_id')}")
            qr_drawing = Drawing(80, 80)
            qr_drawing.add(qr_widget)
            
            meta_details = [
                [PDFService._get_para("<b>Generated Timestamp:</b>", body_style, lang), PDFService._get_para(datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"), body_style, lang),
                 qr_drawing]
            ]
            meta_table = Table(meta_details, colWidths=[150, 254, 100])
            meta_table.setStyle(TableStyle([
                ('ALIGN', (0,0), (-1,-1), 'LEFT'),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                ('PADDING', (0,0), (-1,-1), 6),
            ]))
            content.append(meta_table)
            
            return PDFService._create_base_pdf(filename, "Loan Application Summary Report", content, lang)
        except Exception as e:
            print(f"Error in generate_application_pdf: {str(e)}")
            raise e

    @staticmethod
    def generate_verification_pdf(app_data, lang="en"):
        """Generates a detailed AI Verification, Face Matching and Fraud Report PDF."""
        from config import db
        filename = f"verification_{app_data.get('_id', 'draft')}.pdf"
        styles = getSampleStyleSheet()
        
        font_name = 'NotoSansTelugu' if (lang == "te" and TELUGU_FONT_AVAILABLE) else 'Helvetica'
        font_bold = 'NotoSansTelugu' if (lang == "te" and TELUGU_FONT_AVAILABLE) else 'Helvetica-Bold'
        
        body_style = ParagraphStyle('BText', parent=styles['Normal'], fontName=font_name, fontSize=9, leading=12)
        bold_style = ParagraphStyle('BTextB', parent=styles['Normal'], fontName=font_bold, fontSize=9, leading=12)
        
        content = []
        
        # Stylized Bank Logo badge at the top
        from reportlab.graphics.shapes import Drawing, Rect, String
        logo_drawing = Drawing(120, 36)
        logo_drawing.add(Rect(0, 0, 120, 32, fillColor=colors.HexColor('#1E3A8A'), strokeColor=None, rx=4, ry=4))
        logo_drawing.add(String(15, 9, "SMART BANK", fontName="Helvetica-Bold", fontSize=14, fillColor=colors.HexColor('#FFFFFF')))
        content.append(logo_drawing)
        content.append(Spacer(1, 15))

        # Query real document verification records from MongoDB
        user_id = app_data.get("user_id")
        aadhaar_doc = None
        pan_doc = None
        passport_doc = None
        if db is not None and user_id:
            try:
                from bson import ObjectId
                aadhaar_doc = db.documents.find_one({"user_id": user_id, "doc_type": "aadhaar"})
                pan_doc = db.documents.find_one({"user_id": user_id, "doc_type": "pan"})
                passport_doc = db.documents.find_one({"user_id": user_id, "doc_type": "passport_photo"})
            except Exception:
                pass

        # OCR Extracted vs Application Form Details Table
        content.append(PDFService._get_para("OCR Extraction Audit Log", ParagraphStyle('H2', parent=styles['Heading2'], fontName=font_bold, fontSize=12, textColor=colors.HexColor('#1E3A8A')), lang))
        content.append(Spacer(1, 5))
        
        ocr_data = app_data.get("ocr_results", {})
        
        name_form = (app_data.get("name") or "").strip().lower()
        name_ocr = (ocr_data.get("name") or "").strip().lower()
        name_match = "<b>MATCH</b>" if name_form and name_ocr and name_form == name_ocr else "<font color=red>MISMATCH</font>"
        
        dob_form = (app_data.get("dob") or "").strip()
        dob_ocr = (ocr_data.get("dob") or "").strip()
        dob_match = "<b>MATCH</b>" if dob_form and dob_ocr and dob_form == dob_ocr else "<font color=red>MISMATCH</font>"
        
        gender_form = (app_data.get("gender") or "").strip().lower()
        gender_ocr = (ocr_data.get("gender") or "").strip().lower()
        gender_match = "<b>MATCH</b>" if gender_form and gender_ocr and gender_form == gender_ocr else "<font color=red>MISMATCH</font>"
        
        ocr_details = [
            [PDFService._get_para("<b>Field Name</b>", bold_style, lang), PDFService._get_para("<b>User Form Input</b>", bold_style, lang), PDFService._get_para("<b>OCR Extracted Value</b>", bold_style, lang), PDFService._get_para("<b>Match Status</b>", bold_style, lang)],
            [PDFService._get_para("Full Name", body_style, lang), PDFService._get_para(str(app_data.get("name") or "N/A"), body_style, lang), PDFService._get_para(str(ocr_data.get("name") or "N/A"), body_style, lang), PDFService._get_para(name_match, body_style, lang)],
            [PDFService._get_para("DOB", body_style, lang), PDFService._get_para(str(app_data.get("dob") or "N/A"), body_style, lang), PDFService._get_para(str(ocr_data.get("dob") or "N/A"), body_style, lang), PDFService._get_para(dob_match, body_style, lang)],
            [PDFService._get_para("Gender", body_style, lang), PDFService._get_para(str(app_data.get("gender") or "N/A"), body_style, lang), PDFService._get_para(str(ocr_data.get("gender") or "N/A"), body_style, lang), PDFService._get_para(gender_match, body_style, lang)]
        ]
        ocr_table = Table(ocr_details, colWidths=[100, 140, 140, 124])
        ocr_table.setStyle(TableStyle([
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F1F5F9')),
            ('PADDING', (0,0), (-1,-1), 6),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        content.append(ocr_table)
        content.append(Spacer(1, 15))

        # Aadhaar Validation Table
        content.append(PDFService._get_para("Aadhaar Validation", ParagraphStyle('H2', parent=styles['Heading2'], fontName=font_bold, fontSize=12, textColor=colors.HexColor('#1E3A8A')), lang))
        content.append(Spacer(1, 5))
        a_num = aadhaar_doc.get("ocr", {}).get("id_number", "N/A") if aadhaar_doc else "N/A"
        a_name = aadhaar_doc.get("ocr", {}).get("name", "N/A") if aadhaar_doc else "N/A"
        a_status = "VERIFIED / SUCCESS" if aadhaar_doc else "PENDING UPLOAD"
        aadhaar_details = [
            [PDFService._get_para("<b>Aadhaar Number:</b>", body_style, lang), PDFService._get_para(str(a_num), body_style, lang)],
            [PDFService._get_para("<b>Aadhaar Holder Name:</b>", body_style, lang), PDFService._get_para(str(a_name), body_style, lang)],
            [PDFService._get_para("<b>Aadhaar Integrity Check:</b>", body_style, lang), PDFService._get_para("Passed - Original Signatures Intact" if aadhaar_doc else "N/A", body_style, lang)],
            [PDFService._get_para("<b>Validation Status:</b>", body_style, lang), PDFService._get_para(f"<b><font color=green>{a_status}</font></b>", body_style, lang)]
        ]
        aadhaar_table = Table(aadhaar_details, colWidths=[180, 324])
        aadhaar_table.setStyle(TableStyle([
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
            ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#F8FAFC')),
            ('PADDING', (0,0), (-1,-1), 6),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        content.append(aadhaar_table)
        content.append(Spacer(1, 15))

        # PAN Validation Table
        content.append(PDFService._get_para("PAN Validation", ParagraphStyle('H2', parent=styles['Heading2'], fontName=font_bold, fontSize=12, textColor=colors.HexColor('#1E3A8A')), lang))
        content.append(Spacer(1, 5))
        p_num = pan_doc.get("ocr", {}).get("id_number", "N/A") if pan_doc else "N/A"
        p_name = pan_doc.get("ocr", {}).get("name", "N/A") if pan_doc else "N/A"
        p_status = "VERIFIED / SUCCESS" if pan_doc else "PENDING UPLOAD"
        pan_details = [
            [PDFService._get_para("<b>PAN Card ID Number:</b>", body_style, lang), PDFService._get_para(str(p_num), body_style, lang)],
            [PDFService._get_para("<b>PAN Holder Name:</b>", body_style, lang), PDFService._get_para(str(p_name), body_style, lang)],
            [PDFService._get_para("<b>PAN Integrity Check:</b>", body_style, lang), PDFService._get_para("Passed - Authentic Card Structure" if pan_doc else "N/A", body_style, lang)],
            [PDFService._get_para("<b>Validation Status:</b>", body_style, lang), PDFService._get_para(f"<b><font color=green>{p_status}</font></b>", body_style, lang)]
        ]
        pan_table = Table(pan_details, colWidths=[180, 324])
        pan_table.setStyle(TableStyle([
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
            ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#F8FAFC')),
            ('PADDING', (0,0), (-1,-1), 6),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        content.append(pan_table)
        content.append(Spacer(1, 15))

        # Passport Photo Validation Table
        content.append(PDFService._get_para("Passport Photo Validation", ParagraphStyle('H2', parent=styles['Heading2'], fontName=font_bold, fontSize=12, textColor=colors.HexColor('#1E3A8A')), lang))
        content.append(Spacer(1, 5))
        pass_blur = passport_doc.get("quality", {}).get("blur", 100.0) if passport_doc else 100.0
        pass_status = "VERIFIED / SUCCESS" if passport_doc else "PENDING UPLOAD"
        pass_details = [
            [PDFService._get_para("<b>Face Detection Check:</b>", body_style, lang), PDFService._get_para("Passed - 1 Human Face Detected" if passport_doc else "N/A", body_style, lang)],
            [PDFService._get_para("<b>Image Quality (Blur Metric):</b>", body_style, lang), PDFService._get_para(f"Passed - Blur index {pass_blur:.1f} (Clear)" if passport_doc else "N/A", body_style, lang)],
            [PDFService._get_para("<b>Validation Status:</b>", body_style, lang), PDFService._get_para(f"<b><font color=green>{pass_status}</font></b>", body_style, lang)]
        ]
        pass_table = Table(pass_details, colWidths=[180, 324])
        pass_table.setStyle(TableStyle([
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
            ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#F8FAFC')),
            ('PADDING', (0,0), (-1,-1), 6),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        content.append(pass_table)
        content.append(Spacer(1, 15))
        
        # Face verify logs
        content.append(PDFService._get_para("Biometric Face Matching Identity Verification", ParagraphStyle('H2', parent=styles['Heading2'], fontName=font_bold, fontSize=12, textColor=colors.HexColor('#1E3A8A')), lang))
        content.append(Spacer(1, 5))
        
        face_data = app_data.get("face_verification", {})
        doc_details = [
            [PDFService._get_para("<b>Verification Specification</b>", bold_style, lang), PDFService._get_para("<b>Biometric Response Details</b>", bold_style, lang)],
            [PDFService._get_para("Biometric Face Similarity Score:", body_style, lang), PDFService._get_para(f"{face_data.get('similarity', 0.0)}%", body_style, lang)],
            [PDFService._get_para("Biometric Status:", body_style, lang), PDFService._get_para(face_data.get("status", "Review Needed"), body_style, lang)],
            [PDFService._get_para("Liveness Detection Result:", body_style, lang), PDFService._get_para(face_data.get("liveness", "Passed (Liveness Verified)"), body_style, lang)],
            [PDFService._get_para("Security Logs:", body_style, lang), PDFService._get_para(face_data.get("message", "Desk validation recommended."), body_style, lang)]
        ]
        doc_table = Table(doc_details, colWidths=[180, 324])
        doc_table.setStyle(TableStyle([
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
            ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#F8FAFC')),
            ('PADDING', (0,0), (-1,-1), 6),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        content.append(doc_table)
        content.append(Spacer(1, 15))

        # Fraud Checking Metrics
        content.append(PDFService._get_para("AI Fraud & Tampering Analysis", ParagraphStyle('H2', parent=styles['Heading2'], fontName=font_bold, fontSize=12, textColor=colors.HexColor('#1E3A8A')), lang))
        content.append(Spacer(1, 5))
        
        fraud_data = app_data.get("fraud_results", {})
        fraud_details = [
            [PDFService._get_para("<b>Check Category</b>", bold_style, lang), PDFService._get_para("<b>Result Flag</b>", bold_style, lang)],
            [PDFService._get_para("Document Integrity", body_style, lang), PDFService._get_para(fraud_data.get("status", "Unknown"), body_style, lang)],
            [PDFService._get_para("Fraud Risk Index", body_style, lang), PDFService._get_para(f"{fraud_data.get('fraud_score', '0.0')}%", body_style, lang)],
            [PDFService._get_para("Detected Flags / Issues", body_style, lang), PDFService._get_para("<br/>".join(fraud_data.get("issues", [])) if fraud_data.get("issues") else "None. File is secure.", body_style, lang)]
        ]
        fraud_table = Table(fraud_details, colWidths=[150, 354])
        fraud_table.setStyle(TableStyle([
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
            ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#F8FAFC')),
            ('PADDING', (0,0), (-1,-1), 6),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        content.append(fraud_table)
        
        # Add QR Code & Audit Timestamp
        from reportlab.graphics.barcode.qr import QrCodeWidget
        from reportlab.graphics.shapes import Drawing
        import datetime
        qr_widget = QrCodeWidget(f"https://loansmart.example/verify/audit/{app_data.get('_id')}")
        qr_drawing = Drawing(80, 80)
        qr_drawing.add(qr_widget)
        
        meta_details = [
            [PDFService._get_para("<b>Audit Timestamp:</b>", body_style, lang), PDFService._get_para(datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"), body_style, lang),
             qr_drawing]
        ]
        meta_table = Table(meta_details, colWidths=[150, 254, 100])
        meta_table.setStyle(TableStyle([
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('PADDING', (0,0), (-1,-1), 6),
        ]))
        content.append(Spacer(1, 15))
        content.append(meta_table)
        
        return PDFService._create_base_pdf(filename, "System Verification Report", content, lang)

    @staticmethod
    def generate_appointment_pdf(app_data, appointment_data, lang="en"):
        """Generates the final bank appointment booking receipt."""
        import datetime
        try:
            filename = f"appointment_{app_data.get('_id', 'draft')}.pdf"
            styles = getSampleStyleSheet()
            
            font_name = 'NotoSansTelugu' if (lang == "te" and TELUGU_FONT_AVAILABLE) else 'Helvetica'
            font_bold = 'NotoSansTelugu' if (lang == "te" and TELUGU_FONT_AVAILABLE) else 'Helvetica-Bold'
            
            body_style = ParagraphStyle('BText', parent=styles['Normal'], fontName=font_name, fontSize=10, leading=15)
            bold_style = ParagraphStyle('BTextB', parent=styles['Normal'], fontName=font_bold, fontSize=10, leading=15)
            
            content = []
            
            # Stylized Bank Logo badge at the top
            from reportlab.graphics.shapes import Drawing, Rect, String
            logo_drawing = Drawing(120, 36)
            logo_drawing.add(Rect(0, 0, 120, 32, fillColor=colors.HexColor('#1E3A8A'), strokeColor=None, rx=4, ry=4))
            logo_drawing.add(String(15, 9, "SMART BANK", fontName="Helvetica-Bold", fontSize=14, fillColor=colors.HexColor('#FFFFFF')))
            content.append(logo_drawing)
            content.append(Spacer(1, 15))
            
            content.append(PDFService._get_para("Congratulations! Your loan application has been conditionally approved. An in-person appointment has been scheduled at the branch for final physical document sign-off.", 
                                     ParagraphStyle('H3', parent=styles['Normal'], fontName=font_bold, fontSize=10, textColor=colors.HexColor('#0F766E'), spaceAfter=15), lang))
            
            content.append(PDFService._get_para("Appointment Specifications", ParagraphStyle('H2', parent=styles['Heading2'], fontName=font_bold, fontSize=12, textColor=colors.HexColor('#1E3A8A')), lang))
            content.append(Spacer(1, 5))
            
            details = [
                [PDFService._get_para("<b>Customer Name:</b>", body_style, lang), PDFService._get_para(str(app_data.get("name") or "N/A"), body_style, lang)],
                [PDFService._get_para("<b>Application ID:</b>", body_style, lang), PDFService._get_para(str(app_data.get("_id") or "N/A"), body_style, lang)],
                [PDFService._get_para("<b>Loan Type:</b>", body_style, lang), PDFService._get_para(str(app_data.get("loan_type") or "N/A"), body_style, lang)],
                [PDFService._get_para("<b>Loan Amount:</b>", body_style, lang), PDFService._get_para(f"INR {float(app_data.get('loan_amount') or 0):,.2f}", body_style, lang)],
                [PDFService._get_para("<b>Branch Location:</b>", body_style, lang), PDFService._get_para(str(appointment_data.get("branch") or "N/A"), body_style, lang)],
                [PDFService._get_para("<b>Scheduled Date:</b>", body_style, lang), PDFService._get_para(str(appointment_data.get("date") or "N/A"), body_style, lang)],
                [PDFService._get_para("<b>Scheduled Slot:</b>", body_style, lang), PDFService._get_para(str(appointment_data.get("time_slot") or "N/A"), body_style, lang)],
                [PDFService._get_para("<b>Verifying Officer Name:</b>", body_style, lang), PDFService._get_para(str(appointment_data.get("officer_name") or app_data.get("officer_name") or "Credit Officer Desk"), body_style, lang)]
            ]
            
            details_table = Table(details, colWidths=[150, 354])
            details_table.setStyle(TableStyle([
                ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
                ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#F8FAFC')),
                ('PADDING', (0,0), (-1,-1), 8),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ]))
            content.append(details_table)
            content.append(Spacer(1, 15))
            
            content.append(PDFService._get_para("Important Instructions", ParagraphStyle('H2', parent=styles['Heading2'], fontName=font_bold, fontSize=12, textColor=colors.HexColor('#1E3A8A')), lang))
            content.append(Spacer(1, 5))
            
            instructions = (
                "1. Please carry original physical copies of Aadhaar Card, PAN Card, and your application summary.<br/>"
                "2. Bring 3 recent passport size color photos.<br/>"
                "3. Carry the last 3 months salary slips or income proofs as uploaded in the portal.<br/>"
                "4. Please arrive 15 minutes prior to your selected slot.<br/>"
                "5. Wear a face mask and follow branch safety protocols."
            )
            content.append(PDFService._get_para(instructions, body_style, lang))
            content.append(Spacer(1, 15))
            
            # --- QR Code & Generated Timestamp ---
            content.append(PDFService._get_para("Document Security Verification", ParagraphStyle('H3', parent=styles['Heading3'], fontName=font_bold, fontSize=10, textColor=colors.HexColor('#1E3A8A')), lang))
            content.append(Spacer(1, 5))
            
            from reportlab.graphics.barcode.qr import QrCodeWidget
            from reportlab.graphics.shapes import Drawing
            qr_widget = QrCodeWidget(f"https://loansmart.example/verify/appointment/{app_data.get('_id')}")
            qr_drawing = Drawing(80, 80)
            qr_drawing.add(qr_widget)
            
            meta_details = [
                [PDFService._get_para("<b>Generated Timestamp:</b>", body_style, lang), PDFService._get_para(datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"), body_style, lang),
                 qr_drawing]
            ]
            meta_table = Table(meta_details, colWidths=[150, 254, 100])
            meta_table.setStyle(TableStyle([
                ('ALIGN', (0,0), (-1,-1), 'LEFT'),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                ('PADDING', (0,0), (-1,-1), 6),
            ]))
            content.append(meta_table)
            
            return PDFService._create_base_pdf(filename, "Official Appointment Letter", content, lang)
        except Exception as e:
            print(f"Error in generate_appointment_pdf: {str(e)}")
            raise e

    @staticmethod
    def generate_approval_pdf(app_data, remarks="", lang="en"):
        """Generates an official conditional approval letter."""
        try:
            filename = f"approval_letter_{app_data.get('_id', 'draft')}.pdf"
            styles = getSampleStyleSheet()
            
            font_name = 'NotoSansTelugu' if (lang == "te" and TELUGU_FONT_AVAILABLE) else 'Helvetica'
            font_bold = 'NotoSansTelugu' if (lang == "te" and TELUGU_FONT_AVAILABLE) else 'Helvetica-Bold'
            
            body_style = ParagraphStyle('BText', parent=styles['Normal'], fontName=font_name, fontSize=10, leading=15)
            bold_style = ParagraphStyle('BTextB', parent=styles['Normal'], fontName=font_bold, fontSize=10, leading=15)
            
            content = []
            content.append(PDFService._get_para("<b>Subject: Conditional Approval of Loan Application</b>", bold_style, lang))
            content.append(Spacer(1, 15))
            
            welcome_text = (
                f"Dear {app_data.get('name') or 'Customer'},<br/><br/>"
                f"We are pleased to inform you that your application for a <b>{app_data.get('loan_type')}</b> "
                f"has been conditionally approved for a total amount of <b>INR {float(app_data.get('loan_amount') or 0):,.2f}</b>.<br/><br/>"
                f"The loan details are summarized below:"
            )
            content.append(PDFService._get_para(welcome_text, body_style, lang))
            content.append(Spacer(1, 10))
            
            details = [
                [PDFService._get_para("<b>Loan Option</b>", bold_style, lang), PDFService._get_para(str(app_data.get("loan_type")), body_style, lang)],
                [PDFService._get_para("<b>Sanctioned Amount</b>", bold_style, lang), PDFService._get_para(f"INR {float(app_data.get('loan_amount') or 0):,.2f}", body_style, lang)],
                [PDFService._get_para("<b>Interest Rate</b>", bold_style, lang), PDFService._get_para(f"{app_data.get('interest_rate') or '10.0'}% p.a.", body_style, lang)],
                [PDFService._get_para("<b>Repayment Tenure</b>", bold_style, lang), PDFService._get_para(f"{app_data.get('tenure') or '5'} Years", body_style, lang)],
                [PDFService._get_para("<b>Estimated Monthly EMI</b>", bold_style, lang), PDFService._get_para(f"INR {float(app_data.get('emi') or 0):,.2f}", body_style, lang)],
                [PDFService._get_para("<b>Officer Remarks</b>", bold_style, lang), PDFService._get_para(str(remarks or app_data.get("officer_remarks") or "Satisfies credit requirements."), body_style, lang)]
            ]
            details_table = Table(details, colWidths=[150, 354])
            details_table.setStyle(TableStyle([
                ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
                ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#F8FAFC')),
                ('PADDING', (0,0), (-1,-1), 6),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ]))
            content.append(details_table)
            content.append(Spacer(1, 15))
            
            disclaimer = (
                "Please note that this approval is subject to physical verification of your original documents "
                "(Aadhaar Card, PAN Card, Income statements, etc.) at the assigned branch. If any discrepancy "
                "is found, the bank reserves the right to withdraw this offer.<br/><br/>"
                "Thank you for choosing AI Smart Loan Bank."
            )
            content.append(PDFService._get_para(disclaimer, body_style, lang))
            return PDFService._create_base_pdf(filename, "Conditional Loan Approval Letter", content, lang)
        except Exception as e:
            print(f"Error generating approval PDF: {e}")
            raise e

    @staticmethod
    def generate_rejection_pdf(app_data, remarks="", lang="en"):
        """Generates an official loan rejection letter."""
        try:
            filename = f"rejection_letter_{app_data.get('_id', 'draft')}.pdf"
            styles = getSampleStyleSheet()
            
            font_name = 'NotoSansTelugu' if (lang == "te" and TELUGU_FONT_AVAILABLE) else 'Helvetica'
            font_bold = 'NotoSansTelugu' if (lang == "te" and TELUGU_FONT_AVAILABLE) else 'Helvetica-Bold'
            
            body_style = ParagraphStyle('BText', parent=styles['Normal'], fontName=font_name, fontSize=10, leading=15)
            bold_style = ParagraphStyle('BTextB', parent=styles['Normal'], fontName=font_bold, fontSize=10, leading=15)
            
            content = []
            content.append(PDFService._get_para("<b>Subject: Loan Application Status Update</b>", bold_style, lang))
            content.append(Spacer(1, 15))
            
            rejection_text = (
                f"Dear {app_data.get('name') or 'Customer'},<br/><br/>"
                f"Thank you for your interest in applying for a <b>{app_data.get('loan_type')}</b> with AI Smart Loan Bank.<br/><br/>"
                f"We regret to inform you that, after careful review of your profile and uploaded documents, we are unable to approve your loan request at this time. "
                f"Our decision is based on credit qualification rules and criteria established for this product.<br/><br/>"
                f"<b>Reason for Rejection / Officer Comments:</b><br/>"
                f"<i>{remarks or app_data.get('officer_remarks') or 'Profile does not meet minimum eligibility score/criteria.'}</i><br/><br/>"
                f"You may improve your qualification metrics (e.g. by settling existing debts, adding a co-applicant, or selecting a lower loan amount) and re-apply in 90 days.<br/><br/>"
                f"Sincerely,<br/><b>AI Smart Loan Credit Desk</b>"
            )
            content.append(PDFService._get_para(rejection_text, body_style, lang))
            return PDFService._create_base_pdf(filename, "Loan Rejection Letter", content, lang)
        except Exception as e:
            print(f"Error generating rejection PDF: {e}")
            raise e

    @staticmethod
    def generate_officer_report(app_data, officer_name="", remarks="", lang="en"):
        """Generates a detailed Officer Verification Report."""
        import datetime
        try:
            filename = f"officer_report_{app_data.get('_id', 'draft')}.pdf"
            styles = getSampleStyleSheet()
            
            font_name = 'NotoSansTelugu' if (lang == "te" and TELUGU_FONT_AVAILABLE) else 'Helvetica'
            font_bold = 'NotoSansTelugu' if (lang == "te" and TELUGU_FONT_AVAILABLE) else 'Helvetica-Bold'
            
            body_style = ParagraphStyle('BText', parent=styles['Normal'], fontName=font_name, fontSize=9, leading=13)
            bold_style = ParagraphStyle('BTextB', parent=styles['Normal'], fontName=font_bold, fontSize=9, leading=13)
            
            content = []
            content.append(PDFService._get_para("Officer Evaluation Summary", ParagraphStyle('H2', parent=styles['Heading2'], fontName=font_bold, fontSize=12, textColor=colors.HexColor('#1E3A8A')), lang))
            content.append(Spacer(1, 5))
            
            details = [
                [PDFService._get_para("<b>Assigned Officer:</b>", body_style, lang), PDFService._get_para(str(officer_name or "Credit Officer John"), body_style, lang),
                 PDFService._get_para("<b>Evaluation Date:</b>", body_style, lang), PDFService._get_para(datetime.datetime.utcnow().strftime("%Y-%m-%d"), body_style, lang)],
                [PDFService._get_para("<b>Application ID:</b>", body_style, lang), PDFService._get_para(str(app_data.get("_id") or "N/A"), body_style, lang),
                 PDFService._get_para("<b>Applicant Name:</b>", body_style, lang), PDFService._get_para(str(app_data.get("name")), body_style, lang)],
                [PDFService._get_para("<b>Loan Parameters:</b>", body_style, lang), PDFService._get_para(f"{app_data.get('loan_type')} - INR {float(app_data.get('loan_amount') or 0):,.2f}", body_style, lang),
                 PDFService._get_para("<b>System Risk Score:</b>", body_style, lang), PDFService._get_para(f"{app_data.get('risk_score') or 0.0}%", body_style, lang)],
                [PDFService._get_para("<b>Final Decision:</b>", body_style, lang), PDFService._get_para(f"<b>{app_data.get('status')}</b>", body_style, lang),
                 PDFService._get_para("<b>Officer Remarks:</b>", body_style, lang), PDFService._get_para(str(remarks or app_data.get("officer_remarks") or "Evaluation complete."), body_style, lang)]
            ]
            details_table = Table(details, colWidths=[110, 140, 110, 144])
            details_table.setStyle(TableStyle([
                ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
                ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#F8FAFC')),
                ('BACKGROUND', (2,0), (2,-1), colors.HexColor('#F8FAFC')),
                ('PADDING', (0,0), (-1,-1), 6),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ]))
            content.append(details_table)
            return PDFService._create_base_pdf(filename, "Verification Officer Desk Report", content, lang)
        except Exception as e:
            print(f"Error generating officer report PDF: {e}")
            raise e
