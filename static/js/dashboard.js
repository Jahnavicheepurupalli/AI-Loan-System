// Global variables to track state
let activeApplicationData = {
    name: "", email: "", mobile: "", age: 30, dob: "", gender: "Male",
    address: "", employment_type: "Salaried", occupation: "", income: 0,
    existing_loans: 0, loan_type: "Personal Loan", loan_amount: 0,
    emi: 0, interest_rate: 10.0, tenure: 5, risk_score: 10,
    ocr_results: {}, face_verification: {}, fraud_results: {}, location_coords: "",
    uploaded_documents: {}
};

let uploadedAadhaarFilename = "";
let uploadedPanFilename = "";

document.addEventListener("DOMContentLoaded", () => {
    // ----------------- SIDEBAR TABS CONTROLLER -----------------
    const loanTypeSelect = document.getElementById("apply-loan-type");
    if (loanTypeSelect) {
        loanTypeSelect.addEventListener("change", async () => {
            const selectedType = loanTypeSelect.value;
            activeApplicationData.loan_type = selectedType;
            await loadLoanDocuments(selectedType);
            if (typeof generateDocumentsChecklist === "function") {
                generateDocumentsChecklist(selectedType, activeApplicationData.employment_type, true);
            }
        });
    }
    const links = document.querySelectorAll(".sidebar-link");

    window.showSection = function(sectionId) {
        links.forEach(l => l.classList.remove("active"));
        document.querySelectorAll(".dashboard-section").forEach(sec => {
            sec.classList.remove("active");
        });
        
        const targetLink = document.querySelector(`.sidebar-link[data-section="${sectionId}"]`);
        if (targetLink) {
            targetLink.classList.add("active");
        }
        
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add("active");
        }
        
        // Context specific actions
        if (sectionId === 'overview') {
            fetchApplications();
        } else if (sectionId === 'notifications') {
            fetchNotifications();
        } else if (sectionId === 'tracking') {
            fetchApplicationsForTracking();
        }
    };

    links.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute("data-section");
            showSection(sectionId);
        });
    });

    // ----------------- INITIAL LOAD DATA -----------------
    fetchApplications();
    loadDashboardCatalog();
    restoreWizardState();

    // ----------------- RATING STAR CONTROLLER -----------------
    const stars = document.querySelectorAll("#rating-stars i");
    const ratingInput = document.getElementById("feedback-rating");

    stars.forEach(star => {
        star.addEventListener("click", () => {
            const rating = star.getAttribute("data-rating");
            ratingInput.value = rating;
            
            // Color stars
            stars.forEach(s => {
                const currentRating = s.getAttribute("data-rating");
                if (currentRating <= rating) {
                    s.classList.replace("fa-regular", "fa-solid");
                } else {
                    s.classList.replace("fa-solid", "fa-regular");
                }
            });
        });
    });

    // Submit Feedback
    const fbForm = document.getElementById("feedback-form");
    if(fbForm) {
        fbForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const rating = ratingInput.value;
            const message = document.getElementById("feedback-message").value;
            
            try {
                const result = await apiPost("/feedback", { rating, message });
                showToast("Feedback submitted successfully!", "success");
                fbForm.reset();
                // reset stars
                stars.forEach(s => s.classList.replace("fa-solid", "fa-regular"));
            } catch(e) {
                console.error(e);
                showToast(e.message || "Feedback submission failed", "error");
            }
        });
    }

    // ----------------- EMI CALCULATOR CONTROLLER -----------------
    const emiBtn = document.getElementById("btn-calc-emi");
    if(emiBtn) {
        emiBtn.addEventListener("click", () => {
            const amount = parseFloat(document.getElementById("emi-amount").value);
            const rate = parseFloat(document.getElementById("emi-rate").value);
            const tenureVal = parseInt(document.getElementById("emi-tenure").value);
            const tenureUnit = document.getElementById("emi-tenure-unit") ? document.getElementById("emi-tenure-unit").value : "years";
            const tenureInMonths = tenureUnit === "years" ? tenureVal * 12 : tenureVal;
            
            const r = (rate / 12) / 100;
            const n = tenureInMonths;
            
            if(amount > 0 && rate > 0 && tenureInMonths > 0) {
                const emi = (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
                const total = emi * n;
                const interest = total - amount;
                
                document.getElementById("emi-monthly").innerText = `₹${emi.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
                document.getElementById("emi-interest").innerText = `₹${interest.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
                document.getElementById("emi-total").innerText = `₹${total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
            } else {
                showToast("Please enter valid positive numbers.", "warning");
            }
        });
    }

    // ----------------- AI LOAN RECOMMENDATIONS -----------------
    const recForm = document.getElementById("recommend-form");
    if(recForm) {
        recForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const category = document.getElementById("rec-category").value;
            const income = parseFloat(document.getElementById("rec-income").value);
            const existing_loans = parseFloat(document.getElementById("rec-emi").value);
            const age = parseInt(document.getElementById("rec-age").value);
            const loan_amount = parseFloat(document.getElementById("rec-amount").value);
            const employment_type = document.getElementById("rec-emp-type").value;
            const purpose = document.getElementById("rec-purpose").value;
            
            showToast("Calling Groq AI Engine...", "info");
            
            try {
                const result = await apiPost("/loans/recommend", { 
                    category, 
                    income, 
                    existing_loans, 
                    age, 
                    loan_amount,
                    employment_type,
                    purpose
                });
                
                if (result) {
                    const resultDiv = document.getElementById("recommendation-result");
                    resultDiv.style.display = "block";
                    
                    let benefitsHtml = "";
                    if(result.benefits) {
                        result.benefits.forEach(b => {
                            benefitsHtml += `<li><i class="fa-solid fa-circle-check" style="color: var(--success-light); margin-right: 6px;"></i> ${b}</li>`;
                        });
                    }
                    
                    resultDiv.innerHTML = `
                        <h3 style="margin-bottom: 1rem;"><i class="fa-solid fa-wand-magic-sparkles"></i> AI Recommends: <b>${result.recommended_loan}</b></h3>
                        <p style="margin-bottom: 1.25rem; font-size: 1.05rem;">${result.why_recommended}</p>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin: 1.5rem 0;">
                            <div style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px;">
                                <span style="font-size: 0.8rem; color: var(--text-muted);">ESTIMATED MONTHLY EMI</span>
                                <div style="font-size: 1.4rem; font-weight: 700;">₹${parseFloat(result.estimated_emi).toLocaleString()}</div>
                            </div>
                            <div style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px;">
                                <span style="font-size: 0.8rem; color: var(--text-muted);">RISK INDEX</span>
                                <div style="font-size: 1.4rem; font-weight: 700; color: ${result.risk_level === 'High Risk' ? 'var(--danger)' : 'var(--success-light)'}">${result.risk_level}</div>
                            </div>
                            <div style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px;">
                                <span style="font-size: 0.8rem; color: var(--text-muted);">APPROVAL CHANCE</span>
                                <div style="font-size: 1.4rem; font-weight: 700;">${result.approval_chance}</div>
                            </div>
                        </div>

                        <h4 style="margin-bottom: 0.75rem;">Key Benefits:</h4>
                        <ul class="loan-spec-list" style="border:none; margin: 0; padding:0; display:flex; flex-direction:column; gap:8px;">
                            ${benefitsHtml}
                        </ul>
                    `;
                }
            } catch(err) {
                console.error(err);
                showToast("AI Service request failed", "error");
            }
        });
    }

    // ----------------- STEP 1 DETAILS SUBMIT -----------------
    const detailsForm = document.getElementById("apply-details-form");
    const empSelector = document.getElementById("apply-emp-type");
    
    // Setup initial documents requirement message
    updateDocRequirementMessage(empSelector.value);
    empSelector.addEventListener("change", (e) => {
        updateDocRequirementMessage(e.target.value);
    });

    // Geolocation detector button handler
    const detectLocBtn = document.getElementById("btn-detect-location");
    const locStatus = document.getElementById("location-status");
    if (detectLocBtn) {
        detectLocBtn.addEventListener("click", () => {
            if (!navigator.geolocation) {
                showToast("Geolocation is not supported by your browser.", "error");
                locStatus.innerText = "Fallback: Geolocation unsupported.";
                return;
            }
            locStatus.innerText = "Accessing device GPS location...";
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude.toFixed(6);
                    const lng = position.coords.longitude.toFixed(6);
                    const coords = `Latitude: ${lat}, Longitude: ${lng}`;
                    
                    const addressField = document.getElementById("apply-address");
                    if (addressField) {
                        // Append or set the coordinates at the end of the address
                        if (addressField.value.trim()) {
                            addressField.value = addressField.value.trim() + `\n(GPS Coordinates: ${coords})`;
                        } else {
                            addressField.value = `(GPS Coordinates: ${coords})\n`;
                        }
                    }
                    activeApplicationData.location_coords = coords;
                    locStatus.innerText = "Location detected successfully!";
                    locStatus.style.color = "var(--success-light)";
                    showToast("GPS Location coordinates attached!", "success");
                },
                (error) => {
                    console.warn("Geolocation failed: ", error);
                    locStatus.innerText = "Fallback: Manual address entry required.";
                    locStatus.style.color = "var(--text-muted)";
                    showToast("Location access denied or unavailable. Please enter address manually.", "warning");
                },
                { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
            );
        });
    }

    document.getElementById("btn-details-next").addEventListener("click", async () => {
        // Run validations
        if (!detailsForm.checkValidity()) {
            detailsForm.reportValidity();
            return;
        }

        // Fetch inputs
        activeApplicationData.name = document.getElementById("apply-name").value;
        activeApplicationData.email = document.getElementById("apply-email").value;
        activeApplicationData.mobile = document.getElementById("apply-mobile").value;
        activeApplicationData.age = parseInt(document.getElementById("apply-age").value);
        activeApplicationData.dob = document.getElementById("apply-dob").value;
        activeApplicationData.gender = document.getElementById("apply-gender").value;
        activeApplicationData.address = document.getElementById("apply-address").value;
        activeApplicationData.employment_type = empSelector.value;
        activeApplicationData.occupation = document.getElementById("apply-occupation").value;
        activeApplicationData.income = parseFloat(document.getElementById("apply-income").value);
        activeApplicationData.existing_loans = parseFloat(document.getElementById("apply-loans").value);
        activeApplicationData.loan_type = document.getElementById("apply-loan-type").value;
        activeApplicationData.loan_amount = parseFloat(document.getElementById("apply-amount").value);
        activeApplicationData.purpose = document.getElementById("apply-purpose").value;
        activeApplicationData.category = document.getElementById("apply-category").value;
        activeApplicationData.aadhaar_number = document.getElementById("apply-aadhaar").value.replace(/\s/g, '');
        activeApplicationData.pan_number = document.getElementById("apply-pan").value;

        // Perform instant eligibility check backend computation
        showToast("Auditing Loan Qualification...", "info");
        try {
            const result = await apiPost("/applications/check-eligibility", activeApplicationData);
            
            if(result) {
                // Populate variables
                activeApplicationData.emi = result.emi;
                activeApplicationData.interest_rate = result.interest_rate;
                activeApplicationData.tenure = result.tenure || 5;
                activeApplicationData.risk_score = result.risk_score;
                
                const banner = document.getElementById("instant-eligibility-banner");
                banner.style.display = "block";
                
                if (result.eligible) {
                    banner.style.borderColor = "var(--success-light)";
                    banner.style.background = "rgba(15, 118, 110, 0.1)";
                    banner.innerHTML = `
                        <h4 style="color: var(--success-light); margin-bottom: 8px;"><i class="fa-solid fa-circle-check"></i> Eligible for Loan!</h4>
                        <p>Computed interest rate: <b>${result.interest_rate}%</b> p.a. over <b>${result.tenure} years</b>. Estimated EMI: <b>₹${result.emi.toLocaleString()}</b>.</p>
                        <p style="font-size: 0.8rem; margin-top: 4px; color: var(--text-muted);">Risk Score: ${result.risk_score}% | Sanction Likelihood: ${result.approval_probability}%</p>
                    `;
                    
                    // Generate dynamic checklist
                    generateDocumentsChecklist(activeApplicationData.loan_type, activeApplicationData.employment_type, true);
                    
                    // Proceed to step 2 pane
                    setTimeout(() => {
                        switchStepperPane(2);
                    }, 1500);
                } else {
                    banner.style.borderColor = "var(--danger)";
                    banner.style.background = "rgba(190, 18, 60, 0.1)";
                    
                    let rejectionReasons = "";
                    result.reasons.forEach(r => rejectionReasons += `<li>• ${r}</li>`);
                    
                    banner.innerHTML = `
                        <h4 style="color: var(--danger); margin-bottom: 8px;"><i class="fa-solid fa-circle-exclamation"></i> Eligibility Warnings Found!</h4>
                        <ul style="list-style:none; padding:0; margin-bottom: 8px;">${rejectionReasons}</ul>
                        <p style="font-size: 0.85rem; font-weight:600;">AI Suggestions to improve: ${result.suggestions.join(" ")}</p>
                    `;
                }
            }
        } catch(e) {
            console.error(e);
            showToast("Eligibility Check Service error", "error");
        }
    });

    // ----------------- DRAG & DROP DOCUMENT AUDITING -----------------
    document.getElementById("btn-docs-prev").addEventListener("click", () => switchStepperPane(1));
    
    // Enable camera pane
    document.getElementById("btn-docs-next").addEventListener("click", async () => {
        const nextBtn = document.getElementById("btn-docs-next");
        if (nextBtn.disabled) return;
        
        showToast("Running cross-document verification...", "info");
        nextBtn.disabled = true;
        
        try {
            const result = await apiPost("/verify-documents", {});
            if (result) {
                showToast(`Document Verification: ${result.status}`, "success");
                
                // Save verification results
                activeApplicationData.ocr_results = activeApplicationData.ocr_results || {};
                activeApplicationData.ocr_results.name_match = result.name_match;
                activeApplicationData.ocr_results.dob_match = result.dob_match;
                activeApplicationData.ocr_results.status = result.status;
                
                // Save wizard state
                saveWizardState();
                
                // Automatically move to Step 3 Biometric
                switchStepperPane(3);
                initWebcam();
            } else {
                showToast("Verification failed. Please check your uploaded documents.", "error");
                nextBtn.disabled = false;
            }
        } catch (err) {
            console.error(err);
            showToast(err.message || "Failed to verify documents.", "error");
            nextBtn.disabled = false;
        }
    });

    // ----------------- BIOMETRIC FACE VERIFICATION CONTROLLER -----------------
    const captureBtn = document.getElementById("btn-capture-snapshot");
    const recaptureBtn = document.getElementById("btn-recapture");
    const webcam = document.getElementById("webcam");
    const canvas = document.getElementById("snapshot-canvas");
    const imgPreview = document.getElementById("face-captured-preview");
    const faceMatchResult = document.getElementById("face-match-result");
    const submitAppBtn = document.getElementById("btn-submit-application");

    const livenessOverlay = document.getElementById("liveness-overlay");
    const livenessPrompt = document.getElementById("liveness-prompt");
    const livenessTimer = document.getElementById("liveness-timer");
    const livenessLoader = document.getElementById("liveness-loader");
    const livenessStepsPanel = document.getElementById("liveness-steps-panel");

    let webcamStream = null;
    let livenessTimeoutTimer = null;
    let livenessStepInterval = null;
    let secondsLeft = 45;
    let livenessActive = false;

    async function initWebcam() {
        // Reset camera previews & buttons
        webcam.style.display = "block";
        imgPreview.style.display = "none";
        captureBtn.style.display = "inline-flex";
        captureBtn.disabled = false;
        recaptureBtn.style.display = "none";
        faceMatchResult.style.display = "none";
        
        // Hide overlays initially
        if (livenessOverlay) livenessOverlay.style.display = "none";
        if (livenessLoader) livenessLoader.style.display = "none";
        if (livenessStepsPanel) livenessStepsPanel.style.display = "none";

        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("navigator.mediaDevices.getUserMedia is not supported by your browser.");
            }
            webcamStream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
            webcam.srcObject = webcamStream;
        } catch(e) {
            console.error("Camera access failed:", e);
            showToast("Camera access failed. Routing to manual review.", "warning");
            
            faceMatchResult.style.display = "block";
            faceMatchResult.style.borderColor = "var(--warning)";
            faceMatchResult.style.background = "rgba(180, 83, 9, 0.1)";
            faceMatchResult.innerHTML = `
                <h4 style="color: var(--warning);"><i class="fa-solid fa-triangle-exclamation"></i> Manual Review Required</h4>
                <p>Webcam stream could not be initialized: ${e.message || 'Permission Denied'}</p>
                <span style="font-size:0.85rem; color: var(--text-muted);">Please proceed to submit the application. It will be routed for manual review by an officer.</span>
            `;
            activeApplicationData.face_verification = {
                status: "Manual Review Required",
                similarity: 0.0,
                message: e.message || "Webcam access failed or denied."
            };
            submitAppBtn.disabled = false;
        }
    }

    function cleanupLivenessTimers() {
        livenessActive = false;
        if (livenessTimeoutTimer) clearTimeout(livenessTimeoutTimer);
        if (livenessStepInterval) clearInterval(livenessStepInterval);
    }

    if (captureBtn) {
        captureBtn.addEventListener("click", () => {
            if (!webcamStream) {
                showToast("Camera stream not available. Please retry.", "error");
                return;
            }

            // Lock button, show checkpoints overlays
            captureBtn.disabled = true;
            livenessActive = true;
            if (livenessOverlay) livenessOverlay.style.display = "flex";
            if (livenessLoader) livenessLoader.style.display = "block";
            if (livenessStepsPanel) livenessStepsPanel.style.display = "flex";

            // Reset checklists icons/colors
            for (let i = 0; i < 4; i++) {
                const stepEl = document.getElementById(`liveness-step-${i}`);
                if (stepEl) {
                    stepEl.style.color = "var(--text-muted)";
                    stepEl.innerHTML = `<i class="fa-solid fa-circle-notch"></i> ${getStepLabel(i)}`;
                }
            }

            secondsLeft = 45;
            if (livenessTimer) livenessTimer.innerText = `Time remaining: ${secondsLeft}s`;

            // Start 45s countdown timer
            livenessStepInterval = setInterval(() => {
                secondsLeft--;
                if (livenessTimer) livenessTimer.innerText = `Time remaining: ${secondsLeft}s`;
                if (secondsLeft <= 0) {
                    cleanupLivenessTimers();
                    showToast("Liveness check timed out. Please try again.", "error");
                    stopWebcam();
                    initWebcam();
                }
            }, 1000);

            // Start step sequential prompts
            runLivenessStep(0);
        });
    }

    function getStepLabel(step) {
        const labels = ["Smile", "Head Left", "Head Right", "Blink"];
        return labels[step] || "";
    }

    function stopWebcam() {
        if (webcamStream) {
            webcamStream.getTracks().forEach(track => track.stop());
            webcamStream = null;
        }
    }

    function runLivenessStep(step) {
        if (!livenessActive) return;

        const prompts = [
            "Step 1: Look straight and smile",
            "Step 2: Turn your head to the Left",
            "Step 3: Turn your head to the Right",
            "Step 4: Look straight and blink"
        ];

        if (livenessPrompt) livenessPrompt.innerText = prompts[step];
        const stepEl = document.getElementById(`liveness-step-${step}`);
        if (stepEl) {
            stepEl.style.color = "var(--primary-light)";
            stepEl.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${getStepLabel(step)}`;
        }

        livenessTimeoutTimer = setTimeout(() => {
            if (!livenessActive) return;

            // Snap frame for step
            if (stepEl) {
                stepEl.style.color = "var(--success-light)";
                stepEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${getStepLabel(step)}`;
            }

            if (step < 3) {
                runLivenessStep(step + 1);
            } else {
                // All steps completed!
                cleanupLivenessTimers();
                proceedCapture();
            }
        }, 3000); // 3 seconds per interaction step
    }

    function proceedCapture() {
        canvas.width = webcam.videoWidth || 640;
        canvas.height = webcam.videoHeight || 480;
        const ctx = canvas.getContext("2d");
        
        if (webcamStream && webcam.videoWidth > 0) {
            // Draw matching frame
            ctx.drawImage(webcam, 0, 0, canvas.width, canvas.height);
        } else {
            // Placeholder grey box
            ctx.fillStyle = "#333333";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        const dataUrl = canvas.toDataURL("image/jpeg");
        imgPreview.src = dataUrl;
        imgPreview.style.display = "block";
        webcam.style.display = "none";
        
        if (livenessOverlay) livenessOverlay.style.display = "none";
        if (livenessLoader) livenessLoader.style.display = "none";

        stopWebcam();

        captureBtn.style.display = "none";
        recaptureBtn.style.display = "inline-flex";

        verifyFaceSnapshot();
    }

    if (recaptureBtn) {
        recaptureBtn.addEventListener("click", () => {
            cleanupLivenessTimers();
            stopWebcam();
            initWebcam();
        });
    }

    const facePrevBtn = document.getElementById("btn-face-prev");
    if (facePrevBtn) {
        facePrevBtn.addEventListener("click", () => {
            cleanupLivenessTimers();
            stopWebcam();
            switchStepperPane(2);
        });
    }

    window.renderFaceVerificationSuccess = function(similarity, liveness, timestamp, statusMessage) {
        const faceResultBox = document.getElementById("face-match-result");
        if (faceResultBox) {
            faceResultBox.style.display = "block";
            faceResultBox.style.borderColor = "var(--success-light)";
            faceResultBox.style.background = "rgba(15, 118, 110, 0.1)";
            faceResultBox.innerHTML = `
                <h4 style="color: var(--success-light); margin-bottom: 8px;"><i class="fa-solid fa-circle-check"></i> ✓ Face Verified Successfully</h4>
                <p>Biometric Similarity Score: <b>${similarity}%</b></p>
                <p>Liveness Check Result: <b>${liveness}</b></p>
                <p>Verification Timestamp: <b>${timestamp}</b></p>
                <span style="font-size:0.85rem; color: var(--text-secondary); display: block; margin-top: 6px;">${statusMessage || 'Identity matches reference documents.'}</span>
            `;
        }
        
        // Hide camera buttons
        const capBtn = document.getElementById("btn-capture-snapshot");
        if (capBtn) capBtn.style.display = "none";
        const recapBtn = document.getElementById("btn-recapture");
        if (recapBtn) recapBtn.style.display = "none";
        const camView = document.getElementById("webcam-view");
        if (camView) camView.style.display = "none";
        
        // Show Reset Verification button
        const resetBtn = document.getElementById("btn-reset-verification");
        if (resetBtn) resetBtn.style.display = "inline-flex";
        
        // Enable submit button
        const submitBtn = document.getElementById("btn-submit-application");
        if (submitBtn) submitBtn.disabled = false;
        
        // Save current wizard state
        saveWizardState();
    }

    const resetVerificationBtn = document.getElementById("btn-reset-verification");
    if (resetVerificationBtn) {
        resetVerificationBtn.addEventListener("click", async () => {
            try {
                showToast("Resetting face verification...", "info");
                const res = await apiPost("/face/reset", {});
                if (res) {
                    showToast("Verification reset. Please recapture.", "success");
                    
                    // Reset variables
                    activeApplicationData.face_verification = {};
                    saveWizardState();
                    if (submitAppBtn) submitAppBtn.disabled = true;
                    
                    // Reset UI
                    faceMatchResult.style.display = "none";
                    resetVerificationBtn.style.display = "none";
                    imgPreview.style.display = "none";
                    
                    // Restart Webcam
                    cleanupLivenessTimers();
                    stopWebcam();
                    initWebcam();
                }
            } catch (err) {
                console.error("Failed to reset verification:", err);
                showToast("Failed to reset verification.", "error");
            }
        });
    }

    async function verifyFaceSnapshot() {
        showToast("Processing Biometric Face Verification...", "info");
        
        canvas.toBlob(async (blob) => {
            const formData = new FormData();
            formData.append("live_face", blob, "live_snapshot.jpg");
            const passportState = uploadedDocumentsState["Passport Photo"];
            const docFilename = (passportState && passportState.filename) ? passportState.filename : "";
            formData.append("doc_filename", docFilename);
            formData.append("liveness_passed", "true");
            formData.append("loan_type", activeApplicationData.loan_type || "Personal Loan");
            
            try {
                const result = await apiUpload("/face/verify", formData);
                
                if(result) {
                    activeApplicationData.face_verification = result;
                    
                    if (result.verified === true || result.status === "Verified") {
                        const ts = result.timestamp || new Date().toISOString();
                        const liv = result.liveness || "Passed (Liveness Verified)";
                        const score = result.similarity_score || result.similarity || 0.0;
                        const msg = result.message || "Face match is verified.";
                        
                        showToast("Biometric verification passed!", "success");
                        renderFaceVerificationSuccess(score, liv, ts, msg);
                    } else {
                        faceMatchResult.style.display = "block";
                        faceMatchResult.style.borderColor = "var(--danger)";
                        faceMatchResult.style.background = "rgba(190, 18, 60, 0.1)";
                        faceMatchResult.innerHTML = `
                            <h4 style="color: var(--danger);"><i class="fa-solid fa-circle-xmark"></i> Identity Validation Failed</h4>
                            <p style="font-weight:700;">Face verification mismatch (${result.similarity}%). Please recapture.</p>
                            <span style="font-size:0.85rem;">Ensure good lighting and face visibility.</span>
                        `;
                        submitAppBtn.disabled = true;
                    }
                }
            } catch(e) {
                console.error(e);
                showToast(e.message || "Face verification failed. Please try again.", "error");
                
                faceMatchResult.style.display = "block";
                faceMatchResult.style.borderColor = "var(--danger)";
                faceMatchResult.style.background = "rgba(190, 18, 60, 0.1)";
                faceMatchResult.innerHTML = `
                    <h4 style="color: var(--danger);"><i class="fa-solid fa-circle-xmark"></i> Identity Validation Failed</h4>
                    <p style="font-weight:700;">${e.message || "Face verification failed."}</p>
                    <span style="font-size:0.85rem;">Ensure good lighting and face visibility.</span>
                `;
                submitAppBtn.disabled = true;
            }
        }, "image/jpeg");
    }

    // ----------------- SUBMIT APPLICATION HANDLER -----------------
    submitAppBtn.addEventListener("click", async () => {
        showToast("Generating verification summary PDFs...", "info");
        
        // Compile the uploaded documents filename payload using the correct key mapping
        activeApplicationData.uploaded_documents = {};
        for (const doc in uploadedDocumentsState) {
            if (uploadedDocumentsState[doc] && uploadedDocumentsState[doc].filename) {
                const backendDocKey = docTypeMap[doc] || doc.toLowerCase().replace(/\s/g, '_');
                activeApplicationData.uploaded_documents[backendDocKey] = uploadedDocumentsState[doc].filename;
            }
        }
        
        try {
            const result = await apiPost("/applications/create", activeApplicationData);
            
            if(result) {
                showToast("Application submitted successfully!", "success");
                // Clear forms
                detailsForm.reset();
                
                // Reset upload variables & storage
                uploadedAadhaarFilename = "";
                uploadedPanFilename = "";
                uploadedDocumentsState = {};
                localStorage.removeItem("uploaded_docs_state");
                localStorage.removeItem("loan_wizard_state");
                
                switchStepperPane(1);
                
                document.getElementById("btn-docs-next").disabled = true;
                if (document.getElementById("ocr-report-aadhaar")) document.getElementById("ocr-report-aadhaar").style.display = "none";
                if (document.getElementById("ocr-report-pan")) document.getElementById("ocr-report-pan").style.display = "none";
                document.getElementById("face-match-result").style.display = "none";
                document.getElementById("instant-eligibility-banner").style.display = "none";
                
                // Redirect to Track Status page
                showSection('tracking');
            } else {
                showToast(result.error || "Submission failed", "error");
            }
        } catch(e) {
            console.error(e);
        }
    });

    // ----------------- TRACK APPLICATION TIMELINE -----------------
    const trackBtn = document.getElementById("btn-track-submit");
    if(trackBtn) {
        trackBtn.addEventListener("click", async () => {
            const trackId = document.getElementById("track-id-input").value.trim();
            if(!trackId) return;
            
            try {
                const apps = await apiGet("/applications/my");
                const matched = apps.find(a => a._id === trackId);
                
                const panel = document.getElementById("tracking-result-panel");
                panel.style.display = "block";
                
                if (matched) {
                    let timelineHtml = "";
                    const activeIndex = matched.status_timeline.length - 1;
                    
                    matched.status_timeline.forEach((t, index) => {
                        const statusClass = (index === activeIndex) ? "active" : "success";
                        timelineHtml += `
                            <li class="timeline-item ${statusClass}">
                                <div class="timeline-icon">
                                    <i class="fa-solid ${index === activeIndex ? 'fa-spinner fa-spin' : 'fa-check'}" style="font-size:0.6rem; color: white;"></i>
                                </div>
                                <h4 style="margin-bottom: 2px;">${t.stage}</h4>
                                <span style="font-size: 0.75rem; color: var(--text-muted);">${t.timestamp}</span>
                                <p style="font-size: 0.9rem; margin-top: 4px;">${t.remarks}</p>
                            </li>
                        `;
                    });

                    // Download headers for report letters
                    let lettersHtml = "";
                    if (matched.status === "Approved" && matched.appointment_letter) {
                        lettersHtml += `
                            <a href="${matched.appointment_letter}" class="btn btn-secondary" style="border-color: var(--success-light); color: var(--success-light);" download>
                                <i class="fa-solid fa-file-pdf"></i> Download Appointment Letter
                            </a>
                        `;
                    }
                    if (matched.application_pdf) {
                        lettersHtml += `
                            <a href="${matched.application_pdf}" class="btn btn-secondary" style="margin-left: 10px;" download>
                                <i class="fa-solid fa-file-pdf"></i> Download Application PDF
                            </a>
                        `;
                    }
                    if (matched.verification_pdf) {
                        lettersHtml += `
                            <a href="${matched.verification_pdf}" class="btn btn-secondary" style="margin-left: 10px;" download>
                                <i class="fa-solid fa-file-shield"></i> AI Verification Audit
                            </a>
                        `;
                    }

                    let appointmentNoticeHtml = "";
                    if (matched.status === "Approved" && matched.appointment_date) {
                        const dateParts = matched.appointment_date.split("-");
                        const formattedDate = dateParts.length === 3 ? `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}` : matched.appointment_date;
                        appointmentNoticeHtml = `
                            <div style="background: rgba(13, 148, 136, 0.1); border-left: 4px solid var(--success-light); padding: 1.25rem; border-radius: 6px; margin-bottom: 1.5rem; font-size: 0.95rem; line-height: 1.5;">
                                <h4 style="color: var(--success-light); margin-bottom: 8px;"><i class="fa-solid fa-circle-check"></i> Conditionally Approved!</h4>
                                <div>Your scheduled branch verification appointment details:</div>
                                <div style="margin-top: 6px;">
                                    • Date: <b>${formattedDate}</b><br/>
                                    • Time Slot: <b>${matched.appointment_time || '10:00 AM'}</b><br/>
                                    • Venue: <b>${matched.appointment_branch || 'Main'} Branch</b>
                                </div>
                                <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 8px;">
                                    Please carry original copies of your Aadhaar Card, PAN Card, and income statement. Download the official appointment letter below for standard requirements.
                                </div>
                            </div>
                        `;
                    }

                    panel.innerHTML = `
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
                            <h3>Application ID: ${matched._id}</h3>
                            <span class="status-badge ${matched.status === 'Approved' ? 'status-approved' : matched.status === 'Rejected' ? 'status-rejected' : 'status-pending'}">${matched.status}</span>
                        </div>
                        
                        <p style="margin-bottom: 1.5rem;">Loan Category: <b>${matched.loan_type}</b> | Sanction Amount: <b>₹${matched.loan_amount.toLocaleString()}</b></p>
                        
                        ${appointmentNoticeHtml}
                        
                        <h4 style="margin-bottom: 1rem;">Tracking Progress Timeline</h4>
                        <ul class="timeline">
                            ${timelineHtml}
                        </ul>
                        
                        <div style="margin-top: 2rem; border-top:1px solid var(--border-color); padding-top: 15px;">
                            ${lettersHtml}
                        </div>
                    `;
                } else {
                    panel.innerHTML = `<h3 style="color:var(--danger);">Application ID not found. Verify registration hash.</h3>`;
                }
            } catch(e) {
                console.error(e);
            }
        });
    }
});

// --- Tab Switching Helper ---
let currentStepNum = 1;
function saveWizardState() {
    const state = {
        step: currentStepNum,
        details: activeApplicationData
    };
    localStorage.setItem("loan_wizard_state", JSON.stringify(state));
}

async function restoreWizardState() {
    try {
        const savedWizard = localStorage.getItem("loan_wizard_state");
        if (savedWizard) {
            const state = JSON.parse(savedWizard);
            currentStepNum = state.step || 1;
            
            if (state.details) {
                // Merge details
                activeApplicationData = Object.assign({}, activeApplicationData, state.details);
            }
        }

        // Fetch uploaded documents from database first to sync!
        let token = localStorage.getItem("token");
        if (token) {
            try {
                const dbDocs = await apiGet("/documents");
                if (dbDocs && dbDocs.length > 0) {
                    uploadedDocumentsState = {};
                    dbDocs.forEach(d => {
                        let docLabel = Object.keys(docTypeMap).find(key => docTypeMap[key] === d.doc_type);
                        if (!docLabel) {
                            docLabel = d.doc_type;
                        }
                        uploadedDocumentsState[docLabel] = {
                            filename: d.filename,
                            status: "Uploaded",
                            quality: d.quality,
                            ocr: d.ocr,
                            fraud: d.fraud,
                            filepath: d.file_path
                        };
                        if (docLabel === "Aadhaar Card") {
                            uploadedAadhaarFilename = d.filename;
                        } else if (docLabel === "PAN Card") {
                            uploadedPanFilename = d.filename;
                        }
                    });
                    localStorage.setItem("uploaded_docs_state", JSON.stringify(uploadedDocumentsState));
                } else {
                    const savedDocs = localStorage.getItem("uploaded_docs_state");
                    if (savedDocs) {
                        uploadedDocumentsState = JSON.parse(savedDocs);
                    }
                }
            } catch (apiErr) {
                console.error("Error restoring documents from API:", apiErr);
                const savedDocs = localStorage.getItem("uploaded_docs_state");
                if (savedDocs) {
                    uploadedDocumentsState = JSON.parse(savedDocs);
                }
            }

            try {
                const userProfile = await apiGet("/users/settings");
                if (userProfile && userProfile.face_verification && userProfile.face_verification.face_path) {
                    const f = userProfile.face_verification;
                    activeApplicationData.face_verification = f;
                    const ts = f.timestamp || new Date().toISOString();
                    const liv = f.liveness || "Passed (Liveness Verified)";
                    const score = f.similarity || 0.0;
                    const msg = f.message || "Face match is verified.";
                    
                    // Render verification success in UI
                    renderFaceVerificationSuccess(score, liv, ts, msg);
                    
                    // Show captured face preview
                    if (f.face_path && imgPreview) {
                        imgPreview.src = `/api/files/document/${f.face_path}`;
                        imgPreview.style.display = "block";
                        webcam.style.display = "none";
                    }
                }
            } catch (profileErr) {
                console.error("Error restoring profile settings:", profileErr);
            }
        } else {
            const savedDocs = localStorage.getItem("uploaded_docs_state");
            if (savedDocs) {
                uploadedDocumentsState = JSON.parse(savedDocs);
            }
        }
        
        if (activeApplicationData.loan_type) {
            // Restore form fields
            if (document.getElementById("apply-name")) document.getElementById("apply-name").value = activeApplicationData.name || "";
            if (document.getElementById("apply-email")) document.getElementById("apply-email").value = activeApplicationData.email || "";
            if (document.getElementById("apply-mobile")) document.getElementById("apply-mobile").value = activeApplicationData.mobile || "";
            if (document.getElementById("apply-age")) document.getElementById("apply-age").value = activeApplicationData.age || 30;
            if (document.getElementById("apply-dob")) document.getElementById("apply-dob").value = activeApplicationData.dob || "";
            if (document.getElementById("apply-gender")) document.getElementById("apply-gender").value = activeApplicationData.gender || "Male";
            if (document.getElementById("apply-address")) document.getElementById("apply-address").value = activeApplicationData.address || "";
            if (document.getElementById("apply-category")) document.getElementById("apply-category").value = activeApplicationData.employment_type || "Salaried";
            if (document.getElementById("apply-occupation")) document.getElementById("apply-occupation").value = activeApplicationData.occupation || "";
            if (document.getElementById("apply-income")) document.getElementById("apply-income").value = activeApplicationData.income || 0;
            if (document.getElementById("apply-loans")) document.getElementById("apply-loans").value = activeApplicationData.existing_loans || 0;
            if (document.getElementById("apply-loan-type")) document.getElementById("apply-loan-type").value = activeApplicationData.loan_type || "Personal Loan";
            if (document.getElementById("apply-amount")) document.getElementById("apply-amount").value = activeApplicationData.loan_amount || 0;
            if (document.getElementById("apply-purpose")) document.getElementById("apply-purpose").value = activeApplicationData.purpose || "";
            
            // Reconstruct uploaded files UI
            generateDocumentsChecklist(activeApplicationData.loan_type, activeApplicationData.employment_type, true);
        }
        
        // Apply visual stepper states
        document.querySelectorAll(".step-item").forEach((item, idx) => {
            if(idx + 1 === currentStepNum) {
                item.className = "step-item active";
            } else if (idx + 1 < currentStepNum) {
                item.className = "step-item completed";
            } else {
                item.className = "step-item";
            }
        });

        document.querySelectorAll(".stepper-pane").forEach((pane, idx) => {
            if(idx + 1 === currentStepNum) {
                pane.classList.add("active");
            } else {
                pane.classList.remove("active");
            }
        });
    } catch(e) {
        console.error("Error restoring wizard state:", e);
    }
}

function switchStepperPane(stepNum) {
    currentStepNum = stepNum;
    saveWizardState();
    document.querySelectorAll(".step-item").forEach((item, idx) => {
        if(idx + 1 === stepNum) {
            item.className = "step-item active";
        } else if (idx + 1 < stepNum) {
            item.className = "step-item completed";
        } else {
            item.className = "step-item";
        }
    });

    document.querySelectorAll(".stepper-pane").forEach((pane, idx) => {
        if(idx + 1 === stepNum) {
            pane.classList.add("active");
        } else {
            pane.classList.remove("active");
        }
    });
}

// --- Conditional document logic selector ---
function updateDocRequirementMessage(empType) {
    const box = document.getElementById("upload-docs-instructions");
    if(!box) return;
    
    let docsList = "";
    if (empType === "Salaried") {
        docsList = "Aadhaar Card, PAN Card, and <b>3 Months Salary Slips + Bank Statement</b>";
    } else if (empType === "Student") {
        docsList = "Aadhaar Card, PAN Card, and <b>College ID Card + Bonafide Letter</b>";
    } else if (empType === "Farmer") {
        docsList = "Aadhaar Card, PAN Card, and <b>Agricultural Land Patta Records</b>";
    } else if (empType === "Self Employed") {
        docsList = "Aadhaar Card, PAN Card, and <b>Business Registration Certificate + Income Tax return proofs</b>";
    } else {
        docsList = "Aadhaar Card, PAN Card, and <b>Guardian Income Support Statement</b>";
    }
    
    box.innerHTML = `<i class="fa-solid fa-circle-info"></i> Your Employment Profile matches document rules checklist: ${docsList}`;
}

// --- docTypeMap dictionary to translate frontend labels to backend snake_case keys ---
const docTypeMap = {
    "Aadhaar Card": "aadhaar",
    "PAN Card": "pan",
    "Passport Photo": "passport_photo",
    "Income Proof": "income_proof",
    "Bank Statement": "bank_statement",
    "Salary Slip": "salary_slip",
    "Property Documents": "property_documents",
    "Sale Agreement": "sale_agreement",
    "Address Proof": "address_proof",
    "Admission Letter": "admission_letter",
    "Fee Structure": "fee_structure",
    "Academic Certificates": "academic_certificates",
    "Co-applicant Documents": "co_applicant_documents",
    "Vehicle Quotation": "vehicle_quotation",
    "Driving Licence": "driving_licence",
    "GST Certificate": "gst_certificate",
    "Business Registration": "business_registration",
    "ITR": "itr",
    "Profit Loss Statement": "profit_loss_statement"
};

const LOAN_DOCUMENTS = {
  "Personal Loan": [
    "Aadhaar Card",
    "PAN Card",
    "Passport Photo",
    "Salary Slip",
    "Bank Statement"
  ],
  "Home Loan": [
    "Aadhaar Card",
    "PAN Card",
    "Passport Photo",
    "Salary Slip",
    "Bank Statement",
    "Property Documents"
  ],
  "Education Loan": [
    "Aadhaar Card",
    "PAN Card",
    "Passport Photo",
    "Student ID",
    "Admission Letter"
  ],
  "Business Loan": [
    "Aadhaar Card",
    "PAN Card",
    "Passport Photo",
    "GST Certificate",
    "Bank Statement",
    "Business Proof"
  ],
  "Agriculture Loan": [
    "Aadhaar Card",
    "PAN Card",
    "Passport Photo",
    "Land Documents"
  ]
};

function getRequiredDocuments(loanType, empType) {
    const type = loanType || "Personal Loan";
    return LOAN_DOCUMENTS[type] || LOAN_DOCUMENTS["Personal Loan"];
}

window.uploadedDocumentsState = {};

window.generateDocumentsChecklist = function(loanType, empType, isRestore = false) {
    const checklistContainer = document.getElementById("dynamic-documents-checklist");
    if (!checklistContainer) return;
    checklistContainer.innerHTML = "";

    const docs = getRequiredDocuments(loanType, empType);
    
    if (!isRestore) {
        uploadedDocumentsState = {};
        docs.forEach(doc => {
            uploadedDocumentsState[doc] = { filename: "", status: "Pending" };
        });
        localStorage.removeItem("uploaded_docs_state");
    } else {
        // Ensure every required doc has at least a pending entry if not present
        docs.forEach(doc => {
            if (!uploadedDocumentsState[doc]) {
                uploadedDocumentsState[doc] = { filename: "", status: "Pending" };
            }
        });
    }

    // Check dynamic-docs-next disable state initially
    checkAllDocumentsUploaded();

    docs.forEach(doc => {
        const idSafe = doc.replace(/[\s-]/g, '_').toLowerCase();
        const existing = uploadedDocumentsState[doc] || { filename: "", status: "Pending" };
        
        const card = document.createElement("div");
        card.className = "document-card glass-panel";
        card.id = `card-${idSafe}`;
        card.style.position = "relative";
        card.style.minHeight = "360px";
        card.style.height = "360px";
        card.style.display = "flex";
        card.style.flexDirection = "column";
        card.style.justifyContent = "space-between";
        card.style.padding = "1.25rem";
        card.style.borderLeft = "5px solid var(--border-color)";
        card.style.overflow = "hidden";
        card.style.boxSizing = "border-box";
        
        let statusClass = "status-pending";
        let statusText = "Pending";
        let dropzoneBorderColor = "var(--border-color)";
        let dropzoneBg = "transparent";
        let dropzoneText = "Drag & drop or click to upload";
        let fileNameText = "No file selected";
        let previewStyle = "display: none;";
        let previewImgStyle = "display: none;";
        let previewPdfStyle = "display: none;";
        let previewSrc = "";
        let progressPercent = 0;
        let ocrBtnStyle = "display: none;";
        let errorStyle = "display: none;";
        let errorText = "";
        let actionButtonsStyle = "display: none;";

        let ocrName = "Not Detected";
        let ocrId = "Not Detected";
        let ocrConf = 0;
        let ocrStatusClass = "status-pending";
        let ocrStatusText = "Pending";
        let ocrFraudHtml = "<li>• Security Scan Pending</li>";

        if (existing.status === "Uploaded" || existing.status === "Verified") {
            statusClass = "status-approved";
            statusText = "Uploaded";
            card.style.borderLeft = "5px solid var(--success-light)";
            dropzoneBorderColor = "var(--success-light)";
            dropzoneBg = "rgba(20, 184, 166, 0.05)";
            fileNameText = existing.filename || "Uploaded file";
            dropzoneText = "File Uploaded Successfully";
            progressPercent = 100;
            actionButtonsStyle = "display: inline-flex;";
            
            previewStyle = "display: flex;";
            const ext = fileNameText.split('.').pop().toLowerCase();
            if (ext === "pdf") {
                previewPdfStyle = "display: flex;";
            } else {
                previewImgStyle = "display: block;";
                previewSrc = `/api/files/document/${fileNameText}`;
            }
            
            if (existing.ocr) {
                ocrBtnStyle = "display: inline-flex;";
                ocrName = existing.ocr.name || "Not Detected";
                ocrId = existing.ocr.id_number || "Not Detected";
                ocrConf = existing.ocr.confidence ? Math.round(existing.ocr.confidence * 100) : 95;
                
                let issuesHtml = "";
                if (existing.fraud && existing.fraud.issues && existing.fraud.issues.length > 0) {
                    existing.fraud.issues.forEach(i => issuesHtml += `<li style="color:var(--danger); font-size:0.75rem; list-style:none; padding: 2px 0;">• ${i}</li>`);
                    ocrStatusClass = "status-rejected";
                    ocrStatusText = existing.fraud.status || "Review Needed";
                } else {
                    issuesHtml = "<li style='color:var(--success-light); font-size:0.75rem; list-style:none; padding: 2px 0;'>• File Integrity Secure (Real Card)</li>";
                    ocrStatusClass = "status-approved";
                    ocrStatusText = "Secure";
                }
                ocrFraudHtml = issuesHtml;
            }
        } else if (existing.status === "Reupload Required" || existing.status === "Error") {
            statusClass = "status-rejected";
            statusText = existing.status;
            card.style.borderLeft = "5px solid var(--danger)";
            dropzoneBorderColor = "var(--danger)";
            dropzoneBg = "rgba(190, 18, 60, 0.05)";
            errorStyle = "display: block;";
            errorText = existing.error || "Document is not clear. Please re-upload.";
            actionButtonsStyle = "display: inline-flex;";
        }
        
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <h4 style="margin: 0; font-size: 0.95rem; font-weight: 700; color: var(--text-primary); text-overflow: ellipsis; white-space: nowrap; overflow: hidden; max-width: 70%;">
                    <i class="fa-solid fa-file-invoice" style="margin-right: 6px; color: var(--primary-light);"></i> ${doc}
                </h4>
                <span class="status-badge ${statusClass}" id="status-badge-${idSafe}">${statusText}</span>
            </div>
            
            <div class="dropzone" id="dropzone-${idSafe}" style="flex-grow: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0.75rem; border: 2px dashed ${dropzoneBorderColor}; cursor: pointer; text-align: center; border-radius: var(--radius-sm); background: ${dropzoneBg}; transition: all 0.3s;">
                <i class="fa-solid fa-cloud-arrow-up" style="font-size: 1.5rem; color: var(--text-muted); margin-bottom: 6px;"></i>
                <p style="margin: 0; font-size: 0.8rem; font-weight: 500; color: var(--text-secondary); line-height: 1.2;">${dropzoneText}</p>
                <span id="file-name-${idSafe}" style="font-size: 0.75rem; color: var(--text-muted); display: block; margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 90%;">${fileNameText}</span>
                <input type="file" id="file-${idSafe}" style="display: none;" accept="image/*,.pdf">
            </div>

            <div id="preview-progress-row-${idSafe}" style="margin: 8px 0; display: flex; align-items: center; justify-content: space-between; gap: 8px; height: 40px;">
                <div id="preview-container-${idSafe}" style="${previewStyle} width: 50px; height: 35px; border-radius: 4px; overflow: hidden; background: var(--bg-secondary); border: 1px solid var(--border-color); align-items: center; justify-content: center;">
                    <img id="preview-img-${idSafe}" src="${previewSrc}" style="${previewImgStyle} width: 100%; height: 100%; object-fit: cover;" />
                    <div id="preview-pdf-${idSafe}" style="${previewPdfStyle} align-items: center; justify-content: center; color: #ef4444;">
                        <i class="fa-solid fa-file-pdf" style="font-size: 1.25rem;"></i>
                    </div>
                </div>
                
                <div style="flex-grow: 1; height: 6px; background: var(--border-color); border-radius: 3px; overflow: hidden;">
                    <div id="progress-bar-${idSafe}" style="height: 100%; width: ${progressPercent}%; background: var(--success-light); transition: width 0.3s;"></div>
                </div>
            </div>

            <div style="display: flex; gap: 6px; justify-content: space-between; align-items: center; margin-top: 4px;">
                <button class="btn btn-secondary btn-sm" id="btn-replace-${idSafe}" style="flex: 1; padding: 0.3rem; font-size: 0.75rem; justify-content: center; height: 30px; ${actionButtonsStyle}" onclick="triggerReplace('${idSafe}')">
                    <i class="fa-solid fa-arrows-rotate"></i> Replace
                </button>
                <button class="btn btn-secondary btn-sm" id="btn-remove-${idSafe}" style="flex: 1; padding: 0.3rem; font-size: 0.75rem; justify-content: center; color: var(--danger); border-color: rgba(239, 68, 68, 0.2); height: 30px; ${actionButtonsStyle}" onclick="removeDocument('${idSafe}', '${doc}')">
                    <i class="fa-solid fa-trash-can"></i> Remove
                </button>
                <button class="btn btn-primary btn-sm" id="btn-ocr-details-${idSafe}" style="flex: 1.2; padding: 0.3rem; font-size: 0.75rem; justify-content: center; height: 30px; ${ocrBtnStyle}" onclick="showOcrOverlay('${idSafe}')">
                    <i class="fa-solid fa-eye"></i> View OCR
                </button>
            </div>

            <div id="error-message-${idSafe}" style="${errorStyle} color: var(--danger); font-size: 0.75rem; font-weight: 600; margin-top: 5px; text-align: center; line-height: 1.2;">${errorText}</div>

            <div id="ocr-overlay-${idSafe}" class="glass-panel" style="display: none; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: var(--bg-secondary); z-index: 10; padding: 1rem; flex-direction: column; justify-content: space-between; border-radius: var(--radius-md);">
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 4px; margin-bottom: 8px;">
                        <h4 style="margin: 0; color: var(--primary-light); font-size: 0.85rem; font-weight: 700;">
                            <i class="fa-solid fa-microchip"></i> OCR Extraction Details
                        </h4>
                        <button style="background: transparent; border: none; color: var(--text-primary); cursor: pointer; font-size: 0.95rem;" onclick="hideOcrOverlay('${idSafe}')">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                    <div style="font-size: 0.75rem; display: flex; flex-direction: column; gap: 4px; color: var(--text-secondary); text-align: left;">
                        <div>Extracted Name: <b id="ocr-name-${idSafe}" style="color: var(--text-primary);">${ocrName}</b></div>
                        <div>Extracted ID: <b id="ocr-id-${idSafe}" style="color: var(--text-primary);">${ocrId}</b></div>
                        <div>Confidence Score: <b id="ocr-conf-${idSafe}" style="color: var(--text-primary);">${ocrConf}%</b></div>
                        <div style="display: flex; align-items: center; gap: 4px;">Verification Status: <span id="ocr-status-${idSafe}" class="status-badge ${ocrStatusClass}" style="padding: 1px 6px; font-size: 0.65rem; font-weight: 700;">${ocrStatusText}</span></div>
                        <div style="margin-top: 4px; border-top: 1px solid var(--border-color); padding-top: 4px;">
                            <b style="color: var(--text-primary);">Security Scan:</b>
                            <ul id="ocr-fraud-${idSafe}" style="margin: 2px 0 0 0; padding-left: 10px; font-size: 0.7rem; color: var(--text-secondary); max-height: 70px; overflow-y: auto;">
                                ${ocrFraudHtml}
                            </ul>
                        </div>
                    </div>
                </div>
                <button class="btn btn-secondary btn-sm" style="width: 100%; justify-content: center; margin-top: 4px; height: 28px; font-size: 0.75rem; padding: 0.2rem;" onclick="hideOcrOverlay('${idSafe}')">
                    Close
                </button>
            </div>
        `;
        
        checklistContainer.appendChild(card);
        setupDynamicDropzone(idSafe, doc);
    });
};

window.triggerReplace = function(idSafe) {
    const fileInput = document.getElementById(`file-${idSafe}`);
    if (fileInput) {
        fileInput.click();
    }
};

window.showOcrOverlay = function(idSafe) {
    let matchedDoc = null;
    for (const docName in uploadedDocumentsState) {
        const docIdSafe = docName.replace(/[\s-]/g, '_').toLowerCase();
        if (docIdSafe === idSafe) {
            matchedDoc = uploadedDocumentsState[docName];
            break;
        }
    }
    
    if (matchedDoc && matchedDoc.ocr) {
        const ocrConf = matchedDoc.ocr.confidence ? Math.round(matchedDoc.ocr.confidence * 100) : 95;
        let ocrStatusClass = "status-pending";
        let ocrStatusText = "Pending";
        let ocrFraudHtml = "";
        
        if (matchedDoc.fraud && matchedDoc.fraud.issues && matchedDoc.fraud.issues.length > 0) {
            matchedDoc.fraud.issues.forEach(i => ocrFraudHtml += `<li style="color:var(--danger); font-size:0.85rem; padding: 2px 0;">${i}</li>`);
            ocrStatusClass = "status-rejected";
            ocrStatusText = matchedDoc.fraud.status || "Review Needed";
        } else {
            ocrFraudHtml = "<li style='color:var(--success-light); font-size:0.85rem; padding: 2px 0;'>File Integrity Secure (Real Card)</li>";
            ocrStatusClass = "status-approved";
            ocrStatusText = "Secure";
        }
        
        if (ocrConf < 70) {
            ocrStatusClass = "status-pending";
            ocrStatusText = "Manual Review Required";
            ocrFraudHtml += `<li style="color:var(--warning); font-size:0.85rem; padding: 2px 0;">Low OCR Confidence (${ocrConf}%). Desk audit required.</li>`;
        }
        
        const modalContent = document.getElementById("ocr-modal-content");
        if (modalContent) {
            modalContent.innerHTML = `
                <div style="margin-bottom: 8px;">Extracted Name: <b style="color: var(--text-primary); font-size: 1.05rem;">${matchedDoc.ocr.name || "Not Detected"}</b></div>
                <div style="margin-bottom: 8px;">Extracted ID: <b style="color: var(--text-primary); font-size: 1.05rem;">${matchedDoc.ocr.id_number || "Not Detected"}</b></div>
                <div style="margin-bottom: 8px;">Confidence Score: <b style="color: var(--text-primary); font-size: 1.05rem;">${ocrConf}%</b></div>
                <div style="margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">Verification Status: <span class="status-badge ${ocrStatusClass}" style="padding: 2px 8px; font-weight:700;">${ocrStatusText}</span></div>
                <div style="margin-top: 12px; border-top: 1px solid var(--border-color); padding-top: 12px;">
                    <b style="color: var(--text-primary); display:block; margin-bottom: 6px;">AI Security & Splicing Report:</b>
                    <ul style="margin: 0; padding-left: 15px; color: var(--text-secondary); list-style: disc;">
                        ${ocrFraudHtml}
                    </ul>
                </div>
            `;
            const modal = document.getElementById("ocr-modal");
            if (modal) {
                modal.style.display = "flex";
            }
        }
    } else {
        showToast("No OCR details available for this document.", "info");
    }
};

window.hideOcrOverlay = function(idSafe) {
    const modal = document.getElementById("ocr-modal");
    if (modal) {
        modal.style.display = "none";
    }
};

window.removeDocument = async function(idSafe, docType) {
    if (!confirm(`Are you sure you want to remove ${docType}?`)) {
        return;
    }
    
    showToast(`Removing ${docType}...`, "info");
    
    try {
        const result = await apiPost("/documents/delete", { doc_type: docType });
        if (result && result.success) {
            // Remove from state
            delete uploadedDocumentsState[docType];
            
            // Sync state
            localStorage.setItem("uploaded_docs_state", JSON.stringify(uploadedDocumentsState));
            
            // Clean up global references if Aadhaar/PAN is removed
            if (docType === "Aadhaar Card") {
                uploadedAadhaarFilename = "";
                activeApplicationData.ocr_results = {};
                activeApplicationData.fraud_results = {};
            } else if (docType === "PAN Card") {
                uploadedPanFilename = "";
            }
            
            showToast(`${docType} removed successfully.`, "success");
            
            // Re-render checklist slots (maintains their visibility!)
            generateDocumentsChecklist(activeApplicationData.loan_type, activeApplicationData.employment_type, true);
        } else {
            showToast(result.error || "Failed to remove document.", "error");
        }
    } catch (err) {
        console.error(err);
        showToast(err.message || "Failed to remove document.", "error");
    }
};

function setupDynamicDropzone(idSafe, docType) {
    const dropzone = document.getElementById(`dropzone-${idSafe}`);
    const fileInput = document.getElementById(`file-${idSafe}`);
    
    if (!dropzone || !fileInput) return;
    
    // File input change handler
    fileInput.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
            handleDynamicFileUpload(e.target.files[0], idSafe, docType, dropzone);
        }
    });
    
    // Click triggers file input
    dropzone.addEventListener("click", () => {
        fileInput.click();
    });
    
    // Drag & Drop handlers
    dropzone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropzone.classList.add("dragover");
    });
    
    dropzone.addEventListener("dragleave", () => {
        dropzone.classList.remove("dragover");
    });
    
    dropzone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropzone.classList.remove("dragover");
        if (e.dataTransfer.files.length > 0) {
            handleDynamicFileUpload(e.dataTransfer.files[0], idSafe, docType, dropzone);
        }
    });
}

