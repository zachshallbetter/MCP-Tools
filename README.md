# 🚀 MCP-Tools: Advanced Browser Automation & Web Analysis

A powerful collection of Model Context Protocol (MCP) tools for browser automation, web analysis, and development workflows. Built with Node.js, Docker, and cutting-edge web technologies.

## ✨ Features

### 🔍 **Advanced Screenshot Capabilities**
- **HTTPS Support**: Handle self-signed certificates automatically
- **Full Page Rendering**: Capture complete web pages with dynamic content
- **Custom Viewports**: Support for desktop, mobile, and tablet resolutions
- **Direct URL Access**: No browser navigation required

### 📊 **Lighthouse Integration**
- **Performance Audits**: Detailed performance metrics and optimization suggestions
- **Accessibility Testing**: WCAG compliance and accessibility analysis
- **SEO Analysis**: Meta tags, structured data, and SEO optimization
- **Best Practices**: Security, performance, and coding standards

### 🔧 **Development Tools**
- **Console Monitoring**: Real-time console logs and error tracking
- **Network Analysis**: Request/response monitoring and debugging
- **Enhanced Element Interactions**: Advanced locator-based interactions with automatic waiting
- **Advanced Selectors**: Text, ARIA, and Shadow DOM selectors
- **Form Automation**: Multi-field form filling with validation
- **Keyboard & Mouse Control**: Precise input and click interactions
- **JavaScript Execution**: Execute JavaScript in page context with full DOM access
- **Element Script Execution**: Run scripts on specific elements or element collections
- **Script Injection**: Inject and execute custom scripts with page context access
- **Network Interception**: Intercept, block, modify, and mock network requests
- **Request/Response Monitoring**: Real-time network traffic analysis
- **Responsive Testing**: Cross-device compatibility validation

### 🐳 **Docker Integration**
- **Containerized Environment**: Consistent deployment across platforms
- **HTTPS Support**: Built-in SSL certificate generation
- **Easy Setup**: One-command deployment with Docker Compose

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/zachshallbetter/MCP-Tools.git
   cd MCP-Tools
   ```

2. **Start with Docker**
   ```bash
   docker-compose up -d
   ```

3. **Verify installation**
   ```bash
   curl http://localhost:3025/.identity
   ```

### MCP Configuration

Add to your MCP configuration (e.g., `~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "browser-tools": {
      "command": "node",
      "args": [
        "/path/to/MCP-Tools/browser-tools-mcp/dist/mcp-server.js"
      ],
      "env": {}
    }
  }
}
```

## 📖 Usage Examples

### Screenshots
```bash
# Take a screenshot of any website
curl -X POST http://localhost:3025/capture-screenshot \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "fullPage": true}'
```

### Lighthouse Audits
```bash
# Run comprehensive Lighthouse audit
curl -X POST http://localhost:3025/lighthouse-audit \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

### Performance Analysis
```bash
# Analyze performance with device simulation
curl -X POST http://localhost:3025/analyze-performance \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "device": "mobile"}'
```

### Enhanced Element Interactions
```bash
# Click element with automatic waiting and stability checks
curl -X POST http://localhost:3025/interact/click \
  -H "Content-Type: application/json" \
  -d '{"selector": "button[type=\"submit\"]", "url": "https://example.com"}'

# Fill input with smart detection
curl -X POST http://localhost:3025/interact/fill \
  -H "Content-Type: application/json" \
  -d '{"selector": "input[name=\"email\"]", "value": "user@example.com"}'

# Find element by text content
curl -X POST http://localhost:3025/interact/text-selector \
  -H "Content-Type: application/json" \
  -d '{"text": "Submit Form", "url": "https://example.com"}'

# Interact with Shadow DOM elements
curl -X POST http://localhost:3025/interact/shadow-dom \
  -H "Content-Type: application/json" \
  -d '{"hostSelector": "my-custom-element", "targetSelector": "button"}'

# Fill multiple form fields
curl -X POST http://localhost:3025/interact/fill-form \
  -H "Content-Type: application/json" \
  -d '{"formData": {"input[name=\"username\"]": "testuser", "input[name=\"password\"]": "password123"}}'
```

