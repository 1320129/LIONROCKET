/**
 * 메시지 관련 타입 정의
 * 모든 메시지 관련 컴포넌트와 훅에서 사용하는 공통 타입들
 */

// 기본 메시지 타입
export type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  created_at: number;
};

// 상태 정보가 포함된 메시지 타입
export type MessageWithStatus = Message & {
  status?: "pending" | "failed" | "sent";
  error?: string;
};

// 메시지 생성용 유틸리티 타입
export type CreateMessageOptions = {
  content: string;
  role: "user" | "assistant";
  status?: "pending" | "failed" | "sent";
  error?: string;
};
