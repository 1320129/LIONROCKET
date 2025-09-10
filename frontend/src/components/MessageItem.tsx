import React from "react";
import { Button } from "../ui/primitives";
import { MessageContainer, MessageMeta, RetryButton } from "../ui/styled";
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
    <MessageContainer>
      <MessageMeta>
        {formatMessageTime(created_at)}
      </MessageMeta>
      <div>
        <b>{role === "user" ? "나" : "AI"}</b>: {content}
        {role === "user" && status === "failed" && (
          <>
            {" "}
            <span className="muted">({error || "실패"})</span>{" "}
            {onRetry && (
              <RetryButton onClick={() => onRetry(id)}>
                재전송
              </RetryButton>
            )}
          </>
        )}
        {role === "user" && status === "pending" && (
          <span className="muted"> (전송 중)</span>
        )}
      </div>
    </MessageContainer>
  );
}
