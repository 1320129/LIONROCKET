import { useEffect } from "react";
import { getChannel } from "../lib/persist";

export function useBroadcastChannel(
  characterId: number,
  onDraftUpdate: (value: string) => void,
  onLogout: () => void
) {
  useEffect(() => {
    const ch = getChannel();
    if (!ch) return;

    const onMessage = (ev: MessageEvent<unknown>) => {
      const data = ev.data as {
        type?: string;
        characterId?: number;
        value?: unknown;
      };

      if (data?.type === "draft" && data.characterId === characterId) {
        const value = (data as { value?: unknown }).value;
        onDraftUpdate(String(value || ""));
      }

      if (data?.type === "logout") {
        onLogout();
      }
    };

    ch.addEventListener("message", onMessage);
    return () => ch.removeEventListener("message", onMessage);
  }, [characterId, onDraftUpdate, onLogout]);
}
