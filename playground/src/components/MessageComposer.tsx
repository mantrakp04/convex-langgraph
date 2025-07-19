import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import CollapsibleSection from "./CollapsibleSection";
import JsonEditor from "./JsonEditor";
import {
  ContextOptions,
  StorageOptions,
  vContextOptions,
  vStorageOptions,
} from "@convex-dev/agent";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Agent } from "@/types";

interface MessageComposerProps {
  agents: Agent[] | undefined;
  selectedAgent: Agent | undefined;
  setSelectedAgent: (agent: Agent) => void;
  contextOptions: ContextOptions;
  setContextOptions: (contextOptions: ContextOptions) => void;
  storageOptions: StorageOptions;
  setStorageOptions: (storageOptions: StorageOptions) => void;
  onSendMessage: (
    message: string,
    agentName: string,
    context: ContextOptions | undefined,
    storage: StorageOptions | undefined,
    systemPrompt?: string
  ) => Promise<string | undefined>;
}

const MessageComposer: React.FC<MessageComposerProps> = ({
  agents,
  selectedAgent,
  setSelectedAgent,
  contextOptions,
  setContextOptions,
  storageOptions,
  setStorageOptions,
  onSendMessage,
}) => {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  // System prompt state
  const [systemPrompt, setSystemPrompt] = useState<string | undefined>(
    undefined
  );
  const [isSystemPromptDirty, setIsSystemPromptDirty] = useState(false);
  const handleResetSystemPrompt = () => {
    setSystemPrompt(undefined);
    setIsSystemPromptDirty(false);
  };

  // When user edits system prompt
  const handleSystemPromptChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const isDirty = e.target.value !== (selectedAgent?.instructions || "");
    setSystemPrompt(isDirty ? e.target.value : undefined);
    setIsSystemPromptDirty(isDirty);
  };

  const handleSend = async () => {
    if (!message.trim() || !selectedAgent) {
      toast.error("Please enter a message and select an agent");
      return Promise.reject();
    }
    setIsSendingMessage(true);
    setResponse("Sending...");
    try {
      const text = await onSendMessage(
        message,
        selectedAgent.name,
        contextOptions,
        storageOptions,
        isSystemPromptDirty ? systemPrompt : undefined
      );
      return setResponse(
        storageOptions.saveMessages === "none" ? null : text ?? null,
      );
    } finally {
      setIsSendingMessage(false);
    }
  };

  return (
    <>
      {response && (
        <div className="border rounded-md p-3 bg-muted/50">
          <h3 className="font-medium mb-2 text-sm">Response:</h3>
          <p className="text-sm">{response}</p>
        </div>
      )}
      <div className="flex flex-row gap-4 p-4 bg-muted/30 rounded-lg items-start">
        <div className="mb-0 w-full flex flex-col justify-center">
          <Textarea
            placeholder="Type your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend().then(() => {
                  setMessage("");
                });
              }
            }}
            className="min-h-[100px]"
          />
        </div>
        <div className="flex flex-col gap-4 content-around items-stretch min-w-[200px]">
          <div className="flex flex-col">
            <Select
              value={selectedAgent?.name || ""}
              onValueChange={(value) => {
                const agent = agents?.find((a) => a.name === value);
                if (agent) {
                  setSelectedAgent(agent);
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an agent" />
              </SelectTrigger>
              <SelectContent>
                {agents?.map((agent) => (
                  <SelectItem key={agent.name} value={agent.name}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            className="mt-2"
            onClick={handleSend}
            disabled={!message.trim() || !selectedAgent || isSendingMessage}
            title={
              !message.trim()
                ? "Please enter a message"
                : !selectedAgent
                  ? "Please select an agent"
                  : isSendingMessage
                    ? "Sending..."
                    : "Send Message"
            }
          >
            {isSendingMessage ? "Sending..." : "Send Message"}
          </Button>
        </div>
      </div>
      <div className="px-4 bg-muted/30 rounded-lg">
        <CollapsibleSection title="System Prompt">
          <div className="flex flex-row gap-2 items-end relative">
            <div className="w-full">
              <Textarea
                aria-label="System prompt"
                value={systemPrompt || selectedAgent?.instructions || ""}
                onChange={handleSystemPromptChange}
                placeholder="System prompt for the agent..."
                className="font-mono text-sm h-24"
                rows={3}
              />
            </div>
            <Button
              className={`ml-2 mb-1 absolute right-0 ${
                isSystemPromptDirty ? "visible" : "invisible"
              }`}
              variant="secondary"
              onClick={handleResetSystemPrompt}
              disabled={!isSystemPromptDirty}
              title="Reset to agent's default prompt"
            >
              Reset
            </Button>
          </div>
        </CollapsibleSection>
      </div>
      <div className="px-4 bg-muted/30 rounded-lg">
        <CollapsibleSection title="Context & Storage Options">
          <div className="flex flex-row gap-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium mb-1">
                Context Options
              </label>
              <JsonEditor
                initialValue={contextOptions}
                onChange={setContextOptions}
                validator={vContextOptions}
              />
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-medium mb-1">
                Storage Options
              </label>
              <JsonEditor
                initialValue={storageOptions}
                onChange={setStorageOptions}
                validator={vStorageOptions}
              />
            </div>
          </div>
        </CollapsibleSection>
      </div>
    </>
  );
};

export default MessageComposer;
