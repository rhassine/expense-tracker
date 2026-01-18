'use client';

import { Button } from '@heroui/react';
import { MessageCircle } from 'lucide-react';
import { useChatStore } from '@/store/chat-store';

/**
 * Floating button to toggle the chat panel
 */
export function ChatToggleButton() {
  const { isOpen, toggleChat, messages } = useChatStore();

  // Don't show button if chat is open
  if (isOpen) return null;

  // Count unread messages (simple: any messages exist)
  const hasMessages = messages.length > 0;

  return (
    <Button
      isIconOnly
      color="primary"
      size="lg"
      className="fixed bottom-4 right-4 z-50 shadow-lg hover:scale-105 transition-transform sm:bottom-6 sm:right-6"
      onPress={toggleChat}
      aria-label="Ouvrir le chat"
    >
      <MessageCircle size={24} />
      {hasMessages && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-danger rounded-full" />
      )}
    </Button>
  );
}
