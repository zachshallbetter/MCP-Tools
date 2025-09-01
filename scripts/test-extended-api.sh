#!/bin/bash

# Test script for the extended BrowserTools API
# This demonstrates the new features available for web development

BASE_URL="http://localhost:3025"
TEST_URL="https://localhost:3000"

echo "🧪 Testing Extended BrowserTools API"
echo "====================================="

# Test 1: Enhanced Screenshot with viewport
echo ""
echo "📸 Test 1: Enhanced Screenshot with Mobile Viewport"
curl -X POST "$BASE_URL/capture-screenshot" \
  -H "Content-Type: application/json" \
  -d "{
    \"url\": \"$TEST_URL\",
    \"customPath\": \"/tmp/mobile-screenshots\",
    \"viewport\": { \"width\": 375, \"height\": 667 },
    \"fullPage\": true
  }" | jq '.'

# Test 2: Performance Analysis
echo ""
echo "⚡ Test 2: Performance Analysis (Mobile)"
curl -X POST "$BASE_URL/analyze-performance" \
  -H "Content-Type: application/json" \
  -d "{
    \"url\": \"$TEST_URL\",
    \"device\": \"mobile\",
    \"network\": \"4g\"
  }" | jq '.'

# Test 3: Accessibility Testing
echo ""
echo "♿ Test 3: Accessibility Testing"
curl -X POST "$BASE_URL/test-accessibility" \
  -H "Content-Type: application/json" \
  -d "{
    \"url\": \"$TEST_URL\",
    \"includeWarnings\": true,
    \"includePasses\": false
  }" | jq '.'

# Test 4: SEO Analysis
echo ""
echo "🔍 Test 4: SEO Analysis"
curl -X POST "$BASE_URL/analyze-seo" \
  -H "Content-Type: application/json" \
  -d "{
    \"url\": \"$TEST_URL\",
    \"includeMeta\": true,
    \"includeStructured\": true
  }" | jq '.'

# Test 5: Responsive Testing
echo ""
echo "📱 Test 5: Responsive Testing"
curl -X POST "$BASE_URL/test-responsive" \
  -H "Content-Type: application/json" \
  -d "{
    \"url\": \"$TEST_URL\",
    \"breakpoints\": [
      { \"width\": 1920, \"height\": 1080, \"name\": \"desktop\" },
      { \"width\": 1024, \"height\": 768, \"name\": \"tablet\" },
      { \"width\": 375, \"height\": 667, \"name\": \"mobile\" }
    ],
    \"customPath\": \"/tmp/responsive-test\"
  }" | jq '.'

# Test 6: Element Interaction
echo ""
echo "🖱️ Test 6: Element Interaction (Get Text)"
curl -X POST "$BASE_URL/interact-element" \
  -H "Content-Type: application/json" \
  -d "{
    \"url\": \"$TEST_URL\",
    \"selector\": \"h1\",
    \"action\": \"getText\"
  }" | jq '.'

# Test 7: Network Monitoring
echo ""
echo "🌐 Test 7: Network Monitoring"
curl -X POST "$BASE_URL/monitor-network" \
  -H "Content-Type: application/json" \
  -d "{
    \"url\": \"$TEST_URL\",
    \"filter\": \"api\",
    \"includeHeaders\": false,
    \"includeBody\": false
  }" | jq '.'

# Test 8: Console Logs
echo ""
echo "📝 Test 8: Console Logs"
curl -X POST "$BASE_URL/get-console-logs" \
  -H "Content-Type: application/json" \
  -d "{
    \"url\": \"$TEST_URL\",
    \"level\": \"error\",
    \"includeTimestamp\": true
  }" | jq '.'

echo ""
echo "✅ Extended API Testing Complete!"
echo ""
echo "📚 Available Endpoints:"
curl -s "$BASE_URL/api" | jq '.endpoints'
