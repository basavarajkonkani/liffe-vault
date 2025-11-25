#!/bin/bash

# LifeVault E2E Test Runner
# This script helps run E2E tests with proper setup

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "======================================"
echo "  LifeVault E2E Test Runner"
echo "======================================"
echo ""

# Check if backend is running
echo -n "Checking backend (port 3000)... "
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Running${NC}"
else
    echo -e "${RED}✗ Not running${NC}"
    echo ""
    echo -e "${YELLOW}Please start the backend:${NC}"
    echo "  cd backend && npm run dev"
    echo ""
    exit 1
fi

# Check if frontend is running
echo -n "Checking frontend (port 5173)... "
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Running${NC}"
else
    echo -e "${RED}✗ Not running${NC}"
    echo ""
    echo -e "${YELLOW}Please start the frontend:${NC}"
    echo "  cd frontend && npm run dev"
    echo ""
    exit 1
fi

echo ""
echo -e "${GREEN}All services are running!${NC}"
echo ""

# Check if Playwright is installed
if ! command -v npx &> /dev/null; then
    echo -e "${RED}Error: npx not found. Please install Node.js${NC}"
    exit 1
fi

# Check if Playwright browsers are installed
if [ ! -d "$HOME/Library/Caches/ms-playwright" ] && [ ! -d "$HOME/.cache/ms-playwright" ]; then
    echo -e "${YELLOW}Playwright browsers not found. Installing...${NC}"
    npx playwright install
    echo ""
fi

# Parse command line arguments
MODE=${1:-"headless"}

case $MODE in
    "headed")
        echo "Running tests in headed mode (visible browser)..."
        npm run test:e2e:headed
        ;;
    "ui")
        echo "Running tests in UI mode (interactive)..."
        npm run test:e2e:ui
        ;;
    "debug")
        echo "Running tests in debug mode..."
        npm run test:e2e:debug
        ;;
    "report")
        echo "Opening test report..."
        npm run test:e2e:report
        ;;
    *)
        echo "Running tests in headless mode..."
        npm run test:e2e
        ;;
esac

EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✓ Tests completed successfully!${NC}"
    echo ""
    echo "View the report:"
    echo "  npm run test:e2e:report"
else
    echo -e "${RED}✗ Tests failed!${NC}"
    echo ""
    echo "View the report for details:"
    echo "  npm run test:e2e:report"
    echo ""
    echo "Run in debug mode:"
    echo "  ./run-e2e-tests.sh debug"
fi

echo ""

exit $EXIT_CODE
