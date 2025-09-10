import { useState, useRef, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { apiWithRetry } from "../lib/api";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  created_at: number;
};

type MessageWithStatus = Message & {
  status?: "pending" | "failed" | "sent";
  error?: string;
};

export function useMessages(characterId: number) {
  // react-query로 데이터 페칭 관리
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    error,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["messages", characterId],
    queryFn: async ({ pageParam }) => {
      const limit = 30;
      const before = pageParam ? `&before=${pageParam}` : "";
      return await apiWithRetry<MessageWithStatus[]>(
        `/messages?characterId=${characterId}&limit=${limit}${before}`
      );
    },
    getNextPageParam: (lastPage) => {
      return lastPage.length === 30 ? lastPage[0]?.created_at : undefined;
    },
    initialPageParam: undefined as number | undefined,
  });

  // 새 메시지 추가를 위한 useState
  const [newMessages, setNewMessages] = useState<MessageWithStatus[]>([]);

  // 스크롤 관련 refs
  const listRef = useRef<HTMLDivElement | null>(null);
  const stickToBottomRef = useRef(true);

  // 모든 메시지를 하나의 배열로 합치기
  const allMessages = [...(data?.pages.flat().reverse() || []), ...newMessages];

  const addMessage = useCallback((message: MessageWithStatus) => {
    setNewMessages((prev) => [...prev, message]);
  }, []);

  const updateMessage = useCallback(
    (id: number, updates: Partial<MessageWithStatus>) => {
      setNewMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
      );
    },
    []
  );

  const onScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const el = e.currentTarget;
      if (el.scrollTop <= 0 && hasNextPage && !isFetchingNextPage) {
        void fetchNextPage();
      }
      // track whether user is near bottom (within 24px)
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
      stickToBottomRef.current = nearBottom;
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      const el = listRef.current;
      if (el && stickToBottomRef.current) el.scrollTop = el.scrollHeight;
    });
  }, []);

  const setError = useCallback((_error: string | null) => {
    // react-query의 error는 자동으로 관리되므로 빈 함수
  }, []);

  return {
    messages: allMessages,
    loading: isLoading,
    loadingOlder: isFetchingNextPage,
    hasMore: hasNextPage ?? false,
    error: error?.message || null,
    listRef,
    loadOlder: fetchNextPage,
    addMessage,
    updateMessage,
    onScroll,
    scrollToBottom,
    setError,
  };
}
