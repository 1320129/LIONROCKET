import { useContext } from "react";
import { DialogContext } from "./DialogContext";

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("useDialog must be used within DialogProvider");
  return ctx;
}
