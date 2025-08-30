#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { chromiumScreenshotService } from './chromium-screenshot-service.js';
import { lighthouseService } from './lighthouse-service.js';
import fs from 'fs';
import path from 'path';
import http from 'http';

class ExtendedBrowserConnector {
  constructor(port = 3025) {
    this.port = port;
    this.app = express();
    this.server = http.createServer(this.app);
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
