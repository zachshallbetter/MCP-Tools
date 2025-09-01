#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Tool } from "@modelcontextprotocol/sdk/types.js";

// Create the MCP server
const server = new McpServer({
  name: "MCP-Tools Browser Automation",
  version: "2.0.0",
});

// Track the discovered server connection
let discoveredHost = "127.0.0.1";
let discoveredPort = 3025;
let serverDiscovered = false;

// Function to get the default port from environment variable or default
function getDefaultServerPort(): number {
  if (process.env.BROWSER_TOOLS_PORT) {
    const envPort = parseInt(process.env.BROWSER_TOOLS_PORT, 10);
    if (!isNaN(envPort) && envPort > 0) {
      return envPort;
    }
  }
  return 3025;
}

// Function to get default server host from environment variable or default
function getDefaultServerHost(): string {
  return process.env.BROWSER_TOOLS_HOST || "127.0.0.1";
}

// Server discovery function
async function discoverServer(): Promise<boolean> {
  console.log("Starting server discovery process");

  const hosts = [getDefaultServerHost(), "127.0.0.1", "localhost"];
  const defaultPort = getDefaultServerPort();
  const ports = [defaultPort];

  // Add additional ports (fallback range)
  for (let p = 3025; p <= 3035; p++) {
    if (p !== defaultPort) {
      ports.push(p);
    }
  }

  console.log(`Will try hosts: ${hosts.join(", ")}`);
  console.log(`Will try ports: ${ports.join(", ")}`);

  // Try to find the server
  for (const host of hosts) {
    for (const port of ports) {
      try {
        console.log(`Checking ${host}:${port}...`);

        const response = await fetch(`http://${host}:${port}/.identity`, {
          signal: AbortSignal.timeout(1000),
        });

        if (response.ok) {
          const identity = await response.json();

          if (identity.signature === "mcp-browser-connector-24x7") {
            console.log(`Successfully found server at ${host}:${port}`);
            discoveredHost = host;
            discoveredPort = port;
            serverDiscovered = true;
            return true;
          }
        }
      } catch (error) {
        // Continue to next host/port combination
      }
    }
  }

  console.log("Server discovery failed");
  return false;
}

// Helper function to make HTTP requests to the browser tools server
async function makeRequest(endpoint: string, data?: any): Promise<any> {
  if (!serverDiscovered) {
    const discovered = await discoverServer();
    if (!discovered) {
      throw new Error("Browser tools server not available");
    }
  }

  const url = `http://${discoveredHost}:${discoveredPort}${endpoint}`;
  const response = await fetch(url, {
    method: data ? "POST" : "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Server returned ${response.status}: ${errorText}`);
  }

  return response.json();
}

// Define all available tools
const tools: Tool[] = [
  // Screenshot Tools
  {
    name: "takeScreenshot",
    description: "Take a screenshot of a web page with advanced options",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "URL of the page to capture"
        },
        fullPage: {
          type: "boolean",
          description: "Capture full page vs viewport only"
        },
        viewport: {
          type: "object",
          properties: {
            width: { type: "number" },
            height: { type: "number" }
          }
        },
        waitForSelector: {
          type: "string",
          description: "CSS selector to wait for before capture"
        }
      },
      required: ["url"]
    }
  },

  // Lighthouse Tools
  {
    name: "runLighthouseAudit",
    description: "Run comprehensive Lighthouse audit for performance, accessibility, SEO, and best practices",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "URL to audit"
        },
        categories: {
          type: "array",
          items: { type: "string" },
          description: "Audit categories: performance, accessibility, seo, best-practices"
        },
        device: {
          type: "string",
          enum: ["desktop", "mobile"],
          description: "Device type for audit"
        }
      },
      required: ["url"]
    }
  },

  // Element Interaction Tools
  {
    name: "clickElement",
    description: "Click an element on a web page with automatic waiting",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "URL of the page"
        },
        selector: {
          type: "string",
          description: "CSS selector for the element to click"
        },
        waitForSelector: {
          type: "boolean",
          description: "Wait for element to be present"
        }
      },
      required: ["url", "selector"]
    }
  },

  {
    name: "fillInput",
    description: "Fill an input field with text",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "URL of the page"
        },
        selector: {
          type: "string",
          description: "CSS selector for the input field"
        },
        value: {
          type: "string",
          description: "Text to fill in the input"
        }
      },
      required: ["url", "selector", "value"]
    }
  },

  {
    name: "fillForm",
    description: "Fill multiple form fields at once",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "URL of the page"
        },
        formData: {
          type: "object",
          description: "Object mapping selectors to values"
        }
      },
      required: ["url", "formData"]
    }
  },

  // JavaScript Execution Tools
  {
    name: "evaluateJavaScript",
    description: "Execute JavaScript code in the page context",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "URL of the page"
        },
        script: {
          type: "string",
          description: "JavaScript code to execute"
        }
      },
      required: ["url", "script"]
    }
  },

  {
    name: "executeFunction",
    description: "Execute a custom function with arguments",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "URL of the page"
        },
        functionBody: {
          type: "string",
          description: "Function body to execute"
        },
        args: {
          type: "array",
          description: "Arguments to pass to the function"
        }
      },
      required: ["url", "functionBody"]
    }
  },

  // Network Interception Tools
  {
    name: "enableNetworkInterception",
    description: "Enable network request interception",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "URL of the page"
        }
      },
      required: ["url"]
    }
  },

  {
    name: "blockRequests",
    description: "Block network requests matching patterns",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "URL of the page"
        },
        patterns: {
          type: "array",
          items: { type: "string" },
          description: "URL patterns to block"
        },
        reason: {
          type: "string",
          description: "Reason for blocking"
        }
      },
      required: ["url", "patterns"]
    }
  },

  {
    name: "mockResponse",
    description: "Mock API responses for testing",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "URL of the page"
        },
        urlPattern: {
          type: "string",
          description: "URL pattern to mock"
        },
        mockData: {
          type: "object",
          description: "Mock response data"
        }
      },
      required: ["url", "urlPattern", "mockData"]
    }
  },

  // WebDriver BiDi Tools
  {
    name: "connectBiDi",
    description: "Connect to WebDriver BiDi protocol",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "URL of the page"
        }
      },
      required: ["url"]
    }
  },

  {
    name: "createBrowsingContext",
    description: "Create a new browsing context via BiDi",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "URL to navigate to"
        },
        contextType: {
          type: "string",
          enum: ["tab", "window"],
          description: "Type of context to create"
        }
      },
      required: ["url"]
    }
  },

  // Monitoring Tools
  {
    name: "getConsoleLogs",
    description: "Get browser console logs",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },

  {
    name: "getNetworkLogs",
    description: "Get network request/response logs",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },

  {
    name: "wipeLogs",
    description: "Clear all logs",
    inputSchema: {
      type: "object",
      properties: {}
    }
  }
];

