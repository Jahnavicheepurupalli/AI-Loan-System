// --- English / Telugu Translations Dictionary ---
const TRANSLATIONS = {
    en: {
        "nav_home": "Home",
        "nav_features": "AI Features",
        "nav_loans": "Loan Catalog",
        "nav_contact": "Contact Us",
        "nav_login": "Login",
        "nav_register": "Register",
        
        "hero_title": "AI-Powered Smart Banking, Simplified.",
        "hero_desc": "Get instant eligibility checking, AI-driven loan matches, automated OCR document audits, and secure live face recognition - all in one unified portal.",
        "hero_btn_apply": "Apply For Loan",
        "hero_btn_explore": "Explore Catalog",
        
        "loans_title": "Our Diverse Loan Products",
        "loans_desc": "Find the perfect loan product with highly competitive interest rates tailored to your profile.",
        
        "personal_loan": "Personal Loan",
        "education_loan": "Education Loan",
        "home_loan": "Home Loan",
        "vehicle_loan": "Vehicle Loan",
        "business_loan": "Business Loan",
        "agriculture_loan": "Agriculture Loan",
        "gold_loan": "Gold Loan",
        
        "interest_rate": "Interest Rate",
        "amount_range": "Amount Range",
        "tenure": "Max Tenure",
        "eligibility": "Eligibility",
        
        "btn_apply_now": "Apply Now",
        "dark_mode": "Dark Mode",
        "light_mode": "Light Mode",
        
        // Dashboards Translations
        "db_pending": "Pending Applications",
        "db_approved": "Approved Loans",
        "db_rejected": "Rejected Applications",
        "db_drafts": "Draft Applications",
        
        "sidebar_dashboard": "Overview Dashboard",
        "sidebar_loans": "Loan Offerings",
        "sidebar_apply": "Apply for Loan",
        "sidebar_status": "Track Status",
        "sidebar_chatbot": "AI Assistant Chat",
        "sidebar_calculator": "EMI Calculator",
        "sidebar_feedback": "Submit Feedback",
        "sidebar_settings": "App Settings",
        
        "field_name": "Full Name (As in Aadhaar)",
        "field_email": "Email Address",
        "field_mobile": "Mobile Number",
        "field_age": "Age",
        "field_income": "Monthly Income",
        "field_loans": "Existing Loan EMIs",
        "field_amount": "Requested Loan Amount",
        "field_purpose": "Loan Purpose"
    },
    te: {
        "nav_home": "హోమ్",
        "nav_features": "AI ఫీచర్లు",
        "nav_loans": "రుణ రకాలు",
        "nav_contact": "సంప్రదించండి",
        "nav_login": "లాగిన్",
        "nav_register": "రిజిస్టర్",
        
        "hero_title": "AI-ఆధారిత స్మార్ట్ బ్యాంకింగ్, సరళీకృతం.",
        "hero_desc": "తక్షణ రుణ అర్హత తనిఖీ, AI రుణ సిఫార్సులు, స్వయంచాలక OCR పత్రాల ధృవీకరణ మరియు సురక్షిత లైవ్ ముఖ గుర్తింపును ఒకే పోర్టల్‌లో పొందండి.",
        "hero_btn_apply": "రుణం కోసం దరఖాస్తు చేసుకోండి",
        "hero_btn_explore": "రుణాల పట్టిక చూడండి",
        
        "loans_title": "మా విభిన్న రుణ ఉత్పత్తులు",
        "loans_desc": "మీ ప్రొఫైల్‌కు తగిన అత్యంత పోటీ వడ్డీ రేట్లతో సరైన రుణ ఉత్పత్తిని కనుగొనండి.",
        
        "personal_loan": "వ్యక్తిగత రుణం",
        "education_loan": "విద్యా రుణం",
        "home_loan": "గృహ రుణం",
        "vehicle_loan": "వాహన రుణం",
        "business_loan": "వ్యాపార రుణం",
        "agriculture_loan": "వ్యవసాయ రుణం",
        "gold_loan": "బంగారు రుణం",
        
        "interest_rate": "వడ్డీ రేటు",
        "amount_range": "రుణ పరిమితి",
        "tenure": "గరిష్ట వ్యవధి",
        "eligibility": "అర్హత",
        
        "btn_apply_now": "దరఖాస్తు చేసుకోండి",
        "dark_mode": "డార్క్ మోడ్",
        "light_mode": "లైట్ మోడ్",
        
        // Dashboards Translations
        "db_pending": "పెండింగ్ దరఖాస్తులు",
        "db_approved": "ఆమోదించబడిన రుణాలు",
        "db_rejected": "తిరస్కరించబడిన దరఖాస్తులు",
        "db_drafts": "డ్రాఫ్ట్ దరఖాస్తులు",
        
        "sidebar_dashboard": "డ్యాష్‌బోర్డ్ అవలోకనం",
        "sidebar_loans": "రుణ రకాలు",
        "sidebar_apply": "రుణం కోసం దరఖాస్తు",
        "sidebar_status": "దరఖాస్తు స్థితి",
        "sidebar_chatbot": "AI చాట్ అసిస్టెంట్",
        "sidebar_calculator": "EMI క్యాలిక్యులేటర్",
        "sidebar_feedback": "అభిప్రాయాన్ని పంపండి",
        "sidebar_settings": "యాప్ సెట్టింగ్స్",
        
        "field_name": "పూర్తి పేరు (ఆధార్ లో ఉన్నట్లు)",
        "field_email": "ఈమెయిల్ చిరునామా",
        "field_mobile": "మొబైల్ సంఖ్య",
        "field_age": "వయస్సు",
        "field_income": "నెలవారీ ఆదాయం",
        "field_loans": "ప్రస్తుత లోన్ EMIలు",
        "field_amount": "కావలసిన రుణ మొత్తం",
        "field_purpose": "రుణం యొక్క ఉద్దేశం"
    }
};

