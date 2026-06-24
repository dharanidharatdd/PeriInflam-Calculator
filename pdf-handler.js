/**
 * PDF Handler Module
 * Handles PDF file upload and text extraction using PDF.js
 */

const PDFHandler = {
    /**
     * Extract text from uploaded PDF file
     * @param {File} file - The PDF file object
     * @returns {Promise<string>} Extracted text from PDF
     */
    async extractTextFromPDF(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = async (e) => {
                try {
                    const typedarray = new Uint8Array(e.target.result);
                    const pdf = await pdfjsLib.getDocument(typedarray).promise;
                    
                    let extractedText = '';
                    
                    // Extract text from all pages
                    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                        const page = await pdf.getPage(pageNum);
                        const textContent = await page.getTextContent();
                        const pageText = textContent.items.map(item => item.str).join(' ');
                        extractedText += pageText + '\n';
                    }
                    
                    resolve(extractedText);
                } catch (error) {
                    reject(new Error(`Failed to extract PDF text: ${error.message}`));
                }
            };

            reader.onerror = (error) => {
                reject(new Error('Failed to read PDF file'));
            };

            reader.readAsArrayBuffer(file);
        });
    },

    /**
     * Parse CBC values from extracted text
     * Uses regex patterns to find common CBC value patterns
     * @param {string} text - Extracted text from PDF
     * @returns {object} Parsed CBC values (raw parse, before Gemini refinement)
     */
    async parseRawCBCValues(text) {
        const values = {
            rbc: null,
            wbc: null,
            hb: null,
            plt: null,
            neutrophils: null,
            lymphocytes: null
        };

        // Regex patterns for common CBC test results
        // These are approximate patterns - Gemini will refine these
        
        // RBC pattern (usually 3-7 range, with decimal)
        const rbcMatch = text.match(/RBC|Red\s+Blood\s+Cell[^0-9]*([3-7]\.[0-9]{1,2})/i);
        if (rbcMatch) values.rbc = parseFloat(rbcMatch[1]);

        // WBC pattern (usually 4-11 range)
        const wbcMatch = text.match(/WBC|White\s+Blood\s+Cell[^0-9]*([4-9]\.[0-9]{1,2}|[0-9]{1,2}\.[0-9]{1,2})/i);
        if (wbcMatch) values.wbc = parseFloat(wbcMatch[1]);

        // Hemoglobin pattern (usually 10-18)
        const hbMatch = text.match(/Hemoglobin|Hb|HGB[^0-9]*([0-9]{1,2}\.[0-9]{1,2})/i);
        if (hbMatch) values.hb = parseFloat(hbMatch[1]);

        // Platelets pattern (usually 150-400)
        const pltMatch = text.match(/Platelet|PLT[^0-9]*([0-9]{2,4}\.[0-9]{1,2}|[0-9]{2,4})/i);
        if (pltMatch) values.plt = parseFloat(pltMatch[1]);

        // Neutrophils pattern (percentage)
        const neutMatch = text.match(/Neutrophil[^0-9]*([0-9]{1,2}\.[0-9]{1,2}|[0-9]{1,2})%?/i);
        if (neutMatch) values.neutrophils = parseFloat(neutMatch[1]);

        // Lymphocytes pattern (percentage)
        const lymphMatch = text.match(/Lymphocyte[^0-9]*([0-9]{1,2}\.[0-9]{1,2}|[0-9]{1,2})%?/i);
        if (lymphMatch) values.lymphocytes = parseFloat(lymphMatch[1]);

        return values;
    },

    /**
     * Validate if enough text was extracted from PDF
     * @param {string} text - Extracted text
     * @returns {boolean} True if text seems valid
     */
    isValidExtraction(text) {
        return text && text.length > 100;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PDFHandler;
}
