import { useState, useEffect } from "react";
import { apiWithRetry } from "../lib/api";
import { useAuth } from "./useAuth";

/**
 * 캐릭터 정보 관리 훅
 * 캐릭터 이름을 조회하고 캐싱하여 성능을 최적화합니다.
 *
 * @param characterId 캐릭터 ID
 * @returns 캐릭터 이름과 로딩 상태
 */
export function useCharacter(characterId: number) {
  const [characterName, setCharacterName] = useState<string>(
    `캐릭터 #${characterId}`
  );
  const [loading, setLoading] = useState(false);
  const { me } = useAuth();

  // 사용자별 캐시 키 생성
  const userId = me?.id || "anonymous";

  useEffect(() => {
    /**
     * 로컬 스토리지에서 캐시된 캐릭터 이름 조회
     */
    const cachedName = (() => {
      try {
        return (
          localStorage.getItem(`characterName:${characterId}:${userId}`) ||
          undefined
        );
      } catch {
        return undefined;
      }
    })();

    // 캐시된 이름이 있으면 즉시 사용
    if (cachedName) {
      setCharacterName(cachedName);
      return;
    }

    // 캐시가 없으면 API에서 조회
    setLoading(true);
    (async () => {
      try {
        const ch = await apiWithRetry<{ id: number; name: string }>(
          `/characters/${characterId}`
        );
        if (ch?.name) {
          setCharacterName(ch.name);
          try {
            localStorage.setItem(
              `characterName:${characterId}:${userId}`,
              ch.name
            );
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
