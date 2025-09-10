import { readLastCharacter } from "../lib/persist";
import { MessageWithStatus } from "../types/message";

export function validateCharacterId(characterId: number): boolean {
  return !Number.isNaN(characterId) && characterId > 0;
}

export function redirectToLastCharacter(navigate: (path: string, options?: { replace?: boolean }) => void): void {
  const last = readLastCharacter();
  if (last) {
    navigate(`/chat/${last}`, { replace: true });
  }
}

export function formatMessageTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString();
}

export function createUserMessage(content: string): MessageWithStatus {
  const now = Date.now();
  return {
    id: now,
    role: "user",
    content,
    created_at: now,
    status: "pending",
  };
}

export function createAssistantMessage(
  content: string,
  createdAt: number
): MessageWithStatus {
  return {
    id: Date.now() + 1,
    role: "assistant",
    content,
    created_at: createdAt,
    status: "sent",
  };
}
