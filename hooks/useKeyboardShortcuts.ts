'use client';

import { useEffect, useCallback } from 'react';

/**
 * Configuration for keyboard shortcut callbacks
 */
export interface KeyboardShortcutCallbacks {
  /** Triggered when 'n' or 'Ctrl+N' is pressed - typically opens add form */
  onAddNew?: () => void;
  /** Triggered when 'Escape' is pressed - typically closes modals/forms */
  onEscape?: () => void;
  /** Triggered when '/' or 'Ctrl+K' is pressed - typically focuses search */
  onSearch?: () => void;
}

/**
 * Checks if the currently focused element is an input or editable field
 * where keyboard shortcuts should be disabled to allow normal typing
 */
function isInputElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();
  const isInput = tagName === 'input' || tagName === 'textarea' || tagName === 'select';
  const isEditable = target.isContentEditable;
  const hasEditableRole = target.getAttribute('role') === 'textbox';

  return isInput || isEditable || hasEditableRole;
}

/**
 * Hook to handle keyboard shortcuts for the application
 *
 * Supported shortcuts:
 * - `n` or `Ctrl+N`: Trigger add new action
 * - `Escape`: Close/cancel current action
 * - `/` or `Ctrl+K`: Focus search input
 *
 * Shortcuts are disabled when focus is on input elements to prevent
 * interference with normal typing.
 *
 * @example
 * ```tsx
 * useKeyboardShortcuts({
 *   onAddNew: () => setIsFormOpen(true),
 *   onEscape: () => setIsFormOpen(false),
 *   onSearch: () => searchInputRef.current?.focus(),
 * });
 * ```
 */
export function useKeyboardShortcuts({
  onAddNew,
  onEscape,
  onSearch,
}: KeyboardShortcutCallbacks): void {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const target = event.target;
      const key = event.key.toLowerCase();
      const isCtrlOrMeta = event.ctrlKey || event.metaKey;

      // Escape should always work, even in input fields
      if (key === 'escape' && onEscape) {
        onEscape();
        return;
      }

      // Skip other shortcuts when typing in input elements
      if (isInputElement(target)) {
        return;
      }

      // 'n' or Ctrl/Cmd+N: Add new
      if ((key === 'n' && !isCtrlOrMeta) || (key === 'n' && isCtrlOrMeta)) {
        event.preventDefault();
        onAddNew?.();
        return;
      }

      // '/' or Ctrl/Cmd+K: Focus search
      if (key === '/' || (key === 'k' && isCtrlOrMeta)) {
        event.preventDefault();
        onSearch?.();
        return;
      }
    },
    [onAddNew, onEscape, onSearch]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}

export default useKeyboardShortcuts;
