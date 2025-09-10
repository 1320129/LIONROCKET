import { memo } from "react";
import { Button, EmptyState } from "../styles/primitives";
import { MessageItem } from "./MessageItem";
import { LoadMoreButton, ErrorText, MessageListCard } from "../styles/styled";
import { MessageWithStatus } from "../types/message";

type MessageListProps = {
  messages: MessageWithStatus[];
  loading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage?: boolean;
  error: unknown;
  listRef: React.RefObject<HTMLDivElement>;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  onLoadOlder: () => void;
  onRetry: (messageId: number) => void;
};

export const MessageList = memo(function MessageList({
  messages,
  loading,
  isFetchingNextPage,
  hasNextPage,
  error,
  listRef,
  onScroll,
  onLoadOlder,
  onRetry,
}: MessageListProps) {
  return (
    <MessageListCard ref={listRef} onScroll={onScroll}>
      {hasNextPage && (
        <LoadMoreButton>
          <Button onClick={onLoadOlder} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? "불러오는 중..." : "이전 메시지 더 보기"}
          </Button>
        </LoadMoreButton>
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

      {error && <ErrorText>{String(error)}</ErrorText>}
    </MessageListCard>
  );
});
