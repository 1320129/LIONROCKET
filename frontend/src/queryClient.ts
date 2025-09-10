import { QueryClient } from "@tanstack/react-query";
import { API_BASE } from "./lib/config";

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export async function queryFn<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    data = undefined;
  }

  if (!res.ok) {
    const message =
      typeof data === "object" && data !== null && "error" in data
        ? (data as { error?: string }).error || res.statusText
        : res.statusText;
    throw new ApiError(res.status, message, data);
  }

  return data as T;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
    },
  },
});

