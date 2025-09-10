import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { API_BASE } from "../lib/config";
import { saveLastCharacter } from "../lib/persist";
import { useDialog } from "../hooks/useDialog";
import { Button, Card } from "../styles/primitives";
import {
  GridContainer,
  CharacterCard,
  CharacterInfo,
  CharacterName,
  CharacterMeta,
  ThumbnailImage,
  FlexContainer,
  MutedText,
} from "../styles/styled";
import type { Character } from "../types/character";

type Props = {
  characters: Character[];
};

export default function CharacterList({ characters }: Props) {
  const queryClient = useQueryClient();
  const dialog = useDialog();
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
      await dialog.alert(
        e instanceof Error ? e.message : "삭제 실패",
        "오류"
      );
    },
  });

  async function onDeleteCharacter(id: number) {
    const ok = await dialog.confirm(
      "이 캐릭터를 삭제하시겠습니까? 관련 대화도 함께 삭제됩니다.",
      "삭제 확인",
      "삭제",
      "취소"
    );
    if (!ok) return;
    deleteCharacterMutation.mutate(id);
  }

  function goChat(c: Character) {
    saveLastCharacter(c.id);
    try {
      localStorage.setItem(`characterName:${c.id}`, c.name);
    } catch {
      // ignore localStorage failures
    }
    navigate(`/chat/${c.id}`);
  }

  return (
    <GridContainer>
      {characters.map((c) => (
        <Card key={c.id}>
          <CharacterCard>
            {c.thumbnail_path && (
              <ThumbnailImage
                src={`${API_BASE}/${c.thumbnail_path}`}
                alt={c.name}
                width={48}
                height={48}
                loading="lazy"
              />
            )}
            <CharacterInfo>
              <CharacterName>{c.name}</CharacterName>
              <CharacterMeta>
                <MutedText>{c.prompt.slice(0, 80)}</MutedText>
              </CharacterMeta>
            </CharacterInfo>
            <FlexContainer>
              <Button
                type="button"
                variant="primary"
                onClick={() => goChat(c)}
              >
                대화하기
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={() => onDeleteCharacter(c.id)}
              >
                삭제
              </Button>
            </FlexContainer>
          </CharacterCard>
        </Card>
      ))}
    </GridContainer>
  );
}

