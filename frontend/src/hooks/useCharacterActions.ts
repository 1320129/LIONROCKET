import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { api } from "../lib/api";
import { useDialog } from "./useDialog";
import { saveLastCharacter } from "../lib/persist";

type Character = {
  id: number;
  owner_user_id: number | null;
  name: string;
  prompt: string;
  thumbnail_path: string | null;
  created_at: number;
};

export function useCharacterActions() {
  const dialog = useDialog();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

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
