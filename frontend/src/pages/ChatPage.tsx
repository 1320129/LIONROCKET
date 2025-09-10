import React from "react";
import { useParams, Link } from "react-router-dom";
import { useDialog } from "../ui/Dialog";
import { Button, Card, EmptyState, Row, Input } from "../ui/primitives";
import useChatMessages from "../hooks/useChatMessages";
import useDraft from "../hooks/useDraft";
import useCharacterName from "../hooks/useCharacterName";
import { readLastCharacter } from "../lib/persist";

export default function ChatPage() {
  const dialog = useDialog();
  const { id } = useParams();
  const characterId = Number(id);

  const listRef = React.useRef<HTMLDivElement | null>(null);
  const stickToBottomRef = React.useRef(true);

  const characterName = useCharacterName(characterId);
  const {
    messages,
    loading,
    error,
    loadingOlder,
    hasMore,
    loadOlder,
    sendMessage,
    retry,
  } = useChatMessages(characterId, listRef, stickToBottomRef);
  const [input, setInput] = useDraft(characterId);

  React.useEffect(() => {
    if (!characterId || Number.isNaN(characterId)) {
      const last = readLastCharacter();
      if (last) location.replace(`/chat/${last}`);
    }
  }, [characterId]);

  function onScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    if (el.scrollTop <= 0) {
      void loadOlder();
    }
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
    stickToBottomRef.current = nearBottom;
  }

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    if (input.length > 200) {
      await dialog.alert("메시지는 200자 이내로 입력해주세요.", "안내");
      return;
    }
    await sendMessage(input, dialog, () => setInput(""));
  }

  return (
    <div style={{ padding: 24, display: "grid", gap: 12 }}>
      <Row style={{ justifyContent: "space-between" }}>
        <Link to="/">← 캐릭터 목록</Link>
        <div style={{ fontWeight: 600 }}>{characterName}</div>
      </Row>
      <Card
        ref={listRef}
        onScroll={onScroll}
        style={{
          padding: 12,
          minHeight: 300,
          maxHeight: 480,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {hasMore && (
          <div style={{ marginBottom: 8 }}>
            <Button onClick={() => void loadOlder()} disabled={loadingOlder}>
              {loadingOlder ? "불러오는 중..." : "이전 메시지 더 보기"}
            </Button>
          </div>
        )}

        {loading && messages.length === 0 && (
          <EmptyState>대화를 불러오고 있습니다...</EmptyState>
        )}

        {!loading && messages.length === 0 && (
          <EmptyState>대화를 시작해보세요!</EmptyState>
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
                  <Button onClick={() => retry(m.id)} style={{ marginLeft: 8 }}>
                    재전송
                  </Button>
                </>
              )}
              {m.role === "user" && m.status === "pending" && (
                <span className="muted"> (전송 중)</span>
              )}
            </div>
          </div>
        ))}

        {error && <div style={{ color: "red" }}>{error}</div>}
      </Card>
      <form onSubmit={onSend} style={{ display: "flex", gap: 8 }}>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="메시지를 입력하세요 (200자 이내)"
          maxLength={200}
          style={{ flex: 1 }}
        />
        <Button type="submit" variant="primary" disabled={loading}>
          보내기
        </Button>
      </form>
    </div>
  );
}
