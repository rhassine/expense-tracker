import { format, parseISO, isValid } from 'date-fns';

/**
 * Format a number as currency (USD by default)
 * @param amount - The numeric amount to format
 * @param currency - Currency code (default: 'USD')
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format an ISO date string to a human-readable format
 * @param dateString - ISO 8601 date string (YYYY-MM-DD)
 * @param formatString - date-fns format pattern (default: 'MMM d, yyyy')
 * @returns Formatted date string or empty string if invalid
 */
export function formatDate(
  dateString: string,
  formatString: string = 'MMM d, yyyy'
): string {
  const date = parseISO(dateString);
  if (!isValid(date)) {
    return '';
  }
  return format(date, formatString);
}

/**
 * Format a date for display in relative terms or absolute date
 * @param dateString - ISO 8601 date string
 * @returns Formatted date string (e.g., "Today", "Yesterday", or "Jan 15, 2024")
 */
export function formatDateRelative(dateString: string): string {
  const date = parseISO(dateString);
  if (!isValid(date)) {
    return '';
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const inputDate = new Date(date);
  inputDate.setHours(0, 0, 0, 0);

  if (inputDate.getTime() === today.getTime()) {
    return 'Today';
  }

  if (inputDate.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  }

  return format(date, 'MMM d, yyyy');
}

/**
 * Get the current date in ISO 8601 format (YYYY-MM-DD)
 * @returns Current date string
 */
export function getCurrentDateISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Get the current timestamp in ISO 8601 format
 * @returns Current timestamp string
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}
