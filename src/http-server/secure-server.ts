#!/usr/bin/env node

import express from 'express';
import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { CertificateGenerator } from './certificate-generator.js';

export interface ServerOptions {
  port: number;
  host: string;
  enableHTTPS: boolean;
  certDir?: string;
  app: express.Application;
}

export interface ServerInfo {
  server: http.Server | https.Server;
  protocol: 'http' | 'https';
  port: number;
  host: string;
  url: string;
}

export class SecureServer {
  private options: ServerOptions;

  constructor(options: ServerOptions) {
    this.options = options;
  }

  /**
   * Start the server with automatic HTTPS detection
   */
  async start(): Promise<ServerInfo> {
    if (this.options.enableHTTPS) {
      return this.startHTTPS();
    } else {
      return this.startHTTP();
    }
  }

  /**
   * Start HTTP server
   */
  private startHTTP(): Promise<ServerInfo> {
    return new Promise((resolve, reject) => {
      const server = http.createServer(this.options.app);
      
      server.listen(this.options.port, this.options.host, () => {
        const serverInfo: ServerInfo = {
          server,
          protocol: 'http',
          port: this.options.port,
          host: this.options.host,
          url: `http://${this.options.host}:${this.options.port}`
        };

        console.log(`🚀 HTTP Server started on ${serverInfo.url}`);
        resolve(serverInfo);
      });

      server.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Start HTTPS server with certificate generation
   */
  private async startHTTPS(): Promise<ServerInfo> {
    try {
      // Check if OpenSSL is available
      const hasOpenSSL = await CertificateGenerator.prototype.checkOpenSSL();
      if (!hasOpenSSL) {
        console.warn('⚠️  OpenSSL not available, falling back to HTTP');
        return this.startHTTP();
      }

      // Generate or load certificates
      const certDir = this.options.certDir || './certs';
      const certGen = new CertificateGenerator(certDir);
      
      const certs = await certGen.generateCertificate({
        commonName: this.options.host,
        organization: 'BrowserTools MCP Development'
      });

      // Validate certificates
      const isValid = await certGen.validateCertificate();
      if (!isValid) {
        console.warn('⚠️  Invalid certificates, regenerating...');
        // Remove existing certificates and regenerate
        if (fs.existsSync(certs.keyPath)) fs.unlinkSync(certs.keyPath);
        if (fs.existsSync(certs.certPath)) fs.unlinkSync(certs.certPath);
        const newCerts = await certGen.generateCertificate({
          commonName: this.options.host,
          organization: 'BrowserTools MCP Development'
        });
        return this.createHTTPServer(newCerts);
      }

      return this.createHTTPServer(certs);
    } catch (error) {
      console.warn('⚠️  Failed to setup HTTPS, falling back to HTTP:', error);
      return this.startHTTP();
    }
  }

  /**
   * Create HTTPS server with certificates
   */
  private createHTTPServer(certs: { keyPath: string; certPath: string }): Promise<ServerInfo> {
    return new Promise((resolve, reject) => {
      try {
        const key = fs.readFileSync(certs.keyPath);
        const cert = fs.readFileSync(certs.certPath);

        const httpsOptions = {
          key,
          cert,
          // Additional security options
          minVersion: 'TLSv1.2' as const,
          maxVersion: 'TLSv1.3' as const,
          ciphers: [
            'ECDHE-RSA-AES256-GCM-SHA384',
            'ECDHE-RSA-AES128-GCM-SHA256',
            'ECDHE-RSA-AES256-SHA384',
            'ECDHE-RSA-AES128-SHA256'
          ].join(':')
        };

        const server = https.createServer(httpsOptions, this.options.app);
        
        server.listen(this.options.port, this.options.host, () => {
          const serverInfo: ServerInfo = {
            server,
            protocol: 'https',
            port: this.options.port,
            host: this.options.host,
            url: `https://${this.options.host}:${this.options.port}`
          };

          console.log(`🔒 HTTPS Server started on ${serverInfo.url}`);
          console.log('   Using self-signed certificate for development');
          console.log('   Note: Your browser may show a security warning');
          console.log('   This is normal for self-signed certificates');
          resolve(serverInfo);
        });

        server.on('error', (error) => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Check if HTTPS is available
   */
  static async isHTTPSAvailable(): Promise<boolean> {
    try {
      const certGen = new CertificateGenerator();
      const hasOpenSSL = await certGen.checkOpenSSL();
      return hasOpenSSL;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get certificate information
   */
  static async getCertificateInfo(certDir: string = './certs'): Promise<string | null> {
    try {
      const certPath = path.join(certDir, 'server.crt');
      if (!fs.existsSync(certPath)) {
        return null;
      }
      const certGen = new CertificateGenerator(certDir);
      return await certGen.getCertificateInfo();
    } catch (error) {
      return null;
    }
  }

  /**
   * Generate certificates manually
   */
  static async generateCertificates(certDir: string = './certs', config?: any): Promise<{ keyPath: string; certPath: string }> {
    const certGen = new CertificateGenerator(certDir);
    return await certGen.generateCertificate(config);
  }
}

// Export default instance
export const secureServer = SecureServer;

// If run directly, generate certificates
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    try {
      const isHTTPSAvailable = await SecureServer.isHTTPSAvailable();
      if (!isHTTPSAvailable) {
        console.error('❌ OpenSSL is not installed. HTTPS is not available.');
        console.log('   macOS: brew install openssl');
        console.log('   Ubuntu/Debian: sudo apt-get install openssl');
        console.log('   Windows: Download from https://slproweb.com/products/Win32OpenSSL.html');
        process.exit(1);
      }

      const certs = await SecureServer.generateCertificates();
      console.log('\n🎉 Certificates generated successfully!');
      console.log(`   Key: ${certs.keyPath}`);
      console.log(`   Certificate: ${certs.certPath}`);
      
      const certInfo = await SecureServer.getCertificateInfo();
      if (certInfo) {
        console.log('\n📋 Certificate Information:');
        console.log(certInfo);
      }
    } catch (error) {
      console.error('❌ Certificate generation failed:', error);
      process.exit(1);
    }
  })();
}
