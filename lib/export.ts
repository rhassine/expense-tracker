import { Expense, Category } from '@/types';
import { format } from 'date-fns';

/**
 * Escape a value for CSV format
 * - Wraps in quotes if contains comma, quote, or newline
 * - Doubles any existing quotes
 * @param value - The string value to escape
 * @returns CSV-safe escaped string
 */
function escapeCSVValue(value: string): string {
  const needsQuoting = /[,"\n\r]/.test(value);
  if (needsQuoting) {
    // Double any existing quotes and wrap in quotes
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Convert expenses to CSV format and trigger browser download
 * @param expenses - Array of expense objects to export
 * @param categories - Array of category objects for name lookup
 */
export function exportToCSV(expenses: Expense[], categories: Category[]): void {
  // Create a map for efficient category lookup
  const categoryMap = new Map<string, string>(
    categories.map((cat) => [cat.id, cat.name])
  );

  // CSV header row
  const headers = ['Date', 'Description', 'Category', 'Amount'];
  const headerRow = headers.join(',');

  // Convert expenses to CSV rows
  const dataRows = expenses.map((expense) => {
    const categoryName = categoryMap.get(expense.categoryId) || 'Unknown';
    const row = [
      escapeCSVValue(expense.date),
      escapeCSVValue(expense.description),
      escapeCSVValue(categoryName),
      expense.amount.toFixed(2),
    ];
    return row.join(',');
  });

  // Combine header and data rows
  const csvContent = [headerRow, ...dataRows].join('\n');

  // Create blob and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  // Generate filename with current date
  const dateStr = format(new Date(), 'yyyy-MM-dd');
  const filename = `expenses-${dateStr}.csv`;

  // Create temporary link and trigger download
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
