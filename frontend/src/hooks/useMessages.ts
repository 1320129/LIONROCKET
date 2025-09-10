import { useState, useEffect, useRef } from "react";
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
  const [messages, setMessages] = useState<MessageWithStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const stickToBottomRef = useRef(true);

  const loadMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const limit = 30;
      const list = await apiWithRetry<MessageWithStatus[]>(
        `/messages?characterId=${characterId}&limit=${limit}`
      );
      setMessages(list);
      setHasMore(list.length === limit);
      // After initial load, scroll to bottom
      requestAnimationFrame(() => {
        const el = listRef.current;
        if (el) el.scrollTop = el.scrollHeight;
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const loadOlder = async () => {
    if (loadingOlder || !hasMore || messages.length === 0) return;
    setLoadingOlder(true);
    try {
      const limit = 30;
      const oldest = messages[0]?.created_at;
      const older = await apiWithRetry<MessageWithStatus[]>(
        `/messages?characterId=${characterId}&limit=${limit}&before=${oldest}`
      );
      setMessages((prev) => [...older, ...prev]);
      setHasMore(older.length === limit);
      // keep scroll position roughly stable
      requestAnimationFrame(() => {
        const el = listRef.current;
        if (el) el.scrollTop = 1; // nudge to avoid re-trigger at exact 0
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
    } finally {
      setLoadingOlder(false);
    }
  };

  const addMessage = (message: MessageWithStatus) => {
    setMessages((prev) => [...prev, message]);
  };

  const updateMessage = (id: number, updates: Partial<MessageWithStatus>) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  };

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollTop <= 0) {
      void loadOlder();
    }
    // track whether user is near bottom (within 24px)
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
    stickToBottomRef.current = nearBottom;
  };

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      const el = listRef.current;
      if (el && stickToBottomRef.current) el.scrollTop = el.scrollHeight;
    });
  };

  useEffect(() => {
    void loadMessages();
  }, [characterId]);

  return {
    messages,
    loading,
    loadingOlder,
    hasMore,
    error,
    listRef,
    loadOlder,
    addMessage,
    updateMessage,
    onScroll,
    scrollToBottom,
    setError,
  };
}
