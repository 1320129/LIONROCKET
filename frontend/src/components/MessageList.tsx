import React from "react";
import styled from "styled-components";
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

const ListWrapper = styled(Card)`
  padding: 12px;
  min-height: 300px;
  max-height: 480px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const LoadMore = styled.div`
  margin-bottom: 8px;
`;

const ErrorText = styled.div`
  color: red;
`;

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
    <ListWrapper ref={listRef} onScroll={onScroll}>
      {hasMore && (
        <LoadMore>
          <Button onClick={onLoadOlder} disabled={loadingOlder}>
            {loadingOlder ? "불러오는 중..." : "이전 메시지 더 보기"}
          </Button>
        </LoadMore>
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

      {error && <ErrorText>{error}</ErrorText>}
    </ListWrapper>
  );
}
