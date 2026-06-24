# PeriInflam Calculator 

A comprehensive web application for calculating systemic inflammatory indices and assessing periodontal health. Combines blood test data with periodontal measurements for integrated clinical assessment.

## Features

### 📊 Systemic Inflammatory Indices
- **SII (Systemic Immune-inflammation Index)** - Formula: (Plt × N) / L
- **PIV (Platelet-to-Lymphocyte Ratio)** - Formula: Plt / L  
- **SIRI (Systemic Inflammation Response Index)** - Formula: (N × Mon) / L
- **HbA1c Interpretation** - Diabetes risk assessment

### 🦷 Periodontal Assessment
- Mean Probing Depth (MPD)
- Mean Clinical Attachment Loss (MCAL)
- Interdental Bone Loss (IBL)
- Alveolar Lesion Surface Area (ALSA)
- Periodontal Inflamed Surface Area (PISA)
- Periodontal Epithelial Surface Area (PESA)
- Periodontitis Staging & Grading

### 📄 Smart PDF Processing
- Drag-and-drop PDF upload
- AI-powered data extraction using Gemini API
- Auto-fill CBC fields from blood reports
- Manual entry as fallback

## Setup Instructions

### 1. Get Gemini API Key (Optional but Recommended)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy your API key

### 2. Add API Key to App

Open `gemini-handler.js` and replace:
```javascript
API_KEY: 'YOUR_GEMINI_API_KEY_HERE',
```

With your actual key:
```javascript
API_KEY: 'sk-abc123xyz...',
```

### 3. Deploy to GitHub Pages

1. Create a new GitHub repository named `periinflam-calculator`
2. Create a `gh-pages` branch
3. Upload all files to the repository
4. Go to repository Settings → Pages
5. Select `gh-pages` branch as source
6. Your app will be live at: `https://yourusername.github.io/periinflam-calculator/`

## File Structure

```
├── index.html           # Main HTML file
├── styles.css           # Complete styling
├── calculator.js        # Calculation functions
├── pdf-handler.js       # PDF text extraction
├── gemini-handler.js    # Gemini API integration
├── script.js            # Main app logic & UI
├── README.md            # This file
└── assets/              # Images, etc.
```

## How to Use

### Method 1: PDF Upload (with Gemini)
1. Go to "CBC Data" tab
2. Upload your blood report PDF
3. Click "Extract from PDF"
4. AI will extract and fill fields automatically
5. Review & edit if needed
6. Click "Calculate Inflammatory Indices"

### Method 2: Manual Entry
1. Enter CBC values manually in the form
2. Add periodontal measurements in the "Periodontal Data" tab
3. Review results in the "Results" tab
4. Export as JSON if needed

## API Usage & Limits

### Gemini Free Tier Limits
- **60 requests per minute**
- **1,500 requests per day**
- Billing starts when free tier quota is exceeded

### When "AI Temporarily Unavailable" Appears
- Free trial quota has been exhausted
- Solution: Enter values manually or wait for reset (usually monthly)
- The app works fully without AI—just requires manual data entry

### No Backend Required
✅ Runs entirely in browser
✅ No server costs
✅ Privacy-friendly (data stays on your device)
✅ Perfect for GitHub Pages

## Error Handling

The app includes comprehensive error handling:

| Error | Cause | Solution |
|-------|-------|----------|
| "AI is temporarily unavailable" | Gemini quota exceeded | Use manual entry or configure backup key |
| "API key not configured" | Missing API key in gemini-handler.js | Add your Gemini API key |
| "Invalid API key" | Wrong/expired API key | Check and update key in gemini-handler.js |
| PDF extraction failed | Invalid/scanned PDF | Try manual entry instead |

## Calculation Formulas

### SII (Systemic Immune-inflammation Index)
```
SII = (Platelet × Neutrophil%) / Lymphocyte%
```

### PIV (Platelet-to-Lymphocyte Ratio)
```
PIV = Platelet Count / Lymphocyte%
```

### SIRI (Systemic Inflammation Response Index)
```
SIRI = (Neutrophil% × Monocyte%) / Lymphocyte%
```

## Normal Ranges Reference

### Blood Values
- RBC: 4.5-5.5 (10^6/μL)
- WBC: 4.5-11.0 (10^3/μL)
- Hemoglobin: 13.5-17.5 (g/dL, males), 12-15.5 (g/dL, females)
- Platelets: 150-400 (10^3/μL)
- Neutrophils: 40-75%
- Lymphocytes: 20-50%

### Periodontal Values
- Healthy: PD ≤3mm, CAL ≤2mm
- Mild: PD ≤4mm, CAL ≤3mm
- Moderate: PD ≤6mm, CAL ≤5mm
- Severe: PD >6mm, CAL >5mm

## Security Notes

### API Key Security
- Your API key is stored locally in `gemini-handler.js`
- It's sent directly to Google's API (HTTPS)
- GitHub Pages cannot execute backend code to hide it
- This is acceptable for temporary/trial keys

### Data Privacy
- No data is stored on any server
- All calculations happen in your browser
- Exported results are saved to your device only
- PDF text is processed in-memory only

## Browser Compatibility

✅ Chrome/Chromium 60+
✅ Firefox 55+
✅ Safari 12+
✅ Edge 79+

## Troubleshooting

### PDF not extracting properly
- Ensure PDF is not image-scanned
- Try converting to searchable PDF first
- Use manual entry as fallback

### Calculations not updating
- Check that all required fields are filled
- Visit browser console (F12) for error messages
- Clear browser cache and reload

### API errors
- Verify API key is correct
- Check internet connection
- Try again after API quota resets

## Technical Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **PDF Processing**: PDF.js library
- **AI**: Google Gemini API (via REST)
- **Hosting**: GitHub Pages (static)
- **No Backend Required**: Everything runs in-browser

## Limitations & Future Improvements

### Current Limitations
- Requires free Gemini API key (quota limited)
- PDF extraction quality depends on report format
- Browser-only (no native mobile app)

### Future Roadmap
- Backend proxy for API key security
- Mobile app wrapper
- Multi-language support
- Database for storing results
- Export to PDF reports
- Comparative analysis over time

## License

MIT License - Feel free to modify and redistribute

## Support

For issues, questions, or feature requests:
1. Check the troubleshooting section above
2. Review error messages in browser console (F12)
3. Create an issue in the repository

---

**Last Updated**: June 2026
**Version**: 1.0.0
**Status**: Production Ready ✅
