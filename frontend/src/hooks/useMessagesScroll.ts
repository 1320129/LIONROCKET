import { useRef, useCallback } from "react";

export function useMessagesScroll() {
  const listRef = useRef<HTMLDivElement | null>(null);
  const stickToBottomRef = useRef(true);

  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    // track whether user is near bottom (within 24px)
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
    stickToBottomRef.current = nearBottom;
  }, []);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      const el = listRef.current;
      if (el && stickToBottomRef.current) el.scrollTop = el.scrollHeight;
    });
  }, []);

  const scrollToTop = useCallback(() => {
    requestAnimationFrame(() => {
      const el = listRef.current;
      if (el) el.scrollTop = 1; // nudge to avoid re-trigger at exact 0
    });
  }, []);

  const scrollToInitialBottom = useCallback(() => {
    requestAnimationFrame(() => {
      const el = listRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }, []);

  return {
    listRef,
    onScroll,
    scrollToBottom,
    scrollToTop,
    scrollToInitialBottom,
  };
}