// --- English to Telugu dictionary for automatic translation ---
const UI_TRANSLATIONS = {
    "Dashboard": "డాష్బోర్డ్",
    "Pending Applications": "పెండింగ్ దరఖాస్తులు",
    "Application Review": "దరఖాస్తు సమీక్ష",
    "Document Verification": "పత్రాల ధృవీకరణ",
    "OCR Details": "OCR వివరాలు",
    "Loan Type": "రుణ రకం",
    "Loan Amount": "రుణ మొత్తం",
    "Status": "స్థితి",
    "Approve": "ఆమోదించు",
    "Reject": "తిరస్కరించు",
    "Request Documents": "అదనపు పత్రాలు కోరండి",
    "Logout": "లాగ్ అవుట్",
    "Overview Dashboard": "డ్యాష్‌బోర్డ్ అవలోకనం",
    "Loan Offerings": "రుణ రకాలు",
    "AI Recommendation": "AI సిఫార్సు",
    "Apply for Loan": "రుణం కోసం దరఖాస్తు",
    "Track Status": "దరఖాస్తు స్థితి",
    "EMI Calculator": "EMI క్యాలిక్యులేటర్",
    "Submit Feedback": "అభిప్రాయాన్ని పంపండి",
    "Notifications": "నోటిఫికేషన్లు",
    "Dashboard": "డ్యాష్‌బోర్డ్",
    "Manage Users": "వినియోగదారుల నిర్వహణ",
    "Manage Officers": "అధికారుల నిర్వహణ",
    "Manage Loans": "రుణాల నిర్వహణ",
    "Loan Rules Mgmt": "రుణ నియమాల నిర్వహణ",
    "All Applications": "అన్ని దరఖాస్తులు",
    "Approved Loans": "ఆమోదించబడిన రుణాలు",
    "Rejected Loans": "తిరస్కరించబడిన రుణాలు",
    "Pending Loans": "పెండింగ్ రుణాలు",
    "Audit Logs": "ఆడిట్ లాగ్స్",
    "Analytics Reports": "విశ్లేషణ నివేదికలు",
    "Feedback & Ratings": "అభిప్రాయాలు & రేటింగ్‌లు",
    "System Dashboard": "సిస్టమ్ డ్యాష్‌బోర్డ్",
    "Total Users": "మొత్తం వినియోగదారులు",
    "Total Officers": "మొత్తం అధికారులు",
    "Total Applications": "మొత్తం దరఖాస్తులు",
    "System Admin Quick Overview": "సిస్టమ్ అడ్మిన్ త్వరిత అవలోకనం",
    "Select other menu tabs on the left menu sidebar to perform administrator actions, monitor security audit logs, modify configurations, or broadcast notifications.": "అడ్మినిస్ట్రేటర్ చర్యలను నిర్వహించడానికి, భద్రతా ఆడిట్ లాగ్లను పర్యవేక్షించడానికి, కాన్ఫిగరేషన్లను సవరించడానికి లేదా నోటిఫికేషన్లను ప్రసారం చేయడానికి ఎడమ మెను సైడ్‌బార్‌లోని ఇతర మెను ట్యాబ్‌లను ఎంచుకోండి.",
    "Manage Customer Accounts": "కస్టమర్ ఖాతాల నిర్వహణ",
    "Name": "పేరు",
    "Email": "ఈమెయిల్",
    "Mobile": "మొబైల్",
    "Role": "పాత్ర",
    "Status": "స్థితి",
    "Actions": "చర్యలు",
    "Add New Credit Verification Officer": "కొత్త క్రెడిట్ వెరిఫికేషన్ అధికారిని జోడించండి",
    "Officer Name": "అధికారి పేరు",
    "Email Address": "ఈమెయిల్ చిరునామా",
    "Mobile Number": "మొబైల్ సంఖ్య",
    "Security Password": "భద్రతా పాస్‌వర్డ్",
    "Add Officer Account": "అధికారి ఖాతాను జోడించండి",
    "Active Officers List": "క్రియాశీల అధికారుల జాబితా",
    "Credit Officer Workspace": "క్రెడిట్ ఆఫీసర్ వర్క్‌స్పేస్",
    "Officer Verification Queue": "అధికారి వెరిఫికేషన్ క్యూ",
    "Assigned Branch": "కేటాయించిన బ్రాంచ్",
    "Review Application": "దరఖాస్తును సమీక్షించండి",
    "Approve Application": "దరఖాస్తును ఆమోదించండి",
    "Reject Application": "దరఖాస్తును తిరస్కరించండి",
    "Confirm Schedule & Send Letter": "షెడ్యూల్ ధృవీకరించి లేఖ పంపండి",
    "Appointment Date & Time": "అపాయింట్‌మెంట్ తేదీ & సమయం",
    "Verification Remarks": "వెరిఫికేషన్ వ్యాఖ్యలు",
    "Branch Location": "బ్రాంచ్ లొకేషన్",
    "Select Branch": "బ్రాంచ్ ఎంచుకోండి",
    "Select Date": "తేదీ ఎంచుకోండి",
    "Select Time Slot": "సమయ స్లాట్ ఎంచుకోండి",
    "Enter verification remarks...": "వెరిఫికేషన్ వ్యాఖ్యలను నమోదు చేయండి...",
    "Close": "మూసిвеయి",
    "Approved": "ఆమోదించబడింది",
    "Rejected": "తిరస్కరించబడింది",
    "Pending Verification": "వెరిఫికేషన్ పెండింగ్‌లో ఉంది",
    "Customer Portal": "కస్టమర్ పోర్టల్",
    "Verification Officer": "వెరిఫికేషన్ అధికారి",
    "System Administrator": "సిస్టమ్ అడ్మినిస్ట్రేటర్",
    "Logout": "లాగౌట్",
    "Home": "హోమ్",
    "AI Features": "AI ఫీచర్లు",
    "Loan Catalog": "రుణ రకాలు",
    "Login": "లాగిన్",
    "Register": "రిజిస్టర్",
    "Password": "పాస్‌వర్డ్",
    "Confirm Password": "పాస్‌వర్డ్‌ను ధృవీకరించండి",
    "Forgot Password?": "పాస్‌వర్డ్ మర్చిపోయారా?",
    "Sign In": "లాగిన్ అవ్వండి",
    "Sign Up": "నమోదు చేసుకోండి",
    "Create Account": "ఖాతాను సృష్టించండి",
    "Already have an account?": "ఇప్పటికే ఖాతా ఉందా?",
    "Don't have an account?": "ఖాతా లేదా?",
    "Update Password": "పాస్‌వర్డ్‌ను నవీకరించండి",
    "New Password": "కొత్త పాస్‌వర్డ్",
    "Confirm New Password": "కొత్త పాస్‌వర్డ్‌ను ధృవీకరించండి",
    "Registered Email Address": "నమోదిత ఈమెయిల్ చిరునామా",
    "Update credentials directly for your account": "మీ ఖాతా కోసం ఆధారాలను నేరుగా నవీకరించండి",
    "Reset Password": "పాస్‌వర్డ్ రీసెట్",
    "Remembered credentials?": "ఆధారాలు గుర్తున్నాయా?",
    "Login Here": "ఇక్కడ లాగిన్ అవ్వండి",
    "Register Account": "ఖాతాను నమోదు చేయండి",
    "Enter registered email": "నమోదిత ఈమెయిల్ నమోదు చేయండి",
    "Min 8 characters, Cap, Num, Special": "కనీసం 8 అక్షరాలు, పెద్ద అక్షరం, సంఖ్య, ప్రత్యేక అక్షరం",
    "Choose chatbot language / చాట్‌బాట్ భాషను ఎంచుకోండి:": "చాట్‌బాట్ భాషను ఎంచుకోండి / Please choose your language:",
    "Please choose your language / దయచేసి మీ భాషను ఎంచుకోండి": "దయచేసి మీ భాషను ఎంచుకోండి / Please choose your language",
    "English": "ఇంగ్లీష్",
    "Telugu": "తెలుగు",
    "Hello! I am your AI Smart Loan assistant. Ask me anything about loan products, interest rates, eligibility criteria, or document checklist rules. I support English and Telugu!": "హలో! నేను మీ AI స్మార్ట్ లోన్ అసిస్టెంట్. లోన్ ఉత్పత్తులు, వడ్డీ రేట్లు, అర్హత ప్రమాణాలు లేదా పత్రాల చెక్‌లిస్ట్ నియమాల గురించి నన్ను ఏదైనా అడగండి. నేను ఇంగ్లీష్ మరియు తెలుగుకు మద్దతు ఇస్తాను!",
    "Type a message...": "సందేశాన్ని టైప్ చేయండి...",
    "Listening (English/Telugu)... Speak now": "వింటున్నాను (ఇంగ్లీష్/తెలుగు)... మాట్లాడండి",
    "Language set to English. How can I help you today?": "భాష ఇంగ్లీష్ గా సెట్ చేయబడింది. ఈరోజు నేను మీకు ఏ విధంగా సహాయం చేయగలను?",
    "భాష తెలుగుగా సెట్ చేయబడింది. నేను మీకు ఏ విధంగా సహాయం చేయగలను?": "భాష తెలుగుగా సెట్ చేయబడింది. నేను మీకు ఏ విధంగా సహాయం చేయగలను?",
    "Voice assistant is not supported in this browser.": "ఈ బ్రౌజర్‌లో వాయిస్ అసిస్టెంట్ సపోర్ట్ లేదు.",
    "Sorry, I am having trouble connecting right now.": "క్షమించండి, ప్రస్తుతం కనెక్ట్ చేయడంలో సమస్య ఉంది.",
    "Full Name (As in Aadhaar)": "పూర్తి పేరు (ఆధార్ లో ఉన్నట్లు)",
    "Email Address": "ఈమెయిల్ చిరునామా",
    "Mobile Number": "మొబైల్ సంఖ్య",
    "Age": "వయస్సు",
    "Monthly Income": "నెలవారీ ఆదాయం",
    "Existing Loan EMIs": "ప్రస్తుత లోన్ EMIలు",
    "Requested Loan Amount": "కావలసిన రుణ మొత్తం",
    "Loan Purpose": "రుణం యొక్క ఉద్దేశం",
    "Date of Birth": "పుట్టిన తేదీ",
    "Gender": "లింగం",
    "Residential Address": "నివాస చిరునామా",
    "Employment Type": "ఉద్యోగ రకం",
    "Occupation": "వృత్తి",
    "Select Loan Type": "రుణ రకాన్ని ఎంచుకోండి",
    "Aadhaar Number": "ఆధార్ సంఖ్య",
    "PAN Card Number": "పాన్ కార్డ్ సంఖ్య",
    "Next Step": "తదుపరి దశ",
    "Previous Step": "మునుపటి దశ",
    "Submit Application": "దరఖాస్తును సమర్పించండి",
    "Personal Details": "వ్యక్తిగత వివరాలు",
    "Document Upload": "పత్రాల అప్‌లోడ్",
    "Biometric & Submit": "బయోమెట్రిక్ & సమర్పణ",
    "Application Progress": "దరఖాస్తు పురోగతి",
    "Instant Loan Eligibility": "తక్షణ రుణ అర్హత",
    "Verify & Upload Documents": "పత్రాలను ధృవీకరించండి & అప్‌లోడ్ చేయండి",
    "Facial Biometric Verification": "ముఖ బయోమెట్రిక్ వెరిఫికేషన్",
    "Loan Status Checklist": "రుణ స్థితి చెక్‌లిస్ట్",
    "Aadhaar Card PDF/Image": "ఆధార్ కార్డ్ PDF/చిత్రం",
    "PAN Card PDF/Image": "పాన్ కార్డ్ PDF/చిత్రం",
    "Salary Slip PDF/Image": "జీతం స్లిప్ PDF/చిత్రం",
    "College ID Card PDF/Image": "కళాశాల ఐడి కార్డ్ PDF/చిత్రం",
    "Passport Photo JPG/PNG": "పాస్‌పోర్ట్ సైజ్ ఫోటో JPG/PNG",
    "Eligibility Checked": "అర్హత తనిఖీ చేయబడింది",
    "Aadhaar Document Uploaded": "ఆధార్ పత్రం అప్‌లోడ్ చేయబడింది",
    "PAN Document Uploaded": "పాన్ పత్రం అప్‌లోడ్ చేయబడింది",
    "Income/Salary Document Uploaded": "ఆదాయ/జీతం పత్రం అప్‌లోడ్ చేయబడింది",
    "Student ID Document Uploaded": "విద్యార్థి ఐడి పత్రం అప్‌లోడ్ చేయబడింది",
    "Passport Photo Uploaded": "పాస్‌పోర్ట్ ఫోటో అప్‌లోడ్ చేయబడింది",
    "Documents Verified": "పత్రాలు వెరిఫై చేయబడ్డాయి",
    "Face Biometrics Verified": "ముఖ బయోమెట్రిక్స్ వెరిఫై చేయబడ్డాయి",
    "Open Camera & Capture Face": "కెమెరాను తెరిచి ముఖాన్ని క్యాప్చర్ చేయండి",
    "Capture Photo": "ఫోటో తీయండి",
    "Verify Face Match": "ముఖ సరిపోలికను వెరిఫై చేయండి",
    "Final Submit Application": "చివరి దరఖాస్తు సమర్పణ",
    "Appointment Scheduled": "అపాయింట్‌మెంట్ షెడ్యూల్ చేయబడింది",
    "Download Appointment Letter": "అపాయింట్‌మెంట్ లేఖను డౌన్‌లోడ్ చేసుకోండి",
    "Verification Officer desk": "వెరిఫికేషన్ అధికారి డెస్క్",
    "Verification Officer Queue desk": "వెరిఫికేషన్ అధికారి క్యూ డెస్క్",
    "System Admin Analytics control room": "సిస్టమ్ అడ్మిన్ అనలిటిక్స్ కంట్రోల్ రూమ్",
    "Aadhaar Card": "ఆధార్ కార్డ్",
    "PAN Card": "పాన్ కార్డ్",
    "Passport Photo": "పాస్‌పోర్ట్ ఫోటో",
    "Passport Size Photo": "పాస్‌పోర్ట్ సైజ్ ఫోటో",
    "Income Proof": "ఆదాయ నిరూపణ పత్రం",
    "Bank Statement": "బ్యాంక్ స్టేట్‌మెంట్",
    "Salary Slip": "జీతం స్లిప్",
    "Property Documents": "ఆస్తి పత్రాలు",
    "Sale Agreement": "విక్రయ ఒప్పందం",
    "Address Proof": "చిరునామా నిరూపణ",
    "Admission Letter": "ప్రవేశ లేఖ",
    "Fee Structure": "ఫీజు నిర్మాణం",
    "Academic Certificates": "విద్యా ధృవీకరణ పత్రాలు",
    "Co-applicant Documents": "సహ-దరఖాస్తుదారు పత్రాలు",
    "Vehicle Quotation": "వాహన కొటేషన్",
    "Driving Licence": "డ్రైవింగ్ లైసెన్స్",
    "GST Certificate": "GST సర్టిఫికేట్",
    "Business Registration": "వ్యాపార నమోదు పత్రం",
    "ITR": "ITR రిటర్న్స్",
    "Profit and Loss Statement": "లాభ నష్టాల నివేదిక",
    "Pending": "పెండింగ్",
    "Uploaded": "అప్‌లోడ్ చేయబడింది",
    "Verified": "ధృవీకరించబడింది",
    "Reupload Required": "మళ్ళీ అప్‌లోడ్ చేయాలి",
    "App Settings": "యాప్ సెట్టింగ్స్",
    "Preferences": "ప్రాధాన్యతలు",
    "Language Preference": "భాషా ప్రాధాన్యత",
    "Theme Preference": "థీమ్ ప్రాధాన్యత",
    "System Default": "సిస్టమ్ డిఫాల్ట్",
    "Light": "లైట్",
    "Dark": "డార్క్",
    "Security scan completed. No major issue detected.": "భద్రతా స్కాన్ పూర్తయింది. ఎటువంటి ప్రధాన సమస్య కనుగొనబడలేదు.",
    "Officer Remarks": "అధికారి వ్యాఖ్యలు",
    "Application status": "దరఖాస్తు స్థితి"
};

