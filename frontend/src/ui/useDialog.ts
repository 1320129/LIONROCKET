import React, { useContext } from "react";

type DialogContextValue = {
  alert: (msg: string | React.ReactNode, title?: string) => Promise<void>;
  confirm: (
    msg: string | React.ReactNode,
    title?: string,
    okText?: string,
    cancelText?: string
  ) => Promise<boolean>;
};

const DialogContext = React.createContext<DialogContextValue | null>(null);

export { DialogContext };

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("useDialog must be used within DialogProvider");
  return ctx;
}
