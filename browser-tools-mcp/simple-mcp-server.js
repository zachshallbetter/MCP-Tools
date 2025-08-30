#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Create the MCP server
const server = new McpServer({
  name: "Simple Browser Tools MCP",
  version: "1.2.0",
});

// Direct connection to our HTTP server
const HTTP_SERVER_HOST = "127.0.0.1";
const HTTP_SERVER_PORT = 3025;

// Simple wrapper for HTTP requests
async function makeHttpRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`http://${HTTP_SERVER_HOST}:${HTTP_SERVER_PORT}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    throw new Error(`Failed to connect to browser-tools server: ${error.message}`);
  }
}

// Screenshot tool
server.tool(
  "takeScreenshot",
  "Take a screenshot of the current browser tab",
  async () => {
    try {
      const result = await makeHttpRequest("/capture-screenshot", {
        method: "POST",
        body: JSON.stringify({
          url: "https://localhost:3000",
          fullPage: true,
          viewport: { width: 1920, height: 1080 }
        }),
      });

      return {
        content: [
          {
            type: "text",
            text: `Successfully saved screenshot: ${result.path}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error taking screenshot: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Console logs tool
server.tool("getConsoleLogs", "Check our browser logs", async () => {
  try {
    const result = await makeHttpRequest("/console-logs");
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error getting console logs: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Console errors tool
server.tool("getConsoleErrors", "Check our browsers console errors", async () => {
  try {
    const result = await makeHttpRequest("/console-errors");
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
      isError: true,
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error getting console errors: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Network logs tool
server.tool("getNetworkLogs", "Check ALL our network logs", async () => {
  try {
    const result = await makeHttpRequest("/network-success");
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error getting network logs: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Network errors tool
server.tool("getNetworkErrors", "Check our network ERROR logs", async () => {
  try {
    const result = await makeHttpRequest("/network-errors");
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
      isError: true,
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error getting network errors: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
const transport = new StdioServerTransport();
server.connect(transport);

console.error("Simple Browser Tools MCP Server started");
