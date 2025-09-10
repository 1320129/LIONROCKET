import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  :root {
    --bg: #ffffff;
    --text: #111111;
    --muted: #666666;
    --border: #e5e7eb;
    --card: #ffffff;
  }

  .theme-dark {
    --bg: #0b0b0d;
    --text: #f5f5f5;
    --muted: #9ca3af;
    --border: #1f2937;
    --card: #111214;
  }

  .theme-light {
    --bg: #ffffff;
    --text: #111111;
    --muted: #666666;
    --border: #e5e7eb;
    --card: #ffffff;
  }

  *, *::before, *::after { 
    box-sizing: border-box; 
  }

  html, body, #root {
    height: 100%;
  }

  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
  }

  .theme-light body {
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  }

  .theme-dark body {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  }

  a {
    color: #3b82f6;
    text-decoration: none;
  }

  .theme-dark a {
    color: #60a5fa;
  }

  /* Form controls adapt to theme */
  input, textarea, select, button {
    background: var(--card);
    color: var(--text);
    border: 1px solid var(--border);
  }

  input::placeholder, textarea::placeholder {
    color: var(--muted);
  }
`;