// Register all tools using the correct MCP SDK method
tools.forEach(tool => {
  if (tool.name && tool.description) {
    server.tool(tool.name, tool.description, async (args: any) => {
      try {
        let result;

        switch (tool.name) {
          case "takeScreenshot":
            result = await makeRequest("/capture-screenshot", args);
            break;

          case "runLighthouseAudit":
            result = await makeRequest("/lighthouse-audit", args);
            break;

          case "clickElement":
            result = await makeRequest("/interact/click", args);
            break;

          case "fillInput":
            result = await makeRequest("/interact/fill", args);
            break;

          case "fillForm":
            result = await makeRequest("/interact/fill-form", args);
            break;

          case "evaluateJavaScript":
            result = await makeRequest("/js/evaluate", args);
            break;

          case "executeFunction":
            result = await makeRequest("/js/execute-function", args);
            break;

          case "enableNetworkInterception":
            result = await makeRequest("/network/enable-interception", args);
            break;

          case "blockRequests":
            result = await makeRequest("/network/block-requests", args);
            break;

          case "mockResponse":
            result = await makeRequest("/network/mock-response", args);
            break;

          case "connectBiDi":
            result = await makeRequest("/bidi/connect", args);
            break;

          case "createBrowsingContext":
            result = await makeRequest("/bidi/create-context", args);
            break;

          case "getConsoleLogs":
            result = await makeRequest("/console-logs");
            break;

          case "getNetworkLogs":
            result = await makeRequest("/network/request-log");
            break;

          case "wipeLogs":
            result = await makeRequest("/wipelogs", {});
            break;

          default:
            throw new Error(`Unknown tool: ${tool.name}`);
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Error in ${tool.name}:`, errorMessage);
        return {
          content: [
            {
              type: "text",
              text: `Failed to execute ${tool.name}: ${errorMessage}`,
            },
          ],
        };
      }
    });
  }
});

// Start receiving messages on stdio
(async () => {
  try {
    // Attempt initial server discovery
    console.error("Attempting initial server discovery on startup...");
    await discoverServer();
    if (serverDiscovered) {
      console.error(
        `Successfully discovered server at ${discoveredHost}:${discoveredPort}`
      );
    } else {
      console.error(
        "Initial server discovery failed. Will try again when tools are used."
      );
    }

    const transport = new StdioServerTransport();

    // Ensure stdout is only used for JSON messages
    const originalStdoutWrite = process.stdout.write.bind(process.stdout);
    process.stdout.write = (chunk: any, encoding?: any, callback?: any) => {
      // Only allow JSON messages to pass through
      if (typeof chunk === "string" && !chunk.startsWith("{")) {
        return true; // Silently skip non-JSON messages
      }
      return originalStdoutWrite(chunk, encoding, callback);
    };

    await server.connect(transport);
  } catch (error) {
    console.error("Failed to initialize MCP server:", error);
    process.exit(1);
  }
})();
