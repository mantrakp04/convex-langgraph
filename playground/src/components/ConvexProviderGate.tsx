import { useState, useEffect, ReactNode, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ConvexProvider, ConvexReactClient } from "convex/react";

export const DEPLOYMENT_URL_STORAGE_KEY = "playground_deployment_url";

function isValidHttpUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function ConvexProviderGate({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { url: encodedUrl } = useParams();

  // 1. deploymentUrl always reflects the decoded url param (or null)
  const deploymentUrl = useMemo(() => {
    if (encodedUrl) {
      try {
        return decodeURIComponent(encodedUrl).replace(/\/$/, "");
      } catch (e) {
        console.error("Error decoding url", encodedUrl, e);
        return null;
      }
    }
    return null;
  }, [encodedUrl]);

  // 2. inputValue initially reflects the current url param / localStorage
  const [inputValue, setInputValue] = useState(() => {
    if (deploymentUrl) return deploymentUrl;
    const stored = localStorage.getItem(DEPLOYMENT_URL_STORAGE_KEY);
    return stored ?? "";
  });
  useEffect(() => {
    if (deploymentUrl) setInputValue(deploymentUrl);
  }, [deploymentUrl]);

  const [instanceName, setInstanceName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // Don't optimistically set isValid to true - wait for async validation
  const [isValid, setIsValid] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // Extracted validation logic for reuse
  const validateDeploymentUrl = async (url: string) => {
    if (isValidating) return;
    setIsValidating(true);
    if (!url) {
      setIsValid(false);
      setInstanceName(null);
      setError(null);
      setLoading(false);
      return;
    }
    if (!isValidHttpUrl(url)) {
      setIsValid(false);
      setInstanceName(null);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setInstanceName(null);
    setError(null);
    try {
      const res = await fetch(url + "/instance_name");
      if (!res.ok) throw new Error("Invalid response");
      const name = await res.text();
      setInstanceName(name);
      setError(null);
      setLoading(false);
      setIsValid(true);
      localStorage.setItem(DEPLOYMENT_URL_STORAGE_KEY, url);
    } catch {
      setInstanceName(null);
      setError(
        "Could not validate deployment URL. Please check the URL and try again.",
      );
      setLoading(false);
      setIsValid(false);
    } finally {
      setIsValidating(false);
    }
  };

  // 2. Validate deployment URL when it changes
  useEffect(() => {
    if (!deploymentUrl) {
      setIsValid(false);
      return;
    }
    validateDeploymentUrl(deploymentUrl);
  }, [deploymentUrl]);

  // Polling effect: If deploymentUrl is set but not valid, poll every 3 seconds
  useEffect(() => {
    if (!deploymentUrl || isValid) return;
    // Only poll if we have a URL and it's not valid
    const interval = setInterval(() => {
      validateDeploymentUrl(deploymentUrl);
    }, 3000);
    return () => clearInterval(interval);
  }, [deploymentUrl, isValid]);

  // 4. When user enters a new URL, update the path (which will trigger validation)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value.trim());
  };
  const handleInputBlur = () => {
    if (inputValue && isValidHttpUrl(inputValue)) {
      navigate(`/play/${encodeURIComponent(inputValue.replace(/\/$/, ""))}`);
    }
  };
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue && isValidHttpUrl(inputValue)) {
      navigate(`/play/${encodeURIComponent(inputValue.replace(/\/$/, ""))}`);
    }
  };

  // 3. Only create convex client when both deploymentUrl and isValid are true
  const convex = useMemo(
    () =>
      isValid && deploymentUrl ? new ConvexReactClient(deploymentUrl) : null,
    [isValid, deploymentUrl],
  );

  if (!deploymentUrl || !isValid || !convex) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
        <div
          className="bg-white rounded-xl shadow-2xl p-8 flex flex-col gap-6 border border-muted"
          style={{ minWidth: 750, maxWidth: "90vw", width: 750 }}
        >
          <h2 className="text-2xl font-bold mb-1 text-foreground">
            Configure Convex Deployment
          </h2>
          <p className="text-sm text-foreground">
            To use the Playground, you first must have a running Convex project
            to connect the Playground to. See the docs for more details:
            https://docs.convex.dev/agents
            <br />
            The Deployment URL is usually found in .env.local and is the URL of
            your Convex deployment, usually ending with .cloud.
          </p>
          <label className="text-sm font-medium text-foreground">
            Deployment URL
          </label>
          <input
            className="border border-input rounded-lg px-4 py-2 text-base font-mono bg-muted focus:outline-none focus:ring-2 focus:ring-blue-500 transition w-full min-w-0"
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            placeholder="https://<your-convex>.cloud"
            autoFocus
          />
          <div style={{ minHeight: "2.5em" }} className="flex items-center">
            {loading ? (
              <div
                className="text-blue-700 text-sm font-medium break-words whitespace-pre-wrap bg-blue-50 rounded p-3 border border-blue-200"
                style={{ wordBreak: "break-word", maxWidth: "100%" }}
              >
                Validating...
              </div>
            ) : instanceName ? (
              <div className="text-green-700 text-sm">
                Instance: {instanceName}
              </div>
            ) : error ? (
              <div
                className="text-red-600 text-sm font-medium break-words whitespace-pre-wrap bg-red-50 rounded p-3 border border-red-200"
                style={{ wordBreak: "break-word", maxWidth: "100%" }}
              >
                {error}
              </div>
            ) : (
              ""
            )}
          </div>
        </div>
      </div>
    );
  }

  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}

export default ConvexProviderGate;
