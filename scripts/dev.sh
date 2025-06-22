#!/bin/bash

# Development script for Qalam project
# This script helps you start both backend and frontend in development mode

echo "🚀 Starting Qalam development environment..."

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if Node.js is installed
if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Function to start backend
start_backend() {
    echo "🔧 Starting backend..."
    cd qalam-backend
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing backend dependencies..."
        npm install
    fi
    npm run start:dev &
    BACKEND_PID=$!
    cd ..
    echo "✅ Backend started with PID: $BACKEND_PID"
}

# Function to start frontend
start_frontend() {
    echo "🎨 Starting frontend..."
    cd qalamFrontend
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing frontend dependencies..."
        npm install
    fi
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    echo "✅ Frontend started with PID: $FRONTEND_PID"
}

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down development environment..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo "✅ Backend stopped"
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo "✅ Frontend stopped"
    fi
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start both services
start_backend
sleep 3  # Give backend time to start
start_frontend

echo ""
echo "🎉 Development environment is ready!"
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend: http://localhost:3000"
echo "📊 Backend Health: http://localhost:3000/health"
echo "📚 API Docs: http://localhost:3000/api"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user to stop
wait 