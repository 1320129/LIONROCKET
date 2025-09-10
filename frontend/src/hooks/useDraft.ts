import { useState, useEffect } from "react";
import { readDraft, saveDraft } from "../lib/persist";

/**
 * 드래프트 관리 훅
 * 채팅 입력창의 내용을 자동으로 저장하고 복원합니다.
 *
 * @param characterId 현재 캐릭터 ID
 * @returns 입력값과 입력값 변경 함수
 */
export function useDraft(characterId: number) {
  const [input, setInput] = useState("");

  // 캐릭터 변경 시 저장된 드래프트 복원
  useEffect(() => {
    setInput(readDraft(characterId));
  }, [characterId]);

  // 입력값 변경 시 자동 저장
  useEffect(() => {
    saveDraft(characterId, input);
  }, [characterId, input]);

  return { input, setInput };
}
