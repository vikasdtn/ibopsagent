#!/bin/bash

echo "🚀 Starting 5G RAN Simulator Web UI..."

# Check if npm dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Check if Python dependencies are installed
echo "🐍 Checking Python dependencies..."
pip install -r requirements.txt

echo "🔧 Starting backend server..."
python server.py &
BACKEND_PID=$!

echo "⚛️ Starting frontend development server..."
npm run dev &
FRONTEND_PID=$!

echo "✅ Servers started!"
echo "📊 Dashboard: http://localhost:3000"
echo "🔌 API: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for Ctrl+C
trap "echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