### JavaScript Execution
```bash
# Execute JavaScript in page context
curl -X POST http://localhost:3025/js/evaluate \
  -H "Content-Type: application/json" \
  -d '{"script": "return document.title;", "url": "https://example.com"}'

# Execute function with arguments
curl -X POST http://localhost:3025/js/execute-function \
  -H "Content-Type: application/json" \
  -d '{"functionBody": "return arg0 + arg1;", "args": [5, 10]}'

# Execute script on specific element
curl -X POST http://localhost:3025/js/execute-on-element \
  -H "Content-Type: application/json" \
  -d '{"selector": "input[name=\"email\"]", "script": "return this.value;"}'

# Execute script on multiple elements
curl -X POST http://localhost:3025/js/execute-on-elements \
  -H "Content-Type: application/json" \
  -d '{"selector": "a", "script": "return Array.from(this).map(el => ({ text: el.textContent, href: el.href }));"}'

# Inject custom script
curl -X POST http://localhost:3025/js/inject-script \
  -H "Content-Type: application/json" \
  -d '{"script": "window.customData = { timestamp: Date.now() }; return window.customData;", "url": "https://example.com"}'
```

### Network Interception
```bash
# Enable network interception
curl -X POST http://localhost:3025/network/enable-interception \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "priority": 0}'

# Block image and analytics requests
curl -X POST http://localhost:3025/network/block-requests \
  -H "Content-Type: application/json" \
  -d '{"patterns": [".png", ".jpg", "analytics"], "reason": "performance optimization"}'

# Block resource types
curl -X POST http://localhost:3025/network/block-resource-types \
  -H "Content-Type: application/json" \
  -d '{"resourceTypes": ["image", "stylesheet"], "reason": "reduce bandwidth"}'

# Modify headers for API requests
curl -X POST http://localhost:3025/network/modify-headers \
  -H "Content-Type: application/json" \
  -d '{"urlPattern": "api.example.com", "headerModifications": {"Authorization": "Bearer token123"}}'

# Mock API response
curl -X POST http://localhost:3025/network/mock-response \
  -H "Content-Type: application/json" \
  -d '{"urlPattern": "/api/users", "mockData": {"status": 200, "body": {"users": [{"id": 1, "name": "John"}]}}}'

# Throttle requests
curl -X POST http://localhost:3025/network/throttle-requests \
  -H "Content-Type: application/json" \
  -d '{"urlPattern": "api.example.com", "delay": 2000}'

# Get network logs
curl http://localhost:3025/network/request-log
curl http://localhost:3025/network/blocked-requests
```

## 🏗️ Architecture

```
MCP-Tools/
├── browser-tools-mcp/          # MCP server implementation
│   ├── mcp-server.ts          # Main MCP server
│   └── dist/                  # Compiled JavaScript
├── browser-tools-server/      # HTTP API server
│   ├── browser-connector-extended.js
│   ├── chromium-screenshot-service.js
│   ├── lighthouse-service.js
│   └── secure-server.ts
├── docs/                      # Documentation
├── docker-compose.yml         # Docker configuration
├── Dockerfile                 # Container definition
└── start-server.sh           # Startup script
```

## 🔧 Development

### Local Development
```bash
# Install dependencies
npm install

# Build MCP server
cd browser-tools-mcp && npm run build

# Start HTTP server
cd ../browser-tools-server && node browser-connector-extended.js
```

### Docker Development
```bash
# Build and start
docker-compose up --build

# View logs
docker-compose logs -f

# Access container
docker exec -it browser-tools-mcp-dev bash
```

## 📚 API Reference

### Core Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/.identity` | GET | Server health and capabilities |
| `/capture-screenshot` | POST | Take screenshots with advanced options |
| `/lighthouse-audit` | POST | Comprehensive Lighthouse analysis |
| `/analyze-performance` | POST | Performance analysis with device simulation |
| `/test-accessibility` | POST | Accessibility testing with WCAG compliance |
| `/analyze-seo` | POST | SEO analysis and optimization |
| `/console-logs` | GET | Browser console logs |
| `/network-logs` | GET | Network request/response logs |

### MCP Tools

