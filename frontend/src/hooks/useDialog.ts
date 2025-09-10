import { useContext } from "react";
import { DialogAPI, DialogContext } from "./DialogContext";

export function useDialog() {
  const ctx = React.useContext(DialogContext);
  if (!ctx) throw new Error("useDialog must be used within DialogProvider");
  return ctx;
}
