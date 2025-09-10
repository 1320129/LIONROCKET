import { useRef } from "react";
import {
  useInfiniteQuery,
  useQueryClient,
  InfiniteData,
} from "@tanstack/react-query";
import { queryFn } from "../queryClient";
import { MessageWithStatus } from "../types/message";

const LIMIT = 30;

export function useMessages(characterId: number) {
  const queryClient = useQueryClient();
  const listRef = useRef<HTMLDivElement | null>(null);
  const stickToBottomRef = useRef(true);

  const {
    data,
    status,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<MessageWithStatus[]>({
    queryKey: ["messages", characterId],
    queryFn: ({ pageParam, signal }) =>
      queryFn<MessageWithStatus[]>(
        `/messages?characterId=${characterId}&limit=${LIMIT}` +
          (pageParam ? `&before=${pageParam}` : ""),
        { signal }
      ),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage.length === LIMIT ? lastPage[0].created_at : undefined,
  });

  const messages = data?.pages.flat() ?? [];

  const addMessage = (message: MessageWithStatus) => {
    queryClient.setQueryData(
      ["messages", characterId],
      (oldData: InfiniteData<MessageWithStatus[]> | undefined) => {
        if (!oldData) {
          return { pages: [[message]], pageParams: [undefined] };
        }
        return {
          ...oldData,
          pages: [[...oldData.pages[0], message], ...oldData.pages.slice(1)],
        };
      }
    );
  };

  const updateMessage = (id: number, updates: Partial<MessageWithStatus>) => {
    queryClient.setQueryData(
      ["messages", characterId],
      (oldData: InfiniteData<MessageWithStatus[]> | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) =>
            page.map((m) => (m.id === id ? { ...m, ...updates } : m))
          ),
        };
      }
    );
  };

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollTop <= 0 && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage().then(() => {
        requestAnimationFrame(() => {
          const list = listRef.current;
          if (list) list.scrollTop = 1;
        });
      });
    }
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
    stickToBottomRef.current = nearBottom;
  };

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      const el = listRef.current;
      if (el && stickToBottomRef.current) el.scrollTop = el.scrollHeight;
    });
  };

  return {
    messages,
    loading: status === "pending",
    loadingOlder: isFetchingNextPage,
    hasMore: hasNextPage ?? false,
    error: error?.message || null,
    listRef,
    loadOlder: fetchNextPage,
    addMessage,
    updateMessage,
    onScroll,
    scrollToBottom,
  };
}
