import { useState } from "react";
import { useCharacterForm } from "../hooks/useCharacterForm";

import { Button, Input, Textarea } from "../styles/primitives";
import {
  FormContainer,
  ImagePreview,
  PreviewImage,
  ErrorText,
} from "../styles/styled";

type CharacterFormProps = {
  onSuccess?: () => void;
};

export function CharacterForm({ onSuccess }: CharacterFormProps) {
  const {
    formData,
    previewUrl,
    loading,
    updateFormData,
    handleFileChange,
    handleSubmit,
  } = useCharacterForm(onSuccess);

  // 한글 조합 상태 관리
  const [isComposing, setIsComposing] = useState(false);
  const [localName, setLocalName] = useState(formData.name);
  const [localPrompt, setLocalPrompt] = useState(formData.prompt);

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0] || null;
    handleFileChange(selectedFile);
  }

  function handleRemoveImage() {
    handleFileChange(null);
  }

  // 한글 입력 처리
  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setLocalName(e.target.value);
    if (!isComposing) {
      updateFormData({ name: e.target.value });
    }
  }

  function handlePromptChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setLocalPrompt(e.target.value);
    if (!isComposing) {
      updateFormData({ prompt: e.target.value });
    }
  }

  function handleCompositionStart() {
    setIsComposing(true);
  }

  function handleCompositionEnd(
    e: React.CompositionEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setIsComposing(false);
    const value = e.currentTarget.value;
    if (e.currentTarget.type === "text") {
      setLocalName(value);
      updateFormData({ name: value });
    } else {
      setLocalPrompt(value);
      updateFormData({ prompt: value });
    }
  }

  return (
    <FormContainer onSubmit={handleSubmit}>
      <Input
        value={localName}
        onChange={handleNameChange}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        placeholder="이름"
        required
      />
      <Textarea
        value={localPrompt}
        onChange={handlePromptChange}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        placeholder="프롬프트"
        required
      />
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFileInputChange}
      />
      {previewUrl && (
        <ImagePreview>
          <PreviewImage src={previewUrl} width={64} height={64} />
          <Button type="button" onClick={handleRemoveImage}>
            이미지 제거
          </Button>
        </ImagePreview>
      )}
      {formData.fileError && <ErrorText>{formData.fileError}</ErrorText>}
      <Button type="submit" variant="primary" disabled={loading}>
        {loading ? "생성 중..." : "생성"}
      </Button>
    </FormContainer>
  );
}
