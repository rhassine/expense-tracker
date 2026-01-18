import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getCurrencyByCode, getDefaultCurrency } from '@/lib/currencies';

/**
 * Application settings state shape
 */
export interface Settings {
  currency: string;
  locale: string;
}

/**
 * Settings store actions
 */
interface SettingsActions {
  setCurrency: (currency: string) => void;
  setLocale: (locale: string) => void;
}

/**
 * Combined settings store type
 */
type SettingsStore = Settings & SettingsActions;

/**
 * Default settings values
 */
const defaultCurrency = getDefaultCurrency();
const DEFAULT_SETTINGS: Settings = {
  currency: defaultCurrency.code,
  locale: defaultCurrency.locale,
};

/**
 * Zustand store for application settings with localStorage persistence
 */
export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      /**
       * Set the active currency
       * Also updates locale to match the currency's default locale
       * @param currency - Currency code (e.g., 'USD', 'EUR')
       */
      setCurrency: (currency: string): void => {
        const currencyConfig = getCurrencyByCode(currency);
        if (currencyConfig) {
          set({
            currency: currencyConfig.code,
            locale: currencyConfig.locale,
          });
        }
      },

      /**
       * Set the locale for number formatting
       * @param locale - Locale string (e.g., 'en-US', 'de-DE')
       */
      setLocale: (locale: string): void => {
        set({ locale });
      },
    }),
    {
      name: 'expense-tracker-settings',
      version: 1,
    }
  )
);
