'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_CATEGORIES } from '@/lib/constants';
import type { Category } from '@/types';

/**
 * Category store state shape
 */
interface CategoryState {
  customCategories: Category[];
}

/**
 * Category store actions
 */
interface CategoryActions {
  addCategory: (category: Omit<Category, 'id'>) => Category;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  getAllCategories: () => Category[];
}

/**
 * Combined category store type
 */
type CategoryStore = CategoryState & CategoryActions;

/**
 * Generate a unique ID for custom categories
 */
function generateCategoryId(): string {
  return `custom-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Zustand store for managing custom categories with localStorage persistence
 */
export const useCategoryStore = create<CategoryStore>()(
  persist(
    (set, get) => ({
      customCategories: [],

      /**
       * Add a new custom category
       * @param category - Category data without ID
       * @returns The newly created category with generated ID
       */
      addCategory: (category: Omit<Category, 'id'>): Category => {
        const newCategory: Category = {
          ...category,
          id: generateCategoryId(),
        };

        set((state) => ({
          customCategories: [...state.customCategories, newCategory],
        }));

        return newCategory;
      },

      /**
       * Update an existing custom category
       * @param id - Category ID to update
       * @param updates - Partial category data to merge
       */
      updateCategory: (id: string, updates: Partial<Category>): void => {
        // Only allow updating custom categories (those with 'custom-' prefix)
        if (!id.startsWith('custom-')) {
          console.warn('Cannot update default categories');
          return;
        }

        set((state) => ({
          customCategories: state.customCategories.map((cat) =>
            cat.id === id ? { ...cat, ...updates, id } : cat
          ),
        }));
      },

      /**
       * Delete a custom category
       * @param id - Category ID to delete
       */
      deleteCategory: (id: string): void => {
        // Only allow deleting custom categories
        if (!id.startsWith('custom-')) {
          console.warn('Cannot delete default categories');
          return;
        }

        set((state) => ({
          customCategories: state.customCategories.filter((cat) => cat.id !== id),
        }));
      },

      /**
       * Get all categories (default + custom)
       * @returns Combined array of default and custom categories
       */
      getAllCategories: (): Category[] => {
        const { customCategories } = get();
        return [...DEFAULT_CATEGORIES, ...customCategories];
      },
    }),
    {
      name: 'expense-tracker-categories',
      version: 1,
    }
  )
);
