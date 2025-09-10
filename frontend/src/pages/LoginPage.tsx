import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "../lib/api";
import { LoginCredentials } from "../types/auth";

import {
  LoginContainer,
  LoginTitle,
  LoginForm,
  LoginActions,
  TabButton,
  LoginFormGrid,
  SubmitButton,
  ErrorText,
} from "../styles/styled";
import { Input } from "../styles/primitives";

export default function LoginPage() {
  const nav = useNavigate();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const authMutation = useMutation({
    mutationFn: async ({ email, password }: LoginCredentials) => {
      const path = mode === "login" ? "/auth/login" : "/auth/register";
      return api(path, {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
    },
    onSuccess: async () => {
      // 로그인 성공 시 인증 상태 강제 업데이트
      queryClient.setQueryData(["auth", "check"], true);
      // 약간의 지연 후 네비게이션 (상태 업데이트 보장)
      await new Promise((resolve) => setTimeout(resolve, 100));
      nav("/", { replace: true });
    },
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    authMutation.mutate({ email, password });
  }

  return (
    <LoginContainer>
      <LoginTitle>AI Chat</LoginTitle>
      <LoginForm onSubmit={onSubmit}>
        <LoginActions>
          <TabButton
            type="button"
            onClick={() => setMode("login")}
            active={mode === "login"}
          >
            로그인
          </TabButton>
          <TabButton
            type="button"
            onClick={() => setMode("register")}
            active={mode === "register"}
          >
            회원가입
          </TabButton>
        </LoginActions>
        <LoginFormGrid>
          <Input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="비밀번호 (6자 이상)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
          <SubmitButton type="submit" disabled={authMutation.isPending}>
            {authMutation.isPending
              ? "처리중..."
              : mode === "login"
              ? "로그인"
              : "회원가입"}
          </SubmitButton>
          {authMutation.error && (
            <ErrorText>{authMutation.error.message}</ErrorText>
          )}
        </LoginFormGrid>
      </LoginForm>
    </LoginContainer>
  );
}
