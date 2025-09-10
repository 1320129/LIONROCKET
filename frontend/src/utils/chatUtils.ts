import { readLastCharacter } from "../lib/persist";

export function validateCharacterId(characterId: number): boolean {
  return !Number.isNaN(characterId) && characterId > 0;
}

export function redirectToLastCharacter(): void {
  const last = readLastCharacter();
  if (last) {
    location.replace(`/chat/${last}`);
  }
}

export function formatMessageTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString();
}

export function createUserMessage(content: string): {
  id: number;
  role: "user";
  content: string;
  created_at: number;
  status: "pending";
} {
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
): {
  id: number;
  role: "assistant";
  content: string;
  created_at: number;
  status: "sent";
} {
  return {
    id: Date.now() + 1,
    role: "assistant",
    content,
    created_at: createdAt,
    status: "sent",
  };
}
