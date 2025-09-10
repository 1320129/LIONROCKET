/**
 * 인증 관련 타입 정의
 */

export type LoginCredentials = {
  email: string;
  password: string;
};

export type User = {
  id: number;
  email: string;
};
