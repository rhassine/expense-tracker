import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Represents a budget configuration for a category or total spending
 */
export interface Budget {
  id: string;
  categoryId: string | null; // null for total budget
  amount: number;
  period: 'monthly' | 'weekly';
}

/**
 * Budget store state shape
 */
interface BudgetState {
  budgets: Budget[];
}

/**
 * Budget store actions
 */
interface BudgetActions {
  setBudget: (
    categoryId: string | null,
    amount: number,
    period: 'monthly' | 'weekly'
  ) => void;
  removeBudget: (categoryId: string | null) => void;
  getBudget: (categoryId: string | null) => Budget | undefined;
}

/**
 * Combined budget store type
 */
type BudgetStore = BudgetState & BudgetActions;

/**
 * Zustand store for budget management with localStorage persistence
 */
export const useBudgetStore = create<BudgetStore>()(
  persist(
    (set, get) => ({
      budgets: [],

      /**
       * Set or update a budget for a category or total spending
       * @param categoryId - Category ID or null for total budget
       * @param amount - Budget amount limit
       * @param period - Budget period (monthly or weekly)
       */
      setBudget: (
        categoryId: string | null,
        amount: number,
        period: 'monthly' | 'weekly'
      ): void => {
        const { budgets } = get();
        const existingIndex = budgets.findIndex(
          (b) => b.categoryId === categoryId
        );

        if (existingIndex !== -1) {
          // Update existing budget
          set((state) => ({
            budgets: state.budgets.map((b, index) =>
              index === existingIndex ? { ...b, amount, period } : b
            ),
          }));
        } else {
          // Create new budget
          const newBudget: Budget = {
            id: crypto.randomUUID(),
            categoryId,
            amount,
            period,
          };
          set((state) => ({
            budgets: [...state.budgets, newBudget],
          }));
        }
      },

      /**
       * Remove a budget for a category or total spending
       * @param categoryId - Category ID or null for total budget
       */
      removeBudget: (categoryId: string | null): void => {
        set((state) => ({
          budgets: state.budgets.filter((b) => b.categoryId !== categoryId),
        }));
      },

      /**
       * Get a budget by category ID
       * @param categoryId - Category ID or null for total budget
       * @returns The budget or undefined if not found
       */
      getBudget: (categoryId: string | null): Budget | undefined => {
        return get().budgets.find((b) => b.categoryId === categoryId);
      },
    }),
    {
      name: 'expense-tracker-budgets',
      version: 1,
    }
  )
);
