import React from "react";
import { apiWithRetry } from "../lib/api";

export type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  created_at: number;
};

export type MessageWithStatus = Message & {
  status?: "pending" | "failed" | "sent";
  error?: string;
};

export default function useChatMessages(
  characterId: number,
  listRef: React.RefObject<HTMLDivElement>,
  stickToBottomRef: React.MutableRefObject<boolean>
) {
  const [messages, setMessages] = React.useState<MessageWithStatus[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [loadingOlder, setLoadingOlder] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        const limit = 30;
        const list = await apiWithRetry<MessageWithStatus[]>(
          `/messages?characterId=${characterId}&limit=${limit}`
        );
        setMessages(list);
        setHasMore(list.length === limit);
        requestAnimationFrame(() => {
          const el = listRef.current;
          if (el) el.scrollTop = el.scrollHeight;
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
      }
    })();
  }, [characterId, listRef]);

  const loadOlder = React.useCallback(async () => {
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
      requestAnimationFrame(() => {
        const el = listRef.current;
        if (el) el.scrollTop = 1;
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
    } finally {
      setLoadingOlder(false);
    }
  }, [loadingOlder, hasMore, messages, characterId, listRef]);

  const sendMessage = React.useCallback(
    async (
      content: string,
      dialog: { alert: (msg: string, title?: string) => Promise<void> },
      clearInput: () => void
    ) => {
      const now = Date.now();
      const userMsg: MessageWithStatus = {
        id: now,
        role: "user",
        content,
        created_at: now,
        status: "pending",
      };
      stickToBottomRef.current = true;
      setMessages((prev) => [...prev, userMsg]);
      clearInput();
      setLoading(true);
      setError(null);
      try {
        const res = await apiWithRetry<{ reply: string; createdAt: number }>(
          "/chat",
          {
            method: "POST",
            body: JSON.stringify({ characterId, message: userMsg.content }),
          },
          2,
          400
        );
        setMessages((prev) =>
          prev.map((m) => (m.id === userMsg.id ? { ...m, status: "sent" } : m))
        );
        const assistant: MessageWithStatus = {
          id: Date.now() + 1,
          role: "assistant",
          content: res.reply,
          created_at: res.createdAt,
          status: "sent",
        };
        setMessages((prev) => [...prev, assistant]);
        requestAnimationFrame(() => {
          const el = listRef.current;
          if (el && stickToBottomRef.current) el.scrollTop = el.scrollHeight;
        });
        setError(null);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "\uC804\uC1A1 \uC2E4\uD328";
        setMessages((prev) =>
          prev.map((m) =>
            m.id === userMsg.id ? { ...m, status: "failed", error: msg } : m
          )
        );
        setError(msg);
        await dialog.alert(msg, "\uC624\uB958");
      } finally {
        setLoading(false);
      }
    },
    [characterId, listRef, stickToBottomRef]
  );

  const retry = React.useCallback(
    async (messageId: number) => {
      const target = messages.find((m) => m.id === messageId);
      if (!target) return;
      setError(null);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, status: "pending", error: undefined } : m
        )
      );
      try {
        const res = await apiWithRetry<{ reply: string; createdAt: number }>(
          "/chat",
          {
            method: "POST",
            body: JSON.stringify({ characterId, message: target.content }),
          },
          2,
          400
        );
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, status: "sent" } : m))
        );
        const assistant: MessageWithStatus = {
          id: Date.now() + 1,
          role: "assistant",
          content: res.reply,
          created_at: res.createdAt,
          status: "sent",
        };
        setMessages((prev) => [...prev, assistant]);
        requestAnimationFrame(() => {
          const el = listRef.current;
          if (el && stickToBottomRef.current) el.scrollTop = el.scrollHeight;
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "\uC804\uC1A1 \uC2E4\uD328";
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId ? { ...m, status: "failed", error: msg } : m
          )
        );
        setError(msg);
      }
    },
    [messages, characterId, listRef, stickToBottomRef]
  );

  return {
    messages,
    loading,
    error,
    loadingOlder,
    hasMore,
    loadOlder,
    sendMessage,
    retry,
  };
}

