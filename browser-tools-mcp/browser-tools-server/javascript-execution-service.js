import puppeteer from 'puppeteer-core';

class JavaScriptExecutionService {
  constructor() {
    this.browser = null;
    this.page = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    console.log('🚀 Initializing JavaScript Execution Service...');
    
    this.browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/chromium',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--ignore-certificate-errors',
        '--ignore-ssl-errors'
      ]
    });

    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1920, height: 1080 });
    
    this.isInitialized = true;
    console.log('✅ JavaScript Execution Service initialized');
  }

  async evaluate(script, ...args) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log(`🔍 Evaluating JavaScript: ${typeof script === 'string' ? script.substring(0, 100) + '...' : 'Function'}`);
      
      const result = await this.page.evaluate(script, ...args);
      
      return {
        success: true,
        result: result,
        type: typeof result,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        script: typeof script === 'string' ? script : 'Function',
        timestamp: new Date().toISOString()
      };
    }
  }

  async evaluateHandle(script, ...args) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log(`🔗 Evaluating JavaScript Handle: ${typeof script === 'string' ? script.substring(0, 100) + '...' : 'Function'}`);
      
      const handle = await this.page.evaluateHandle(script, ...args);
      
      // Get handle type and basic info
      const handleInfo = {
        type: handle.constructor.name,
        isElementHandle: handle.constructor.name === 'ElementHandle',
        isJSHandle: handle.constructor.name === 'JSHandle'
      };

      return {
        success: true,
        handle: handleInfo,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        script: typeof script === 'string' ? script : 'Function',
        timestamp: new Date().toISOString()
      };
    }
  }

  async executeFunction(functionBody, ...args) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log(`⚡ Executing Function: ${functionBody.substring(0, 100)}...`);
      
      // Create a function from the body and execute it
      const result = await this.page.evaluate(
        new Function(...args.map((_, i) => `arg${i}`), functionBody),
        ...args
      );
      
      return {
        success: true,
        result: result,
        type: typeof result,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        functionBody: functionBody,
        timestamp: new Date().toISOString()
      };
    }
  }

  async executeWithDOM(script, url = null) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      if (url) {
        console.log(`🌐 Navigating to: ${url}`);
        await this.page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      }

      console.log(`🎯 Executing DOM Script: ${script.substring(0, 100)}...`);
      
      const result = await this.page.evaluate(script);
      
      return {
        success: true,
        result: result,
        type: typeof result,
        url: url || 'current page',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        script: script,
        url: url || 'current page',
        timestamp: new Date().toISOString()
      };
    }
  }

  async executePromise(script, timeout = 30000) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log(`⏱️ Executing Promise Script: ${script.substring(0, 100)}...`);
      
      const result = await this.page.evaluate(script);
      
      return {
        success: true,
        result: result,
        type: typeof result,
        timeout: timeout,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        script: script,
        timeout: timeout,
        timestamp: new Date().toISOString()
      };
    }
  }

  async getElementHandle(selector) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log(`🎯 Getting Element Handle: ${selector}`);
      
      const handle = await this.page.$(selector);
      
      if (!handle) {
        return {
          success: false,
          error: `Element not found: ${selector}`,
          selector: selector,
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        handle: {
          type: handle.constructor.name,
          isElementHandle: true,
          selector: selector
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        selector: selector,
        timestamp: new Date().toISOString()
      };
    }
  }

  async executeOnElement(selector, script, ...args) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log(`🎯 Executing on Element: ${selector}`);
      
      const result = await this.page.$eval(selector, script, ...args);
      
      return {
        success: true,
        result: result,
        type: typeof result,
        selector: selector,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        selector: selector,
        script: typeof script === 'string' ? script : 'Function',
        timestamp: new Date().toISOString()
      };
    }
  }

  async executeOnElements(selector, script, ...args) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log(`🎯 Executing on Elements: ${selector}`);
      
      const results = await this.page.$$eval(selector, script, ...args);
      
      return {
        success: true,
        results: results,
        count: results.length,
        type: typeof results,
        selector: selector,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        selector: selector,
        script: typeof script === 'string' ? script : 'Function',
        timestamp: new Date().toISOString()
      };
    }
  }

  async injectScript(script, url = null) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      if (url) {
        console.log(`🌐 Navigating to: ${url}`);
        await this.page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      }

      console.log(`💉 Injecting Script: ${script.substring(0, 100)}...`);
      
      const result = await this.page.evaluate(script);
      
      return {
        success: true,
        result: result,
        type: typeof result,
        url: url || 'current page',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        script: script,
        url: url || 'current page',
        timestamp: new Date().toISOString()
      };
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.isInitialized = false;
      console.log('🔒 JavaScript Execution Service closed');
    }
  }
}

export { JavaScriptExecutionService };
