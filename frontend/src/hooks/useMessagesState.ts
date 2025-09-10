import { useState } from "react";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  created_at: number;
};

type MessageWithStatus = Message & {
  status?: "pending" | "failed" | "sent";
  error?: string;
};

export function useMessagesState() {
  const [messages, setMessages] = useState<MessageWithStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  return {
    // 상태
    messages,
    loading,
    loadingOlder,
    hasMore,
    error,
    
    // 상태 업데이트 함수들
    setMessages,
    setLoading,
    setLoadingOlder,
    setHasMore,
    setError,
  };
}

export type { MessageWithStatus };
