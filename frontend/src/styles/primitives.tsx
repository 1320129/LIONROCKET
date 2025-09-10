import styled, { css, keyframes } from "styled-components";

export const Container = styled.div`
  margin: 0 auto;
  padding: 16px;
  max-width: 1024px;
`;

export const Row = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

export const Card = styled.div`
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: ${({ theme }) => theme.shadow};
`;

export const Button = styled.button<{
  variant?: "primary" | "danger" | "ghost" | "secondary" | "tab";
  size?: "sm" | "md" | "lg";
}>`
  appearance: none;
  padding: ${({ size }) => {
    switch (size) {
      case "sm":
        return "6px 12px";
      case "lg":
        return "12px 24px";
      default:
        return "10px 16px";
    }
  }};
  border-radius: ${({ theme }) => theme.radius.sm};
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--text);
  cursor: pointer;
  font-weight: 500;
  font-size: ${({ size }) => {
    switch (size) {
      case "sm":
        return "12px";
      case "lg":
        return "16px";
      default:
        return "14px";
    }
  }};
  transition: all 0.2s ease;

  ${({ variant, theme }) =>
    variant === "primary" &&
    css`
      background: ${theme.colors.primary};
      border-color: ${theme.colors.primary};
      color: white;
      box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
      &:hover {
        background: ${theme.colors.primaryHover};
        border-color: ${theme.colors.primaryHover};
        box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
        transform: translateY(-1px);
      }
      &:active {
        transform: translateY(0);
      }
    `}

  ${({ variant, theme }) =>
    variant === "secondary" &&
    css`
      background: var(--card);
      border-color: var(--border);
      color: var(--text);
      &:hover {
        background: var(--bg);
        border-color: ${theme.colors.primary};
      }
    `}
    
  ${({ variant, theme }) =>
    variant === "tab" &&
    css`
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      color: var(--muted);
      padding: 12px 16px;
      border-radius: 0;
      &:hover {
        color: var(--text);
        background: var(--bg);
      }
      &.active {
        color: ${theme.colors.primary};
        border-bottom-color: ${theme.colors.primary};
        background: var(--bg);
      }
    `}
    
  ${({ variant, theme }) =>
    variant === "danger" &&
    css`
      background: ${theme.colors.danger};
      border-color: ${theme.colors.danger};
      color: white;
      &:hover {
        background: ${theme.colors.dangerHover};
        border-color: ${theme.colors.dangerHover};
      }
    `}
    
  ${({ variant }) =>
    variant === "ghost" &&
    css`
      background: transparent;
      &:hover {
        background: var(--bg);
      }
    `}
    
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }
`;

export const Input = styled.input`
  padding: 12px 16px;
  border-radius: ${({ theme }) => theme.radius.sm};
  border: 2px solid var(--border);
  background: var(--card);
  color: var(--text);
  font-size: 14px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: var(--muted);
  }
`;

export const Textarea = styled.textarea`
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radius.sm};
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--text);
  min-height: 100px;
  resize: vertical;
`;

export const Header = styled(Row)`
  justify-content: space-between;
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;
export const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid var(--border);
  border-top-color: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

export const EmptyState = styled.div`
  text-align: center;
  color: var(--muted);
  padding: 24px;
`;

export const Grid = styled.div<{ columns?: number }>`
  display: grid;
  grid-template-columns: repeat(
    ${({ columns }) => columns || 2},
    minmax(0, 1fr)
  );
  gap: 16px;
  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

export const SectionTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 16px;
`;

export const PageHeader = styled(Row)`
  justify-content: space-between;
  padding: 8px 0 12px;
`;
