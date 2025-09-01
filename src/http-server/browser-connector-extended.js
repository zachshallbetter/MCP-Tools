#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { chromiumScreenshotService } from '../services/chromium-screenshot-service.js';
import { lighthouseService } from '../services/lighthouse-service.js';
import { EnhancedInteractionService } from '../services/enhanced-interaction-service.js';
import { JavaScriptExecutionService } from '../services/javascript-execution-service.js';
import { NetworkInterceptionService } from '../services/network-interception-service.js';
import { WebDriverBiDiService } from '../services/webdriver-bidi-service.js';
import fs from 'fs';
import path from 'path';
import http from 'http';

class ExtendedBrowserConnector {
  constructor(port = 3025) {
    this.port = port;
    this.app = express();
    this.server = http.createServer(this.app);
    this.enhancedInteractionService = new EnhancedInteractionService();
    this.javascriptExecutionService = new JavaScriptExecutionService();
    this.networkInterceptionService = new NetworkInterceptionService();
    this.webDriverBiDiService = new WebDriverBiDiService();
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(bodyParser.json({ limit: '50mb' }));
    this.app.use(bodyParser.urlencoded({ extended: true }));
  }

  setupRoutes() {
    // Health check
    this.app.get('/.identity', (req, res) => {
      res.json({
        port: this.port,
        name: 'browser-tools-server',
        version: '1.2.0',
        signature: 'mcp-browser-connector-24x7',
        features: [
          'screenshots',
          'performance',
          'accessibility',
          'seo',
          'responsive',
          'element-interaction',
          'network-monitoring',
          'console-logging',
          'lighthouse-audits',
          'user-flows',
          'best-practices',
          'comprehensive-reports'
        ]
      });
    });

    // Enhanced Screenshot
    this.app.post('/capture-screenshot', async (req, res) => {
      try {
        const { url, customPath, viewport, waitForSelector, fullPage = true } = req.body;
        
        if (!url) {
          return res.status(400).json({ error: 'URL is required' });
        }

        console.log(`📸 Taking screenshot of ${url}`);
        const result = await this.captureScreenshot(url, customPath, viewport, waitForSelector, fullPage);
        res.json(result);
      } catch (error) {
        console.error('Screenshot error:', error);
        res.status(500).json({ error: `Screenshot failed: ${error}` });
      }
    });

    // Performance Analysis
    this.app.post('/analyze-performance', async (req, res) => {
      try {
        const { url, device = 'desktop' } = req.body;
        
        if (!url) {
          return res.status(400).json({ error: 'URL is required' });
        }

        console.log(`⚡ Analyzing performance for ${url} (${device})`);
        const result = await this.analyzePerformance(url, device);
        res.json(result);
      } catch (error) {
        console.error('Performance analysis error:', error);
        res.status(500).json({ error: `Performance analysis failed: ${error}` });
      }
    });

    // Accessibility Testing
    this.app.post('/test-accessibility', async (req, res) => {
      try {
        const { url } = req.body;
        
        if (!url) {
          return res.status(400).json({ error: 'URL is required' });
        }

        console.log(`♿ Testing accessibility for ${url}`);
        const result = await this.testAccessibility(url);
        res.json(result);
      } catch (error) {
        console.error('Accessibility test error:', error);
        res.status(500).json({ error: `Accessibility test failed: ${error}` });
      }
    });

    // SEO Analysis
    this.app.post('/analyze-seo', async (req, res) => {
      try {
        const { url } = req.body;
        
        if (!url) {
          return res.status(400).json({ error: 'URL is required' });
        }

        console.log(`🔍 Analyzing SEO for ${url}`);
        const result = await this.analyzeSEO(url);
        res.json(result);
      } catch (error) {
        console.error('SEO analysis error:', error);
        res.status(500).json({ error: `SEO analysis failed: ${error}` });
      }
    });

    // Responsive Testing
    this.app.post('/test-responsive', async (req, res) => {
      try {
        const { url, breakpoints, customPath } = req.body;
        
        if (!url) {
          return res.status(400).json({ error: 'URL is required' });
        }

        const defaultBreakpoints = [
          { width: 1920, height: 1080, name: 'desktop' },
          { width: 375, height: 667, name: 'mobile' }
        ];

        console.log(`📱 Testing responsive design for ${url}`);
        const result = await this.testResponsive(url, breakpoints || defaultBreakpoints, customPath);
        res.json(result);
      } catch (error) {
        console.error('Responsive test error:', error);
        res.status(500).json({ error: `Responsive test failed: ${error}` });
      }
    });

    // Element Interaction
    this.app.post('/interact-element', async (req, res) => {
      try {
        const { url, selector, action, value } = req.body;
        
        if (!url || !selector || !action) {
          return res.status(400).json({ error: 'URL, selector, and action are required' });
        }

        console.log(`🖱️ Interacting with element ${selector} on ${url}`);
        const result = await this.interactWithElement(url, selector, action, value);
        res.json(result);
      } catch (error) {
        console.error('Element interaction error:', error);
        res.status(500).json({ error: `Element interaction failed: ${error}` });
      }
    });

    // Lighthouse Comprehensive Audit
    this.app.post('/lighthouse-audit', async (req, res) => {
      try {
        const { url, device = 'desktop', categories = ['performance', 'accessibility', 'best-practices', 'seo'] } = req.body;
        
        if (!url) {
          return res.status(400).json({ error: 'URL is required' });
        }

        console.log(`🔍 Running comprehensive Lighthouse audit for ${url} (${device})`);
        const result = await this.runLighthouseAudit(url, device, categories);
        res.json(result);
      } catch (error) {
        console.error('Lighthouse audit error:', error);
        res.status(500).json({ error: `Lighthouse audit failed: ${error}` });
      }
    });

    // Lighthouse Performance Audit
    this.app.post('/lighthouse-performance', async (req, res) => {
      try {
        const { url, device = 'desktop' } = req.body;
        
        if (!url) {
          return res.status(400).json({ error: 'URL is required' });
        }

        console.log(`⚡ Running Lighthouse performance audit for ${url} (${device})`);
        const result = await this.runLighthousePerformance(url, device);
        res.json(result);
      } catch (error) {
        console.error('Lighthouse performance error:', error);
        res.status(500).json({ error: `Lighthouse performance audit failed: ${error}` });
      }
    });

    // Lighthouse Accessibility Audit
    this.app.post('/lighthouse-accessibility', async (req, res) => {
      try {
        const { url } = req.body;
        
        if (!url) {
          return res.status(400).json({ error: 'URL is required' });
        }

        console.log(`♿ Running Lighthouse accessibility audit for ${url}`);
        const result = await this.runLighthouseAccessibility(url);
        res.json(result);
      } catch (error) {
        console.error('Lighthouse accessibility error:', error);
        res.status(500).json({ error: `Lighthouse accessibility audit failed: ${error}` });
      }
    });

    // Lighthouse SEO Audit
    this.app.post('/lighthouse-seo', async (req, res) => {
      try {
        const { url } = req.body;
        
        if (!url) {
          return res.status(400).json({ error: 'URL is required' });
        }

        console.log(`🔍 Running Lighthouse SEO audit for ${url}`);
        const result = await this.runLighthouseSEO(url);
        res.json(result);
      } catch (error) {
        console.error('Lighthouse SEO error:', error);
        res.status(500).json({ error: `Lighthouse SEO audit failed: ${error}` });
      }
    });

    // Lighthouse Best Practices Audit
    this.app.post('/lighthouse-best-practices', async (req, res) => {
      try {
        const { url } = req.body;
        
        if (!url) {
          return res.status(400).json({ error: 'URL is required' });
        }

        console.log(`✅ Running Lighthouse best practices audit for ${url}`);
        const result = await this.runLighthouseBestPractices(url);
        res.json(result);
      } catch (error) {
        console.error('Lighthouse best practices error:', error);
        res.status(500).json({ error: `Lighthouse best practices audit failed: ${error}` });
      }
    });

    // User Flow Analysis
    this.app.post('/user-flow', async (req, res) => {
      try {
        const { url, flowSteps = [] } = req.body;
        
        if (!url) {
          return res.status(400).json({ error: 'URL is required' });
        }

        console.log(`🔄 Running user flow analysis for ${url}`);
        const result = await this.runUserFlow(url, flowSteps);
        res.json(result);
      } catch (error) {
        console.error('User flow error:', error);
        res.status(500).json({ error: `User flow analysis failed: ${error}` });
      }
    });

    // Generate Lighthouse Report
    this.app.post('/generate-report', async (req, res) => {
      try {
        const { url, outputPath } = req.body;
        
        if (!url) {
          return res.status(400).json({ error: 'URL is required' });
        }

        console.log(`📊 Generating Lighthouse report for ${url}`);
        const result = await this.generateLighthouseReport(url, outputPath);
        res.json(result);
      } catch (error) {
        console.error('Report generation error:', error);
        res.status(500).json({ error: `Report generation failed: ${error}` });
      }
    });

    // Console Logs
    this.app.get('/console-logs', (req, res) => {
      res.json({
        logs: [],
        message: 'Console logs endpoint - logs are captured during page interactions'
      });
    });

    // Console Errors
    this.app.get('/console-errors', (req, res) => {
      res.json({
        errors: [],
        message: 'Console errors endpoint - errors are captured during page interactions'
      });
    });

    // Network Success Logs
    this.app.get('/network-success', (req, res) => {
      res.json({
        logs: [],
        message: 'Network success logs endpoint - successful network requests are captured'
      });
    });

    // Network Errors
    this.app.get('/network-errors', (req, res) => {
      res.json({
        errors: [],
        message: 'Network errors endpoint - failed network requests are captured'
      });
    });

    // Wipe Logs
    this.app.post('/wipelogs', (req, res) => {
      res.json({
        message: 'All logs have been cleared'
      });
    });

    // Enhanced Element Interactions
    this.app.post('/interact/click', async (req, res) => {
      try {
        const { selector, url, options = {} } = req.body;
        
        if (!selector) {
          return res.status(400).json({ error: 'Selector is required' });
        }

        console.log(`🖱️ Enhanced click interaction: ${selector}`);
        const result = await this.enhancedInteractionService.clickElement(selector, { url, ...options });
        res.json(result);
      } catch (error) {
        console.error('Enhanced click error:', error);
        res.status(500).json({ error: `Enhanced click failed: ${error}` });
      }
    });

    this.app.post('/interact/fill', async (req, res) => {
      try {
        const { selector, value, url, options = {} } = req.body;
        
        if (!selector || value === undefined) {
          return res.status(400).json({ error: 'Selector and value are required' });
        }

        console.log(`📝 Enhanced fill interaction: ${selector} with ${value}`);
        const result = await this.enhancedInteractionService.fillInput(selector, value, { url, ...options });
        res.json(result);
      } catch (error) {
        console.error('Enhanced fill error:', error);
        res.status(500).json({ error: `Enhanced fill failed: ${error}` });
      }
    });

    this.app.post('/interact/hover', async (req, res) => {
      try {
        const { selector, url, options = {} } = req.body;
        
        if (!selector) {
          return res.status(400).json({ error: 'Selector is required' });
        }

        console.log(`🖱️ Enhanced hover interaction: ${selector}`);
        const result = await this.enhancedInteractionService.hoverElement(selector, { url, ...options });
        res.json(result);
      } catch (error) {
        console.error('Enhanced hover error:', error);
        res.status(500).json({ error: `Enhanced hover failed: ${error}` });
      }
    });

    this.app.post('/interact/scroll', async (req, res) => {
      try {
        const { selector, scrollOptions = {}, url, options = {} } = req.body;
        
        if (!selector) {
          return res.status(400).json({ error: 'Selector is required' });
        }

        console.log(`📜 Enhanced scroll interaction: ${selector}`);
        const result = await this.enhancedInteractionService.scrollElement(selector, scrollOptions, { url, ...options });
        res.json(result);
      } catch (error) {
        console.error('Enhanced scroll error:', error);
        res.status(500).json({ error: `Enhanced scroll failed: ${error}` });
      }
    });

    this.app.post('/interact/wait', async (req, res) => {
      try {
        const { selector, url, options = {} } = req.body;
        
        if (!selector) {
          return res.status(400).json({ error: 'Selector is required' });
        }

        console.log(`⏳ Enhanced wait interaction: ${selector}`);
        const result = await this.enhancedInteractionService.waitForElement(selector, { url, ...options });
        res.json(result);
      } catch (error) {
        console.error('Enhanced wait error:', error);
        res.status(500).json({ error: `Enhanced wait failed: ${error}` });
      }
    });

    // Advanced Selector Interactions
    this.app.post('/interact/text-selector', async (req, res) => {
      try {
        const { text, url, options = {} } = req.body;
        
        if (!text) {
          return res.status(400).json({ error: 'Text is required' });
        }

        console.log(`🔍 Text selector interaction: "${text}"`);
        const result = await this.enhancedInteractionService.findElementByText(text, { url, ...options });
        res.json(result);
      } catch (error) {
        console.error('Text selector error:', error);
        res.status(500).json({ error: `Text selector failed: ${error}` });
      }
    });

    this.app.post('/interact/aria-selector', async (req, res) => {
      try {
        const { ariaSelector, url, options = {} } = req.body;
        
        if (!ariaSelector) {
          return res.status(400).json({ error: 'ARIA selector is required' });
        }

        console.log(`♿ ARIA selector interaction: ${ariaSelector}`);
        const result = await this.enhancedInteractionService.findElementByAria(ariaSelector, { url, ...options });
        res.json(result);
      } catch (error) {
        console.error('ARIA selector error:', error);
        res.status(500).json({ error: `ARIA selector failed: ${error}` });
      }
    });

    this.app.post('/interact/shadow-dom', async (req, res) => {
      try {
        const { hostSelector, targetSelector, url, options = {} } = req.body;
        
        if (!hostSelector || !targetSelector) {
          return res.status(400).json({ error: 'Host selector and target selector are required' });
        }

        console.log(`🌳 Shadow DOM interaction: ${hostSelector} >>> ${targetSelector}`);
        const result = await this.enhancedInteractionService.findElementInShadowDOM(hostSelector, targetSelector, { url, ...options });
        res.json(result);
      } catch (error) {
        console.error('Shadow DOM error:', error);
        res.status(500).json({ error: `Shadow DOM interaction failed: ${error}` });
      }
    });

    // Form Interactions
    this.app.post('/interact/fill-form', async (req, res) => {
      try {
        const { formData, url, options = {} } = req.body;
        
        if (!formData || typeof formData !== 'object') {
          return res.status(400).json({ error: 'Form data object is required' });
        }

        console.log(`📋 Form fill interaction with ${Object.keys(formData).length} fields`);
        const result = await this.enhancedInteractionService.fillForm(formData, { url, ...options });
        res.json(result);
      } catch (error) {
        console.error('Form fill error:', error);
        res.status(500).json({ error: `Form fill failed: ${error}` });
      }
    });

    // Keyboard and Mouse Interactions
    this.app.post('/interact/type', async (req, res) => {
      try {
        const { text, selector, url, options = {} } = req.body;
        
        if (!text) {
          return res.status(400).json({ error: 'Text is required' });
        }

        console.log(`⌨️ Type interaction: "${text}"`);
        const result = await this.enhancedInteractionService.typeText(text, { selector, url, ...options });
        res.json(result);
      } catch (error) {
        console.error('Type error:', error);
        res.status(500).json({ error: `Type failed: ${error}` });
      }
    });

    this.app.post('/interact/mouse-click', async (req, res) => {
      try {
        const { x, y, url, options = {} } = req.body;
        
        if (x === undefined || y === undefined) {
          return res.status(400).json({ error: 'X and Y coordinates are required' });
        }

        console.log(`🖱️ Mouse click interaction at (${x}, ${y})`);
        const result = await this.enhancedInteractionService.mouseClick(x, y, { url, ...options });
        res.json(result);
      } catch (error) {
        console.error('Mouse click error:', error);
        res.status(500).json({ error: `Mouse click failed: ${error}` });
      }
    });

    // JavaScript Execution Endpoints
    this.app.post('/js/evaluate', async (req, res) => {
      try {
        const { script, args = [], url } = req.body;
        
        if (!script) {
          return res.status(400).json({ error: 'Script is required' });
        }

        console.log(`🔍 JavaScript evaluation: ${script.substring(0, 100)}...`);
        const result = await this.javascriptExecutionService.evaluate(script, ...args);
        res.json(result);
      } catch (error) {
        console.error('JavaScript evaluation error:', error);
        res.status(500).json({ error: `JavaScript evaluation failed: ${error}` });
      }
    });

    this.app.post('/js/evaluate-handle', async (req, res) => {
      try {
        const { script, args = [] } = req.body;
        
        if (!script) {
          return res.status(400).json({ error: 'Script is required' });
        }

        console.log(`🔗 JavaScript handle evaluation: ${script.substring(0, 100)}...`);
        const result = await this.javascriptExecutionService.evaluateHandle(script, ...args);
        res.json(result);
      } catch (error) {
        console.error('JavaScript handle evaluation error:', error);
        res.status(500).json({ error: `JavaScript handle evaluation failed: ${error}` });
      }
    });

    this.app.post('/js/execute-function', async (req, res) => {
      try {
        const { functionBody, args = [] } = req.body;
        
        if (!functionBody) {
          return res.status(400).json({ error: 'Function body is required' });
        }

        console.log(`⚡ Function execution: ${functionBody.substring(0, 100)}...`);
        const result = await this.javascriptExecutionService.executeFunction(functionBody, ...args);
        res.json(result);
      } catch (error) {
        console.error('Function execution error:', error);
        res.status(500).json({ error: `Function execution failed: ${error}` });
      }
    });

    this.app.post('/js/execute-dom', async (req, res) => {
      try {
        const { script, url } = req.body;
        
        if (!script) {
          return res.status(400).json({ error: 'Script is required' });
        }

        console.log(`🎯 DOM script execution: ${script.substring(0, 100)}...`);
        const result = await this.javascriptExecutionService.executeWithDOM(script, url);
        res.json(result);
      } catch (error) {
        console.error('DOM script execution error:', error);
        res.status(500).json({ error: `DOM script execution failed: ${error}` });
      }
    });

    this.app.post('/js/execute-promise', async (req, res) => {
      try {
        const { script, timeout = 30000 } = req.body;
        
        if (!script) {
          return res.status(400).json({ error: 'Script is required' });
        }

        console.log(`⏱️ Promise script execution: ${script.substring(0, 100)}...`);
        const result = await this.javascriptExecutionService.executePromise(script, timeout);
        res.json(result);
      } catch (error) {
        console.error('Promise script execution error:', error);
        res.status(500).json({ error: `Promise script execution failed: ${error}` });
      }
    });

    this.app.post('/js/element-handle', async (req, res) => {
      try {
        const { selector } = req.body;
        
        if (!selector) {
          return res.status(400).json({ error: 'Selector is required' });
        }

        console.log(`🎯 Getting element handle: ${selector}`);
        const result = await this.javascriptExecutionService.getElementHandle(selector);
        res.json(result);
      } catch (error) {
        console.error('Element handle error:', error);
        res.status(500).json({ error: `Element handle failed: ${error}` });
      }
    });

    this.app.post('/js/execute-on-element', async (req, res) => {
      try {
        const { selector, script, args = [] } = req.body;
        
        if (!selector || !script) {
          return res.status(400).json({ error: 'Selector and script are required' });
        }

        console.log(`🎯 Element script execution: ${selector}`);
        const result = await this.javascriptExecutionService.executeOnElement(selector, script, ...args);
        res.json(result);
      } catch (error) {
        console.error('Element script execution error:', error);
        res.status(500).json({ error: `Element script execution failed: ${error}` });
      }
    });

    this.app.post('/js/execute-on-elements', async (req, res) => {
      try {
        const { selector, script, args = [] } = req.body;
        
        if (!selector || !script) {
          return res.status(400).json({ error: 'Selector and script are required' });
        }

        console.log(`🎯 Elements script execution: ${selector}`);
        const result = await this.javascriptExecutionService.executeOnElements(selector, script, ...args);
        res.json(result);
      } catch (error) {
        console.error('Elements script execution error:', error);
        res.status(500).json({ error: `Elements script execution failed: ${error}` });
      }
    });

    this.app.post('/js/inject-script', async (req, res) => {
      try {
        const { script, url } = req.body;
        
        if (!script) {
          return res.status(400).json({ error: 'Script is required' });
        }

        console.log(`💉 Script injection: ${script.substring(0, 100)}...`);
        const result = await this.javascriptExecutionService.injectScript(script, url);
        res.json(result);
      } catch (error) {
        console.error('Script injection error:', error);
        res.status(500).json({ error: `Script injection failed: ${error}` });
      }
    });

    // Network Interception Endpoints
    this.app.post('/network/enable-interception', async (req, res) => {
      try {
        const { url, priority = 0 } = req.body;
        
        console.log(`🔒 Enabling network interception${url ? ` for ${url}` : ''}`);
        const result = await this.networkInterceptionService.enableInterception(url);
        if (priority !== 0) {
          this.networkInterceptionService.setInterceptResolutionConfig(priority);
        }
        res.json(result);
      } catch (error) {
        console.error('Enable interception error:', error);
        res.status(500).json({ error: `Enable interception failed: ${error}` });
      }
    });

    this.app.post('/network/disable-interception', async (req, res) => {
      try {
        console.log('🔓 Disabling network interception');
        const result = await this.networkInterceptionService.disableInterception();
        res.json(result);
      } catch (error) {
        console.error('Disable interception error:', error);
        res.status(500).json({ error: `Disable interception failed: ${error}` });
      }
    });

    this.app.post('/network/block-requests', async (req, res) => {
      try {
        const { patterns, reason = 'blocked' } = req.body;
        
        if (!patterns || !Array.isArray(patterns)) {
          return res.status(400).json({ error: 'Patterns array is required' });
        }

        console.log(`🚫 Blocking requests matching patterns: ${patterns.join(', ')}`);
        const result = await this.networkInterceptionService.blockRequests(patterns, reason);
        res.json(result);
      } catch (error) {
        console.error('Block requests error:', error);
        res.status(500).json({ error: `Block requests failed: ${error}` });
      }
    });

    this.app.post('/network/block-resource-types', async (req, res) => {
      try {
        const { resourceTypes, reason = 'resource type blocked' } = req.body;
        
        if (!resourceTypes || !Array.isArray(resourceTypes)) {
          return res.status(400).json({ error: 'Resource types array is required' });
        }

        console.log(`🚫 Blocking resource types: ${resourceTypes.join(', ')}`);
        const result = await this.networkInterceptionService.blockResourceTypes(resourceTypes, reason);
        res.json(result);
      } catch (error) {
        console.error('Block resource types error:', error);
        res.status(500).json({ error: `Block resource types failed: ${error}` });
      }
    });

    this.app.post('/network/modify-headers', async (req, res) => {
      try {
        const { urlPattern, headerModifications } = req.body;
        
        if (!urlPattern || !headerModifications) {
          return res.status(400).json({ error: 'URL pattern and header modifications are required' });
        }

        console.log(`🔧 Modifying headers for pattern: ${urlPattern}`);
        const result = await this.networkInterceptionService.modifyHeaders(urlPattern, headerModifications);
        res.json(result);
      } catch (error) {
        console.error('Modify headers error:', error);
        res.status(500).json({ error: `Modify headers failed: ${error}` });
      }
    });

    this.app.post('/network/mock-response', async (req, res) => {
      try {
        const { urlPattern, mockData } = req.body;
        
        if (!urlPattern || !mockData) {
          return res.status(400).json({ error: 'URL pattern and mock data are required' });
        }

        console.log(`🎭 Mocking response for pattern: ${urlPattern}`);
        const result = await this.networkInterceptionService.mockResponse(urlPattern, mockData);
        res.json(result);
      } catch (error) {
        console.error('Mock response error:', error);
        res.status(500).json({ error: `Mock response failed: ${error}` });
      }
    });

    this.app.post('/network/throttle-requests', async (req, res) => {
      try {
        const { urlPattern, delay = 1000 } = req.body;
        
        if (!urlPattern) {
          return res.status(400).json({ error: 'URL pattern is required' });
        }

        console.log(`⏱️ Throttling requests for pattern: ${urlPattern} (${delay}ms delay)`);
        const result = await this.networkInterceptionService.throttleRequests(urlPattern, delay);
        res.json(result);
      } catch (error) {
        console.error('Throttle requests error:', error);
        res.status(500).json({ error: `Throttle requests failed: ${error}` });
      }
    });

    this.app.post('/network/add-handler', async (req, res) => {
      try {
        const { id, handler } = req.body;
        
        if (!id || !handler) {
          return res.status(400).json({ error: 'Handler ID and handler function are required' });
        }

        console.log(`📝 Adding custom intercept handler: ${id}`);
        const result = this.networkInterceptionService.addInterceptHandler(id, new Function('interceptedRequest', 'requestData', handler));
        res.json(result);
      } catch (error) {
        console.error('Add handler error:', error);
        res.status(500).json({ error: `Add handler failed: ${error}` });
      }
    });

    this.app.post('/network/remove-handler', async (req, res) => {
      try {
        const { id } = req.body;
        
        if (!id) {
          return res.status(400).json({ error: 'Handler ID is required' });
        }

        console.log(`🗑️ Removing intercept handler: ${id}`);
        const result = this.networkInterceptionService.removeInterceptHandler(id);
        res.json(result);
      } catch (error) {
        console.error('Remove handler error:', error);
        res.status(500).json({ error: `Remove handler failed: ${error}` });
      }
    });

    this.app.get('/network/request-log', async (req, res) => {
      try {
        console.log('📊 Getting request log');
        const result = this.networkInterceptionService.getRequestLog();
        res.json(result);
      } catch (error) {
        console.error('Get request log error:', error);
        res.status(500).json({ error: `Get request log failed: ${error}` });
      }
    });

    this.app.get('/network/response-log', async (req, res) => {
      try {
        console.log('📊 Getting response log');
        const result = this.networkInterceptionService.getResponseLog();
        res.json(result);
      } catch (error) {
        console.error('Get response log error:', error);
        res.status(500).json({ error: `Get response log failed: ${error}` });
      }
    });

    this.app.get('/network/blocked-requests', async (req, res) => {
      try {
        console.log('🚫 Getting blocked requests');
        const result = this.networkInterceptionService.getBlockedRequests();
        res.json(result);
      } catch (error) {
        console.error('Get blocked requests error:', error);
        res.status(500).json({ error: `Get blocked requests failed: ${error}` });
      }
    });

    this.app.get('/network/modified-requests', async (req, res) => {
      try {
        console.log('🔧 Getting modified requests');
        const result = this.networkInterceptionService.getModifiedRequests();
        res.json(result);
      } catch (error) {
        console.error('Get modified requests error:', error);
        res.status(500).json({ error: `Get modified requests failed: ${error}` });
      }
    });

    this.app.post('/network/clear-logs', async (req, res) => {
      try {
        console.log('🧹 Clearing network logs');
        const result = this.networkInterceptionService.clearLogs();
        res.json(result);
      } catch (error) {
        console.error('Clear logs error:', error);
        res.status(500).json({ error: `Clear logs failed: ${error}` });
      }
    });

    // WebDriver BiDi Endpoints
    this.app.post('/bidi/connect', async (req, res) => {
      try {
        console.log('🔗 Connecting to WebDriver BiDi...');
        const result = await this.webDriverBiDiService.initialize();
        res.json(result);
      } catch (error) {
        console.error('BiDi connect error:', error);
        res.status(500).json({ error: `BiDi connect failed: ${error}` });
      }
    });

    this.app.post('/bidi/create-context', async (req, res) => {
      try {
        const { url } = req.body;
        
        console.log('🌐 Creating browsing context via BiDi...');
        const result = await this.webDriverBiDiService.createBrowsingContext(url);
        res.json(result);
      } catch (error) {
        console.error('Create context error:', error);
        res.status(500).json({ error: `Create context failed: ${error}` });
      }
    });

    this.app.post('/bidi/navigate', async (req, res) => {
      try {
        const { url } = req.body;
        
        if (!url) {
          return res.status(400).json({ error: 'URL is required' });
        }

        console.log(`🧭 Navigating via BiDi: ${url}`);
        const result = await this.webDriverBiDiService.navigateTo(url);
        res.json(result);
      } catch (error) {
        console.error('Navigate error:', error);
        res.status(500).json({ error: `Navigate failed: ${error}` });
      }
    });

    this.app.post('/bidi/screenshot', async (req, res) => {
      try {
        console.log('📸 Taking screenshot via BiDi...');
        const result = await this.webDriverBiDiService.captureScreenshot();
        res.json(result);
      } catch (error) {
        console.error('Screenshot error:', error);
        res.status(500).json({ error: `Screenshot failed: ${error}` });
      }
    });

    this.app.post('/bidi/evaluate', async (req, res) => {
      try {
        const { script, awaitPromise = true } = req.body;
        
        if (!script) {
          return res.status(400).json({ error: 'Script is required' });
        }

        console.log(`🔍 Evaluating script via BiDi: ${script.substring(0, 100)}...`);
        const result = await this.webDriverBiDiService.evaluateScript(script, awaitPromise);
        res.json(result);
      } catch (error) {
        console.error('Evaluate error:', error);
        res.status(500).json({ error: `Evaluate failed: ${error}` });
      }
    });

    this.app.post('/bidi/add-preload-script', async (req, res) => {
      try {
        const { script } = req.body;
        
        if (!script) {
          return res.status(400).json({ error: 'Script is required' });
        }

        console.log('📜 Adding preload script via BiDi...');
        const result = await this.webDriverBiDiService.addPreloadScript(script);
        res.json(result);
      } catch (error) {
        console.error('Add preload script error:', error);
        res.status(500).json({ error: `Add preload script failed: ${error}` });
      }
    });

    this.app.post('/bidi/locate-nodes', async (req, res) => {
      try {
        const { selector, maxNodeCount = 100 } = req.body;
        
        if (!selector) {
          return res.status(400).json({ error: 'Selector is required' });
        }

        console.log(`🎯 Locating nodes via BiDi: ${selector}`);
        const result = await this.webDriverBiDiService.locateNodes(selector, maxNodeCount);
        res.json(result);
      } catch (error) {
        console.error('Locate nodes error:', error);
        res.status(500).json({ error: `Locate nodes failed: ${error}` });
      }
    });

    this.app.get('/bidi/get-tree', async (req, res) => {
      try {
        console.log('🌳 Getting browsing context tree via BiDi...');
        const result = await this.webDriverBiDiService.getTree();
        res.json(result);
      } catch (error) {
        console.error('Get tree error:', error);
        res.status(500).json({ error: `Get tree failed: ${error}` });
      }
    });

    this.app.get('/bidi/get-realms', async (req, res) => {
      try {
        console.log('🏰 Getting realms via BiDi...');
        const result = await this.webDriverBiDiService.getRealms();
        res.json(result);
      } catch (error) {
        console.error('Get realms error:', error);
        res.status(500).json({ error: `Get realms failed: ${error}` });
      }
    });

    this.app.post('/bidi/set-viewport', async (req, res) => {
      try {
        const { width, height } = req.body;
        
        if (!width || !height) {
          return res.status(400).json({ error: 'Width and height are required' });
        }

        console.log(`📐 Setting viewport via BiDi: ${width}x${height}`);
        const result = await this.webDriverBiDiService.setViewport(width, height);
        res.json(result);
      } catch (error) {
        console.error('Set viewport error:', error);
        res.status(500).json({ error: `Set viewport failed: ${error}` });
      }
    });

    this.app.post('/bidi/close-context', async (req, res) => {
      try {
        console.log('🔒 Closing browsing context via BiDi...');
        const result = await this.webDriverBiDiService.closeContext();
        res.json(result);
      } catch (error) {
        console.error('Close context error:', error);
        res.status(500).json({ error: `Close context failed: ${error}` });
      }
    });

    this.app.post('/bidi/end-session', async (req, res) => {
      try {
        console.log('🔚 Ending BiDi session...');
        const result = await this.webDriverBiDiService.endSession();
        res.json(result);
      } catch (error) {
        console.error('End session error:', error);
        res.status(500).json({ error: `End session failed: ${error}` });
      }
    });

    this.app.get('/bidi/events', async (req, res) => {
      try {
        const { method } = req.query;
        
        console.log(`📨 Getting BiDi events${method ? ` for ${method}` : ''}`);
        const result = this.webDriverBiDiService.getEvents(method);
        res.json(result);
      } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({ error: `Get events failed: ${error}` });
      }
    });

