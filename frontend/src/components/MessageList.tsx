import React from "react";
import { Button, Card, EmptyState } from "../ui/primitives";
import { MessageItem } from "./MessageItem";

type MessageWithStatus = {
  id: number;
  role: "user" | "assistant";
  content: string;
  created_at: number;
  status?: "pending" | "failed" | "sent";
  error?: string;
};

interface MessageListProps {
  messages: MessageWithStatus[];
  loading: boolean;
  loadingOlder: boolean;
  hasMore: boolean;
  error: string | null;
  listRef: React.RefObject<HTMLDivElement>;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  onLoadOlder: () => void;
  onRetry: (messageId: number) => void;
}

export function MessageList({
  messages,
  loading,
  loadingOlder,
  hasMore,
  error,
  listRef,
  onScroll,
  onLoadOlder,
  onRetry,
}: MessageListProps) {
  return (
    <Card
      ref={listRef}
      onScroll={onScroll}
      style={{
        padding: 12,
        minHeight: 300,
        maxHeight: 480,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {hasMore && (
        <div style={{ marginBottom: 8 }}>
          <Button onClick={onLoadOlder} disabled={loadingOlder}>
            {loadingOlder ? "불러오는 중..." : "이전 메시지 더 보기"}
          </Button>
        </div>
      )}

      {loading && messages.length === 0 && (
        <EmptyState>대화를 불러오고 있습니다...</EmptyState>
      )}

      {!loading && messages.length === 0 && (
        <EmptyState>대화를 시작해보세요!</EmptyState>
      )}

      {messages.map((message) => (
        <MessageItem
          key={`${message.role}-${message.id}`}
          message={message}
          onRetry={onRetry}
        />
      ))}

      {error && <div style={{ color: "red" }}>{error}</div>}
    </Card>
  );
}
