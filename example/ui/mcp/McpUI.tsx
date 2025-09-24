import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function McpUI() {
  const mcp = useQuery(api.mcp.utils.get, {});
  const provision = useMutation(api.mcp.utils.provision);
  const remove = useMutation(api.mcp.utils.remove);
  const getConfigAction = useAction(api.mcp.utils.getConfig);
  const updateConfigAction = useAction(api.mcp.utils.updateConfig);

  const [configText, setConfigText] = useState<string>("");
  const [isValidJson, setIsValidJson] = useState<boolean>(true);
  const [config, setConfig] = useState<any>(null);
  const [loadingConfig, setLoadingConfig] = useState<boolean>(false);

  const loadConfig = async () => {
    if (!mcp || !mcp.url) return;
    setLoadingConfig(true);
    try {
      const configData = await getConfigAction();
      setConfig(configData);
    } catch (error) {
      console.error("Failed to load config:", error);
      setConfig(null);
    } finally {
      setLoadingConfig(false);
    }
  };

  useEffect(() => {
    if (config) {
      const text = JSON.stringify(config, null, 2);
      setConfigText(text);
      setIsValidJson(true);
    } else if (config === null) {
      setConfigText("");
      setIsValidJson(true);
    }
  }, [config]);

  // Load config when MCP is available
  useEffect(() => {
    if (mcp && mcp.url && mcp.status === "running") {
      void loadConfig();
    } else {
      setConfig(null);
    }
  }, [mcp]);

  const parsedConfig = useMemo(() => {
    try {
      if (!configText.trim()) return undefined;
      const parsed = JSON.parse(configText);
      setIsValidJson(true);
      return parsed as unknown;
    } catch {
      setIsValidJson(false);
      return undefined;
    }
  }, [configText]);

  return (
    <div className="h-full flex flex-col">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm p-4 flex justify-between items-center border-b">
        <h1 className="text-xl font-semibold accent-text">MCP Management</h1>
      </header>
      <div className="h-[calc(100vh-8rem)] flex items-start justify-center p-8 bg-gray-50 overflow-auto">
        <div className="w-full max-w-5xl bg-white rounded-xl shadow-lg p-6 space-y-6">
          <section className="space-y-2">
            <h2 className="text-lg font-semibold">Provisioning</h2>
            <div className="flex items-center gap-3">
              <button
                className="px-3 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
                onClick={() => void provision()}
                disabled={!!mcp && mcp.status !== "error"}
              >
                Provision MCP
              </button>
              <button
                className="px-3 py-2 rounded bg-red-600 text-white disabled:opacity-50"
                onClick={() => void remove()}
                disabled={!mcp}
              >
                Remove MCP
              </button>
              <div className="text-sm text-gray-600">
                {mcp ? (
                  <span>
                    Status: <span className="font-medium">{mcp.status}</span>
                    {mcp.url ? (
                      <>
                        {" "}| URL: <a className="text-indigo-700 underline" href={mcp.url} target="_blank" rel="noreferrer">{mcp.url}</a>
                      </>
                    ) : null}
                  </span>
                ) : (
                  <span>No MCP provisioned.</span>
                )}
              </div>
            </div>
          </section>

          <section className="space-y-3 w-full">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Configuration</h2>
              <div className="flex gap-2">
                <button
                  className="px-3 py-2 rounded bg-gray-600 text-white disabled:opacity-50"
                  disabled={!mcp || loadingConfig}
                  onClick={() => void loadConfig()}
                >
                  {loadingConfig ? "Loading..." : "Refresh"}
                </button>
                <button
                  className="px-3 py-2 rounded bg-green-600 text-white disabled:opacity-50"
                  disabled={!mcp || !parsedConfig || !isValidJson}
                  onClick={() =>
                    void updateConfigAction({ config: parsedConfig as any })
                  }
                >
                  Save Config
                </button>
              </div>
            </div>
            <textarea
              className="w-full border rounded p-3 font-mono text-sm min-h-[320px]"
              placeholder={
                loadingConfig 
                  ? "Loading configuration..." 
                  : mcp && mcp.url 
                    ? "Click Refresh to load configuration" 
                    : "Provision an MCP to load config"
              }
              value={configText}
              onChange={(e) => setConfigText(e.target.value)}
            />
            {!isValidJson && (
              <div className="text-sm text-red-600">Invalid JSON</div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
