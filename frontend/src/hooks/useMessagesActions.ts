import { useCallback } from "react";
import { apiWithRetry } from "../lib/api";
import { MessageWithStatus } from "./useMessagesState";

export function useMessagesActions(
  characterId: number,
  state: {
    messages: MessageWithStatus[];
    setMessages: React.Dispatch<React.SetStateAction<MessageWithStatus[]>>;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    setLoadingOlder: React.Dispatch<React.SetStateAction<boolean>>;
    setHasMore: React.Dispatch<React.SetStateAction<boolean>>;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
  }
) {
  const loadMessages = useCallback(async () => {
    state.setLoading(true);
    state.setError(null);
    try {
      const limit = 30;
      const list = await apiWithRetry<MessageWithStatus[]>(
        `/messages?characterId=${characterId}&limit=${limit}`
      );
      state.setMessages(list);
      state.setHasMore(list.length === limit);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      state.setError(msg);
    } finally {
      state.setLoading(false);
    }
  }, [characterId, state]);

  const loadOlder = useCallback(async () => {
    if (state.messages.length === 0) return;
    
    state.setLoadingOlder(true);
    try {
      const limit = 30;
      const oldest = state.messages[0]?.created_at;
      const older = await apiWithRetry<MessageWithStatus[]>(
        `/messages?characterId=${characterId}&limit=${limit}&before=${oldest}`
      );
      state.setMessages((prev) => [...older, ...prev]);
      state.setHasMore(older.length === limit);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      state.setError(msg);
    } finally {
      state.setLoadingOlder(false);
    }
  }, [characterId, state]);

  const addMessage = useCallback((message: MessageWithStatus) => {
    state.setMessages((prev) => [...prev, message]);
  }, [state.setMessages]);

  const updateMessage = useCallback((id: number, updates: Partial<MessageWithStatus>) => {
    state.setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  }, [state.setMessages]);

  return {
    loadMessages,
    loadOlder,
    addMessage,
    updateMessage,
  };
}
