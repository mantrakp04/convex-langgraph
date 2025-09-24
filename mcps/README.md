# MCP Proxy Server

A configurable proxy server for Model Context Protocol (MCP) servers that allows you to manage multiple MCP servers through a single HTTP interface. This project provides a unified gateway to various MCP services including Stripe, Linear, filesystem access, and Context7.

## Features

- **Multi-Server Management**: Configure and manage multiple MCP servers from a single proxy
- **HTTP Transport**: Expose MCP servers over HTTP for easy integration
- **OAuth Authentication**: Built-in OAuth support for services that require authentication
- **Dynamic Configuration**: Update server configurations via REST API without restarting
- **Docker Support**: Containerized deployment with pre-configured environment
- **Bearer Token Auth**: Optional authentication for the proxy itself
- **Auto-Restart**: Automatic restart when configuration changes

## Supported MCP Servers

- **Stripe**: Payment processing and management
- **Linear**: Project management and issue tracking
- **FileSystem**: Local file system access
- **Context7**: Documentation and context services

## Quick Start

### Using Docker (Recommended)

1. Build the Docker image:
```bash
docker build -t mcps .
```

2. Run the container:
```bash
docker run -p 8000:8000 mcps
```

The server will be available at `http://localhost:8000`

### Local Development

1. Install dependencies using UV:
```bash
uv sync
```

2. Run the server:
```bash
uv run main.py
```

## Configuration

The proxy uses a JSON configuration file (`mcp.config.json`) to manage MCP servers. You can configure servers in two ways:

### HTTP Server Configuration
```json
{
  "serverName": {
    "url": "https://mcp.example.com",
    "enabled": true,
    "headers": {
      "Custom-Header": "value"
    }
  }
}
```

### Command Server Configuration
```json
{
  "serverName": {
    "command": "bunx",
    "args": ["@modelcontextprotocol/server-filesystem", "/path/to/directory"],
    "enabled": true
  }
}
```

## API Endpoints

### GET /config
Retrieve the current configuration with authentication URLs for OAuth-enabled servers.

**Response:**
```json
{
  "mcpServers": {
    "stripe": {
      "url": "https://mcp.stripe.com",
      "enabled": true,
      "auth": "https://auth.stripe.com/oauth/authorize?..."
    }
  }
}
```

### POST /config
Update the server configuration. The proxy will automatically restart after configuration changes.

**Request Body:**
```json
{
  "mcpServers": {
    "newServer": {
      "url": "https://mcp.newservice.com",
      "enabled": true
    }
  }
}
```

### POST /restart
Manually restart the proxy server.

## Authentication

### Proxy Authentication
Set the `AUTH_TOKEN` environment variable to enable Bearer token authentication:

```bash
export AUTH_TOKEN="your-secret-token"
```

All requests to the proxy will require the `Authorization: Bearer your-secret-token` header.

### MCP Server Authentication
The proxy automatically handles OAuth authentication for MCP servers that require it. When you access the `/config` endpoint, you'll receive authorization URLs for services that need authentication.

## Environment Variables

- `AUTH_TOKEN`: Optional Bearer token for proxy authentication
- `TZ`: Timezone (default: UTC)

## Development

### Project Structure
```
mcps/
├── main.py              # Main application code
├── mcp.config.json      # Server configuration
├── pyproject.toml       # Python dependencies
├── Dockerfile           # Container configuration
└── README.md           # This file
```

### Dependencies
- `fastapi`: Web framework
- `fastmcp`: MCP proxy implementation
- `pydantic`: Data validation
- `uvicorn`: ASGI server

## Docker Details

The Docker image includes:
- Ubuntu 22.04 base
- Node.js 20 with Bun
- Python with UV package manager
- All necessary system dependencies

### Building and Running
```bash
# Build
docker build -t mcps .

# Run with custom auth token
docker run -p 8000:8000 -e AUTH_TOKEN="your-token" mcps

# Run with custom config volume
docker run -p 8000:8000 -v $(pwd)/mcp.config.json:/app/mcp.config.json mcps
```

## Usage Examples

### Adding a New MCP Server
```bash
curl -X POST http://localhost:8000/config \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{
    "mcpServers": {
      "myService": {
        "url": "https://mcp.myservice.com",
        "enabled": true
      }
    }
  }'
```

### Checking Server Status
```bash
curl http://localhost:8000/config
```

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.