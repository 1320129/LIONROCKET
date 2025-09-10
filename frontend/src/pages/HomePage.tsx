import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { api } from "../lib/api";
import { API_BASE } from "../lib/config";
import { broadcastLogout, saveLastCharacter } from "../lib/persist";

import {
  Button,
  Card,
  Input,
  Textarea,
  Row,
  Grid,
  SectionTitle,
} from "../ui/primitives";
import { useDialog } from "../ui/useDialog";
import {
  LoadingContainer,
  ErrorContainer,
  PageContainer,
  Title,
  Subtitle,
  FormContainer,
  GridContainer,
  CharacterCard,
  CharacterInfo,
  CharacterName,
  CharacterMeta,
  ImagePreview,
  PreviewImage,
  ThumbnailImage,
  ErrorText,
  FlexContainer,
} from "../ui/styled";

type Character = {
  id: number;
  owner_user_id: number | null;
  name: string;
  prompt: string;
  thumbnail_path: string | null;
  created_at: number;
};

export default function HomePage() {
  const dialog = useDialog();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // react-query로 데이터 페칭
  const { data: me, isLoading: meLoading, error: meError } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => api<{ id: number; email: string }>("/auth/me"),
  });

  const { data: characters = [], isLoading: charactersLoading, error: charactersError } = useQuery({
    queryKey: ["characters"],
    queryFn: () => api<Character[]>("/characters"),
  });

  const [name, setName] = React.useState("");
  const [prompt, setPrompt] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [fileError, setFileError] = React.useState<string | null>(null);
  const previewUrl = React.useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file]
  );

  const loading = meLoading || charactersLoading;
  const error = meError?.message || charactersError?.message || null;

  async function onLogout() {
    await api("/auth/logout", { method: "POST" });
    broadcastLogout();
    navigate("/login", { replace: true });
  }

  const createCharacterMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return api<Character>("/characters", {
        method: "POST",
        body: formData,
      });
    },
    onSuccess: (newChar) => {
      queryClient.setQueryData(["characters"], (old: Character[] = []) => [newChar, ...old]);
      setName("");
      setPrompt("");
      setFile(null);
      setFileError(null);
    },
    onError: async (e: unknown) => {
      await dialog.alert(e instanceof Error ? e.message : "생성 실패", "오류");
    },
  });

  async function onCreateCharacter(e: React.FormEvent) {
    e.preventDefault();
    setFileError(null);
    if (file) {
      const validTypes = ["image/png", "image/jpeg", "image/webp"];
      if (!validTypes.includes(file.type)) {
        setFileError("PNG/JPEG/WEBP만 업로드 가능합니다.");
        return;
      }
      const max = 2 * 1024 * 1024;
      if (file.size > max) {
        setFileError("이미지 최대 2MB까지 허용됩니다.");
        return;
      }
    }
    const fd = new FormData();
    fd.append("name", name);
    fd.append("prompt", prompt);
    if (file) fd.append("thumbnail", file);
    
    createCharacterMutation.mutate(fd);
  }

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
    } catch {}
    navigate(`/chat/${c.id}`);
  }

  if (loading) return <LoadingContainer>불러오는 중...</LoadingContainer>;
  if (error) return <ErrorContainer>{error}</ErrorContainer>;

  return (
    <PageContainer>
      <Title>환영합니다</Title>
      <Subtitle>로그인: {me?.email}</Subtitle>
      <Button onClick={onLogout}>로그아웃</Button>

      <Grid columns={2} style={{ marginTop: 24 }}>
        <div>
          <SectionTitle>캐릭터 생성</SectionTitle>
          <FormContainer onSubmit={onCreateCharacter}>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름"
              required
            />
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="프롬프트"
              required
            />
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            {previewUrl && (
              <ImagePreview>
                <PreviewImage
                  src={previewUrl}
                  width={64}
                  height={64}
                />
                <Button type="button" onClick={() => setFile(null)}>
                  이미지 제거
                </Button>
              </ImagePreview>
            )}
            {fileError && <ErrorText>{fileError}</ErrorText>}
            <Button type="submit" variant="primary">
              생성
            </Button>
          </FormContainer>
        </div>

        <div>
          <SectionTitle>캐릭터 목록</SectionTitle>
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
                    <CharacterMeta className="muted">
                      {c.prompt.slice(0, 80)}
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
        </div>
      </Grid>
    </PageContainer>
  );
}