window.handleDynamicFileUpload = async function(file, idSafe, docType, dropzone) {
    showToast(`Uploading and scanning ${docType}...`, "info");
    
    const formData = new FormData();
    formData.append("file", file);
    const backendDocType = docTypeMap[docType] || docType.toLowerCase().replace(/\s/g, '_');
    formData.append("doc_type", backendDocType);
    
    const errMessage = document.getElementById(`error-message-${idSafe}`);
    const progressBar = document.getElementById(`progress-bar-${idSafe}`);
    
    // Clear previous errors/reports
    if (errMessage) {
        errMessage.style.display = "none";
        errMessage.innerText = "";
    }
    
    // Show mock upload progress bar animation
    if (progressBar) {
        progressBar.style.width = "40%";
    }
    
    try {
        const result = await apiUpload("/documents/upload", formData);
        
        if (result) {
            const filename = result.filepath.split("/").pop();
            const qualityReadable = result.quality && result.quality.readable !== false;
            
            if (progressBar) progressBar.style.width = "80%";
            
            if (qualityReadable) {
                uploadedDocumentsState[docType] = {
                    filename: filename,
                    status: "Uploaded",
                    quality: result.quality,
                    ocr: result.ocr,
                    fraud: result.fraud,
                    filepath: result.filepath
                };
                
                // Write to localStorage immediately!
                localStorage.setItem("uploaded_docs_state", JSON.stringify(uploadedDocumentsState));
                
                if (progressBar) progressBar.style.width = "100%";
                
                // Refresh the whole checklist grid to keep formatting clean and uniform
                generateDocumentsChecklist(activeApplicationData.loan_type, activeApplicationData.employment_type, true);
                
                // Autofill fields if Aadhaar/PAN
                if (docType === "Aadhaar Card") {
                    uploadedAadhaarFilename = filename;
                    activeApplicationData.ocr_results.name = result.ocr.name;
                    activeApplicationData.ocr_results.id_number = result.ocr.id_number;
                    activeApplicationData.ocr_results.dob = result.ocr.dob;
                    activeApplicationData.ocr_results.gender = result.ocr.gender;
                    activeApplicationData.fraud_results = result.fraud;
                    
                    if (result.ocr.name) document.getElementById("apply-name").value = result.ocr.name;
                    if (result.ocr.dob) document.getElementById("apply-dob").value = parseDOBDateString(result.ocr.dob);
                    if (result.ocr.gender) document.getElementById("apply-gender").value = result.ocr.gender;
                    if (result.ocr.id_number) document.getElementById("apply-aadhaar").value = result.ocr.id_number.replace(/\s/g, '');
                } else if (docType === "PAN Card") {
                    uploadedPanFilename = filename;
                    if (result.ocr.id_number) document.getElementById("apply-pan").value = result.ocr.id_number;
                }
                
                showToast(`${docType} file parsed and audit logs compiled!`, "success");
            } else {
                // Quality not clear (surface error)
                uploadedDocumentsState[docType] = { filename: "", status: "Reupload Required", error: result.quality.reason };
                localStorage.setItem("uploaded_docs_state", JSON.stringify(uploadedDocumentsState));
                generateDocumentsChecklist(activeApplicationData.loan_type, activeApplicationData.employment_type, true);
                showToast(result.quality.reason || "Document is not clear. Please re-upload.", "error");
            }
        }
    } catch(err) {
        console.error(err);
        uploadedDocumentsState[docType] = { filename: "", status: "Error", error: err.message || "Document processing error" };
        localStorage.setItem("uploaded_docs_state", JSON.stringify(uploadedDocumentsState));
        generateDocumentsChecklist(activeApplicationData.loan_type, activeApplicationData.employment_type, true);
        showToast(err.message || "Document processing error", "error");
    }
};

