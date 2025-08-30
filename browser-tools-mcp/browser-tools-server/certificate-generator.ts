#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface CertificateConfig {
  country: string;
  state: string;
  locality: string;
  organization: string;
  organizationalUnit: string;
  commonName: string;
  email: string;
  days: number;
}

export class CertificateGenerator {
  private certDir: string;
  private keyPath: string;
  private certPath: string;

  constructor(certDir: string = './certs') {
    this.certDir = certDir;
    this.keyPath = path.join(certDir, 'server.key');
    this.certPath = path.join(certDir, 'server.crt');
  }

  /**
   * Generate a self-signed SSL certificate for development/testing
   */
  async generateCertificate(config: Partial<CertificateConfig> = {}): Promise<{ keyPath: string; certPath: string }> {
    const defaultConfig: CertificateConfig = {
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

  /**
   * Generate private key using OpenSSL
   */
  private async generatePrivateKey(): Promise<void> {
    const command = `openssl genrsa -out "${this.keyPath}" 2048`;
    
    try {
      await execAsync(command);
      console.log('✅ Private key generated');
    } catch (error) {
      throw new Error(`Failed to generate private key: ${error}`);
    }
  }

  /**
   * Generate Certificate Signing Request
   */
  private async generateCSR(config: CertificateConfig): Promise<void> {
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

  /**
   * Generate self-signed certificate
   */
  private async generateSelfSignedCert(config: CertificateConfig): Promise<void> {
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

  /**
   * Create OpenSSL configuration file content
   */
  private createOpenSSLConfig(config: CertificateConfig): string {
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

  /**
   * Check if OpenSSL is available
   */
  async checkOpenSSL(): Promise<boolean> {
    try {
      await execAsync('openssl version');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get certificate information
   */
  async getCertificateInfo(): Promise<string> {
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

  /**
   * Validate certificate and key
   */
  async validateCertificate(): Promise<boolean> {
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

// Export default instance
export const certificateGenerator = new CertificateGenerator();

// If run directly, generate certificate
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    try {
      const hasOpenSSL = await certificateGenerator.checkOpenSSL();
      if (!hasOpenSSL) {
        console.error('❌ OpenSSL is not installed. Please install OpenSSL to generate certificates.');
        console.log('   macOS: brew install openssl');
        console.log('   Ubuntu/Debian: sudo apt-get install openssl');
        console.log('   Windows: Download from https://slproweb.com/products/Win32OpenSSL.html');
        process.exit(1);
      }

      const certs = await certificateGenerator.generateCertificate();
      console.log('\n🎉 Certificate generation complete!');
      console.log('   You can now use HTTPS with your BrowserTools server.');
      console.log(`   Key: ${certs.keyPath}`);
      console.log(`   Certificate: ${certs.certPath}`);
    } catch (error) {
      console.error('❌ Certificate generation failed:', error);
      process.exit(1);
    }
  })();
}
