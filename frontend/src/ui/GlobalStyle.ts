import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--text); }
  a { color: #3b82f6; text-decoration: none; }
  .theme-dark a { color: #60a5fa; }
`;
