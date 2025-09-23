from __future__ import annotations

import asyncio
import os
from pathlib import Path
from typing import Any, Dict, Optional, Tuple
from urllib.parse import urlparse, parse_qs

from mcp.client.auth import OAuthClientProvider
from mcp.shared.auth import OAuthClientMetadata
from pydantic import AnyHttpUrl

from fastmcp.client.auth.oauth import (
  FileTokenStorage,
  check_if_auth_required as _check_if_auth_required,
)


_state_to_future: Dict[str, asyncio.Future[str]] = {}
_lock = asyncio.Lock()


async def register_oauth_callback(state: str, code: str) -> bool:
  async with _lock:
    fut = _state_to_future.get(state)
    if fut and not fut.done():
      fut.set_result(code)
      return True
    return False


class ProxyOAuth(OAuthClientProvider):
  def __init__(
    self,
    mcp_url: str,
    *,
    scopes: str | list[str] | None = None,
    client_name: str = "FastMCP Client",
    token_storage_cache_dir: Optional[Path] = None,
    additional_client_metadata: dict[str, Any] | None = None,
    redirect_host: Optional[str] = None,
  ):
    parsed_url = urlparse(mcp_url)
    server_base_url = f"{parsed_url.scheme}://{parsed_url.netloc}"

    # Prefer explicitly provided redirect_host, then env HOST, fallback to localhost
    host = redirect_host or os.environ.get("HOST", "localhost")
    # If host already contains a scheme, keep it; otherwise default to http
    if host.startswith("http://") or host.startswith("https://"):
      base = host.rstrip("/")
    else:
      base = f"http://{host}"
    redirect_uri = f"{base}/callback"

    scopes_str: str
    if isinstance(scopes, list):
      scopes_str = " ".join(scopes)
    elif scopes is not None:
      scopes_str = str(scopes)
    else:
      scopes_str = ""

    client_metadata = OAuthClientMetadata(
      client_name=client_name,
      redirect_uris=[AnyHttpUrl(redirect_uri)],
      grant_types=["authorization_code", "refresh_token"],
      response_types=["code"],
      scope=scopes_str,
      **(additional_client_metadata or {}),
    )

    storage = FileTokenStorage(server_url=server_base_url, cache_dir=token_storage_cache_dir)

    self.server_base_url = server_base_url
    self._last_state: Optional[str] = None

    super().__init__(
      server_url=server_base_url,
      client_metadata=client_metadata,
      storage=storage,
      redirect_handler=self.redirect_handler,
      callback_handler=self.callback_handler,
    )

  async def redirect_handler(self, authorization_url: str) -> None:
    parsed = urlparse(authorization_url)
    query = parse_qs(parsed.query)
    state = query.get("state", [None])[0]
    if not state:
      raise RuntimeError("Authorization URL missing state parameter")

    async with _lock:
      fut = _state_to_future.get(state)
      if fut is None or fut.done():
        _state_to_future[state] = asyncio.get_running_loop().create_future()

    self._last_state = state
    raise Exception("Please authorize the URL", authorization_url)

  async def callback_handler(self) -> Tuple[str, str | None]:
    if not self._last_state:
      raise RuntimeError("No pending OAuth state to await")

    state = self._last_state
    async with _lock:
      fut = _state_to_future.get(state)
      if fut is None or fut.done():
        fut = asyncio.get_running_loop().create_future()
        _state_to_future[state] = fut

    code = await asyncio.wait_for(fut, timeout=300.0)

    async with _lock:
      _state_to_future.pop(state, None)

    return code, state


def get_callback_endpoint():
  try:
    from starlette.responses import JSONResponse
  except Exception:
    JSONResponse = None  # type: ignore

  async def _handler(request):
    params = request.query_params
    code = params.get("code")
    state = params.get("state")
    if JSONResponse is None:
      raise RuntimeError("starlette is required for the callback endpoint")
    if not code or not state:
      return JSONResponse({"error": "Missing code or state"}, status_code=400)
    ok = await register_oauth_callback(state, code)
    return JSONResponse({"ok": ok})

  return _handler