// --- Language Controller & DOM Walk Translator ---
function translateText(text) {
    if (!text) return null;
    let trimmed = text.trim().replace(/\s+/g, ' ');
    if (UI_TRANSLATIONS[trimmed]) {
        return UI_TRANSLATIONS[trimmed];
    }
    if (UI_TRANSLATIONS[trimmed.toLowerCase()]) {
        return UI_TRANSLATIONS[trimmed.toLowerCase()];
    }
    let endsWithColon = trimmed.endsWith(':');
    let cleanText = endsWithColon ? trimmed.slice(0, -1).trim() : trimmed;
    if (UI_TRANSLATIONS[cleanText]) {
        let trans = UI_TRANSLATIONS[cleanText];
        if (endsWithColon) trans += ':';
        return trans;
    }
    return null;
}

let isTranslating = false;

function translateDOM(root, lang) {
    isTranslating = true;
    traverseNodes(root, lang);
    isTranslating = false;
}

function traverseNodes(node, lang) {
    if (node.nodeType === Node.TEXT_NODE) {
        const parent = node.parentNode;
        if (parent && parent.tagName !== 'SCRIPT' && parent.tagName !== 'STYLE') {
            const originalText = node.nodeValue.trim().replace(/\s+/g, ' ');
            if (originalText) {
                if (!node._originalValue) {
                    node._originalValue = node.nodeValue;
                }
                if (lang === 'te') {
                    const translated = translateText(originalText);
                    if (translated) {
                        node.nodeValue = node._originalValue.replace(originalText, translated);
                    }
                } else {
                    node.nodeValue = node._originalValue;
                }
            }
        }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA') {
            const placeholder = node.getAttribute('placeholder');
            if (placeholder) {
                if (!node._originalPlaceholder) {
                    node._originalPlaceholder = placeholder;
                }
                if (lang === 'te') {
                    const translated = translateText(placeholder);
                    if (translated) {
                        node.setAttribute('placeholder', translated);
                    }
                } else {
                    node.setAttribute('placeholder', node._originalPlaceholder);
                }
            }
        }
        
        const key = node.getAttribute('data-i18n') || node.getAttribute('data-translate');
        if (key) {
            if (!node._originalHTML) {
                node._originalHTML = node.innerHTML;
            }
            if (lang === 'te') {
                const translated = (TRANSLATIONS['te'] && TRANSLATIONS['te'][key]) || UI_TRANSLATIONS[key];
                if (translated) {
                    node.innerHTML = translated;
                }
            } else {
                if (TRANSLATIONS['en'] && TRANSLATIONS['en'][key]) {
                    node.innerHTML = TRANSLATIONS['en'][key];
                } else {
                    node.innerHTML = node._originalHTML;
                }
            }
        }
        for (let child of node.childNodes) {
            traverseNodes(child, lang);
        }
    }
}

