#!/usr/bin/env node

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { CertificateGenerator } = require('./generate-certs.js');

async function startHTTPServer() {
  console.log('🧪 Testing HTTPS Server...\n');

  try {
    // Check if certificates exist, generate if not
    const certDir = './certs';
    const keyPath = path.join(certDir, 'server.key');
    const certPath = path.join(certDir, 'server.crt');

    if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
      console.log('Generating certificates...');
      const certGen = new CertificateGenerator(certDir);
      await certGen.generateCertificate();
    }

    // Read certificates
    const key = fs.readFileSync(keyPath);
    const cert = fs.readFileSync(certPath);

    // Create HTTPS options
    const httpsOptions = {
      key,
      cert,
      minVersion: 'TLSv1.2',
      maxVersion: 'TLSv1.3',
      ciphers: [
        'ECDHE-RSA-AES256-GCM-SHA384',
        'ECDHE-RSA-AES128-GCM-SHA256',
        'ECDHE-RSA-AES256-SHA384',
        'ECDHE-RSA-AES128-SHA256'
      ].join(':')
    };

    // Create HTTPS server
    const httpsServer = https.createServer(httpsOptions, (req, res) => {
      // Set security headers
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');

      if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          message: 'HTTPS Test Server',
          timestamp: new Date().toISOString(),
          protocol: req.protocol,
          secure: req.secure,
          url: req.url,
          method: req.method,
          headers: req.headers
        }, null, 2));
      } else if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'healthy',
          protocol: req.protocol,
          secure: req.secure,
          timestamp: new Date().toISOString()
        }, null, 2));
      } else if (req.url === '/api') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          endpoints: [
            'GET / - Server info',
            'GET /health - Health check',
            'GET /api - API documentation',
            'POST /test - Test endpoint'
          ],
          protocol: req.protocol,
          secure: req.secure
        }, null, 2));
      } else if (req.url === '/test' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        req.on('end', () => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            message: 'POST request received',
            body: body,
            protocol: req.protocol,
            secure: req.secure,
            timestamp: new Date().toISOString()
          }, null, 2));
        });
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: 'Not found',
          available: ['/', '/health', '/api', '/test']
        }, null, 2));
      }
    });

    // Start HTTPS server
    const httpsPort = 3443;
    httpsServer.listen(httpsPort, () => {
      console.log('🎉 HTTPS Server started successfully!');
      console.log(`   URL: https://localhost:${httpsPort}`);
      console.log(`   Protocol: HTTPS`);
      console.log(`   Port: ${httpsPort}`);
      
      console.log('\n📋 Test endpoints:');
      console.log(`   https://localhost:${httpsPort}/`);
      console.log(`   https://localhost:${httpsPort}/health`);
      console.log(`   https://localhost:${httpsPort}/api`);
      console.log(`   POST https://localhost:${httpsPort}/test`);
      
      console.log('\n🔒 Security Features:');
      console.log('   - TLS 1.2/1.3 support');
      console.log('   - Strong cipher suites');
      console.log('   - Security headers');
      console.log('   - Self-signed certificate');
      
      console.log('\n⚠️  Browser Security Warning:');
      console.log('   Your browser will show a security warning for the self-signed certificate.');
      console.log('   This is normal for development. Click "Advanced" → "Proceed to localhost (unsafe)"');
      
      console.log('\n⏰ Server will run for 60 seconds...');
      console.log('   Press Ctrl+C to stop');
    });

    // Also start HTTP server for comparison
    const httpServer = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        message: 'HTTP Server (for comparison)',
        protocol: req.protocol,
        secure: req.secure,
        note: 'This is HTTP - no encryption!'
      }, null, 2));
    });

    const httpPort = 3444;
    httpServer.listen(httpPort, () => {
      console.log(`\n📡 HTTP Server (comparison):`);
      console.log(`   URL: http://localhost:${httpPort}`);
      console.log(`   Protocol: HTTP (no encryption)`);
    });

    // Auto-stop after 60 seconds
    setTimeout(() => {
      console.log('\n🛑 Stopping servers...');
      httpsServer.close(() => {
        console.log('✅ HTTPS server stopped');
      });
      httpServer.close(() => {
        console.log('✅ HTTP server stopped');
      });
      process.exit(0);
    }, 60000);

  } catch (error) {
    console.error('❌ Failed to start HTTPS server:', error);
    process.exit(1);
  }
}

// Run the test
startHTTPServer().catch(console.error);
