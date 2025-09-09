const CHANNEL_NAME = "ai-chat-sync";

export type SyncEvent =
  | { type: "draft"; characterId: number; value: string }
  | { type: "lastCharacter"; characterId: number }
  | { type: "logout" }
  | { type: "theme"; value: "light" | "dark" };

export function getChannel(): BroadcastChannel | null {
  try {
    return new BroadcastChannel(CHANNEL_NAME);
  } catch {
    return null;
  }
}

export function saveLastCharacter(id: number) {
  localStorage.setItem("lastCharacterId", String(id));
  const ch = getChannel();
  ch?.postMessage({
    type: "lastCharacter",
    characterId: id,
  } satisfies SyncEvent);
}

export function readLastCharacter(): number | null {
  const v = localStorage.getItem("lastCharacterId");
  return v ? Number(v) : null;
}

export function saveDraft(characterId: number, value: string) {
  localStorage.setItem(`draft:${characterId}`, value);
  const ch = getChannel();
  ch?.postMessage({ type: "draft", characterId, value } satisfies SyncEvent);
}

export function readDraft(characterId: number): string {
  return localStorage.getItem(`draft:${characterId}`) || "";
}

export function broadcastLogout() {
  const ch = getChannel();
  ch?.postMessage({ type: "logout" } satisfies SyncEvent);
}

export function saveTheme(value: "light" | "dark") {
  localStorage.setItem("theme", value);
  const ch = getChannel();
  ch?.postMessage({ type: "theme", value } satisfies SyncEvent);
}

export function readTheme(): "light" | "dark" | null {
  const v = localStorage.getItem("theme");
  if (v === "light" || v === "dark") return v;
  return null;
}
