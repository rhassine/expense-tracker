'use client';

import { useMemo } from 'react';
import { Card, CardBody, Button, Chip } from '@heroui/react';
import { Pencil, Trash2, HelpCircle, icons } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useSettingsStore } from '@/store/settings-store';
import { useTagStore } from '@/store/tag-store';
import type { Expense, Category, Tag } from '@/types';

interface ExpenseCardProps {
  expense: Expense;
  category: Category | undefined;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

/**
 * Dynamically renders a Lucide icon by name.
 * Falls back to HelpCircle if the icon is not found.
 */
function DynamicIcon({
  name,
  className,
  size = 20,
}: {
  name: string;
  className?: string;
  size?: number;
}) {
  const IconComponent = useMemo(() => {
    // Convert icon name to PascalCase for lucide-react lookup
    const pascalCase = name
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join('');

    // Check if the icon exists in the icons object
    const icon = icons[pascalCase as keyof typeof icons];
    return icon || HelpCircle;
  }, [name]);

  return <IconComponent className={className} size={size} aria-hidden="true" />;
}

/**
 * Formats a number as currency (negative value for expenses).
 */
function formatExpenseAmount(
  amount: number,
  currency: string,
  locale: string
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    signDisplay: 'always',
  }).format(-Math.abs(amount));
}

/**
 * Formats a date string into a human-readable format.
 */
function formatDate(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, 'MMM d, yyyy');
  } catch {
    return dateString;
  }
}

/**
 * ExpenseCard displays a single expense with its category, amount, and actions.
 * Fully accessible with keyboard navigation and screen reader support.
 */
export default function ExpenseCard({
  expense,
  category,
  onEdit,
  onDelete,
}: ExpenseCardProps) {
  const { currency, locale } = useSettingsStore();
  const { tags: allTags, getTagById } = useTagStore();
  const formattedAmount = formatExpenseAmount(expense.amount, currency, locale);
  const formattedDate = formatDate(expense.date);
  const categoryName = category?.name || 'Uncategorized';
  const categoryColor = category?.color || '#6b7280';
  const categoryIcon = category?.icon || 'help-circle';

  // Get tag objects for this expense
  const expenseTags = useMemo(() => {
    if (!expense.tags || expense.tags.length === 0) return [];
    return expense.tags
      .map((tagId) => getTagById(tagId))
      .filter((tag): tag is Tag => tag !== undefined);
  }, [expense.tags, getTagById, allTags]);

  return (
    <Card
      className="group transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
      aria-label={`Expense: ${expense.description}, ${formattedAmount}, ${categoryName}, ${formattedDate}`}
    >
      <CardBody className="flex flex-row items-center gap-4 p-4">
        {/* Category Icon */}
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}
          aria-hidden="true"
        >
          <DynamicIcon
            name={categoryIcon}
            size={24}
          />
        </div>

        {/* Expense Details */}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-medium text-foreground">
              {expense.description}
            </h3>
            <Chip
              size="sm"
              variant="flat"
              className="hidden sm:inline-flex"
              style={{
                backgroundColor: `${categoryColor}15`,
                color: categoryColor,
              }}
            >
              {categoryName}
            </Chip>
          </div>
          <p className="text-sm text-default-500">
            <time dateTime={expense.date}>{formattedDate}</time>
          </p>
          {/* Mobile category chip */}
          <Chip
            size="sm"
            variant="flat"
            className="mt-1 w-fit sm:hidden"
            style={{
              backgroundColor: `${categoryColor}15`,
              color: categoryColor,
            }}
          >
            {categoryName}
          </Chip>
          {/* Expense Tags */}
          {expenseTags.length > 0 && (
            <div
              className="mt-2 flex flex-wrap gap-1"
              role="list"
              aria-label="Expense tags"
            >
              {expenseTags.map((tag) => (
                <Chip
                  key={tag.id}
                  size="sm"
                  variant="flat"
                  style={{
                    backgroundColor: `${tag.color}20`,
                    color: tag.color,
                  }}
                  classNames={{
                    base: 'h-5 px-2',
                    content: 'text-xs font-medium',
                  }}
                >
                  {tag.name}
                </Chip>
              ))}
            </div>
          )}
        </div>

        {/* Amount */}
        <div className="shrink-0 text-right">
          <span
            className="text-lg font-semibold text-danger"
            aria-label={`Amount: ${formattedAmount}`}
          >
            {formattedAmount}
          </span>
        </div>

        {/* Action Buttons - visible on mobile, hover on desktop */}
        <div className="flex shrink-0 gap-2 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 group-focus-within:opacity-100">
          <Button
            isIconOnly
            size="sm"
            variant="light"
            aria-label={`Edit expense: ${expense.description}`}
            onPress={() => onEdit(expense)}
            className="text-default-500 hover:text-primary min-w-[44px] min-h-[44px]"
          >
            <Pencil size={20} aria-hidden="true" />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            aria-label={`Delete expense: ${expense.description}`}
            onPress={() => onDelete(expense)}
            className="text-default-500 hover:text-danger min-w-[44px] min-h-[44px]"
          >
            <Trash2 size={20} aria-hidden="true" />
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
