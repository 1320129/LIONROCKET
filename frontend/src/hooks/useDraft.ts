import React, { useState, useEffect } from "react";
import { readDraft, saveDraft } from "../lib/persist";

export function useDraft(characterId: number) {
  const [input, setInput] = useState("");

  useEffect(() => {
    setInput(readDraft(characterId));
  }, [characterId]);

  useEffect(() => {
    saveDraft(characterId, input);
  }, [characterId, input]);

  return { input, setInput };
}
