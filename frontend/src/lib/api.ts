import { API_BASE } from "./config";

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "요청이 실패했습니다");
  }

  return res.json();
}

export async function apiWithRetry<T>(
  path: string,
  options: RequestInit = {},
  retryCount = 2,
  baseDelayMs = 400
): Promise<T> {
  let lastError: unknown = null;
  for (let attempt = 0; attempt <= retryCount; attempt += 1) {
    try {
      return await api<T>(path, options);
    } catch (err) {
      lastError = err;
      if (attempt === retryCount) break;
      const delay = baseDelayMs * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error("요청이 실패했습니다");
}
