#!/bin/bash
# Quick Setup Script - Run this to get started quickly

echo "================================"
echo "PeriInflam Calculator Setup"
echo "================================"
echo ""

# Check if files exist
if [ ! -f "index.html" ]; then
    echo "❌ Error: index.html not found. Please ensure you're in the correct directory."
    exit 1
fi

echo "✅ All project files found!"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1️⃣  ADD GEMINI API KEY:"
echo "   - Open gemini-handler.js in a text editor"
echo "   - Find: API_KEY: 'YOUR_GEMINI_API_KEY_HERE',"
echo "   - Replace with your key from: https://makersuite.google.com/app/apikey"
echo ""
echo "2️⃣  TEST LOCALLY (Optional):"
echo "   - Option A: Use VS Code Live Server"
echo "     • Install 'Live Server' extension"
echo "     • Right-click index.html → 'Open with Live Server'"
echo ""
echo "   - Option B: Use Python"
echo "     • Run: python -m http.server 8000"
echo "     • Visit: http://localhost:8000"
echo ""
echo "3️⃣  DEPLOY TO GITHUB PAGES:"
echo "   - Create GitHub repo: periinflam-calculator"
echo "   - Push all files to main branch"
echo "   - Enable Pages in Settings → Pages"
echo "   - Select main branch as source"
echo "   - Your app will be live!"
echo ""
echo "================================"
echo "Setup complete! 🎉"
echo "================================"
