from __future__ import annotations

import os
from typing import Any
from datetime import datetime, timezone, timedelta
from fastmcp import FastMCP
from starlette.requests import Request
from starlette.responses import JSONResponse
import httpx
from urllib.parse import urlparse, urlunparse
from fastmcp.server.auth.oauth_proxy import OAuthProxy
from fastmcp.server.auth.auth import TokenVerifier, AccessToken
from dotenv import load_dotenv


load_dotenv()
STRIPE_MCP_URL = os.environ.get("STRIPE_MCP_URL", "https://mcp.stripe.com")
STRIPE_CLIENT_ID = os.environ.get("STRIPE_OAUTH_CLIENT_ID", "ca_....")
STRIPE_CLIENT_SECRET = os.environ.get("STRIPE_OAUTH_CLIENT_SECRET", "sk_....")
BASE_URL = os.environ.get("BASE_URL", "https://stripe-blube.ngrok.app")
STRIPE_CHNLINK = os.environ.get("STRIPE_CHNLINK", "chnlink_....")
STRIPE_TOKEN_URL = os.environ.get("STRIPE_TOKEN_URL", "https://api.stripe.com/v1/oauth/token")


def build_proxy():
  class PassthroughVerifier(TokenVerifier):
    async def verify_token(self, token: str) -> AccessToken | None:
      # AccessToken.expires_at expects an integer epoch timestamp
      expires_at = int((datetime.now(timezone.utc) + timedelta(days=30)).timestamp())
      return AccessToken(
        token=token,
        client_id="stripe_proxy",
        scopes=self.required_scopes or [],
        expires_at=expires_at,
      )
  

  well_known = f"{STRIPE_MCP_URL.rstrip('/')}/.well-known/oauth-authorization-server"
  resp = httpx.get(well_known, timeout=10.0)
  resp.raise_for_status()
  meta = resp.json()
  upstream_authorize = meta.get("authorization_endpoint")
  upstream_token = meta.get("token_endpoint")
  
  
  if not upstream_authorize or not upstream_token:
    raise RuntimeError("Stripe MCP well-known missing authorization/token endpoints")


  if STRIPE_CHNLINK:
    chn = STRIPE_CHNLINK if STRIPE_CHNLINK.startswith("chnlink_") else f"chnlink_{STRIPE_CHNLINK}"

    def _inject_chnlink(endpoint: str, tail: str) -> str:
      parsed = urlparse(endpoint)
      path = parsed.path.rstrip("/")
      if path.endswith(f"/{tail}"):
        # Replace trailing segment with /{chnlink}/{tail}
        new_path = path[: -len(f"/{tail}")] + f"/{chn}/{tail}"
      else:
        # Fallback: append chnlink segment conservatively
        new_path = f"{path}/{chn}/{tail}"
      return urlunparse(parsed._replace(path=new_path))

    upstream_authorize = _inject_chnlink(upstream_authorize, "authorize")



  if STRIPE_TOKEN_URL:
    upstream_token = STRIPE_TOKEN_URL



  auth = OAuthProxy(
    upstream_authorization_endpoint=upstream_authorize,
    upstream_token_endpoint=upstream_token,
    upstream_client_id=STRIPE_CLIENT_ID,
    upstream_client_secret=STRIPE_CLIENT_SECRET,
    token_endpoint_auth_method="client_secret_post",
    forward_pkce=True,
    base_url=BASE_URL,
    redirect_path="/callback",
    token_verifier=PassthroughVerifier(),
    allowed_client_redirect_uris=[
      "*",
    ]
  )


  config: dict[str, Any] = {
    "mcpServers": {
      "stripe": {
        "url": STRIPE_MCP_URL,
      }
    }
  }


  return FastMCP.as_proxy(config, name="Stripe MCP Proxy", auth=auth)


proxy = build_proxy()


@proxy.custom_route("/health", methods=["GET"], name="health")
async def health(_: Request) -> JSONResponse:
  return JSONResponse({"ok": True})


if __name__ == "__main__":
  proxy.run(transport="streamable-http", host="0.0.0.0", port=8001)
