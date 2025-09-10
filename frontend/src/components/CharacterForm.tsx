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

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0] || null;
    handleFileChange(selectedFile);
  }

  function handleRemoveImage() {
    handleFileChange(null);
  }

  return (
    <FormContainer onSubmit={handleSubmit}>
      <Input
        value={formData.name}
        onChange={(e) => updateFormData({ name: e.target.value })}
        placeholder="이름"
        required
      />
      <Textarea
        value={formData.prompt}
        onChange={(e) => updateFormData({ prompt: e.target.value })}
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
      <Button
        type="submit"
        variant="primary"
        disabled={loading}
      >
        {loading ? "생성 중..." : "생성"}
      </Button>
    </FormContainer>
  );
}