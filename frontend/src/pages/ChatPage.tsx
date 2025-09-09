import React from "react";
import { useParams, Link } from "react-router-dom";
import { apiWithRetry } from "../lib/api";
import {
  readDraft,
  saveDraft,
  readLastCharacter,
  getChannel,
} from "../lib/persist";

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

export default function ChatPage() {
  const { id } = useParams();
  const characterId = Number(id);
  const [messages, setMessages] = React.useState<MessageWithStatus[]>([]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [loadingOlder, setLoadingOlder] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);
  const [characterName, setCharacterName] = React.useState<string>(`캐릭터 #${characterId}`);
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const stickToBottomRef = React.useRef(true);

  React.useEffect(() => {
    (async () => {
      try {
        const limit = 30;
        // fetch character name
        const ch = await apiWithRetry<{ id: number; name: string }>(`/characters/${characterId}`);
        if (ch?.name) setCharacterName(ch.name);
        const list = await apiWithRetry<MessageWithStatus[]>(
          `/messages?characterId=${characterId}&limit=${limit}`
        );
        setMessages(list);
        setHasMore(list.length === limit);
        setInput(readDraft(characterId));
        // After initial load, scroll to bottom
        requestAnimationFrame(() => {
          const el = listRef.current;
          if (el) el.scrollTop = el.scrollHeight;
        });
      } catch (e: any) {
        setError(e.message);
      }
    })();
  }, [characterId]);

  async function loadOlder() {
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
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoadingOlder(false);
    }
  }

  function onScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    if (el.scrollTop <= 0) {
      void loadOlder();
    }
    // track whether user is near bottom (within 24px)
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
    stickToBottomRef.current = nearBottom;
  }

  React.useEffect(() => {
    const ch = getChannel();
    if (!ch) return;
    const onMessage = (ev: MessageEvent<any>) => {
      const data = ev.data as any;
      if (data?.type === "draft" && data.characterId === characterId) {
        setInput(String(data.value || ""));
      }
      if (data?.type === "logout") {
        location.href = "/login";
      }
    };
    ch.addEventListener("message", onMessage as any);
    return () => ch.removeEventListener("message", onMessage as any);
  }, [characterId]);

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    if (input.length > 200) {
      alert("메시지는 200자 이내로 입력해주세요.");
      return;
    }
    setError(null);
    const now = Date.now();
    const userMsg: MessageWithStatus = {
      id: Date.now(),
      role: "user",
      content: input,
      created_at: now,
      status: "pending",
    } as MessageWithStatus;
    stickToBottomRef.current = true;
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
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
      // mark user as sent
      setMessages((prev) =>
        prev.map((m) => (m.id === userMsg.id ? { ...m, status: "sent" } : m))
      );
      const assistant: MessageWithStatus = {
        id: Date.now() + 1,
        role: "assistant",
        content: res.reply,
        created_at: res.createdAt,
        status: "sent",
      } as MessageWithStatus;
      setMessages((prev) => [...prev, assistant]);
      // auto scroll to bottom if user was near bottom
      requestAnimationFrame(() => {
        const el = listRef.current;
        if (el && stickToBottomRef.current) el.scrollTop = el.scrollHeight;
      });
      setError(null);
    } catch (e: any) {
      const msg = e?.message || "전송 실패";
      setMessages((prev) =>
        prev.map((m) =>
          m.id === userMsg.id ? { ...m, status: "failed", error: msg } : m
        )
      );
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function onRetry(messageId: number) {
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
      } as MessageWithStatus;
      setMessages((prev) => [...prev, assistant]);
      requestAnimationFrame(() => {
        const el = listRef.current;
        if (el && stickToBottomRef.current) el.scrollTop = el.scrollHeight;
      });
    } catch (e: any) {
      const msg = e?.message || "전송 실패";
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, status: "failed", error: msg } : m
        )
      );
      setError(msg);
    }
  }

  React.useEffect(() => {
    saveDraft(characterId, input);
  }, [characterId, input]);

  React.useEffect(() => {
    if (!characterId || Number.isNaN(characterId)) {
      const last = readLastCharacter();
      if (last) location.replace(`/chat/${last}`);
    }
  }, [characterId]);

  return (
    <div style={{ padding: 24, display: "grid", gap: 12 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link to="/">← 캐릭터 목록</Link>
        <div style={{ fontWeight: 600 }}>{characterName}</div>
      </div>
      <div
        ref={listRef}
        onScroll={onScroll}
        className="card"
        style={{
          padding: 12,
          minHeight: 300,
          maxHeight: 480,
          overflowY: "auto",
        }}
      >
        {hasMore && (
          <div style={{ marginBottom: 8 }}>
            <button onClick={() => void loadOlder()} disabled={loadingOlder}>
              {loadingOlder ? "불러오는 중..." : "이전 메시지 더 보기"}
            </button>
          </div>
        )}
        {messages.map((m) => (
          <div key={`${m.role}-${m.id}`} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: "#888" }}>
              {new Date(m.created_at).toLocaleTimeString()}
            </div>
            <div>
              <b>{m.role === "user" ? "나" : "AI"}</b>: {m.content}
              {m.role === "user" && m.status === "failed" && (
                <>
                  {" "}
                  <span className="muted">({m.error || "실패"})</span>{" "}
                  <button
                    className="btn"
                    onClick={() => onRetry(m.id)}
                    style={{ marginLeft: 8 }}
                  >
                    재전송
                  </button>
                </>
              )}
              {m.role === "user" && m.status === "pending" && (
                <span className="muted"> (전송 중)</span>
              )}
            </div>
          </div>
        ))}
        {loading && <div>응답 생성 중...</div>}
        {error && <div style={{ color: "red" }}>{error}</div>}
      </div>
      <form onSubmit={onSend} style={{ display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="메시지를 입력하세요 (200자 이내)"
          maxLength={200}
          style={{ flex: 1 }}
        />
        <button type="submit" disabled={loading}>
          보내기
        </button>
      </form>
    </div>
  );
}
