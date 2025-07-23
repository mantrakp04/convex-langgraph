import React from "react";
import { format, formatDistanceToNow } from "date-fns";
import { Thread } from "../types";

interface ThreadItemProps {
  thread: Thread;
  isSelected: boolean;
  onClick: () => void;
}

const ThreadItem: React.FC<ThreadItemProps> = ({
  thread,
  isSelected,
  onClick,
}) => {
  const createdDate = new Date(thread._creationTime);
  const updatedDate = new Date(thread.lastMessageAt ?? thread._creationTime);

  const formattedDate = format(updatedDate, "MMM d, yyyy");
  const relativeTime = formatDistanceToNow(updatedDate, { addSuffix: true });

  return (
    <div
      className={`p-3 border-b cursor-pointer transition-colors ${isSelected ? "bg-secondary" : "hover:bg-muted"}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-medium text-sm">
          {thread.title ?? thread.lastAgentName ?? thread._id}
        </h3>
        <span className="text-xs text-muted-foreground">{relativeTime}</span>
      </div>

      <p className="text-xs text-foreground/80 mt-1">{thread.summary}</p>

      <p className="text-xs text-muted-foreground mt-2 truncate">
        {thread.latestMessage}
      </p>

      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        <span>Created: {format(createdDate, "MMM d")}</span>
        <span>Updated: {formattedDate}</span>
      </div>
    </div>
  );
};

export default ThreadItem;
