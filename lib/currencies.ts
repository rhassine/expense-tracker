/**
 * Currency configuration for the expense tracker
 */
export interface Currency {
  code: string;
  symbol: string;
  name: string;
  locale: string;
}

/**
 * Supported currencies with their display information and default locales
 */
export const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  { code: 'EUR', symbol: '\u20AC', name: 'Euro', locale: 'de-DE' },
  { code: 'GBP', symbol: '\u00A3', name: 'British Pound', locale: 'en-GB' },
  { code: 'JPY', symbol: '\u00A5', name: 'Japanese Yen', locale: 'ja-JP' },
  { code: 'CAD', symbol: '$', name: 'Canadian Dollar', locale: 'en-CA' },
  { code: 'AUD', symbol: '$', name: 'Australian Dollar', locale: 'en-AU' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc', locale: 'de-CH' },
];

/**
 * Get currency configuration by code
 * @param code - Currency code (e.g., 'USD', 'EUR')
 * @returns Currency object or undefined if not found
 */
export function getCurrencyByCode(code: string): Currency | undefined {
  return CURRENCIES.find((currency) => currency.code === code);
}

/**
 * Get the default currency (USD)
 * @returns Default currency configuration
 */
export function getDefaultCurrency(): Currency {
  return CURRENCIES[0];
}
