'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Card, CardHeader, CardBody, CardFooter, Button } from '@heroui/react';
import { X, Trash2, Bot } from 'lucide-react';
import { useChatStore } from '@/store/chat-store';
import { useExpenseStore } from '@/store/expense-store';
import { useCategoryStore } from '@/store/category-store';
import { useBudgetStore } from '@/store/budget-store';
import { useSettingsStore } from '@/store/settings-store';
import { getSpendingForPeriod, getBudgetStatus } from '@/lib/budget-utils';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import type { ChatContextData, ExpenseSummary, BudgetSummary, PeriodStats } from '@/types/chat';

/**
 * Build chat context from stores
 */
function useChatContext(): ChatContextData {
  const expenses = useExpenseStore((state) => state.expenses);
  const getAllCategories = useCategoryStore((state) => state.getAllCategories);
  const budgets = useBudgetStore((state) => state.budgets);
  const { currency, locale } = useSettingsStore();

  const categories = getAllCategories();
  const today = new Date().toISOString().split('T')[0];

  // Build expense summaries
  const expenseSummaries: ExpenseSummary[] = expenses.map((e) => ({
    id: e.id,
    amount: e.amount,
    description: e.description,
    categoryId: e.categoryId,
    categoryName: categories.find((c) => c.id === e.categoryId)?.name || 'Autre',
    date: e.date,
  }));

  // Build budget summaries
  const budgetSummaries: BudgetSummary[] = budgets.map((b) => {
    const spent = getSpendingForPeriod(expenses, b.categoryId, b.period);
    const { percentage, status } = getBudgetStatus(spent, b.amount);
    return {
      categoryId: b.categoryId,
      categoryName: b.categoryId
        ? categories.find((c) => c.id === b.categoryId)?.name || null
        : null,
      amount: b.amount,
      period: b.period,
      spent,
      percentage,
      status,
    };
  });

  // Calculate stats
  const monthlyTotal = getSpendingForPeriod(expenses, null, 'monthly');
  const weeklyTotal = getSpendingForPeriod(expenses, null, 'weekly');
  const todayExpenses = expenses.filter((e) => e.date === today);
  const todayTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
  const monthExpenses = expenses.filter((e) => e.date.startsWith(today.slice(0, 7)));

  // Calculate top category
  const categoryTotals = new Map<string, number>();
  for (const e of monthExpenses) {
    categoryTotals.set(e.categoryId, (categoryTotals.get(e.categoryId) || 0) + e.amount);
  }
  let topCategory: PeriodStats['topCategory'] = null;
  let topAmount = 0;
  for (const [catId, amount] of categoryTotals) {
    if (amount > topAmount) {
      topAmount = amount;
      const cat = categories.find((c) => c.id === catId);
      topCategory = { id: catId, name: cat?.name || 'Autre', amount };
    }
  }

  const stats: PeriodStats = {
    monthlyTotal,
    weeklyTotal,
    todayTotal,
    transactionCount: monthExpenses.length,
    topCategory,
  };

  return {
    expenses: expenseSummaries,
    categories: categories.map((c) => ({ id: c.id, name: c.name })),
    budgets: budgetSummaries,
    settings: { currency, locale },
    stats,
    today,
  };
}

/**
 * Slide-out chat panel
 */
export function ChatPanel() {
  const { isOpen, closeChat, messages, isLoading, error, addMessage, updateMessage, setLoading, setError, clearHistory } = useChatStore();
  const addExpense = useExpenseStore((state) => state.addExpense);
  const context = useChatContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle send message
  const handleSend = useCallback(
    async (content: string) => {
      // Add user message
      addMessage({ role: 'user', content });

      // Add loading message
      const loadingId = addMessage({
        role: 'assistant',
        content: '',
        isLoading: true,
      });

      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-session-id': 'user-session',
          },
          body: JSON.stringify({
            message: content,
            context,
            history: messages.filter((m) => !m.isLoading),
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Erreur de communication');
        }

        const data = await response.json();

        // If expense was created, add it to the store
        if (data.createdExpense) {
          addExpense({
            amount: data.createdExpense.amount,
            description: data.createdExpense.description,
            categoryId: data.createdExpense.categoryId,
            date: data.createdExpense.date,
          });
        }

        // Update loading message with response
        updateMessage(loadingId, {
          content: data.response,
          isLoading: false,
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Une erreur est survenue';
        setError(errorMessage);

        // Update loading message with error
        updateMessage(loadingId, {
          content: `Désolé, ${errorMessage.toLowerCase()}`,
          isLoading: false,
        });
      } finally {
        setLoading(false);
      }
    },
    [context, messages, addMessage, updateMessage, setLoading, setError, addExpense]
  );

  // Handle keyboard shortcut to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeChat();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeChat]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40 sm:hidden"
        onClick={closeChat}
        aria-hidden="true"
      />

      {/* Panel */}
      <Card
        className="fixed bottom-0 right-0 w-full h-[85vh] sm:bottom-6 sm:right-6 sm:w-[400px] sm:h-[600px] sm:rounded-xl z-50 flex flex-col shadow-2xl"
        role="dialog"
        aria-label="Assistant de dépenses"
      >
        {/* Header */}
        <CardHeader className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-divider">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot size={18} className="text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Assistant Dépenses</h2>
              <p className="text-xs text-default-400">Posez vos questions</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={clearHistory}
              aria-label="Effacer l'historique"
            >
              <Trash2 size={16} />
            </Button>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={closeChat}
              aria-label="Fermer le chat"
            >
              <X size={18} />
            </Button>
          </div>
        </CardHeader>

        {/* Messages */}
        <CardBody className="flex-1 overflow-y-auto p-4 space-y-4" role="list">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Bot size={32} className="text-primary" />
              </div>
              <h3 className="font-medium mb-2">Bonjour ! 👋</h3>
              <p className="text-sm text-default-500 mb-4">
                Je suis votre assistant dépenses. Je peux répondre à vos questions,
                vous donner des conseils et même ajouter des dépenses pour vous.
              </p>
              <div className="space-y-2 text-left w-full">
                <p className="text-xs text-default-400">Exemples :</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Combien ce mois ?',
                    'Ma plus grosse dépense',
                    'Ajoute 20€ café',
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSend(suggestion)}
                      className="text-xs bg-default-100 hover:bg-default-200 px-3 py-1.5 rounded-full transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))
          )}
          <div ref={messagesEndRef} />
        </CardBody>

        {/* Input */}
        <CardFooter className="flex-shrink-0 border-t border-divider px-4 py-3">
          <ChatInput onSend={handleSend} isLoading={isLoading} />
        </CardFooter>
      </Card>
    </>
  );
}
