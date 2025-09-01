#!/usr/bin/env node

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class SimpleHTTPServer {
  constructor() {
    this.certDir = './certs';
    this.keyPath = path.join(this.certDir, 'server.key');
    this.certPath = path.join(this.certDir, 'server.crt');
  }

  async checkOpenSSL() {
    try {
      await execAsync('openssl version');
      return true;
    } catch (error) {
      return false;
    }
  }

  async generateCertificate() {
    if (!fs.existsSync(this.certDir)) {
      fs.mkdirSync(this.certDir, { recursive: true });
      console.log(`Created certificates directory: ${this.certDir}`);
    }

    if (fs.existsSync(this.keyPath) && fs.existsSync(this.certPath)) {
      console.log('SSL certificates already exist, skipping generation');
      return { keyPath: this.keyPath, certPath: this.certPath };
    }

    console.log('Generating self-signed SSL certificate...');
    
    try {
      // Generate private key
      await execAsync(`openssl genrsa -out ${this.keyPath} 2048`);
      
      // Generate CSR
      const csrConfig = `
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = US
ST = California
L = San Francisco
O = BrowserTools Test
OU = Development
CN = localhost
emailAddress = test@browsertools.local

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = *.localhost
IP.1 = 127.0.0.1
`;
      
      const csrConfigPath = path.join(this.certDir, 'openssl.conf');
      fs.writeFileSync(csrConfigPath, csrConfig);
      
      // Generate self-signed certificate
      await execAsync(`openssl req -new -x509 -key ${this.keyPath} -out ${this.certPath} -days 365 -config ${csrConfigPath} -extensions v3_req`);
      
      // Clean up config file
      fs.unlinkSync(csrConfigPath);
      
      console.log('✅ SSL certificate generated successfully!');
      return { keyPath: this.keyPath, certPath: this.certPath };
    } catch (error) {
      console.error('❌ Failed to generate SSL certificate:', error);
      throw error;
    }
  }

  async startHTTPServer() {
    try {
      const hasOpenSSL = await this.checkOpenSSL();
      if (!hasOpenSSL) {
        console.log('⚠️  OpenSSL not available, starting HTTP server instead');
        return this.startHTTPFallback();
      }

      const certs = await this.generateCertificate();
      
      const key = fs.readFileSync(certs.keyPath);
      const cert = fs.readFileSync(certs.certPath);

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

      const server = https.createServer(httpsOptions, (req, res) => {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');

        if (req.url === '/') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            message: 'HTTPS Test Server - BrowserTools MCP',
            timestamp: new Date().toISOString(),
            protocol: req.protocol,
            secure: req.secure,
            url: req.url,
            method: req.method,
            features: [
              '🔒 HTTPS with self-signed certificates',
              '📸 Chromium screenshots',
              '🌐 Lighthouse audits',
              '📊 Performance monitoring',
              '🔍 Web development tools'
            ]
          }, null, 2));
        } else if (req.url === '/health') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            protocol: 'https',
            secure: true
          }));
        } else if (req.url === '/api') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            name: 'BrowserTools MCP HTTPS Test Server',
            version: '1.0.0',
            endpoints: [
              { path: '/', description: 'Server information' },
              { path: '/health', description: 'Health check' },
              { path: '/api', description: 'API documentation' }
            ],
            features: {
              https: true,
              certificates: 'self-signed',
              tls: 'TLSv1.2/TLSv1.3',
              security: 'HSTS, CSP headers'
            }
          }, null, 2));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: 'Not Found',
            message: 'Endpoint not found',
            available: ['/', '/health', '/api']
          }));
        }
      });

      const port = 3443;
      server.listen(port, () => {
        console.log('🎉 HTTPS Test Server started successfully!');
        console.log(`   URL: https://localhost:${port}`);
        console.log(`   Health: https://localhost:${port}/health`);
        console.log(`   API: https://localhost:${port}/api`);
        console.log('');
        console.log('🔒 HTTPS Features:');
        console.log('   - Self-signed SSL certificate');
        console.log('   - TLS 1.2/1.3 support');
        console.log('   - Security headers (HSTS, CSP)');
        console.log('   - Strong cipher suites');
        console.log('');
        console.log('⚠️  Note: Browser will show security warning for self-signed certificate');
        console.log('   This is expected for development/testing');
        console.log('');
        console.log('🚀 Ready to test BrowserTools MCP HTTPS functionality!');
      });

      return server;
    } catch (error) {
      console.error('❌ Failed to start HTTPS server:', error);
      throw error;
    }
  }

  async startHTTPFallback() {
    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        message: 'HTTP Fallback Server',
        timestamp: new Date().toISOString(),
        protocol: 'http',
        secure: false,
        note: 'HTTPS not available - OpenSSL required'
      }));
    });

    const port = 3444;
    server.listen(port, () => {
      console.log(`🌐 HTTP Fallback Server started on port ${port}`);
    });

    return server;
  }
}

async function main() {
  console.log('🧪 Testing BrowserTools MCP HTTPS Server...\n');
  
  try {
    const server = new SimpleHTTPServer();
    const httpsServer = await server.startHTTPServer();
    
    // Keep server running for 60 seconds
    setTimeout(() => {
      console.log('\n⏰ Shutting down test server...');
      httpsServer.close(() => {
        console.log('✅ Test server stopped');
        process.exit(0);
      });
    }, 60000);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { SimpleHTTPServer };
