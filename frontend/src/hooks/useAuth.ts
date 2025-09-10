import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { queryFn } from "../queryClient";
import { broadcastLogout } from "../lib/persist";

export function useAuth() {
  const navigate = useNavigate();

  const {
    data: me,
    isLoading: meLoading,
    error: meError,
  } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => queryFn<{ id: number; email: string }>("/auth/me"),
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return queryFn("/auth/logout", { method: "POST" });
    },
    onSuccess: () => {
      broadcastLogout();
      navigate("/login", { replace: true });
    },
  });

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
