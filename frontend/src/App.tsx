import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";

import { getChannel, readTheme, saveTheme } from "./lib/persist";
import { api } from "./lib/api";

import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import ChatPage from "./pages/ChatPage";

import { theme as appTheme } from "./ui/theme";
import { GlobalStyle } from "./ui/GlobalStyle";
import { Container, PageHeader, Button as Btn, Row } from "./ui/primitives";
import { DialogProvider } from "./ui/Dialog";
import { AuthLoading, AppTitle } from "./ui/styled";

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
  });

  if (isLoading) return <AuthLoading>Loading...</AuthLoading>;
  if (error || !data) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const [colorMode, setColorMode] = React.useState<"light" | "dark">(
    () =>
      readTheme() ||
      (window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light")
  );
  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("theme-dark", "theme-light");
    if (colorMode === "dark") root.classList.add("theme-dark");
    else root.classList.add("theme-light");
    saveTheme(colorMode);
  }, [colorMode]);
  React.useEffect(() => {
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
