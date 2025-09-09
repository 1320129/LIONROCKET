import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import { API_BASE } from "./lib/config";
import { getChannel, readTheme, saveTheme } from "./lib/persist";
import ChatPage from "./pages/ChatPage";

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
  const [theme, setTheme] = React.useState<"light" | "dark">(
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
    if (theme === "dark") root.classList.add("theme-dark");
    else root.classList.add("theme-light");
    saveTheme(theme);
  }, [theme]);
  React.useEffect(() => {
    const ch = getChannel();
    if (!ch) return;
    const onMessage = (ev: MessageEvent<any>) => {
      if (ev.data?.type === "theme") setTheme(ev.data.value);
    };
    ch.addEventListener("message", onMessage as any);
    return () => ch.removeEventListener("message", onMessage as any);
  }, []);
  return (
    <BrowserRouter>
      <div className="container">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div style={{ fontWeight: 700 }}>AI Chat</div>
          <div className="row">
            <button
              className="btn"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? "라이트" : "다크"} 모드
            </button>
          </div>
        </div>
      </div>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <div className="container">
                <HomePage />
              </div>
            </RequireAuth>
          }
        />
        <Route
          path="/chat/:id"
          element={
            <RequireAuth>
              <div className="container">
                <ChatPage />
              </div>
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
