#!/usr/bin/env node

import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

class ChromiumScreenshotService {
  constructor() {
    this.browser = null;
    this.page = null;
    this.isInitialized = false;
  }

  get browserInstance() {
    return this.browser;
  }

  get pageInstance() {
    return this.page;
  }

  get isReady() {
    return this.isInitialized && this.browser !== null && this.page !== null;
  }

  async initialize() {
    if (this.isInitialized) return;

    console.log('🚀 Initializing Chromium Screenshot Service...');
    
    try {
      this.browser = await puppeteer.launch({
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
        executablePath: '/usr/bin/chromium'
      });
      
      this.page = await this.browser.newPage();
      
      // Set viewport
      await this.page.setViewport({
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1
      });
      
      this.isInitialized = true;
      console.log('✅ Chromium Screenshot Service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Chromium Screenshot Service:', error);
      throw error;
    }
  }

  async takeScreenshot(url, customPath) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.page) {
      throw new Error('Chromium page not available');
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
        : path.join('/tmp', filename);
      
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
      
      // Get file size
      const stats = fs.statSync(outputPath);
      
      console.log(`✅ Screenshot saved to: ${outputPath} (${stats.size} bytes)`);
      
      return {
        path: outputPath,
        size: stats.size
      };
      
    } catch (error) {
      console.error('❌ Screenshot failed:', error);
      throw error;
    }
  }

  async getConsoleLogs() {
    if (!this.isInitialized || !this.page) {
      return [];
    }

    try {
      const logs = await this.page.evaluate(() => {
        return window.console.logs || [];
      });
      
      return logs;
    } catch (error) {
      console.error('❌ Failed to get console logs:', error);
      return [];
    }
  }

  async getNetworkLogs() {
    if (!this.isInitialized || !this.page) {
      return [];
    }

    try {
      const logs = await this.page.evaluate(() => {
        return window.networkLogs || [];
      });
      
      return logs;
    } catch (error) {
      console.error('❌ Failed to get network logs:', error);
      return [];
    }
  }

  // Helper methods for the extended API
  async setViewport(width, height) {
    if (!this.page) {
      throw new Error('Chromium page not available');
    }
    await this.page.setViewport({ width, height, deviceScaleFactor: 1 });
  }

  async goto(url, options) {
    if (!this.page) {
      throw new Error('Chromium page not available');
    }
    await this.page.goto(url, options || { waitUntil: 'networkidle2' });
  }

  async waitForSelector(selector, options) {
    if (!this.page) {
      throw new Error('Chromium page not available');
    }
    await this.page.waitForSelector(selector, options);
  }

  async screenshot(options) {
    if (!this.page) {
      throw new Error('Chromium page not available');
    }
    return await this.page.screenshot(options);
  }

  async evaluate(pageFunction, ...args) {
    if (!this.page) {
      throw new Error('Chromium page not available');
    }
    return await this.page.evaluate(pageFunction, ...args);
  }

  async $(selector) {
    if (!this.page) {
      throw new Error('Chromium page not available');
    }
    return await this.page.$(selector);
  }

  async target() {
    if (!this.page) {
      throw new Error('Chromium page not available');
    }
    return this.page.target();
  }

  on(event, handler) {
    if (!this.page) {
      throw new Error('Chromium page not available');
    }
    this.page.on(event, handler);
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
      this.isInitialized = false;
      console.log('🔒 Chromium Screenshot Service closed');
    }
  }
}

// Export singleton instance
export const chromiumScreenshotService = new ChromiumScreenshotService();
