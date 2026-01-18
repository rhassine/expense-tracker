'use client';

import { useState, useMemo } from 'react';
import { Card, CardBody, Button } from '@heroui/react';
import { AlertTriangle, X } from 'lucide-react';
import { useBudgetStore } from '@/store/budget-store';
import { useSettingsStore } from '@/store/settings-store';
import {
  getSpendingForPeriod,
  getBudgetStatus,
  formatPercentage,
  type BudgetStatusType,
} from '@/lib/budget-utils';
import { formatCurrency } from '@/lib/utils';
import type { Expense, Category } from '@/types';

interface BudgetAlertProps {
  expenses: Expense[];
  categories: Category[];
}

interface AlertBudget {
  name: string;
  spent: number;
  budgetAmount: number;
  percentage: number;
  status: BudgetStatusType;
}

/**
 * Budget Alert component that displays when budgets are at warning or danger level
 * Dismissible but reappears on page reload
 */
export function BudgetAlert({ expenses, categories }: BudgetAlertProps) {
  const { budgets } = useBudgetStore();
  const { currency, locale } = useSettingsStore();
  const [isDismissed, setIsDismissed] = useState(false);

  // Find budgets at risk (warning or danger)
  const alertBudgets = useMemo((): AlertBudget[] => {
    return budgets
      .map((budget) => {
        const spent = getSpendingForPeriod(
          expenses,
          budget.categoryId,
          budget.period
        );
        const { percentage, status } = getBudgetStatus(spent, budget.amount);
        const category = budget.categoryId
          ? categories.find((c) => c.id === budget.categoryId)
          : null;

        return {
          name: category?.name ?? 'Total Budget',
          spent,
          budgetAmount: budget.amount,
          percentage,
          status,
        };
      })
      .filter((b) => b.status === 'warning' || b.status === 'danger')
      .sort((a, b) => b.percentage - a.percentage); // Sort by percentage descending
  }, [budgets, expenses, categories]);

  // Don't render if dismissed or no alerts
  if (isDismissed || alertBudgets.length === 0) {
    return null;
  }

  // Determine overall alert severity (danger takes precedence)
  const hasDanger = alertBudgets.some((b) => b.status === 'danger');
  const alertColor = hasDanger ? 'danger' : 'warning';
  const borderColorClass = hasDanger
    ? 'border-danger/50'
    : 'border-warning/50';
  const bgColorClass = hasDanger ? 'bg-danger/10' : 'bg-warning/10';
  const iconColorClass = hasDanger ? 'text-danger' : 'text-warning';

  return (
    <Card
      className={`${bgColorClass} ${borderColorClass} border`}
      role="alert"
      aria-live="polite"
    >
      <CardBody className="py-3 px-4">
        <div className="flex items-start gap-3">
          <AlertTriangle
            className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColorClass}`}
            aria-hidden="true"
          />

          <div className="flex-1 min-w-0">
            <p className={`font-medium ${hasDanger ? 'text-danger' : 'text-warning-600'}`}>
              {hasDanger ? 'Budget Limit Exceeded' : 'Budget Warning'}
            </p>

            <div className="mt-1 space-y-1">
              {alertBudgets.map((budget, index) => (
                <p key={index} className="text-sm text-default-600">
                  <span className="font-medium">{budget.name}:</span>{' '}
                  {formatCurrency(budget.spent, currency, locale)} of{' '}
                  {formatCurrency(budget.budgetAmount, currency, locale)}{' '}
                  <span
                    className={
                      budget.status === 'danger'
                        ? 'text-danger font-medium'
                        : 'text-warning-600 font-medium'
                    }
                  >
                    ({formatPercentage(budget.percentage)})
                  </span>
                </p>
              ))}
            </div>

            <p className="text-xs text-default-500 mt-2">
              {hasDanger
                ? 'Consider reviewing your spending to stay within budget.'
                : 'You are approaching your budget limit.'}
            </p>
          </div>

          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={() => setIsDismissed(true)}
            aria-label="Dismiss budget alert"
            className={hasDanger ? 'text-danger' : 'text-warning-600'}
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
