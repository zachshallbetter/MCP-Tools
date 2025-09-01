// Simple test for Chrome extension
// Run this in Chrome DevTools console

console.log('🧪 Simple Extension Test');

// Test 1: Basic Chrome API
if (typeof chrome !== 'undefined' && chrome.runtime) {
  console.log('✅ Chrome runtime available');
  
  // Test 2: Send a simple message
  chrome.runtime.sendMessage({type: 'GET_CURRENT_URL', tabId: 'test'}, (response) => {
    if (chrome.runtime.lastError) {
      console.log('❌ Background script error:', chrome.runtime.lastError.message);
    } else {
      console.log('✅ Background script working:', response);
    }
  });
} else {
  console.log('❌ Chrome runtime not available');
}

// Test 3: Server connection
fetch('http://localhost:3025/.identity')
  .then(r => r.json())
  .then(data => console.log('✅ Server connected:', data))
  .catch(err => console.log('❌ Server failed:', err.message));
