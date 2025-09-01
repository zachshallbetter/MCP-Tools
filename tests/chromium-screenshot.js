#!/usr/bin/env node

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

class ChromiumScreenshot {
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
        '--disable-gpu'
      ],
      ...options
    };
    this.browser = null;
    this.page = null;
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
      
      console.log('✅ Chromium launched successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to launch Chromium:', error.message);
      return false;
    }
  }

  async takeScreenshot(url, outputPath = null) {
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
      
      // Wait a bit for any dynamic content
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate filename if not provided
      if (!outputPath) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const hostname = new URL(url).hostname;
        outputPath = `/tmp/screenshot-${hostname}-${timestamp}.png`;
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
  const outputPath = process.argv[3];
  
  if (!url) {
    console.log('Usage: node chromium-screenshot.js <url> [output-path]');
    console.log('Example: node chromium-screenshot.js https://example.com /path/to/screenshot.png');
    process.exit(1);
  }
  
  const screenshot = new ChromiumScreenshot();
  
  (async () => {
    try {
      await screenshot.launch();
      const result = await screenshot.takeScreenshot(url, outputPath);
      
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
      await screenshot.close();
    }
  })();
}

module.exports = ChromiumScreenshot;
