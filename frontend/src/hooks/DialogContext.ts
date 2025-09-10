import { createContext } from "react";
import React from "react";

export type DialogAPI = {
  alert: (msg: string | React.ReactNode, title?: string) => Promise<void>;
  confirm: (
    msg: string | React.ReactNode,
    title?: string,
    okText?: string,
    cancelText?: string
  ) => Promise<boolean>;
};

export const DialogContext = createContext<DialogAPI | null>(null);
