import puppeteer from 'puppeteer-core';

class NetworkInterceptionService {
  constructor() {
    this.browser = null;
    this.page = null;
    this.isInitialized = false;
    this.interceptionEnabled = false;
    this.interceptHandlers = new Map();
    this.requestLog = [];
    this.responseLog = [];
    this.blockedRequests = [];
    this.modifiedRequests = [];
    this.priority = 0; // Default priority for cooperative intercept mode
  }

  async initialize() {
    if (this.isInitialized) return;
    
    console.log('🌐 Initializing Network Interception Service...');
    
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
    console.log('✅ Network Interception Service initialized');
  }

  setInterceptResolutionConfig(priority = 0) {
    this.priority = priority;
    console.log(`🔧 Intercept resolution priority set to: ${priority}`);
    return { success: true, priority };
  }

  async enableInterception(url = null) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log('🔒 Enabling request interception...');
      
      await this.page.setRequestInterception(true);
      this.interceptionEnabled = true;

      // Set up request interception handler
      this.page.on('request', async (interceptedRequest) => {
        await this.handleRequest(interceptedRequest);
      });

      // Set up response interception handler
      this.page.on('response', async (response) => {
        await this.handleResponse(response);
      });

      if (url) {
        console.log(`🌐 Navigating to: ${url}`);
        await this.page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      }

      return {
        success: true,
        message: 'Request interception enabled',
        url: url || 'current page',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async handleRequest(interceptedRequest) {
    const requestData = {
      url: interceptedRequest.url(),
      method: interceptedRequest.method(),
      headers: interceptedRequest.headers(),
      postData: interceptedRequest.postData(),
      resourceType: interceptedRequest.resourceType(),
      timestamp: new Date().toISOString()
    };

    this.requestLog.push(requestData);

    // Check if request is already handled
    if (interceptedRequest.isInterceptResolutionHandled()) {
      return;
    }

    // Apply registered handlers
    for (const [id, handler] of this.interceptHandlers) {
      try {
        const result = await handler(interceptedRequest, requestData);
        if (result && result.action) {
          switch (result.action) {
            case 'abort':
              interceptedRequest.abort(result.reason || 'failed', this.priority);
              this.blockedRequests.push({ ...requestData, reason: result.reason });
              return;
            case 'continue':
              interceptedRequest.continue(result.overrides || interceptedRequest.continueRequestOverrides(), this.priority);
              if (result.overrides) {
                this.modifiedRequests.push({ ...requestData, modifications: result.overrides });
              }
              return;
            case 'respond':
              interceptedRequest.respond(result.response, this.priority);
              this.modifiedRequests.push({ ...requestData, response: result.response });
              return;
          }
        }
      } catch (error) {
        console.error(`Handler ${id} error:`, error);
      }
    }

    // Default: continue the request
    interceptedRequest.continue(interceptedRequest.continueRequestOverrides(), this.priority);
  }

  async handleResponse(response) {
    const responseData = {
      url: response.url(),
      status: response.status(),
      headers: response.headers(),
      timestamp: new Date().toISOString()
    };

    this.responseLog.push(responseData);
  }

  addInterceptHandler(id, handler) {
    this.interceptHandlers.set(id, handler);
    console.log(`📝 Added intercept handler: ${id}`);
    return {
      success: true,
      handlerId: id,
      totalHandlers: this.interceptHandlers.size,
      timestamp: new Date().toISOString()
    };
  }

  removeInterceptHandler(id) {
    const removed = this.interceptHandlers.delete(id);
    console.log(`🗑️ Removed intercept handler: ${id} (${removed ? 'success' : 'not found'})`);
    return {
      success: removed,
      handlerId: id,
      totalHandlers: this.interceptHandlers.size,
      timestamp: new Date().toISOString()
    };
  }

  async blockRequests(patterns, reason = 'blocked') {
    const handlerId = `block-${Date.now()}`;
    
    const handler = (interceptedRequest, requestData) => {
      const url = interceptedRequest.url();
      
      for (const pattern of patterns) {
        if (typeof pattern === 'string') {
          if (url.includes(pattern)) {
            return { action: 'abort', reason };
          }
        } else if (pattern instanceof RegExp) {
          if (pattern.test(url)) {
            return { action: 'abort', reason };
          }
        }
      }
      
      return null; // Continue request
    };

    return this.addInterceptHandler(handlerId, handler);
  }

  async blockResourceTypes(resourceTypes, reason = 'resource type blocked') {
    const handlerId = `block-resource-${Date.now()}`;
    
    const handler = (interceptedRequest, requestData) => {
      const resourceType = interceptedRequest.resourceType();
      
      if (resourceTypes.includes(resourceType)) {
        return { action: 'abort', reason };
      }
      
      return null; // Continue request
    };

    return this.addInterceptHandler(handlerId, handler);
  }

  async modifyHeaders(urlPattern, headerModifications) {
    const handlerId = `modify-headers-${Date.now()}`;
    
    const handler = (interceptedRequest, requestData) => {
      const url = interceptedRequest.url();
      
      if (typeof urlPattern === 'string' && url.includes(urlPattern)) {
        const overrides = interceptedRequest.continueRequestOverrides();
        overrides.headers = { ...overrides.headers, ...headerModifications };
        return { action: 'continue', overrides };
      } else if (urlPattern instanceof RegExp && urlPattern.test(url)) {
        const overrides = interceptedRequest.continueRequestOverrides();
        overrides.headers = { ...overrides.headers, ...headerModifications };
        return { action: 'continue', overrides };
      }
      
      return null; // Continue request
    };

    return this.addInterceptHandler(handlerId, handler);
  }

  async mockResponse(urlPattern, mockData) {
    const handlerId = `mock-response-${Date.now()}`;
    
    const handler = (interceptedRequest, requestData) => {
      const url = interceptedRequest.url();
      
      if (typeof urlPattern === 'string' && url.includes(urlPattern)) {
        return {
          action: 'respond',
          response: {
            status: mockData.status || 200,
            headers: mockData.headers || { 'Content-Type': 'application/json' },
            body: typeof mockData.body === 'string' ? mockData.body : JSON.stringify(mockData.body)
          }
        };
      } else if (urlPattern instanceof RegExp && urlPattern.test(url)) {
        return {
          action: 'respond',
          response: {
            status: mockData.status || 200,
            headers: mockData.headers || { 'Content-Type': 'application/json' },
            body: typeof mockData.body === 'string' ? mockData.body : JSON.stringify(mockData.body)
          }
        };
      }
      
      return null; // Continue request
    };

    return this.addInterceptHandler(handlerId, handler);
  }

  async throttleRequests(urlPattern, delay = 1000) {
    const handlerId = `throttle-${Date.now()}`;
    
    const handler = async (interceptedRequest, requestData) => {
      const url = interceptedRequest.url();
      
      if (typeof urlPattern === 'string' && url.includes(urlPattern)) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return { action: 'continue' };
      } else if (urlPattern instanceof RegExp && urlPattern.test(url)) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return { action: 'continue' };
      }
      
      return null; // Continue request
    };

