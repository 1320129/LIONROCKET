import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { Button, Card } from "./primitives";
import { DialogContext } from "./useDialog";
import { DialogTitle, DialogMessage, DialogActions } from "./styled";

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

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DialogState>({ open: false });

  function close() {
    setState({ open: false });
  }

  const api = useMemo<DialogContextValue>(
    () => ({
      alert(msg, title) {
        return new Promise<void>((resolve) => {
          setState({
            open: true,
            title,
            message: msg,
            okText: "확인",
            showCancel: false,
            onOk: () => {
              resolve();
              close();
            },
          });
        });
      },
      confirm(msg, title, okText = "확인", cancelText = "취소") {
        return new Promise<boolean>((resolve) => {
          setState({
            open: true,
            title,
            message: msg,
            okText,
            cancelText,
            showCancel: true,
            onOk: () => {
              resolve(true);
              close();
            },
            onCancel: () => {
              resolve(false);
              close();
            },
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
        <Backdrop
          onClick={() =>
            state.showCancel ? state.onCancel?.() : state.onOk?.()
          }
        >
          <DialogCard onClick={(e) => e.stopPropagation()}>
            {state.title && <DialogTitle>{state.title}</DialogTitle>}
            <DialogMessage>{state.message}</DialogMessage>
            <DialogActions>
              {state.showCancel && (
                <Button onClick={() => state.onCancel?.()}>
                  {state.cancelText || "취소"}
                </Button>
              )}
              <Button variant="primary" onClick={() => state.onOk?.()}>
                {state.okText || "확인"}
              </Button>
            </DialogActions>
          </DialogCard>
        </Backdrop>
      )}
    </DialogContext.Provider>
  );
}
