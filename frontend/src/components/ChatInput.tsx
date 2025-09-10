import React from "react";
import { Button, Input, Row } from "../ui/primitives";
import { ChatForm, ChatInput as StyledChatInput } from "../ui/styled";

interface ChatInputProps {
  input: string;
  loading: boolean;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function ChatInput({
  input,
  loading,
  onInputChange,
  onSubmit,
}: ChatInputProps) {
  return (
    <ChatForm onSubmit={onSubmit}>
      <StyledChatInput
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        placeholder="메시지를 입력하세요 (200자 이내)"
        maxLength={200}
      />
      <Button type="submit" variant="primary" disabled={loading}>
        보내기
      </Button>
    </ChatForm>
  );
}
