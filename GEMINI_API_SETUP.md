# Gemini API Configuration & Troubleshooting

## 🔑 Getting Your Gemini API Key

### Step-by-Step:

1. **Visit Google AI Studio**
   - Go to: https://makersuite.google.com/app/apikey
   - Sign in with your Google account (create one if needed)

2. **Create a New API Key**
   - Click "Create API Key" button
   - Select or create a Google Cloud project
   - API key will be generated automatically

3. **Copy Your Key**
   - Click "Copy" button next to your key
   - Save it somewhere safe
   - Your key should look like: `sk-proj-abc123xyz789...`

### ⚠️ IMPORTANT: Keep Your Key Safe
- Don't share this key publicly (except for trial keys)
- If exposed, regenerate it in Google Cloud Console
- The key in this app is visible in the code (because it's hosted on GitHub Pages)
- Use a trial/temporary key while testing

---

## 📝 Adding Your Key to the App

### In Visual Studio Code:

1. Open the project folder in VS Code
2. Open `gemini-handler.js` (Ctrl+O or File → Open File)
3. Go to line 11 (Ctrl+G, type 11, Enter)
4. Find:
   ```javascript
   API_KEY: 'YOUR_GEMINI_API_KEY_HERE',
   ```
5. Replace entirely with:
   ```javascript
   API_KEY: 'sk-proj-abc123xyz789def...',
   ```
   (Keep the quotes and trailing comma!)

6. Save file (Ctrl+S)

### In Notepad/Text Editor:

1. Right-click `gemini-handler.js`
2. Open with → Notepad (or your preferred editor)
3. Use Find & Replace (Ctrl+H):
   - Find: `YOUR_GEMINI_API_KEY_HERE`
   - Replace with: Your actual key (without `sk-proj-` quotes)
4. Save (Ctrl+S)

### Example of Correct Formatting:

**WRONG:**
```javascript
API_KEY: sk-proj-abc123xyz,  // Missing quotes!
```

**RIGHT:**
```javascript
API_KEY: 'sk-proj-abc123xyz',  // Correct!
```

---

## 📊 Gemini API Quotas & Limits

### Free Tier:
- **Requests**: 60 per minute
- **Daily**: 1,500 requests per day
- **Cost**: FREE
- **Duration**: Free trial for 2 months

### What Happens When You Hit Quota?
- ❌ PDF extraction stops working
- ✅ Manual entry still works perfectly
- 📅 Quota resets daily at UTC midnight
- 💳 Paid plan available if needed

### Quota Resets

Free tier quotas reset daily. If you hit the limit:
1. Wait until next day (UTC midnight)
2. Try again - should work!
3. If stuck, check your free trial expiration date

---

## 🚨 Error Messages & Solutions

### Error: "AI is temporarily unavailable. The free trial quota has been exhausted."

**Cause**: You've made 1,500+ requests today or exceeded 60 req/min

**Solutions**:
1. **Wait**: Quota resets tomorrow at UTC midnight
2. **Manual Entry**: Still works! Just enter values manually
3. **Upgrade**: (Optional) Pay for Gemini API to get higher limits
4. **Use Backup Key**: Generate another free trial key and use that

**How to generate backup key**:
```javascript
// Multiple keys in the code:
const API_KEYS = [
    'sk-proj-key1...',
    'sk-proj-key2...',
    'sk-proj-key3...'
];

// Rotate between them to extend quota
```

### Error: "Invalid API key"

**Causes**: 
- Typo in the key
- Extra spaces or quotes
- Key has expired
- Wrong key format

**Solution**:
1. Copy your key again from https://makersuite.google.com/app/apikey
2. Double-check for spaces or special characters
3. Replace old key in gemini-handler.js

### Error: "CORS Error" or "Mixed Content"

**Cause**: Security restriction

**Solution**: This shouldn't happen if using GitHub Pages HTTPS. If it does:
1. Clear browser cache (Ctrl+Shift+Del)
2. Hard refresh (Ctrl+Shift+R)
3. Try in incognito mode

---

## ✅ Testing Your API Key

### Method 1: Browser Console

1. Open your app in browser
2. Press F12 (Open Developer Tools)
3. Go to Console tab
4. Type:
   ```javascript
   GeminiHandler.isConfigured()
   ```
5. Press Enter
6. Should show: `true` ✅ or `false` ❌

### Method 2: Try PDF Upload

1. Upload a sample blood report PDF
2. Click "Extract from PDF"
3. If it extracts values → Key is working! ✅

### Method 3: Check API Status

Go to https://status.cloud.google.com/ to see if Google's services are operational.

---

## 💰 Costs & Pricing

### Free Trial (2 months):
- $0
- Up to 1,500 requests/day
- After 2 months: $0.075 per 1,000 requests

### Cost Estimate:
- Small practice (10 PDFs/day): ~$0.23/month
- Medium practice (100 PDFs/day): ~$2.31/month
- Large practice (1,000 PDFs/day): ~$23/month

### To Enable Paid Plan:
1. Add credit card to Google Cloud Console
2. Billing will start after free trial ends

---

## 🔄 Rotating API Keys (Advanced)

If you want unlimited quota temporarily:

1. Generate multiple API keys (max 3 free trial keys)
2. Rotate between them:

```javascript
const API_KEYS = [
    'sk-proj-key1-abc123xyz...',
    'sk-proj-key2-def456uvw...',
    'sk-proj-key3-ghi789rst...'
];

let currentKeyIndex = 0;

function rotateKey() {
    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
    GeminiHandler.API_KEY = API_KEYS[currentKeyIndex];
}
```

Then call `rotateKey()` before each API call if you get quota exceeded error.

---

## 🛡️ Security Best Practices

### For Production:

1. **Never hardcode API keys** - use backend proxy instead
2. **Use domain restrictions** - allow only your domain
3. **Monitor usage** - check Google Cloud Console regularly
4. **Set quotas** - limit requests per day

### How to Add Domain Restriction:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. **APIs & Services** → **Credentials**
4. Click your API key
5. Under "Application restrictions":
   - Select "HTTP referrers (web sites)"
   - Enter: `https://yourusername.github.io/*`
   - Save

Now your key ONLY works from your GitHub Pages URL!

---

## 📚 Useful Links

- [Get API Key](https://makersuite.google.com/app/apikey)
- [Google Cloud Console](https://console.cloud.google.com)
- [Gemini API Docs](https://ai.google.dev/docs)
- [Pricing](https://ai.google.dev/pricing)
- [API Status](https://status.cloud.google.com/)

---

## 🤔 FAQ

**Q: Can I use someone else's API key?**
A: Not recommended. Use your own key. Free trials are easy to get.

**Q: What if I delete the key?**
A: Generate a new one and update gemini-handler.js

**Q: Can I run this without an API key?**
A: Yes! Just enter values manually in the form.

**Q: How secret is the API key on GitHub Pages?**
A: It's visible in the code, but:
- Only works on your GitHub Pages domain
- Free trial key has limited quota anyway
- Delete it afterward = no risk

**Q: Can I use this offline?**
A: Yes! PDF extraction works offline. Gemini API requires internet.

---

**Need Help?**
- Check browser console (F12) for error messages
- Visit: https://ai.google.dev/docs
- Regenerate your API key if unsure

---

**Last Updated**: June 2026
