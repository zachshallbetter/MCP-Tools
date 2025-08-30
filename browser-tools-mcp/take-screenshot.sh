#!/bin/bash

# Simple script to take screenshots using the Chromium-based browser-tools-server
# Usage: ./take-screenshot.sh <url> [custom-path]

URL=${1:-"https://example.com"}
CUSTOM_PATH=${2:-"/tmp/screenshots"}

echo "📸 Taking screenshot of: $URL"
echo "📁 Saving to: $CUSTOM_PATH"

# Create directory if it doesn't exist
mkdir -p "$CUSTOM_PATH"

# Take screenshot using Chromium server
curl -X POST http://localhost:3025/capture-screenshot \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"$URL\", \"customPath\": \"$CUSTOM_PATH\"}" \
  | jq '.'

echo ""
echo "✅ Screenshot completed!"
