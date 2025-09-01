# 🔧 Troubleshooting Guide

> **Solutions for common MCP-Tools issues**

## 🚨 Common Issues

### **Container Won't Start**

#### **Port Already in Use**
```bash
# Check what's using port 3025
netstat -tulpn | grep :3025
lsof -i :3025

# Kill the process
sudo kill -9 <PID>

# Or change the port in docker-compose.yml
ports:
  - "3026:3025"  # Use port 3026 instead
```

#### **Docker Service Issues**
```bash
# Check Docker status
sudo systemctl status docker

# Restart Docker service
sudo systemctl restart docker

# Check Docker daemon logs
sudo journalctl -u docker.service -f
```

#### **Insufficient Resources**
```bash
# Check available memory
free -h

# Check available disk space
df -h

# Check Docker resource usage
docker system df
docker system prune -f
```

### **MCP Connection Issues**

#### **MCP Server Not Found**
```bash
# Check if MCP server is running
ps aux | grep mcp-server

# Verify MCP configuration
cat ~/.cursor/mcp.json

# Test MCP server directly
node browser-tools-mcp/dist/mcp-server.js
```

#### **Wrong MCP Configuration**
```json
// ~/.cursor/mcp.json - CORRECT
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

// ~/.cursor/mcp.json - INCORRECT (old Chrome extension)
{
  "mcpServers": {
    "browser-tools": {
      "command": "npx",
      "args": ["@agentdeskai/browser-tools-mcp@latest"],
      "env": {
        "BROWSER_TOOLS_PORT": "3025",
        "BROWSER_TOOLS_HOST": "localhost"
      }
    }
  }
}
```

#### **Path Issues**
```bash
# Verify the path exists
ls -la /usr/local/Projects/mcp/browser-tools-mcp/dist/mcp-server.js

# Use absolute path in MCP config
# Replace with your actual path
```

### **Browser Automation Issues**

#### **Chromium Not Found**
```bash
# Check if Chromium is installed in container
docker exec browser-tools-mcp-dev which chromium
docker exec browser-tools-mcp-dev chromium --version

# Verify Chromium path in code
grep -r "executablePath" browser-tools-mcp/

# Should be: executablePath: '/usr/bin/chromium'
```

#### **Screenshot Failures**
```bash
# Check browser logs
docker-compose logs browser-tools-mcp-dev

# Test screenshot endpoint directly
curl -X POST http://localhost:3025/capture-screenshot \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'

# Check if target URL is accessible
curl -I https://example.com
```

#### **Element Not Found Errors**
```bash
# Verify selector syntax
# Use browser dev tools to test selectors

# Test with simpler selector first
curl -X POST http://localhost:3025/interact/click \
  -H "Content-Type: application/json" \
  -d '{"selector": "body", "url": "https://example.com"}'

# Check if page is fully loaded
curl -X POST http://localhost:3025/interact/wait \
  -H "Content-Type: application/json" \
  -d '{"selector": "body", "url": "https://example.com"}'
```

### **HTTPS Certificate Issues**

#### **Self-Signed Certificate Warnings**
```bash
# Generate new certificates
cd browser-tools-mcp/browser-tools-server
node generate-certs.js

# Verify certificate validity
openssl x509 -in certs/cert.pem -text -noout

# Test HTTPS endpoint
curl -k https://localhost:3026/.identity
```

#### **Certificate Expired**
```bash
# Check certificate expiration
openssl x509 -in certs/cert.pem -noout -dates

# Regenerate certificates
rm -rf certs/
node generate-certs.js
```

### **Performance Issues**

#### **Slow Screenshots**
```bash
# Check container resources
docker stats browser-tools-mcp-dev

# Optimize viewport size
curl -X POST http://localhost:3025/capture-screenshot \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "viewport": {"width": 1200, "height": 800}}'

# Use viewport-only instead of full-page
curl -X POST http://localhost:3025/capture-screenshot \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "fullPage": false}'
```

#### **High Memory Usage**
```bash
# Check memory usage
docker stats --format "table {{.Container}}\t{{.MemUsage}}\t{{.MemPerc}}"

# Restart container to clear memory
docker-compose restart browser-tools-mcp-dev

# Check for memory leaks in logs
docker-compose logs browser-tools-mcp-dev | grep -i memory
```

## 🔍 Debug Mode

### **Enable Debug Logging**
```bash
# Set debug environment variable
export DEBUG=browser-tools:*

# Or add to docker-compose.yml
environment:
  - DEBUG=browser-tools:*
  - LOG_LEVEL=debug
```

