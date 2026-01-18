'use client';

import { useMemo } from 'react';
import { parseISO, compareDesc } from 'date-fns';
import { Button } from '@heroui/react';
import { Plus } from 'lucide-react';
import ExpenseCard from './ExpenseCard';
import type { Expense, Category } from '@/types';

interface ExpenseListProps {
  expenses: Expense[];
  categories: Category[];
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
  onAddExpense?: () => void;
}

interface EmptyStateProps {
  onAddExpense?: () => void;
}

/**
 * EmptyState component displayed when there are no expenses.
 */
function EmptyState({ onAddExpense }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-default-200 bg-default-50 px-6 py-12 text-center"
      role="status"
      aria-label="No expenses to display"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-default-100">
        <svg
          className="h-8 w-8 text-default-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      </div>
      <h3 className="mb-2 text-lg font-medium text-foreground">
        No expenses yet
      </h3>
      <p className="max-w-sm text-sm text-default-500 mb-4">
        Start tracking your spending by adding your first expense. Your expenses
        will appear here once you add them.
      </p>
      {onAddExpense && (
        <Button
          color="primary"
          startContent={<Plus className="h-4 w-4" aria-hidden="true" />}
          onPress={onAddExpense}
        >
          Add your first expense
        </Button>
      )}
    </div>
  );
}

/**
 * ExpenseList renders a sorted list of expense cards.
 * Expenses are sorted by date in descending order (newest first).
 * Shows an empty state when no expenses are available.
 */
export default function ExpenseList({
  expenses,
  categories,
  onEdit,
  onDelete,
  onAddExpense,
}: ExpenseListProps) {
  // Create a map for O(1) category lookups
  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((category) => {
      map.set(category.id, category);
    });
    return map;
  }, [categories]);

  // Sort expenses by date (newest first)
  const sortedExpenses = useMemo(() => {
    return [...expenses].sort((a, b) => {
      try {
        const dateA = parseISO(a.date);
        const dateB = parseISO(b.date);
        return compareDesc(dateA, dateB);
      } catch {
        // Fallback to string comparison if date parsing fails
        return b.date.localeCompare(a.date);
      }
    });
  }, [expenses]);

  // Show empty state if no expenses
  if (sortedExpenses.length === 0) {
    return <EmptyState onAddExpense={onAddExpense} />;
  }

  return (
    <section aria-label="Expense list">
      <ul className="flex flex-col gap-3" role="list">
        {sortedExpenses.map((expense) => (
          <li key={expense.id}>
            <ExpenseCard
              expense={expense}
              category={categoryMap.get(expense.categoryId)}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </li>
        ))}
      </ul>
      <p className="mt-4 text-center text-sm text-default-400" aria-live="polite">
        Showing {sortedExpenses.length}{' '}
        {sortedExpenses.length === 1 ? 'expense' : 'expenses'}
      </p>
    </section>
  );
}
