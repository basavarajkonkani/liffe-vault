#!/bin/bash

# LifeVault Frontend Deployment Script
# This script builds and prepares the frontend for production deployment

set -e  # Exit on any error

echo "🚀 Starting LifeVault Frontend Deployment..."
echo ""

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ Error: .env.production file not found!"
    echo "Please create .env.production with your production configuration."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false

# Run linting
echo "🔍 Running linter..."
npm run lint || {
    echo "⚠️  Warning: Linting issues found. Please fix before deploying."
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
}

# Build for production
echo "🏗️  Building production bundle..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Error: Build failed - dist directory not found!"
    exit 1
fi

echo ""
echo "✅ Frontend build completed successfully!"
echo "📁 Build output: ./dist"
echo ""
echo "Next steps:"
echo "1. Deploy the ./dist directory to your hosting provider (Vercel, Netlify, etc.)"
echo "2. Ensure environment variables are set in your hosting platform"
echo "3. Configure custom domain and SSL certificate"
echo "4. Test the deployed application"
echo ""
