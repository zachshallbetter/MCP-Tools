import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

export class ChromiumScreenshotService {
  private browser: puppeteer.Browser | null = null;
  private page: puppeteer.Page | null = null;
  private isInitialized = false;

  // Public getters for accessing browser and page
  get browserInstance(): puppeteer.Browser | null {
    return this.browser;
  }

  get pageInstance(): puppeteer.Page | null {
    return this.page;
  }

  get isReady(): boolean {
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
        executablePath: '/usr/bin/google-chrome'
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

  async takeScreenshot(url: string, customPath?: string): Promise<{ path: string; size: number }> {
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
        path: outputPath as `${string}.png`,
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

  async getConsoleLogs(): Promise<string[]> {
    if (!this.isInitialized || !this.page) {
      return [];
    }

    try {
      const logs = await this.page.evaluate(() => {
        return (window as any).console.logs || [];
      });
      
      return logs;
    } catch (error) {
      console.error('❌ Failed to get console logs:', error);
      return [];
    }
  }

  async getNetworkLogs(): Promise<string[]> {
    if (!this.isInitialized || !this.page) {
      return [];
    }

    try {
      const logs = await this.page.evaluate(() => {
        return (window as any).networkLogs || [];
      });
      
      return logs;
    } catch (error) {
      console.error('❌ Failed to get network logs:', error);
      return [];
    }
  }

  // Helper methods for the extended API
  async setViewport(width: number, height: number): Promise<void> {
    if (!this.page) {
      throw new Error('Chromium page not available');
    }
    await this.page.setViewport({ width, height, deviceScaleFactor: 1 });
  }

  async goto(url: string, options?: puppeteer.WaitForOptions): Promise<void> {
    if (!this.page) {
      throw new Error('Chromium page not available');
    }
    await this.page.goto(url, options || { waitUntil: 'networkidle2' });
  }

  async waitForSelector(selector: string, options?: puppeteer.WaitForSelectorOptions): Promise<void> {
    if (!this.page) {
      throw new Error('Chromium page not available');
    }
    await this.page.waitForSelector(selector, options);
  }

  async screenshot(options?: puppeteer.ScreenshotOptions): Promise<Buffer> {
    if (!this.page) {
      throw new Error('Chromium page not available');
    }
    return await this.page.screenshot(options);
  }

  async evaluate<T>(pageFunction: Function | string, ...args: any[]): Promise<T> {
    if (!this.page) {
      throw new Error('Chromium page not available');
    }
    return await this.page.evaluate(pageFunction, ...args);
  }

  async $(selector: string): Promise<puppeteer.ElementHandle<Element> | null> {
    if (!this.page) {
      throw new Error('Chromium page not available');
    }
    return await this.page.$(selector);
  }

  async target(): Promise<puppeteer.Target> {
    if (!this.page) {
      throw new Error('Chromium page not available');
    }
    return this.page.target();
  }

  on(event: string, handler: Function): void {
    if (!this.page) {
      throw new Error('Chromium page not available');
    }
    this.page.on(event as any, handler as any);
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