let translationObserver = null;
function setupTranslationObserver(lang) {
    if (translationObserver) {
        translationObserver.disconnect();
    }
    translationObserver = new MutationObserver((mutations) => {
        if (isTranslating) return;
        mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        translateDOM(node, lang);
                    }
                });
            } else if (mutation.type === 'characterData') {
                const node = mutation.target;
                const parent = node.parentNode;
                if (parent && parent.tagName !== 'SCRIPT' && parent.tagName !== 'STYLE') {
                    const originalText = node.nodeValue.trim().replace(/\s+/g, ' ');
                    if (originalText) {
                        isTranslating = true;
                        if (lang === 'te') {
                            const translated = translateText(originalText);
                            if (translated) {
                                parent.setAttribute('data-orig-text', node.nodeValue);
                                node.nodeValue = node.nodeValue.replace(originalText, translated);
                            }
                        } else {
                            parent.setAttribute('data-orig-text', node.nodeValue);
                        }
                        isTranslating = false;
                    }
                }
            }
        });
    });
    translationObserver.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });
}

async function persistPreferences(theme, lang) {
    if (localStorage.getItem("token")) {
        try {
            await apiPost("/users/settings", { theme: theme, language: lang });
        } catch(e) {
            console.error("Failed to persist user preferences:", e);
        }
    }
}

