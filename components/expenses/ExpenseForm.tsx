'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  SelectItem,
  Button,
} from '@heroui/react';
import { format } from 'date-fns';
import type { Expense, Category } from '@/types';
import TagInput from '@/components/ui/TagInput';

interface ExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => void;
  expense?: Expense;
  categories: Category[];
}

interface FormData {
  amount: string;
  description: string;
  categoryId: string;
  date: string;
  tags: string[];
}

interface FormErrors {
  amount?: string;
  description?: string;
  categoryId?: string;
  date?: string;
}

function getInitialFormData(
  expense: Expense | undefined,
  categories: Category[]
): FormData {
  if (expense) {
    return {
      amount: expense.amount.toString(),
      description: expense.description,
      categoryId: expense.categoryId,
      date: expense.date,
      tags: expense.tags ?? [],
    };
  }

  return {
    amount: '',
    description: '',
    categoryId: categories[0]?.id ?? '',
    date: format(new Date(), 'yyyy-MM-dd'),
    tags: [],
  };
}

export default function ExpenseForm({
  isOpen,
  onClose,
  onSave,
  expense,
  categories,
}: ExpenseFormProps) {
  const [formData, setFormData] = useState<FormData>(() =>
    getInitialFormData(expense, categories)
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const isEditing = Boolean(expense);

  // Reset form when modal opens or expense changes
  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData(expense, categories));
      setErrors({});
      setTouched({});
    }
  }, [isOpen, expense, categories]);

  const validateField = useCallback(
    (name: keyof FormData, value: string): string | undefined => {
      switch (name) {
        case 'amount': {
          if (!value.trim()) {
            return 'Amount is required';
          }
          const numValue = parseFloat(value);
          if (isNaN(numValue) || numValue < 0.01) {
            return 'Amount must be at least $0.01';
          }
          return undefined;
        }
        case 'description': {
          if (!value.trim()) {
            return 'Description is required';
          }
          if (value.trim().length < 2) {
            return 'Description must be at least 2 characters';
          }
          return undefined;
        }
        case 'categoryId': {
          if (!value) {
            return 'Category is required';
          }
          return undefined;
        }
        case 'date': {
          if (!value) {
            return 'Date is required';
          }
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (!dateRegex.test(value)) {
            return 'Invalid date format';
          }
          return undefined;
        }
        default:
          return undefined;
      }
    },
    []
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Validate only string fields (not tags)
    const fieldsToValidate: Array<Exclude<keyof FormData, 'tags'>> = ['amount', 'description', 'categoryId', 'date'];
    fieldsToValidate.forEach((key) => {
      const error = validateField(key, formData[key] as string);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [formData, validateField]);

  const handleInputChange = (name: keyof FormData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing (if field was touched and has validation)
    if (name !== 'tags' && touched[name] && errors[name as keyof FormErrors] && typeof value === 'string') {
      const error = validateField(name as Exclude<keyof FormData, 'tags'>, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (name: Exclude<keyof FormData, 'tags'>) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name] as string);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = () => {
    // Mark all fields as touched
    setTouched({
      amount: true,
      description: true,
      categoryId: true,
      date: true,
    });

    if (!validateForm()) {
      return;
    }

    const expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'> = {
      amount: parseFloat(formData.amount),
      description: formData.description.trim(),
      categoryId: formData.categoryId,
      date: formData.date,
      tags: formData.tags.length > 0 ? formData.tags : undefined,
    };

    onSave(expenseData);
    handleClose();
  };

  const handleClose = () => {
    setFormData(getInitialFormData(undefined, categories));
    setErrors({});
    setTouched({});
    onClose();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      placement="center"
      backdrop="blur"
      classNames={{
        base: 'max-w-md',
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 id="expense-form-title">
            {isEditing ? 'Edit Expense' : 'Add Expense'}
          </h2>
        </ModalHeader>

        <ModalBody>
          <form
            className="flex flex-col gap-4"
            onKeyDown={handleKeyDown}
            aria-labelledby="expense-form-title"
          >
            {/* Amount Field */}
            <Input
              type="number"
              label="Amount"
              placeholder="0.00"
              value={formData.amount}
              onValueChange={(value) => handleInputChange('amount', value)}
              onBlur={() => handleBlur('amount')}
              isInvalid={touched.amount && Boolean(errors.amount)}
              errorMessage={touched.amount ? errors.amount : undefined}
              isRequired
              step="0.01"
              min="0.01"
              startContent={
                <span className="text-default-400 text-sm" aria-hidden="true">
                  $
                </span>
              }
              classNames={{
                input: 'text-right',
              }}
              aria-describedby={
                touched.amount && errors.amount ? 'amount-error' : undefined
              }
            />

            {/* Description Field */}
            <Input
              type="text"
              label="Description"
              placeholder="What did you spend on?"
              value={formData.description}
              onValueChange={(value) => handleInputChange('description', value)}
              onBlur={() => handleBlur('description')}
              isInvalid={touched.description && Boolean(errors.description)}
              errorMessage={touched.description ? errors.description : undefined}
              isRequired
              aria-describedby={
                touched.description && errors.description
                  ? 'description-error'
                  : undefined
              }
            />

            {/* Category Select */}
            <Select
              label="Category"
              placeholder="Select a category"
              selectedKeys={formData.categoryId ? [formData.categoryId] : []}
              onSelectionChange={(keys) => {
                const selectedKey = Array.from(keys)[0] as string;
                handleInputChange('categoryId', selectedKey ?? '');
              }}
              onBlur={() => handleBlur('categoryId')}
              isInvalid={touched.categoryId && Boolean(errors.categoryId)}
              errorMessage={touched.categoryId ? errors.categoryId : undefined}
              isRequired
              aria-describedby={
                touched.categoryId && errors.categoryId
                  ? 'category-error'
                  : undefined
              }
              classNames={{
                trigger: 'min-h-12',
              }}
            >
              {categories.map((category) => (
                <SelectItem
                  key={category.id}
                  textValue={category.name}
                  startContent={
                    <span
                      className="inline-block h-3 w-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: category.color }}
                      aria-hidden="true"
                    />
                  }
                >
                  {category.name}
                </SelectItem>
              ))}
            </Select>

            {/* Date Field */}
            <Input
              type="date"
              label="Date"
              value={formData.date}
              onValueChange={(value) => handleInputChange('date', value)}
              onBlur={() => handleBlur('date')}
              isInvalid={touched.date && Boolean(errors.date)}
              errorMessage={touched.date ? errors.date : undefined}
              isRequired
              aria-describedby={
                touched.date && errors.date ? 'date-error' : undefined
              }
            />

            {/* Tags Field */}
            <TagInput
              selectedTags={formData.tags}
              onChange={(tags) => handleInputChange('tags', tags)}
            />
          </form>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="flat"
            onPress={handleClose}
            aria-label="Cancel and close form"
          >
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            aria-label={isEditing ? 'Save changes' : 'Add expense'}
          >
            {isEditing ? 'Save Changes' : 'Add Expense'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
