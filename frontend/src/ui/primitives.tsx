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
  variant?: "primary" | "danger" | "ghost";
}>`
  appearance: none;
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radius.sm};
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--text);
  cursor: pointer;
  ${({ variant, theme }) =>
    variant === "primary" &&
    css`
      background: ${theme.colors.primary};
      border-color: ${theme.colors.primary};
      color: white;
      &:hover {
        background: ${theme.colors.primaryHover};
        border-color: ${theme.colors.primaryHover};
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
    `}
  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;

export const Input = styled.input`
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radius.sm};
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--text);
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
