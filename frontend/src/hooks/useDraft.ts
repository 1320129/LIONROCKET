import React from "react";
import { readDraft, saveDraft, getChannel } from "../lib/persist";

export default function useDraft(characterId: number) {
  const [input, setInput] = React.useState(() => readDraft(characterId));

  React.useEffect(() => {
    saveDraft(characterId, input);
  }, [characterId, input]);

  React.useEffect(() => {
    const ch = getChannel();
    if (!ch) return;
    const onMessage = (ev: MessageEvent<unknown>) => {
      const data = ev.data as {
        type?: string;
        characterId?: number;
        value?: unknown;
      };
      if (data?.type === "draft" && data.characterId === characterId) {
        setInput(String((data as { value?: unknown }).value || ""));
      }
      if (data?.type === "logout") {
        location.href = "/login";
      }
    };
    ch.addEventListener("message", onMessage);
    return () => ch.removeEventListener("message", onMessage);
  }, [characterId]);

  return [input, setInput] as const;
}

