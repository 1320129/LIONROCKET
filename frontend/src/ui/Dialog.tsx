import React from "react";
import styled from "styled-components";
import { Button, Card } from "./primitives";

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const DialogCard = styled(Card)`
  width: min(92vw, 420px);
  padding: 16px;
`;

type DialogState = {
  open: boolean;
  title?: string;
  message?: string | React.ReactNode;
  okText?: string;
  cancelText?: string;
  onOk?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
};

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

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<DialogState>({ open: false });
  const resolverRef = React.useRef<((v: any) => void) | null>(null);

  function close() {
    setState({ open: false });
  }

  const api = React.useMemo<DialogContextValue>(
    () => ({
      alert(msg, title) {
        return new Promise<void>((resolve) => {
          resolverRef.current = resolve;
          setState({ open: true, title, message: msg, okText: "확인", showCancel: false, onOk: () => { resolve(); close(); } });
        });
      },
      confirm(msg, title, okText = "확인", cancelText = "취소") {
        return new Promise<boolean>((resolve) => {
          resolverRef.current = resolve as any;
          setState({
            open: true,
            title,
            message: msg,
            okText,
            cancelText,
            showCancel: true,
            onOk: () => { resolve(true); close(); },
            onCancel: () => { resolve(false); close(); },
          });
        });
      },
    }),
    []
  );

  return (
    <DialogContext.Provider value={api}>
      {children}
      {state.open && (
        <Backdrop onClick={() => state.showCancel ? state.onCancel?.() : state.onOk?.()}>
          <DialogCard onClick={(e) => e.stopPropagation()}>
            {state.title && <div style={{ fontWeight: 600, marginBottom: 8 }}>{state.title}</div>}
            <div style={{ marginBottom: 16 }}>{state.message}</div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              {state.showCancel && (
                <Button onClick={() => state.onCancel?.()}>{state.cancelText || "취소"}</Button>
              )}
              <Button variant="primary" onClick={() => state.onOk?.()}>{state.okText || "확인"}</Button>
            </div>
          </DialogCard>
        </Backdrop>
      )}
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const ctx = React.useContext(DialogContext);
  if (!ctx) throw new Error("useDialog must be used within DialogProvider");
  return ctx;
}


