#!/usr/bin/env node

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

class ChromiumIntegration {
  constructor(options = {}) {
    this.options = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--ignore-certificate-errors',
        '--ignore-ssl-errors',
        '--ignore-certificate-errors-spki-list'
      ],
      ...options
    };
    this.browser = null;
    this.page = null;
    this.screenshotPath = options.screenshotPath || '/tmp';
  }

  async launch() {
    console.log('🚀 Launching Chromium...');
    
    try {
      this.browser = await puppeteer.launch({
        ...this.options,
        executablePath: '/usr/bin/google-chrome'
      });
      
      this.page = await this.browser.newPage();
      
      // Set viewport
      await this.page.setViewport({
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1
      });
      
      // Enable console and network logging
      this.page.on('console', msg => {
        console.log('Console:', msg.text());
      });
      
      this.page.on('request', request => {
        console.log('Request:', request.url());
      });
      
      console.log('✅ Chromium launched successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to launch Chromium:', error.message);
      return false;
    }
  }

  async takeScreenshot(url, customPath = null) {
    if (!this.page) {
      console.error('❌ Browser not launched. Call launch() first.');
      return null;
    }

    try {
      console.log(`📸 Taking screenshot of: ${url}`);
      
      // Navigate to the URL
      await this.page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });
      
      // Wait for dynamic content
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const hostname = new URL(url).hostname;
      const filename = `screenshot-${hostname}-${timestamp}.png`;
      
      // Use custom path if provided, otherwise use default
      const outputPath = customPath 
        ? path.join(customPath, filename)
        : path.join(this.screenshotPath, filename);
      
      // Ensure directory exists
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Take screenshot
      await this.page.screenshot({
        path: outputPath,
        fullPage: true,
        type: 'png'
      });
      
      console.log(`✅ Screenshot saved to: ${outputPath}`);
      return outputPath;
      
    } catch (error) {
      console.error('❌ Screenshot failed:', error.message);
      return null;
    }
  }

  async getConsoleLogs() {
    if (!this.page) {
      console.error('❌ Browser not launched. Call launch() first.');
      return [];
    }

    try {
      const logs = await this.page.evaluate(() => {
        return window.console.logs || [];
      });
      
      return logs;
    } catch (error) {
      console.error('❌ Failed to get console logs:', error.message);
      return [];
    }
  }

  async getNetworkLogs() {
    if (!this.page) {
      console.error('❌ Browser not launched. Call launch() first.');
      return [];
    }

    try {
      const logs = await this.page.evaluate(() => {
        return window.networkLogs || [];
      });
      
      return logs;
    } catch (error) {
      console.error('❌ Failed to get network logs:', error.message);
      return [];
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log('🔒 Browser closed');
    }
  }
}

// CLI usage
if (require.main === module) {
  const url = process.argv[2];
  const customPath = process.argv[3];
  
  if (!url) {
    console.log('Usage: node chromium-integration.js <url> [custom-path]');
    console.log('Example: node chromium-integration.js https://example.com /path/to/screenshots');
    process.exit(1);
  }
  
  const chromium = new ChromiumIntegration({
    screenshotPath: customPath || '/tmp'
  });
  
  (async () => {
    try {
      await chromium.launch();
      const result = await chromium.takeScreenshot(url, customPath);
      
      if (result) {
        console.log('🎉 Screenshot completed successfully!');
        console.log('📁 File:', result);
      } else {
        console.log('❌ Screenshot failed');
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    } finally {
      await chromium.close();
    }
  })();
}

module.exports = ChromiumIntegration;
