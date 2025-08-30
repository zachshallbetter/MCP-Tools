#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { chromiumScreenshotService } from './chromium-screenshot-service.js';
import { WebSocketServer } from 'ws';
import fs from 'fs';
import path from 'path';
import http from 'http';

class BrowserConnector {
  private app: express.Application;
  private server: http.Server;
  private wss!: WebSocketServer;
  private port: number;

  constructor(port: number = 3025) {
    this.port = port;
    this.app = express();
    this.server = http.createServer(this.app);
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware() {
    this.app.use(cors());
    this.app.use(bodyParser.json({ limit: '50mb' }));
    this.app.use(bodyParser.urlencoded({ extended: true }));
  }

  private setupRoutes() {
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
          'console-logging'
        ]
      });
    });

    // Enhanced Screenshot with more options
    this.app.post('/capture-screenshot', async (req, res) => {
      try {
        const { url, customPath, viewport, waitForSelector, fullPage = true } = req.body;
        
        if (!url) {
          return res.status(400).json({ error: 'URL is required' });
        }

        console.log('Browser Connector: Received request to /capture-screenshot endpoint');
        console.log('Browser Connector: Using Chromium mode for screenshot');
        console.log(`Browser Connector: Taking screenshot of ${url}`);

        const result = await this.captureScreenshotChromium(url, customPath, viewport, waitForSelector, fullPage);
        res.json(result);
      } catch (error) {
        console.error('Screenshot error:', error);
        res.status(500).json({ error: `Screenshot failed: ${error}` });
      }
    });

    // Performance Analysis
    this.app.post('/analyze-performance', async (req, res) => {
      try {
        const { url, device = 'desktop', network = '4g' } = req.body;
        
        if (!url) {
          return res.status(400).json({ error: 'URL is required' });
        }

        console.log(`Browser Connector: Analyzing performance for ${url} (${device}, ${network})`);
        
        const result = await this.analyzePerformance(url, device, network);
        res.json(result);
      } catch (error) {
        console.error('Performance analysis error:', error);
        res.status(500).json({ error: `Performance analysis failed: ${error}` });
      }
    });

    // Accessibility Testing
    this.app.post('/test-accessibility', async (req, res) => {
      try {
        const { url, includeWarnings = true, includePasses = false } = req.body;
        
        if (!url) {
          return res.status(400).json({ error: 'URL is required' });
        }

        console.log(`Browser Connector: Testing accessibility for ${url}`);
        
        const result = await this.testAccessibility(url, includeWarnings, includePasses);
        res.json(result);
      } catch (error) {
        console.error('Accessibility test error:', error);
        res.status(500).json({ error: `Accessibility test failed: ${error}` });
      }
    });

    // SEO Analysis
    this.app.post('/analyze-seo', async (req, res) => {
      try {
        const { url, includeMeta = true, includeStructured = true } = req.body;
        
        if (!url) {
          return res.status(400).json({ error: 'URL is required' });
        }

        console.log(`Browser Connector: Analyzing SEO for ${url}`);
        
        const result = await this.analyzeSEO(url, includeMeta, includeStructured);
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
          { width: 1024, height: 768, name: 'tablet' },
          { width: 375, height: 667, name: 'mobile' }
        ];

        console.log(`Browser Connector: Testing responsive design for ${url}`);
        
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
        const { url, selector, action, value, attribute } = req.body;
        
        if (!url || !selector || !action) {
          return res.status(400).json({ error: 'URL, selector, and action are required' });
        }

        console.log(`Browser Connector: Interacting with element ${selector} on ${url}`);
        
        const result = await this.interactWithElement(url, selector, action, value, attribute);
        res.json(result);
      } catch (error) {
        console.error('Element interaction error:', error);
        res.status(500).json({ error: `Element interaction failed: ${error}` });
      }
    });

    // Network Monitoring
    this.app.post('/monitor-network', async (req, res) => {
      try {
        const { url, filter, includeHeaders = false, includeBody = false } = req.body;
        
        if (!url) {
          return res.status(400).json({ error: 'URL is required' });
        }

        console.log(`Browser Connector: Monitoring network for ${url}`);
        
        const result = await this.monitorNetwork(url, filter, includeHeaders, includeBody);
        res.json(result);
      } catch (error) {
        console.error('Network monitoring error:', error);
        res.status(500).json({ error: `Network monitoring failed: ${error}` });
      }
    });

    // Console Logging
    this.app.post('/get-console-logs', async (req, res) => {
      try {
        const { url, level, includeTimestamp = true } = req.body;
        
        if (!url) {
          return res.status(400).json({ error: 'URL is required' });
        }

        console.log(`Browser Connector: Getting console logs for ${url}`);
        
        const result = await this.getConsoleLogs(url, level, includeTimestamp);
        res.json(result);
      } catch (error) {
        console.error('Console logs error:', error);
        res.status(500).json({ error: `Console logs failed: ${error}` });
      }
    });

    // Get all available endpoints
    this.app.get('/api', (req, res) => {
      res.json({
        endpoints: {
          'GET /.identity': 'Health check and server info',
          'POST /capture-screenshot': 'Take screenshots with advanced options',
          'POST /analyze-performance': 'Performance analysis with device/network simulation',
          'POST /test-accessibility': 'Accessibility testing with detailed results',
          'POST /analyze-seo': 'SEO analysis including meta tags and structured data',
          'POST /test-responsive': 'Responsive design testing across breakpoints',
          'POST /interact-element': 'Element interaction (click, type, hover, etc.)',
          'POST /monitor-network': 'Network request monitoring and analysis',
          'POST /get-console-logs': 'Console log capture with filtering',
          'GET /api': 'This endpoint list'
        },
        examples: {
          screenshot: {
            url: 'https://example.com',
            customPath: '/tmp/screenshots',
            viewport: { width: 1920, height: 1080 },
            waitForSelector: '.loaded',
            fullPage: true
          },
          performance: {
            url: 'https://example.com',
            device: 'mobile',
            network: 'slow3g'
          },
          accessibility: {
            url: 'https://example.com',
            includeWarnings: true,
            includePasses: false
          }
        }
      });
    });
  }

  private async captureScreenshotChromium(url: string, customPath?: string, viewport?: any, waitForSelector?: string, fullPage: boolean = true) {
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
      
      // Ensure directory exists
      if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
      }

      const filename = `screenshot-${domain}-${timestamp}.png`;
      const fullPath = path.join(outputPath, filename);

      const screenshot = await chromiumScreenshotService.screenshot({
        path: fullPath as `${string}.png`,
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

  private async analyzePerformance(url: string, device: string, network: string) {
    try {
      await chromiumScreenshotService.initialize();
      
      // Set device emulation
      const devices = {
        desktop: { width: 1920, height: 1080 },
        mobile: { width: 375, height: 667 },
        tablet: { width: 1024, height: 768 }
      };

      const viewport = devices[device as keyof typeof devices] || devices.desktop;
      await chromiumScreenshotService.setViewport(viewport.width, viewport.height);

      const startTime = Date.now();
      await chromiumScreenshotService.goto(url);
      const loadTime = Date.now() - startTime;

      // Get basic performance metrics
      const metrics = await chromiumScreenshotService.evaluate(() => {
        const perfData = performance.getEntriesByType('navigation')[0] as any;
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
        network,
        loadTime,
        metrics,
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

  private async testAccessibility(url: string, includeWarnings: boolean, includePasses: boolean) {
    try {
      await chromiumScreenshotService.initialize();
      await chromiumScreenshotService.goto(url);

      // Run basic accessibility audit
      const audit = await chromiumScreenshotService.evaluate(() => {
        const issues: any[] = [];
        const passes: any[] = [];

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

      const results = {
        issues: includeWarnings ? audit.issues : audit.issues.filter((issue: any) => issue.type === 'error'),
        passes: includePasses ? audit.passes : []
      };

      return {
        success: true,
        url,
        score: Math.max(0, 100 - (results.issues.length * 10)),
        issues: results.issues,
        passes: results.passes,
        summary: {
          total: results.issues.length + results.passes.length,
          errors: results.issues.filter((issue: any) => issue.type === 'error').length,
          warnings: results.issues.filter((issue: any) => issue.type === 'warning').length,
          passes: results.passes.length
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

  private async analyzeSEO(url: string, includeMeta: boolean, includeStructured: boolean) {
    try {
      await chromiumScreenshotService.initialize();
      await chromiumScreenshotService.goto(url);

      const seoData = await chromiumScreenshotService.evaluate((includeMeta: boolean, includeStructured: boolean) => {
        const data: any = {
          title: document.title,
          url: window.location.href,
          canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
          robots: document.querySelector('meta[name="robots"]')?.getAttribute('content'),
          language: document.documentElement.lang || 'en'
        };

        if (includeMeta) {
          data.meta = {
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
            },
            twitter: {
              card: document.querySelector('meta[name="twitter:card"]')?.getAttribute('content'),
              title: document.querySelector('meta[name="twitter:title"]')?.getAttribute('content'),
              description: document.querySelector('meta[name="twitter:description"]')?.getAttribute('content'),
              image: document.querySelector('meta[name="twitter:image"]')?.getAttribute('content')
            }
          };
        }

        if (includeStructured) {
          const structuredData: any[] = [];
          const scripts = document.querySelectorAll('script[type="application/ld+json"]');
          scripts.forEach(script => {
            try {
              const json = JSON.parse(script.textContent || '');
              structuredData.push(json);
            } catch (e) {
              // Invalid JSON
            }
          });
          data.structuredData = structuredData;
        }

        // Count headings
        data.headings = {
          h1: document.querySelectorAll('h1').length,
          h2: document.querySelectorAll('h2').length,
          h3: document.querySelectorAll('h3').length,
          h4: document.querySelectorAll('h4').length,
          h5: document.querySelectorAll('h5').length,
          h6: document.querySelectorAll('h6').length
        };

        // Check for common SEO issues
        data.issues = [];
        if (!data.meta?.description) data.issues.push('Missing meta description');
        if (!data.meta?.og?.title) data.issues.push('Missing Open Graph title');
        if (!data.meta?.og?.description) data.issues.push('Missing Open Graph description');
        if (!data.meta?.og?.image) data.issues.push('Missing Open Graph image');
        if (data.headings.h1 > 1) data.issues.push('Multiple H1 tags found');
        if (data.headings.h1 === 0) data.issues.push('No H1 tag found');

        return data;
      }, includeMeta, includeStructured);

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

  private async testResponsive(url: string, breakpoints: any[], customPath?: string) {
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
          path: fullPath as `${string}.png`,
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

  private async interactWithElement(url: string, selector: string, action: string, value?: string, attribute?: string) {
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

      let result: any = { success: true, url, selector, action };

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
        case 'screenshot':
          const screenshot = await element.screenshot();
          result.screenshot = screenshot.toString('base64');
          result.message = 'Element screenshot captured';
          break;
        case 'getText':
          const text = await element.evaluate((el: any) => el.textContent);
          result.text = text;
          result.message = 'Element text retrieved';
          break;
        case 'getAttribute':
          if (!attribute) {
            return { success: false, error: 'Attribute required for getAttribute action', url, selector, action };
          }
          const attrValue = await element.evaluate((el: any, attr: string) => el.getAttribute(attr), attribute);
          result.attribute = attribute;
          result.value = attrValue;
          result.message = `Attribute "${attribute}" retrieved`;
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

  private async monitorNetwork(url: string, filter?: string, includeHeaders: boolean = false, includeBody: boolean = false) {
    try {
      await chromiumScreenshotService.initialize();
      
      const requests: any[] = [];
      const responses: any[] = [];

      chromiumScreenshotService.on('request', (request: any) => {
        if (!filter || request.url().includes(filter)) {
          const reqData: any = {
            url: request.url(),
            method: request.method(),
            resourceType: request.resourceType(),
            timestamp: new Date().toISOString()
          };

          if (includeHeaders) {
            reqData.headers = request.headers();
          }

          if (includeBody && request.postData()) {
            reqData.body = request.postData();
          }

          requests.push(reqData);
        }
      });

      chromiumScreenshotService.on('response', (response: any) => {
        if (!filter || response.url().includes(filter)) {
          const respData: any = {
            url: response.url(),
            status: response.status(),
            statusText: response.statusText(),
            resourceType: response.request().resourceType(),
            timestamp: new Date().toISOString()
          };

          if (includeHeaders) {
            respData.headers = response.headers();
          }

          responses.push(respData);
        }
      });

      await chromiumScreenshotService.goto(url);

      // Wait a bit more for any delayed requests
      await new Promise(resolve => setTimeout(resolve, 2000));

      return {
        success: true,
        url,
        requests,
        responses,
        summary: {
          totalRequests: requests.length,
          totalResponses: responses.length,
          statusCodes: responses.reduce((acc, resp) => {
            acc[resp.status] = (acc[resp.status] || 0) + 1;
            return acc;
          }, {} as Record<number, number>)
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: `Network monitoring failed: ${error}`,
        url,
        timestamp: new Date().toISOString()
      };
    }
  }

  private async getConsoleLogs(url: string, level?: string, includeTimestamp: boolean = true) {
    try {
      await chromiumScreenshotService.initialize();
      
      const logs: any[] = [];

      chromiumScreenshotService.on('console', (msg: any) => {
        if (!level || msg.type() === level) {
          const logEntry: any = {
            type: msg.type(),
            text: msg.text(),
            location: msg.location()
          };

          if (includeTimestamp) {
            logEntry.timestamp = new Date().toISOString();
          }

          logs.push(logEntry);
        }
      });

      await chromiumScreenshotService.goto(url);

      // Wait a bit more for any delayed console messages
      await new Promise(resolve => setTimeout(resolve, 2000));

      return {
        success: true,
        url,
        logs,
        summary: {
          total: logs.length,
          byLevel: logs.reduce((acc, log) => {
            acc[log.type] = (acc[log.type] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: `Console logs failed: ${error}`,
        url,
        timestamp: new Date().toISOString()
      };
    }
  }

  async start() {
    return new Promise<void>((resolve, reject) => {
      this.server.listen(this.port, () => {
        console.log(`🚀 Browser Connector (Chromium Mode) started on port ${this.port}`);
        console.log('📸 Screenshots will be captured using Chromium automation');
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
    return new Promise<void>((resolve) => {
      this.server.close(() => {
        console.log('Server stopped');
        resolve();
      });
    });
  }
}

// Start the server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const connector = new BrowserConnector();
  connector.start().catch(console.error);
}

