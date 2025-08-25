#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    if command_exists lsof; then
        lsof -ti:$1 >/dev/null 2>&1
    elif command_exists netstat; then
        netstat -an | grep ":$1 " >/dev/null 2>&1
    else
        # Fallback: try to connect to the port
        (echo >/dev/tcp/localhost/$1) >/dev/null 2>&1
    fi
}

# Function to kill processes on a port
kill_port() {
    local port=$1
    print_status "Checking for processes on port $port..."
    
    if port_in_use $port; then
        print_warning "Port $port is in use. Attempting to free it..."
        
        if command_exists lsof; then
            lsof -ti:$port | xargs kill -9 2>/dev/null || true
        elif command_exists fuser; then
            fuser -k $port/tcp 2>/dev/null || true
        fi
        
        sleep 2
        
        if port_in_use $port; then
            print_error "Could not free port $port. Please manually kill the process using this port."
            return 1
        else
            print_status "Port $port is now available."
        fi
    else
        print_status "Port $port is available."
    fi
    return 0
}

# Function to cleanup background processes on exit
cleanup() {
    print_status "Shutting down development servers..."
    
    # Kill all background jobs
    jobs -p | xargs -r kill -TERM 2>/dev/null || true
    
    # Wait a moment for graceful shutdown
    sleep 2
    
    # Force kill if still running
    jobs -p | xargs -r kill -KILL 2>/dev/null || true
    
    print_status "Development servers stopped."
    exit 0
}

# Set up trap to cleanup on script exit
trap cleanup SIGINT SIGTERM EXIT

# Main script
print_header "React Slack Clone - Development Server Launcher"

# Check if we're in the right directory
if [[ ! -d "frontend" || ! -d "backend" ]]; then
    print_error "This script must be run from the New directory containing both frontend and backend folders."
    exit 1
fi

# Check for required commands
print_status "Checking for required dependencies..."

if ! command_exists npm; then
    print_error "npm is not installed. Please install Node.js and npm first."
    exit 1
fi

if ! command_exists node; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if MongoDB is running
print_status "Checking MongoDB connection..."
if ! port_in_use 27050; then
    print_warning "MongoDB doesn't appear to be running on port 27050."
    print_status "Starting MongoDB using Docker Compose..."
    
    if command_exists docker-compose; then
        docker-compose -f docker-compose-mongodb.yml up -d
    elif command_exists docker; then
        docker compose -f docker-compose-mongodb.yml up -d
    else
        print_error "Docker is not available. Please start MongoDB manually on port 27050."
        exit 1
    fi
    
    print_status "Waiting for MongoDB to start..."
    sleep 5
fi

# Free up ports if they're in use
kill_port 3001 || exit 1  # Backend port
kill_port 5173 || exit 1  # Frontend port (default)
kill_port 5174 || exit 1  # Frontend port (alternative)

# Install dependencies if node_modules don't exist
if [[ ! -d "backend/node_modules" ]]; then
    print_status "Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

if [[ ! -d "frontend/node_modules" ]]; then
    print_status "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

print_header "Starting Development Servers"

# Start backend server
print_status "Starting backend server on http://localhost:3001"
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend server
print_status "Starting frontend server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait for servers to start
sleep 3

print_header "Development Servers Status"
print_status "Backend: http://localhost:3001"
print_status "Frontend: http://localhost:5173 (or next available port)"
print_status "MongoDB: mongodb://localhost:27050"
print_status ""
print_status "Press Ctrl+C to stop all servers"
print_status ""
print_status "🚀 Your React Slack Clone is ready!"

# Keep the script running and wait for user to stop
wait
