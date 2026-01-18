/**
 * Core TypeScript interfaces for the Expense Tracker application
 */

/**
 * Represents a single expense entry
 */
export interface Expense {
  id: string;
  amount: number;
  description: string;
  categoryId: string;
  date: string; // ISO 8601 format (YYYY-MM-DD)
  tags?: string[]; // Array of tag IDs
  createdAt: string;
  updatedAt: string;
}

/**
 * Represents a tag/label for expenses
 */
export interface Tag {
  id: string;
  name: string;
  color: string; // Hex color code
}

/**
 * Represents an expense category with visual attributes
 */
export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  color: string; // Hex color code
}

/**
 * Filter criteria for expense queries
 */
export interface ExpenseFilters {
  search: string;
  categoryId: string | null;
  dateFrom: string | null; // ISO format YYYY-MM-DD
  dateTo: string | null; // ISO format YYYY-MM-DD
  tagIds: string[]; // Array of tag IDs to filter by
}
