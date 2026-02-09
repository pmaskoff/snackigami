#!/bin/bash

# Exit on error
set -e

echo "📱 Starting Mobile Build..."

# 1. Set Environment Variables
export MOBILE_BUILD=true
export NEXT_PUBLIC_API_URL="https://snackigami.com"

# 2. Hide API Routes (Next.js static export fails if dynamic API routes exist)
if [ -d "src/app/api" ]; then
  echo "🙈 Hiding API routes..."
  mv src/app/api src/api_temp
fi

# Function to clean up on exit (success or failure)
cleanup() {
  if [ -d "src/api_temp" ]; then
    echo "🙈 Restoring API routes..."
    mv src/api_temp src/app/api
  fi
}
trap cleanup EXIT

# 3. Build Next.js
echo "🏗️ Building Next.js for Static Export..."
npm run build

# 4. Sync Capacitor
echo "⚡ Syncing Capacitor..."
npx cap sync

echo "✅ Mobile Build Complete!"
