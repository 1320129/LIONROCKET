import { useEffect } from "react";
import { getChannel } from "../lib/persist";

/**
 * 브로드캐스트 채널 훅
 * 여러 탭 간의 실시간 동기화를 위한 메시지 수신을 관리합니다.
 *
 * @param characterId 현재 캐릭터 ID
 * @param onDraftUpdate 드래프트 업데이트 콜백 함수
 * @param onLogout 로그아웃 콜백 함수
 */
export function useBroadcastChannel(
  characterId: number,
  onDraftUpdate: (value: string) => void,
  onLogout: () => void
) {
  useEffect(() => {
    const ch = getChannel();
    if (!ch) return;

    /**
     * 메시지 수신 핸들러
     * 다른 탭에서 보낸 메시지를 처리합니다.
     */
    const onMessage = (ev: MessageEvent<unknown>) => {
      const data = ev.data as {
        type?: string;
        characterId?: number;
        value?: unknown;
      };

      // 드래프트 업데이트 메시지 처리
      if (data?.type === "draft" && data.characterId === characterId) {
        const value = (data as { value?: unknown }).value;
        onDraftUpdate(String(value || ""));
      }

      // 로그아웃 메시지 처리
      if (data?.type === "logout") {
        onLogout();
      }
    };

    ch.addEventListener("message", onMessage);
    return () => ch.removeEventListener("message", onMessage);
  }, [characterId, onDraftUpdate, onLogout]);
}