function setLanguage(lang) {
    localStorage.setItem("selected_lang", lang);
    translateDOM(document.body, lang);
    setupTranslationObserver(lang);
    
    document.querySelectorAll("#lang-selector, #settings-lang-selector").forEach(select => {
        select.value = lang;
    });

    const activeTheme = localStorage.getItem("theme") || "system";
    persistPreferences(activeTheme, lang);
}

// --- Theme Theme Mode Selector ---
function initTheme() {
    const savedTheme = localStorage.getItem("theme") || "system";
    applyTheme(savedTheme);
    
    document.querySelectorAll("#theme-selector, #settings-theme-selector").forEach(select => {
        select.value = savedTheme;
    });
}

function applyTheme(theme) {
    if (theme === "system") {
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute("data-theme", systemDark ? "dark" : "light");
    } else {
        document.documentElement.setAttribute("data-theme", theme);
    }
}

function changeTheme(themeVal) {
    localStorage.setItem("theme", themeVal);
    applyTheme(themeVal);
    
    document.querySelectorAll("#theme-selector, #settings-theme-selector").forEach(select => {
        select.value = themeVal;
    });

    const activeLang = localStorage.getItem("selected_lang") || "en";
    persistPreferences(themeVal, activeLang);
}

// Listen for system theme preference changes dynamically
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    const savedTheme = localStorage.getItem("theme") || "system";
    if (savedTheme === "system") {
        document.documentElement.setAttribute("data-theme", e.matches ? "dark" : "light");
    }
});

