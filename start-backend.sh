#!/bin/bash

# Attribution Guard Scanner Backend Startup Script

echo "🚀 Starting Attribution Guard Scanner Backend..."

# Check if we're in the workspace directory
if [ ! -f "cookie_stuffing_scanner.py" ]; then
    echo "❌ Error: Please run this script from the workspace directory containing cookie_stuffing_scanner.py"
    exit 1
fi

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    echo "🐍 Activating Python virtual environment..."
    source venv/bin/activate
else
    echo "⚠️  No virtual environment found. Creating one..."
    python3 -m venv venv
    source venv/bin/activate
    echo "📦 Installing Playwright..."
    pip install playwright
    playwright install chromium
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if backend directory exists
if [ ! -d "backend" ]; then
    echo "❌ Error: Backend directory not found."
    exit 1
fi

# Install Node.js dependencies if needed
cd backend
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

# Create scans directory
mkdir -p ../scans

echo ""
echo "✅ Setup complete!"
echo "🔗 API will be available at: http://localhost:3000"
echo "📄 API documentation: http://localhost:3000"
echo "💚 Health check: http://localhost:3000/health"
echo ""
echo "📱 Example usage:"
echo "curl -X POST -F \"file=@urls.txt\" http://localhost:3000/api/scan"
echo ""
echo "🏃 Starting server..."
echo ""

# Start the server
npm start