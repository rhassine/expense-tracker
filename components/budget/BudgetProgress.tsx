'use client';

import { useMemo } from 'react';
import { Card, CardBody, Progress } from '@heroui/react';
import { TrendingUp, Wallet } from 'lucide-react';
import { useBudgetStore } from '@/store/budget-store';
import { useSettingsStore } from '@/store/settings-store';
import {
  getSpendingForPeriod,
  getBudgetStatus,
  getPeriodDisplayName,
  formatPercentage,
  type BudgetStatusType,
} from '@/lib/budget-utils';
import { formatCurrency } from '@/lib/utils';
import type { Expense, Category } from '@/types';

interface BudgetProgressProps {
  expenses: Expense[];
  categories: Category[];
}

/**
 * Map budget status to HeroUI Progress color
 */
function getProgressColor(
  status: BudgetStatusType
): 'success' | 'warning' | 'danger' {
  switch (status) {
    case 'safe':
      return 'success';
    case 'warning':
      return 'warning';
    case 'danger':
      return 'danger';
  }
}

/**
 * Map budget status to Tailwind text color class
 */
function getStatusTextClass(status: BudgetStatusType): string {
  switch (status) {
    case 'safe':
      return 'text-success';
    case 'warning':
      return 'text-warning';
    case 'danger':
      return 'text-danger';
  }
}

interface BudgetProgressItemProps {
  name: string;
  spent: number;
  budgetAmount: number;
  period: 'monthly' | 'weekly';
  currency: string;
  locale: string;
  categoryColor?: string;
}

/**
 * Individual budget progress item component
 */
function BudgetProgressItem({
  name,
  spent,
  budgetAmount,
  period,
  currency,
  locale,
  categoryColor,
}: BudgetProgressItemProps) {
  const { percentage, status } = getBudgetStatus(spent, budgetAmount);
  const progressColor = getProgressColor(status);
  const textColorClass = getStatusTextClass(status);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          {categoryColor ? (
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: categoryColor }}
              aria-hidden="true"
            />
          ) : (
            <Wallet
              className="w-4 h-4 flex-shrink-0 text-default-500"
              aria-hidden="true"
            />
          )}
          <span className="font-medium truncate">{name}</span>
        </div>
        <span className={`text-sm font-medium ${textColorClass}`}>
          {formatPercentage(percentage)}
        </span>
      </div>

      <Progress
        aria-label={`${name} budget progress: ${formatPercentage(percentage)} used`}
        value={percentage}
        color={progressColor}
        className="h-2"
        classNames={{
          indicator: 'transition-all duration-300',
        }}
      />

      <div className="flex items-center justify-between text-sm text-default-500">
        <span>
          {formatCurrency(spent, currency, locale)} of{' '}
          {formatCurrency(budgetAmount, currency, locale)}
        </span>
        <span>{getPeriodDisplayName(period)}</span>
      </div>
    </div>
  );
}

/**
 * Budget Progress component displaying spending vs budget with visual progress bars
 * Shows color-coded status: green (safe), yellow (warning), red (danger)
 */
export function BudgetProgress({ expenses, categories }: BudgetProgressProps) {
  const { budgets } = useBudgetStore();
  const { currency, locale } = useSettingsStore();

  // Calculate spending for each budget
  const budgetProgressData = useMemo(() => {
    return budgets.map((budget) => {
      const spent = getSpendingForPeriod(
        expenses,
        budget.categoryId,
        budget.period
      );
      const category = budget.categoryId
        ? categories.find((c) => c.id === budget.categoryId)
        : null;

      return {
        id: budget.id,
        name: category?.name ?? 'Total Budget',
        spent,
        budgetAmount: budget.amount,
        period: budget.period,
        categoryColor: category?.color,
        categoryId: budget.categoryId,
      };
    });
  }, [budgets, expenses, categories]);

  // Sort: total budget first, then by category name
  const sortedBudgetProgress = useMemo(() => {
    return [...budgetProgressData].sort((a, b) => {
      if (a.categoryId === null) return -1;
      if (b.categoryId === null) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [budgetProgressData]);

  if (budgets.length === 0) {
    return null;
  }

  return (
    <Card className="bg-content1 border border-divider">
      <CardBody className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" aria-hidden="true" />
          <h3 className="font-semibold text-lg">Budget Progress</h3>
        </div>

        <div className="space-y-5">
          {sortedBudgetProgress.map((item) => (
            <BudgetProgressItem
              key={item.id}
              name={item.name}
              spent={item.spent}
              budgetAmount={item.budgetAmount}
              period={item.period}
              currency={currency}
              locale={locale}
              categoryColor={item.categoryColor}
            />
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