function checkAllDocumentsUploaded() {
    const loanType = activeApplicationData.loan_type || "Personal Loan";
    const required = getRequiredDocuments(loanType, activeApplicationData.employment_type);
    const missing = [];
    
    required.forEach(doc => {
        const docState = uploadedDocumentsState[doc];
        if (!docState || (docState.status !== "Uploaded" && docState.status !== "Verified")) {
            missing.push(doc);
        }
    });
    
    const btn = document.getElementById("btn-docs-next");
    if (btn) {
        btn.disabled = (missing.length > 0);
    }
    
    return {
        success: missing.length === 0,
        missing_documents: missing
    };
}

function parseDOBDateString(dateStr) {
    if(!dateStr) return "";
    const parts = dateStr.split("/");
    if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
}

// --- Fetch User Applications ---
async function fetchApplications() {
    try {
        const apps = await apiGet("/applications/my");
        
        // Count statuses
        let pending = 0;
        let approved = 0;
        let rejected = 0;
        
        const tableBody = document.querySelector("#applications-table tbody");
        if(tableBody) {
            tableBody.innerHTML = "";
            let missingDocsList = [];
            if (apps.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="6" style="padding: 20px; text-align: center; color: var(--text-muted);">No active applications. Apply for a loan to get started.</td></tr>`;
            } else {
                apps.forEach(app => {
                    const statusUpper = (app.status || "").toUpperCase();
                    if (statusUpper === "OFFICER REVIEW" || statusUpper === "APPROVED_FOR_REVIEW") pending++;
                    else if (statusUpper === "APPROVED") approved++;
                    else if (statusUpper === "REJECTED") rejected++;
                    
                    if (statusUpper === "ADDITIONAL_DOCUMENTS_REQUIRED") {
                        const missing = app.missing_documents || [];
                        if (missing.length > 0) {
                            missingDocsList.push(...missing);
                        }
                    }
                    
                    let downloads = "";
                    if (app.application_pdf) {
                        downloads += `<a href="${app.application_pdf}" target="_blank" class="btn btn-secondary btn-sm" style="padding:0.3rem 0.6rem; font-size:0.8rem;" title="Download Application Receipt"><i class="fa-solid fa-file-pdf"></i> Receipt</a> `;
                    }
                    if (app.approval_letter) {
                        downloads += `<a href="${app.approval_letter}" target="_blank" class="btn btn-primary btn-sm" style="padding:0.3rem 0.6rem; font-size:0.8rem; background: var(--success-light); border-color: var(--success-light);" title="Download Approval Letter"><i class="fa-solid fa-file-invoice"></i> Approval</a> `;
                    }
                    if (app.rejection_letter) {
                        downloads += `<a href="${app.rejection_letter}" target="_blank" class="btn btn-secondary btn-sm" style="padding:0.3rem 0.6rem; font-size:0.8rem; background: var(--danger); border-color: var(--danger); color: white;" title="Download Rejection Letter"><i class="fa-solid fa-ban"></i> Rejection</a> `;
                    }
                    if (app.appointment_letter) {
                        downloads += `<a href="${app.appointment_letter}" target="_blank" class="btn btn-primary btn-sm" style="padding:0.3rem 0.6rem; font-size:0.8rem;" title="Download Appointment Receipt"><i class="fa-solid fa-calendar-check"></i> Appointment</a> `;
                    }
                    
                    const row = document.createElement("tr");
                    row.style.borderBottom = "1px solid var(--border-color)";
                    const showStatus = app.status === "ADDITIONAL_DOCUMENTS_REQUIRED" ? "Attention Required" : app.status;
                    const statusClass = (statusUpper === 'APPROVED') ? 'status-approved' : 
                                        (statusUpper === 'REJECTED') ? 'status-rejected' : 
                                        (statusUpper === 'ADDITIONAL_DOCUMENTS_REQUIRED') ? 'status-rejected' : 'status-pending';
                    row.innerHTML = `
                        <td style="padding: 12px; font-family: monospace; font-size: 0.85rem;">${app._id}</td>
                        <td style="padding: 12px;">${app.loan_type}</td>
                        <td style="padding: 12px; font-weight:700;">₹${app.loan_amount.toLocaleString()}</td>
                        <td style="padding: 12px;"><span class="status-badge ${statusClass}">${showStatus}</span></td>
                        <td style="padding: 12px; font-size:0.9rem;">${app.submitted_at ? app.submitted_at.split(" ")[0] : 'N/A'}</td>
                        <td style="padding: 12px; display:flex; gap:6px; flex-wrap:wrap;">
                            <button class="btn btn-secondary btn-sm" onclick="trackApplication('${app._id}')" style="padding:0.3rem 0.6rem; font-size:0.8rem;">
                                <i class="fa-solid fa-route"></i> Track
                            </button>
                            ${downloads}
                        </td>
                    `;
                    tableBody.appendChild(row);
                });
            }
            const alertBox = document.getElementById("additional-docs-alert");
            const alertText = document.getElementById("additional-docs-alert-text");
            if (alertBox && alertText) {
                if (missingDocsList.length > 0) {
                    alertText.innerHTML = `The credit officer has requested the following additional documents for your active application: <b>${missingDocsList.join(", ")}</b>. Please upload them to resume processing.`;
                    alertBox.style.display = "flex";
                } else {
                    alertBox.style.display = "none";
                }
            }
        }
        
        document.getElementById("count-pending").innerText = pending;
        document.getElementById("count-approved").innerText = approved;
        document.getElementById("count-rejected").innerText = rejected;
        const countTotalEl = document.getElementById("count-total");
        if (countTotalEl) {
            countTotalEl.innerText = apps.length;
        }
        
        // Trigger update for meters and speedometer gauges
        if (typeof updateMetricsAndGauges === "function") {
            updateMetricsAndGauges(apps);
        }
    } catch(e) {
        console.error(e);
    }
}

function getProgressPercentage(status) {
    const statusUpper = (status || "").toUpperCase();
    switch (statusUpper) {
        case "DRAFT": return 10;
        case "ELIGIBILITY CHECKED": return 25;
        case "DOCUMENTS UPLOADED": return 40;
        case "FACE VERIFIED": return 60;
        case "OFFICER REVIEW":
        case "APPROVED_FOR_REVIEW": return 80;
        case "APPROVED": return 100;
        case "REJECTED": return 100;
        case "ADDITIONAL_DOCUMENTS_REQUIRED": return 40;
        default: return 50;
    }
}

async function fetchApplicationsForTracking() {
    try {
        const apps = await apiGet("/applications/my");
        const tbody = document.getElementById("tracking-applications-tbody");
        if (tbody) {
            tbody.innerHTML = "";
            if (apps.length === 0) {
                tbody.innerHTML = `<tr><td colspan="9" style="padding: 20px; text-align: center; color: var(--text-muted);">No active applications. Apply for a loan to get started.</td></tr>`;
                return;
            }
            apps.forEach(app => {
                const progressVal = getProgressPercentage(app.status);
                const remarks = app.officer_remarks || "Waiting for officer review...";
                const appointmentStr = (app.status === "Approved" && app.appointment_date) ? `${app.appointment_date} (${app.appointment_time || ''}) at ${app.appointment_branch || ''}` : "N/A";
                
                let downloads = "";
                if (app.application_pdf) {
                    downloads += `<a href="${app.application_pdf}" target="_blank" class="btn btn-secondary btn-sm" style="padding:0.3rem 0.6rem; font-size:0.8rem;" title="Download Application Receipt"><i class="fa-solid fa-file-pdf"></i></a> `;
                }
                if (app.approval_letter) {
                    downloads += `<a href="${app.approval_letter}" target="_blank" class="btn btn-primary btn-sm" style="padding:0.3rem 0.6rem; font-size:0.8rem; background: var(--success-light); border-color: var(--success-light);" title="Download Approval Letter"><i class="fa-solid fa-file-invoice"></i></a> `;
                }
                if (app.rejection_letter) {
                    downloads += `<a href="${app.rejection_letter}" target="_blank" class="btn btn-secondary btn-sm" style="padding:0.3rem 0.6rem; font-size:0.8rem; background: var(--danger); border-color: var(--danger); color: white;" title="Download Rejection Letter"><i class="fa-solid fa-ban"></i></a> `;
                }
                if (app.appointment_letter) {
                    downloads += `<a href="${app.appointment_letter}" target="_blank" class="btn btn-primary btn-sm" style="padding:0.3rem 0.6rem; font-size:0.8rem;" title="Download Appointment Receipt"><i class="fa-solid fa-calendar-check"></i></a> `;
                }
                
                const row = document.createElement("tr");
                row.style.borderBottom = "1px solid var(--border-color)";
                row.innerHTML = `
                    <td style="padding: 12px; font-family: monospace; font-size: 0.85rem;">${app._id}</td>
                    <td style="padding: 12px;">${app.loan_type}</td>
                    <td style="padding: 12px; font-weight:700;">₹${app.loan_amount.toLocaleString()}</td>
                    <td style="padding: 12px;"><span class="status-badge ${app.status === 'Approved' ? 'status-approved' : app.status === 'Rejected' ? 'status-rejected' : 'status-pending'}">${app.status}</span></td>
                    <td style="padding: 12px;">
                        <div style="width: 100px; background: var(--border-color); border-radius: 10px; overflow: hidden; height: 10px; display: inline-block; vertical-align: middle; margin-right: 5px;">
                            <div style="width: ${progressVal}%; background: ${app.status === 'Rejected' ? 'var(--danger)' : 'var(--success-light)'}; height: 100%;"></div>
                        </div>
                        <span style="font-size: 0.75rem; color: var(--text-muted);">${progressVal}%</span>
                    </td>
                    <td style="padding: 12px; font-size:0.9rem;">${app.submitted_at ? app.submitted_at.split(" ")[0] : 'N/A'}</td>
                    <td style="padding: 12px; font-size:0.85rem;">${remarks}</td>
                    <td style="padding: 12px; font-size:0.85rem;">${appointmentStr}</td>
                    <td style="padding: 12px; display:flex; gap:4px; align-items:center; flex-wrap:wrap;">
                        <button class="btn btn-secondary btn-sm" onclick="trackApplication('${app._id}')" style="padding:0.3rem 0.6rem; font-size:0.8rem;" title="Track Timeline">
                            <i class="fa-solid fa-route"></i>
                        </button>
                        ${downloads}
                    </td>
                `;
                tbody.appendChild(row);
            });
        }
    } catch(e) {
        console.error("Error loading tracking data:", e);
    }
}

// Global click tracking hook
function trackApplication(appId) {
    showSection('tracking');
    
    document.getElementById("track-id-input").value = appId;
    document.getElementById("btn-track-submit").click();
}

// --- Load Dynamic Catalogue ---
async function loadDashboardCatalog() {
    try {
        const data = await apiGet("/loans");
        
        const container = document.getElementById("dashboard-loan-grid");
        if(container && data && data.length > 0) {
            container.innerHTML = "";
            data.forEach(rule => {
                const card = document.createElement("div");
                card.className = "loan-card glass-panel";
                
                let tenureRange = "1 to 5 Years";
                if (rule.loan_type.includes("Home")) tenureRange = "5 to 30 Years";
                else if (rule.loan_type.includes("Education")) tenureRange = "3 to 15 Years";
                else if (rule.loan_type.includes("Business") || rule.loan_type.includes("Entrepreneur")) tenureRange = "1 to 10 Years";
                else if (rule.loan_type.includes("Medical")) tenureRange = "6 to 36 Months";
                
                let minAmt = "₹50,000";
                if (rule.loan_type.includes("Home")) minAmt = "₹10,00,000";
                else if (rule.loan_type.includes("Business") || rule.loan_type.includes("Entrepreneur")) minAmt = "₹1,00,000";
                else if (rule.loan_type.includes("Gold")) minAmt = "₹25,000";
                else if (rule.loan_type.includes("Medical")) minAmt = "₹10,000";
                
                card.innerHTML = `
                    <div style="display: flex; flex-direction: column; height: 100%;">
                        <span class="loan-card-badge" style="align-self: flex-start;">${rule.loan_type.split(" ")[0]}</span>
                        <h3 style="margin-top: 10px; margin-bottom: 5px; color: var(--primary-light);">${rule.loan_type}</h3>
                        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px;">Fully digital biometric scanning and instant AI audit process.</p>
                        <ul class="loan-spec-list" style="margin-bottom: 15px; flex-grow: 1;">
                            <li><span>Interest Rate</span> <span><b>${rule.interest_rate}% p.a.</b></span></li>
                            <li><span>Amount Range</span> <span>${minAmt} - ₹${(rule.max_amount).toLocaleString()}</span></li>
                            <li><span>Max Tenure</span> <span>${tenureRange}</span></li>
                            <li><span>Min Income Required</span> <span>₹${(rule.min_income || 10000).toLocaleString()}/mo</span></li>
                            <li><span>Required Documents</span> <span>${rule.required_docs.join(", ")}</span></li>
                        </ul>
                        <button class="btn btn-primary" onclick="initiateLoanApply('${rule.loan_type}')" style="width: 100%; text-align: center; justify-content: center; margin-top: auto;">Apply For Loan</button>
                    </div>
                `;
                container.appendChild(card);
            });
        }
    } catch(e) {
        console.error(e);
    }
}

async function loadLoanDocuments(loanType) {
    uploadedDocumentsState = {};
    localStorage.removeItem("uploaded_docs_state");
    uploadedAadhaarFilename = "";
    uploadedPanFilename = "";
    
    // Clear display reports
    if (document.getElementById("ocr-report-aadhaar")) document.getElementById("ocr-report-aadhaar").style.display = "none";
    if (document.getElementById("ocr-report-pan")) document.getElementById("ocr-report-pan").style.display = "none";
    if (document.getElementById("face-match-result")) document.getElementById("face-match-result").style.display = "none";
    
    try {
        const dbDocs = await apiGet("/documents/loan-wise", { loan_type: loanType });
        if (dbDocs && dbDocs.length > 0) {
            dbDocs.forEach(d => {
                let docLabel = Object.keys(docTypeMap).find(key => docTypeMap[key] === d.doc_type);
                if (!docLabel) {
                    docLabel = d.doc_type;
                }
                uploadedDocumentsState[docLabel] = {
                    filename: d.filename,
                    status: "Uploaded",
                    quality: d.quality,
                    ocr: d.ocr,
                    fraud: d.fraud,
                    filepath: d.file_path
                };
                if (docLabel === "Aadhaar Card") {
                    uploadedAadhaarFilename = d.filename;
                } else if (docLabel === "PAN Card") {
                    uploadedPanFilename = d.filename;
                }
            });
            localStorage.setItem("uploaded_docs_state", JSON.stringify(uploadedDocumentsState));
        }
    } catch (err) {
        console.error("Error restoring loan documents from API:", err);
    }
}

async function initiateLoanApply(loanType) {
    showSection('apply');
    document.getElementById("apply-loan-type").value = loanType;
    activeApplicationData.loan_type = loanType;
    await loadLoanDocuments(loanType);
    if (typeof generateDocumentsChecklist === "function") {
        generateDocumentsChecklist(loanType, activeApplicationData.employment_type, true);
    }
}

// --- Fetch User Notifications ---
async function fetchNotifications() {
    try {
        const notifs = await apiGet("/notifications");
        
        const container = document.getElementById("notifications-list-container");
        if(container) {
            container.innerHTML = "";
            if (notifs.length === 0) {
                container.innerHTML = `<div style="text-align:center; padding: 20px; color:var(--text-muted);">No new notification alerts.</div>`;
            } else {
                notifs.forEach(n => {
                    const item = document.createElement("div");
                    item.className = "glass-panel";
                    item.style.padding = "1rem 1.5rem";
                    item.innerHTML = `
                        <div style="display:flex; justify-content:space-between; margin-bottom: 4px;">
                            <h4 style="font-size:0.95rem; color:var(--primary-light);"><i class="fa-solid fa-circle-info"></i> ${n.title}</h4>
                            <span style="font-size:0.75rem; color:var(--text-muted);">${n.timestamp}</span>
                        </div>
                        <p style="font-size:0.9rem; margin:0;">${n.message}</p>
                    `;
                    container.appendChild(item);
                });
            }
        }
    } catch(e) {
        console.error(e);
    }
}


// --- Update Profile Completion, Credit Score, and Eligibility Gauges ---
function updateMetricsAndGauges(apps) {
    // 1. Calculate Profile Completion
    let completeness = 0;
    const wizardState = JSON.parse(localStorage.getItem("wizard_state") || "{}");
    const docsState = JSON.parse(localStorage.getItem("uploaded_docs_state") || "{}");
    
    const nameFilled = document.getElementById("apply-name")?.value || wizardState.name;
    const dobFilled = document.getElementById("apply-dob")?.value || wizardState.dob;
    const emailFilled = document.getElementById("apply-email")?.value || wizardState.email;
    const mobileFilled = document.getElementById("apply-mobile")?.value || wizardState.mobile;
    const addressFilled = document.getElementById("apply-address")?.value || wizardState.address;
    
    if (nameFilled) completeness += 15;
    if (dobFilled) completeness += 15;
    if (emailFilled) completeness += 15;
    if (mobileFilled) completeness += 15;
    if (addressFilled) completeness += 15;
    
    let uploadedCount = 0;
    for (const doc in docsState) {
        if (docsState[doc] && (docsState[doc].status === "Uploaded" || docsState[doc].status === "Verified")) {
            uploadedCount++;
        }
    }
    completeness += Math.min(25, uploadedCount * 12.5);
    
    const percentEl = document.getElementById("profile-completion-percent");
    const barEl = document.getElementById("profile-completion-bar");
    if (percentEl && barEl) {
        percentEl.innerText = `${completeness}%`;
        barEl.style.width = `${completeness}%`;
    }
    
    // 2. Estimate Credit Score
    let score = 600;
    const income = parseFloat(document.getElementById("apply-income")?.value || wizardState.income || 0);
    const emi = parseFloat(document.getElementById("apply-loans")?.value || wizardState.existing_loans || 0);
    
    if (income > 50000) score += 80;
    if (income > 100000) score += 70;
    if (emi === 0 && income > 0) score += 100;
    else if (emi > 0) {
        const dti = emi / income;
        if (dti > 0.4) score -= 120;
        else score -= 40;
    }
    if (uploadedCount >= 2) score += 50;
    
    score = Math.min(900, Math.max(300, score));
    
    const scoreValEl = document.getElementById("credit-gauge-value");
    const scoreLabelEl = document.getElementById("credit-gauge-label");
    const pointerEl = document.getElementById("credit-gauge-pointer");
    const creditFillEl = document.getElementById("credit-gauge-fill");
    
    if (scoreValEl && scoreLabelEl) {
        scoreValEl.textContent = score;
        
        let label = "POOR";
        let color = "#ef4444";
        if (score >= 850) { label = "EXCELLENT"; color = "#10b981"; }
        else if (score >= 700) { label = "GOOD"; color = "#10b981"; }
        else if (score >= 600) { label = "FAIR"; color = "#f59e0b"; }
        
        scoreLabelEl.innerText = label;
        scoreLabelEl.style.color = color;
        
        const scorePercent = (score - 300) / 600;
        const dashOffset = 251 - (251 * scorePercent);
        if (creditFillEl) creditFillEl.style.strokeDashoffset = dashOffset;
        
        const angle = -90 + (180 * scorePercent);
        if (pointerEl) {
            pointerEl.style.transform = `rotate(${angle}deg)`;
        }
    }
    
    // 3. Compute Eligibility Percentage
    let eligibility = 0;
    if (income > 0) {
        const dti = emi / income;
        if (dti < 0.2) eligibility = 95;
        else if (dti < 0.4) eligibility = 80;
        else if (dti < 0.6) eligibility = 50;
        else eligibility = 15;
    } else {
        eligibility = 0;
    }
    
    const eligValEl = document.getElementById("eligibility-gauge-value");
    const eligFillEl = document.getElementById("eligibility-gauge-fill");
    if (eligValEl && eligFillEl) {
        eligValEl.innerText = `${eligibility}%`;
        eligFillEl.style.strokeDashoffset = 377 - (377 * eligibility / 100);
    }
    
    // 4. Update Recommendation card
    const savedRec = JSON.parse(localStorage.getItem("ai_recommendation_result") || "null");
    const recTitleEl = document.getElementById("user-recommendation-title");
    const recDescEl = document.getElementById("user-recommendation-desc");
    if (recTitleEl && recDescEl) {
        if (savedRec && savedRec.loan_type) {
            recTitleEl.innerText = savedRec.loan_type;
            recDescEl.innerHTML = `Interest Rate: <b>${savedRec.interest_rate || '10.5'}%</b><br/>${savedRec.reason || 'Matches your profile requirements.'}`;
        } else {
            recTitleEl.innerText = "No Recommendation Yet";
            recDescEl.innerText = "Please run the AI Recommendation tool to analyze your financial parameters.";
        }
    }
}

// --- Settings page controllers & listeners ---
document.addEventListener("DOMContentLoaded", () => {
    const settingsLangSelector = document.getElementById("settings-lang-selector");
    const headerLangSelector = document.getElementById("lang-selector");
    
    if (settingsLangSelector) {
        const currentLang = localStorage.getItem("selected_lang") || "en";
        settingsLangSelector.value = currentLang;
        
        settingsLangSelector.addEventListener("change", (e) => {
            const newLang = e.target.value;
            localStorage.setItem("selected_lang", newLang);
            if (typeof setLanguage === "function") {
                setLanguage(newLang);
            }
            if (headerLangSelector) {
                headerLangSelector.value = newLang;
            }
            showToast(newLang === "te" ? "భాష తెలుగుగా మార్చబడింది" : "Language changed to English", "success");
        });
    }

    const settingsThemeSelector = document.getElementById("settings-theme-selector");
    if (settingsThemeSelector) {
        const currentTheme = localStorage.getItem("theme") || "system";
        settingsThemeSelector.value = currentTheme;
        
        settingsThemeSelector.addEventListener("change", (e) => {
            const newTheme = e.target.value;
            localStorage.setItem("theme", newTheme);
            if (typeof applyTheme === "function") {
                applyTheme(newTheme);
            }
            showToast(`Theme changed to ${newTheme}`, "success");
        });
    }

    // --- USER PROFILE & SETTINGS LOAD/UPDATE LOGIC ---
    async function loadProfileSettings() {
        try {
            const data = await apiGet("/users/settings");
            if (data) {
                if (document.getElementById("settings-name")) document.getElementById("settings-name").value = data.name || "";
                if (document.getElementById("settings-email")) document.getElementById("settings-email").value = data.email || "";
                if (document.getElementById("settings-mobile")) document.getElementById("settings-mobile").value = data.mobile || "";
                if (document.getElementById("settings-address")) document.getElementById("settings-address").value = data.address || "";
                if (document.getElementById("settings-created-at")) document.getElementById("settings-created-at").value = data.created_at || "2026-07-15 12:00:00";
                
                if (data.picture) {
                    if (document.getElementById("profile-avatar-settings")) document.getElementById("profile-avatar-settings").src = data.picture;
                    if (document.getElementById("sidebar-avatar")) document.getElementById("sidebar-avatar").src = data.picture;
                    if (document.getElementById("nav-avatar")) document.getElementById("nav-avatar").src = data.picture;
                }
            }
        } catch (err) {
            console.error("Error loading profile settings:", err);
        }
    }
    loadProfileSettings();

    // Profile photo upload trigger
    const photoInput = document.getElementById("profile-photo-input");
    if (photoInput) {
        photoInput.addEventListener("change", async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const formData = new FormData();
            formData.append("file", file);
            
            try {
                const res = await apiUpload("/users/settings/picture", formData);
                showToast("Profile photo uploaded successfully!", "success");
                if (res.picture) {
                    if (document.getElementById("profile-avatar-settings")) document.getElementById("profile-avatar-settings").src = res.picture;
                    if (document.getElementById("sidebar-avatar")) document.getElementById("sidebar-avatar").src = res.picture;
                    if (document.getElementById("nav-avatar")) document.getElementById("nav-avatar").src = res.picture;
                }
            } catch (err) {
                showToast(err.message || "Failed to upload photo", "error");
            }
        });
    }

    const profileForm = document.getElementById("settings-profile-form");
    if (profileForm) {
        profileForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const name = document.getElementById("settings-name").value;
            const mobile = document.getElementById("settings-mobile").value;
            const address = document.getElementById("settings-address").value;
            
            try {
                const res = await apiPut("/users/settings", { name, mobile, address });
                showToast("Profile settings saved successfully!", "success");
                localStorage.setItem("user_name", name);
                localStorage.setItem("user_mobile", mobile);
                localStorage.setItem("user_address", address);
                
                const welcomeHeader = document.getElementById("sidebar-user-name");
                if (welcomeHeader) welcomeHeader.innerText = name;
                
                const navName = document.getElementById("nav-user-name");
                if (navName) navName.innerText = name;
                
                fetchApplications();
            } catch(err) {
                showToast(err.message || "Failed to update profile", "error");
            }
        });
    }

    // Password Update
    const passwordForm = document.getElementById("settings-password-form");
    if (passwordForm) {
        passwordForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const password = document.getElementById("settings-password").value;
            const confirm = document.getElementById("settings-confirm-password").value;
            
            if (password !== confirm) {
                showToast("Passwords do not match!", "error");
                return;
            }
            
            try {
                const res = await apiPut("/users/settings", { password });
                showToast("Password updated successfully!", "success");
                passwordForm.reset();
            } catch(err) {
                showToast(err.message || "Password change failed", "error");
            }
        });
    }

    const notifsForm = document.getElementById("settings-notifications-form");
    if (notifsForm) {
        notifsForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const emailPref = document.getElementById("pref-email").checked;
            const smsPref = document.getElementById("pref-sms").checked;
            const portalPref = document.getElementById("pref-portal").checked;
            
            localStorage.setItem("notif_prefs", JSON.stringify({ email: emailPref, sms: smsPref, portal: portalPref }));
            showToast("Notification preferences updated!", "success");
        });
    }

    // --- NOTIFICATION BADGE CONTROLLER ---
    async function updateUnreadNotificationsCount() {
        try {
            const res = await apiGet("/notifications");
            if (res) {
                const unread = res.filter(n => !n.read).length;
                const badge = document.getElementById("unread-notifications-count");
                if (badge) {
                    if (unread > 0) {
                        badge.innerText = unread;
                        badge.style.display = "inline-block";
                    } else {
                        badge.style.display = "none";
                    }
                }
            }
        } catch (err) {
            console.error("Failed to update unread notifications count:", err);
        }
    }
    updateUnreadNotificationsCount();
    setInterval(updateUnreadNotificationsCount, 10000);

    // --- DOCUMENT VAULT CONTROLLERS ---
    window.previewVaultDocument = function(filename) {
        window.open(`/api/files/document/${filename}`, '_blank');
    };

    window.downloadVaultDocument = function(filename) {
        const link = document.createElement("a");
        link.href = `/api/files/document/${filename}`;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    window.triggerVaultReplace = function(docType) {
        document.getElementById("vault-replace-type").value = docType;
        document.getElementById("vault-replace-title").innerText = docType;
        document.getElementById("vault-replace-container").style.display = "block";
        document.getElementById("vault-replace-file").value = "";
        document.getElementById("vault-replace-container").scrollIntoView({ behavior: 'smooth' });
    };

    window.cancelVaultReplace = function() {
        document.getElementById("vault-replace-container").style.display = "none";
    };

    window.deleteVaultDocument = function(docType) {
        if (confirm(`Are you sure you want to delete your uploaded ${docType}?`)) {
            delete uploadedDocumentsState[docType];
            localStorage.setItem("uploaded_docs_state", JSON.stringify(uploadedDocumentsState));
            showToast(`${docType} deleted successfully!`, "success");
            fetchVaultDocuments();
            if (typeof generateDocumentsChecklist === "function") {
                generateDocumentsChecklist(activeApplicationData.loan_type, activeApplicationData.employment_type, true);
            }
        }
    };

    const vaultReplaceForm = document.getElementById("vault-replace-form");
    if (vaultReplaceForm) {
        vaultReplaceForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const docType = document.getElementById("vault-replace-type").value;
            const fileInput = document.getElementById("vault-replace-file");
            const file = fileInput.files[0];
            if (!file) return;
            
            const formData = new FormData();
            formData.append("file", file);
            formData.append("doc_type", docType);
            
            try {
                const result = await apiUpload("/documents/upload", formData);
                if (result) {
                    const filename = result.filepath.split("/").pop();
                    uploadedDocumentsState[docType] = {
                        filename: filename,
                        status: "Uploaded",
                        quality: result.quality,
                        ocr: result.ocr,
                        fraud: result.fraud,
                        filepath: result.filepath
                    };
                    localStorage.setItem("uploaded_docs_state", JSON.stringify(uploadedDocumentsState));
                    showToast(`${docType} replaced successfully!`, "success");
                    document.getElementById("vault-replace-container").style.display = "none";
                    fetchVaultDocuments();
                    if (typeof generateDocumentsChecklist === "function") {
                        generateDocumentsChecklist(activeApplicationData.loan_type, activeApplicationData.employment_type, true);
                    }
                }
            } catch(err) {
                showToast(err.message || "Failed to replace document", "error");
            }
        });
    }

    // --- LOAN HISTORY CONTROLLERS ---
    window.fetchLoanHistory = async function() {
        const tbody = document.getElementById("history-applications-tbody");
        if (!tbody) return;
        
        try {
            const apps = await apiGet("/applications/my");
            tbody.innerHTML = "";
            
            if (!apps || apps.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" style="padding: 30px; text-align: center; color: var(--text-muted);">
                            <i class="fa-solid fa-clock-rotate-left" style="font-size: 3rem; color: var(--border-color); margin-bottom: 1rem; display: block;"></i>
                            No application history found. Apply for a loan to get started.
                        </td>
                    </tr>
                `;
                return;
            }
            
            apps.sort((a,b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
            
            apps.forEach(app => {
                const tr = document.createElement("tr");
                tr.style.borderBottom = "1px solid var(--border-color)";
                
                const remarks = app.officer_remarks || "No remarks added yet.";
                const createdDate = app.created_at ? new Date(app.created_at).toLocaleDateString() : "N/A";
                
                let badgeClass = "status-pending";
                if (app.status === "Approved") badgeClass = "status-approved";
                if (app.status === "Rejected") badgeClass = "status-rejected";
                
                tr.innerHTML = `
                    <td style="padding: 12px 10px; font-family: monospace; font-size: 0.85rem;">${app._id}</td>
                    <td style="padding: 12px 10px; font-weight: 600;">${app.loan_type}</td>
                    <td style="padding: 12px 10px; font-weight: 600;">₹${parseFloat(app.loan_amount).toLocaleString()}</td>
                    <td style="padding: 12px 10px; color: var(--text-secondary);">${createdDate}</td>
                    <td style="padding: 12px 10px;"><span class="status-badge ${badgeClass}">${app.status || 'Pending'}</span></td>
                    <td style="padding: 12px 10px; color: var(--text-secondary); font-size: 0.85rem; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${remarks}">${remarks}</td>
                    <td style="padding: 12px 10px; display: flex; gap: 6px; justify-content: center; align-items: center;">
                        <button class="btn btn-secondary btn-xs" onclick="viewLoanHistoryDetails('${app._id}')" style="padding: 4px 8px; font-size: 0.75rem;"><i class="fa-solid fa-circle-info"></i> Details</button>
                        <a href="/api/files/report/application_${app._id}.pdf" download class="btn btn-secondary btn-xs" style="padding: 4px 8px; font-size: 0.75rem;"><i class="fa-solid fa-file-pdf"></i> Application</a>
                        <a href="/api/files/report/verification_${app._id}.pdf" download class="btn btn-secondary btn-xs" style="padding: 4px 8px; font-size: 0.75rem;"><i class="fa-solid fa-shield-halved"></i> Audit</a>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } catch(err) {
            tbody.innerHTML = `<tr><td colspan="7" style="padding: 20px; text-align: center; color: var(--danger);">Failed to load loan history: ${err.message}</td></tr>`;
        }
    };

    window.viewLoanHistoryDetails = async function(appId) {
        const panel = document.getElementById("history-details-panel");
        if (!panel) return;
        
        try {
            const apps = await apiGet("/applications/my");
            const app = apps.find(a => a._id === appId);
            if (!app) return;
            
            panel.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">
                    <div>
                        <h3 style="color: var(--primary-light); font-weight: 800; font-size: 1.35rem;">Loan Application Summary</h3>
                        <span style="font-size: 0.85rem; color: var(--text-muted);">Application ID: <strong>${app._id}</strong></span>
                    </div>
                    <button class="btn btn-secondary btn-sm" onclick="document.getElementById('history-details-panel').style.display='none'"><i class="fa-solid fa-xmark"></i> Close Details</button>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div>
                        <h4 style="margin-bottom: 10px; color: var(--text-primary); border-left: 3px solid var(--primary-light); padding-left: 8px;">Applicant & Personal Info</h4>
                        <table style="width:100%; font-size:0.9rem; line-height: 1.8;">
                            <tr><td><strong>Name:</strong></td><td>${app.name}</td></tr>
                            <tr><td><strong>Email:</strong></td><td>${app.email}</td></tr>
                            <tr><td><strong>Mobile:</strong></td><td>${app.mobile || 'N/A'}</td></tr>
                            <tr><td><strong>DOB:</strong></td><td>${app.dob || 'N/A'}</td></tr>
                            <tr><td><strong>Gender:</strong></td><td>${app.gender || 'N/A'}</td></tr>
                            <tr><td><strong>Address:</strong></td><td>${app.address || 'N/A'}</td></tr>
                        </table>
                    </div>
                    <div>
                        <h4 style="margin-bottom: 10px; color: var(--text-primary); border-left: 3px solid var(--primary-light); padding-left: 8px;">Loan parameters</h4>
                        <table style="width:100%; font-size:0.9rem; line-height: 1.8;">
                            <tr><td><strong>Loan Type:</strong></td><td>${app.loan_type}</td></tr>
                            <tr><td><strong>Requested Amount:</strong></td><td>₹${parseFloat(app.loan_amount).toLocaleString()}</td></tr>
                            <tr><td><strong>Interest Rate:</strong></td><td>${app.interest_rate}% p.a.</td></tr>
                            <tr><td><strong>Repayment Tenure:</strong></td><td>${app.tenure} Years</td></tr>
                            <tr><td><strong>Calculated EMI:</strong></td><td>₹${parseFloat(app.emi || 0).toLocaleString()} / month</td></tr>
                            <tr><td><strong>System Risk Score:</strong></td><td>${app.risk_score}% (Risk Index)</td></tr>
                        </table>
                    </div>
                </div>
                
                <div style="margin-top: 1.5rem;">
                    <h4 style="margin-bottom: 10px; color: var(--text-primary); border-left: 3px solid var(--primary-light); padding-left: 8px;">Status Timeline</h4>
                    <ul class="timeline" style="margin-top: 10px;">
                        ${(app.status_timeline || []).map(t => `
                            <li class="timeline-item success">
                                <span class="timeline-icon"></span>
                                <div style="font-weight: 700; font-size:0.9rem;">${t.stage}</div>
                                <div style="font-size:0.8rem; color:var(--text-muted);">${t.timestamp}</div>
                                <div style="font-size:0.85rem; color:var(--text-secondary);">${t.remarks}</div>
                            </li>
                        `).join('') || '<li style="color:var(--text-muted);">No timeline logs recorded.</li>'}
                    </ul>
                </div>
            `;
            panel.style.display = "block";
            panel.scrollIntoView({ behavior: 'smooth' });
        } catch(err) {
            showToast(err.message || "Failed to show application details", "error");
        }
    };

    // Auto load previous documents to pre-populate document management
    async function loadPreviousDocuments() {
        try {
            const apps = await apiGet("/applications/my");
            if (apps && apps.length > 0) {
                apps.sort((a,b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
                const prevApp = apps.find(a => a.uploaded_documents && Object.keys(a.uploaded_documents).length > 0);
                if (prevApp) {
                    const prevDocs = prevApp.uploaded_documents;
                    const localDocs = JSON.parse(localStorage.getItem("uploaded_docs_state") || "{}");
                    let updated = false;
                    for (const docType in prevDocs) {
                        if (!localDocs[docType]) {
                            localDocs[docType] = prevDocs[docType];
                            updated = true;
                        }
                    }
                    if (updated) {
                        localStorage.setItem("uploaded_docs_state", JSON.stringify(localDocs));
                        Object.assign(uploadedDocumentsState, localDocs);
                    }
                }
            }
        } catch(err) {
            console.error("Failed to load previous documents:", err);
        }
    }
    loadPreviousDocuments();

    // Hook routing context
    const originalShowSection = window.showSection;
    window.showSection = function(sectionId) {
        if (sectionId === 'documents') {
            fetchVaultDocuments();
        } else if (sectionId === 'history') {
            fetchLoanHistory();
        }
        if (typeof originalShowSection === 'function') {
            originalShowSection(sectionId);
        }
    };
});
