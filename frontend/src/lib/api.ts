import { queryFn } from "../queryClient";

export type ApiOptions = RequestInit;

export function api<T>(path: string, options: ApiOptions = {}) {
  return queryFn<T>(path, options);
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
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  if (lastError instanceof Error) throw lastError;
  throw new Error("요청이 실패했습니다");
}
