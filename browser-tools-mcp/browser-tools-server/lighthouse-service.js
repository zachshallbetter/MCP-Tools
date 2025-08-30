#!/usr/bin/env node

import lighthouse from 'lighthouse';
import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

class LighthouseService {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async initialize() {
    if (!this.browser) {
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
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding'
        ]
      });
    }
    
    if (!this.page) {
      this.page = await this.browser.newPage();
    }
  }

  async runLighthouse(url, options = {}) {
    try {
      await this.initialize();

      const defaultOptions = {
        port: (new URL(this.browser.wsEndpoint())).port,
        output: 'json',
        logLevel: 'info',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        formFactor: 'desktop',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0
        },
        screenEmulation: {
          mobile: false,
          width: 1350,
          height: 940,
          deviceScaleFactor: 1,
          disabled: false
        },
        emulatedUserAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      };

      const config = { ...defaultOptions, ...options };
      
      console.log(`🔍 Running Lighthouse audit for ${url}`);
      const runnerResult = await lighthouse(url, config);
      
      return {
        success: true,
        url,
        lighthouseVersion: runnerResult.lhr.lighthouseVersion,
        userAgent: runnerResult.lhr.userAgent,
        environment: {
          benchmarkIndex: runnerResult.lhr.environment.benchmarkIndex,
          hostUserAgent: runnerResult.lhr.environment.hostUserAgent,
          networkUserAgent: runnerResult.lhr.environment.networkUserAgent
        },
        categories: {
          performance: runnerResult.lhr.categories.performance ? {
            score: runnerResult.lhr.categories.performance.score * 100,
            title: runnerResult.lhr.categories.performance.title,
            description: runnerResult.lhr.categories.performance.description,
            auditRefs: runnerResult.lhr.categories.performance.auditRefs
          } : null,
          accessibility: runnerResult.lhr.categories.accessibility ? {
            score: runnerResult.lhr.categories.accessibility.score * 100,
            title: runnerResult.lhr.categories.accessibility.title,
            description: runnerResult.lhr.categories.accessibility.description,
            auditRefs: runnerResult.lhr.categories.accessibility.auditRefs
          } : null,
          'best-practices': runnerResult.lhr.categories['best-practices'] ? {
            score: runnerResult.lhr.categories['best-practices'].score * 100,
            title: runnerResult.lhr.categories['best-practices'].title,
            description: runnerResult.lhr.categories['best-practices'].description,
            auditRefs: runnerResult.lhr.categories['best-practices'].auditRefs
          } : null,
          seo: runnerResult.lhr.categories.seo ? {
            score: runnerResult.lhr.categories.seo.score * 100,
            title: runnerResult.lhr.categories.seo.title,
            description: runnerResult.lhr.categories.seo.description,
            auditRefs: runnerResult.lhr.categories.seo.auditRefs
          } : null
        },
        audits: runnerResult.lhr.audits,
        timing: runnerResult.lhr.timing,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Lighthouse audit error:', error);
      return {
        success: false,
        error: `Lighthouse audit failed: ${error.message}`,
        url,
        timestamp: new Date().toISOString()
      };
    }
  }

  async runUserFlow(url, flowSteps = []) {
    try {
      await this.initialize();
      
      console.log(`🔄 Running user flow for ${url}`);
      
      const flow = await lighthouse.startFlow(this.page, {
        name: 'User Flow Analysis',
        port: (new URL(this.browser.wsEndpoint())).port
      });

      // Navigate to the page
      await flow.startNavigation();
      await this.page.goto(url, { waitUntil: 'networkidle0' });
      await flow.endNavigation();

      // Execute custom flow steps
      for (const step of flowSteps) {
        if (step.type === 'click') {
          await flow.startTimespan();
          await this.page.click(step.selector);
          await flow.endTimespan();
        } else if (step.type === 'type') {
          await flow.startTimespan();
          await this.page.type(step.selector, step.value);
          await flow.endTimespan();
        } else if (step.type === 'wait') {
          await this.page.waitForTimeout(step.duration);
        }
      }

      const flowResult = await flow.generateReport();
      
      return {
        success: true,
        url,
        flowSteps,
        report: flowResult,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('User flow error:', error);
      return {
        success: false,
        error: `User flow failed: ${error.message}`,
        url,
        timestamp: new Date().toISOString()
      };
    }
  }

  async runPerformanceAudit(url, device = 'desktop') {
    try {
      const options = {
        onlyCategories: ['performance'],
        formFactor: device === 'mobile' ? 'mobile' : 'desktop',
        screenEmulation: device === 'mobile' ? {
          mobile: true,
          width: 375,
          height: 667,
          deviceScaleFactor: 2,
          disabled: false
        } : {
          mobile: false,
          width: 1350,
          height: 940,
          deviceScaleFactor: 1,
          disabled: false
        }
      };

      const result = await this.runLighthouse(url, options);
      
      if (result.success) {
        const performance = result.categories.performance;
        const audits = result.audits;
        
        // Extract key performance metrics
        const metrics = {
          firstContentfulPaint: audits['first-contentful-paint']?.numericValue,
          largestContentfulPaint: audits['largest-contentful-paint']?.numericValue,
          firstInputDelay: audits['max-potential-fid']?.numericValue,
          cumulativeLayoutShift: audits['cumulative-layout-shift']?.numericValue,
          speedIndex: audits['speed-index']?.numericValue,
          totalBlockingTime: audits['total-blocking-time']?.numericValue
        };

        return {
          success: true,
          url,
          device,
          score: performance.score,
          metrics,
          opportunities: performance.auditRefs.filter(ref => ref.result.score < 1),
          diagnostics: performance.auditRefs.filter(ref => ref.result.score < 1 && ref.result.details),
          timestamp: new Date().toISOString()
        };
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: `Performance audit failed: ${error.message}`,
        url,
        device,
        timestamp: new Date().toISOString()
      };
    }
  }

  async runAccessibilityAudit(url) {
    try {
      const options = {
        onlyCategories: ['accessibility']
      };

      const result = await this.runLighthouse(url, options);
      
      if (result.success) {
        const accessibility = result.categories.accessibility;
        const audits = result.audits;
        
        // Extract accessibility issues
        const issues = accessibility.auditRefs
          .filter(ref => ref.result.score < 1)
          .map(ref => ({
            id: ref.id,
            title: ref.result.title,
            description: ref.result.description,
            score: ref.result.score,
            details: ref.result.details
          }));

        return {
          success: true,
          url,
          score: accessibility.score,
          issues,
          passes: accessibility.auditRefs.filter(ref => ref.result.score === 1).length,
          total: accessibility.auditRefs.length,
          timestamp: new Date().toISOString()
        };
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: `Accessibility audit failed: ${error.message}`,
        url,
        timestamp: new Date().toISOString()
      };
    }
  }

  async runSEOAudit(url) {
    try {
      const options = {
        onlyCategories: ['seo']
      };

      const result = await this.runLighthouse(url, options);
      
      if (result.success) {
        const seo = result.categories.seo;
        const audits = result.audits;
        
        // Extract SEO issues and recommendations
        const issues = seo.auditRefs
          .filter(ref => ref.result.score < 1)
          .map(ref => ({
            id: ref.id,
            title: ref.result.title,
            description: ref.result.description,
            score: ref.result.score,
            details: ref.result.details
          }));

        return {
          success: true,
          url,
          score: seo.score,
          issues,
          passes: seo.auditRefs.filter(ref => ref.result.score === 1).length,
          total: seo.auditRefs.length,
          timestamp: new Date().toISOString()
        };
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: `SEO audit failed: ${error.message}`,
        url,
        timestamp: new Date().toISOString()
      };
    }
  }

  async runBestPracticesAudit(url) {
    try {
      const options = {
        onlyCategories: ['best-practices']
      };

      const result = await this.runLighthouse(url, options);
      
      if (result.success) {
        const bestPractices = result.categories['best-practices'];
        
        // Extract best practices issues
        const issues = bestPractices.auditRefs
          .filter(ref => ref.result.score < 1)
          .map(ref => ({
            id: ref.id,
            title: ref.result.title,
            description: ref.result.description,
            score: ref.result.score,
            details: ref.result.details
          }));

        return {
          success: true,
          url,
          score: bestPractices.score,
          issues,
          passes: bestPractices.auditRefs.filter(ref => ref.result.score === 1).length,
          total: bestPractices.auditRefs.length,
          timestamp: new Date().toISOString()
        };
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: `Best practices audit failed: ${error.message}`,
        url,
        timestamp: new Date().toISOString()
      };
    }
  }

  async generateReport(url, outputPath = '/tmp/lighthouse-reports') {
    try {
      if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const domain = new URL(url).hostname;
      const filename = `lighthouse-report-${domain}-${timestamp}.json`;
      const fullPath = path.join(outputPath, filename);

      const result = await this.runLighthouse(url);
      
      if (result.success) {
        fs.writeFileSync(fullPath, JSON.stringify(result, null, 2));
        
        return {
          success: true,
          url,
          reportPath: fullPath,
          timestamp: new Date().toISOString()
        };
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: `Report generation failed: ${error.message}`,
        url,
        timestamp: new Date().toISOString()
      };
    }
  }

  async close() {
    if (this.page) {
      await this.page.close();
      this.page = null;
    }
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

// Export singleton instance
export const lighthouseService = new LighthouseService();
