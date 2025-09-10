import styled from "styled-components";

export const LoadingContainer = styled.div`
  padding: 24px;
`;

export const ErrorContainer = styled.div`
  padding: 24px;
  color: ${({ theme }) => theme.colors.error};
`;

export const PageContainer = styled.div`
  padding: 24px;
`;

export const Title = styled.h2`
  margin-bottom: 8px;
`;

export const MutedText = styled.span`
  color: var(--muted);
`;

export const MessageListCard = styled.div`
  padding: 12px;
  min-height: 300px;
  max-height: 480px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border);
  border-radius: 8px;
  background-color: var(--card);
  color: var(--text);
`;

export const GridWithMargin = styled.div`
  margin-top: 24px;
`;

export const ChatHeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const Subtitle = styled.div`
  margin-bottom: 12px;
`;

export const FormContainer = styled.form`
  display: grid;
  gap: 8px;
  max-width: 520px;
`;

export const GridContainer = styled.div`
  display: grid;
  gap: 12px;
`;

export const EmptyCharacterList = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--muted);
`;

export const FlexContainer = styled.div<{
  gap?: number;
  alignItems?: string;
  justifyContent?: string;
}>`
  display: flex;
  gap: ${({ gap = 8 }) => gap}px;
  align-items: ${({ alignItems = "center" }) => alignItems};
  justify-content: ${({ justifyContent = "flex-start" }) => justifyContent};
`;

export const CharacterCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
`;

export const CharacterInfo = styled.div`
  flex: 1;
`;

export const CharacterName = styled.div`
  font-weight: 600;
`;

export const CharacterMeta = styled.div`
  font-size: 12px;
`;

export const ImagePreview = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const PreviewImage = styled.img`
  object-fit: cover;
  border-radius: 8px;
`;

export const ThumbnailImage = styled.img`
  object-fit: cover;
  border-radius: 8px;
`;

export const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.error};
`;

export const DialogTitle = styled.div`
  font-weight: 600;
  margin-bottom: 8px;
`;

export const DialogMessage = styled.div`
  margin-bottom: 16px;
`;

export const DialogActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

export const MessageContainer = styled.div`
  margin-bottom: 8px;
`;

export const MessageMeta = styled.div`
  font-size: 12px;
  color: var(--muted);
`;

export const ChatContainer = styled.div`
  padding: 24px;
  display: grid;
  gap: 12px;
`;

export const ChatHeader = styled.div`
  font-weight: 600;
`;

export const ChatForm = styled.form`
  display: flex;
  gap: 8px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background-color: var(--card);
  color: var(--text);
`;

export const ChatInput = styled.input`
  flex: 1;
`;

export const LoginContainer = styled.div`
  max-width: 400px;
  margin: 60px auto;
  padding: 32px;
  background: var(--card);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border);
`;

export const LoginTitle = styled.h1`
  text-align: center;
  margin: 0 0 32px 0;
  font-size: 28px;
  font-weight: 700;
  color: var(--text);
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

export const LoginForm = styled.form`
  display: grid;
  gap: 20px;
`;

export const LoginActions = styled.div`
  display: flex;
  background: var(--bg);
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 24px;
  border: 1px solid var(--border);
`;

export const TabButton = styled.button<{ active?: boolean }>`
  flex: 1;
  padding: 12px 16px;
  border: none;
  background: ${({ active }) => (active ? "var(--card)" : "transparent")};
  color: ${({ active, theme }) =>
    active ? theme.colors.primary : "var(--muted)"};
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${({ active }) =>
    active ? "0 2px 4px rgba(0, 0, 0, 0.1)" : "none"};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export const LoginFormGrid = styled.div`
  display: grid;
  gap: 16px;
`;

export const SubmitButton = styled.button`
  width: 100%;
  padding: 14px 24px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

export const MessageListContainer = styled.div`
  margin-bottom: 8px;
`;

export const LoadMoreButton = styled.div`
  margin-bottom: 8px;
`;

export const RetryButton = styled.button`
  margin-left: 8px;
`;

export const AppTitle = styled.div`
  font-weight: 700;
`;

export const AuthLoading = styled.div`
  padding: 24px;
`;

// Dialog 관련 스타일
export const DialogBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const DialogCard = styled.div`
  width: min(92vw, 420px);
  padding: 16px;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;
