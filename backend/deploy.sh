#!/bin/bash

# LifeVault Backend Deployment Script
# This script builds and prepares the backend for production deployment

set -e  # Exit on any error

echo "🚀 Starting LifeVault Backend Deployment..."
echo ""

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ Error: .env.production file not found!"
    echo "Please create .env.production with your production configuration."
    exit 1
fi

# Validate critical environment variables
echo "🔍 Validating environment configuration..."
source .env.production

if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" = "REPLACE-WITH-SECURE-RANDOM-STRING-MIN-256-BITS" ]; then
    echo "❌ Error: JWT_SECRET not configured in .env.production"
    exit 1
fi

if [ -z "$SUPABASE_URL" ] || [ "$SUPABASE_URL" = "https://your-project-id.supabase.co" ]; then
    echo "❌ Error: SUPABASE_URL not configured in .env.production"
    exit 1
fi

if [ -z "$SUPABASE_SERVICE_KEY" ] || [ "$SUPABASE_SERVICE_KEY" = "your-production-service-role-key-here" ]; then
    echo "❌ Error: SUPABASE_SERVICE_KEY not configured in .env.production"
    exit 1
fi

if [ -z "$FRONTEND_URL" ] || [ "$FRONTEND_URL" = "https://lifevault.com" ]; then
    echo "⚠️  Warning: FRONTEND_URL appears to be using default value"
    echo "Please ensure this matches your actual frontend domain"
fi

echo "✅ Environment validation passed"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false

# Run tests
echo "🧪 Running tests..."
npm test || {
    echo "⚠️  Warning: Tests failed. Please fix before deploying."
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
}

# Build TypeScript
echo "🏗️  Building TypeScript..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Error: Build failed - dist directory not found!"
    exit 1
fi

# Copy .env.production to dist directory
echo "📋 Copying production environment file..."
cp .env.production dist/.env

echo ""
echo "✅ Backend build completed successfully!"
echo "📁 Build output: ./dist"
echo ""
echo "Next steps:"
echo "1. Deploy the ./dist directory to your hosting provider (Railway, Render, AWS, etc.)"
echo "2. Ensure Node.js runtime is available (v18 or higher)"
echo "3. Set environment variables in your hosting platform"
echo "4. Configure process manager (PM2 recommended)"
echo "5. Set up HTTPS/SSL certificate"
echo "6. Configure health check endpoint: GET /health"
echo "7. Test the deployed API"
echo ""
