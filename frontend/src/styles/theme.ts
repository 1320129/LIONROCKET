import { DefaultTheme } from "styled-components";

export const theme: DefaultTheme = {
  colors: {
    bg: "var(--bg)",
    text: "var(--text)",
    muted: "var(--muted)",
    border: "var(--border)",
    card: "var(--card)",
    primary: "#3b82f6",
    primaryHover: "#2563eb",
    danger: "#ef4444",
    dangerHover: "#dc2626",
    success: "#10b981",
  },
  radius: {
    sm: "6px",
    md: "8px",
    lg: "12px",
  },
  shadow: "0 1px 2px rgba(0,0,0,0.06)",
};

// Minimal declaration merge for theme typing
declare module "styled-components" {
  export interface DefaultTheme {
    colors: {
      bg: string;
      text: string;
      muted: string;
      border: string;
      card: string;
      primary: string;
      primaryHover: string;
      danger: string;
      dangerHover: string;
      success: string;
    };
    radius: {
      sm: string;
      md: string;
      lg: string;
    };
    shadow: string;
  }
}
