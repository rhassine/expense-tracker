'use client';

import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardBody, CardHeader } from '@heroui/react';
import { PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import type { Expense, Category } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useSettingsStore } from '@/store/settings-store';
import { getCurrencyByCode } from '@/lib/currencies';

interface ExpenseChartsProps {
  expenses: Expense[];
  categories: Category[];
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
  percentage: number;
  [key: string]: string | number;
}

interface MonthlyData {
  month: string;
  amount: number;
  fullMonth: string;
}

/**
 * Custom tooltip for the pie chart
 */
function PieTooltip({
  active,
  payload,
  currency,
  locale,
}: {
  active?: boolean;
  payload?: Array<{ payload: CategoryData }>;
  currency: string;
  locale: string;
}) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <div className="bg-content1 border border-divider rounded-lg p-3 shadow-lg">
      <p className="font-medium text-foreground">{data.name}</p>
      <p className="text-sm text-default-500">
        {formatCurrency(data.value, currency, locale)} ({data.percentage.toFixed(1)}%)
      </p>
    </div>
  );
}

/**
 * Custom tooltip for the bar chart
 */
function BarTooltip({
  active,
  payload,
  currency,
  locale,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: MonthlyData }>;
  currency: string;
  locale: string;
}) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0];

  return (
    <div className="bg-content1 border border-divider rounded-lg p-3 shadow-lg">
      <p className="font-medium text-foreground">{data.payload.fullMonth}</p>
      <p className="text-sm text-default-500">{formatCurrency(data.value, currency, locale)}</p>
    </div>
  );
}

/**
 * Custom legend renderer for the pie chart
 */
function CustomLegend({
  payload,
}: {
  payload?: Array<{ value: string; color: string }>;
}) {
  if (!payload) return null;

  return (
    <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
      {payload.map((entry, index) => (
        <li key={`legend-${index}`} className="flex items-center gap-2 text-sm">
          <span
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: entry.color }}
            aria-hidden="true"
          />
          <span className="text-default-600">{entry.value}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * ExpenseCharts component displays spending analytics through pie and bar charts
 */
export default function ExpenseCharts({ expenses, categories }: ExpenseChartsProps) {
  const { currency, locale } = useSettingsStore();
  const currencyConfig = getCurrencyByCode(currency);
  const currencySymbol = currencyConfig?.symbol || '$';

  // Calculate spending by category
  const categoryData = useMemo<CategoryData[]>(() => {
    if (expenses.length === 0) return [];

    const totals = new Map<string, number>();

    expenses.forEach((expense) => {
      const current = totals.get(expense.categoryId) || 0;
      totals.set(expense.categoryId, current + expense.amount);
    });

    const totalSpending = expenses.reduce((sum, e) => sum + e.amount, 0);

    return categories
      .filter((category) => totals.has(category.id))
      .map((category) => {
        const value = totals.get(category.id) || 0;
        return {
          name: category.name,
          value,
          color: category.color,
          percentage: totalSpending > 0 ? (value / totalSpending) * 100 : 0,
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [expenses, categories]);

  // Calculate spending by month (last 6 months)
  const monthlyData = useMemo<MonthlyData[]>(() => {
    if (expenses.length === 0) return [];

    const now = new Date();
    const months: MonthlyData[] = [];

    // Generate last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const shortMonth = date.toLocaleDateString('en-US', { month: 'short' });
      const fullMonth = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      months.push({
        month: shortMonth,
        amount: 0,
        fullMonth,
      });

      // Sum expenses for this month
      expenses.forEach((expense) => {
        if (expense.date.startsWith(yearMonth)) {
          months[months.length - 1].amount += expense.amount;
        }
      });
    }

    return months;
  }, [expenses]);

  // Empty state
  if (expenses.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border border-divider">
          <CardHeader className="flex gap-3 pb-0">
            <PieChartIcon className="w-5 h-5 text-default-500" aria-hidden="true" />
            <h3 className="text-lg font-semibold">Spending by Category</h3>
          </CardHeader>
          <CardBody>
            <div className="h-64 flex items-center justify-center">
              <p className="text-default-400">No expense data to display</p>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-divider">
          <CardHeader className="flex gap-3 pb-0">
            <BarChart3 className="w-5 h-5 text-default-500" aria-hidden="true" />
            <h3 className="text-lg font-semibold">Monthly Spending</h3>
          </CardHeader>
          <CardBody>
            <div className="h-64 flex items-center justify-center">
              <p className="text-default-400">No expense data to display</p>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Pie Chart - Spending by Category */}
      <Card className="border border-divider">
        <CardHeader className="flex gap-3 pb-0">
          <PieChartIcon className="w-5 h-5 text-default-500" aria-hidden="true" />
          <h3 className="text-lg font-semibold">Spending by Category</h3>
        </CardHeader>
        <CardBody>
          <div className="h-64" role="img" aria-label="Pie chart showing spending distribution by category">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke={entry.color}
                      strokeWidth={1}
                    />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip currency={currency} locale={locale} />} />
                <Legend content={<CustomLegend />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>

      {/* Bar Chart - Monthly Spending */}
      <Card className="border border-divider">
        <CardHeader className="flex gap-3 pb-0">
          <BarChart3 className="w-5 h-5 text-default-500" aria-hidden="true" />
          <h3 className="text-lg font-semibold">Monthly Spending</h3>
        </CardHeader>
        <CardBody>
          <div className="h-64" role="img" aria-label="Bar chart showing monthly spending over the last 6 months">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--heroui-default-500)', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--heroui-default-500)', fontSize: 12 }}
                  tickFormatter={(value) => `${currencySymbol}${value}`}
                  width={60}
                />
                <Tooltip content={<BarTooltip currency={currency} locale={locale} />} cursor={{ fill: 'var(--heroui-default-100)' }} />
                <Bar
                  dataKey="amount"
                  fill="#006FEE"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
