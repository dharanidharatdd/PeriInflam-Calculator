/**
 * Gemini API Handler Module
 * Handles integration with Google Gemini API for intelligent PDF parsing
 * 
 * IMPORTANT: Add your Gemini API key to the config below
 * Get it from: https://makersuite.google.com/app/apikey
 */

const GeminiHandler = {
    // ⚠️ Preconfigure your Gemini API key here for static hosting.
    // Replace 'YOUR_GEMINI_API_KEY_HERE' with your actual key before testing/deploying.
    API_KEY: 'api-key-here',
    API_URL: 'https://generativelanguage.googleapis.com/v1beta/interactions',
    MODEL: 'gemini-3.5-flash',
    
    /**
     * Check if API key is configured
     * @returns {boolean}
     */
    isConfigured() {
        return this.API_KEY.length > 0;
    },

    /**
     * Set API key (for runtime configuration)
     * @param {string} key - Gemini API key
     */
    setApiKey(key) {
        this.API_KEY = key;
        localStorage.setItem('gemini_api_key', key);
    },

    clearApiKey() {
        this.API_KEY = '';
        localStorage.removeItem('gemini_api_key');
    },

    /**
     * Call Gemini API to extract CBC values from PDF text
     * @param {string} extractedText - Text extracted from PDF
     * @returns {Promise<object>} Parsed CBC values
     */
    async extractCBCFromPDF(extractedText) {
        if (!this.isConfigured()) {
            throw new Error('Gemini API key not configured. Please add your API key in gemini-handler.js');
        }

        const prompt = `You are a medical data extraction expert. Extract Complete Blood Picture (CBC) values from the following text.

Return ONLY a valid JSON object (no markdown, no explanation) with these exact keys:
{
  "rbc": <number or null>,
  "wbc": <number or null>,
  "hemoglobin": <number or null>,
  "platelets": <number or null>,
  "neutrophils": <number or null>,
  "lymphocytes": <number or null>,
  "monocytes": <number or null>,
  "hba1c": <number or null>
}

Medical text to extract from:
${extractedText}

Important:
- Use null for missing values
- Convert percentages to decimal (e.g., 60% = 60, not 0.6)
- RBC typically 3-7, WBC 4-11, Hemoglobin 10-18, Platelets 150-400
- Return ONLY valid JSON, no other text`;

        try {
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'x-goog-api-key': this.API_KEY,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: this.MODEL,
                    input: prompt
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                
                // Check for rate limit or quota exceeded
                if (response.status === 429 || (errorData.error && errorData.error.message.includes('RESOURCE_EXHAUSTED'))) {
                    throw new Error('AI_QUOTA_EXHAUSTED');
                }
                
                if (response.status === 401) {
                    throw new Error('Invalid API key');
                }

                throw new Error(`API Error: ${errorData.error?.message || 'Unknown error'}`);
            }

            const data = await response.json();
            
            if (!data.steps || !Array.isArray(data.steps)) {
                throw new Error('Invalid API response format');
            }

            // Find the model_output step
            const outputStep = data.steps.find(step => step.type === 'model_output');
            if (!outputStep || !outputStep.content || !outputStep.content[0]) {
                throw new Error('No model output found in API response');
            }

            const responseText = outputStep.content[0].text.trim();
            
            // Try to extract JSON from response
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No valid JSON found in API response');
            }

            const parsedData = JSON.parse(jsonMatch[0]);
            
            return {
                rbc: parsedData.rbc,
                wbc: parsedData.wbc,
                hb: parsedData.hemoglobin,
                plt: parsedData.platelets,
                neutrophils: parsedData.neutrophils,
                lymphocytes: parsedData.lymphocytes,
                monocytes: parsedData.monocytes,
                hba1c: parsedData.hba1c
            };

        } catch (error) {
            // Re-throw quota exceeded with special error code
            if (error.message === 'AI_QUOTA_EXHAUSTED') {
                throw error;
            }
            throw new Error(`Failed to extract CBC data: ${error.message}`);
        }
    },

    /**
     * Call Gemini to validate and correct extracted values
     * @param {object} values - Raw extracted values
     * @returns {Promise<object>} Validated values
     */
    async validateCBCValues(values) {
        if (!this.isConfigured()) {
            return values; // Return as-is if API not configured
        }

        const prompt = `Validate these Complete Blood Picture values. If any are outside normal ranges, flag them.
Return valid JSON only:

{
  "rbc": <number>,
  "wbc": <number>,
  "hemoglobin": <number>,
  "platelets": <number>,
  "neutrophils": <number>,
  "lymphocytes": <number>,
  "warnings": [<any warnings>]
}

Current values: ${JSON.stringify(values)}

Normal ranges:
- RBC: 3.5-5.5 (10^6/μL)
- WBC: 4.5-11.0 (10^3/μL)
- Hemoglobin: 12-17 (g/dL for females), 13.5-18 (g/dL for males)
- Platelets: 150-400 (10^3/μL)
- Neutrophils: 40-75%
- Lymphocytes: 20-50%`;

        try {
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'x-goog-api-key': this.API_KEY,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: this.MODEL,
                    input: prompt
                })
            });

            if (!response.ok) {
                console.warn('Validation API call failed, continuing with raw values');
                return values;
            }

            const data = await response.json();
            const outputStep = data.steps.find(step => step.type === 'model_output');
            if (!outputStep || !outputStep.content || !outputStep.content[0]) {
                return values;
            }

            const responseText = outputStep.content[0].text.trim();
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            
            return values;
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
