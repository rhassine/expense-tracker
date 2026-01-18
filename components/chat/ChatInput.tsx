'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Input, Button } from '@heroui/react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

const MAX_LENGTH = 500;

/**
 * Chat input field with send button
 */
export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (trimmed && !isLoading) {
      onSend(trimmed);
      setValue('');
    }
  }, [value, isLoading, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const remaining = MAX_LENGTH - value.length;
  const isOverLimit = remaining < 0;

  return (
    <div className="flex gap-2 items-end">
      <div className="flex-1 relative">
        <Input
          ref={inputRef}
          value={value}
          onValueChange={setValue}
          onKeyDown={handleKeyDown}
          placeholder="Posez une question sur vos dépenses..."
          isDisabled={isLoading}
          maxLength={MAX_LENGTH + 50} // Allow slight overage for feedback
          classNames={{
            input: 'text-sm',
            inputWrapper: 'pr-12',
          }}
          aria-label="Message"
        />
        {value.length > MAX_LENGTH - 50 && (
          <span
            className={`absolute right-3 bottom-2 text-xs ${
              isOverLimit ? 'text-danger' : 'text-default-400'
            }`}
          >
            {remaining}
          </span>
        )}
      </div>
      <Button
        isIconOnly
        color="primary"
        onPress={handleSend}
        isDisabled={!value.trim() || isLoading || isOverLimit}
        aria-label="Envoyer"
      >
        <Send size={18} />
      </Button>
    </div>
  );
}
