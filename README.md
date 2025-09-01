# 🚀 MCP-Tools: Advanced Browser Automation & Web Analysis

> **Enterprise-grade browser automation platform with W3C WebDriver BiDi, network interception, and comprehensive web analysis**

A powerful collection of Model Context Protocol (MCP) tools for advanced browser automation, web analysis, and development workflows. Built with Node.js, Docker, and cutting-edge web technologies including the latest W3C standards.

## ✨ Features

### 🔍 **Advanced Screenshot Capabilities**
- **HTTPS Support**: Handle self-signed certificates automatically
- **Full Page Rendering**: Capture complete web pages with dynamic content
- **Custom Viewports**: Support for desktop, mobile, and tablet resolutions
- **Direct URL Access**: No browser navigation required
- **Multi-Format Support**: PNG, JPEG, WebP, and PDF output

### 📊 **Lighthouse Integration**
- **Performance Audits**: Detailed performance metrics and optimization suggestions
- **Accessibility Testing**: WCAG compliance and accessibility analysis
- **SEO Analysis**: Meta tags, structured data, and SEO optimization
- **Best Practices**: Security, performance, and coding standards
- **Core Web Vitals**: FCP, LCP, FID, CLS, and TTI metrics

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
- **WebDriver BiDi**: W3C-standard bidirectional browser automation protocol
- **Real-time Events**: Live browsing context and script events
- **Responsive Testing**: Cross-device compatibility validation

### 🐳 **Docker Integration**
- **Containerized Environment**: Consistent deployment across platforms
- **HTTPS Support**: Built-in SSL certificate generation
- **Easy Setup**: One-command deployment with Docker Compose
- **Resource Management**: Configurable memory and CPU limits
- **Health Monitoring**: Built-in health checks and monitoring

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

# Mobile viewport screenshot
curl -X POST http://localhost:3025/capture-screenshot \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "viewport": {"width": 375, "height": 667}}'
```

### Lighthouse Audits
```bash
# Run comprehensive Lighthouse audit
curl -X POST http://localhost:3025/lighthouse-audit \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "categories": ["performance", "accessibility"]}'

# Mobile performance analysis
curl -X POST http://localhost:3025/analyze-performance \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "device": "mobile"}'
```

### Enhanced Element Interactions
```bash
# Click element with automatic waiting
curl -X POST http://localhost:3025/interact/click \
  -H "Content-Type: application/json" \
  -d '{"selector": "button[type=\"submit\"]", "url": "https://example.com"}'

# Fill form with multiple fields
curl -X POST http://localhost:3025/interact/fill-form \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "formData": {"input[name=\"email\"]": "user@example.com", "input[name=\"password\"]": "password123"}}'

# Find element by text content
curl -X POST http://localhost:3025/interact/text-selector \
  -H "Content-Type: application/json" \
  -d '{"text": "Submit Form", "url": "https://example.com"}'
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
```

### Network Interception
```bash
# Enable network interception
curl -X POST http://localhost:3025/network/enable-interception \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'

# Block image and analytics requests
curl -X POST http://localhost:3025/network/block-requests \
  -H "Content-Type: application/json" \
  -d '{"patterns": [".png", ".jpg", "analytics"], "reason": "performance optimization"}'

# Mock API response
curl -X POST http://localhost:3025/network/mock-response \
  -H "Content-Type: application/json" \
  -d '{"urlPattern": "/api/users", "mockData": {"status": 200, "body": {"users": [{"id": 1, "name": "John"}]}}}'
```

### WebDriver BiDi (W3C Standard)
```bash
# Connect to WebDriver BiDi
curl -X POST http://localhost:3025/bidi/connect \
  -H "Content-Type: application/json"

# Create browsing context
curl -X POST http://localhost:3025/bidi/create-context \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'

# Navigate via BiDi
curl -X POST http://localhost:3025/bidi/navigate \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'

# Take screenshot via BiDi
curl -X POST http://localhost:3025/bidi/screenshot \
  -H "Content-Type: application/json"

# Evaluate script via BiDi
curl -X POST http://localhost:3025/bidi/evaluate \
  -H "Content-Type: application/json" \
  -d '{"script": "return document.title;", "awaitPromise": true}'
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
│   ├── enhanced-interaction-service.js
│   ├── javascript-execution-service.js
│   ├── network-interception-service.js
│   ├── webdriver-bidi-service.js
│   └── secure-server.ts
├── docs/                      # Comprehensive documentation
├── docker-compose.yml         # Docker configuration
├── Dockerfile                 # Container definition
└── start-server.sh           # Startup script
```

## 📚 Documentation

### **Getting Started**
- **[Getting Started Guide](browser-tools-mcp/docs/getting-started.md)**: Complete setup and configuration
- **[Docker Guide](browser-tools-mcp/docs/docker-guide.md)**: Containerization and deployment
- **[API Reference](browser-tools-mcp/docs/api-reference.md)**: Complete API documentation
- **[Features Guide](browser-tools-mcp/docs/features.md)**: Detailed feature overview
- **[Troubleshooting](browser-tools-mcp/docs/troubleshooting.md)**: Common issues and solutions

### **Key Concepts**
- **Model Context Protocol**: AI client integration framework
- **WebDriver BiDi**: W3C-standard browser automation
- **Puppeteer**: Advanced browser control and automation
- **Lighthouse**: Web performance and quality analysis
- **Docker**: Containerized deployment and management

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

### Testing
```bash
# Test basic functionality
curl http://localhost:3025/.identity

# Test screenshot capability
curl -X POST http://localhost:3025/capture-screenshot \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'