    return this.addInterceptHandler(handlerId, handler);
  }

  async disableInterception() {
    try {
      console.log('🔓 Disabling request interception...');
      
      await this.page.setRequestInterception(false);
      this.interceptionEnabled = false;
      this.interceptHandlers.clear();
      
      return {
        success: true,
        message: 'Request interception disabled',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  getRequestLog() {
    return {
      success: true,
      requests: this.requestLog,
      count: this.requestLog.length,
      timestamp: new Date().toISOString()
    };
  }

  getResponseLog() {
    return {
      success: true,
      responses: this.responseLog,
      count: this.responseLog.length,
      timestamp: new Date().toISOString()
    };
  }

  getBlockedRequests() {
    return {
      success: true,
      blocked: this.blockedRequests,
      count: this.blockedRequests.length,
      timestamp: new Date().toISOString()
    };
  }

  getModifiedRequests() {
    return {
      success: true,
      modified: this.modifiedRequests,
      count: this.modifiedRequests.length,
      timestamp: new Date().toISOString()
    };
  }

  clearLogs() {
    this.requestLog = [];
    this.responseLog = [];
    this.blockedRequests = [];
    this.modifiedRequests = [];
    
    return {
      success: true,
      message: 'All network logs cleared',
      timestamp: new Date().toISOString()
    };
  }

  async close() {
    if (this.interceptionEnabled) {
      await this.disableInterception();
    }
    
    if (this.browser) {
      await this.browser.close();
      this.isInitialized = false;
      console.log('🔒 Network Interception Service closed');
    }
  }
}

export { NetworkInterceptionService };
