import asyncio
import json
import os
import sys

from fastmcp import Client
from fastmcp.client.auth import OAuth


MCP_URL = "https://stripe-blube.ngrok.app/mcp"


async def main():
  oauth = OAuth(mcp_url=MCP_URL, callback_port=45375)

  try:
    async with Client(MCP_URL, auth=oauth) as client:
      tools = await client.list_tools()
      print(json.dumps([t.name for t in tools]))
  except Exception as e:
    print(str(e), file=sys.stderr)
    sys.exit(1)


if __name__ == "__main__":
  asyncio.run(main())
