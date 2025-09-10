import React from "react";
import { apiWithRetry } from "../lib/api";

export default function useCharacterName(characterId: number) {
  const [name, setName] = React.useState(() => {
    try {
      return (
        localStorage.getItem(`characterName:${characterId}`) ||
        `\uCE90\uB9AD\uD130 #${characterId}`
      );
    } catch {
      return `\uCE90\uB9AD\uD130 #${characterId}`;
    }
  });

  React.useEffect(() => {
    if (localStorage.getItem(`characterName:${characterId}`)) return;
    let ignore = false;
    (async () => {
      try {
        const ch = await apiWithRetry<{ id: number; name: string }>(
          `/characters/${characterId}`
        );
        if (!ignore && ch?.name) {
          setName(ch.name);
          localStorage.setItem(`characterName:${characterId}`, ch.name);
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      ignore = true;
    };
  }, [characterId]);

  return name;
}

