'use client';

import { Button } from '@heroui/react';
import { Download } from 'lucide-react';
import { exportToCSV } from '@/lib/export';
import { Expense, Category } from '@/types';

interface ExportButtonProps {
  expenses: Expense[];
  categories: Category[];
}

/**
 * Button component for exporting expenses to CSV format
 * Downloads a CSV file with expense data when clicked
 */
export function ExportButton({ expenses, categories }: ExportButtonProps) {
  const isEmpty = expenses.length === 0;

  const handleExport = () => {
    if (!isEmpty) {
      exportToCSV(expenses, categories);
    }
  };

  return (
    <Button
      variant="flat"
      color="default"
      onPress={handleExport}
      isDisabled={isEmpty}
      startContent={<Download className="h-4 w-4" aria-hidden="true" />}
      aria-label={
        isEmpty
          ? 'Export disabled: no expenses to export'
          : 'Export expenses to CSV file'
      }
    >
      Export CSV
    </Button>
  );
}