| Tool | Description |
|------|-------------|
| `takeScreenshot` | Capture screenshots of web pages |
| `getConsoleLogs` | Retrieve browser console logs |
| `getConsoleErrors` | Get console error messages |
| `getNetworkLogs` | Monitor network activity |
| `getNetworkErrors` | Track network failures |
| `clickElement` | Enhanced element clicking with automatic waiting |
| `fillInput` | Smart input filling with type detection |
| `hoverElement` | Element hovering with stability checks |
| `scrollElement` | Element scrolling with viewport positioning |
| `waitForElement` | Element waiting with state validation |
| `findElementByText` | Find elements by text content |
| `findElementByAria` | Find elements by ARIA attributes |
| `interactWithShadowDOM` | Interact with Shadow DOM elements |
| `fillForm` | Multi-field form automation |
| `typeText` | Enhanced keyboard typing |
| `mouseClick` | Precise mouse click interactions |
| `evaluateJavaScript` | Execute JavaScript in page context |
| `executeFunction` | Execute custom functions with arguments |
| `executeOnElement` | Run scripts on specific elements |
| `executeOnElements` | Run scripts on element collections |
| `injectScript` | Inject and execute custom scripts |
| `enableNetworkInterception` | Enable network request interception |
| `blockRequests` | Block requests matching patterns |
| `blockResourceTypes` | Block requests by resource type |
| `modifyHeaders` | Modify request headers |
| `mockResponse` | Mock API responses |
| `throttleRequests` | Throttle request timing |
| `getRequestLog` | Get intercepted request log |
| `getResponseLog` | Get response log |

## 🛠️ Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3025 | HTTP server port |
| `ENABLE_HTTPS` | false | Enable HTTPS with self-signed certificates |
| `CHROMIUM_PATH` | `/usr/bin/chromium` | Chromium executable path |
| `SCREENSHOT_TIMEOUT` | 30000 | Screenshot timeout in milliseconds |

### Docker Configuration

The Docker setup includes:
- **Chromium**: For browser automation
- **Node.js**: Runtime environment
- **OpenSSL**: Certificate generation
- **HTTPS Support**: Self-signed certificate generation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🚀 Enhanced Features (Inspired by Puppeteer)

Our enhanced interaction system is built on modern Puppeteer patterns from the [official documentation](https://pptr.dev/guides/page-interactions):

### **Advanced Locator System**
- **Automatic Waiting**: Elements are automatically waited for with proper state validation
- **Stability Checks**: Bounding box stability over animation frames
- **Viewport Positioning**: Automatic scrolling to bring elements into view
- **State Validation**: Ensures elements are visible, enabled, and ready for interaction

### **Smart Selectors**
- **Text Selectors**: `::-p-text("Submit Form")` - Find elements by text content
- **ARIA Selectors**: `::-p-aria([name="Submit"][role="button"])` - Accessibility-first selection
- **Shadow DOM**: `my-element >>> button` - Deep shadow DOM traversal
- **Custom Selectors**: Framework-specific selectors (React, Vue, etc.)

### **Enhanced Interactions**
- **Smart Input Detection**: Automatically handles `<input>`, `<select>`, and custom elements
- **Form Automation**: Multi-field form filling with validation
- **Precise Control**: Mouse and keyboard interactions with coordinate precision
- **Error Handling**: Comprehensive error reporting and recovery

### **JavaScript Execution (Inspired by [Puppeteer JavaScript Execution Guide](https://pptr.dev/guides/javascript-execution))**
- **Page Context Execution**: Execute JavaScript directly in the page context with full DOM access
- **Handle Management**: Work with JSHandle and ElementHandle for complex object manipulation
- **Function Execution**: Execute custom functions with argument passing and return value handling
- **Element-Specific Scripts**: Run scripts on specific elements or element collections
- **Promise Support**: Handle asynchronous operations and promises with automatic awaiting
- **Script Injection**: Inject and execute custom scripts with full page context access
- **Return Type Handling**: Automatic serialization of primitive types and object references

### **Network Interception (Inspired by [Puppeteer Network Interception Guide](https://pptr.dev/guides/network-interception))**
- **Request Interception**: Intercept and control every network request before it's made
- **Cooperative Intercept Mode**: Multiple handlers working together with priority-based resolution
- **Request Blocking**: Block requests by URL patterns, resource types, or custom criteria
- **Header Modification**: Modify request headers for authentication, testing, or debugging
- **Response Mocking**: Mock API responses for testing and development
- **Request Throttling**: Simulate slow network conditions and test performance
- **Custom Handlers**: Add custom intercept handlers with full request/response control
- **Comprehensive Logging**: Track all requests, responses, blocked requests, and modifications

## 🙏 Acknowledgments

- **Model Context Protocol**: For the MCP framework
- **Puppeteer**: For browser automation capabilities and advanced interaction patterns
- **Lighthouse**: For web analysis and auditing
- **Docker**: For containerization and deployment

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/zachshallbetter/MCP-Tools/issues)
- **Documentation**: [Wiki](https://github.com/zachshallbetter/MCP-Tools/wiki)
- **Discussions**: [GitHub Discussions](https://github.com/zachshallbetter/MCP-Tools/discussions)

---

**Built with ❤️ for the MCP community**
