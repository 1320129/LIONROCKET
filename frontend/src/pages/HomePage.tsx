import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { api } from "../lib/api";
import { broadcastLogout } from "../lib/persist";

import { Button, Grid, SectionTitle } from "../styles/primitives";
import {
  LoadingContainer,
  ErrorContainer,
  PageContainer,
  Title,
  Subtitle,
  GridWithMargin,
} from "../styles/styled";

import CharacterForm from "../components/CharacterForm";
import CharacterList from "../components/CharacterList";
import type { Character } from "../types/character";

export default function HomePage() {
  const navigate = useNavigate();

  // react-query로 데이터 페칭
  const {
    data: me,
    isLoading: meLoading,
    error: meError,
  } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => api<{ id: number; email: string }>("/auth/me"),
  });

  const {
    data: characters = [],
    isLoading: charactersLoading,
    error: charactersError,
  } = useQuery({
    queryKey: ["characters"],
    queryFn: () => api<Character[]>("/characters"),
  });

  const loading = meLoading || charactersLoading;
  const error = meError?.message || charactersError?.message || null;

  async function onLogout() {
    await api("/auth/logout", { method: "POST" });
    broadcastLogout();
    navigate("/login", { replace: true });
  }

  if (loading) return <LoadingContainer>불러오는 중...</LoadingContainer>;
  if (error) return <ErrorContainer>{error}</ErrorContainer>;

  return (
    <PageContainer>
      <Title>환영합니다</Title>
      <Subtitle>로그인: {me?.email}</Subtitle>
      <Button onClick={onLogout}>로그아웃</Button>

      <GridWithMargin>
        <Grid columns={2}>
          <div>
            <SectionTitle>캐릭터 생성</SectionTitle>
            <CharacterForm />
          </div>

          <div>
            <SectionTitle>캐릭터 목록</SectionTitle>
            <CharacterList characters={characters} />
          </div>
        </Grid>
      </GridWithMargin>
    </PageContainer>
  );
}
