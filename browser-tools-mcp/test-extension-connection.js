// Test script to verify Chrome extension connection
// Run this in the browser console to test the extension

console.log('Testing BrowserTools Chrome Extension Connection...');

// Test 1: Check if we can connect to the server
fetch('http://localhost:3025/.identity')
  .then(response => response.json())
  .then(data => {
    console.log('✅ Server connection successful:', data);
    
    // Test 2: Check if the extension is loaded
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      console.log('✅ Chrome extension API available');
      
      // Test 3: Try to send a message to the extension
      chrome.runtime.sendMessage({
        type: 'GET_CURRENT_URL',
        tabId: chrome.devtools?.inspectedWindow?.tabId
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.log('⚠️ Extension message error:', chrome.runtime.lastError);
        } else {
          console.log('✅ Extension communication successful:', response);
        }
      });
    } else {
      console.log('❌ Chrome extension API not available');
    }
  })
  .catch(error => {
    console.log('❌ Server connection failed:', error);
  });

// Test 4: Check extension settings
chrome.storage.local.get(['browserConnectorSettings'], (result) => {
  console.log('📋 Extension settings:', result.browserConnectorSettings);
});

console.log('Test completed. Check the console for results.');
