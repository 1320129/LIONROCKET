import { useEffect, useCallback } from "react";
import { useMessagesState } from "./useMessagesState";
import { useMessagesActions } from "./useMessagesActions";
import { useMessagesScroll } from "./useMessagesScroll";

export function useMessages(characterId: number) {
  // 상태 관리
  const state = useMessagesState();
  
  // 액션 관리
  const actions = useMessagesActions(characterId, state);
  
  // 스크롤 관리
  const scroll = useMessagesScroll();

  // 스크롤 이벤트 핸들러 (loadOlder와 스크롤 추적을 결합)
  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollTop <= 0) {
      void actions.loadOlder();
    }
    scroll.onScroll(e);
  }, [actions.loadOlder, scroll.onScroll]);

  // 초기 메시지 로드
  useEffect(() => {
    void actions.loadMessages();
  }, [characterId, actions.loadMessages]);

  // 초기 로드 후 스크롤을 맨 아래로
  useEffect(() => {
    if (!state.loading && state.messages.length > 0) {
      scroll.scrollToInitialBottom();
    }
  }, [state.loading, state.messages.length, scroll.scrollToInitialBottom]);

  return {
    // 상태
    messages: state.messages,
    loading: state.loading,
    loadingOlder: state.loadingOlder,
    hasMore: state.hasMore,
    error: state.error,
    
    // 스크롤 관련
    listRef: scroll.listRef,
    onScroll,
    scrollToBottom: scroll.scrollToBottom,
    
    // 액션들
    loadOlder: actions.loadOlder,
    addMessage: actions.addMessage,
    updateMessage: actions.updateMessage,
    setError: state.setError,
  };
}

export type { MessageWithStatus } from "./useMessagesState";
