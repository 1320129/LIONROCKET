import React from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function LoginPage() {
  const nav = useNavigate();
  const [mode, setMode] = React.useState<"login" | "register">("login");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  // Clear any stale auth cookie on mount to avoid signature mismatch after server secret changes
  React.useEffect(() => {
    api("/auth/logout", { method: "POST" }).catch(() => {});
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const path = mode === "login" ? "/auth/login" : "/auth/register";
      await api(path, {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      nav("/", { replace: true });
    } catch (err: any) {
      setError(err.message || "요청 실패");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 360, margin: "80px auto", padding: 16 }}>
      <h1>AI Chat 로그인</h1>
      <form onSubmit={onSubmit}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button
            type="button"
            onClick={() => setMode("login")}
            disabled={mode === "login"}
          >
            로그인
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            disabled={mode === "register"}
          >
            회원가입
          </button>
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="비밀번호 (6자 이상)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "처리중..." : mode === "login" ? "로그인" : "회원가입"}
          </button>
          {error && <div style={{ color: "red" }}>{error}</div>}
        </div>
      </form>
    </div>
  );
}
