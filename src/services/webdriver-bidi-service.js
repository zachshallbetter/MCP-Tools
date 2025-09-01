import puppeteer from 'puppeteer-core';

class WebDriverBiDiService {
  constructor() {
    this.browser = null;
    this.page = null;
    this.isInitialized = false;
    this.bidiConnection = null;
    this.sessionId = null;
    this.contextId = null;
    this.eventListeners = new Map();
    this.subscriptions = new Map();
  }

  async initialize() {
    if (this.isInitialized) return;
    
    console.log('🌐 Initializing WebDriver BiDi Service...');
    
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
        '--ignore-ssl-errors',
        '--remote-debugging-port=9222'
      ]
    });

    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1920, height: 1080 });
    
    // Connect to WebDriver BiDi
    await this.connectBiDi();
    
    this.isInitialized = true;
    console.log('✅ WebDriver BiDi Service initialized');
  }

  async connectBiDi() {
    try {
      console.log('🔗 Connecting to WebDriver BiDi...');
      
      // Get the WebSocket URL for BiDi connection
      const targets = await this.browser.targets();
      const target = targets.find(t => t.type() === 'page');
      
      if (!target) {
        throw new Error('No page target found for BiDi connection');
      }

      // Create BiDi connection
      this.bidiConnection = await target.createBiDiConnection();
      
      // Create a new session
      const sessionResult = await this.bidiConnection.send('session.new', {
        capabilities: {
          alwaysMatch: {
            acceptInsecureCerts: true,
            browserName: 'chromium',
            browserVersion: 'latest'
          }
        }
      });

      this.sessionId = sessionResult.result.sessionId;
      console.log(`📋 BiDi session created: ${this.sessionId}`);

      // Subscribe to events
      await this.subscribeToEvents();

      return {
        success: true,
        sessionId: this.sessionId,
        message: 'WebDriver BiDi connection established',
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

  async subscribeToEvents() {
    try {
      console.log('📡 Subscribing to BiDi events...');
      
      // Subscribe to browsing context events
      await this.bidiConnection.send('session.subscribe', {
        events: [
          'browsingContext.contextCreated',
          'browsingContext.contextDestroyed',
          'browsingContext.navigationStarted',
          'browsingContext.load',
          'browsingContext.domContentLoaded',
          'log.entryAdded',
          'script.message',
          'script.realmCreated',
          'script.realmDestroyed'
        ]
      });

      // Set up event listeners
      this.bidiConnection.on('message', (message) => {
        this.handleBiDiEvent(message);
      });

      return {
        success: true,
        message: 'Subscribed to BiDi events',
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

  handleBiDiEvent(message) {
    try {
      const { method, params } = message;
      
      console.log(`📨 BiDi Event: ${method}`);
      
      // Store event for later retrieval
      if (!this.eventListeners.has(method)) {
        this.eventListeners.set(method, []);
      }
      this.eventListeners.get(method).push({
        ...message,
        timestamp: new Date().toISOString()
      });

      // Handle specific events
      switch (method) {
        case 'browsingContext.contextCreated':
          this.handleContextCreated(params);
          break;
        case 'browsingContext.load':
          this.handlePageLoad(params);
          break;
        case 'log.entryAdded':
          this.handleLogEntry(params);
          break;
        case 'script.message':
          this.handleScriptMessage(params);
          break;
      }
    } catch (error) {
      console.error('Error handling BiDi event:', error);
    }
  }

  handleContextCreated(params) {
    console.log(`🌐 New browsing context created: ${params.context}`);
    this.contextId = params.context;
  }

  handlePageLoad(params) {
    console.log(`📄 Page loaded: ${params.context}`);
  }

  handleLogEntry(params) {
    console.log(`📝 Log entry: ${params.level} - ${params.text}`);
  }

  handleScriptMessage(params) {
    console.log(`💬 Script message: ${params.data}`);
  }

  async createBrowsingContext(url = null) {
    if (!this.bidiConnection) {
      throw new Error('BiDi connection not established');
    }

    try {
      console.log('🌐 Creating browsing context...');
      
      const result = await this.bidiConnection.send('browsingContext.create', {
        type: 'tab'
      });

      this.contextId = result.result.context;
      
      if (url) {
        await this.navigateTo(url);
      }

      return {
        success: true,
        contextId: this.contextId,
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

  async navigateTo(url) {
    if (!this.bidiConnection || !this.contextId) {
      throw new Error('BiDi connection or context not established');
    }

    try {
      console.log(`🧭 Navigating to: ${url}`);
      
      const result = await this.bidiConnection.send('browsingContext.navigate', {
        context: this.contextId,
        url: url,
        wait: 'complete'
      });

      return {
        success: true,
        navigationId: result.result.navigation,
        url: url,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        url: url,
        timestamp: new Date().toISOString()
      };
    }
  }

  async captureScreenshot() {
    if (!this.bidiConnection || !this.contextId) {
      throw new Error('BiDi connection or context not established');
    }

    try {
      console.log('📸 Taking screenshot via BiDi...');
      
      const result = await this.bidiConnection.send('browsingContext.captureScreenshot', {
        context: this.contextId
      });

      return {
        success: true,
        data: result.result.data,
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

  async evaluateScript(script, awaitPromise = true) {
    if (!this.bidiConnection || !this.contextId) {
      throw new Error('BiDi connection or context not established');
    }

    try {
      console.log(`🔍 Evaluating script via BiDi: ${script.substring(0, 100)}...`);
      
      const result = await this.bidiConnection.send('script.evaluate', {
        expression: script,
        target: { context: this.contextId },
        awaitPromise: awaitPromise
      });

      return {
        success: true,
        result: result.result.result,
        realmId: result.result.realm,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        script: script,
        timestamp: new Date().toISOString()
      };
    }
  }

  async addPreloadScript(script) {
    if (!this.bidiConnection) {
      throw new Error('BiDi connection not established');
    }

    try {
      console.log(`📜 Adding preload script via BiDi...`);
      
      const result = await this.bidiConnection.send('script.addPreloadScript', {
        functionDeclaration: script
      });

      return {
        success: true,
        scriptId: result.result.script,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        script: script,
        timestamp: new Date().toISOString()
      };
    }
  }

  async locateNodes(selector, maxNodeCount = 100) {
    if (!this.bidiConnection || !this.contextId) {
      throw new Error('BiDi connection or context not established');
    }

    try {
      console.log(`🎯 Locating nodes via BiDi: ${selector}`);
      
      const result = await this.bidiConnection.send('browsingContext.locateNodes', {
        context: this.contextId,
        locator: { type: 'css', value: selector },
        maxNodeCount: maxNodeCount
      });

      return {
        success: true,
        nodes: result.result.nodes,
        count: result.result.nodes.length,
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

  async getTree() {
    if (!this.bidiConnection) {
      throw new Error('BiDi connection not established');
    }

    try {
      console.log('🌳 Getting browsing context tree via BiDi...');
      
      const result = await this.bidiConnection.send('browsingContext.getTree', {});

      return {
        success: true,
        contexts: result.result.contexts,
        count: result.result.contexts.length,
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

  async getRealms() {
    if (!this.bidiConnection) {
      throw new Error('BiDi connection not established');
    }

    try {
      console.log('🏰 Getting realms via BiDi...');
      
      const result = await this.bidiConnection.send('script.getRealms', {});

      return {
        success: true,
        realms: result.result.realms,
        count: result.result.realms.length,
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

  async setViewport(width, height) {
    if (!this.bidiConnection || !this.contextId) {
      throw new Error('BiDi connection or context not established');
    }

    try {
      console.log(`📐 Setting viewport via BiDi: ${width}x${height}`);
      
      const result = await this.bidiConnection.send('browsingContext.setViewport', {
        context: this.contextId,
        viewport: {
          width: width,
          height: height
        }
      });

      return {
        success: true,
        viewport: { width, height },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        viewport: { width, height },
        timestamp: new Date().toISOString()
      };
    }
  }

  async closeContext() {
    if (!this.bidiConnection || !this.contextId) {
      throw new Error('BiDi connection or context not established');
    }

    try {
      console.log(`🔒 Closing browsing context: ${this.contextId}`);
      
      await this.bidiConnection.send('browsingContext.close', {
        context: this.contextId
      });

      this.contextId = null;

      return {
        success: true,
        message: 'Browsing context closed',
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

  async endSession() {
    if (!this.bidiConnection || !this.sessionId) {
      throw new Error('BiDi connection or session not established');
    }

    try {
      console.log(`🔚 Ending BiDi session: ${this.sessionId}`);
      
      await this.bidiConnection.send('session.end', {});
      
      this.sessionId = null;
      this.contextId = null;

      return {
        success: true,
        message: 'BiDi session ended',
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

  getEvents(method = null) {
    if (method) {
      return {
        success: true,
        events: this.eventListeners.get(method) || [],
        count: (this.eventListeners.get(method) || []).length,
        method: method,
        timestamp: new Date().toISOString()
      };
    }

    const allEvents = [];
    for (const [method, events] of this.eventListeners) {
      allEvents.push(...events);
    }

    return {
      success: true,
      events: allEvents,
      count: allEvents.length,
      methods: Array.from(this.eventListeners.keys()),
      timestamp: new Date().toISOString()
    };
  }

  clearEvents() {
    this.eventListeners.clear();
    return {
      success: true,
      message: 'All BiDi events cleared',
      timestamp: new Date().toISOString()
    };
  }

  async close() {
    if (this.bidiConnection) {
      await this.endSession();
      this.bidiConnection.disconnect();
    }
    
    if (this.browser) {
      await this.browser.close();
      this.isInitialized = false;
      console.log('🔒 WebDriver BiDi Service closed');
    }
  }
}

export { WebDriverBiDiService };
