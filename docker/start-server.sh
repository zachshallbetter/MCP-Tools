#!/bin/bash

echo "🚀 Starting MCP-Tools Platform..."

# Check if we're in the right directory
if [ ! -d "/app/src" ]; then
    echo "❌ Error: /app/src directory not found"
    exit 1
fi

# Install dependencies if needed
echo "📦 Installing dependencies..."
cd /app/src/http-server && npm install --silent
cd /app/src/mcp-server && npm install --silent

# Build MCP server if needed
if [ ! -f "/app/src/mcp-server/dist/mcp-server.js" ]; then
    echo "🔨 Building MCP server..."
    cd /app/src/mcp-server && npm run build
fi

# Start HTTP server
echo "🌐 Starting HTTP server..."
cd /app/src/http-server
node browser-connector-extended.js &

# Wait for HTTP server to start
echo "⏳ Waiting for HTTP server to start..."
sleep 5

# Check if HTTP server is running
if curl -f http://localhost:3025/.identity > /dev/null 2>&1; then
    echo "✅ HTTP server is running on port 3025"
else
    echo "❌ HTTP server failed to start"
    exit 1
fi

# Start MCP server
echo "🔌 Starting MCP server..."
cd /app/src/mcp-server
node dist/mcp-server.js

# Keep container running
wait
