# 📚 API Reference

> **Complete API documentation for MCP-Tools**

## 🌐 Base URL

- **HTTP**: `http://localhost:3025`
- **HTTPS**: `https://localhost:3026` (when enabled)

## 🔍 Core Endpoints

### Health Check
```http
GET /.identity
```

**Response:**
```json
{
  "name": "browser-tools-server",
  "version": "1.0.0",
  "status": "running",
  "features": [
    "screenshots",
    "lighthouse",
    "interactions",
    "javascript",
    "network",
    "webdriver-bidi"
  ]
}
```

## 📸 Screenshot Endpoints

### Capture Screenshot
```http
POST /capture-screenshot
```

**Request Body:**
```json
{
  "url": "https://example.com",
  "fullPage": true,
  "viewport": {
    "width": 1920,
    "height": 1080
  },
  "waitForSelector": "body",
  "timeout": 30000
}
```

**Parameters:**
- `url` (required): Target URL to capture
- `fullPage` (optional): Capture full page vs viewport (default: false)
- `viewport` (optional): Browser viewport dimensions
- `waitForSelector` (optional): CSS selector to wait for before capture
- `timeout` (optional): Maximum wait time in milliseconds

**Response:**
```json
{
  "success": true,
  "screenshot": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "metadata": {
    "url": "https://example.com",
    "viewport": { "width": 1920, "height": 1080 },
    "fullPage": true,
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

## 📊 Lighthouse Endpoints

### Run Lighthouse Audit
```http
POST /lighthouse-audit
```

**Request Body:**
```json
{
  "url": "https://example.com",
  "categories": ["performance", "accessibility", "seo", "best-practices"],
  "device": "desktop",
  "output": "json"
}
```

**Parameters:**
- `url` (required): Target URL for audit
- `categories` (optional): Array of audit categories
- `device` (optional): Device type ("desktop" or "mobile")
- `output` (optional): Output format ("json" or "html")

**Response:**
```json
{
  "success": true,
  "results": {
    "performance": 85,
    "accessibility": 92,
    "seo": 88,
    "best-practices": 90
  },
  "details": {
    "firstContentfulPaint": 1200,
    "largestContentfulPaint": 2500,
    "cumulativeLayoutShift": 0.1
  }
}
```

### Performance Analysis
```http
POST /analyze-performance
```

**Request Body:**
```json
{
  "url": "https://example.com",
  "device": "mobile",
  "throttling": "4G"
}
```

**Response:**
```json
{
  "success": true,
  "metrics": {
    "firstContentfulPaint": 1200,
    "largestContentfulPaint": 2500,
    "firstInputDelay": 150,
    "cumulativeLayoutShift": 0.1,
    "speedIndex": 1800
  },
  "opportunities": [
    "Remove unused CSS",
    "Optimize images",
    "Minify JavaScript"
  ]
}
```

### Accessibility Testing
```http
POST /test-accessibility
```

**Request Body:**
```json
{
  "url": "https://example.com",
  "level": "AA"
}
```

**Response:**
```json
{
  "success": true,
  "score": 92,
  "violations": [
    {
      "id": "color-contrast",
      "impact": "serious",
      "description": "Elements must meet minimum color contrast requirements"
    }
  ],
  "passes": [
    {
      "id": "document-title",
      "description": "Document has a non-empty <title> element"
    }
  ]
}
```

### SEO Analysis
```http
POST /analyze-seo
```

**Request Body:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "success": true,
  "score": 88,
  "meta": {
    "title": "Example Page",
    "description": "This is an example page",
    "keywords": ["example", "page"]
  },
  "structuredData": {
    "schema": "Article",
    "valid": true
  },
  "issues": [
    "Missing meta description",
    "No structured data found"
  ]
}
```

## 🔧 Element Interaction Endpoints

### Click Element
```http
POST /interact/click
```

**Request Body:**
```json
{
  "selector": "button[type='submit']",
  "url": "https://example.com",
  "waitForSelector": true,
  "timeout": 10000
}
```

**Response:**
```json
{
  "success": true,
  "element": {
    "tagName": "BUTTON",
    "textContent": "Submit",
    "attributes": {
      "type": "submit",
      "class": "btn btn-primary"
    }
  }
}
```

### Fill Input
```http
POST /interact/fill
```

**Request Body:**
```json
{
  "selector": "input[name='email']",
  "value": "user@example.com",
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "success": true,
  "element": {
    "tagName": "INPUT",
    "value": "user@example.com",
    "type": "email"
  }
}
```

### Hover Element
```http
POST /interact/hover
```

**Request Body:**
```json
{
  "selector": ".dropdown-trigger",
  "url": "https://example.com"
}
```

