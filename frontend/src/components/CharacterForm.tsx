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

type Character = {
  id: number;
  owner_user_id: number | null;
  name: string;
  prompt: string;
  thumbnail_path: string | null;
  created_at: number;
};

type CharacterFormProps = {
  onSuccess?: () => void;
};

export function CharacterForm({ onSuccess }: CharacterFormProps) {
  const dialog = useDialog();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file]
  );

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
      onSuccess?.();
    },
    onError: async (e: unknown) => {
      await dialog.alert(e instanceof Error ? e.message : "생성 실패", "오류");
    },
  });

  function validateFile(file: File): string | null {
    const validTypes = ["image/png", "image/jpeg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return "PNG/JPEG/WEBP만 업로드 가능합니다.";
    }
    const max = 2 * 1024 * 1024;
    if (file.size > max) {
      return "이미지 최대 2MB까지 허용됩니다.";
    }
    return null;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFileError(null);

    if (file) {
      const error = validateFile(file);
      if (error) {
        setFileError(error);
        return;
      }
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("prompt", prompt);
    if (file) formData.append("thumbnail", file);

    createCharacterMutation.mutate(formData);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setFileError(null);
  }

  function handleRemoveImage() {
    setFile(null);
    setFileError(null);
  }

  return (
    <FormContainer onSubmit={handleSubmit}>
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
        onChange={handleFileChange}
      />
      {previewUrl && (
        <ImagePreview>
          <PreviewImage src={previewUrl} width={64} height={64} />
          <Button type="button" onClick={handleRemoveImage}>
            이미지 제거
          </Button>
        </ImagePreview>
      )}
      {fileError && <ErrorText>{fileError}</ErrorText>}
      <Button type="submit" variant="primary" disabled={createCharacterMutation.isPending}>
        {createCharacterMutation.isPending ? "생성 중..." : "생성"}
      </Button>
    </FormContainer>
  );
}
