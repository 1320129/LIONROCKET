import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { api } from "../lib/api";
import { broadcastLogout } from "../lib/persist";

/**
 * 인증 관리 훅
 * 사용자 인증 상태를 관리하고 로그아웃 기능을 제공합니다.
 *
 * @returns 사용자 정보, 로딩 상태, 에러, 로그아웃 함수 등
 */
export function useAuth() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 현재 사용자 정보 조회
  const {
    data: me,
    isLoading: meLoading,
    error: meError,
  } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => api<{ id: number; email: string }>("/auth/me"),
  });

  // 로그아웃 뮤테이션
  const logoutMutation = useMutation({
    mutationFn: async () => {
      return api("/auth/logout", { method: "POST" });
    },
    onSuccess: () => {
      // 모든 캐시를 완전히 초기화
      queryClient.clear(); // 모든 React Query 캐시 제거

      // localStorage에서 모든 캐시 제거
      try {
        const keys = Object.keys(localStorage);
        keys.forEach((key) => {
          if (key.startsWith("characterName:") || key.startsWith("draft:")) {
            localStorage.removeItem(key);
          }
        });
      } catch {
        // localStorage 접근 실패 시 무시
      }

      broadcastLogout();
      navigate("/login", { replace: true });
    },
  });

  /**
   * 로그아웃 실행
   * 서버에 로그아웃 요청을 보내고 로그인 페이지로 이동합니다.
   */
  function logout() {
    logoutMutation.mutate();
  }

  return {
    me,
    isLoading: meLoading,
    error: meError?.message || null,
    logout,
    isLoggingOut: logoutMutation.isPending,
  };
}
