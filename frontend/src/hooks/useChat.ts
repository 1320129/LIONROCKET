import { useState } from "react";
import { apiWithRetry } from "../lib/api";
import { useDialog } from "./useDialog";
import { MessageWithStatus } from "../types/message";

/**
 * 채팅 기능 관리 훅
 * 메시지 전송 및 재전송 기능을 제공합니다.
 *
 * @param characterId 현재 캐릭터 ID
 * @returns 로딩 상태, 메시지 전송, 재전송 함수
 */
export function useChat(characterId: number) {
  const [loading, setLoading] = useState(false);
  const dialog = useDialog();

  /**
   * 메시지 전송
   * 사용자 메시지를 서버에 전송하고 AI 응답을 받습니다.
   * @param content 전송할 메시지 내용
   * @param onSuccess 성공 시 호출될 콜백 함수
   * @param onError 실패 시 호출될 콜백 함수
   */
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

  /**
   * 메시지 재전송
   * 실패한 메시지를 다시 전송합니다.
   * @param messageId 재전송할 메시지 ID
   * @param content 재전송할 메시지 내용
   * @param onSuccess 성공 시 호출될 콜백 함수
   * @param onError 실패 시 호출될 콜백 함수
   */
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
