import { useState, useMemo } from "react";
import { Button } from "../styles/primitives";
import { DialogTitle, DialogMessage, DialogActions, DialogBackdrop, DialogCard } from "../styles/styled";
import { DialogAPI, DialogContext } from "../types/dialog";

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

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DialogState>({ open: false });

  const close = () => setState({ open: false });

  const api = useMemo<DialogAPI>(
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
        <DialogBackdrop
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
        </DialogBackdrop>
      )}
    </DialogContext.Provider>
  );
}
