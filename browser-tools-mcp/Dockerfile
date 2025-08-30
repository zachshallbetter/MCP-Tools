# BrowserTools MCP Development Environment
FROM node:18-slim

# Set working directory
WORKDIR /app

# Install system dependencies including Chrome
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    procps \
    libxss1 \
    libnss3 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpango-1.0-0 \
    libcairo2 \
    libatspi2.0-0 \
    libgtk-3-0 \
    libgdk-pixbuf2.0-0 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcb-dri3-0 \
    libxcb-render0 \
    libxcb-glx0 \
    libxcb-shape0 \
    libxcb-sync1 \
    libxcb-keysyms1 \
    libxcb-icccm4 \
    libxcb-image0 \
    libxcb-shm0 \
    libxcb-util1 \
    libxcb-randr0 \
    libxcb-xfixes0 \
    libxcb-shape0 \
    libxcb-render-util0 \
    libxcb-xinerama0 \
    libxcb-xkb1 \
    libxkbcommon-x11-0 \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Install Google Chrome (handle different architectures)
RUN if [ "$(uname -m)" = "x86_64" ]; then \
        wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
        && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list \
        && apt-get update \
        && apt-get install -y google-chrome-stable; \
    elif [ "$(uname -m)" = "aarch64" ]; then \
        echo "Installing Chromium for ARM64 architecture..." \
        && apt-get update \
        && apt-get install -y chromium \
        && ln -s /usr/bin/chromium /usr/bin/google-chrome; \
    else \
        echo "Unsupported architecture: $(uname -m)" \
        && exit 1; \
    fi \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY browser-tools-mcp/package*.json ./browser-tools-mcp/
COPY browser-tools-server/package*.json ./browser-tools-server/

# Install dependencies
RUN cd browser-tools-mcp && npm install
RUN cd browser-tools-server && npm install

# Copy source code
COPY browser-tools-mcp/ ./browser-tools-mcp/
COPY browser-tools-server/ ./browser-tools-server/
COPY chrome-extension/ ./chrome-extension/
COPY docs/ ./docs/

# Build the projects (skip TypeScript build for now due to compilation issues)
# RUN cd browser-tools-mcp && npm run build
# RUN cd browser-tools-server && npm run build

# Copy startup script
COPY start-server.sh /app/start-server.sh
RUN chmod +x /app/start-server.sh

# Create a non-root user
RUN groupadd -r browseruser && useradd -r -g browseruser -G audio,video browseruser \
    && mkdir -p /home/browseruser/Downloads \
    && chown -R browseruser:browseruser /app \
    && chown -R browseruser:browseruser /home/browseruser

# Switch to non-root user
USER browseruser

# Expose ports
EXPOSE 3025 3026 3027 3028 3029 3030 3031 3032 3033 3034 3035

# Set environment variables
ENV NODE_ENV=development
ENV BROWSER_TOOLS_PORT=3025
ENV BROWSER_TOOLS_HOST=0.0.0.0

# Set the default command to start the browser-tools server automatically
CMD ["bash", "/app/start-server.sh"]
