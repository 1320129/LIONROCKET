import { useMemo, useCallback } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";

import { api } from "../lib/api";
import { Character } from "../types/character";
import { useDialog } from "./useDialog";

export type CharacterFormData = {
  name: string;
  prompt: string;
  file: File | null;
  fileError: string | null;
};

const FORM_QUERY_KEY = ["characterForm"] as const;
const initialFormData: CharacterFormData = {
  name: "",
  prompt: "",
  file: null,
  fileError: null,
};

/**
 * 캐릭터 생성 폼 관리 훅
 * React Query를 사용하여 폼 상태를 관리하고 캐릭터 생성 API를 호출합니다.
 * 
 * @param onSuccess 캐릭터 생성 성공 시 호출될 콜백 함수
 * @returns 폼 데이터, 핸들러 함수들, 로딩 상태 등
 */
export function useCharacterForm(onSuccess?: () => void) {
  const dialog = useDialog();
  const queryClient = useQueryClient();

  // React Query로 폼 상태 관리
  const { data: formData = initialFormData } = useQuery({
    queryKey: FORM_QUERY_KEY,
    queryFn: () => initialFormData,
    staleTime: Infinity,
  });

  // 파일 미리보기 URL 생성
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

  /**
   * 파일 유효성 검사
   * @param file 검사할 파일
   * @returns 에러 메시지 또는 null (유효한 경우)
   */
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

  /**
   * 폼 데이터 업데이트
   * React Query 캐시를 통해 상태를 업데이트합니다.
   * @param updates 업데이트할 폼 데이터 부분
   */
  const updateFormData = useCallback(
    (updates: Partial<CharacterFormData>) => {
      queryClient.setQueryData(FORM_QUERY_KEY, (prev: CharacterFormData) => ({
        ...prev,
        ...updates,
      }));
    },
    [queryClient]
  );

  /**
   * 폼 초기화
   * 모든 폼 데이터를 초기값으로 리셋합니다.
   */
  const resetForm = useCallback(() => {
    queryClient.setQueryData(FORM_QUERY_KEY, initialFormData);
  }, [queryClient]);

  /**
   * 파일 변경 핸들러
   * 파일 선택/제거 시 유효성 검사 후 상태를 업데이트합니다.
   * @param file 선택된 파일 또는 null (제거 시)
   */
  const handleFileChange = useCallback(
    (file: File | null) => {
      if (!file) {
        updateFormData({ file: null, fileError: null });
        return;
      }

      const error = validateFile(file);
      updateFormData({ file, fileError: error });
    },
    [updateFormData]
  );

  /**
   * 폼 제출 핸들러
   * 폼 유효성 검사 후 캐릭터 생성 API를 호출합니다.
   * @param e 폼 제출 이벤트
   */
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
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
    },
    [formData, dialog, createCharacterMutation]
  );

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