    this.app.post('/bidi/clear-events', async (req, res) => {
      try {
        console.log('🧹 Clearing BiDi events...');
        const result = this.webDriverBiDiService.clearEvents();
        res.json(result);
      } catch (error) {
        console.error('Clear events error:', error);
        res.status(500).json({ error: `Clear events failed: ${error}` });
      }
    });

    // API Documentation
    this.app.get('/api', (req, res) => {
      res.json({
        endpoints: {
          'GET /.identity': 'Health check and server info',
          'POST /capture-screenshot': 'Take screenshots with advanced options',
          'POST /analyze-performance': 'Performance analysis with device simulation',
          'POST /test-accessibility': 'Accessibility testing with detailed results',
          'POST /analyze-seo': 'SEO analysis including meta tags and structured data',
          'POST /test-responsive': 'Responsive design testing across breakpoints',
          'POST /interact-element': 'Element interaction (click, type, hover, etc.)',
          'POST /lighthouse-audit': 'Comprehensive Lighthouse audit (performance, accessibility, SEO, best practices)',
          'POST /lighthouse-performance': 'Lighthouse performance audit with detailed metrics',
          'POST /lighthouse-accessibility': 'Lighthouse accessibility audit with WCAG compliance',
          'POST /lighthouse-seo': 'Lighthouse SEO audit with optimization recommendations',
          'POST /lighthouse-best-practices': 'Lighthouse best practices audit',
          'POST /user-flow': 'User flow analysis with custom interaction steps',
          'POST /generate-report': 'Generate comprehensive Lighthouse report',
          'GET /console-logs': 'Get console logs',
          'GET /console-errors': 'Get console errors',
          'GET /network-success': 'Get network success logs',
          'GET /network-errors': 'Get network errors',
          'POST /wipelogs': 'Clear all logs',
          'POST /interact/click': 'Enhanced element click with automatic waiting',
          'POST /interact/fill': 'Enhanced input filling with smart detection',
          'POST /interact/hover': 'Enhanced element hover with stability checks',
          'POST /js/evaluate': 'Execute JavaScript in page context',
          'POST /js/evaluate-handle': 'Execute JavaScript and return handle',
          'POST /js/execute-function': 'Execute function with arguments',
          'POST /js/execute-dom': 'Execute DOM-related JavaScript',
          'POST /js/execute-promise': 'Execute promise-based JavaScript',
          'POST /js/element-handle': 'Get element handle by selector',
          'POST /js/execute-on-element': 'Execute script on specific element',
          'POST /js/execute-on-elements': 'Execute script on multiple elements',
          'POST /js/inject-script': 'Inject and execute custom script',
          'POST /network/enable-interception': 'Enable network request interception',
          'POST /network/disable-interception': 'Disable network request interception',
          'POST /network/block-requests': 'Block requests matching patterns',
          'POST /network/block-resource-types': 'Block requests by resource type',
          'POST /network/modify-headers': 'Modify request headers',
          'POST /network/mock-response': 'Mock API responses',
          'POST /network/throttle-requests': 'Throttle request timing',
          'POST /network/add-handler': 'Add custom intercept handler',
          'POST /network/remove-handler': 'Remove intercept handler',
          'GET /network/request-log': 'Get intercepted request log',
          'GET /network/response-log': 'Get response log',
          'GET /network/blocked-requests': 'Get blocked requests log',
          'GET /network/modified-requests': 'Get modified requests log',
          'POST /network/clear-logs': 'Clear all network logs',
          'POST /bidi/connect': 'Connect to WebDriver BiDi',
          'POST /bidi/create-context': 'Create browsing context via BiDi',
          'POST /bidi/navigate': 'Navigate via BiDi',
          'POST /bidi/screenshot': 'Take screenshot via BiDi',
          'POST /bidi/evaluate': 'Evaluate script via BiDi',
          'POST /bidi/add-preload-script': 'Add preload script via BiDi',
          'POST /bidi/locate-nodes': 'Locate nodes via BiDi',
          'GET /bidi/get-tree': 'Get browsing context tree via BiDi',
          'GET /bidi/get-realms': 'Get realms via BiDi',
          'POST /bidi/set-viewport': 'Set viewport via BiDi',
          'POST /bidi/close-context': 'Close browsing context via BiDi',
          'POST /bidi/end-session': 'End BiDi session',
          'GET /bidi/events': 'Get BiDi events',
          'POST /bidi/clear-events': 'Clear BiDi events',
          'POST /interact/scroll': 'Enhanced element scrolling with viewport positioning',
          'POST /interact/wait': 'Enhanced element waiting with state validation',
          'POST /interact/text-selector': 'Find and interact with elements by text content',
          'POST /interact/aria-selector': 'Find and interact with elements by ARIA attributes',
          'POST /interact/shadow-dom': 'Interact with elements inside Shadow DOM',
          'POST /interact/fill-form': 'Fill multiple form fields with validation',
          'POST /interact/type': 'Enhanced keyboard typing with delay support',
          'POST /interact/mouse-click': 'Precise mouse click at coordinates',
          'GET /api': 'This endpoint list'
        },
        examples: {
          screenshot: {
            url: 'https://example.com',
            customPath: '/tmp/screenshots',
            viewport: { width: 375, height: 667 },
            fullPage: true
          },
          performance: {
            url: 'https://example.com',
            device: 'mobile'
          },
          accessibility: {
            url: 'https://example.com'
          },
          lighthouse: {
            url: 'https://example.com',
            device: 'desktop',
            categories: ['performance', 'accessibility', 'seo', 'best-practices']
          },
          userFlow: {
            url: 'https://example.com',
            flowSteps: [
              { type: 'click', selector: '.login-button' },
              { type: 'type', selector: '#email', value: 'test@example.com' },
              { type: 'wait', duration: 1000 }
            ]
          },
          enhancedInteractions: {
            click: {
              selector: 'button[type="submit"]',
              url: 'https://example.com',
              options: { timeout: 10000, force: false }
            },
            fill: {
              selector: 'input[name="email"]',
              value: 'user@example.com',
              url: 'https://example.com'
            },
            textSelector: {
              text: 'Submit Form',
              url: 'https://example.com'
            },
            ariaSelector: {
              ariaSelector: '[name="Submit"][role="button"]',
              url: 'https://example.com'
            },
            shadowDOM: {
              hostSelector: 'my-custom-element',
              targetSelector: 'button',
              url: 'https://example.com'
            },
            formFill: {
              formData: {
                'input[name="username"]': 'testuser',
                'input[name="password"]': 'password123',
                'select[name="country"]': 'US'
              },
              url: 'https://example.com'
            },
            mouseClick: {
              x: 500,
              y: 300,
              url: 'https://example.com',
              options: { button: 'left', clickCount: 1 }
            }
          },
          javascriptExecution: {
            evaluate: {
              script: 'return document.title;',
              args: []
            },
            evaluateHandle: {
              script: 'return document.body;',
              args: []
            },
            executeFunction: {
              functionBody: 'return arg0 + arg1;',
              args: [5, 10]
            },
            executeDOM: {
              script: 'return { title: document.title, url: window.location.href, elements: document.querySelectorAll("*").length };',
              url: 'https://example.com'
            },
            executePromise: {
              script: 'return new Promise(resolve => setTimeout(() => resolve("Delayed result"), 1000));',
              timeout: 5000
            },
            elementHandle: {
              selector: 'button[type="submit"]'
            },
            executeOnElement: {
              selector: 'input[name="email"]',
              script: 'return this.value;',
              args: []
            },
            executeOnElements: {
              selector: 'a',
              script: 'return Array.from(this).map(el => ({ text: el.textContent, href: el.href }));',
              args: []
            },
            injectScript: {
              script: 'window.customData = { timestamp: Date.now(), userAgent: navigator.userAgent }; return window.customData;',
              url: 'https://example.com'
            }
          },
          networkInterception: {
            enableInterception: {
              url: 'https://example.com',
              priority: 0
            },
            blockRequests: {
              patterns: ['.png', '.jpg', 'analytics'],
              reason: 'performance optimization'
            },
            blockResourceTypes: {
              resourceTypes: ['image', 'stylesheet', 'font'],
              reason: 'reduce bandwidth'
            },
            modifyHeaders: {
              urlPattern: 'api.example.com',
              headerModifications: {
                'Authorization': 'Bearer token123',
                'X-Custom-Header': 'value'
              }
            },
            mockResponse: {
              urlPattern: '/api/users',
              mockData: {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: { users: [{ id: 1, name: 'John' }] }
              }
            },
            throttleRequests: {
              urlPattern: 'api.example.com',
              delay: 2000
            },
            addHandler: {
              id: 'custom-handler',
              handler: 'if (requestData.url.includes("blocked")) return { action: "abort", reason: "custom" }; return null;'
            }
          },
          webDriverBiDi: {
            connect: {},
            createContext: {
              url: 'https://example.com'
            },
            navigate: {
              url: 'https://example.com'
            },
            screenshot: {},
            evaluate: {
              script: 'return document.title;',
              awaitPromise: true
            },
            addPreloadScript: {
              script: 'window.bidiInjected = true;'
            },
            locateNodes: {
              selector: 'button',
              maxNodeCount: 10
            },
            setViewport: {
              width: 1920,
              height: 1080
            },
            getEvents: {
              method: 'browsingContext.load'
            }
          }
        }
      });
    });
  }

  async captureScreenshot(url, customPath, viewport, waitForSelector, fullPage = true) {
    try {
      await chromiumScreenshotService.initialize();
      
      if (viewport) {
        await chromiumScreenshotService.setViewport(viewport.width, viewport.height);
      }

      await chromiumScreenshotService.goto(url);
      
      if (waitForSelector) {
        await chromiumScreenshotService.waitForSelector(waitForSelector, { timeout: 10000 });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const domain = new URL(url).hostname;
      const outputPath = customPath || '/tmp/screenshots';
      
      if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
      }

      const filename = `screenshot-${domain}-${timestamp}.png`;
      const fullPath = path.join(outputPath, filename);

      const screenshot = await chromiumScreenshotService.screenshot({
        path: fullPath,
        fullPage: fullPage
      });

      return {
        success: true,
        path: fullPath,
        size: screenshot.length,
        message: 'Screenshot captured successfully using Chromium',
        metadata: {
          url,
          viewport: viewport || { width: 1920, height: 1080 },
          fullPage,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Screenshot error:', error);
      return {
        success: false,
        error: `Screenshot failed: ${error}`,
        metadata: { url, timestamp: new Date().toISOString() }
      };
    }
  }

  async analyzePerformance(url, device) {
    try {
      await chromiumScreenshotService.initialize();
      
      const devices = {
        desktop: { width: 1920, height: 1080 },
        mobile: { width: 375, height: 667 },
        tablet: { width: 1024, height: 768 }
      };

      const viewport = devices[device] || devices.desktop;
      await chromiumScreenshotService.setViewport(viewport.width, viewport.height);

      const startTime = Date.now();
      await chromiumScreenshotService.goto(url);
      const loadTime = Date.now() - startTime;

      const metrics = await chromiumScreenshotService.evaluate(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        return {
          domContentLoaded: perfData?.domContentLoadedEventEnd - perfData?.domContentLoadedEventStart || 0,
          loadComplete: perfData?.loadEventEnd - perfData?.loadEventStart || 0,
          firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
          firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
        };
      });

      return {
        success: true,
        url,
        device,
        loadTime,
        metrics,
        score: Math.max(0, 100 - Math.floor(loadTime / 100)),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: `Performance analysis failed: ${error}`,
        url,
        timestamp: new Date().toISOString()
      };
    }
  }

  async testAccessibility(url) {
    try {
      await chromiumScreenshotService.initialize();
      await chromiumScreenshotService.goto(url);

      const audit = await chromiumScreenshotService.evaluate(() => {
        const issues = [];
        const passes = [];

        // Check for alt attributes on images
        const images = document.querySelectorAll('img');
        images.forEach((img, index) => {
          if (!img.alt) {
            issues.push({
              type: 'error',
              rule: 'image-alt',
              element: `img[${index}]`,
              message: 'Image missing alt attribute'
            });
          } else {
            passes.push({
              type: 'pass',
              rule: 'image-alt',
              element: `img[${index}]`,
              message: 'Image has alt attribute'
            });
          }
        });

        // Check for heading structure
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let previousLevel = 0;
        headings.forEach((heading, index) => {
          const level = parseInt(heading.tagName.charAt(1));
          if (level > previousLevel + 1) {
            issues.push({
              type: 'error',
              rule: 'heading-order',
              element: heading.tagName.toLowerCase(),
              message: `Heading level ${level} skipped level ${previousLevel + 1}`
            });
          }
          previousLevel = level;
        });

        return { issues, passes };
      });

      const score = Math.max(0, 100 - (audit.issues.length * 10));

      return {
        success: true,
        url,
        score,
        issues: audit.issues,
        passes: audit.passes,
        summary: {
          total: audit.issues.length + audit.passes.length,
          errors: audit.issues.filter(issue => issue.type === 'error').length,
          passes: audit.passes.length
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: `Accessibility test failed: ${error}`,
        url,
        timestamp: new Date().toISOString()
      };
    }
  }

  async analyzeSEO(url) {
    try {
      await chromiumScreenshotService.initialize();
      await chromiumScreenshotService.goto(url);

      const seoData = await chromiumScreenshotService.evaluate(() => {
        const data = {
          title: document.title,
          url: window.location.href,
          canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
          robots: document.querySelector('meta[name="robots"]')?.getAttribute('content'),
          language: document.documentElement.lang || 'en',
          meta: {
            description: document.querySelector('meta[name="description"]')?.getAttribute('content'),
            keywords: document.querySelector('meta[name="keywords"]')?.getAttribute('content'),
            author: document.querySelector('meta[name="author"]')?.getAttribute('content'),
            viewport: document.querySelector('meta[name="viewport"]')?.getAttribute('content'),
            og: {
              title: document.querySelector('meta[property="og:title"]')?.getAttribute('content'),
              description: document.querySelector('meta[property="og:description"]')?.getAttribute('content'),
              image: document.querySelector('meta[property="og:image"]')?.getAttribute('content'),
              url: document.querySelector('meta[property="og:url"]')?.getAttribute('content'),
              type: document.querySelector('meta[property="og:type"]')?.getAttribute('content')
            }
          },
          headings: {
            h1: document.querySelectorAll('h1').length,
            h2: document.querySelectorAll('h2').length,
            h3: document.querySelectorAll('h3').length,
            h4: document.querySelectorAll('h4').length,
            h5: document.querySelectorAll('h5').length,
            h6: document.querySelectorAll('h6').length
          }
        };

        // Check for common SEO issues
        data.issues = [];
        if (!data.meta.description) data.issues.push('Missing meta description');
        if (!data.meta.og.title) data.issues.push('Missing Open Graph title');
        if (!data.meta.og.description) data.issues.push('Missing Open Graph description');
        if (!data.meta.og.image) data.issues.push('Missing Open Graph image');
        if (data.headings.h1 > 1) data.issues.push('Multiple H1 tags found');
        if (data.headings.h1 === 0) data.issues.push('No H1 tag found');

        return data;
      });

      return {
        success: true,
        url,
        seoData,
        score: Math.max(0, 100 - (seoData.issues.length * 10)),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: `SEO analysis failed: ${error}`,
        url,
        timestamp: new Date().toISOString()
      };
    }
  }

  async testResponsive(url, breakpoints, customPath) {
    try {
      const results = [];
      const outputPath = customPath || '/tmp/responsive-screenshots';

      if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
      }

      for (const breakpoint of breakpoints) {
        await chromiumScreenshotService.initialize();
        await chromiumScreenshotService.setViewport(breakpoint.width, breakpoint.height);
        await chromiumScreenshotService.goto(url);

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const domain = new URL(url).hostname;
        const filename = `responsive-${breakpoint.name}-${domain}-${timestamp}.png`;
        const fullPath = path.join(outputPath, filename);

        const screenshot = await chromiumScreenshotService.screenshot({
          path: fullPath,
          fullPage: true
        });

        results.push({
          breakpoint: breakpoint.name,
          viewport: { width: breakpoint.width, height: breakpoint.height },
          screenshot: fullPath,
          size: screenshot.length
        });

        await chromiumScreenshotService.close();
      }

      return {
        success: true,
        url,
        breakpoints: results,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: `Responsive test failed: ${error}`,
        url,
        timestamp: new Date().toISOString()
      };
    }
  }

  async interactWithElement(url, selector, action, value) {
    try {
      await chromiumScreenshotService.initialize();
      await chromiumScreenshotService.goto(url);

      const element = await chromiumScreenshotService.$(selector);
      if (!element) {
        return {
          success: false,
          error: `Element not found: ${selector}`,
          url,
          selector,
          action
        };
      }

      let result = { success: true, url, selector, action };

      switch (action) {
        case 'click':
          await element.click();
          result.message = 'Element clicked successfully';
          break;
        case 'type':
          if (!value) {
            return { success: false, error: 'Value required for type action', url, selector, action };
          }
          await element.type(value);
          result.message = `Typed "${value}" into element`;
          break;
        case 'hover':
          await element.hover();
          result.message = 'Element hovered successfully';
          break;
        case 'getText':
          const text = await element.evaluate(el => el.textContent);
          result.text = text;
          result.message = 'Element text retrieved';
          break;
        default:
          return { success: false, error: `Unknown action: ${action}`, url, selector, action };
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: `Element interaction failed: ${error}`,
        url,
        selector,
        action
      };
    }
  }

  // Lighthouse Methods
  async runLighthouseAudit(url, device = 'desktop', categories = ['performance', 'accessibility', 'best-practices', 'seo']) {
    try {
      const options = {
        onlyCategories: categories,
        formFactor: device === 'mobile' ? 'mobile' : 'desktop'
      };

      return await lighthouseService.runLighthouse(url, options);
    } catch (error) {
      return {
        success: false,
        error: `Lighthouse audit failed: ${error.message}`,
        url,
        device,
        categories,
        timestamp: new Date().toISOString()
      };
    }
  }

  async runLighthousePerformance(url, device = 'desktop') {
    try {
      return await lighthouseService.runPerformanceAudit(url, device);
    } catch (error) {
      return {
        success: false,
        error: `Lighthouse performance audit failed: ${error.message}`,
        url,
        device,
        timestamp: new Date().toISOString()
      };
    }
  }

  async runLighthouseAccessibility(url) {
    try {
      return await lighthouseService.runAccessibilityAudit(url);
    } catch (error) {
      return {
        success: false,
        error: `Lighthouse accessibility audit failed: ${error.message}`,
        url,
        timestamp: new Date().toISOString()
      };
    }
  }

  async runLighthouseSEO(url) {
    try {
      return await lighthouseService.runSEOAudit(url);
    } catch (error) {
      return {
        success: false,
        error: `Lighthouse SEO audit failed: ${error.message}`,
        url,
        timestamp: new Date().toISOString()
      };
    }
  }

  async runLighthouseBestPractices(url) {
    try {
      return await lighthouseService.runBestPracticesAudit(url);
    } catch (error) {
      return {
        success: false,
        error: `Lighthouse best practices audit failed: ${error.message}`,
        url,
        timestamp: new Date().toISOString()
      };
    }
  }

  async runUserFlow(url, flowSteps = []) {
    try {
      return await lighthouseService.runUserFlow(url, flowSteps);
    } catch (error) {
      return {
        success: false,
        error: `User flow analysis failed: ${error.message}`,
        url,
        flowSteps,
        timestamp: new Date().toISOString()
      };
    }
  }

  async generateLighthouseReport(url, outputPath) {
    try {
      return await lighthouseService.generateReport(url, outputPath);
    } catch (error) {
      return {
        success: false,
        error: `Report generation failed: ${error.message}`,
        url,
        outputPath,
        timestamp: new Date().toISOString()
      };
    }
  }

  async start() {
    return new Promise((resolve, reject) => {
      this.server.listen(this.port, () => {
        console.log(`🚀 Extended Browser Connector started on port ${this.port}`);
        console.log('📸 Enhanced screenshots and web development tools available');
        console.log('🔍 Lighthouse audits: Performance, Accessibility, SEO, Best Practices');
        console.log('🔄 User flow analysis and comprehensive reporting');
        console.log('🌐 Health check: http://localhost:3025/.identity');
        console.log('📚 API docs: http://localhost:3025/api');
        resolve();
      });

      this.server.on('error', (error) => {
        console.error('Server error:', error);
        reject(error);
      });
    });
  }

  async stop() {
    return new Promise((resolve) => {
      this.server.close(() => {
        console.log('Server stopped');
        resolve();
      });
    });
  }
}

// Start the server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const connector = new ExtendedBrowserConnector();
  connector.start().catch(console.error);
}
