import { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "../lib/api";
import { Character } from "../types/character";
import { useDialog } from "./useDialog";

export type CharacterFormData = {
  name: string;
  prompt: string;
  file: File | null;
  fileError: string | null;
};

const initialFormData: CharacterFormData = {
  name: "",
  prompt: "",
  file: null,
  fileError: null,
};

export function useCharacterForm(onSuccess?: () => void) {
  const [formData, setFormData] = useState<CharacterFormData>(initialFormData);
  const dialog = useDialog();
  const queryClient = useQueryClient();

  const previewUrl = useMemo(
    () => (formData.file ? URL.createObjectURL(formData.file) : null),
    [formData.file]
  );

  const createCharacterMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return api<Character>("/characters", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: (newChar) => {
      // 캐시 업데이트
      queryClient.setQueryData(["characters"], (old: Character[] = []) => [
        newChar,
        ...old,
      ]);
      
      // 폼 초기화
      resetForm();
      onSuccess?.();
    },
    onError: async (e: unknown) => {
      await dialog.alert(
        e instanceof Error ? e.message : "캐릭터 생성에 실패했습니다",
        "오류"
      );
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

  function updateFormData(updates: Partial<CharacterFormData>) {
    setFormData(prev => ({ ...prev, ...updates }));
  }

  function resetForm() {
    setFormData(initialFormData);
  }

  function handleFileChange(file: File | null) {
    if (!file) {
      updateFormData({ file: null, fileError: null });
      return;
    }

    const error = validateFile(file);
    updateFormData({ file, fileError: error });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.name.trim()) {
      dialog.alert("캐릭터 이름을 입력해주세요.", "입력 오류");
      return;
    }

    if (!formData.prompt.trim()) {
      dialog.alert("캐릭터 프롬프트를 입력해주세요.", "입력 오류");
      return;
    }

    if (formData.fileError) {
      dialog.alert(formData.fileError, "파일 오류");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name.trim());
    formDataToSend.append("prompt", formData.prompt.trim());
    if (formData.file) {
      formDataToSend.append("thumbnail", formData.file);
    }

    createCharacterMutation.mutate(formDataToSend);
  }

  return {
    formData,
    previewUrl,
    loading: createCharacterMutation.isPending,
    updateFormData,
    resetForm,
    handleFileChange,
    handleSubmit,
  };
}
