# 🐳 Docker Guide for MCP-Tools

> **Complete containerization and deployment guide**

## 🏗️ Architecture Overview

MCP-Tools uses a multi-container Docker architecture for consistent deployment across all platforms:

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Host                              │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │              browser-tools-mcp-dev                  │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │              Node.js Runtime                │   │   │
│  │  │  ┌─────────────────────────────────────┐   │   │   │
│  │  │  │         MCP Server                  │   │   │   │
│  │  │  │  ┌─────────────────────────────┐   │   │   │   │
│  │  │  │  │    HTTP API Server          │   │   │   │   │
│  │  │  │  │  ┌─────────────────────┐   │   │   │   │   │
│  │  │  │  │  │   Chromium Browser  │   │   │   │   │   │
│  │  │  │  │  │   + Puppeteer       │   │   │   │   │   │
│  │  │  │  │  └─────────────────────┘   │   │   │   │   │
│  │  │  │  └─────────────────────────────┘   │   │   │   │
│  │  │  └─────────────────────────────────────┘   │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Container Components

### **browser-tools-mcp-dev**
- **Base Image**: `node:18-slim`
- **Purpose**: Main application container
- **Ports**: 3025 (HTTP), 3026 (HTTPS)
- **Volumes**: `/app` (code), `/app/certs` (certificates)

### **Dependencies**
- **Chromium**: Browser automation engine
- **OpenSSL**: Certificate generation and management
- **Node.js**: Runtime environment
- **Puppeteer**: Browser control library

## 🚀 Quick Start

### 1. Prerequisites
```bash
# Verify Docker installation
docker --version
docker-compose --version

# Ensure ports are available
netstat -tulpn | grep :3025
```

### 2. Start Services
```bash
# Clone repository
git clone https://github.com/zachshallbetter/MCP-Tools.git
cd MCP-Tools

# Start all services
docker-compose up -d

# Check status
docker-compose ps
```

### 3. Verify Deployment
```bash
# Health check
curl http://localhost:3025/.identity

# Test screenshot
curl -X POST http://localhost:3025/capture-screenshot \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

## ⚙️ Configuration

### Environment Variables

#### **docker-compose.yml**
```yaml
version: '3.8'
services:
  browser-tools-mcp-dev:
    build: .
    container_name: browser-tools-mcp-dev
    ports:
      - "3025:3025"  # HTTP
      - "3026:3026"  # HTTPS
    environment:
      - NODE_ENV=production
      - PORT=3025
      - ENABLE_HTTPS=true
      - CERT_DIR=/app/certs
      - CHROMIUM_PATH=/usr/bin/chromium
    volumes:
      - ./browser-tools-mcp:/app
      - ./browser-tools-mcp/certs:/app/certs
    restart: unless-stopped
```

#### **Dockerfile**
```dockerfile
FROM node:18-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY browser-tools-server/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY browser-tools-server/ .

# Copy startup script
COPY start-server.sh .
RUN chmod +x start-server.sh

# Expose ports
EXPOSE 3025 3026

# Start application
CMD ["./start-server.sh"]
```

## 🔧 Advanced Configuration

### Custom Ports
```yaml
# docker-compose.override.yml
version: '3.8'
services:
  browser-tools-mcp-dev:
    ports:
      - "8080:3025"  # Map host port 8080 to container port 3025
      - "8443:3026"  # Map host port 8443 to container port 3026
```

### Volume Mounts
```yaml
volumes:
  - ./browser-tools-mcp:/app:ro  # Read-only code mount
  - ./data:/app/data             # Persistent data storage
  - ./logs:/app/logs             # Log file storage
  - ./certs:/app/certs           # SSL certificates
```

### Resource Limits
```yaml
deploy:
  resources:
    limits:
      memory: 2G
      cpus: '1.0'
    reservations:
      memory: 1G
      cpus: '0.5'
```

## 🛠️ Management Commands

### Container Operations
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# View logs
docker-compose logs -f

# Rebuild and start
docker-compose up --build -d
```

