# 🚀 Getting Started with MCP-Tools

> **Complete setup guide for the advanced browser automation platform**

## 📋 Prerequisites

### System Requirements
- **Operating System**: macOS, Linux, or Windows (with WSL2)
- **Docker**: Version 20.10+ with Docker Compose
- **Node.js**: Version 18+ (for local development)
- **Git**: For cloning the repository
- **Memory**: Minimum 4GB RAM, recommended 8GB+
- **Storage**: At least 2GB free space

### Software Installation

#### Docker & Docker Compose
```bash
# macOS (with Homebrew)
brew install --cask docker

# Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose

# Windows
# Download Docker Desktop from https://www.docker.com/products/docker-desktop
```

#### Node.js
```bash
# macOS (with Homebrew)
brew install node

# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Windows
# Download from https://nodejs.org/
```

## 🏗️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/zachshallbetter/MCP-Tools.git
cd MCP-Tools
```

### 2. Verify Docker Installation
```bash
docker --version
docker-compose --version
```

### 3. Start the Platform
```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps
```

### 4. Verify Installation
```bash
# Check server health
curl http://localhost:3025/.identity

# Expected response:
# {
#   "name": "browser-tools-server",
#   "version": "1.0.0",
#   "status": "running"
# }
```

## ⚙️ Configuration

### MCP Configuration

#### For Cursor IDE
Create or update `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "browser-tools": {
      "command": "node",
      "args": [
        "/usr/local/Projects/mcp/browser-tools-mcp/dist/mcp-server.js"
      ],
      "env": {}
    }
  }
}
```

#### For Other MCP Clients
```json
{
  "mcpServers": {
    "browser-tools": {
      "command": "node",
      "args": [
        "/path/to/your/MCP-Tools/browser-tools-mcp/dist/mcp-server.js"
      ],
      "env": {
        "BROWSER_TOOLS_PORT": "3025",
        "BROWSER_TOOLS_HOST": "localhost"
      }
    }
  }
}
```

### Environment Variables

#### Docker Environment
```bash
# Enable HTTPS (optional)
ENABLE_HTTPS=true

# Custom port
PORT=3025

# Certificate directory
CERT_DIR=/app/certs
```

#### Local Development
```bash
# Server configuration
export PORT=3025
export ENABLE_HTTPS=false
export CHROMIUM_PATH=/usr/bin/chromium

# Development mode
export NODE_ENV=development
export DEBUG=browser-tools:*
```

## 🧪 Testing Your Installation

### Basic Functionality Test
```bash
# Test screenshot capability
curl -X POST http://localhost:3025/capture-screenshot \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'

# Test Lighthouse integration
curl -X POST http://localhost:3025/lighthouse-audit \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

### MCP Tool Test
```bash
# Test MCP server connection
node browser-tools-mcp/simple-mcp-server.js
```

## 🔧 Troubleshooting

### Common Issues

#### Docker Container Won't Start
```bash
# Check Docker logs
docker-compose logs

# Check available ports
netstat -tulpn | grep :3025

# Restart Docker service
sudo systemctl restart docker
```

#### MCP Connection Issues
```bash
# Verify MCP server is running
ps aux | grep mcp-server

# Check MCP configuration
cat ~/.cursor/mcp.json

# Test MCP server directly
node browser-tools-mcp/dist/mcp-server.js
```

#### Certificate Issues (HTTPS)
```bash
# Generate new certificates
cd browser-tools-mcp/browser-tools-server
node generate-certs.js

# Check certificate validity
openssl x509 -in certs/cert.pem -text -noout
```

### Debug Mode
```bash
# Enable debug logging
export DEBUG=browser-tools:*

# Start with verbose output
docker-compose up --build
```

## 📚 Next Steps

### Explore Features
1. **Screenshots**: Try different viewport sizes and full-page captures
2. **Lighthouse**: Run performance and accessibility audits
3. **Element Interactions**: Test advanced locator-based interactions
4. **Network Interception**: Experiment with request blocking and mocking
5. **WebDriver BiDi**: Explore W3C-standard browser automation

### Development Workflow
1. **Local Development**: Use `npm run dev` for hot reloading
2. **Testing**: Run `npm test` for automated testing
3. **Building**: Use `npm run build` for production builds
4. **Deployment**: Use Docker for consistent deployment

### Integration Examples
- **CI/CD Pipelines**: Automated testing and deployment
- **Web Development**: Real-time debugging and analysis
- **Quality Assurance**: Automated accessibility and performance testing
- **Research**: Web scraping and data collection

## 🆘 Getting Help

### Resources
- **Documentation**: [GitHub Wiki](https://github.com/zachshallbetter/MCP-Tools/wiki)
- **Issues**: [GitHub Issues](https://github.com/zachshallbetter/MCP-Tools/issues)
- **Discussions**: [GitHub Discussions](https://github.com/zachshallbetter/MCP-Tools/discussions)

### Community
- **MCP Community**: [Model Context Protocol](https://modelcontextprotocol.io/)
- **Puppeteer**: [Official Documentation](https://pptr.dev/)
- **WebDriver BiDi**: [W3C Specification](https://w3c.github.io/webdriver-bidi/)

---

**Ready to automate? Start with a simple screenshot and explore the possibilities! 🚀**
