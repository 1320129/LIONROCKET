import { useContext } from "react";
import { DialogContext } from "../types/dialog";

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("useDialog must be used within DialogProvider");
  return ctx;
}
