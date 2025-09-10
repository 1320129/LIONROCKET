import { useRef } from "react";
import {
  useInfiniteQuery,
  useQueryClient,
  InfiniteData,
} from "@tanstack/react-query";
import { apiWithRetry } from "../lib/api";
import { MessageWithStatus } from "../types/message";
import { useAuth } from "./useAuth";

const LIMIT = 10;

/**
 * 메시지 관리 훅
 * React Query의 useInfiniteQuery를 사용하여 메시지 목록을 관리합니다.
 * 무한 스크롤, 메시지 추가/수정, 자동 스크롤 기능을 제공합니다.
 *
 * @param characterId 현재 캐릭터 ID
 * @returns 메시지 목록, 로딩 상태, 핸들러 함수들
 */
export function useMessages(characterId: number) {
  const queryClient = useQueryClient();
  const listRef = useRef<HTMLDivElement | null>(null);
  const stickToBottomRef = useRef(true);
  const { me } = useAuth();

  // 사용자별 캐시 키 생성
  const userId = me?.id || "anonymous";
  const cacheKey = ["messages", characterId, userId];

  // 무한 스크롤 쿼리
  const {
    data,
    status,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<MessageWithStatus[]>({
    queryKey: cacheKey,
    queryFn: ({ pageParam }) =>
      apiWithRetry<MessageWithStatus[]>(
        `/messages?characterId=${characterId}&limit=${LIMIT}` +
          (pageParam ? `&before=${pageParam}` : "")
      ),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage.length === LIMIT ? lastPage[0].created_at : undefined,
  });

  const messages =
    data?.pages.flat().sort((a, b) => a.created_at - b.created_at) ?? [];

  /**
   * 새 메시지 추가
   * 캐시에 새 메시지를 추가합니다.
   * @param message 추가할 메시지
   */
  const addMessage = (message: MessageWithStatus) => {
    queryClient.setQueryData(
      cacheKey,
      (oldData: InfiniteData<MessageWithStatus[]> | undefined) => {
        if (!oldData) {
          return { pages: [[message]], pageParams: [undefined] };
        }
        // 마지막 페이지에 새 메시지를 뒤쪽에 추가
        const lastPageIndex = oldData.pages.length - 1;
        const updatedPages = [...oldData.pages];
        updatedPages[lastPageIndex] = [...updatedPages[lastPageIndex], message];

        return {
          ...oldData,
          pages: updatedPages,
        };
      }
    );
  };

  /**
   * 메시지 업데이트
   * 특정 메시지의 상태나 내용을 업데이트합니다.
   * @param id 업데이트할 메시지 ID
   * @param updates 업데이트할 내용
   */
  const updateMessage = (id: number, updates: Partial<MessageWithStatus>) => {
    queryClient.setQueryData(
      cacheKey,
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

  /**
   * 스크롤 이벤트 핸들러
   * 상단 스크롤 시 이전 메시지를 로드하고 하단 근처 여부를 추적합니다.
   * @param e 스크롤 이벤트
   */
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

  /**
   * 하단으로 스크롤
   * 사용자가 하단 근처에 있을 때만 자동 스크롤합니다.
   */
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
