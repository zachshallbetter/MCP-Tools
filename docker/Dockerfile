# BrowserTools MCP Development Environment
FROM node:18-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    openssl \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files for all workspaces
COPY src/mcp-server/package*.json ./src/mcp-server/
COPY src/http-server/package*.json ./src/http-server/

# Install dependencies
RUN cd src/mcp-server && npm install --omit=dev
RUN cd src/http-server && npm install --omit=dev

# Copy source code
COPY src/ ./src/

# Build MCP server
RUN cd src/mcp-server && npm run build

# Copy startup script
COPY docker/start-server.sh .
RUN chmod +x start-server.sh

# Create non-root user
RUN groupadd -r browser && useradd -r -g browser browser
RUN chown -R browser:browser /app
USER browser

# Expose ports
EXPOSE 3025 3026

# Start application
CMD ["./start-server.sh"]