### **Verbose Container Output**
```bash
# Start with verbose output
docker-compose up --build

# Follow logs in real-time
docker-compose logs -f browser-tools-mcp-dev

# Check specific log levels
docker-compose logs -f --tail=100 browser-tools-mcp-dev
```

### **Browser Debug Mode**
```bash
# Access container with debugging tools
docker exec -it browser-tools-mcp-dev bash

# Install debugging tools
apt-get update && apt-get install -y vim curl htop

# Check browser process
ps aux | grep chromium

# Check browser logs
tail -f /var/log/chromium/chromium.log
```

## 🛠️ Diagnostic Commands

### **System Health Check**
```bash
# Overall system status
docker system df
docker system info
docker version

# Container status
docker ps -a
docker-compose ps

# Network status
docker network ls
docker network inspect mcp_default
```

### **Service Health Check**
```bash
# HTTP server health
curl -v http://localhost:3025/.identity

# HTTPS server health (if enabled)
curl -k -v https://localhost:3026/.identity

# MCP server health
ps aux | grep mcp-server
netstat -tulpn | grep 3025
```

### **Resource Usage Check**
```bash
# Container resources
docker stats --no-stream

# Host system resources
top
htop
free -h
df -h

# Network usage
netstat -i
ss -tulpn
```

## 🔧 Fixes by Issue Type

### **TypeScript Compilation Errors**
```bash
# Clean build artifacts
rm -rf browser-tools-mcp/dist/
rm -rf browser-tools-mcp/node_modules/

# Reinstall dependencies
cd browser-tools-mcp
npm install

# Rebuild
npm run build
```

### **Module Import Errors**
```bash
# Check package.json for correct dependencies
cat browser-tools-mcp/package.json

# Verify puppeteer vs puppeteer-core
grep -r "puppeteer" browser-tools-mcp/

# Should use: import puppeteer from 'puppeteer-core'
```

### **Permission Issues**
```bash
# Fix file permissions
chmod +x browser-tools-mcp/start-server.sh
chmod +x browser-tools-mcp/browser-tools-server/*.js

# Fix Docker permissions
sudo chown -R $USER:$USER browser-tools-mcp/
```

### **Network Connectivity Issues**
```bash
# Test container network
docker exec browser-tools-mcp-dev ping google.com
docker exec browser-tools-mcp-dev curl -I https://example.com

# Check firewall settings
sudo ufw status
sudo iptables -L

# Test port accessibility
telnet localhost 3025
```

## 📋 Troubleshooting Checklist

### **Before Starting**
- [ ] Docker and Docker Compose installed and running
- [ ] Ports 3025 and 3026 available
- [ ] Sufficient system resources (4GB+ RAM, 2GB+ disk)
- [ ] Git repository cloned and up to date

### **Container Issues**
- [ ] Docker service running
- [ ] No port conflicts
- [ ] Sufficient disk space
- [ ] Correct docker-compose.yml configuration

### **MCP Issues**
- [ ] MCP server built and running
- [ ] Correct MCP configuration path
- [ ] MCP server accessible from host
- [ ] No firewall blocking connections

### **Browser Issues**
- [ ] Chromium installed in container
- [ ] Correct executable path in code
- [ ] Sufficient memory for browser
- [ ] Network access from container

### **HTTPS Issues**
- [ ] OpenSSL installed in container
- [ ] Certificates generated and valid
- [ ] HTTPS enabled in configuration
- [ ] Port 3026 accessible

## 🆘 Getting Help

### **Self-Diagnosis**
1. **Check logs**: `docker-compose logs -f`
2. **Verify configuration**: Check all config files
3. **Test endpoints**: Use curl to test API directly
4. **Check resources**: Monitor system resources

### **External Resources**
- **GitHub Issues**: [Report bugs and issues](https://github.com/zachshallbetter/MCP-Tools/issues)
- **GitHub Discussions**: [Ask questions and get help](https://github.com/zachshallbetter/MCP-Tools/discussions)
- **Documentation**: Check this troubleshooting guide and other docs
- **Community**: MCP and Puppeteer communities

### **Information to Provide**
When asking for help, include:
- **Error messages**: Complete error text
- **System information**: OS, Docker version, Node.js version
- **Configuration**: Relevant config files
- **Steps to reproduce**: Exact steps that cause the issue
- **Logs**: Relevant log output
- **What you've tried**: Previous troubleshooting steps

---

**Most issues can be resolved by following this guide. If you're still stuck, the community is here to help! 🚀**
