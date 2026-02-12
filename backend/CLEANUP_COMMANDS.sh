#!/bin/bash
# Cleanup Script - Run on server
# This script removes deployment docs and verifies MongoDB URI

echo "🧹 Starting Cleanup Process..."
echo ""

cd /root/learning || cd ~/learning || exit 1

echo "📋 Step 1: Listing .md files..."
find . -name "*.md" -type f | grep -v node_modules | sort

echo ""
echo "🗑️  Step 2: Removing deployment documentation files..."
rm -f DEPLOYMENT_*.md FIX_*.md CREATE_*.md NEXT_STEPS_*.md
rm -f QUICK_*.md VERIFY_*.md EASY_*.md SKIP_*.md
rm -f COMPLETE_*.md FRESH_START.md CLEANUP_*.md
rm -f *_DEPLOYMENT*.md *_FIX*.md HOW_TO_*.md
rm -f COPY_PASTE*.md RUN_ON_*.md UPDATE_*.md
rm -f SIMPLE_*.md PRODUCTION_*.md INTERACTIVE_*.md
rm -f *.txt

echo "✅ Deployment docs removed"
echo ""

echo "📋 Step 3: Remaining .md files:"
find . -name "*.md" -type f | grep -v node_modules | sort

echo ""
echo "🔍 Step 4: Verifying MongoDB URI configuration..."
cd backend
echo "Current MongoDB URI:"
cat .env.production | grep MONGODB_URI || echo "⚠️  MONGODB_URI not found in .env.production"

echo ""
echo "Checking for hardcoded MongoDB URIs in source code..."
if grep -r "mongodb://" src/ 2>/dev/null | grep -v node_modules; then
  echo "⚠️  Found hardcoded MongoDB URIs in source code!"
else
  echo "✅ No hardcoded MongoDB URIs found"
fi

if grep -r "mongodb+srv://" src/ 2>/dev/null | grep -v node_modules; then
  echo "⚠️  Found hardcoded MongoDB URIs in source code!"
else
  echo "✅ No hardcoded MongoDB URIs found"
fi

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Run: node clear-old-data.js (to clear database)"
echo "   2. Restart: pm2 restart all"
echo "   3. Test login with fresh database"

