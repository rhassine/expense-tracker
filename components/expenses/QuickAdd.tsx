'use client';

import { useState, useCallback, useRef, useMemo, type FormEvent } from 'react';
import { Input, Select, SelectItem, Button } from '@heroui/react';
import { Plus } from 'lucide-react';
import { useSettingsStore } from '@/store/settings-store';
import { getCurrencyByCode } from '@/lib/currencies';
import type { Category } from '@/types';
import type { CreateExpenseInput } from '@/store/expense-store';

interface QuickAddProps {
  categories: Category[];
  onAddExpense: (input: CreateExpenseInput) => void;
}

/**
 * Get today's date in ISO format (YYYY-MM-DD)
 */
function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * QuickAdd provides an inline form for rapid expense entry.
 * Designed to stay visible at the top of the expense list for
 * quick successive entries without opening a modal.
 */
export default function QuickAdd({ categories, onAddExpense }: QuickAddProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [errors, setErrors] = useState<{
    amount?: string;
    description?: string;
    categoryId?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const amountInputRef = useRef<HTMLInputElement>(null);

  // Get currency symbol from settings
  const currency = useSettingsStore((state) => state.currency);
  const currencySymbol = useMemo(() => {
    const currencyConfig = getCurrencyByCode(currency);
    return currencyConfig?.symbol ?? '$';
  }, [currency]);

  /**
   * Validates form fields and returns true if valid
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: typeof errors = {};

    // Amount validation
    const amountValue = parseFloat(amount);
    if (!amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(amountValue) || amountValue <= 0) {
      newErrors.amount = 'Enter a positive number';
    }

    // Description validation
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    // Category validation
    if (!categoryId) {
      newErrors.categoryId = 'Select a category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [amount, description, categoryId]);

  /**
   * Clears all form fields and errors
   */
  const resetForm = useCallback(() => {
    setAmount('');
    setDescription('');
    setCategoryId('');
    setErrors({});
  }, []);

  /**
   * Handles form submission
   */
  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);

      try {
        onAddExpense({
          amount: parseFloat(amount),
          description: description.trim(),
          categoryId,
          date: getTodayISO(),
        });

        // Reset form for next entry
        resetForm();

        // Focus back on amount input for quick successive entries
        amountInputRef.current?.focus();
      } finally {
        setIsSubmitting(false);
      }
    },
    [amount, description, categoryId, validateForm, onAddExpense, resetForm]
  );

  /**
   * Handle category selection change
   */
  const handleCategoryChange = useCallback(
    (keys: 'all' | Set<React.Key>) => {
      if (keys === 'all') return;
      const selectedKey = Array.from(keys)[0];
      setCategoryId(selectedKey?.toString() ?? '');
      if (errors.categoryId) {
        setErrors((prev) => ({ ...prev, categoryId: undefined }));
      }
    },
    [errors.categoryId]
  );

  /**
   * Clear field error on change
   */
  const handleAmountChange = useCallback(
    (value: string) => {
      setAmount(value);
      if (errors.amount) {
        setErrors((prev) => ({ ...prev, amount: undefined }));
      }
    },
    [errors.amount]
  );

  const handleDescriptionChange = useCallback(
    (value: string) => {
      setDescription(value);
      if (errors.description) {
        setErrors((prev) => ({ ...prev, description: undefined }));
      }
    },
    [errors.description]
  );

  return (
    <div className="mb-6 rounded-xl bg-content1 border border-divider p-4">
      <form onSubmit={handleSubmit} aria-label="Quick add expense form">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          {/* Amount Input */}
          <div className="w-full sm:w-28">
            <Input
              ref={amountInputRef}
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onValueChange={handleAmountChange}
              startContent={
                <span className="text-default-400 text-sm">{currencySymbol}</span>
              }
              size="sm"
              variant="bordered"
              isInvalid={!!errors.amount}
              errorMessage={errors.amount}
              aria-label="Expense amount"
              classNames={{
                inputWrapper: 'h-10',
                input: 'text-sm',
              }}
            />
          </div>

          {/* Description Input */}
          <div className="flex-1 min-w-0">
            <Input
              type="text"
              placeholder="What did you spend on?"
              value={description}
              onValueChange={handleDescriptionChange}
              size="sm"
              variant="bordered"
              isInvalid={!!errors.description}
              errorMessage={errors.description}
              aria-label="Expense description"
              classNames={{
                inputWrapper: 'h-10',
                input: 'text-sm',
              }}
            />
          </div>

          {/* Category Select */}
          <div className="w-full sm:w-44">
            <Select
              placeholder="Category"
              selectedKeys={categoryId ? [categoryId] : []}
              onSelectionChange={handleCategoryChange}
              size="sm"
              variant="bordered"
              isInvalid={!!errors.categoryId}
              errorMessage={errors.categoryId}
              aria-label="Expense category"
              classNames={{
                trigger: 'h-10',
                value: 'text-sm',
              }}
            >
              {categories.map((category) => (
                <SelectItem key={category.id} textValue={category.name}>
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: category.color }}
                      aria-hidden="true"
                    />
                    <span className="truncate">{category.name}</span>
                  </div>
                </SelectItem>
              ))}
            </Select>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            color="primary"
            size="sm"
            isLoading={isSubmitting}
            isDisabled={isSubmitting}
            className="h-10 px-4 font-medium w-full sm:w-auto"
            startContent={!isSubmitting && <Plus className="h-4 w-4" />}
            aria-label="Add expense"
          >
            <span className="sm:hidden">Add Expense</span>
            <span className="hidden sm:inline">Add</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
