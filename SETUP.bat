@echo off
REM Quick Setup Script for Windows - Run this to get started quickly

color 0A
cls

echo.
echo ================================
echo PeriInflam Calculator Setup
echo ================================
echo.

REM Check if files exist
if not exist "index.html" (
    echo ❌ Error: index.html not found. Please ensure you're in the correct directory.
    pause
    exit /b 1
)

echo ✅ All project files found!
echo.
echo 📋 Next Steps:
echo.
echo 1️⃣  ADD GEMINI API KEY:
echo    - Open gemini-handler.js in Notepad or VS Code
echo    - Find the line: API_KEY: 'YOUR_GEMINI_API_KEY_HERE',
echo    - Replace with your key from: https://makersuite.google.com/app/apikey
echo.
echo 2️⃣  TEST LOCALLY:
echo    Option A: Use VS Code Live Server
echo    - Install 'Live Server' extension (Search extensions)
echo    - Right-click index.html and select 'Open with Live Server'
echo.
echo    Option B: Use Python
echo    - Open Command Prompt in this folder
echo    - Run: python -m http.server 8000
echo    - Visit: http://localhost:8000
echo.
echo    Option C: Use Node.js
echo    - Install globally: npm install -g http-server
echo    - Run: http-server
echo    - Visit: http://localhost:8080
echo.
echo 3️⃣  DEPLOY TO GITHUB PAGES:
echo    - Create new repo on GitHub: periinflam-calculator
echo    - Add all files and commit
echo    - Go to Settings ^> Pages
echo    - Select 'main' branch as source
echo    - Your app will be live at: https://yourusername.github.io/periinflam-calculator/
echo.
echo How to check your Gemini API key:
echo   1. Visit: https://makersuite.google.com/app/apikey
echo   2. Log in with Google account
echo   3. Click "Create API Key" or copy existing key
echo   4. Paste into gemini-handler.js
echo.
echo ================================
echo Setup complete! 🎉
echo ================================
echo.
pause
