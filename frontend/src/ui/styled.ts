import styled from "styled-components";

// 공통 스타일드 컴포넌트들
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

// 인라인 스타일 대체용 컴포넌트들
export const MessageListCard = styled.div`
  padding: 12px;
  min-height: 300px;
  max-height: 480px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

export const GridWithMargin = styled.div`
  margin-top: 24px;
`;

export const LoginFormGrid = styled.div`
  display: grid;
  gap: 8px;
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
  color: #888;
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
`;

export const ChatInput = styled.input`
  flex: 1;
`;

export const LoginContainer = styled.div`
  max-width: 360px;
  margin: 80px auto;
  padding: 16px;
`;

export const LoginForm = styled.form`
  display: grid;
  gap: 8px;
`;

export const LoginActions = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
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
