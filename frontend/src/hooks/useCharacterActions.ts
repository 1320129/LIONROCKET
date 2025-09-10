import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { api } from "../lib/api";
import { useDialog } from "./useDialog";
import { saveLastCharacter } from "../lib/persist";
import { Character } from "../types/character";

/**
 * 캐릭터 액션 관리 훅
 * 캐릭터 삭제 및 채팅 이동 기능을 제공합니다.
 *
 * @returns 캐릭터 삭제, 채팅 이동 함수들과 로딩 상태
 */
export function useCharacterActions() {
  const dialog = useDialog();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // 캐릭터 삭제 뮤테이션
  const deleteCharacterMutation = useMutation({
    mutationFn: async (id: number) => {
      return api(`/characters/${id}`, { method: "DELETE" });
    },
    onSuccess: (_, id) => {
      queryClient.setQueryData(["characters"], (old: Character[] = []) =>
        old.filter((c) => c.id !== id)
      );
    },
    onError: async (e: unknown) => {
      await dialog.alert(e instanceof Error ? e.message : "삭제 실패", "오류");
    },
  });

  /**
   * 캐릭터 삭제
   * 사용자 확인 후 캐릭터를 삭제합니다.
   * @param id 삭제할 캐릭터 ID
   */
  async function deleteCharacter(id: number) {
    const ok = await dialog.confirm(
      "이 캐릭터를 삭제하시겠습니까? 관련 대화도 함께 삭제됩니다.",
      "삭제 확인",
      "삭제",
      "취소"
    );
    if (!ok) return;
    deleteCharacterMutation.mutate(id);
  }

  /**
   * 채팅 페이지로 이동
   * 캐릭터 정보를 캐시하고 채팅 페이지로 네비게이션합니다.
   * @param character 이동할 캐릭터 정보
   */
  function goToChat(character: Character) {
    saveLastCharacter(character.id);
    try {
      localStorage.setItem(`characterName:${character.id}`, character.name);
    } catch {
      // localStorage 접근 실패 시 무시
    }
    navigate(`/chat/${character.id}`);
  }

  return {
    deleteCharacter,
    goToChat,
    isDeleting: deleteCharacterMutation.isPending,
  };
}
