import React from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

import { api } from "../lib/api";

import {
  LoginContainer,
  LoginForm,
  LoginActions,
  ErrorText,
} from "../ui/styled";

export default function LoginPage() {
  const nav = useNavigate();
  const [mode, setMode] = React.useState<"login" | "register">("login");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  React.useEffect(() => {
    api("/auth/logout", { method: "POST" }).catch(() => {});
  }, []);

  const authMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const path = mode === "login" ? "/auth/login" : "/auth/register";
      return api(path, {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
    },
    onSuccess: () => {
      nav("/", { replace: true });
    },
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    authMutation.mutate({ email, password });
  }

  return (
    <LoginContainer>
      <h1>AI Chat 로그인</h1>
      <LoginForm onSubmit={onSubmit}>
        <LoginActions>
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
        </LoginActions>
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
          <button type="submit" disabled={authMutation.isPending}>
            {authMutation.isPending ? "처리중..." : mode === "login" ? "로그인" : "회원가입"}
          </button>
          {authMutation.error && <ErrorText>{authMutation.error.message}</ErrorText>}
        </div>
      </LoginForm>
    </LoginContainer>
  );
}
