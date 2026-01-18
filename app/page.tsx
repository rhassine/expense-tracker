'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import { Accordion, AccordionItem, Button } from '@heroui/react';
import { BarChart3, Wallet } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { ExportButton } from '@/components/ui/ExportButton';
import ExpenseList from '@/components/expenses/ExpenseList';
import ExpenseFilters from '@/components/expenses/ExpenseFilters';
import ExpenseForm from '@/components/expenses/ExpenseForm';
import QuickAdd from '@/components/expenses/QuickAdd';
import ExpenseCharts from '@/components/analytics/ExpenseCharts';
import AnalyticsSummary from '@/components/analytics/AnalyticsSummary';
import { InsightsPanel } from '@/components/insights/InsightsPanel';
import { BudgetAlert, BudgetProgress, BudgetManager } from '@/components/budget';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { KeyboardShortcutsHelp } from '@/components/ui/KeyboardShortcutsHelp';
import { ScrollIndicator } from '@/components/ui/ScrollIndicator';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { useExpenseStore } from '@/store/expense-store';
import { useSettingsStore } from '@/store/settings-store';
import { useCategoryStore } from '@/store/category-store';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { formatCurrency } from '@/lib/utils';
import type { Expense, ExpenseFilters as FiltersType } from '@/types';

