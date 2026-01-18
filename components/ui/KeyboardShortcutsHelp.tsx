'use client';

import { Button, Popover, PopoverTrigger, PopoverContent } from '@heroui/react';
import { Keyboard } from 'lucide-react';

/**
 * Represents a single keyboard shortcut entry
 */
interface ShortcutEntry {
  /** Key combination(s) to display */
  keys: string[];
  /** Description of what the shortcut does */
  description: string;
}

/**
 * List of available keyboard shortcuts in the application
 */
const SHORTCUTS: ShortcutEntry[] = [
  {
    keys: ['N', 'Ctrl+N'],
    description: 'Add new expense',
  },
  {
    keys: ['Esc'],
    description: 'Close modal/form',
  },
  {
    keys: ['/', 'Ctrl+K'],
    description: 'Focus search',
  },
];

/**
 * Renders a styled keyboard key
 */
function KeyBadge({ keyText }: { keyText: string }) {
  return (
    <kbd
      className="inline-flex min-w-[1.5rem] items-center justify-center rounded border border-default-300 bg-default-100 px-1.5 py-0.5 font-mono text-xs text-default-700"
      aria-label={keyText}
    >
      {keyText}
    </kbd>
  );
}

/**
 * Renders a row showing keyboard shortcuts and their description
 */
function ShortcutRow({ shortcut }: { shortcut: ShortcutEntry }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <span className="text-sm text-default-600">{shortcut.description}</span>
      <div className="flex items-center gap-1">
        {shortcut.keys.map((key, index) => (
          <span key={key} className="flex items-center gap-1">
            {index > 0 && <span className="text-xs text-default-400">or</span>}
            <KeyBadge keyText={key} />
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * KeyboardShortcutsHelp displays a floating help button that shows
 * available keyboard shortcuts when clicked.
 *
 * The component is positioned fixed in the bottom-right corner of the viewport.
 * It uses HeroUI's Popover component for the shortcuts panel.
 *
 * @example
 * ```tsx
 * // Add to your layout or page
 * <KeyboardShortcutsHelp />
 * ```
 */
export function KeyboardShortcutsHelp() {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Popover placement="top-end" showArrow>
        <PopoverTrigger>
          <Button
            isIconOnly
            variant="flat"
            aria-label="Show keyboard shortcuts"
            className="bg-default-100 shadow-md"
            size="sm"
          >
            <Keyboard size={18} aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72">
          <div className="px-1 py-2">
            <div className="mb-2 flex items-center gap-2">
              <Keyboard size={16} className="text-default-500" aria-hidden="true" />
              <h3 className="text-sm font-semibold">Keyboard Shortcuts</h3>
            </div>
            <div className="divide-y divide-default-200">
              {SHORTCUTS.map((shortcut) => (
                <ShortcutRow key={shortcut.description} shortcut={shortcut} />
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default KeyboardShortcutsHelp;
