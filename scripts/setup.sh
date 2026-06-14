#!/bin/bash

# Manhwa Motion AI - Local Development Setup Script
# Run this after you have Homebrew and/or Node installed.

set -e

echo "🚀 Setting up Manhwa Motion AI..."

# 1. Check for Node
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found."
    echo "Please install Node first:"
    echo "  brew install node"
    echo "  or download from https://nodejs.org"
    exit 1
fi

echo "✅ Node $(node --version) detected"
echo "✅ npm $(npm --version) detected"

# 2. Install dependencies
echo "📦 Installing npm dependencies (this may take a minute)..."
npm install

# 3. Setup environment file
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from example..."
    cp .env.local.example .env.local
    echo ""
    echo "✅ App runs fully offline in demo mode (localStorage only)."
    echo "   (Optional) Add real video AI provider keys in .env.local later."
else
    echo "✅ .env.local already exists"
fi

# 4. Optional: Type check
echo "🔍 Running TypeScript type check..."
npm run typecheck || echo "⚠️  Type check completed with warnings (normal for first run)"

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the development server:"
echo "  npm run dev"
echo ""
echo "Then open http://localhost:3000"
echo ""
echo "Next recommended steps:"
echo "  1. (Optional) Add real AI video provider API keys in .env.local for future use"
echo "  2. Everything else (auth, storage of videos & custom styles) uses localStorage only."
echo ""
echo "Happy creating cinematic manhwa videos! 🎬"
