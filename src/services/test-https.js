#!/usr/bin/env node

import { SecureServer } from './secure-server.js';
import express from 'express';

async function testHTTPS() {
  console.log('🧪 Testing HTTPS Server...\n');

  // Create a simple Express app
  const app = express();
  
  app.get('/', (req, res) => {
    res.json({
      message: 'HTTPS Test Server',
      timestamp: new Date().toISOString(),
      protocol: req.protocol,
      secure: req.secure
    });
  });

  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      protocol: req.protocol,
      secure: req.secure,
      headers: req.headers
    });
  });

  // Test HTTPS availability
  const isHTTPSAvailable = await SecureServer.isHTTPSAvailable();
  console.log(`OpenSSL Available: ${isHTTPSAvailable ? '✅' : '❌'}`);

  if (!isHTTPSAvailable) {
    console.log('\n⚠️  OpenSSL not available. Please install OpenSSL:');
    console.log('   macOS: brew install openssl');
    console.log('   Ubuntu/Debian: sudo apt-get install openssl');
    console.log('   Windows: Download from https://slproweb.com/products/Win32OpenSSL.html');
    return;
  }

  try {
    // Create and start HTTPS server
    const secureServer = new SecureServer({
      port: 3443, // Use a different port for testing
      host: 'localhost',
      enableHTTPS: true,
      certDir: './test-certs',
      app: app
    });

    const serverInfo = await secureServer.start();
    
    console.log('\n🎉 HTTPS Server started successfully!');
    console.log(`   URL: ${serverInfo.url}`);
    console.log(`   Protocol: ${serverInfo.protocol}`);
    console.log(`   Port: ${serverInfo.port}`);
    
    console.log('\n📋 Test endpoints:');
    console.log(`   ${serverInfo.url}/`);
    console.log(`   ${serverInfo.url}/health`);
    
    console.log('\n🔍 Certificate Information:');
    const certInfo = await SecureServer.getCertificateInfo('./test-certs');
    if (certInfo) {
      console.log(certInfo);
    }

    console.log('\n⏰ Server will run for 30 seconds...');
    console.log('   Press Ctrl+C to stop');
    
    // Keep server running for 30 seconds
    setTimeout(async () => {
      console.log('\n🛑 Stopping server...');
      await new Promise((resolve) => {
        serverInfo.server.close(() => {
          console.log('✅ Server stopped');
          resolve();
        });
      });
      process.exit(0);
    }, 30000);

  } catch (error) {
    console.error('❌ Failed to start HTTPS server:', error);
    process.exit(1);
  }
}

// Run the test
testHTTPS().catch(console.error);