export default function Home() {
  // Stores
  const { expenses, addExpense, updateExpense, deleteExpense } = useExpenseStore();
  const { currency, locale } = useSettingsStore();
  const getAllCategories = useCategoryStore((state) => state.getAllCategories);

  // Get combined categories (default + custom)
  const categories = useMemo(() => getAllCategories(), [getAllCategories]);

  // Ref for search input focus via keyboard shortcut
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBudgetManagerOpen, setIsBudgetManagerOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<FiltersType>({
    search: '',
    categoryId: null,
    dateFrom: null,
    dateTo: null,
    tagIds: [],
  });

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          expense.description.toLowerCase().includes(searchLower) ||
          categories.find((c) => c.id === expense.categoryId)
            ?.name.toLowerCase()
            .includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Category filter
      if (filters.categoryId && expense.categoryId !== filters.categoryId) {
        return false;
      }

      // Date range filter - from date
      if (filters.dateFrom && expense.date < filters.dateFrom) {
        return false;
      }

      // Date range filter - to date
      if (filters.dateTo && expense.date > filters.dateTo) {
        return false;
      }

      // Tag filter - expense must have at least one of the selected tags
      if (filters.tagIds.length > 0) {
        const expenseTags = expense.tags ?? [];
        const hasMatchingTag = filters.tagIds.some((tagId) =>
          expenseTags.includes(tagId)
        );
        if (!hasMatchingTag) return false;
      }

      return true;
    });
  }, [expenses, filters, categories]);

  // Total spending
  const totalSpending = useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [filteredExpenses]);

  // Handlers
  const handleAddExpense = useCallback(() => {
    setEditingExpense(undefined);
    setIsFormOpen(true);
  }, []);

  const handleEditExpense = useCallback((expense: Expense) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  }, []);

  const handleDeleteClick = useCallback((expense: Expense) => {
    setDeletingExpense(expense);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingExpense) return;

    setIsDeleting(true);
    // Simulate a small delay for UX
    await new Promise((resolve) => setTimeout(resolve, 300));
    deleteExpense(deletingExpense.id);
    setIsDeleting(false);
    setDeletingExpense(null);
  }, [deletingExpense, deleteExpense]);

  const handleSaveExpense = useCallback(
    (data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (editingExpense) {
        updateExpense(editingExpense.id, data);
      } else {
        addExpense(data);
      }
      setIsFormOpen(false);
      setEditingExpense(undefined);
    },
    [editingExpense, addExpense, updateExpense]
  );

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingExpense(undefined);
  }, []);

  // Focus search input handler for keyboard shortcut
  const handleFocusSearch = useCallback(() => {
    searchInputRef.current?.focus();
  }, []);

  // Settings handlers
  const handleOpenSettings = useCallback(() => {
    setIsSettingsOpen(true);
  }, []);

  const handleCloseSettings = useCallback(() => {
    setIsSettingsOpen(false);
  }, []);

  // Budget manager handlers
  const handleOpenBudgetManager = useCallback(() => {
    setIsBudgetManagerOpen(true);
  }, []);

  const handleCloseBudgetManager = useCallback(() => {
    setIsBudgetManagerOpen(false);
  }, []);

  // Register keyboard shortcuts
  useKeyboardShortcuts({
    onAddNew: handleAddExpense,
    onEscape: handleCloseForm,
    onSearch: handleFocusSearch,
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header onAddExpense={handleAddExpense} onOpenSettings={handleOpenSettings} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Budget Alert - shows when budgets are at warning/danger level */}
        <div className="mb-6">
          <BudgetAlert expenses={expenses} categories={categories} />
        </div>

        {/* Summary Card */}
        {expenses.length > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-content1 border border-divider">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-500">
                  {filteredExpenses.length === expenses.length
                    ? `Total Expenses (${expenses.length})`
                    : `Filtered (${filteredExpenses.length} of ${expenses.length})`}
                </p>
                <p className="text-2xl font-bold text-danger">
                  -{formatCurrency(totalSpending, currency, locale)}
                </p>
              </div>
              <ExportButton expenses={filteredExpenses} categories={categories} />
            </div>
          </div>
        )}

        {/* Quick Add Form - always visible for immediate access */}
        <QuickAdd
          categories={categories}
          onAddExpense={addExpense}
        />

        {/* Filters */}
        {expenses.length > 0 && (
          <div className="mb-6">
            <ExpenseFilters
              ref={searchInputRef}
              filters={filters}
              onFiltersChange={setFilters}
              categories={categories}
            />
          </div>
        )}

        {/* Expense List */}
        <ExpenseList
          expenses={filteredExpenses}
          categories={categories}
          onEdit={handleEditExpense}
          onDelete={handleDeleteClick}
          onAddExpense={handleAddExpense}
        />

        {/* Analytics Section */}
        {expenses.length > 0 && (
          <div className="mt-6 mb-6">
            <Accordion
              variant="bordered"
              className="px-0"
              itemClasses={{
                base: 'py-0',
                title: 'font-semibold text-base',
                trigger: 'py-4 data-[hover=true]:bg-default-100 rounded-lg px-4',
                content: 'pt-2 pb-4 px-4',
              }}
            >
              <AccordionItem
                key="analytics"
                aria-label="Analytics and Charts"
                startContent={
                  <BarChart3 className="w-5 h-5 text-primary" aria-hidden="true" />
                }
                title="Analytics"
                subtitle="View spending insights and charts"
              >
                <div className="space-y-6">
                  <AnalyticsSummary
                    expenses={expenses}
                    categories={categories}
                  />
                  <ExpenseCharts
                    expenses={expenses}
                    categories={categories}
                  />
                </div>
              </AccordionItem>
            </Accordion>
          </div>
        )}

        {/* Insights Section - only show when there are at least 3 expenses */}
        {expenses.length >= 3 && (
          <InsightsPanel
            expenses={expenses}
            categories={categories}
          />
        )}

        {/* Budget Section */}
        {expenses.length > 0 && (
          <div className="mb-6 space-y-4">
            {/* Budget Progress */}
            <BudgetProgress expenses={expenses} categories={categories} />

            {/* Manage Budgets Button */}
            <Button
              variant="flat"
              color="primary"
              startContent={<Wallet className="w-4 h-4" aria-hidden="true" />}
              onPress={handleOpenBudgetManager}
              className="w-full"
            >
              Manage Budgets
            </Button>
          </div>
        )}
      </main>

      {/* Add/Edit Expense Modal */}
      <ExpenseForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSave={handleSaveExpense}
        expense={editingExpense}
        categories={categories}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingExpense}
        onClose={() => setDeletingExpense(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Expense"
        message={`Are you sure you want to delete "${deletingExpense?.description}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
      />

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp />

      {/* Settings Panel */}
      <SettingsPanel isOpen={isSettingsOpen} onClose={handleCloseSettings} />

      {/* Budget Manager */}
      <BudgetManager
        isOpen={isBudgetManagerOpen}
        onClose={handleCloseBudgetManager}
        categories={categories}
      />

      {/* Scroll Indicator */}
      <ScrollIndicator />
    </div>
  );
}
