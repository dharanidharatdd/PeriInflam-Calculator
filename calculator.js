/**
 * Calculator Module
 * Contains all calculation functions for inflammatory and periodontal indices
 */

const Calculator = {
    /**
     * Calculate Systemic Immune-Inflammation Index (SII)
     * Formula: SII = (Platelets × Neutrophils) / Lymphocytes
     * 
     * @param {number} platelets - Platelet count (10^3/μL)
     * @param {number} neutrophils - Neutrophil percentage (%)
     * @param {number} lymphocytes - Lymphocyte percentage (%)
     * @returns {number} SII value
     */
    calculateSII(platelets, neutrophils, lymphocytes) {
        if (!platelets || !neutrophils || !lymphocytes) {
            throw new Error('Missing required values for SII calculation');
        }

        // Convert percentages to counts (assuming WBC = 1 for now)
        // SII = (Plt × Neutrophil count) / Lymphocyte count
        const sii = (platelets * neutrophils) / lymphocytes;
        
        return Math.round(sii * 100) / 100;
    },

    /**
     * Calculate Platelet-to-Lymphocyte Ratio (PIV/PLR)
     * Formula: PLR = Platelets / Lymphocytes
     * 
     * @param {number} platelets - Platelet count (10^3/μL)
     * @param {number} lymphocytes - Lymphocyte percentage (%)
     * @returns {number} PLR value
     */
    calculatePLR(platelets, lymphocytes) {
        if (!platelets || !lymphocytes) {
            throw new Error('Missing required values for PLR calculation');
        }

        const plr = platelets / lymphocytes;
        return Math.round(plr * 100) / 100;
    },

    /**
     * Calculate Systemic Inflammation Response Index (SIRI)
     * Formula: SIRI = (Neutrophils × Monocytes) / Lymphocytes
     * Note: Using WBC × neutrophil % to estimate neutrophil count
     * 
     * @param {number} wbc - WBC count (10^3/μL)
     * @param {number} neutrophils - Neutrophil percentage (%)
     * @param {number} lymphocytes - Lymphocyte percentage (%)
     * @param {number} monocytes - Monocyte percentage (%), optional
     * @returns {number} SIRI value
     */
    calculateSIRI(wbc, neutrophils, lymphocytes, monocytes = 5) {
        if (!wbc || !neutrophils || !lymphocytes) {
            throw new Error('Missing required values for SIRI calculation');
        }

        // SIRI = (Neutrophil count × Monocyte count) / Lymphocyte count
        // Approximation: using percentages
        const siri = (neutrophils * monocytes) / lymphocytes;
        return Math.round(siri * 100) / 100;
    },

    /**
     * Interpret HbA1c value
     * @param {number} hba1c - HbA1c percentage
     * @returns {object} Interpretation and status
     */
    interpretHbA1c(hba1c) {
        if (hba1c < 5.7) {
            return {
                status: 'Normal',
                range: '< 5.7%',
                note: 'Healthy glucose level'
            };
        } else if (hba1c >= 5.7 && hba1c < 6.5) {
            return {
                status: 'Prediabetes',
                range: '5.7% - 6.4%',
                note: 'Increased risk for diabetes'
            };
        } else {
            return {
                status: 'Diabetes',
                range: '≥ 6.5%',
                note: 'Blood glucose management needed'
            };
        }
    },

    /**
     * Calculate Periodontal Status Score
     * Based on probing depth and clinical attachment loss
     * 
     * @param {number} mpd - Mean Probing Depth
     * @param {number} mcal - Mean Clinical Attachment Loss
     * @returns {object} Severity assessment
     */
    assessPeriodontalHealth(mpd, mcal) {
        if (!mpd || !mcal) {
            throw new Error('Missing periodontal measurements');
        }

        let severity = '';
        let riskLevel = '';

        if (mpd <= 3 && mcal <= 2) {
            severity = 'Healthy/Minimal Disease';
            riskLevel = 'Low';
        } else if (mpd <= 4 && mcal <= 3) {
            severity = 'Mild Periodontitis';
            riskLevel = 'Low-Moderate';
        } else if (mpd <= 6 && mcal <= 5) {
            severity = 'Moderate Periodontitis';
            riskLevel = 'Moderate-High';
        } else {
            severity = 'Severe Periodontitis';
            riskLevel = 'High';
        }

        return {
            severity,
            riskLevel,
            mpd,
            mcal
        };
    },

    /**
     * Automatically classify periodontal stage and grade using the 2017 framework.
     * This uses the measurements available in the app and falls back to severity-based
     * grading when HbA1c is not provided.
     *
     * @param {object} data - Periodontal inputs
     * @param {number} data.mpd - Mean probing depth
     * @param {number} data.mcal - Mean clinical attachment loss
     * @param {number} data.ibl - Interdental bone loss
     * @param {number} data.hba1c - HbA1c percentage
     * @returns {object} Automatic stage/grade classification
     */
    calculatePeriodontalClassification({ mpd, mcal, ibl, hba1c } = {}) {
        const hasMpd = Number.isFinite(mpd);
        const hasMcal = Number.isFinite(mcal);
        const hasIbl = Number.isFinite(ibl);
        const hasHbA1c = Number.isFinite(hba1c);

        let stage = '';
        let stageLabel = '—';
        let grade = '';
        let gradeLabel = '—';
        let gradeSource = '—';

        if (hasMpd || hasMcal || hasIbl) {
            const depth = hasMpd ? mpd : 0;
            const attachmentLoss = hasMcal ? mcal : 0;
            const boneLoss = hasIbl ? ibl : null;

            if ((attachmentLoss <= 2 && depth <= 4 && (boneLoss === null || boneLoss < 15))) {
                stage = '1';
                stageLabel = 'Stage 1';
            } else if ((attachmentLoss > 2 && attachmentLoss <= 4 && depth <= 5 && (boneLoss === null || (boneLoss >= 15 && boneLoss < 33)))) {
                stage = '2';
                stageLabel = 'Stage 2';
            } else if ((attachmentLoss > 4 && attachmentLoss <= 6 && depth <= 6 && (boneLoss === null || (boneLoss >= 33 && boneLoss < 50)))) {
                stage = '3';
                stageLabel = 'Stage 3';
            } else {
                stage = '4';
                stageLabel = 'Stage 4';
            }

            if (hasHbA1c) {
                if (hba1c < 5.7) {
                    grade = 'A';
                    gradeLabel = 'Grade A';
                } else if (hba1c < 6.5) {
                    grade = 'B';
                    gradeLabel = 'Grade B';
                } else {
                    grade = 'C';
                    gradeLabel = 'Grade C';
                }
                gradeSource = 'HbA1c';
            } else {
                if (stage === '1') {
                    grade = 'A';
                    gradeLabel = 'Grade A';
                } else if (stage === '2') {
                    grade = 'B';
                    gradeLabel = 'Grade B';
                } else {
                    grade = 'C';
                    gradeLabel = 'Grade C';
                }
                gradeSource = 'Periodontal severity';
            }
        }

        return {
            stage,
            stageLabel,
            grade,
            gradeLabel,
            gradeSource
        };
    },

    /**
     * Calculate PISA to PESA ratio
     * Indicates inflammatory burden relative to epithelial surface
     * 
     * @param {number} pisa - Periodontal Inflamed Surface Area
     * @param {number} pesa - Periodontal Epithelial Surface Area
     * @returns {number} PISA/PESA ratio
     */
    calculatePISA_PESA_Ratio(pisa, pesa) {
        if (!pisa || !pesa || pesa === 0) {
            throw new Error('Invalid PISA or PESA values');
        }

        const ratio = (pisa / pesa) * 100;
        return Math.round(ratio * 100) / 100;
    },

    /**
     * Validate all input values
     * @param {object} data - Object containing all input values
     * @returns {object} Validation result with errors if any
     */
    validateInputs(data) {
        const errors = [];

        // CBC validation
        if (data.rbc !== undefined && data.rbc !== '') {
            if (data.rbc < 3 || data.rbc > 7) errors.push('RBC out of normal range (3-7)');
        }

        if (data.wbc !== undefined && data.wbc !== '') {
            if (data.wbc < 4 || data.wbc > 11) errors.push('WBC out of normal range (4-11)');
        }

        if (data.hb !== undefined && data.hb !== '') {
            if (data.hb < 10 || data.hb > 18) errors.push('Hemoglobin out of normal range (10-18)');
        }

        if (data.plt !== undefined && data.plt !== '') {
            if (data.plt < 100 || data.plt > 400) errors.push('Platelets out of normal range (100-400)');
        }

        // Periodontal validation
        if (data.mpd !== undefined && data.mpd !== '') {
            if (data.mpd < 0 || data.mpd > 20) errors.push('Mean Probing Depth out of valid range');
        }

        if (data.mcal !== undefined && data.mcal !== '') {
            if (data.mcal < 0 || data.mcal > 20) errors.push('Mean CAL out of valid range');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Calculator;
}
