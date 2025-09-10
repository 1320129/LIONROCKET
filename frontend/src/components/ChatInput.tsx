import React from "react";
import styled from "styled-components";
import { Button, Input } from "../ui/primitives";

interface ChatInputProps {
  input: string;
  loading: boolean;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const Form = styled.form`
  display: flex;
  gap: 8px;
`;

const MessageInput = styled(Input)`
  flex: 1;
`;

export function ChatInput({
  input,
  loading,
  onInputChange,
  onSubmit,
}: ChatInputProps) {
  return (
    <Form onSubmit={onSubmit}>
      <MessageInput
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        placeholder="메시지를 입력하세요 (200자 이내)"
        maxLength={200}
      />
      <Button type="submit" variant="primary" disabled={loading}>
        보내기
      </Button>
    </Form>
  );
}
