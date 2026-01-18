'use client';

import { useState, useCallback, useMemo } from 'react';
import type { Selection } from '@heroui/react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Card,
  CardBody,
  Input,
  Select,
  SelectItem,
  Button,
} from '@heroui/react';
import { Wallet, Plus, Pencil, Trash2 } from 'lucide-react';
import { useBudgetStore, type Budget } from '@/store/budget-store';
import { useSettingsStore } from '@/store/settings-store';
import { formatCurrency } from '@/lib/utils';
import type { Category } from '@/types';

interface BudgetManagerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
}

interface BudgetFormData {
  categoryId: string | null;
  amount: string;
  period: 'monthly' | 'weekly';
}

const INITIAL_FORM_DATA: BudgetFormData = {
  categoryId: null,
  amount: '',
  period: 'monthly',
};

/**
 * Budget Manager component for creating, editing, and deleting budgets
 * Uses HeroUI Modal for the form interface
 */
export function BudgetManager({
  isOpen,
  onClose,
  categories,
}: BudgetManagerProps) {
  const { budgets, setBudget, removeBudget } = useBudgetStore();
  const { currency, locale } = useSettingsStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [formData, setFormData] = useState<BudgetFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<{ amount?: string }>({});

  // Get category name by ID
  const getCategoryName = useCallback(
    (categoryId: string | null): string => {
      if (categoryId === null) return 'Total Budget';
      const category = categories.find((c) => c.id === categoryId);
      return category?.name ?? 'Unknown';
    },
    [categories]
  );

  // Available categories for budget (excludes already budgeted categories)
  const availableCategories = useMemo(() => {
    const budgetedCategoryIds = new Set(
      budgets
        .filter((b) => b.categoryId !== null)
        .map((b) => b.categoryId as string)
    );

    // When editing, include the current category
    if (editingBudget?.categoryId) {
      budgetedCategoryIds.delete(editingBudget.categoryId);
    }

    return categories.filter((c) => !budgetedCategoryIds.has(c.id));
  }, [categories, budgets, editingBudget]);

  // Check if total budget already exists (for form)
  const hasTotalBudget = useMemo(() => {
    const exists = budgets.some((b) => b.categoryId === null);
    // Allow if editing the total budget
    if (editingBudget?.categoryId === null) return false;
    return exists;
  }, [budgets, editingBudget]);

  // Build category select items
  const categorySelectItems = useMemo(() => {
    const items: Array<{ id: string | null; name: string; color?: string }> = [];

    // Add total budget option if not already set (or if editing total budget)
    if (!hasTotalBudget) {
      items.push({ id: null, name: 'Total Budget' });
    }

    // Add available categories
    availableCategories.forEach((category) => {
      items.push({ id: category.id, name: category.name, color: category.color });
    });

    return items;
  }, [hasTotalBudget, availableCategories]);

  const handleOpenForm = useCallback((budget?: Budget) => {
    if (budget) {
      setEditingBudget(budget);
      setFormData({
        categoryId: budget.categoryId,
        amount: budget.amount.toString(),
        period: budget.period,
      });
    } else {
      setEditingBudget(null);
      setFormData(INITIAL_FORM_DATA);
    }
    setErrors({});
    setIsFormOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingBudget(null);
    setFormData(INITIAL_FORM_DATA);
    setErrors({});
  }, []);

  const handleCategoryChange = useCallback((keys: Selection) => {
    if (keys === 'all') return;
    const selectedKey = Array.from(keys)[0];
    setFormData((prev) => ({
      ...prev,
      categoryId: selectedKey === 'total' ? null : String(selectedKey),
    }));
  }, []);

  const handlePeriodChange = useCallback((keys: Selection) => {
    if (keys === 'all') return;
    const selectedKey = Array.from(keys)[0];
    if (selectedKey === 'monthly' || selectedKey === 'weekly') {
      setFormData((prev) => ({
        ...prev,
        period: selectedKey,
      }));
    }
  }, []);

  const handleAmountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      // Allow only positive numbers with up to 2 decimal places
      if (value === '' || /^\d+\.?\d{0,2}$/.test(value)) {
        setFormData((prev) => ({ ...prev, amount: value }));
        setErrors({});
      }
    },
    []
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: { amount?: string } = {};

    const amount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amount) || amount <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.amount]);

  const handleSubmit = useCallback(() => {
    if (!validateForm()) return;

    const amount = parseFloat(formData.amount);
    setBudget(formData.categoryId, amount, formData.period);
    handleCloseForm();
  }, [formData, validateForm, setBudget, handleCloseForm]);

  const handleDelete = useCallback(
    (categoryId: string | null) => {
      removeBudget(categoryId);
    },
    [removeBudget]
  );

  // Sort budgets: total first, then by category name
  const sortedBudgets = useMemo(() => {
    return [...budgets].sort((a, b) => {
      if (a.categoryId === null) return -1;
      if (b.categoryId === null) return 1;
      return getCategoryName(a.categoryId).localeCompare(
        getCategoryName(b.categoryId)
      );
    });
  }, [budgets, getCategoryName]);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        placement="center"
        backdrop="blur"
        size="lg"
        scrollBehavior="inside"
        classNames={{
          base: 'max-w-lg',
          header: 'border-b border-divider',
          body: 'py-6',
        }}
      >
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <Wallet className="w-5 h-5" aria-hidden="true" />
            <span>Manage Budgets</span>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              {/* Add Budget Button */}
              <Button
                color="primary"
                variant="flat"
                startContent={<Plus className="w-4 h-4" aria-hidden="true" />}
                onPress={() => handleOpenForm()}
                className="w-full"
              >
                Add Budget
              </Button>

              {/* Budget List */}
              {sortedBudgets.length === 0 ? (
                <div className="text-center py-8 text-default-500">
                  <Wallet
                    className="w-12 h-12 mx-auto mb-3 opacity-50"
                    aria-hidden="true"
                  />
                  <p>No budgets set yet</p>
                  <p className="text-sm">
                    Create a budget to track your spending limits
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedBudgets.map((budget) => (
                    <Card key={budget.id} className="bg-content2">
                      <CardBody className="py-3 px-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {getCategoryName(budget.categoryId)}
                            </p>
                            <p className="text-sm text-default-500">
                              {formatCurrency(budget.amount, currency, locale)} /{' '}
                              {budget.period === 'monthly' ? 'month' : 'week'}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              onPress={() => handleOpenForm(budget)}
                              aria-label={`Edit ${getCategoryName(budget.categoryId)} budget`}
                            >
                              <Pencil className="w-4 h-4" aria-hidden="true" />
                            </Button>
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              color="danger"
                              onPress={() => handleDelete(budget.categoryId)}
                              aria-label={`Delete ${getCategoryName(budget.categoryId)} budget`}
                            >
                              <Trash2 className="w-4 h-4" aria-hidden="true" />
                            </Button>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter className="border-t border-divider">
            <Button variant="flat" onPress={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add/Edit Budget Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        placement="center"
        backdrop="blur"
        classNames={{
          base: 'max-w-md',
          header: 'border-b border-divider',
          body: 'py-6',
        }}
      >
        <ModalContent>
          <ModalHeader>
            {editingBudget ? 'Edit Budget' : 'Add Budget'}
          </ModalHeader>
          <ModalBody>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              {/* Category Selection */}
              <div className="space-y-2">
                <label
                  htmlFor="budget-category"
                  className="text-sm font-medium text-foreground"
                >
                  Category
                </label>
                <Select
                  id="budget-category"
                  aria-label="Select category for budget"
                  selectedKeys={
                    new Set([formData.categoryId ?? 'total'])
                  }
                  onSelectionChange={handleCategoryChange}
                  isDisabled={!!editingBudget}
                  classNames={{
                    trigger: 'h-12',
                  }}
                  items={categorySelectItems}
                >
                  {(item) => (
                    <SelectItem key={item.id ?? 'total'} textValue={item.name}>
                      <div className="flex items-center gap-2">
                        {item.color ? (
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                            aria-hidden="true"
                          />
                        ) : (
                          <Wallet className="w-4 h-4" aria-hidden="true" />
                        )}
                        <span>{item.name}</span>
                      </div>
                    </SelectItem>
                  )}
                </Select>
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <label
                  htmlFor="budget-amount"
                  className="text-sm font-medium text-foreground"
                >
                  Budget Amount
                </label>
                <Input
                  id="budget-amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="Enter budget amount"
                  value={formData.amount}
                  onChange={handleAmountChange}
                  isInvalid={!!errors.amount}
                  errorMessage={errors.amount}
                  classNames={{
                    input: 'text-lg',
                    inputWrapper: 'h-12',
                  }}
                  aria-describedby={errors.amount ? 'amount-error' : undefined}
                />
              </div>

              {/* Period Selection */}
              <div className="space-y-2">
                <label
                  htmlFor="budget-period"
                  className="text-sm font-medium text-foreground"
                >
                  Period
                </label>
                <Select
                  id="budget-period"
                  aria-label="Select budget period"
                  selectedKeys={new Set([formData.period])}
                  onSelectionChange={handlePeriodChange}
                  classNames={{
                    trigger: 'h-12',
                  }}
                >
                  <SelectItem key="monthly" textValue="Monthly">
                    Monthly
                  </SelectItem>
                  <SelectItem key="weekly" textValue="Weekly">
                    Weekly
                  </SelectItem>
                </Select>
              </div>
            </form>
          </ModalBody>
          <ModalFooter className="border-t border-divider">
            <Button variant="flat" onPress={handleCloseForm}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleSubmit}>
              {editingBudget ? 'Save Changes' : 'Add Budget'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
