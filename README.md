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
- **Element Interaction**: Click, type, hover, and form automation
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

## 🙏 Acknowledgments

- **Model Context Protocol**: For the MCP framework
- **Puppeteer**: For browser automation capabilities
- **Lighthouse**: For web analysis and auditing
- **Docker**: For containerization and deployment

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/zachshallbetter/MCP-Tools/issues)
- **Documentation**: [Wiki](https://github.com/zachshallbetter/MCP-Tools/wiki)
- **Discussions**: [GitHub Discussions](https://github.com/zachshallbetter/MCP-Tools/discussions)

---

**Built with ❤️ for the MCP community**
