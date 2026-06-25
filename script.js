/**
 * Main Application Script
 * Handles UI interactions, form management, and orchestrates the data flow
 */

class PeriInflamApp {
    constructor() {
        this.cbcData = {};
        this.periodontalData = {};
        this.initializeUI();
    }

    initializeUI() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // PDF Upload
        const uploadArea = document.getElementById('uploadArea');
        const pdfFile = document.getElementById('pdfFile');
        
        uploadArea.addEventListener('click', () => pdfFile.click());
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.background = '#e3f2fd';
        });
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.background = 'var(--gray-light)';
        });
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.background = 'var(--gray-light)';
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                pdfFile.files = files;
                document.getElementById('extractBtn').disabled = false;
                this.showStatus('PDF file selected. Click "Extract from PDF" to parse.', 'info');
            }
        });

        pdfFile.addEventListener('change', () => {
            if (pdfFile.files.length > 0) {
                document.getElementById('extractBtn').disabled = false;
                this.showStatus('PDF file selected. Click "Extract from PDF" to parse.', 'info');
            }
        });

        ['mpd', 'mcal', 'ibl', 'hba1c'].forEach((id) => {
            const field = document.getElementById(id);
            if (field) {
                field.addEventListener('input', () => this.updatePeriodontalClassification());
                field.addEventListener('change', () => this.updatePeriodontalClassification());
            }
        });

        // Extract PDF button
        document.getElementById('extractBtn').addEventListener('click', () => this.extractPDF());

        // Calculate CBC
        document.getElementById('calculateCBCBtn').addEventListener('click', () => this.calculateCBC());

        // Save Periodontal Data
        document.getElementById('savePerioBtn').addEventListener('click', () => this.savePeriodontal());

        // Export Results
        document.getElementById('exportBtn').addEventListener('click', () => this.exportResults());
    }

    // No runtime API key UI — API must be preconfigured in `gemini-handler.js`
    updateApiKeyStatus() {
        return;
    }

    switchTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });

        // Deactivate all buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected tab
        document.getElementById(tabName).classList.add('active');
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    }

    async extractPDF() {
        const pdfFile = document.getElementById('pdfFile').files[0];
        if (!pdfFile) {
            this.showError('Please select a PDF file first');
            return;
        }

        try {
            this.showStatus('Extracting text from PDF...', 'info');
            
            // Extract text from PDF
            const extractedText = await PDFHandler.extractTextFromPDF(pdfFile);

            if (!PDFHandler.isValidExtraction(extractedText)) {
                throw new Error('PDF extraction returned insufficient text');
            }

            this.showStatus('Sending extracted text to backend...', 'info');

            // Check if backend API is configured
            if (!GeminiHandler.isConfigured()) {
                this.showError('⚠️ Backend API not configured in app. Falling back to basic parsing.');
                const rawValues = await PDFHandler.parseRawCBCValues(extractedText);
                this.fillCBCFields(rawValues);
                return;
            }

            // Use the backend to intelligently extract values
            const parsedValues = await GeminiHandler.extractCBCFromPDF(extractedText);
            
            this.cbcData = parsedValues;
            this.fillCBCFields(parsedValues);
            
            this.showStatus('✓ CBC data extracted successfully! Review and correct if needed.', 'success');

        } catch (error) {
            // Check for quota exhausted error
            if (error.message === 'AI_QUOTA_EXHAUSTED') {
                this.showError('🔄 AI is temporarily unavailable. The free trial quota has been exhausted. Please enter values manually or try again later.');
            } else if (error.message.includes('Backend API')) {
                this.showError('⚠️ Backend API is not configured. Set the Render URL in the frontend config and try again.');
            } else {
                this.showError(`Error: ${error.message}`);
            }
            
            // Allow manual entry
            this.switchTab('cbc-data');
        }
    }

    fillCBCFields(values) {
        const setIfFinite = (id, val) => {
            if (val !== undefined && val !== null && Number.isFinite(Number(val))) {
                document.getElementById(id).value = val;
            }
        };

        setIfFinite('rbc', values.rbc);
        setIfFinite('wbc', values.wbc);
        setIfFinite('hb', values.hb);
        setIfFinite('plt', values.plt);
        setIfFinite('neutrophils', values.neutrophils);
        setIfFinite('lymphocytes', values.lymphocytes);
        setIfFinite('hba1c', values.hba1c);

        this.updatePeriodontalClassification();
    }

    calculateCBC() {
        try {
            // Get values from form
            const rbc = parseFloat(document.getElementById('rbc').value);
            const wbc = parseFloat(document.getElementById('wbc').value);
            const hb = parseFloat(document.getElementById('hb').value);
            const plt = parseFloat(document.getElementById('plt').value);
            const neutrophils = parseFloat(document.getElementById('neutrophils').value) || 0;
            const lymphocytes = parseFloat(document.getElementById('lymphocytes').value) || 0;
            const hba1c = parseFloat(document.getElementById('hba1c').value);

            // Validate
            if (!plt || !neutrophils || !lymphocytes) {
                this.showError('Please fill in Platelets, Neutrophils %, and Lymphocytes % for calculations');
                return;
            }

            // Store data
            this.cbcData = {
                rbc, wbc, hb, plt, neutrophils, lymphocytes, hba1c
            };

            // Calculate indices
            const sii = Calculator.calculateSII(plt, neutrophils, lymphocytes);
            const pir = Calculator.calculatePLR(plt, lymphocytes);
            const siri = Calculator.calculateSIRI(wbc, neutrophils, lymphocytes);

            // Display results
            document.getElementById('siiValue').textContent = sii.toFixed(2);
            document.getElementById('pivValue').textContent = pir.toFixed(2);
            document.getElementById('siriValue').textContent = siri.toFixed(2);

            if (hba1c) {
                const hba1cInterpretation = Calculator.interpretHbA1c(hba1c);
                document.getElementById('hba1cValue').textContent = hba1c.toFixed(1) + '%';
                document.getElementById('hba1cNote').textContent = `${hba1cInterpretation.status} (${hba1cInterpretation.note})`;
            } else {
                document.getElementById('hba1cValue').textContent = 'N/A';
                document.getElementById('hba1cNote').textContent = '';
            }

            this.updatePeriodontalClassification();

            this.showStatus('✓ Inflammatory indices calculated successfully!', 'success');
            this.switchTab('results');

        } catch (error) {
            this.showError(`Calculation error: ${error.message}`);
        }
    }

    savePeriodontal() {
        try {
            const mpd = parseFloat(document.getElementById('mpd').value);
            const mcal = parseFloat(document.getElementById('mcal').value);
            const ibl = parseFloat(document.getElementById('ibl').value);
            const alsa = parseFloat(document.getElementById('alsa').value);
            const pisa = parseFloat(document.getElementById('pisa').value);
            const pesa = parseFloat(document.getElementById('pesa').value);
            const hba1c = parseFloat(document.getElementById('hba1c').value);

            const classification = this.updatePeriodontalClassification();
            const staging = classification.stage;
            const grading = classification.grade;

            // Store data
            this.periodontalData = {
                mpd, mcal, ibl, alsa, pisa, pesa, staging, grading,
                stageLabel: classification.stageLabel,
                gradeLabel: classification.gradeLabel,
                gradeSource: classification.gradeSource,
                hba1c
            };

            // Display in results
            document.getElementById('rMpd').textContent = mpd ? mpd.toFixed(2) + ' mm' : '—';
            document.getElementById('rMcal').textContent = mcal ? mcal.toFixed(2) + ' mm' : '—';
            document.getElementById('rIbl').textContent = ibl ? ibl.toFixed(2) + ' mm' : '—';
            document.getElementById('rAlsa').textContent = alsa ? alsa.toFixed(2) + ' mm²' : '—';
            document.getElementById('rPisa').textContent = pisa ? pisa.toFixed(2) + ' mm²' : '—';
            document.getElementById('rPesa').textContent = pesa ? pesa.toFixed(2) + ' mm²' : '—';
            document.getElementById('rStaging').textContent = classification.stageLabel;
            document.getElementById('rGrading').textContent = classification.gradeLabel;

            const stagingSelect = document.getElementById('staging');
            const gradingSelect = document.getElementById('grading');
            if (stagingSelect) stagingSelect.value = staging;
            if (gradingSelect) gradingSelect.value = grading;

            // Calculate PISA/PESA ratio if both available
            if (pisa && pesa) {
                const ratio = Calculator.calculatePISA_PESA_Ratio(pisa, pesa);
                console.log(`PISA/PESA Ratio: ${ratio.toFixed(2)}%`);
            }

            this.showStatus('✓ Periodontal data saved successfully!', 'success');
            this.switchTab('results');

        } catch (error) {
            this.showError(`Error: ${error.message}`);
        }
    }

    updatePeriodontalClassification() {
        const mpd = parseFloat(document.getElementById('mpd').value);
        const mcal = parseFloat(document.getElementById('mcal').value);
        const ibl = parseFloat(document.getElementById('ibl').value);
        const hba1c = parseFloat(document.getElementById('hba1c').value);
        const classification = Calculator.calculatePeriodontalClassification({ mpd, mcal, ibl, hba1c });

        const stagingSelect = document.getElementById('staging');
        const gradingSelect = document.getElementById('grading');

        if (stagingSelect) stagingSelect.value = classification.stage;
        if (gradingSelect) gradingSelect.value = classification.grade;

        const stagingOutput = document.getElementById('rStaging');
        const gradingOutput = document.getElementById('rGrading');
        if (stagingOutput) stagingOutput.textContent = classification.stageLabel;
        if (gradingOutput) gradingOutput.textContent = classification.gradeLabel;

        return classification;
    }

    exportResults() {
        try {
            const results = {
                timestamp: new Date().toISOString(),
                cbcData: this.cbcData,
                periodontalData: this.periodontalData,
                calculations: {
                    sii: document.getElementById('siiValue').textContent,
                    pir: document.getElementById('pivValue').textContent,
                    siri: document.getElementById('siriValue').textContent,
                    hba1c: document.getElementById('hba1cValue').textContent
                }
            };

            // Create JSON file
            const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `PeriInflam_Results_${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showStatus('✓ Results exported successfully!', 'success');

        } catch (error) {
            this.showError(`Export error: ${error.message}`);
        }
    }

    showStatus(message, type = 'info') {
        const statusEl = document.getElementById('extractStatus');
        statusEl.textContent = message;
        statusEl.className = `status-message ${type}`;
    }

    showError(message) {
        const toast = document.getElementById('errorToast');
        toast.textContent = message;
        toast.style.display = 'block';
        setTimeout(() => {
            toast.style.display = 'none';
        }, 5000);
    }

    showSuccess(message) {
        const toast = document.getElementById('successToast');
        toast.textContent = message;
        toast.style.display = 'block';
        setTimeout(() => {
            toast.style.display = 'none';
        }, 5000);
    }
}

// Initialize app on DOM load
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PeriInflamApp();
    console.log('PeriInflam Calculator initialized');
});
