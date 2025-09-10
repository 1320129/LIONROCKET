import { API_BASE } from "./config";

export type ApiOptions = RequestInit & {
  timeout?: number;
};

export async function api<T>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const { timeout = 10000, ...fetchOptions } = options;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      credentials: "include",
      headers: { "Content-Type": "application/json", ...(fetchOptions.headers || {}) },
      signal: controller.signal,
      ...fetchOptions,
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      let msg = "요청이 실패했습니다";
      try {
        const data = (await res.json()) as { error?: string };
        msg = data?.error || msg;
      } catch {
        // JSON 파싱 실패 시 기본 메시지 사용
      }
      throw new Error(msg);
    }
    
    try {
      return (await res.json()) as T;
    } catch {
      return undefined as unknown as T;
    }
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('요청 시간이 초과되었습니다');
    }
    throw error;
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function apiWithRetry<T>(
  path: string,
  options: ApiOptions = {},
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
