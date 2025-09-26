from __future__ import annotations

import asyncio
import secrets
import webbrowser
import os
import sys
from pathlib import Path
from typing import Any, Dict
from urllib.parse import urlparse, parse_qs, urlencode
from fastmcp.client.auth.oauth import (
  OAuthClientProvider,
  OAuthClientMetadata,
  FileTokenStorage,
  logger,
)
from pydantic import AnyHttpUrl
import httpx
import anyio
from starlette.requests import Request
from starlette.responses import JSONResponse
from mcp.client.auth import PKCEParameters
from mcp.shared.auth import OAuthClientInformationFull

_state_to_future: Dict[str, asyncio.Future[tuple[str, str | None]]] = {}
_state_to_pkce: Dict[str, tuple[str, str, str, OAuthClientInformationFull]] = {}
_lock = asyncio.Lock()

def restart_proxy() -> None:
    """Restart the proxy process"""
    try:
        script_path = Path(__file__).parent / "main.py"
        os.execv(sys.executable, [sys.executable, str(script_path)] + sys.argv[1:])
    except Exception as e:
        logger.error(f"Failed to restart proxy: {e}")
        os._exit(1)

async def _delayed_restart():
    """Schedule a delayed restart of the proxy"""
    await asyncio.sleep(0.3)
    restart_proxy()

class OAuth(OAuthClientProvider):
    def __init__(
        self,
        mcp_url: str,
        scopes: str | list[str] | None = None,
        client_name: str = "FastMCP Client",
        token_storage_cache_dir: Path | None = None,
        additional_client_metadata: dict[str, Any] | None = None,
        redirect_uri: str | None = None,
        return_auth_url_in_redirect: bool = False,
    ):
        parsed_url = urlparse(mcp_url)
        server_base_url = f"{parsed_url.scheme}://{parsed_url.netloc}"

        if not redirect_uri:
            redirect_uri = "http://localhost:8000/callback"

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

        storage = FileTokenStorage(
            server_url=server_base_url, cache_dir=token_storage_cache_dir
        )

        # Store server_base_url for use in route handler
        self.server_base_url = server_base_url

        # Track pending state and future for this instance
        self._pending_state: str | None = None
        self._callback_future: asyncio.Future[tuple[str, str | None]] | None = None
        self._return_auth_url_in_redirect = return_auth_url_in_redirect

        # Initialize parent class
        super().__init__(
            server_url=server_base_url,
            client_metadata=client_metadata,
            storage=storage,
            redirect_handler=self.redirect_handler,
            callback_handler=self.wait_for_callback,
        )

    async def _initialize(self) -> None:
        await super()._initialize()

        if self.context.current_tokens and self.context.current_tokens.expires_in:
            self.context.update_token_expiry(self.context.current_tokens)

    async def redirect_handler(self, authorization_url: str) -> None:
        # Parse URL and extract state
        parsed = urlparse(authorization_url)
        query = parse_qs(parsed.query)
        state: str | None = (query.get("state") or [None])[0]

        if not state:
            raise RuntimeError("Authorization URL missing state parameter")

        # If we're in URL-capture mode (config endpoint), just return
        if self._return_auth_url_in_redirect:
            return
        else:
            raise RuntimeError("Authorization URL missing state parameter")

    async def get_authorization_url(self) -> str:
        if not getattr(self, "_initialized", False):
            await self._initialize()

        # Ensure we have client info via registration if needed
        async with httpx.AsyncClient(timeout=5.0) as client:
            reg_request = await self._register_client()
            if reg_request is not None:
                reg_response = await client.send(reg_request)
                await self._handle_registration_response(reg_response)

        # Step 4: Build authorization URL (mirrors base implementation sans side effects)
        if self.context.oauth_metadata and self.context.oauth_metadata.authorization_endpoint:
            auth_endpoint = str(self.context.oauth_metadata.authorization_endpoint)
        else:
            auth_endpoint = self.context.get_authorization_base_url(self.context.server_url) + "/authorize"

        if not self.context.client_info:
            raise RuntimeError("No client info available for authorization")

        pkce = PKCEParameters.generate()
        state = secrets.token_urlsafe(32)

        auth_params: dict[str, str] = {
            "response_type": "code",
            "client_id": self.context.client_info.client_id,
            "redirect_uri": str(self.context.client_metadata.redirect_uris[0]),
            "state": state,
            "code_challenge": pkce.code_challenge,
            "code_challenge_method": "S256",
        }

        if self.context.should_include_resource_param(self.context.protocol_version):
            auth_params["resource"] = self.context.get_resource_url()

        if self.context.client_metadata.scope:
            auth_params["scope"] = self.context.client_metadata.scope

        url = f"{auth_endpoint}?{urlencode(auth_params)}"

        # Pre-register a placeholder future so the callback route accepts this state
        future: asyncio.Future[tuple[str, str | None]] = asyncio.get_running_loop().create_future()
        async with _lock:
            _state_to_future[state] = future
            _state_to_pkce[state] = (
                self.server_base_url,
                str(self.context.client_metadata.redirect_uris[0]),
                pkce.code_verifier,
                self.context.client_info,
            )

        return url

    async def wait_for_callback(self) -> tuple[str, str | None]:
        if not self._callback_future:
            raise RuntimeError("No pending OAuth authorization; redirect was not initiated")

        TIMEOUT = 300.0  # 5 minute timeout
        try:
            with anyio.fail_after(TIMEOUT):
                auth_code, state = await self._callback_future
                return auth_code, state
        except TimeoutError:
            if self._pending_state:
                async with _lock:
                    _state_to_future.pop(self._pending_state, None)
            self._pending_state = None
            self._callback_future = None
            raise TimeoutError(f"OAuth callback timed out after {TIMEOUT} seconds")

    # Intentionally do not override async_auth_flow; rely on base implementation

    @classmethod
    async def callback_handler(cls, request: Request) -> JSONResponse:
        # Handle callback routed by the already-running FastMCP server
        try:
            params = request.query_params
            code = params.get("code")
            state = params.get("state")

            if not code:
                return JSONResponse({"error": "Missing code"}, status_code=400)
            if not state:
                return JSONResponse({"error": "Missing state"}, status_code=400)

            async with _lock:
                future = _state_to_future.get(state)

            if not future:
                return JSONResponse({"error": "Unknown or expired state"}, status_code=400)

            if not future.done():
                future.set_result((code, state))

            # Perform token exchange if PKCE info is available
            exchange = None
            async with _lock:
                exchange = _state_to_pkce.pop(state, None)
                _state_to_future.pop(state, None)

            if exchange is not None:
                server_base_url, redirect_uri, code_verifier, client_info = exchange
                try:
                    oauth = OAuth(mcp_url=server_base_url, redirect_uri=redirect_uri)
                    await oauth._initialize()
                    oauth.context.client_info = client_info

                    async with httpx.AsyncClient(timeout=5.0) as client:
                        token_request = await oauth._exchange_token(code, code_verifier)
                        token_response = await client.send(token_request)
                        await oauth._handle_token_response(token_response)
                        saved = await oauth.context.storage.get_tokens()
                        if saved is not None:
                            logger.info(f"Saved OAuth tokens for {server_base_url}")
                except Exception as e:
                    logger.warning(f"OAuth token exchange on callback failed: {e}")

            # Schedule restart after successful OAuth callback
            asyncio.create_task(_delayed_restart())
            
            return JSONResponse({"ok": True, "restart": True})
        except Exception as e:
            return JSONResponse({"error": "Callback handling failed", "detail": str(e)}, status_code=500)
