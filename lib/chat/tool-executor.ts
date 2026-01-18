import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfDay,
  endOfDay,
  parseISO,
  isWithinInterval,
} from 'date-fns';
import type { ChatContextData, ExpenseSummary, BudgetSummary } from '@/types/chat';
import type {
  GetSpendingSummaryInput,
  GetBudgetStatusInput,
  SearchExpensesInput,
  GetTopExpensesInput,
  GetCategoryBreakdownInput,
  CreateExpenseInput,
} from './tools';

/**
 * Get date range for a given period
 */
function getDateRange(
  period: string,
  today: Date
): { start: Date; end: Date } | null {
  switch (period) {
    case 'today':
      return { start: startOfDay(today), end: endOfDay(today) };
    case 'this_week':
      return {
        start: startOfWeek(today, { weekStartsOn: 1 }),
        end: endOfWeek(today, { weekStartsOn: 1 }),
      };
    case 'this_month':
      return { start: startOfMonth(today), end: endOfMonth(today) };
    case 'last_month':
      const lastMonth = subMonths(today, 1);
      return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
    case 'all_time':
      return null;
    default:
      return null;
  }
}

/**
 * Filter expenses by date range
 */
function filterByDateRange(
  expenses: ExpenseSummary[],
  range: { start: Date; end: Date } | null
): ExpenseSummary[] {
  if (!range) return expenses;

  return expenses.filter((e) => {
    const date = parseISO(e.date);
    return isWithinInterval(date, { start: range.start, end: range.end });
  });
}

/**
 * Execute get_spending_summary tool
 */
function executeGetSpendingSummary(
  input: GetSpendingSummaryInput,
  context: ChatContextData
): { result: unknown; isError: boolean } {
  const today = parseISO(context.today);
  const range = getDateRange(input.period, today);
  let expenses = filterByDateRange(context.expenses, range);

  if (input.categoryId) {
    expenses = expenses.filter((e) => e.categoryId === input.categoryId);
  }

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const count = expenses.length;
  const categoryName = input.categoryId
    ? context.categories.find((c) => c.id === input.categoryId)?.name
    : null;

  return {
    result: {
      period: input.period,
      category: categoryName || 'Toutes catégories',
      total: total.toFixed(2),
      currency: context.settings.currency,
      transactionCount: count,
    },
    isError: false,
  };
}

/**
 * Execute get_budget_status tool
 */
function executeGetBudgetStatus(
  input: GetBudgetStatusInput,
  context: ChatContextData
): { result: unknown; isError: boolean } {
  const budget = context.budgets.find(
    (b) => b.categoryId === (input.categoryId || null)
  );

  if (!budget) {
    const categoryName = input.categoryId
      ? context.categories.find((c) => c.id === input.categoryId)?.name
      : 'Total';
    return {
      result: {
        message: `Aucun budget configuré pour ${categoryName}`,
        hasBudget: false,
      },
      isError: false,
    };
  }

  const remaining = budget.amount - budget.spent;
  const daysInMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0
  ).getDate();
  const currentDay = new Date().getDate();
  const daysRemaining = daysInMonth - currentDay;

  return {
    result: {
      category: budget.categoryName || 'Total',
      budgetAmount: budget.amount,
      spent: budget.spent.toFixed(2),
      remaining: remaining.toFixed(2),
      percentage: budget.percentage,
      status: budget.status,
      period: budget.period,
      daysRemaining: budget.period === 'monthly' ? daysRemaining : undefined,
      currency: context.settings.currency,
      hasBudget: true,
    },
    isError: false,
  };
}

/**
 * Execute search_expenses tool
 */
function executeSearchExpenses(
  input: SearchExpensesInput,
  context: ChatContextData
): { result: unknown; isError: boolean } {
  let expenses = [...context.expenses];

  if (input.query) {
    const queryLower = input.query.toLowerCase();
    expenses = expenses.filter((e) =>
      e.description.toLowerCase().includes(queryLower)
    );
  }

  if (input.categoryId) {
    expenses = expenses.filter((e) => e.categoryId === input.categoryId);
  }

  if (input.minAmount !== undefined) {
    expenses = expenses.filter((e) => e.amount >= input.minAmount!);
  }

  if (input.maxAmount !== undefined) {
    expenses = expenses.filter((e) => e.amount <= input.maxAmount!);
  }

  const limit = input.limit || 10;
  expenses = expenses.slice(0, limit);

  return {
    result: {
      expenses: expenses.map((e) => ({
        date: e.date,
        description: e.description,
        amount: e.amount.toFixed(2),
        category: e.categoryName,
      })),
      count: expenses.length,
      currency: context.settings.currency,
    },
    isError: false,
  };
}

