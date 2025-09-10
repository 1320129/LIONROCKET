import { memo } from "react";
import { CharacterCard } from "./CharacterCard";
import { Character } from "../types/character";
import { EmptyCharacterList } from "../styles/styled";

type CharacterListProps = {
  characters: Character[];
  apiBase: string;
  onChat: (character: Character) => void;
  onDelete: (id: number) => void;
};

export const CharacterList = memo(function CharacterList({
  characters,
  apiBase,
  onChat,
  onDelete,
}: CharacterListProps) {
  if (characters.length === 0) {
    return (
      <EmptyCharacterList>
        생성된 캐릭터가 없습니다.
      </EmptyCharacterList>
    );
  }

  return (
    <>
      {characters.map((character) => (
        <CharacterCard
          key={character.id}
          character={character}
          apiBase={apiBase}
          onChat={onChat}
          onDelete={onDelete}
        />
      ))}
    </>
  );
});
