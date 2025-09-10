import { useQuery } from "@tanstack/react-query";

import { api } from "../lib/api";
import { API_BASE } from "../lib/config";
import { useAuth } from "../hooks/useAuth";
import { useCharacterActions } from "../hooks/useCharacterActions";
import { CharacterForm } from "../components/CharacterForm";
import { CharacterList } from "../components/CharacterList";
import { Character } from "../types/character";

import { Button, Grid, SectionTitle } from "../styles/primitives";
import {
  LoadingContainer,
  ErrorContainer,
  PageContainer,
  Title,
  Subtitle,
  GridContainer,
  GridWithMargin,
} from "../styles/styled";

export default function HomePage() {
  const { me, isLoading: authLoading, error: authError, logout } = useAuth();
  const { deleteCharacter, goToChat } = useCharacterActions();

  const {
    data: characters = [],
    isLoading: charactersLoading,
    error: charactersError,
  } = useQuery({
    queryKey: ["characters"],
    queryFn: () => api<Character[]>("/characters"),
  });

  const loading = authLoading || charactersLoading;
  const error = authError || charactersError?.message || null;

  if (loading) return <LoadingContainer>불러오는 중...</LoadingContainer>;
  if (error) return <ErrorContainer>{error}</ErrorContainer>;

  return (
    <PageContainer>
      <Title>환영합니다</Title>
      <Subtitle>로그인: {me?.email}</Subtitle>
      <Button onClick={logout}>로그아웃</Button>

      <GridWithMargin>
        <Grid columns={2}>
          <div>
            <SectionTitle>캐릭터 생성</SectionTitle>
            <CharacterForm />
          </div>

          <div>
            <SectionTitle>캐릭터 목록</SectionTitle>
            <GridContainer>
              <CharacterList
                characters={characters}
                apiBase={API_BASE}
                onChat={goToChat}
                onDelete={deleteCharacter}
              />
            </GridContainer>
          </div>
        </Grid>
      </GridWithMargin>
    </PageContainer>
  );
}
