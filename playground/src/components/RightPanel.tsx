import React, { useState } from "react";
import { Message, ContextMessage } from "../types";
import ContextMessages from "./ContextMessages";
import { ContextOptions, vContextOptions } from "@convex-dev/agent";
import { Button } from "@/components/ui/button";
import CollapsibleSection from "./CollapsibleSection";
import JsonEditor from "./JsonEditor";

interface RightPanelProps {
  selectedMessage: Message | null;
  contextMessages: ContextMessage[] | null;
  contextOptions: ContextOptions;
  setContextOptions: (contextOptions: ContextOptions) => void;
  fetchContextMessages: (contextOptions: ContextOptions) => Promise<void>;
}

const RightPanel: React.FC<RightPanelProps> = ({
  selectedMessage,
  contextMessages,
  contextOptions,
  setContextOptions,
  fetchContextMessages,
}) => {
  const [isFetchingContext, setIsFetchingContext] = useState(false);

  return (
    <div className="flex flex-col h-full border-l">
      <div className="panel-header">
        <h2 className="font-medium">Message Details</h2>
      </div>
      <div className="panel-content p-4 overflow-y-auto">
        {selectedMessage ? (
          <>
            <div className="mb-6">
              <h3 className="font-medium mb-2">Message JSON</h3>
              <pre className="bg-muted p-3 rounded-lg overflow-x-auto text-xs">
                {JSON.stringify(selectedMessage, null, 2)}
              </pre>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Context Options
              </label>
              <CollapsibleSection title="Context Options">
                <JsonEditor
                  defaultValue={contextOptions}
                  onChange={setContextOptions}
                  validator={vContextOptions}
                />
              </CollapsibleSection>

              {/* For now, just a button to fetch context with current options */}
              <Button
                className="w-full"
                onClick={() => {
                  setIsFetchingContext(true);
                  fetchContextMessages(contextOptions).finally(() => {
                    setIsFetchingContext(false);
                  });
                }}
                disabled={isFetchingContext || !selectedMessage}
              >
                {isFetchingContext
                  ? "Fetching Context..."
                  : "Fetch Context Messages"}
              </Button>
            </div>
            {contextMessages?.length === 0 && (
              <div className="text-muted-foreground">
                No context messages found
              </div>
            )}
            {contextMessages && contextMessages.length > 0 && (
              <div className="mb-4">
                <ContextMessages messages={contextMessages} />
              </div>
            )}
          </>
        ) : (
          <div className="text-muted-foreground">
            Select a message to view details
          </div>
        )}
      </div>
    </div>
  );
};

export default RightPanel;
