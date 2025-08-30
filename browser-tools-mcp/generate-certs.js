#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class CertificateGenerator {
  constructor(certDir = './certs') {
    this.certDir = certDir;
    this.keyPath = path.join(certDir, 'server.key');
    this.certPath = path.join(certDir, 'server.crt');
  }

  async generateCertificate(config = {}) {
    const defaultConfig = {
      country: 'US',
      state: 'California',
      locality: 'San Francisco',
      organization: 'BrowserTools MCP',
      organizationalUnit: 'Development',
      commonName: 'localhost',
      email: 'dev@browsertools.local',
      days: 365,
      ...config
    };

    // Create certificates directory if it doesn't exist
    if (!fs.existsSync(this.certDir)) {
      fs.mkdirSync(this.certDir, { recursive: true });
      console.log(`Created certificates directory: ${this.certDir}`);
    }

    // Check if certificates already exist
    if (fs.existsSync(this.keyPath) && fs.existsSync(this.certPath)) {
      console.log('SSL certificates already exist, skipping generation');
      return { keyPath: this.keyPath, certPath: this.certPath };
    }

    console.log('Generating self-signed SSL certificate...');

    try {
      // Generate private key
      await this.generatePrivateKey();

      // Generate certificate signing request
      await this.generateCSR(defaultConfig);

      // Generate self-signed certificate
      await this.generateSelfSignedCert(defaultConfig);

      console.log('✅ SSL certificate generated successfully!');
      console.log(`   Key: ${this.keyPath}`);
      console.log(`   Certificate: ${this.certPath}`);

      return { keyPath: this.keyPath, certPath: this.certPath };
    } catch (error) {
      console.error('❌ Failed to generate SSL certificate:', error);
      throw error;
    }
  }

  async generatePrivateKey() {
    const command = `openssl genrsa -out "${this.keyPath}" 2048`;
    
    try {
      await execAsync(command);
      console.log('✅ Private key generated');
    } catch (error) {
      throw new Error(`Failed to generate private key: ${error}`);
    }
  }

  async generateCSR(config) {
    const opensslConfig = this.createOpenSSLConfig(config);
    const configPath = path.join(this.certDir, 'openssl.conf');
    
    // Write OpenSSL configuration
    fs.writeFileSync(configPath, opensslConfig);

    const command = `openssl req -new -key "${this.keyPath}" -out "${path.join(this.certDir, 'server.csr')}" -config "${configPath}" -batch`;
    
    try {
      await execAsync(command);
      console.log('✅ Certificate signing request generated');
    } catch (error) {
      throw new Error(`Failed to generate CSR: ${error}`);
    } finally {
      // Clean up config file
      if (fs.existsSync(configPath)) {
        fs.unlinkSync(configPath);
      }
    }
  }

  async generateSelfSignedCert(config) {
    const opensslConfig = this.createOpenSSLConfig(config);
    const configPath = path.join(this.certDir, 'openssl.conf');
    
    // Write OpenSSL configuration
    fs.writeFileSync(configPath, opensslConfig);

    const command = `openssl x509 -req -in "${path.join(this.certDir, 'server.csr')}" -signkey "${this.keyPath}" -out "${this.certPath}" -days ${config.days} -extensions v3_req -extfile "${configPath}"`;
    
    try {
      await execAsync(command);
      console.log('✅ Self-signed certificate generated');
    } catch (error) {
      throw new Error(`Failed to generate certificate: ${error}`);
    } finally {
      // Clean up temporary files
      const csrPath = path.join(this.certDir, 'server.csr');
      if (fs.existsSync(csrPath)) {
        fs.unlinkSync(csrPath);
      }
      if (fs.existsSync(configPath)) {
        fs.unlinkSync(configPath);
      }
    }
  }

  createOpenSSLConfig(config) {
    return `
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = ${config.country}
ST = ${config.state}
L = ${config.locality}
O = ${config.organization}
OU = ${config.organizationalUnit}
CN = ${config.commonName}
emailAddress = ${config.email}

[v3_req]
basicConstraints = CA:FALSE
keyUsage = nonRepudiation, digitalSignature, keyEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = *.localhost
DNS.3 = 127.0.0.1
IP.1 = 127.0.0.1
IP.2 = ::1
`;
  }

  async checkOpenSSL() {
    try {
      await execAsync('openssl version');
      return true;
    } catch (error) {
      return false;
    }
  }

  async getCertificateInfo() {
    if (!fs.existsSync(this.certPath)) {
      throw new Error('Certificate file does not exist');
    }

    try {
      const { stdout } = await execAsync(`openssl x509 -in "${this.certPath}" -text -noout`);
      return stdout;
    } catch (error) {
      throw new Error(`Failed to read certificate info: ${error}`);
    }
  }

  async validateCertificate() {
    if (!fs.existsSync(this.keyPath) || !fs.existsSync(this.certPath)) {
      return false;
    }

    try {
      // Check if certificate and key match
      await execAsync(`openssl x509 -noout -modulus -in "${this.certPath}" | openssl md5`);
      await execAsync(`openssl rsa -noout -modulus -in "${this.keyPath}" | openssl md5`);
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Main execution
async function main() {
  try {
    const certGen = new CertificateGenerator();
    
    const hasOpenSSL = await certGen.checkOpenSSL();
    if (!hasOpenSSL) {
      console.error('❌ OpenSSL is not installed. Please install OpenSSL to generate certificates.');
      console.log('   macOS: brew install openssl');
      console.log('   Ubuntu/Debian: sudo apt-get install openssl');
      console.log('   Windows: Download from https://slproweb.com/products/Win32OpenSSL.html');
      process.exit(1);
    }

    const certs = await certGen.generateCertificate();
    console.log('\n🎉 Certificate generation complete!');
    console.log('   You can now use HTTPS with your BrowserTools server.');
    console.log(`   Key: ${certs.keyPath}`);
    console.log(`   Certificate: ${certs.certPath}`);

    // Show certificate info
    try {
      const certInfo = await certGen.getCertificateInfo();
      console.log('\n📋 Certificate Information:');
      console.log(certInfo);
    } catch (error) {
      console.log('Could not display certificate info:', error.message);
    }

  } catch (error) {
    console.error('❌ Certificate generation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { CertificateGenerator };