# Test MCP server
node browser-tools-mcp/simple-mcp-server.js
```

## 🚀 Advanced Features

### **Enhanced Element Interactions (Inspired by [Puppeteer](https://pptr.dev/guides/page-interactions))**
- **Automatic Waiting**: Elements are automatically waited for with proper state validation
- **Stability Checks**: Bounding box stability over animation frames
- **Viewport Positioning**: Automatic scrolling to bring elements into view
- **State Validation**: Ensures elements are visible, enabled, and ready for interaction

### **JavaScript Execution (Inspired by [Puppeteer JavaScript Execution](https://pptr.dev/guides/javascript-execution))**
- **Page Context Execution**: Execute JavaScript directly in the page context with full DOM access
- **Handle Management**: Work with JSHandle and ElementHandle for complex object manipulation
- **Function Execution**: Execute custom functions with argument passing and return value handling
- **Element-Specific Scripts**: Run scripts on specific elements or element collections
- **Promise Support**: Handle asynchronous operations and promises with automatic awaiting
- **Script Injection**: Inject and execute custom scripts with full page context access

### **Network Interception (Inspired by [Puppeteer Network Interception](https://pptr.dev/guides/network-interception))**
- **Request Interception**: Intercept and control every network request before it's made
- **Cooperative Intercept Mode**: Multiple handlers working together with priority-based resolution
- **Request Blocking**: Block requests by URL patterns, resource types, or custom criteria
- **Header Modification**: Modify request headers for authentication, testing, or debugging
- **Response Mocking**: Mock API responses for testing and development
- **Request Throttling**: Simulate slow network conditions and test performance

### **WebDriver BiDi (W3C Standard - [Specification](https://w3c.github.io/webdriver-bidi/))**
- **Bidirectional Communication**: Real-time two-way communication with the browser
- **W3C Standard**: Industry-standard protocol for browser automation
- **Browsing Context Management**: Create, navigate, and manage browser contexts
- **Real-time Events**: Live subscription to browsing context and script events
- **Script Execution**: Execute scripts in sandboxed realms with full context access
- **Node Location**: Locate DOM nodes using CSS selectors with BiDi protocol
- **Preload Scripts**: Inject scripts that run before page load
- **Session Management**: Full session lifecycle management with proper cleanup

## 🔒 Security & HTTPS

### HTTPS Support
```bash
# Enable HTTPS
export ENABLE_HTTPS=true
docker-compose up -d

# Generate certificates
cd browser-tools-mcp/browser-tools-server
node generate-certs.js

# Test HTTPS endpoint
curl -k https://localhost:3026/.identity
```

### Security Features
- **Self-signed Certificate Generation**: Automatic SSL certificate creation
- **TLS 1.2+ Support**: Modern encryption standards
- **Request Validation**: Input sanitization and validation
- **Rate Limiting**: Configurable request rate limiting
- **Access Control**: IP whitelisting and authentication support

## 📊 Monitoring & Performance

### Health Checks
```bash
# Service health
curl http://localhost:3025/.identity

# Container status
docker-compose ps

# Resource usage
docker stats browser-tools-mcp-dev
```

### Performance Optimization
- **Headless Browser**: Resource-efficient operation
- **Connection Pooling**: HTTP connection reuse
- **Memory Management**: Efficient memory usage and cleanup
- **Request Batching**: Multiple operations in single requests

## 🔧 Configuration

### Environment Variables
```bash
# Server configuration
PORT=3025
ENABLE_HTTPS=true
CERT_DIR=/app/certs
CHROMIUM_PATH=/usr/bin/chromium

# Development mode
NODE_ENV=development
DEBUG=browser-tools:*
LOG_LEVEL=debug
```

### Docker Configuration
```yaml
# docker-compose.yml
version: '3.8'
services:
  browser-tools-mcp-dev:
    build: .
    ports:
      - "3025:3025"  # HTTP
      - "3026:3026"  # HTTPS
    environment:
      - ENABLE_HTTPS=true
      - PORT=3025
    volumes:
      - ./browser-tools-mcp:/app
      - ./browser-tools-mcp/certs:/app/certs
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- **Code Style**: Follow existing code patterns and ESLint rules
- **Testing**: Include tests for new features
- **Documentation**: Update relevant documentation
- **TypeScript**: Use TypeScript for new features when possible

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Model Context Protocol**: For the MCP framework
- **Puppeteer**: For browser automation capabilities and advanced interaction patterns
- **Lighthouse**: For web analysis and auditing
- **W3C WebDriver BiDi**: For the bidirectional protocol specification
- **Docker**: For containerization and deployment

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/zachshallbetter/MCP-Tools/issues)
- **Documentation**: [Wiki](https://github.com/zachshallbetter/MCP-Tools/wiki)
- **Discussions**: [GitHub Discussions](https://github.com/zachshallbetter/MCP-Tools/discussions)
- **Community**: [MCP Community](https://modelcontextprotocol.io/)

## 🚀 Roadmap

### **Upcoming Features**
- **Multi-Browser Support**: Firefox, Safari, and Edge automation
- **Cloud Deployment**: AWS, Azure, and Google Cloud integration
- **CI/CD Integration**: GitHub Actions, Jenkins, and GitLab CI
- **Advanced Analytics**: Performance metrics and trend analysis
- **Plugin System**: Extensible architecture for custom tools

### **Performance Improvements**
- **Parallel Processing**: Concurrent browser automation
- **Resource Optimization**: Memory and CPU usage optimization
- **Caching System**: Intelligent response caching
- **Load Balancing**: Horizontal scaling and distribution

---

**MCP-Tools: The most comprehensive browser automation platform for professional web development and testing workflows! 🚀**

*Built with ❤️ for the MCP community*
