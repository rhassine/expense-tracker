'use client';

import { useMemo } from 'react';
import { Card, CardBody } from '@heroui/react';
import { TrendingUp, DollarSign, BarChart3, Tag } from 'lucide-react';
import type { Expense, Category } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useSettingsStore } from '@/store/settings-store';
import { getCurrencyByCode } from '@/lib/currencies';

interface AnalyticsSummaryProps {
  expenses: Expense[];
  categories: Category[];
}

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  iconBgClass: string;
}

/**
 * Individual metric card component
 */
function MetricCard({ title, value, subtitle, icon, iconBgClass }: MetricCardProps) {
  return (
    <Card className="border border-divider">
      <CardBody className="flex flex-row items-center gap-4 p-4">
        <div
          className={`flex items-center justify-center w-12 h-12 rounded-xl ${iconBgClass}`}
          aria-hidden="true"
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-default-500 truncate">{title}</p>
          <p className="text-xl font-bold text-foreground truncate">{value}</p>
          {subtitle && (
            <p className="text-xs text-default-400 truncate">{subtitle}</p>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

/**
 * AnalyticsSummary displays key expense metrics in a grid of cards
 */
export default function AnalyticsSummary({ expenses, categories }: AnalyticsSummaryProps) {
  const { currency, locale } = useSettingsStore();
  const currencyConfig = getCurrencyByCode(currency);
  const currencySymbol = currencyConfig?.symbol || '$';

  // Calculate total spending (all time)
  const totalSpent = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  // Calculate this month's spending
  const thisMonthSpending = useMemo(() => {
    const now = new Date();
    const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    return expenses
      .filter((expense) => expense.date.startsWith(currentYearMonth))
      .reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  // Calculate average per expense
  const averagePerExpense = useMemo(() => {
    if (expenses.length === 0) return 0;
    return totalSpent / expenses.length;
  }, [totalSpent, expenses.length]);

  // Find most frequent category
  const mostFrequentCategory = useMemo(() => {
    if (expenses.length === 0) return null;

    const categoryCounts = new Map<string, number>();

    expenses.forEach((expense) => {
      const count = categoryCounts.get(expense.categoryId) || 0;
      categoryCounts.set(expense.categoryId, count + 1);
    });

    let maxCount = 0;
    let maxCategoryId = '';

    categoryCounts.forEach((count, categoryId) => {
      if (count > maxCount) {
        maxCount = count;
        maxCategoryId = categoryId;
      }
    });

    const category = categories.find((c) => c.id === maxCategoryId);
    return category
      ? { name: category.name, count: maxCount }
      : null;
  }, [expenses, categories]);

  // Empty state handling
  if (expenses.length === 0) {
    const zeroValue = formatCurrency(0, currency, locale);
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Spent"
          value={zeroValue}
          icon={<DollarSign className="w-6 h-6 text-green-600" />}
          iconBgClass="bg-green-100 dark:bg-green-900/30"
        />
        <MetricCard
          title="This Month"
          value={zeroValue}
          icon={<TrendingUp className="w-6 h-6 text-blue-600" />}
          iconBgClass="bg-blue-100 dark:bg-blue-900/30"
        />
        <MetricCard
          title="Average per Expense"
          value={zeroValue}
          icon={<BarChart3 className="w-6 h-6 text-purple-600" />}
          iconBgClass="bg-purple-100 dark:bg-purple-900/30"
        />
        <MetricCard
          title="Most Frequent"
          value="No data"
          icon={<Tag className="w-6 h-6 text-orange-600" />}
          iconBgClass="bg-orange-100 dark:bg-orange-900/30"
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Total Spent"
        value={formatCurrency(totalSpent, currency, locale)}
        subtitle={`${expenses.length} expense${expenses.length !== 1 ? 's' : ''}`}
        icon={<DollarSign className="w-6 h-6 text-green-600" />}
        iconBgClass="bg-green-100 dark:bg-green-900/30"
      />
      <MetricCard
        title="This Month"
        value={formatCurrency(thisMonthSpending, currency, locale)}
        subtitle={new Date().toLocaleDateString(locale, { month: 'long', year: 'numeric' })}
        icon={<TrendingUp className="w-6 h-6 text-blue-600" />}
        iconBgClass="bg-blue-100 dark:bg-blue-900/30"
      />
      <MetricCard
        title="Average per Expense"
        value={formatCurrency(averagePerExpense, currency, locale)}
        icon={<BarChart3 className="w-6 h-6 text-purple-600" />}
        iconBgClass="bg-purple-100 dark:bg-purple-900/30"
      />
      <MetricCard
        title="Most Frequent"
        value={mostFrequentCategory?.name ?? 'No data'}
        subtitle={mostFrequentCategory ? `${mostFrequentCategory.count} expense${mostFrequentCategory.count !== 1 ? 's' : ''}` : undefined}
        icon={<Tag className="w-6 h-6 text-orange-600" />}
        iconBgClass="bg-orange-100 dark:bg-orange-900/30"
      />
    </div>
  );
}
