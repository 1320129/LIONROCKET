import React, { useCallback, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Row } from "../ui/primitives";
import { useCharacter } from "../hooks/useCharacter";
import { useMessages } from "../hooks/useMessages";
import { useChat } from "../hooks/useChat";
import { useDraft } from "../hooks/useDraft";
import { useBroadcastChannel } from "../hooks/useBroadcastChannel";
import { MessageList } from "../components/MessageList";
import { ChatInput } from "../components/ChatInput";
import { validateCharacterId, redirectToLastCharacter } from "../utils/chatUtils";

type MessageWithStatus = {
  id: number;
  role: "user" | "assistant";
  content: string;
  created_at: number;
  status?: "pending" | "failed" | "sent";
  error?: string;
};

export default function ChatPage() {
  const { id } = useParams();
  const characterId = Number(id);

  // Custom hooks
  const { characterName } = useCharacter(characterId);
  const {
    messages,
    loading: messagesLoading,
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
  } = useMessages(characterId);
  const { loading: chatLoading, sendMessage, retryMessage } = useChat(characterId);
  const { input, setInput } = useDraft(characterId);

  // Broadcast channel handlers
  const handleDraftUpdate = useCallback((value: string) => {
    setInput(value);
  }, [setInput]);

  const handleLogout = useCallback(() => {
    location.href = "/login";
  }, []);

  useBroadcastChannel(characterId, handleDraftUpdate, handleLogout);

  // Event handlers
  const handleSend = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      
      const onSuccess = (userMsg: MessageWithStatus, assistantMsg: MessageWithStatus) => {
        addMessage(userMsg);
        updateMessage(userMsg.id, { status: "sent" });
        addMessage(assistantMsg);
        scrollToBottom();
        setError(null);
      };

      const onError = (userMsg: MessageWithStatus, errorMsg: string) => {
        addMessage(userMsg);
        updateMessage(userMsg.id, { status: "failed", error: errorMsg });
        setError(errorMsg);
      };

      await sendMessage(input, onSuccess, onError);
      setInput("");
    },
    [input, sendMessage, addMessage, updateMessage, scrollToBottom, setError, setInput]
  );

  const handleRetry = useCallback(
    async (messageId: number) => {
      const target = messages.find((m) => m.id === messageId);
      if (!target) return;

      setError(null);
      updateMessage(messageId, { status: "pending", error: undefined });

      const onSuccess = (assistantMsg: MessageWithStatus) => {
        updateMessage(messageId, { status: "sent" });
        addMessage(assistantMsg);
        scrollToBottom();
      };

      const onError = (msgId: number, errorMsg: string) => {
        updateMessage(msgId, { status: "failed", error: errorMsg });
        setError(errorMsg);
      };

      await retryMessage(messageId, target.content, onSuccess, onError);
    },
    [messages, retryMessage, updateMessage, addMessage, scrollToBottom, setError]
  );

  // Character ID validation
  useEffect(() => {
    if (!validateCharacterId(characterId)) {
      redirectToLastCharacter();
    }
  }, [characterId]);

  const loading = messagesLoading || chatLoading;

  return (
    <div style={{ padding: 24, display: "grid", gap: 12 }}>
      <Row style={{ justifyContent: "space-between" }}>
        <Link to="/">← 캐릭터 목록</Link>
        <div style={{ fontWeight: 600 }}>{characterName}</div>
      </Row>
      
      <MessageList
        messages={messages}
        loading={messagesLoading}
        loadingOlder={loadingOlder}
        hasMore={hasMore}
        error={error}
        listRef={listRef}
        onScroll={onScroll}
        onLoadOlder={loadOlder}
        onRetry={handleRetry}
      />
      
      <ChatInput
        input={input}
        loading={loading}
        onInputChange={setInput}
        onSubmit={handleSend}
      />
    </div>
  );
}
