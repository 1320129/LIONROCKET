import { DefaultTheme } from "styled-components";

export const theme: DefaultTheme = {
  colors: {
    bg: "var(--bg)",
    text: "var(--text)",
    muted: "var(--muted)",
    border: "var(--border)",
    card: "var(--card)",
    background: "var(--card)",
    error: "#ef4444",
    primary: "#3b82f6",
    primaryHover: "#2563eb",
    danger: "#ef4444",
    dangerHover: "#dc2626",
    success: "#10b981",
    gradient: {
      primary: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
      secondary: "linear-gradient(135deg, #f3f4f6, #e5e7eb)",
    },
  },
  radius: {
    sm: "8px",
    md: "12px",
    lg: "16px",
  },
  shadow: {
    sm: "0 1px 2px rgba(0,0,0,0.06)",
    md: "0 4px 12px rgba(0,0,0,0.1)",
    lg: "0 8px 32px rgba(0,0,0,0.1)",
  },
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
      background: string;
      error: string;
      primary: string;
      primaryHover: string;
      danger: string;
      dangerHover: string;
      success: string;
      gradient: {
        primary: string;
        secondary: string;
      };
    };
    radius: {
      sm: string;
      md: string;
      lg: string;
    };
    shadow: {
      sm: string;
      md: string;
      lg: string;
    };
  }
}