### Scroll Element
```http
POST /interact/scroll
```

**Request Body:**
```json
{
  "selector": "body",
  "url": "https://example.com",
  "direction": "down",
  "amount": 500
}
```

### Wait for Element
```http
POST /interact/wait
```

**Request Body:**
```json
{
  "selector": ".dynamic-content",
  "url": "https://example.com",
  "timeout": 10000,
  "visible": true
}
```

### Find by Text
```http
POST /interact/text-selector
```

**Request Body:**
```json
{
  "text": "Submit Form",
  "url": "https://example.com",
  "exact": false
}
```

### Find by ARIA
```http
POST /interact/aria-selector
```

**Request Body:**
```json
{
  "attributes": {
    "name": "Submit",
    "role": "button"
  },
  "url": "https://example.com"
}
```

### Shadow DOM Interaction
```http
POST /interact/shadow-dom
```

**Request Body:**
```json
{
  "selector": "my-element >>> button",
  "url": "https://example.com",
  "action": "click"
}
```

### Form Automation
```http
POST /interact/fill-form
```

**Request Body:**
```json
{
  "url": "https://example.com",
  "formData": {
    "input[name='username']": "testuser",
    "input[name='email']": "user@example.com",
    "input[name='password']": "password123",
    "select[name='country']": "US"
  }
}
```

## 💻 JavaScript Execution Endpoints

### Evaluate JavaScript
```http
POST /js/evaluate
```

**Request Body:**
```json
{
  "script": "return document.title;",
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "success": true,
  "result": "Example Page",
  "type": "string"
}
```

### Execute Function
```http
POST /js/execute-function
```

**Request Body:**
```json
{
  "functionBody": "return arg0 + arg1;",
  "args": [5, 10],
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "success": true,
  "result": 15,
  "type": "number"
}
```

### Execute with DOM Context
```http
POST /js/execute-with-dom
```

**Request Body:**
```json
{
  "script": "return document.querySelector('h1').textContent;",
  "url": "https://example.com"
}
```

### Execute Promise
```http
POST /js/execute-promise
```

**Request Body:**
```json
{
  "script": "return fetch('/api/data').then(r => r.json());",
  "url": "https://example.com",
  "timeout": 10000
}
```

### Get Element Handle
```http
POST /js/get-element-handle
```

**Request Body:**
```json
{
  "selector": "button[type='submit']",
  "url": "https://example.com"
}
```

### Execute on Element
```http
POST /js/execute-on-element
```

**Request Body:**
```json
{
  "selector": "input[name='email']",
  "script": "return this.value;",
  "url": "https://example.com"
}
```

### Execute on Elements
```http
POST /js/execute-on-elements
```

**Request Body:**
```json
{
  "selector": "input[type='text']",
  "script": "return this.value;",
  "url": "https://example.com"
}
```

### Inject Script
```http
POST /js/inject-script
```

**Request Body:**
```json
{
  "script": "window.customFunction = () => console.log('Injected!');",
  "url": "https://example.com"
}
```

## 🌐 Network Interception Endpoints

### Enable Interception
```http
POST /network/enable-interception
```

**Request Body:**
```json
{
  "url": "https://example.com",
  "priority": 0
}
```

### Block Requests
```http
POST /network/block-requests
```

**Request Body:**
```json
{
  "patterns": [".png", ".jpg", "analytics"],
  "reason": "performance optimization",
  "url": "https://example.com"
}
```

### Block Resource Types
```http
POST /network/block-resource-types
```

**Request Body:**
```json
{
  "types": ["image", "stylesheet", "font"],
  "url": "https://example.com"
}
```

### Modify Headers
```http
POST /network/modify-headers
```

**Request Body:**
```json
{
  "headers": {
    "User-Agent": "Custom Bot/1.0",
    "X-Custom-Header": "value"
  },
  "url": "https://example.com"
}
```

### Mock Response
```http
POST /network/mock-response
```

**Request Body:**
```json
{
  "urlPattern": "/api/users",
  "mockData": {
    "status": 200,
    "body": {
      "users": [
        {"id": 1, "name": "John Doe"}
      ]
    }
  },
  "url": "https://example.com"
}
```

### Throttle Requests
```http
POST /network/throttle-requests
```

**Request Body:**
```json
{
  "latency": 1000,
  "downloadThroughput": 1024,
  "uploadThroughput": 512,
  "url": "https://example.com"
}
```

### Add Intercept Handler
```http
POST /network/add-handler
```

**Request Body:**
```json
{
  "handler": {
    "name": "custom-handler",
    "pattern": "/api/*",
    "action": "modify"
  },
  "url": "https://example.com"
}
```

### Get Request Log
```http
GET /network/request-log
```

