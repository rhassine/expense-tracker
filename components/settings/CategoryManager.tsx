'use client';

import { useState, useCallback, useMemo } from 'react';
import type { Selection } from '@heroui/react';
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
  Card,
  CardBody,
} from '@heroui/react';
import {
  Plus,
  Pencil,
  Trash2,
  Utensils,
  Car,
  ShoppingBag,
  Film,
  FileText,
  Heart,
  Plane,
  Home,
  Briefcase,
  Gift,
  Coffee,
  Music,
  Book,
  Gamepad,
  Shirt,
} from 'lucide-react';
import { useCategoryStore } from '@/store/category-store';
import { DEFAULT_CATEGORIES } from '@/lib/constants';
import type { Category } from '@/types';

/**
 * Available icons for category selection
 */
const AVAILABLE_ICONS = [
  'Utensils',
  'Car',
  'ShoppingBag',
  'Film',
  'FileText',
  'Heart',
  'Plane',
  'Home',
  'Briefcase',
  'Gift',
  'Coffee',
  'Music',
  'Book',
  'Gamepad',
  'Shirt',
] as const;

/**
 * Icon component mapping
 */
const IconComponents: Record<string, React.ComponentType<{ className?: string }>> = {
  Utensils,
  Car,
  ShoppingBag,
  Film,
  FileText,
  Heart,
  Plane,
  Home,
  Briefcase,
  Gift,
  Coffee,
  Music,
  Book,
  Gamepad,
  Shirt,
};

/**
 * Available color palette for categories
 */
const COLORS = [
  '#f97316',
  '#3b82f6',
  '#ec4899',
  '#8b5cf6',
  '#ef4444',
  '#10b981',
  '#06b6d4',
  '#6b7280',
  '#f59e0b',
  '#84cc16',
];

/**
 * Render a Lucide icon by name
 */
function DynamicIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const IconComponent = IconComponents[name];
  if (!IconComponent) {
    return null;
  }
  return <IconComponent className={className} />;
}

/**
 * Form data shape for category creation/editing
 */
interface CategoryFormData {
  name: string;
  icon: string;
  color: string;
}

/**
 * Initial form state
 */
const INITIAL_FORM_DATA: CategoryFormData = {
  name: '',
  icon: 'Utensils',
  color: COLORS[0],
};

/**
 * CategoryManager component for managing custom expense categories
 * Displays default categories (non-editable) and custom categories (editable)
 */
