import { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useDialog } from "../hooks/useDialog";
import { Button, Input, Textarea } from "../styles/primitives";
import {
  FormContainer,
  ImagePreview,
  PreviewImage,
  ErrorText,
} from "../styles/styled";
import type { Character } from "../types/character";

export default function CharacterForm() {
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file]
  );

  const queryClient = useQueryClient();
  const dialog = useDialog();

  const createCharacterMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return api<Character>("/characters", {
        method: "POST",
        body: formData,
      });
    },
    onSuccess: (newChar) => {
      queryClient.setQueryData(["characters"], (old: Character[] = []) => [
        newChar,
        ...old,
      ]);
      setName("");
      setPrompt("");
      setFile(null);
      setFileError(null);
    },
    onError: async (e: unknown) => {
      await dialog.alert(
        e instanceof Error ? e.message : "생성 실패",
        "오류"
      );
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

  return (
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
          <PreviewImage src={previewUrl} width={64} height={64} />
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
  );
}

