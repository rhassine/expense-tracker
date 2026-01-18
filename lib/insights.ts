import {
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfWeek,
  endOfWeek,
  subWeeks,
  differenceInDays,
  format,
  parseISO,
  isWithinInterval,
  getDay,
} from 'date-fns';
import type { Expense, Category } from '@/types';

/**
 * Represents an automatically generated insight based on expense data
 */
export interface Insight {
  id: string;
  type: 'info' | 'warning' | 'success' | 'tip';
  icon: string;
  title: string;
  description: string;
}

/**
 * Helper to get expenses within a date range
 */
function getExpensesInRange(
  expenses: Expense[],
  start: Date,
  end: Date
): Expense[] {
  return expenses.filter((expense) => {
    const expenseDate = parseISO(expense.date);
    return isWithinInterval(expenseDate, { start, end });
  });
}

/**
 * Calculate total amount for a list of expenses
 */
function getTotalAmount(expenses: Expense[]): number {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
}

/**
 * Calculate percentage change between two values
 */
function getPercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Format currency for display in insights
 */
function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Get the day name from a day index (0 = Sunday, 6 = Saturday)
 */
function getDayName(dayIndex: number): string {
  const days = [
    'Sundays',
    'Mondays',
    'Tuesdays',
    'Wednesdays',
    'Thursdays',
    'Fridays',
    'Saturdays',
  ];
  return days[dayIndex];
}

/**
 * Generates insights based on monthly spending comparison
 */
function generateMonthlyComparisonInsight(expenses: Expense[]): Insight | null {
  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  const currentMonthExpenses = getExpensesInRange(
    expenses,
    currentMonthStart,
    currentMonthEnd
  );
  const lastMonthExpenses = getExpensesInRange(
    expenses,
    lastMonthStart,
    lastMonthEnd
  );

  const currentTotal = getTotalAmount(currentMonthExpenses);
  const lastTotal = getTotalAmount(lastMonthExpenses);

  // Need data from both months to compare
  if (lastMonthExpenses.length === 0) return null;

  const percentChange = getPercentageChange(currentTotal, lastTotal);
  const absChange = Math.abs(Math.round(percentChange));

  if (percentChange > 10) {
    return {
      id: 'monthly-increase',
      type: 'warning',
      icon: 'TrendingUp',
      title: 'Spending Increased',
      description: `Your spending increased by ${absChange}% this month compared to last month.`,
    };
  } else if (percentChange < -10) {
    return {
      id: 'monthly-decrease',
      type: 'success',
      icon: 'TrendingDown',
      title: 'Great Job!',
      description: `Your spending decreased by ${absChange}% this month compared to last month.`,
    };
  }

  return null;
}

/**
 * Generates insight about top spending category
 */
function generateTopCategoryInsight(
  expenses: Expense[],
  categories: Category[]
): Insight | null {
  if (expenses.length < 3) return null;

  const categoryTotals = new Map<string, number>();

  expenses.forEach((expense) => {
    const current = categoryTotals.get(expense.categoryId) || 0;
    categoryTotals.set(expense.categoryId, current + expense.amount);
  });

  let topCategoryId = '';
  let topAmount = 0;

  categoryTotals.forEach((amount, categoryId) => {
    if (amount > topAmount) {
      topAmount = amount;
      topCategoryId = categoryId;
    }
  });

  const totalSpending = getTotalAmount(expenses);
  const topCategory = categories.find((c) => c.id === topCategoryId);

  if (!topCategory || totalSpending === 0) return null;

  const percentage = Math.round((topAmount / totalSpending) * 100);

  // Only show if it's a significant portion
  if (percentage < 20) return null;

  return {
    id: 'top-category',
    type: 'info',
    icon: 'Info',
    title: 'Top Spending Category',
    description: `${topCategory.name} is your top spending category (${percentage}% of total).`,
  };
}

/**
 * Generates insight about weekly spending
 */
function generateWeeklyInsight(expenses: Expense[]): Insight | null {
  const now = new Date();
  const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 });
  const currentWeekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const currentWeekExpenses = getExpensesInRange(
    expenses,
    currentWeekStart,
    currentWeekEnd
  );
  const currentWeekTotal = getTotalAmount(currentWeekExpenses);

  // Calculate weekly average from historical data (last 8 weeks)
  const weeklyTotals: number[] = [];
  for (let i = 1; i <= 8; i++) {
    const weekStart = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
    const weekExpenses = getExpensesInRange(expenses, weekStart, weekEnd);
    if (weekExpenses.length > 0) {
      weeklyTotals.push(getTotalAmount(weekExpenses));
    }
  }

  if (weeklyTotals.length < 2) return null;

  const weeklyAverage =
    weeklyTotals.reduce((a, b) => a + b, 0) / weeklyTotals.length;
  const percentDiff = getPercentageChange(currentWeekTotal, weeklyAverage);
  const absPercent = Math.abs(Math.round(percentDiff));

  if (absPercent > 20) {
    const trend = percentDiff > 0 ? 'more' : 'less';
    return {
      id: 'weekly-spending',
      type: percentDiff > 0 ? 'warning' : 'success',
      icon: 'Calendar',
      title: 'Weekly Spending',
      description: `You've spent ${formatAmount(currentWeekTotal)} this week, ${absPercent}% ${trend} than your weekly average.`,
    };
  }

  return null;
}

