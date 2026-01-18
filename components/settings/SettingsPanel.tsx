'use client';

import { useMemo, useState } from 'react';
import type { Selection } from '@heroui/react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Select,
  SelectItem,
  Button,
  Tabs,
  Tab,
} from '@heroui/react';
import { Settings, Tag } from 'lucide-react';
import { useSettingsStore } from '@/store/settings-store';
import { CURRENCIES } from '@/lib/currencies';
import { formatCurrency } from '@/lib/utils';
import { CategoryManager } from './CategoryManager';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Settings panel modal for configuring application preferences
 * Currently supports currency selection with a live preview
 */
export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { currency, locale, setCurrency } = useSettingsStore();
  const [activeTab, setActiveTab] = useState<string>('general');

  // Sample amount for currency preview
  const previewAmount = 1234.56;

  // Formatted preview showing how amounts will appear
  const formattedPreview = useMemo(() => {
    return formatCurrency(previewAmount, currency, locale);
  }, [currency, locale]);

  const handleCurrencyChange = (keys: Selection) => {
    if (keys === 'all') return;
    const selectedKey = Array.from(keys)[0];
    if (selectedKey) {
      setCurrency(String(selectedKey));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      backdrop="blur"
      scrollBehavior="inside"
      classNames={{
        base: 'max-w-lg max-h-[85vh]',
        header: 'border-b border-divider',
        body: 'py-6',
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <Settings className="w-5 h-5" aria-hidden="true" />
          <span>Settings</span>
        </ModalHeader>
        <ModalBody>
          <Tabs
            aria-label="Settings sections"
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(String(key))}
            classNames={{
              tabList: 'gap-4 w-full',
              cursor: 'w-full',
              tab: 'px-4 h-10',
            }}
          >
            <Tab
              key="general"
              title={
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4" aria-hidden="true" />
                  <span>General</span>
                </div>
              }
            >
              <div className="space-y-6 pt-4">
                {/* Currency Selection */}
                <div className="space-y-2">
                  <label
                    htmlFor="currency-select"
                    className="text-sm font-medium text-foreground"
                  >
                    Currency
                  </label>
                  <Select
                    id="currency-select"
                    aria-label="Select currency"
                    selectedKeys={new Set([currency])}
                    onSelectionChange={handleCurrencyChange}
                    classNames={{
                      trigger: 'h-12',
                      value: 'text-sm',
                    }}
                    renderValue={(items) => {
                      const selected = items[0];
                      if (!selected) return null;
                      const currencyData = CURRENCIES.find(
                        (c) => c.code === selected.key
                      );
                      if (!currencyData) return null;
                      return (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{currencyData.symbol}</span>
                          <span>{currencyData.name}</span>
                          <span className="text-default-400">
                            ({currencyData.code})
                          </span>
                        </div>
                      );
                    }}
                  >
                    {CURRENCIES.map((curr) => (
                      <SelectItem
                        key={curr.code}
                        textValue={`${curr.name} (${curr.code})`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium w-6">{curr.symbol}</span>
                          <span>{curr.name}</span>
                          <span className="text-default-400">({curr.code})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                {/* Currency Preview */}
                <div className="p-4 rounded-lg bg-content2 border border-divider">
                  <p className="text-sm text-default-500 mb-2">Preview</p>
                  <p className="text-lg font-semibold" aria-live="polite">
                    {formattedPreview}
                  </p>
                  <p className="text-xs text-default-400 mt-1">
                    This is how amounts will appear throughout the app
                  </p>
                </div>
              </div>
            </Tab>

            <Tab
              key="categories"
              title={
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4" aria-hidden="true" />
                  <span>Categories</span>
                </div>
              }
            >
              <div className="pt-4">
                <CategoryManager />
              </div>
            </Tab>
          </Tabs>

          {/* Actions */}
          <div className="flex justify-end pt-4 border-t border-divider mt-4">
            <Button
              color="primary"
              onPress={onClose}
              className="font-medium"
            >
              Done
            </Button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

interface SettingsButtonProps {
  onPress: () => void;
}

/**
 * Settings button component for triggering the settings panel
 */
export function SettingsButton({ onPress }: SettingsButtonProps) {
  return (
    <Button
      isIconOnly
      variant="light"
      onPress={onPress}
      aria-label="Open settings"
      className="text-default-600 hover:text-foreground"
    >
      <Settings className="w-5 h-5" aria-hidden="true" />
    </Button>
  );
}
