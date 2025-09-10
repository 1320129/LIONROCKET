import React from "react";
import { apiWithRetry } from "../lib/api";
import { useDialog } from "../ui/useDialog";

type MessageWithStatus = {
  id: number;
  role: "user" | "assistant";
  content: string;
  created_at: number;
  status?: "pending" | "failed" | "sent";
  error?: string;
};

export function useChat(characterId: number) {
  const [loading, setLoading] = React.useState(false);
  const dialog = useDialog();

  const sendMessage = async (
    content: string,
    onSuccess: (
      userMsg: MessageWithStatus,
      assistantMsg: MessageWithStatus
    ) => void,
    onError: (userMsg: MessageWithStatus, error: string) => void
  ) => {
    if (!content.trim()) return;
    if (content.length > 200) {
      await dialog.alert("메시지는 200자 이내로 입력해주세요.", "안내");
      return;
    }

    setLoading(true);
    const now = Date.now();
    const userMsg: MessageWithStatus = {
      id: Date.now(),
      role: "user",
      content,
      created_at: now,
      status: "pending",
    };

    try {
      const res = await apiWithRetry<{ reply: string; createdAt: number }>(
        "/chat",
        {
          method: "POST",
          body: JSON.stringify({ characterId, message: content }),
        },
        2,
        400
      );

      const assistantMsg: MessageWithStatus = {
        id: Date.now() + 1,
        role: "assistant",
        content: res.reply,
        created_at: res.createdAt,
        status: "sent",
      };

      onSuccess(userMsg, assistantMsg);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "전송 실패";
      onError(userMsg, msg);
      await dialog.alert(msg, "오류");
    } finally {
      setLoading(false);
    }
  };

  const retryMessage = async (
    messageId: number,
    content: string,
    onSuccess: (assistantMsg: MessageWithStatus) => void,
    onError: (messageId: number, error: string) => void
  ) => {
    setLoading(true);
    try {
      const res = await apiWithRetry<{ reply: string; createdAt: number }>(
        "/chat",
        {
          method: "POST",
          body: JSON.stringify({ characterId, message: content }),
        },
        2,
        400
      );

      const assistantMsg: MessageWithStatus = {
        id: Date.now() + 1,
        role: "assistant",
        content: res.reply,
        created_at: res.createdAt,
        status: "sent",
      };

      onSuccess(assistantMsg);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "전송 실패";
      onError(messageId, msg);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    sendMessage,
    retryMessage,
  };
}
