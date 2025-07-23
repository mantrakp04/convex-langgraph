import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import type { Message, User } from "../types";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  Bot,
  User as UserIcon,
  Wrench,
  FileIcon,
} from "lucide-react";
import { UIMessage } from "ai";

interface MessageItemProps {
  user: User | undefined;
  message: Omit<Message, "message"> & { message: UIMessage };
  isSelected: boolean;
  onClick: () => void;
  onSelectToolCall?: (toolCallId: string) => void;
  selectedToolCallId?: string | null;
}

const MessageItem: React.FC<MessageItemProps> = ({
  user,
  message,
  isSelected,
  onClick,
  onSelectToolCall,
  selectedToolCallId,
}) => {
  const [expandedToolCall, setExpandedToolCall] = useState<string | null>(null);

  const messageDate = new Date(message._creationTime);
  const relativeTime = formatDistanceToNow(messageDate, { addSuffix: true });

  const toggleToolCall = (toolCallId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedToolCall(expandedToolCall === toolCallId ? null : toolCallId);
  };

  return (
    <div
      className={`p-4 border-b cursor-pointer ${
        message.status === "failed"
          ? "bg-red-100 border-red-400 text-red-800"
          : isSelected
            ? "bg-secondary"
            : "hover:bg-muted/50"
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          {message.message?.role === "user" ? (
            <>
              <div className="w-6 h-6 flex items-center justify-center rounded-full bg-primary text-primary-foreground">
                <UserIcon size={14} />
              </div>
              <span className="font-medium">{user?.name ?? "User"}</span>
            </>
          ) : (
            <>
              <div className="w-6 h-6 flex items-center justify-center rounded-full bg-ai text-white">
                <Bot size={14} />
              </div>
              <span className="font-medium text-ai">{message.agentName}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{relativeTime}</span>
          {message.usage?.totalTokens && (
            <span className="bg-secondary px-2 py-0.5 rounded-full">
              {message.usage.totalTokens} tokens
            </span>
          )}
        </div>
      </div>

      {message.text && (
        <div
          className={
            message.message?.role === "user"
              ? "message-bubble-user"
              : "message-bubble-agent"
          }
        >
          {message.text.split("\n").map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}

      <div className="ml-6 mt-2">
        {message.message?.parts.map((part, i) => {
          switch (part.type) {
            case "tool-invocation": {
              const toolCall = part.toolInvocation;
              const isToolCallExpanded =
                expandedToolCall === toolCall.toolCallId;
              return (
                <div
                  key={toolCall.toolCallId + " " + i}
                  className={`tool-call-bubble mt-2 ${
                    isToolCallExpanded
                      ? "bg-secondary border border-primary/30 rounded-lg"
                      : ""
                  }`}
                >
                  <div
                    className="flex items-center gap-2 p-2 cursor-pointer"
                    onClick={(e) => toggleToolCall(toolCall.toolCallId, e)}
                  >
                    <div className="w-5 h-5 flex items-center justify-center rounded-full bg-muted-foreground text-muted">
                      <Wrench size={12} />
                    </div>
                    <span className="font-medium text-sm">
                      {toolCall.toolName}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 h-5 w-5 ml-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleToolCall(toolCall.toolCallId, e);
                      }}
                    >
                      {isToolCallExpanded ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )}
                    </Button>
                  </div>
                  {isToolCallExpanded && (
                    <div className="mt-2 text-sm p-2">
                      <div className="mb-2">
                        <div className="font-medium mb-1">Arguments:</div>
                        <pre className="bg-secondary p-2 rounded-md overflow-x-auto text-xs">
                          {JSON.stringify(toolCall.args, null, 2)}
                        </pre>
                      </div>
                      {toolCall.state === "result" && (
                        <div>
                          <div className="font-medium mb-1">Return Value:</div>
                          <pre className="bg-secondary p-2 rounded-md overflow-x-auto text-xs">
                            {JSON.stringify(toolCall.result, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            }
            case "reasoning":
              return (
                <div key={message._id + " reasoning " + i}>
                  {part.reasoning}
                </div>
              );
            case "source":
              return (
                <div key={message._id + " source " + i}>
                  <a href={part.source.url} target="_blank">
                    {part.source.title ?? part.source.url}
                  </a>
                </div>
              );
            case "file":
              return part.mimeType.startsWith("image/") ? (
                part.data.startsWith("http") ? (
                  <div key={message._id + " file " + i} className="mt-2">
                    <img
                      src={part.data}
                      className="rounded-lg max-w-full max-h-[300px]"
                    />
                  </div>
                ) : (
                  <div key={i} className="mt-2">
                    <img
                      src={URL.createObjectURL(
                        new Blob([part.data], {
                          type: part.mimeType,
                        }),
                      )}
                      className="rounded-lg max-w-full max-h-[300px]"
                    />
                  </div>
                )
              ) : (
                <a key={i} className="mt-2" href={part.data} target="_blank">
                  <FileIcon size={14} />
                  <span>{part.mimeType}</span>
                </a>
              );
          }
        })}
      </div>
    </div>
  );
};

export default MessageItem;
