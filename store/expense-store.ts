import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Expense } from '@/types';
import { getCurrentTimestamp } from '@/lib/utils';

/**
 * Input data for creating a new expense (without auto-generated fields)
 */
export interface CreateExpenseInput {
  amount: number;
  description: string;
  categoryId: string;
  date: string;
  tags?: string[];
}

/**
 * Input data for updating an existing expense
 */
export interface UpdateExpenseInput {
  amount?: number;
  description?: string;
  categoryId?: string;
  date?: string;
  tags?: string[];
}

/**
 * Expense store state shape
 */
interface ExpenseState {
  expenses: Expense[];
}

/**
 * Expense store actions
 */
interface ExpenseActions {
  addExpense: (input: CreateExpenseInput) => Expense;
  updateExpense: (id: string, input: UpdateExpenseInput) => Expense | null;
  deleteExpense: (id: string) => boolean;
  getExpenseById: (id: string) => Expense | undefined;
}

/**
 * Combined store type
 */
type ExpenseStore = ExpenseState & ExpenseActions;

/**
 * Zustand store for expense management with localStorage persistence
 */
export const useExpenseStore = create<ExpenseStore>()(
  persist(
    (set, get) => ({
      expenses: [],

      /**
       * Add a new expense to the store
       * @param input - Expense data without auto-generated fields
       * @returns The created expense with all fields populated
       */
      addExpense: (input: CreateExpenseInput): Expense => {
        const timestamp = getCurrentTimestamp();
        const newExpense: Expense = {
          id: crypto.randomUUID(),
          amount: input.amount,
          description: input.description,
          categoryId: input.categoryId,
          date: input.date,
          tags: input.tags,
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        set((state) => ({
          expenses: [newExpense, ...state.expenses],
        }));

        return newExpense;
      },

      /**
       * Update an existing expense
       * @param id - The expense ID to update
       * @param input - Partial expense data to update
       * @returns The updated expense or null if not found
       */
      updateExpense: (id: string, input: UpdateExpenseInput): Expense | null => {
        const { expenses } = get();
        const existingIndex = expenses.findIndex((e) => e.id === id);

        if (existingIndex === -1) {
          return null;
        }

        const existingExpense = expenses[existingIndex];
        const updatedExpense: Expense = {
          ...existingExpense,
          ...input,
          updatedAt: getCurrentTimestamp(),
        };

        set((state) => ({
          expenses: state.expenses.map((e) =>
            e.id === id ? updatedExpense : e
          ),
        }));

        return updatedExpense;
      },

      /**
       * Delete an expense from the store
       * @param id - The expense ID to delete
       * @returns True if deleted, false if not found
       */
      deleteExpense: (id: string): boolean => {
        const { expenses } = get();
        const exists = expenses.some((e) => e.id === id);

        if (!exists) {
          return false;
        }

        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        }));

        return true;
      },

      /**
       * Get a single expense by ID
       * @param id - The expense ID to find
       * @returns The expense or undefined if not found
       */
      getExpenseById: (id: string): Expense | undefined => {
        return get().expenses.find((e) => e.id === id);
      },
    }),
    {
      name: 'expense-tracker-storage',
      version: 1,
    }
  )
);