// --- DomContentLoaded Init ---
document.addEventListener("DOMContentLoaded", async () => {
    initTheme();
    
    // Load preferred language
    const preferredLang = localStorage.getItem("selected_lang") || "en";
    setLanguage(preferredLang);
    
    // If logged in, fetch settings from database to sync
    if (localStorage.getItem("token")) {
        try {
            const settings = await apiGet("/users/settings");
            if (settings && (settings.theme || settings.language)) {
                const dbTheme = settings.theme || "system";
                const dbLang = settings.language || "en";
                
                // If they differ from local, update local
                if (localStorage.getItem("theme") !== dbTheme) {
                    localStorage.setItem("theme", dbTheme);
                    applyTheme(dbTheme);
                    document.querySelectorAll("#theme-selector, #settings-theme-selector").forEach(select => {
                        select.value = dbTheme;
                    });
                }
                if (localStorage.getItem("selected_lang") !== dbLang) {
                    localStorage.setItem("selected_lang", dbLang);
                    translateDOM(document.body, dbLang);
                    setupTranslationObserver(dbLang);
                    document.querySelectorAll("#lang-selector, #settings-lang-selector").forEach(select => {
                        select.value = dbLang;
                    });
                }
            }
        } catch(e) {
            console.error("Could not sync user settings: ", e);
        }
    }
    
    // Delegate selector change events
    document.body.addEventListener("change", (e) => {
        if (e.target && (e.target.id === "theme-selector" || e.target.id === "settings-theme-selector")) {
            changeTheme(e.target.value);
        }
        if (e.target && (e.target.id === "lang-selector" || e.target.id === "settings-lang-selector")) {
            setLanguage(e.target.value);
        }
    });
});

