import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { theme as appTheme } from "./ui/theme";
import { GlobalStyle } from "./ui/GlobalStyle";
import { Container, PageHeader, Button as Btn } from "./ui/primitives";
import { DialogProvider } from "./ui/Dialog";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import { API_BASE } from "./lib/config";
import { getChannel, readTheme, saveTheme } from "./lib/persist";
import ChatPage from "./pages/ChatPage";

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
  const [authed, setAuthed] = React.useState<boolean | null>(null);
  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          credentials: "include",
        });
        setAuthed(res.ok);
      } catch {
        setAuthed(false);
      }
    })();
  }, []);
  if (authed === null) return <div style={{ padding: 24 }}>Loading...</div>;
  return authed ? <>{children}</> : <Navigate to="/login" replace />;
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
                <div style={{ fontWeight: 700 }}>AI Chat</div>
                <div className="row">
                  <Btn
                    onClick={() =>
                      setColorMode(colorMode === "dark" ? "light" : "dark")
                    }
                  >
                    {colorMode === "dark" ? "라이트" : "다크"} 모드
                  </Btn>
                </div>
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
