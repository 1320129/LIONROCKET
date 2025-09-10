import { useState, useEffect } from "react";
import { apiWithRetry } from "../lib/api";

export function useCharacter(characterId: number) {
  const [characterName, setCharacterName] = useState<string>(
    `캐릭터 #${characterId}`
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cachedName = (() => {
      try {
        return (
          localStorage.getItem(`characterName:${characterId}`) || undefined
        );
      } catch {
        return undefined;
      }
    })();

    if (cachedName) {
      setCharacterName(cachedName);
      return;
    }

    setLoading(true);
    (async () => {
      try {
        const ch = await apiWithRetry<{ id: number; name: string }>(
          `/characters/${characterId}`
        );
        if (ch?.name) {
          setCharacterName(ch.name);
          try {
            localStorage.setItem(`characterName:${characterId}`, ch.name);
          } catch {
            // ignore localStorage errors
          }
        }
      } catch {
        // ignore fetch error; fallback name is already set
      } finally {
        setLoading(false);
      }
    })();
  }, [characterId]);

  return { characterName, loading };
}
