import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Tag } from '@/types';

/**
 * Predefined tag colors for user selection
 */
export const TAG_COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Violet
  '#ec4899', // Pink
] as const;

/**
 * Tag store state shape
 */
interface TagState {
  tags: Tag[];
}

/**
 * Tag store actions
 */
interface TagActions {
  addTag: (name: string, color: string) => Tag;
  deleteTag: (id: string) => void;
  getTagById: (id: string) => Tag | undefined;
}

/**
 * Combined store type
 */
type TagStore = TagState & TagActions;

/**
 * Zustand store for tag management with localStorage persistence
 */
export const useTagStore = create<TagStore>()(
  persist(
    (set, get) => ({
      tags: [],

      /**
       * Add a new tag to the store
       * @param name - Tag display name
       * @param color - Hex color code
       * @returns The created tag
       */
      addTag: (name: string, color: string): Tag => {
        const newTag: Tag = {
          id: crypto.randomUUID(),
          name: name.trim(),
          color,
        };

        set((state) => ({
          tags: [...state.tags, newTag],
        }));

        return newTag;
      },

      /**
       * Delete a tag from the store
       * @param id - The tag ID to delete
       */
      deleteTag: (id: string): void => {
        set((state) => ({
          tags: state.tags.filter((tag) => tag.id !== id),
        }));
      },

      /**
       * Get a single tag by ID
       * @param id - The tag ID to find
       * @returns The tag or undefined if not found
       */
      getTagById: (id: string): Tag | undefined => {
        return get().tags.find((tag) => tag.id === id);
      },
    }),
    {
      name: 'expense-tracker-tags',
      version: 1,
    }
  )
);