**Response:**
```json
{
  "success": true,
  "requests": [
    {
      "url": "https://example.com/api/data",
      "method": "GET",
      "status": 200,
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Response Log
```http
GET /network/response-log
```

### Get Blocked Requests
```http
GET /network/blocked-requests
```

### Get Modified Requests
```http
GET /network/modified-requests
```

### Clear Logs
```http
POST /network/clear-logs
```

## 🚀 WebDriver BiDi Endpoints

### Connect BiDi
```http
POST /bidi/connect
```

**Request Body:**
```json
{
  "url": "https://example.com"
}
```

### Create Browsing Context
```http
POST /bidi/create-context
```

**Request Body:**
```json
{
  "url": "https://example.com",
  "contextType": "tab"
}
```

### Navigate via BiDi
```http
POST /bidi/navigate
```

**Request Body:**
```json
{
  "url": "https://example.com",
  "wait": "complete"
}
```

### Screenshot via BiDi
```http
POST /bidi/screenshot
```

**Request Body:**
```json
{
  "format": "png",
  "quality": 90
}
```

### Evaluate Script via BiDi
```http
POST /bidi/evaluate
```

**Request Body:**
```json
{
  "script": "return document.title;",
  "awaitPromise": true
}
```

### Add Preload Script
```http
POST /bidi/add-preload
```

**Request Body:**
```json
{
  "script": "window.preloadFunction = () => console.log('Preloaded!');"
}
```

### Locate Nodes
```http
POST /bidi/locate-nodes
```

**Request Body:**
```json
{
  "selector": "button",
  "locator": "css"
}
```

### Get Tree
```http
GET /bidi/tree
```

### Get Realms
```http
GET /bidi/realms
```

### Set Viewport
```http
POST /bidi/set-viewport
```

**Request Body:**
```json
{
  "width": 1920,
  "height": 1080
}
```

### Close Context
```http
POST /bidi/close-context
```

### End Session
```http
POST /bidi/end-session
```

### Get Events
```http
GET /bidi/events
```

### Clear Events
```http
POST /bidi/clear-events
```

## 📝 Console & Network Logs

### Get Console Logs
```http
GET /console-logs
```

**Response:**
```json
{
  "success": true,
  "logs": [
    {
      "level": "info",
      "message": "Page loaded successfully",
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Console Errors
```http
GET /console-errors
```

### Get Network Logs
```http
GET /network-logs
```

### Get Network Errors
```http
GET /network-errors
```

### Wipe All Logs
```http
POST /wipe-logs
```

## 🔧 Utility Endpoints

### Get Browser Info
```http
GET /browser/info
```

**Response:**
```json
{
  "success": true,
  "browser": {
    "name": "Chromium",
    "version": "120.0.6099.109",
    "userAgent": "Mozilla/5.0...",
    "platform": "Linux x86_64"
  }
}
```

### Get Page Info
```http
GET /page/info
```

**Response:**
```json
{
  "success": true,
  "page": {
    "url": "https://example.com",
    "title": "Example Page",
    "viewport": { "width": 1920, "height": 1080 },
    "cookies": []
  }
}
```

### Set Viewport
```http
POST /viewport/set
```

**Request Body:**
```json
{
  "width": 1920,
  "height": 1080,
  "deviceScaleFactor": 1,
  "isMobile": false,
  "hasTouch": false,
  "isLandscape": false
}
```

### Navigate to URL
```http
POST /navigate
```

**Request Body:**
```json
{
  "url": "https://example.com",
  "waitUntil": "networkidle0",
  "timeout": 30000
}
```

## 📊 Response Formats

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "executionTime": 1250
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ELEMENT_NOT_FOUND",
    "message": "Element with selector 'button' not found",
    "details": "Selector returned 0 elements"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🚨 Error Codes

| Code | Description |
|------|-------------|
| `INVALID_URL` | Malformed or invalid URL |
| `ELEMENT_NOT_FOUND` | CSS selector returned no elements |
| `TIMEOUT` | Operation exceeded maximum time |
| `NETWORK_ERROR` | Network request failed |
| `BROWSER_ERROR` | Browser automation error |
| `INVALID_PARAMETER` | Missing or invalid parameter |
| `NOT_IMPLEMENTED` | Feature not yet implemented |

## 📡 Rate Limiting

- **Default**: 100 requests per minute per IP
- **Screenshots**: 10 per minute per IP
- **Lighthouse**: 5 per minute per IP
- **Network Interception**: 50 per minute per IP

## 🔐 Authentication

Currently, the API runs without authentication in development mode. For production use, implement:

- API key authentication
- JWT tokens
- OAuth 2.0
- IP whitelisting

---

**Explore the full power of MCP-Tools through our comprehensive API! 🚀**
