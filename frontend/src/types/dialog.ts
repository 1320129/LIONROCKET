/**
 * 다이얼로그 관련 타입 정의
 * 다이얼로그 Context와 API 타입들을 관리
 */

import { createContext } from "react";
import React from "react";

// 다이얼로그 API 타입 정의
export type DialogAPI = {
  alert: (msg: string | React.ReactNode, title?: string) => Promise<void>;
  confirm: (
    msg: string | React.ReactNode,
    title?: string,
    okText?: string,
    cancelText?: string
  ) => Promise<boolean>;
};

// 다이얼로그 Context 생성
export const DialogContext = createContext<DialogAPI | null>(null);
