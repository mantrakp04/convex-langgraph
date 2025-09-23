from fastmcp import FastMCP
from oauth import ProxyOAuth as OAuth, register_oauth_callback
from fastmcp.client.auth.oauth import check_if_auth_required
import httpx
from starlette.requests import Request
from starlette.responses import JSONResponse
from starlette.middleware import Middleware
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Any
import json
import os
import sys
from pathlib import Path
from typing import Dict, Union, Optional, List
from pydantic import BaseModel, Field, HttpUrl

CONFIG_FILE = Path(__file__).with_name("mcp.config.json")

class HTTPServerConfig(BaseModel):
  url: HttpUrl | str
  enabled: Optional[bool] = True
  headers: Optional[Dict[str, str]] = None

class CommandServerConfig(BaseModel):
  command: str
  args: Optional[List[str]] = None
  enabled: Optional[bool] = True

class MCPConfig(BaseModel):
  mcpServers: Dict[str, Union[HTTPServerConfig, CommandServerConfig]] = Field(default_factory=dict)

class BearerAuthMiddleware(BaseHTTPMiddleware):
  def __init__(self, app, token: str):
    super().__init__(app)
    self.token = token

  async def dispatch(self, request: Request, call_next):
    auth_header = request.headers.get("authorization") or request.headers.get("Authorization")
    if not auth_header or auth_header != f"Bearer {self.token}":
      return JSONResponse({"error": "Unauthorized"}, status_code=401, headers={"WWW-Authenticate": "Bearer"})
    return await call_next(request)

def get_default_config() -> dict[str, Any]:
  return {
    "mcpServers": {
      "stripe": {
        "url": "https://mcp.stripe.com",
        "enabled": True,
      },
      "linear": {
        "url": "https://mcp.linear.app/sse",
        "enabled": False,
      },
      "fileSystem": {
        "command": "bunx",
        "args": ["@modelcontextprotocol/server-filesystem", "/tmp"]
      },
      "context7": {
        "url": "https://mcp.context7.com/mcp"
      },
    }
  }

def read_config() -> dict[str, Any]:
  if CONFIG_FILE.exists():
    try:
      return json.loads(CONFIG_FILE.read_text())
    except Exception:
      return get_default_config()
  default_cfg = get_default_config()
  write_config(default_cfg)
  return default_cfg

def write_config(cfg: dict[str, Any]) -> None:
  CONFIG_FILE.write_text(json.dumps(cfg, indent=2))

config = read_config()

def prepare_config(config: dict):
  filtered_servers = {}
  for server_name, server_cfg in config["mcpServers"].items():
    if server_cfg.get("enabled", True) is False:
      continue
    if "url" in server_cfg and server_cfg["url"]:
      server_cfg["auth"] = OAuth(mcp_url=server_cfg["url"])
    filtered_servers[server_name] = server_cfg
  config["mcpServers"] = filtered_servers
  return config

proxy = FastMCP.as_proxy(prepare_config(config), name="Config-Based Proxy")

@proxy.custom_route("/callback", methods=["GET"], name="oauth_callback")
async def oauth_callback(request: Request) -> JSONResponse:
  params = request.query_params
  code = params.get("code")
  state = params.get("state")
  if not code or not state:
    return JSONResponse({"error": "Missing code or state"}, status_code=400)
  ok = await register_oauth_callback(state, code)
  return JSONResponse({"ok": ok})

@proxy.custom_route("/config", methods=["GET"], name="get_config")
async def get_config(request: Request) -> JSONResponse:
  async def fetch_auth_url(mcp_url: str) -> str | None:
    oauth = OAuth(mcp_url)
    try:
      async with httpx.AsyncClient(auth=oauth, timeout=5.0) as client:
        await client.get(mcp_url)
    except Exception as e:
      if e.args and isinstance(e.args[0], str) and e.args[0].startswith("Please authorize the URL"):
        return e.args[1] if len(e.args) > 1 else None
      return None

  prepared: dict[str, Any] = {"mcpServers": {}}
  servers = (config.get("mcpServers", {}) or {}) if isinstance(config, dict) else {}

  for name, server_cfg in servers.items():
    if not isinstance(server_cfg, dict):
      continue
    # Shallow copy without mutating global config
    out_cfg = {k: v for k, v in server_cfg.items() if k != "auth"}

    mcp_url = out_cfg.get("url")
    auth_url: str | None = None
    if mcp_url:
      try:
        needs_auth = await check_if_auth_required(mcp_url)
      except Exception:
        needs_auth = True
      if needs_auth:
        auth_url = await fetch_auth_url(mcp_url)

    if mcp_url:
      out_cfg["auth"] = auth_url

    prepared["mcpServers"][name] = out_cfg

  return JSONResponse(prepared)

@proxy.custom_route("/config", methods=["POST"], name="update_config")
async def update_config(request: Request) -> JSONResponse:
  try:
    payload = await request.json()
  except Exception as e:
    return JSONResponse({"error": "Invalid JSON", "detail": str(e)}, status_code=400)

  try:
    cfg_model = MCPConfig.model_validate(payload)
    cfg = cfg_model.model_dump(exclude_none=True)
  except Exception as e:
    return JSONResponse({"error": "Invalid config schema", "detail": str(e)}, status_code=400)

  write_config(cfg)

  # Schedule restart without blocking the response
  import asyncio as _asyncio
  _asyncio.create_task(_delayed_restart())

  return JSONResponse(cfg)

@proxy.custom_route("/restart", methods=["POST"], name="restart_proxy")
async def restart_proxy(request: Request) -> JSONResponse:
  _delayed_restart()
  return JSONResponse({"message": "Proxy restarted", "restart": True})

def restart_proxy() -> None:
  try:
    script_path = Path(__file__).resolve()
    os.execv(sys.executable, [sys.executable, str(script_path)] + sys.argv[1:])
  except Exception as e:
    os._exit(1)

async def _delayed_restart():
  import asyncio
  await asyncio.sleep(0.3)
  restart_proxy()

if __name__ == "__main__":
  auth_token = os.environ.get("AUTH_TOKEN")
  proxy.run(transport="streamable-http", middleware=[
    *([Middleware(BearerAuthMiddleware, token=auth_token)] if auth_token else [])
  ], host="0.0.0.0", port=8000)