/**
 * Execute get_top_expenses tool
 */
function executeGetTopExpenses(
  input: GetTopExpensesInput,
  context: ChatContextData
): { result: unknown; isError: boolean } {
  const today = parseISO(context.today);
  const range = getDateRange(input.period, today);
  let expenses = filterByDateRange(context.expenses, range);

  // Sort by amount descending
  expenses = expenses.sort((a, b) => b.amount - a.amount);

  const limit = input.limit || 5;
  expenses = expenses.slice(0, limit);

  return {
    result: {
      period: input.period,
      expenses: expenses.map((e) => ({
        date: e.date,
        description: e.description,
        amount: e.amount.toFixed(2),
        category: e.categoryName,
      })),
      currency: context.settings.currency,
    },
    isError: false,
  };
}

/**
 * Execute get_category_breakdown tool
 */
function executeGetCategoryBreakdown(
  input: GetCategoryBreakdownInput,
  context: ChatContextData
): { result: unknown; isError: boolean } {
  const today = parseISO(context.today);
  const range = getDateRange(input.period, today);
  const expenses = filterByDateRange(context.expenses, range);

  const breakdown = new Map<string, { name: string; total: number; count: number }>();

  for (const expense of expenses) {
    const existing = breakdown.get(expense.categoryId);
    if (existing) {
      existing.total += expense.amount;
      existing.count++;
    } else {
      breakdown.set(expense.categoryId, {
        name: expense.categoryName,
        total: expense.amount,
        count: 1,
      });
    }
  }

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const categories = Array.from(breakdown.values())
    .map((b) => ({
      name: b.name,
      total: b.total.toFixed(2),
      count: b.count,
      percentage: total > 0 ? Math.round((b.total / total) * 100) : 0,
    }))
    .sort((a, b) => parseFloat(b.total) - parseFloat(a.total));

  return {
    result: {
      period: input.period,
      total: total.toFixed(2),
      categories,
      currency: context.settings.currency,
    },
    isError: false,
  };
}

/**
 * Execute create_expense tool - returns data to be created client-side
 */
function executeCreateExpense(
  input: CreateExpenseInput,
  context: ChatContextData
): { result: unknown; isError: boolean } {
  // Validate input
  if (input.amount <= 0) {
    return {
      result: { error: 'Le montant doit être positif' },
      isError: true,
    };
  }

  if (!input.description.trim()) {
    return {
      result: { error: 'La description est requise' },
      isError: true,
    };
  }

  const category = context.categories.find((c) => c.id === input.categoryId);
  if (!category) {
    return {
      result: { error: `Catégorie non trouvée: ${input.categoryId}` },
      isError: true,
    };
  }

  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(input.date)) {
    return {
      result: { error: 'Format de date invalide. Utilisez YYYY-MM-DD' },
      isError: true,
    };
  }

  // Return the expense data to be created client-side
  return {
    result: {
      success: true,
      expense: {
        amount: input.amount,
        description: input.description.trim(),
        categoryId: input.categoryId,
        categoryName: category.name,
        date: input.date,
      },
    },
    isError: false,
  };
}

/**
 * Main tool executor
 */
export function executeToolCall(
  toolName: string,
  toolInput: Record<string, unknown>,
  context: ChatContextData
): { result: unknown; isError: boolean } {
  switch (toolName) {
    case 'get_spending_summary':
      return executeGetSpendingSummary(
        toolInput as unknown as GetSpendingSummaryInput,
        context
      );
    case 'get_budget_status':
      return executeGetBudgetStatus(
        toolInput as unknown as GetBudgetStatusInput,
        context
      );
    case 'search_expenses':
      return executeSearchExpenses(
        toolInput as unknown as SearchExpensesInput,
        context
      );
    case 'get_top_expenses':
      return executeGetTopExpenses(
        toolInput as unknown as GetTopExpensesInput,
        context
      );
    case 'get_category_breakdown':
      return executeGetCategoryBreakdown(
        toolInput as unknown as GetCategoryBreakdownInput,
        context
      );
    case 'create_expense':
      return executeCreateExpense(
        toolInput as unknown as CreateExpenseInput,
        context
      );
    default:
      return {
        result: { error: `Outil inconnu: ${toolName}` },
        isError: true,
      };
  }
}