// --- Dynamic Notification Toast Alert ---
function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast-alert toast-${type}`;
    toast.style.position = "fixed";
    toast.style.bottom = "20px";
    toast.style.left = "20px";
    toast.style.padding = "1rem 2rem";
    toast.style.borderRadius = "8px";
    toast.style.color = "white";
    toast.style.fontWeight = "600";
    toast.style.zIndex = "9999";
    toast.style.boxShadow = "0 4px 15px rgba(0,0,0,0.2)";
    toast.style.animation = "slideIn 0.3s forwards";
    
    // Set color based on status type
    if (type === "success") {
        toast.style.background = "#0f766e";
    } else if (type === "error") {
        toast.style.background = "#be123c";
    } else if (type === "warning") {
        toast.style.background = "#b45309";
    } else {
        toast.style.background = "#3b82f6";
    }
    
    toast.innerText = message;
    document.body.appendChild(toast);
    
    // Slide In animation logic injection dynamically
    if (!document.getElementById("toast-animation-style")) {
        const style = document.createElement("style");
        style.id = "toast-animation-style";
        style.innerHTML = `
            @keyframes slideIn {
                from { transform: translateX(-100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(-100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    setTimeout(() => {
        toast.style.animation = "slideOut 0.3s forwards";
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 4000);
}

window.startFieldVoiceInput = function(fieldId) {
    const inputElement = document.getElementById(fieldId);
    if (!inputElement) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        showToast("Voice input is not supported in this browser.", "error");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    const portalLang = localStorage.getItem("selected_lang") || "en";
    recognition.lang = portalLang === "te" ? "te-IN" : "en-US";

    const btn = document.querySelector(`.btn-voice-input[data-field="${fieldId}"]`);
    let originalHtml = "";
    if (btn) {
        originalHtml = btn.innerHTML;
        btn.innerHTML = `<i class="fa-solid fa-microphone fa-bounce" style="color: var(--danger);"></i>`;
        btn.disabled = true;
    }

    showToast(portalLang === "te" ? "వింటున్నాము... మాట్లాడండి." : "Listening... Speak now.", "info");

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        let cleanedText = transcript.trim();
        if (cleanedText.endsWith('.')) {
            cleanedText = cleanedText.slice(0, -1);
        }
        inputElement.value = cleanedText;
        inputElement.dispatchEvent(new Event('input'));
        inputElement.dispatchEvent(new Event('change'));
        showToast(portalLang === "te" ? "స్పీచ్ క్యాప్చర్ విజయవంతమైంది!" : "Speech captured successfully!", "success");
    };

    recognition.onerror = (e) => {
        console.error("Field Speech Recognition error: ", e);
        showToast(portalLang === "te" ? "దయచేసి మళ్లీ ప్రయత్నించండి." : "Speech recognition failed. Please try again.", "warning");
    };

    recognition.onend = () => {
        if (btn) {
            btn.innerHTML = originalHtml;
            btn.disabled = false;
        }
    };

    recognition.start();
};
