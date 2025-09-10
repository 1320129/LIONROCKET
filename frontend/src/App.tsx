import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { getChannel, readTheme, saveTheme } from "./lib/persist";
import { api } from "./lib/api";

import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import ChatPage from "./pages/ChatPage";

import { theme as appTheme } from "./styles/theme";
import { GlobalStyle } from "./styles/GlobalStyle";
import { Container, PageHeader, Button as Btn, Row } from "./styles/primitives";
import { DialogProvider } from "./components/Dialog";
import { AuthLoading, AppTitle } from "./styles/styled";

// QueryClient 인스턴스 생성
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5분
      retry: 1,
    },
  },
});

function RequireAuth({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["auth", "check"],
    queryFn: async () => {
      try {
        await api("/auth/me");
        return true;
      } catch {
        return false;
      }
    },
    retry: false,
    refetchOnWindowFocus: false, // 윈도우 포커스 시 재검증 비활성화
    refetchOnMount: true, // 마운트 시 재검증
    staleTime: 60 * 1000, // 60초간 캐시 유지
  });

  // 쿠키 변경 감지를 위한 이벤트 리스너
  useEffect(() => {
    const handleStorageChange = () => {
      // 쿠키가 변경되었을 때 인증 상태 재검증
      queryClient.invalidateQueries({ queryKey: ["auth", "check"] });
    };

    // storage 이벤트 리스너 (다른 탭에서 쿠키 변경 시)
    window.addEventListener("storage", handleStorageChange);

    // 주기적으로 인증 상태 확인 (60초마다, 더 긴 간격)
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["auth", "check"] });
    }, 60000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [queryClient]);

  if (isLoading) return <AuthLoading>Loading...</AuthLoading>;
  if (error || !data) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const [colorMode, setColorMode] = useState<"light" | "dark">(
    () =>
      readTheme() ||
      (window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light")
  );
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("theme-dark", "theme-light");
    if (colorMode === "dark") root.classList.add("theme-dark");
    else root.classList.add("theme-light");
    saveTheme(colorMode);
  }, [colorMode]);

  useEffect(() => {
    const ch = getChannel();
    if (!ch) return;
    const onMessage = (
      ev: MessageEvent<{ type?: string; value?: "light" | "dark" }>
    ) => {
      if (ev.data?.type === "theme") setColorMode(ev.data.value);
    };
    ch.addEventListener("message", onMessage);
    return () => ch.removeEventListener("message", onMessage);
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={appTheme}>
        <GlobalStyle />
        <DialogProvider>
          <BrowserRouter>
            <Container>
              <PageHeader>
                <AppTitle>AI Chat</AppTitle>
                <Row>
                  <Btn
                    onClick={() =>
                      setColorMode(colorMode === "dark" ? "light" : "dark")
                    }
                  >
                    {colorMode === "dark" ? "라이트" : "다크"} 모드
                  </Btn>
                </Row>
              </PageHeader>
            </Container>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/"
                element={
                  <RequireAuth>
                    <Container>
                      <HomePage />
                    </Container>
                  </RequireAuth>
                }
              />
              <Route
                path="/chat/:id"
                element={
                  <RequireAuth>
                    <Container>
                      <ChatPage />
                    </Container>
                  </RequireAuth>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </DialogProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
