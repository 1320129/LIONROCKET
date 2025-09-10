import React from "react";
import { readDraft, saveDraft } from "../lib/persist";

export function useDraft(characterId: number) {
  const [input, setInput] = React.useState("");

  React.useEffect(() => {
    setInput(readDraft(characterId));
  }, [characterId]);

  React.useEffect(() => {
    saveDraft(characterId, input);
  }, [characterId, input]);

  return { input, setInput };
}
