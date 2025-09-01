// Troubleshooting script for Chrome extension connection issues
// Run this in the browser console

console.log('🔍 Troubleshooting BrowserTools Extension...');

// Test 1: Check if Chrome extension APIs are available
console.log('1. Checking Chrome extension APIs...');
if (typeof chrome !== 'undefined') {
  console.log('✅ Chrome API available');
  if (chrome.runtime) {
    console.log('✅ Chrome runtime available');
    if (chrome.runtime.id) {
      console.log('✅ Extension ID:', chrome.runtime.id);
    } else {
      console.log('❌ No extension ID found');
    }
  } else {
    console.log('❌ Chrome runtime not available');
  }
} else {
  console.log('❌ Chrome API not available');
}

// Test 2: Check if we're in a DevTools context
console.log('\n2. Checking DevTools context...');
if (chrome.devtools) {
  console.log('✅ DevTools API available');
  if (chrome.devtools.inspectedWindow) {
    console.log('✅ Inspected window available');
    console.log('Tab ID:', chrome.devtools.inspectedWindow.tabId);
  } else {
    console.log('❌ Inspected window not available');
  }
} else {
  console.log('❌ DevTools API not available');
}

// Test 3: Test server connection
console.log('\n3. Testing server connection...');
fetch('http://localhost:3025/.identity')
  .then(response => {
    console.log('✅ Server response status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('✅ Server data:', data);
  })
  .catch(error => {
    console.log('❌ Server connection failed:', error.message);
  });

// Test 4: Check extension storage
console.log('\n4. Checking extension storage...');
if (chrome.storage) {
  chrome.storage.local.get(['browserConnectorSettings'], (result) => {
    if (chrome.runtime.lastError) {
      console.log('❌ Storage error:', chrome.runtime.lastError);
    } else {
      console.log('✅ Storage settings:', result.browserConnectorSettings);
    }
  });
} else {
  console.log('❌ Storage API not available');
}

// Test 5: Try to send a message to background script
console.log('\n5. Testing background script communication...');
if (chrome.runtime && chrome.runtime.sendMessage) {
  chrome.runtime.sendMessage({
    type: 'GET_CURRENT_URL',
    tabId: chrome.devtools?.inspectedWindow?.tabId || 'test'
  }, (response) => {
    if (chrome.runtime.lastError) {
      console.log('❌ Background script error:', chrome.runtime.lastError.message);
    } else {
      console.log('✅ Background script response:', response);
    }
  });
} else {
  console.log('❌ Cannot send message to background script');
}

console.log('\n🔍 Troubleshooting complete. Check results above.');
