import type { Expense } from '@/types';

/**
 * Budget status thresholds
 */
const BUDGET_THRESHOLDS = {
  WARNING: 75,
  DANGER: 90,
} as const;

/**
 * Budget status types indicating spending severity
 */
export type BudgetStatusType = 'safe' | 'warning' | 'danger';

/**
 * Budget status result containing percentage and status level
 */
export interface BudgetStatusResult {
  percentage: number;
  status: BudgetStatusType;
}

/**
 * Get the start date for a given period
 * @param period - Budget period (monthly or weekly)
 * @returns ISO date string for the period start
 */
function getPeriodStartDate(period: 'monthly' | 'weekly'): string {
  const now = new Date();

  if (period === 'weekly') {
    // Get start of current week (Sunday)
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek.toISOString().split('T')[0];
  }

  // Monthly - start of current month
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return startOfMonth.toISOString().split('T')[0];
}

/**
 * Calculate total spending for a given period and optional category
 * @param expenses - Array of all expenses
 * @param categoryId - Category ID to filter by, or null for all categories
 * @param period - Budget period (monthly or weekly)
 * @returns Total spending amount for the period
 */
export function getSpendingForPeriod(
  expenses: Expense[],
  categoryId: string | null,
  period: 'monthly' | 'weekly'
): number {
  const periodStart = getPeriodStartDate(period);

  return expenses
    .filter((expense) => {
      // Filter by date - expense must be within the current period
      if (expense.date < periodStart) {
        return false;
      }

      // Filter by category if specified
      if (categoryId !== null && expense.categoryId !== categoryId) {
        return false;
      }

      return true;
    })
    .reduce((total, expense) => total + expense.amount, 0);
}

/**
 * Calculate budget status based on spending vs budget amount
 * @param spent - Amount spent
 * @param budget - Budget limit amount
 * @returns Object containing percentage and status level
 */
export function getBudgetStatus(
  spent: number,
  budget: number
): BudgetStatusResult {
  if (budget <= 0) {
    return { percentage: 0, status: 'safe' };
  }

  const percentage = Math.min((spent / budget) * 100, 100);

  let status: BudgetStatusType;
  if (percentage >= BUDGET_THRESHOLDS.DANGER) {
    status = 'danger';
  } else if (percentage >= BUDGET_THRESHOLDS.WARNING) {
    status = 'warning';
  } else {
    status = 'safe';
  }

  return { percentage, status };
}

/**
 * Get the display name for a period
 * @param period - Budget period
 * @returns Human-readable period name
 */
export function getPeriodDisplayName(period: 'monthly' | 'weekly'): string {
  return period === 'monthly' ? 'This Month' : 'This Week';
}

/**
 * Format percentage for display
 * @param percentage - Percentage value
 * @returns Formatted percentage string
 */
export function formatPercentage(percentage: number): string {
  return `${Math.round(percentage)}%`;
}
