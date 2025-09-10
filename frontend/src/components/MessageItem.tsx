import {
  MessageContainer,
  MessageMeta,
  RetryButton,
  MutedText,
} from "../styles/styled";
import { formatMessageTime } from "../utils/chatUtils";
import { MessageWithStatus } from "../types/message";

type MessageItemProps = {
  message: MessageWithStatus;
  onRetry?: (messageId: number) => void;
};

export function MessageItem({ message, onRetry }: MessageItemProps) {
  const { role, content, created_at, status, error, id } = message;

  return (
    <MessageContainer>
      <MessageMeta>{formatMessageTime(created_at)}</MessageMeta>
      <div>
        <b>{role === "user" ? "나" : "AI"}</b>: {content}
        {role === "user" && status === "failed" && (
          <>
            {" "}
            <MutedText>({error || "실패"})</MutedText>{" "}
            {onRetry && (
              <RetryButton onClick={() => onRetry(id)}>재전송</RetryButton>
            )}
          </>
        )}
        {role === "user" && status === "pending" && (
          <MutedText> (전송 중)</MutedText>
        )}
      </div>
    </MessageContainer>
  );
}
