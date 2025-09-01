#!/usr/bin/env node

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3025';

async function testEndpoint(endpoint, data, description) {
  try {
    console.log(`\n🧪 Testing: ${description}`);
    console.log(`📍 Endpoint: ${endpoint}`);
    
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Success: ${description}`);
      console.log(`📊 Score: ${result.score || 'N/A'}`);
      console.log(`⏱️  Timestamp: ${result.timestamp}`);
    } else {
      console.log(`❌ Failed: ${description}`);
      console.log(`🔍 Error: ${result.error}`);
    }
    
    return result;
  } catch (error) {
    console.log(`💥 Error: ${description}`);
    console.log(`🔍 Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Extended BrowserTools API - Feature Test Suite');
  console.log('=' .repeat(60));

  // Test URL (using a reliable test site)
  const testUrl = 'https://httpbin.org/html';

  // 1. Test basic screenshot functionality
  await testEndpoint('/capture-screenshot', {
    url: testUrl,
    customPath: '/tmp/test-screenshots'
  }, 'Basic Screenshot Capture');

  // 2. Test Lighthouse comprehensive audit
  await testEndpoint('/lighthouse-audit', {
    url: testUrl,
    device: 'desktop',
    categories: ['performance', 'accessibility', 'seo', 'best-practices']
  }, 'Lighthouse Comprehensive Audit');

  // 3. Test Lighthouse performance audit
  await testEndpoint('/lighthouse-performance', {
    url: testUrl,
    device: 'desktop'
  }, 'Lighthouse Performance Audit');

  // 4. Test Lighthouse accessibility audit
  await testEndpoint('/lighthouse-accessibility', {
    url: testUrl
  }, 'Lighthouse Accessibility Audit');

  // 5. Test Lighthouse SEO audit
  await testEndpoint('/lighthouse-seo', {
    url: testUrl
  }, 'Lighthouse SEO Audit');

  // 6. Test Lighthouse best practices audit
  await testEndpoint('/lighthouse-best-practices', {
    url: testUrl
  }, 'Lighthouse Best Practices Audit');

  // 7. Test user flow analysis
  await testEndpoint('/user-flow', {
    url: testUrl,
    flowSteps: [
      { type: 'wait', duration: 1000 }
    ]
  }, 'User Flow Analysis');

  // 8. Test report generation
  await testEndpoint('/generate-report', {
    url: testUrl,
    outputPath: '/tmp/test-reports'
  }, 'Lighthouse Report Generation');

  // 9. Test responsive design testing
  await testEndpoint('/test-responsive', {
    url: testUrl,
    breakpoints: [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 375, height: 667, name: 'mobile' }
    ],
    customPath: '/tmp/test-responsive'
  }, 'Responsive Design Testing');

  // 10. Test element interaction
  await testEndpoint('/interact-element', {
    url: testUrl,
    selector: 'body',
    action: 'getText'
  }, 'Element Interaction');

  console.log('\n🎉 Test Suite Complete!');
  console.log('=' .repeat(60));
  console.log('📚 Check the documentation at: http://localhost:3025/api');
  console.log('🔍 Health check: http://localhost:3025/.identity');
}

// Check if server is running first
async function checkServer() {
  try {
    const response = await fetch(`${BASE_URL}/.identity`);
    const result = await response.json();
    
    if (result.name === 'browser-tools-server') {
      console.log('✅ Server is running and ready for testing');
      console.log(`🚀 Features available: ${result.features.join(', ')}`);
      return true;
    } else {
      console.log('❌ Server is running but not the expected service');
      return false;
    }
  } catch (error) {
    console.log('❌ Server is not running. Please start the Extended BrowserTools API first:');
    console.log('   docker-compose up -d browser-tools-dev');
    return false;
  }
}

// Run the test suite
async function main() {
  const serverReady = await checkServer();
  
  if (serverReady) {
    await runTests();
  } else {
    process.exit(1);
  }
}

main().catch(console.error);
