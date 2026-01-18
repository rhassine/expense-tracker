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
  // HeroUI Input ne transmet pas directement la ref a l'input natif
  // On utilise une ref sur le wrapper et querySelector pour acceder a l'input
  const inputWrapperRef = useRef<HTMLDivElement>(null);

  /**
   * Recupere l'element input natif depuis le wrapper
   */
  const getNativeInput = useCallback((): HTMLInputElement | null => {
    return inputWrapperRef.current?.querySelector('input') ?? null;
  }, []);

  /**
   * Focus sur le champ de saisie
   */
  const focusInput = useCallback(() => {
    // Utilise requestAnimationFrame pour s'assurer que le DOM est mis a jour
    requestAnimationFrame(() => {
      const input = getNativeInput();
      input?.focus();
    });
  }, [getNativeInput]);

  // Focus input on mount
  useEffect(() => {
    focusInput();
  }, [focusInput]);

  // Track previous loading state to detect when loading finishes
  const wasLoadingRef = useRef(isLoading);

  // Focus input when loading finishes (assistant has responded)
  useEffect(() => {
    if (wasLoadingRef.current && !isLoading) {
      // Loading just finished, focus the input
      focusInput();
    }
    wasLoadingRef.current = isLoading;
  }, [isLoading, focusInput]);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (trimmed && !isLoading) {
      onSend(trimmed);
      setValue('');
      // Restaure le focus apres l'envoi du message
      focusInput();
    }
  }, [value, isLoading, onSend, focusInput]);

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
      <div className="flex-1 relative" ref={inputWrapperRef}>
        <Input
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
