import { useQuery } from "@tanstack/react-query";
import { apiWithRetry } from "../lib/api";

export function useCharacter(characterId: number) {
  const { data, isLoading } = useQuery<{ id: number; name: string }>({
    queryKey: ["character", characterId],
    queryFn: async () => {
      const ch = await apiWithRetry<{ id: number; name: string }>(
        `/characters/${characterId}`,
      );
      try {
        localStorage.setItem(`characterName:${characterId}`, ch.name);
      } catch {
        // ignore localStorage errors
      }
      return ch;
    },
    initialData: () => {
      try {
        const cachedName = localStorage.getItem(`characterName:${characterId}`);
        return cachedName ? { id: characterId, name: cachedName } : undefined;
      } catch {
        return undefined;
      }
    },
  });

  return {
    characterName: data?.name ?? `캐릭터 #${characterId}`,
    loading: isLoading,
  };
}
