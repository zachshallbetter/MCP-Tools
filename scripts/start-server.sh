#!/bin/bash

echo "Starting BrowserTools MCP Development Environment..."
echo "Available services:"
echo "1. Browser Tools Server (port 3025)"
echo "2. Browser Tools MCP Server"
echo ""

echo "Starting Extended BrowserTools Server automatically..."
echo "📸 Enhanced screenshots and web development tools available"
echo "🌐 Server will run on port 3025"
echo "📚 API docs: http://localhost:3025/api"
echo ""

# Start the extended browser-tools server in the background
cd /app/browser-tools-server && ENABLE_HTTPS=true node browser-connector-extended.js &
SERVER_PID=$!

echo "Extended Browser Tools Server started with PID: $SERVER_PID"
echo ""

echo "To start the browser-tools-mcp server, run:"
echo "cd /app/browser-tools-mcp && npm start"
echo ""

echo "To build the projects, run:"
echo "cd /app/browser-tools-server && npm run build"
echo "cd /app/browser-tools-mcp && npm run build"
echo ""

echo "Development environment ready!"
echo "Extended Browser Tools Server is running in the background."
echo "🚀 Test the extended API: ./test-extended-api.sh"

# Keep the container running
wait $SERVER_PID
