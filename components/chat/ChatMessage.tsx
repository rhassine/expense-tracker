'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { User, Bot, Loader2 } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '@/types/chat';

interface ChatMessageProps {
  message: ChatMessageType;
}

/**
 * Single chat message bubble
 */
export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isLoading = message.isLoading;

  return (
    <div
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      role="listitem"
    >
      {/* Avatar */}
      <div
        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-primary text-primary-foreground' : 'bg-default-200'
        }`}
        aria-hidden="true"
      >
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      {/* Message Content */}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-sm'
            : 'bg-default-100 text-foreground rounded-bl-sm'
        }`}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-sm">Réflexion...</span>
          </div>
        ) : (
          <>
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </p>
            <p
              className={`text-xs mt-1 ${
                isUser ? 'text-primary-foreground/70' : 'text-default-400'
              }`}
            >
              {format(new Date(message.timestamp), 'HH:mm', { locale: fr })}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