/**
 * Generates insight about inactive logging
 */
function generateInactivityInsight(expenses: Expense[]): Insight | null {
  if (expenses.length === 0) {
    return {
      id: 'no-expenses',
      type: 'info',
      icon: 'Info',
      title: 'Get Started',
      description: 'Start logging your expenses to see personalized insights.',
    };
  }

  const now = new Date();
  const sortedExpenses = [...expenses].sort(
    (a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()
  );
  const mostRecentDate = parseISO(sortedExpenses[0].date);
  const daysSinceLastExpense = differenceInDays(now, mostRecentDate);

  if (daysSinceLastExpense >= 7) {
    return {
      id: 'inactivity',
      type: 'warning',
      icon: 'AlertCircle',
      title: 'No Recent Activity',
      description: `You haven't logged any expenses in the last ${daysSinceLastExpense} days.`,
    };
  }

  return null;
}

/**
 * Generates insight about spending patterns by day of week
 */
function generateDayOfWeekInsight(expenses: Expense[]): Insight | null {
  if (expenses.length < 10) return null;

  const dayTotals: number[] = [0, 0, 0, 0, 0, 0, 0];
  const dayCounts: number[] = [0, 0, 0, 0, 0, 0, 0];

  expenses.forEach((expense) => {
    const dayIndex = getDay(parseISO(expense.date));
    dayTotals[dayIndex] += expense.amount;
    dayCounts[dayIndex]++;
  });

  let maxDayIndex = 0;
  let maxTotal = 0;

  dayTotals.forEach((total, index) => {
    if (total > maxTotal) {
      maxTotal = total;
      maxDayIndex = index;
    }
  });

  const totalSpending = getTotalAmount(expenses);
  const dayPercentage = Math.round((maxTotal / totalSpending) * 100);

  // Only show if there's a clear pattern (at least 20% on one day)
  if (dayPercentage < 20) return null;

  return {
    id: 'day-pattern',
    type: 'tip',
    icon: 'Lightbulb',
    title: 'Spending Pattern',
    description: `Tip: Most of your spending happens on ${getDayName(maxDayIndex)}.`,
  };
}

/**
 * Generates insight about expenses without descriptions
 */
function generateMissingDescriptionInsight(expenses: Expense[]): Insight | null {
  const missingDescription = expenses.filter(
    (e) => !e.description || e.description.trim() === ''
  );

  if (missingDescription.length >= 3) {
    return {
      id: 'missing-descriptions',
      type: 'tip',
      icon: 'Lightbulb',
      title: 'Add Descriptions',
      description: `You have ${missingDescription.length} expenses without descriptions. Adding details helps track spending better.`,
    };
  }

  return null;
}

/**
 * Generates insight about consistent tracking streak
 */
function generateStreakInsight(expenses: Expense[]): Insight | null {
  if (expenses.length < 7) return null;

  const now = new Date();
  let streak = 0;

  // Check consecutive days with expenses (going backwards)
  for (let i = 0; i < 30; i++) {
    const checkDate = format(subWeeks(now, 0), 'yyyy-MM-dd').slice(0, 8);
    const dayStart = new Date(now);
    dayStart.setDate(dayStart.getDate() - i);
    const dateStr = format(dayStart, 'yyyy-MM-dd');

    const hasExpense = expenses.some((e) => e.date === dateStr);
    if (hasExpense) {
      streak++;
    } else if (streak > 0) {
      break;
    }
  }

  if (streak >= 7) {
    return {
      id: 'tracking-streak',
      type: 'success',
      icon: 'CheckCircle',
      title: 'Great Tracking!',
      description: `You've logged expenses for ${streak} consecutive days. Keep it up!`,
    };
  }

  return null;
}

/**
 * Main function to generate insights from expense data
 * Returns 3-5 most relevant insights
 */
export function generateInsights(
  expenses: Expense[],
  categories: Category[]
): Insight[] {
  const insights: Insight[] = [];

  // Generate all possible insights
  const potentialInsights = [
    generateInactivityInsight(expenses),
    generateMonthlyComparisonInsight(expenses),
    generateTopCategoryInsight(expenses, categories),
    generateWeeklyInsight(expenses),
    generateStreakInsight(expenses),
    generateDayOfWeekInsight(expenses),
    generateMissingDescriptionInsight(expenses),
  ];

  // Filter out null insights and prioritize
  const validInsights = potentialInsights.filter(
    (insight): insight is Insight => insight !== null
  );

  // Prioritize insights: warnings first, then success, then info, then tips
  const priorityOrder: Record<Insight['type'], number> = {
    warning: 0,
    success: 1,
    info: 2,
    tip: 3,
  };

  validInsights.sort(
    (a, b) => priorityOrder[a.type] - priorityOrder[b.type]
  );

  // Return top 3-5 insights
  return validInsights.slice(0, 5);
}
