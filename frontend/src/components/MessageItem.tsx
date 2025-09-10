import React from "react";
import { Button } from "../ui/primitives";
import { formatMessageTime } from "../utils/chatUtils";

type MessageWithStatus = {
  id: number;
  role: "user" | "assistant";
  content: string;
  created_at: number;
  status?: "pending" | "failed" | "sent";
  error?: string;
};

interface MessageItemProps {
  message: MessageWithStatus;
  onRetry?: (messageId: number) => void;
}

export function MessageItem({ message, onRetry }: MessageItemProps) {
  const { role, content, created_at, status, error, id } = message;

  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 12, color: "#888" }}>
        {formatMessageTime(created_at)}
      </div>
      <div>
        <b>{role === "user" ? "나" : "AI"}</b>: {content}
        {role === "user" && status === "failed" && (
          <>
            {" "}
            <span className="muted">({error || "실패"})</span>{" "}
            {onRetry && (
              <Button onClick={() => onRetry(id)} style={{ marginLeft: 8 }}>
                재전송
              </Button>
            )}
          </>
        )}
        {role === "user" && status === "pending" && (
          <span className="muted"> (전송 중)</span>
        )}
      </div>
    </div>
  );
}
