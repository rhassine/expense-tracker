'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Input, Chip, Listbox, ListboxItem, Popover, PopoverTrigger, PopoverContent } from '@heroui/react';
import { Tag, X, Plus } from 'lucide-react';
import { useTagStore, TAG_COLORS } from '@/store/tag-store';
import type { Tag as TagType } from '@/types';

interface TagInputProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
}

/**
 * TagInput component for selecting existing tags or creating new ones.
 * Displays selected tags as removable chips with an autocomplete dropdown.
 */
export default function TagInput({ selectedTags, onChange }: TagInputProps) {
  const { tags, addTag, getTagById } = useTagStore();
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter tags based on input value and exclude already selected
  const filteredTags = useMemo(() => {
    const searchLower = inputValue.toLowerCase().trim();
    return tags.filter(
      (tag) =>
        !selectedTags.includes(tag.id) &&
        (searchLower === '' || tag.name.toLowerCase().includes(searchLower))
    );
  }, [tags, inputValue, selectedTags]);

  // Check if input matches an existing tag name exactly (case-insensitive)
  const exactMatch = useMemo(() => {
    const searchLower = inputValue.toLowerCase().trim();
    return tags.find((tag) => tag.name.toLowerCase() === searchLower);
  }, [tags, inputValue]);

  // Determine if we should show the "Create new tag" option
  const showCreateOption = useMemo(() => {
    const trimmed = inputValue.trim();
    return trimmed.length > 0 && !exactMatch;
  }, [inputValue, exactMatch]);

  // Get tag objects for selected tag IDs
  const selectedTagObjects = useMemo(() => {
    return selectedTags
      .map((id) => getTagById(id))
      .filter((tag): tag is TagType => tag !== undefined);
  }, [selectedTags, getTagById]);

  // Handle tag selection
  const handleSelectTag = useCallback(
    (tagId: string) => {
      if (!selectedTags.includes(tagId)) {
        onChange([...selectedTags, tagId]);
      }
      setInputValue('');
      setIsOpen(false);
    },
    [selectedTags, onChange]
  );

  // Handle tag removal
  const handleRemoveTag = useCallback(
    (tagId: string) => {
      onChange(selectedTags.filter((id) => id !== tagId));
    },
    [selectedTags, onChange]
  );

  // Handle creating a new tag
  const handleCreateTag = useCallback(() => {
    const trimmed = inputValue.trim();
    if (trimmed.length === 0) return;

    // Pick a random color from predefined colors
    const randomColor = TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
    const newTag = addTag(trimmed, randomColor);
    onChange([...selectedTags, newTag.id]);
    setInputValue('');
    setIsOpen(false);
  }, [inputValue, addTag, selectedTags, onChange]);

  // Handle input change
  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
    if (value.trim().length > 0) {
      setIsOpen(true);
    }
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter' && inputValue.trim()) {
        event.preventDefault();
        if (showCreateOption) {
          handleCreateTag();
        } else if (filteredTags.length > 0) {
          handleSelectTag(filteredTags[0].id);
        }
      } else if (event.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      } else if (event.key === 'Backspace' && inputValue === '' && selectedTags.length > 0) {
        // Remove the last tag when backspace is pressed on empty input
        handleRemoveTag(selectedTags[selectedTags.length - 1]);
      }
    },
    [inputValue, showCreateOption, filteredTags, selectedTags, handleCreateTag, handleSelectTag, handleRemoveTag]
  );

  // Handle focus
  const handleFocus = useCallback(() => {
    setIsOpen(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        // Small delay to allow click events to fire on dropdown items
        setTimeout(() => setIsOpen(false), 150);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine if dropdown should be visible
  const showDropdown = isOpen && (filteredTags.length > 0 || showCreateOption);

  return (
    <div className="flex flex-col gap-2">
      {/* Selected Tags Display */}
      {selectedTagObjects.length > 0 && (
        <div
          className="flex flex-wrap gap-2"
          role="list"
          aria-label="Selected tags"
        >
          {selectedTagObjects.map((tag) => (
            <Chip
              key={tag.id}
              variant="flat"
              size="sm"
              onClose={() => handleRemoveTag(tag.id)}
              style={{
                backgroundColor: `${tag.color}20`,
                color: tag.color,
              }}
              classNames={{
                closeButton: 'text-current hover:bg-current/20',
              }}
              aria-label={`Tag: ${tag.name}, press to remove`}
            >
              {tag.name}
            </Chip>
          ))}
        </div>
      )}

      {/* Tag Input with Dropdown */}
      <Popover
        isOpen={showDropdown}
        onOpenChange={setIsOpen}
        placement="bottom-start"
        triggerScaleOnOpen={false}
        classNames={{
          content: 'p-0 w-full min-w-[200px]',
        }}
      >
        <PopoverTrigger>
          <Input
            ref={inputRef}
            type="text"
            label="Tags"
            placeholder={selectedTags.length > 0 ? 'Add more tags...' : 'Add tags...'}
            value={inputValue}
            onValueChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            startContent={
              <Tag
                className="pointer-events-none shrink-0 text-default-400"
                size={18}
                aria-hidden="true"
              />
            }
            classNames={{
              inputWrapper: 'bg-default-100',
            }}
            aria-expanded={showDropdown}
            aria-haspopup="listbox"
            aria-describedby="tag-input-description"
          />
        </PopoverTrigger>
        <PopoverContent>
          <Listbox
            aria-label="Tag options"
            onAction={(key) => {
              if (key === 'create-new') {
                handleCreateTag();
              } else {
                handleSelectTag(key as string);
              }
            }}
            classNames={{
              base: 'p-1',
            }}
            items={[
              ...(showCreateOption ? [{ id: 'create-new', name: `Create "${inputValue.trim()}"`, color: '', isCreate: true }] : []),
              ...filteredTags.map((tag) => ({ ...tag, isCreate: false })),
            ]}
          >
            {(item) => (
              <ListboxItem
                key={item.id}
                textValue={item.name}
                startContent={
                  item.isCreate ? (
                    <Plus size={16} className="text-primary" aria-hidden="true" />
                  ) : (
                    <span
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                      aria-hidden="true"
                    />
                  )
                }
                className={item.isCreate ? 'text-primary' : ''}
              >
                {item.name}
              </ListboxItem>
            )}
          </Listbox>
        </PopoverContent>
      </Popover>
      <span id="tag-input-description" className="sr-only">
        Type to search existing tags or create a new one. Press Enter to select or create.
      </span>
    </div>
  );
}
