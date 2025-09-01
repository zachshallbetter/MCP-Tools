#!/bin/bash

# BrowserTools MCP Docker Test Script
# This script tests the Docker development environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Test 1: Check if Docker is running
print_status "Testing Docker environment..."

if ! docker info >/dev/null 2>&1; then
    print_error "Docker is not running or not accessible"
    exit 1
fi
print_success "Docker is running"

# Test 2: Check if container exists
if ! docker ps -a --format "table {{.Names}}" | grep -q "browser-tools-mcp-dev"; then
    print_error "Container browser-tools-mcp-dev not found"
    exit 1
fi
print_success "Container browser-tools-mcp-dev exists"

# Test 3: Check if container is running
if ! docker ps --format "table {{.Names}}" | grep -q "browser-tools-mcp-dev"; then
    print_warning "Container is not running, starting it..."
    ./docker-dev.sh start
fi
print_success "Container is running"

# Test 4: Test Node.js installation
print_status "Testing Node.js installation..."
NODE_VERSION=$(docker exec browser-tools-mcp-dev node --version 2>/dev/null || echo "FAILED")
if [[ "$NODE_VERSION" == "FAILED" ]]; then
    print_error "Node.js not working in container"
    exit 1
fi
print_success "Node.js version: $NODE_VERSION"

# Test 5: Test npm installation
print_status "Testing npm installation..."
NPM_VERSION=$(docker exec browser-tools-mcp-dev npm --version 2>/dev/null || echo "FAILED")
if [[ "$NPM_VERSION" == "FAILED" ]]; then
    print_error "npm not working in container"
    exit 1
fi
print_success "npm version: $NPM_VERSION"

# Test 6: Test Chrome/Chromium installation
print_status "Testing Chrome/Chromium installation..."
CHROME_VERSION=$(docker exec browser-tools-mcp-dev google-chrome --version 2>/dev/null || echo "FAILED")
if [[ "$CHROME_VERSION" == "FAILED" ]]; then
    print_error "Chrome/Chromium not working in container"
    exit 1
fi
print_success "Chrome/Chromium version: $CHROME_VERSION"

# Test 7: Test project structure
print_status "Testing project structure..."
if docker exec browser-tools-mcp-dev test -d "/app/browser-tools-mcp"; then
    print_success "browser-tools-mcp directory exists"
else
    print_error "browser-tools-mcp directory missing"
    exit 1
fi

if docker exec browser-tools-mcp-dev test -d "/app/browser-tools-server"; then
    print_success "browser-tools-server directory exists"
else
    print_error "browser-tools-server directory missing"
    exit 1
fi

if docker exec browser-tools-mcp-dev test -d "/app/chrome-extension"; then
    print_success "chrome-extension directory exists"
else
    print_error "chrome-extension directory missing"
    exit 1
fi

# Test 8: Test npm dependencies
print_status "Testing npm dependencies..."
if docker exec browser-tools-mcp-dev test -d "/app/browser-tools-mcp/node_modules"; then
    print_success "browser-tools-mcp dependencies installed"
else
    print_error "browser-tools-mcp dependencies missing"
    exit 1
fi

if docker exec browser-tools-mcp-dev test -d "/app/browser-tools-server/node_modules"; then
    print_success "browser-tools-server dependencies installed"
else
    print_error "browser-tools-server dependencies missing"
    exit 1
fi

# Test 9: Test TypeScript compilation
print_status "Testing TypeScript compilation..."
if docker exec browser-tools-mcp-dev test -f "/app/browser-tools-mcp/dist/mcp-server.js"; then
    print_success "browser-tools-mcp compiled successfully"
else
    print_error "browser-tools-mcp compilation failed"
    exit 1
fi

if docker exec browser-tools-mcp-dev test -f "/app/browser-tools-server/dist/browser-connector.js"; then
    print_success "browser-tools-server compiled successfully"
else
    print_error "browser-tools-server compilation failed"
    exit 1
fi

# Test 10: Test port availability
print_status "Testing port availability..."
if docker exec browser-tools-mcp-dev netstat -tuln | grep -q ":3025"; then
    print_success "Port 3025 is available"
else
    print_warning "Port 3025 not in use (this is normal if server not started)"
fi

print_success "All Docker environment tests passed!"
print_status "Docker development environment is ready for use."
print_status ""
print_status "Next steps:"
print_status "1. Start the browser-tools-server: ./docker-dev.sh shell"
print_status "2. Inside container: cd /app/browser-tools-server && npm start"
print_status "3. In another terminal: ./docker-dev.sh shell"
print_status "4. Inside container: cd /app/browser-tools-mcp && npm start"