### Container Access
```bash
# Access running container
docker exec -it browser-tools-mcp-dev bash

# Run commands in container
docker exec browser-tools-mcp-dev node --version
docker exec browser-tools-mcp-dev chromium --version

# Copy files to/from container
docker cp browser-tools-mcp-dev:/app/logs ./local-logs
docker cp ./local-file browser-tools-mcp-dev:/app/
```

### Health Monitoring
```bash
# Check container health
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Monitor resource usage
docker stats browser-tools-mcp-dev

# View container details
docker inspect browser-tools-mcp-dev
```

## 🔒 Security Configuration

### HTTPS Setup
```bash
# Generate certificates
cd browser-tools-mcp/browser-tools-server
node generate-certs.js

# Verify certificates
openssl x509 -in certs/cert.pem -text -noout

# Test HTTPS
curl -k https://localhost:3026/.identity
```

### Network Security
```yaml
# Restrict network access
networks:
  default:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16

# Custom network
networks:
  browser-tools-net:
    driver: bridge
    ipam:
      config:
        - subnet: 10.0.0.0/24
```

### User Permissions
```dockerfile
# Create non-root user
RUN groupadd -r browser && useradd -r -g browser browser

# Set ownership
RUN chown -R browser:browser /app

# Switch to non-root user
USER browser
```

## 📊 Monitoring & Logging

### Log Management
```bash
# View application logs
docker-compose logs -f browser-tools-mcp-dev

# View specific log levels
docker-compose logs -f --tail=100 browser-tools-mcp-dev

# Export logs
docker-compose logs browser-tools-mcp-dev > app-logs.txt
```

### Performance Monitoring
```bash
# Monitor container resources
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"

# Check disk usage
docker system df

# Analyze container layers
docker history browser-tools-mcp-dev
```

### Health Checks
```yaml
# Add health check to docker-compose.yml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3025/.identity"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

## 🚀 Production Deployment

### Multi-Environment Setup
```bash
# Development
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Staging
docker-compose -f docker-compose.yml -f docker-compose.staging.yml up -d

# Production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Production Override
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  browser-tools-mcp-dev:
    environment:
      - NODE_ENV=production
      - LOG_LEVEL=warn
    restart: always
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### Load Balancing
```yaml
# Scale services
docker-compose up -d --scale browser-tools-mcp-dev=3

# Load balancer configuration
nginx:
  image: nginx:alpine
  ports:
    - "80:80"
  volumes:
    - ./nginx.conf:/etc/nginx/nginx.conf
  depends_on:
    - browser-tools-mcp-dev
```

## 🔧 Troubleshooting

### Common Issues

#### Container Won't Start
```bash
# Check Docker daemon
sudo systemctl status docker

# Check available resources
docker system df
docker system prune -f

# Check port conflicts
netstat -tulpn | grep :3025
```

#### Performance Issues
```bash
# Check resource usage
docker stats

# Optimize images
docker system prune -a

# Check disk space
df -h
```

#### Network Issues
```bash
# Check network configuration
docker network ls
docker network inspect mcp_default

# Test connectivity
docker exec browser-tools-mcp-dev ping google.com
```

### Debug Mode
```bash
# Enable debug logging
export DEBUG=browser-tools:*

# Start with verbose output
docker-compose up --build

# Access container with debugging tools
docker exec -it browser-tools-mcp-dev bash
apt-get update && apt-get install -y vim curl
```

## 📚 Best Practices

### Image Optimization
- Use multi-stage builds for smaller images
- Minimize layers and remove unnecessary files
- Use `.dockerignore` to exclude files
- Optimize base image selection

### Security
- Run containers as non-root users
- Regularly update base images
- Scan images for vulnerabilities
- Use secrets management for sensitive data

### Performance
- Use volume mounts for persistent data
- Implement proper health checks
- Monitor resource usage
- Use appropriate restart policies

### Maintenance
- Regular image updates
- Log rotation and management
- Backup strategies for data volumes
- Monitoring and alerting setup

---

**Your containerized MCP-Tools platform is ready for production! 🚀**
