import { CharacterCard } from "./CharacterCard";

type Character = {
  id: number;
  owner_user_id: number | null;
  name: string;
  prompt: string;
  thumbnail_path: string | null;
  created_at: number;
};

type CharacterListProps = {
  characters: Character[];
  apiBase: string;
  onChat: (character: Character) => void;
  onDelete: (id: number) => void;
};

export function CharacterList({ characters, apiBase, onChat, onDelete }: CharacterListProps) {
  if (characters.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
        생성된 캐릭터가 없습니다.
      </div>
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
}
