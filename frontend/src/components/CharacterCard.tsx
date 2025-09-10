import { Button, Card } from "../styles/primitives";
import {
  CharacterCard as CharacterCardStyled,
  CharacterInfo,
  CharacterName,
  CharacterMeta,
  ThumbnailImage,
  FlexContainer,
  MutedText,
} from "../styles/styled";
import { Character } from "../types/character";

type CharacterCardProps = {
  character: Character;
  apiBase: string;
  onChat: (character: Character) => void;
  onDelete: (id: number) => void;
};

export function CharacterCard({
  character,
  apiBase,
  onChat,
  onDelete,
}: CharacterCardProps) {
  return (
    <Card>
      <CharacterCardStyled>
        {character.thumbnail_path && (
          <ThumbnailImage
            src={`${apiBase}/${character.thumbnail_path}`}
            alt={character.name}
            width={48}
            height={48}
            loading="lazy"
          />
        )}
        <CharacterInfo>
          <CharacterName>{character.name}</CharacterName>
          <CharacterMeta>
            <MutedText>{character.prompt.slice(0, 80)}</MutedText>
          </CharacterMeta>
        </CharacterInfo>
        <FlexContainer>
          <Button
            type="button"
            variant="primary"
            onClick={() => onChat(character)}
          >
            대화하기
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={() => onDelete(character.id)}
          >
            삭제
          </Button>
        </FlexContainer>
      </CharacterCardStyled>
    </Card>
  );
}