export function CategoryManager() {
  const { customCategories, addCategory, updateCategory, deleteCategory } =
    useCategoryStore();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>(INITIAL_FORM_DATA);
  const [formErrors, setFormErrors] = useState<Partial<CategoryFormData>>({});

  // Combine default and custom categories for display
  const allCategories = useMemo(() => {
    return [
      ...DEFAULT_CATEGORIES.map((cat) => ({ ...cat, isDefault: true })),
      ...customCategories.map((cat) => ({ ...cat, isDefault: false })),
    ];
  }, [customCategories]);

  /**
   * Open modal for adding a new category
   */
  const handleAddClick = useCallback(() => {
    setEditingCategory(null);
    setFormData(INITIAL_FORM_DATA);
    setFormErrors({});
    setIsModalOpen(true);
  }, []);

  /**
   * Open modal for editing an existing category
   */
  const handleEditClick = useCallback((category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      icon: category.icon,
      color: category.color,
    });
    setFormErrors({});
    setIsModalOpen(true);
  }, []);

  /**
   * Handle category deletion with confirmation
   */
  const handleDeleteClick = useCallback(
    (category: Category) => {
      if (
        window.confirm(
          `Are you sure you want to delete "${category.name}"? This action cannot be undone.`
        )
      ) {
        deleteCategory(category.id);
      }
    },
    [deleteCategory]
  );

  /**
   * Close the modal and reset form state
   */
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData(INITIAL_FORM_DATA);
    setFormErrors({});
  }, []);

  /**
   * Validate form data
   */
  const validateForm = useCallback((): boolean => {
    const errors: Partial<CategoryFormData> = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length > 50) {
      errors.name = 'Name must be 50 characters or less';
    }

    if (!formData.icon) {
      errors.icon = 'Icon is required';
    }

    if (!formData.color) {
      errors.color = 'Color is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  /**
   * Handle form submission (add or update)
   */
  const handleSubmit = useCallback(() => {
    if (!validateForm()) {
      return;
    }

    const categoryData = {
      name: formData.name.trim(),
      icon: formData.icon,
      color: formData.color,
    };

    if (editingCategory) {
      updateCategory(editingCategory.id, categoryData);
    } else {
      addCategory(categoryData);
    }

    handleCloseModal();
  }, [
    formData,
    editingCategory,
    validateForm,
    addCategory,
    updateCategory,
    handleCloseModal,
  ]);

  /**
   * Handle icon selection change
   */
  const handleIconChange = useCallback((keys: Selection) => {
    if (keys === 'all') return;
    const selectedKey = Array.from(keys)[0];
    if (selectedKey) {
      setFormData((prev) => ({ ...prev, icon: String(selectedKey) }));
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* Header with Add button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Categories</h3>
        <Button
          color="primary"
          size="sm"
          startContent={<Plus className="w-4 h-4" aria-hidden="true" />}
          onPress={handleAddClick}
        >
          Add Category
        </Button>
      </div>

      {/* Categories list */}
      <div className="space-y-2">
        {allCategories.map((category) => (
          <Card
            key={category.id}
            className="border border-divider"
            shadow="none"
          >
            <CardBody className="py-3 px-4">
              <div className="flex items-center justify-between">
                {/* Category info */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <DynamicIcon
                      name={category.icon}
                      className="w-5 h-5"
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {category.name}
                    </p>
                    {category.isDefault && (
                      <span className="text-xs text-default-400">Default</span>
                    )}
                  </div>
                </div>

                {/* Actions (only for custom categories) */}
                {!category.isDefault && (
                  <div className="flex items-center gap-1">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onPress={() => handleEditClick(category)}
                      aria-label={`Edit ${category.name}`}
                    >
                      <Pencil className="w-4 h-4" aria-hidden="true" />
                    </Button>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      color="danger"
                      onPress={() => handleDeleteClick(category)}
                      aria-label={`Delete ${category.name}`}
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </Button>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Add/Edit Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        placement="center"
        backdrop="blur"
        classNames={{
          base: 'max-w-md',
          header: 'border-b border-divider',
          body: 'py-6',
          footer: 'border-t border-divider',
        }}
      >
        <ModalContent>
          <ModalHeader>
            {editingCategory ? 'Edit Category' : 'Add Category'}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-6">
              {/* Name input */}
              <Input
                label="Name"
                placeholder="Enter category name"
                value={formData.name}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, name: value }))
                }
                isInvalid={!!formErrors.name}
                errorMessage={formErrors.name}
                maxLength={50}
                isRequired
              />

              {/* Icon select */}
              <Select
                label="Icon"
                placeholder="Select an icon"
                selectedKeys={new Set([formData.icon])}
                onSelectionChange={handleIconChange}
                isInvalid={!!formErrors.icon}
                errorMessage={formErrors.icon}
                isRequired
                renderValue={(items) => {
                  const selected = items[0];
                  if (!selected) return null;
                  return (
                    <div className="flex items-center gap-2">
                      <DynamicIcon
                        name={String(selected.key)}
                        className="w-4 h-4"
                        aria-hidden="true"
                      />
                      <span>{selected.key}</span>
                    </div>
                  );
                }}
              >
                {AVAILABLE_ICONS.map((iconName) => (
                  <SelectItem key={iconName} textValue={iconName}>
                    <div className="flex items-center gap-2">
                      <DynamicIcon
                        name={iconName}
                        className="w-4 h-4"
                        aria-hidden="true"
                      />
                      <span>{iconName}</span>
                    </div>
                  </SelectItem>
                ))}
              </Select>

              {/* Color picker */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Color <span className="text-danger">*</span>
                </label>
                <div
                  className="flex flex-wrap gap-2"
                  role="radiogroup"
                  aria-label="Select category color"
                >
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, color }))
                      }
                      className={`w-8 h-8 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
                        formData.color === color
                          ? 'ring-2 ring-offset-2 ring-primary scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                      aria-label={`Color ${color}`}
                      aria-checked={formData.color === color}
                      role="radio"
                    />
                  ))}
                </div>
                {formErrors.color && (
                  <p className="text-xs text-danger">{formErrors.color}</p>
                )}
              </div>

              {/* Preview */}
              <div className="p-4 rounded-lg bg-content2 border border-divider">
                <p className="text-sm text-default-500 mb-2">Preview</p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${formData.color}20` }}
                  >
                    <DynamicIcon
                      name={formData.icon}
                      className="w-5 h-5"
                      aria-hidden="true"
                    />
                  </div>
                  <span className="font-medium">
                    {formData.name || 'Category Name'}
                  </span>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={handleCloseModal}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleSubmit}>
              {editingCategory ? 'Save Changes' : 'Add Category'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
