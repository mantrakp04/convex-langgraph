import { createRoot } from "react-dom/client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import "./index.css";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import ChatBasic from "./chat/ChatBasic";
import ChatStreaming from "./chat/ChatStreaming";
import FilesImages from "./files/FilesImages";
import RateLimiting from "./rate_limiting/RateLimiting";
import { WeatherFashion } from "./workflows/WeatherFashion";
import RagBasic from "./rag/RagBasic";
import MemoryUI from "./coreMemories/MemoryUI";
import McpUI from "./mcp/McpUI";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

createRoot(document.getElementById("root")!).render(
  <ConvexProvider client={convex}>
    <App />
  </ConvexProvider>,
);

export function App() {
  return (
    <BrowserRouter>
      <div className="h-screen flex flex-col">
        <header className="z-50 bg-white/80 backdrop-blur-sm p-4 flex justify-between items-center border-b">
          <nav className="flex gap-4 items-center">
            <Link to="/" className="hover:text-indigo-600">
              <h2 className="text-xl font-semibold accent-text">
                Agent Examples
              </h2>
            </Link>
          </nav>
        </header>
        <main className="flex-1 h-full overflow-scroll">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/chat-basic" element={<ChatBasic />} />
            <Route path="/chat-streaming" element={<ChatStreaming />} />
            <Route path="/files-images" element={<FilesImages />} />
            <Route path="/rag-basic" element={<RagBasic />} />
            <Route path="/rate-limiting" element={<RateLimiting />} />
            <Route path="/weather-fashion" element={<WeatherFashion />} />
            <Route path="/core-memories" element={<MemoryUI />} />
            <Route path="/mcp" element={<McpUI />} />
          </Routes>
        </main>
        <Toaster />
      </div>
    </BrowserRouter>
  );
}

function Index() {
  return (
    <>
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold mb-4">Agent Example Index</h1>
        <p className="mb-6 text-lg">
          Explore the available agent/AI examples below.
        </p>
        <ul className="space-y-4">
          <li className="border rounded p-4 hover:shadow transition">
            <Link
              to="/chat-basic"
              className="text-xl font-semibold text-indigo-700 hover:underline"
            >
              Basic Chat
            </Link>
            <p className="mt-2 text-gray-700">
              A simple chat with an AI agent. No tool calls, no streaming. Just
              enough to see it in action.
            </p>
          </li>
          <li className="border rounded p-4 hover:shadow transition">
            <Link
              to="/mcp"
              className="text-xl font-semibold text-indigo-700 hover:underline"
            >
              MCP Management
            </Link>
            <p className="mt-2 text-gray-700">
              Provision/remove the MCP proxy and view or update its configuration.
            </p>
          </li>
          <li className="border rounded p-4 hover:shadow transition">
            <Link
              to="/core-memories"
              className="text-xl font-semibold text-indigo-700 hover:underline"
            >
              Core Memories
            </Link>
            <p className="mt-2 text-gray-700">
              Manage persona/human core memories with CRUD operations, append, and replace functions.
            </p>
          </li>
          <li className="border rounded p-4 hover:shadow transition">
            <Link
              to="/chat-streaming"
              className="text-xl font-semibold text-indigo-700 hover:underline"
            >
              Streaming Chat
            </Link>
            <p className="mt-2 text-gray-700">
              A simple streaming chat interface with an AI agent. Shows how to
              stream responses from an LLM in real time (without HTTP
              streaming!).
            </p>
          </li>
          <li className="border rounded p-4 hover:shadow transition">
            <Link
              to="/files-images"
              className="text-xl font-semibold text-indigo-700 hover:underline"
            >
              Files & Images
            </Link>
            <p className="mt-2 text-gray-700">
              Upload images to ask an LLM about, and have them automatically
              saved and tracked.
            </p>
          </li>
          <li className="border rounded p-4 hover:shadow transition">
            <Link
              to="/rag-basic"
              className="text-xl font-semibold text-indigo-700 hover:underline"
            >
              RAG Chat
            </Link>
            <p className="mt-2 text-gray-700">
              A simple RAG example with a chat interface.
            </p>
          </li>
          <li className="border rounded p-4 hover:shadow transition">
            <Link
              to="/rate-limiting"
              className="text-xl font-semibold text-indigo-700 hover:underline"
            >
              Rate Limiting
            </Link>
            <p className="mt-2 text-gray-700">
              Demonstrates rate limiting both message sending frequency and
              based on token usage.
            </p>
          </li>
          <li className="border rounded p-4 hover:shadow transition">
            <Link
              to="/weather-fashion"
              className="text-xl font-semibold text-indigo-700 hover:underline"
            >
              Tool Usage
            </Link>
            <p className="mt-2 text-gray-700">
              Demonstrates multi-step agent reasoning and tool use, via an
              example of a weather agent that uses a tool to get the weather and
              a fashion agent that uses a tool to get outfit suggestions based
              on the weather.
            </p>
          </li>
        </ul>
        <div className="mt-8 text-sm text-gray-500">
          More examples coming soon!
        </div>
      </div>
    </>
  );
}
