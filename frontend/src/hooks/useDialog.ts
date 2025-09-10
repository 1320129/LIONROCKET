import { useContext } from "react";
import { DialogContext } from "../types/dialog";

/**
 * 다이얼로그 관리 훅
 * 모달 다이얼로그(alert, confirm) 기능을 제공합니다.
 *
 * @returns 다이얼로그 API (alert, confirm 함수들)
 * @throws DialogProvider 외부에서 사용 시 에러 발생
 */
export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("useDialog must be used within DialogProvider");
  return ctx;
}
