import { readLastCharacter } from "../lib/persist";

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
