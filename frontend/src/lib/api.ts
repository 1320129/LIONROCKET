import { API_BASE } from "./config";

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    let msg = "요청이 실패했습니다";
    try {
      const data = (await res.json()) as { error?: string };
      msg = data?.error || msg;
    } catch {}
    throw new Error(msg);
  }
  try {
    return (await res.json()) as T;
  } catch {
    return undefined as unknown as T;
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
      await wait(delay);
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error("요청이 실패했습니다");
}
