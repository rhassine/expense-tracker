/**
 * Chat-related TypeScript interfaces for the AI chatbot
 */

import type { Expense, Category } from './index';

/**
 * A single chat message
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isLoading?: boolean;
}

/**
 * Expense summary for chat context (lighter than full Expense)
 */
export interface ExpenseSummary {
  id: string;
  amount: number;
  description: string;
  categoryId: string;
  categoryName: string;
  date: string;
}

/**
 * Budget summary for chat context
 */
export interface BudgetSummary {
  categoryId: string | null;
  categoryName: string | null;
  amount: number;
  period: 'monthly' | 'weekly';
  spent: number;
  percentage: number;
  status: 'safe' | 'warning' | 'danger';
}

/**
 * Current period statistics
 */
export interface PeriodStats {
  monthlyTotal: number;
  weeklyTotal: number;
  todayTotal: number;
  transactionCount: number;
  topCategory: { id: string; name: string; amount: number } | null;
}

/**
 * Full context data sent to Claude
 */
export interface ChatContextData {
  expenses: ExpenseSummary[];
  categories: { id: string; name: string }[];
  budgets: BudgetSummary[];
  settings: {
    currency: string;
    locale: string;
  };
  stats: PeriodStats;
  today: string;
}

/**
 * Request body for the chat API
 */
export interface ChatRequest {
  message: string;
  context: ChatContextData;
  history: ChatMessage[];
}

/**
 * Response from the chat API
 */
export interface ChatResponse {
  response: string;
  createdExpense?: {
    amount: number;
    description: string;
    categoryId: string;
    categoryName: string;
    date: string;
  };
}

/**
 * Tool call result
 */
export interface ToolResult {
  toolName: string;
  result: unknown;
  isError: boolean;
}
