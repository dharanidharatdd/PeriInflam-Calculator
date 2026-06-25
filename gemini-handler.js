/**
 * API Handler Module
 * Uses the FastAPI backend as the Gemini proxy for CBC extraction.
 */

const GeminiHandler = {
    API_BASE_URL: (window.PERIOMETRIX_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, ''),
    
    isConfigured() {
        return this.API_BASE_URL.length > 0;
    },

    async extractCBCFromPDF(extractedText) {
        if (!this.isConfigured()) {
            throw new Error('Backend API base URL is not configured');
        }

        try {
            const response = await fetch(`${this.API_BASE_URL}/api/extract-cbc`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: extractedText })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));

                if (response.status === 503) {
                    throw new Error('AI_QUOTA_EXHAUSTED');
                }

                throw new Error(`API Error: ${errorData.error?.message || 'Unknown error'}`);
            }

            const data = await response.json();
            
            return {
                rbc: data.rbc,
                wbc: data.wbc,
                hb: data.hemoglobin,
                plt: data.platelets,
                neutrophils: data.neutrophils,
                lymphocytes: data.lymphocytes,
                monocytes: data.monocytes,
                hba1c: data.hba1c
            };

        } catch (error) {
            // Re-throw quota exceeded with special error code
            if (error.message === 'AI_QUOTA_EXHAUSTED') {
                throw error;
            }
            throw new Error(`Failed to extract CBC data: ${error.message}`);
        }
    },

    async validateCBCValues(values) {
        if (!this.isConfigured()) {
            return values; // Return as-is if API not configured
        }

        try {
            const response = await fetch(`${this.API_BASE_URL}/api/validate-cbc`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values)
            });

            if (!response.ok) {
                console.warn('Validation API call failed, continuing with raw values');
                return values;
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.warn('Validation failed:', error.message);
            return values;
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GeminiHandler;
}
