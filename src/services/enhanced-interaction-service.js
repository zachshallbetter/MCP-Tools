#!/usr/bin/env node

import puppeteer from 'puppeteer-core';

class EnhancedInteractionService {
  constructor() {
    this.browser = null;
    this.page = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    console.log('🚀 Initializing Enhanced Interaction Service...');
    
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
      console.log('✅ Enhanced Interaction Service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Enhanced Interaction Service:', error);
      throw error;
    }
  }

  // Enhanced locator-based interactions
  async clickElement(selector, options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log(`🖱️ Clicking element: ${selector}`);
      
      // Navigate if URL provided
      if (options.url) {
        await this.page.goto(options.url, {
          waitUntil: 'networkidle2',
          timeout: 30000
        });
      }

      // Use modern locator API with automatic waiting
      await this.page.locator(selector).click({
        timeout: options.timeout || 10000,
        force: options.force || false,
        noWaitAfter: options.noWaitAfter || false,
        trial: options.trial || false
      });

      return {
        success: true,
        selector,
        action: 'click',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        selector,
        action: 'click',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async fillInput(selector, value, options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log(`📝 Filling input: ${selector} with value: ${value}`);
      
      if (options.url) {
        await this.page.goto(options.url, {
          waitUntil: 'networkidle2',
          timeout: 30000
        });
      }

      // Use modern locator API with smart input detection
      await this.page.locator(selector).fill(value, {
        timeout: options.timeout || 10000,
        force: options.force || false,
        noWaitAfter: options.noWaitAfter || false
      });

      return {
        success: true,
        selector,
        value,
        action: 'fill',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        selector,
        value,
        action: 'fill',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async hoverElement(selector, options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log(`🖱️ Hovering over element: ${selector}`);
      
      if (options.url) {
        await this.page.goto(options.url, {
          waitUntil: 'networkidle2',
          timeout: 30000
        });
      }

      await this.page.locator(selector).hover({
        timeout: options.timeout || 10000,
        force: options.force || false,
        noWaitAfter: options.noWaitAfter || false
      });

      return {
        success: true,
        selector,
        action: 'hover',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        selector,
        action: 'hover',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async scrollElement(selector, scrollOptions = {}, options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log(`📜 Scrolling element: ${selector}`);
      
      if (options.url) {
        await this.page.goto(options.url, {
          waitUntil: 'networkidle2',
          timeout: 30000
        });
      }

      await this.page.locator(selector).scroll({
        scrollLeft: scrollOptions.scrollLeft || 0,
        scrollTop: scrollOptions.scrollTop || 0
      });

      return {
        success: true,
        selector,
        scrollOptions,
        action: 'scroll',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        selector,
        scrollOptions,
        action: 'scroll',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async waitForElement(selector, options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log(`⏳ Waiting for element: ${selector}`);
      
      if (options.url) {
        await this.page.goto(options.url, {
          waitUntil: 'networkidle2',
          timeout: 30000
        });
      }

      await this.page.locator(selector).wait({
        timeout: options.timeout || 10000,
        state: options.state || 'visible'
      });

      return {
        success: true,
        selector,
        state: options.state || 'visible',
        action: 'wait',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        selector,
        state: options.state || 'visible',
        action: 'wait',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Advanced selector support
  async findElementByText(text, options = {}) {
    return this.clickElement(`::-p-text("${text}")`, options);
  }

  async findElementByAria(ariaSelector, options = {}) {
    return this.clickElement(`::-p-aria(${ariaSelector})`, options);
  }

  async findElementInShadowDOM(hostSelector, targetSelector, options = {}) {
    return this.clickElement(`${hostSelector} >>> ${targetSelector}`, options);
  }

  // Custom selector registration
  async registerCustomSelector(name, queryHandler) {
    try {
      await this.page.evaluateOnNewDocument((name, handler) => {
        // Register custom selector handler
        if (window.Puppeteer) {
          window.Puppeteer.registerCustomQueryHandler(name, handler);
        }
      }, name, queryHandler);

      return {
        success: true,
        selectorName: name,
        action: 'register',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        selectorName: name,
        action: 'register',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Form interaction helpers
  async fillForm(formData, options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log(`📋 Filling form with ${Object.keys(formData).length} fields`);
      
      if (options.url) {
        await this.page.goto(options.url, {
          waitUntil: 'networkidle2',
          timeout: 30000
        });
      }

      const results = [];
      
      for (const [selector, value] of Object.entries(formData)) {
        try {
          await this.page.locator(selector).fill(value, {
            timeout: options.timeout || 5000
          });
          results.push({ selector, value, success: true });
        } catch (error) {
          results.push({ selector, value, success: false, error: error.message });
        }
      }

      return {
        success: true,
        formData,
        results,
        action: 'fillForm',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        formData,
        action: 'fillForm',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Keyboard interactions
  async typeText(text, options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log(`⌨️ Typing text: ${text}`);
      
      if (options.url) {
        await this.page.goto(options.url, {
          waitUntil: 'networkidle2',
          timeout: 30000
        });
      }

      if (options.selector) {
        // Type into specific element
        await this.page.locator(options.selector).type(text, {
          delay: options.delay || 0,
          timeout: options.timeout || 10000
        });
      } else {
        // Type into focused element
        await this.page.keyboard.type(text, { delay: options.delay || 0 });
      }

      return {
        success: true,
        text,
        selector: options.selector || 'focused',
        action: 'type',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        text,
        selector: options.selector || 'focused',
        action: 'type',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Mouse interactions
  async mouseClick(x, y, options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log(`🖱️ Mouse click at position: (${x}, ${y})`);
      
      if (options.url) {
        await this.page.goto(options.url, {
          waitUntil: 'networkidle2',
          timeout: 30000
        });
      }

      await this.page.mouse.click(x, y, {
        button: options.button || 'left',
        clickCount: options.clickCount || 1,
        delay: options.delay || 0
      });

      return {
        success: true,
        position: { x, y },
        button: options.button || 'left',
        action: 'mouseClick',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        position: { x, y },
        action: 'mouseClick',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.isInitialized = false;
    }
  }
}

export { EnhancedInteractionService };
