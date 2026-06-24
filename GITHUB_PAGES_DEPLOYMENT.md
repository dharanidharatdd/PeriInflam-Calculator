# GitHub Pages Deployment Guide

## ⚡ Quick Deploy (5 minutes)

### Step 1: Create GitHub Repository

1. Go to [GitHub.com](https://github.com)
2. Click **New** (green button, top left)
3. Repository name: `periinflam-calculator`
4. Add description: "Blood inflammatory indices and periodontal assessment calculator"
5. Make it **Public** (required for free Pages)
6. Click **Create repository**

### Step 2: Add Your API Key

**Before uploading:**
1. Open `gemini-handler.js` in your text editor
2. Find line 11: `API_KEY: 'YOUR_GEMINI_API_KEY_HERE',`
3. Replace with your actual key:
   ```javascript
   API_KEY: 'sk-proj-abc123xyz...',
   ```

### Step 3: Upload Files to GitHub

#### Option A: Using Git (Recommended)

```bash
# Open Command Prompt/PowerShell in the project folder

git init
git add .
git commit -m "Initial commit: PeriInflam Calculator"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/periinflam-calculator.git
git push -u origin main
```

#### Option B: Using GitHub Web Interface

1. Go to your new repository
2. Click **Add file** → **Upload files**
3. Drag and drop all files (except `.git` folders)
4. Commit changes

### Step 4: Enable GitHub Pages

1. In repository, go to **Settings**
2. Scroll to **Pages** section (left sidebar)
3. Under "Build and deployment":
   - Source: Select **Deploy from a branch**
   - Branch: Select **main** and **/root**
4. Click **Save**
5. Wait 1-2 minutes for build to complete

### Step 5: Access Your App

Your app will be live at:
```
https://YOUR_USERNAME.github.io/periinflam-calculator/
```

The green checkmark in Pages section means it's deployed! ✅

---

## 🛡️ API Key Security on GitHub Pages

### Why It's Safe to Share Your Key:

1. **Domain Restriction**: You can configure API key to only work from your GitHub Pages domain
2. **Free Trial**: Since you're using a free trial key, there's minimal financial risk
3. **Browser-Only**: No server-side code to intercept requests
4. **Deleted After Testing**: You can delete the key after exploring the app

### How to Add Domain Restriction (Optional):

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Click on your API key
5. Under **Application restrictions**, select **HTTP referrers**
6. Add: `https://yourusername.github.io/*`
7. Save

---

## 🚀 Continuous Deployment

Every time you push to the `main` branch, GitHub Pages automatically updates!

```bash
# After making changes locally
git add .
git commit -m "Update: Fix calculation formula"
git push origin main
```

Your changes will be live in 1-2 minutes.

---

## 🐛 Why Your App Might Not Show Up

| Issue | Fix |
|-------|-----|
| 404 Error | Wait 2-3 minutes, then refresh (F5) |
| Blank page | Check browser console (F12) for JS errors |
| "Cannot find module" | Ensure all .js files are uploaded |
| PDF upload not working | Check file sizes aren't too large |

---

## 📊 Monitor Your Deployment

https://github.com/YOUR_USERNAME/periinflam-calculator/deployments

---

## 🔄 To Make Updates

1. Edit files locally
2. `git add .`
3. `git commit -m "your message"`
4. `git push origin main`
5. Wait 1-2 minutes
6. Refresh browser

---

## ⚙️ Environment Variables (Advanced)

If you want to securely store your API key:

1. Remove the hardcoded key from gemini-handler.js
2. Instead, store it in browser localStorage
3. Prompt user to enter their own API key on first load

Example implementation:
```javascript
// On page load, check if API key exists
const savedKey = localStorage.getItem('geminiKey');
if (!savedKey) {
    const key = prompt('Enter your Gemini API key:');
    if (key) localStorage.setItem('geminiKey', key);
}
GeminiHandler.setApiKey(localStorage.getItem('geminiKey'));
```

---

## 📚 Useful Links

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Google Gemini API](https://makersuite.google.com/app/apikey)
- [PDF.js Documentation](https://mozilla.github.io/pdf.js/)

---

## ✅ Checklist

- [ ] GitHub account created
- [ ] Repository created and named `periinflam-calculator`
- [ ] Gemini API key added to `gemini-handler.js`
- [ ] All files uploaded to GitHub
- [ ] GitHub Pages enabled in Settings
- [ ] Domain restriction added to API key (optional)
- [ ] App is live and accessible
- [ ] Tested with sample PDF
- [ ] Calculations working correctly

---

**Your app is now live on GitHub Pages! 🎉**

Total time: ~10 minutes
Cost: FREE
Maintenance: Minimal (just update files as needed)
