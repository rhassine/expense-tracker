'use client';

import { useCallback, useMemo, forwardRef } from 'react';
import { Input, Select, SelectItem, Button, Chip } from '@heroui/react';
import { Search, Calendar, X, Tag } from 'lucide-react';
import { useTagStore } from '@/store/tag-store';
import type { Category, ExpenseFilters as ExpenseFiltersType, Tag as TagType } from '@/types';

interface ExpenseFiltersProps {
  filters: ExpenseFiltersType;
  onFiltersChange: (filters: ExpenseFiltersType) => void;
  categories: Category[];
}

/**
 * Ref type for ExpenseFilters - exposes the search input element
 */
export type ExpenseFiltersRef = HTMLInputElement | null;

// Type for select items including the "All" option
interface SelectOption {
  id: string;
  name: string;
  color: string | null;
}

/**
 * ExpenseFilters provides search and category filtering for expenses.
 * Responsive layout: stacked on mobile, horizontal row on desktop.
 *
 * Accepts a ref that will be forwarded to the search input element,
 * enabling keyboard shortcut focus functionality.
 */
const ExpenseFilters = forwardRef<ExpenseFiltersRef, ExpenseFiltersProps>(function ExpenseFilters(
  { filters, onFiltersChange, categories },
  ref
) {
  const { tags: allTags, getTagById } = useTagStore();

  // Handle search input changes
  const handleSearchChange = useCallback(
    (value: string) => {
      onFiltersChange({
        ...filters,
        search: value,
      });
    },
    [filters, onFiltersChange]
  );

  // Handle category selection changes
  const handleCategoryChange = useCallback(
    (keys: Set<string> | 'all') => {
      // HeroUI Select returns a Set of selected keys
      const selectedKey = keys === 'all' ? null : Array.from(keys)[0] || null;
      onFiltersChange({
        ...filters,
        categoryId: selectedKey === 'all' ? null : selectedKey,
      });
    },
    [filters, onFiltersChange]
  );

  // Handle date from change
  const handleDateFromChange = useCallback(
    (value: string) => {
      onFiltersChange({
        ...filters,
        dateFrom: value || null,
      });
    },
    [filters, onFiltersChange]
  );

  // Handle date to change
  const handleDateToChange = useCallback(
    (value: string) => {
      onFiltersChange({
        ...filters,
        dateTo: value || null,
      });
    },
    [filters, onFiltersChange]
  );

  // Clear both date filters
  const handleClearDates = useCallback(() => {
    onFiltersChange({
      ...filters,
      dateFrom: null,
      dateTo: null,
    });
  }, [filters, onFiltersChange]);

  // Handle tag selection changes
  const handleTagChange = useCallback(
    (keys: Set<string> | 'all') => {
      const selectedKeys = keys === 'all' ? [] : Array.from(keys);
      onFiltersChange({
        ...filters,
        tagIds: selectedKeys,
      });
    },
    [filters, onFiltersChange]
  );

  // Handle removing a single tag filter
  const handleRemoveTagFilter = useCallback(
    (tagId: string) => {
      onFiltersChange({
        ...filters,
        tagIds: filters.tagIds.filter((id) => id !== tagId),
      });
    },
    [filters, onFiltersChange]
  );

  // Check if any date filter is set
  const hasDateFilters = filters.dateFrom || filters.dateTo;

  // Get selected tag objects for display
  const selectedTagObjects = useMemo(() => {
    return filters.tagIds
      .map((id) => getTagById(id))
      .filter((tag): tag is TagType => tag !== undefined);
  }, [filters.tagIds, getTagById]);

  // Build select options with "All Categories" at the start
  const selectOptions: SelectOption[] = useMemo(() => {
    return [
      { id: 'all', name: 'All Categories', color: null },
      ...categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        color: cat.color,
      })),
    ];
  }, [categories]);

  // Determine the selected key for the Select component
  const selectedCategoryKey = filters.categoryId || 'all';

  return (
    <div
      className="flex flex-col gap-4 sm:flex-row sm:items-end"
      role="search"
      aria-label="Filter expenses"
    >
      {/* Search Input */}
      <div className="flex-1">
        <Input
          ref={ref}
          type="search"
          label="Search expenses"
          labelPlacement="outside"
          placeholder="Search by description..."
          value={filters.search}
          onValueChange={handleSearchChange}
          startContent={
            <Search
              className="pointer-events-none shrink-0 text-default-400"
              size={18}
              aria-hidden="true"
            />
          }
          classNames={{
            inputWrapper: 'bg-default-100',
          }}
          aria-describedby="search-description"
          isClearable
          onClear={() => handleSearchChange('')}
        />
        <span id="search-description" className="sr-only">
          Type to filter expenses by description
        </span>
      </div>

      {/* Category Filter */}
      <div className="w-full sm:w-48">
        <Select
          label="Category"
          labelPlacement="outside"
          placeholder="Select category"
          selectedKeys={new Set([selectedCategoryKey])}
          onSelectionChange={(keys) => handleCategoryChange(keys as Set<string>)}
          items={selectOptions}
          classNames={{
            trigger: 'bg-default-100',
          }}
          aria-label="Filter by category"
        >
          {(option) => (
            <SelectItem key={option.id} textValue={option.name}>
              <span className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor: option.color ?? undefined,
                  }}
                  aria-hidden="true"
                />
                {option.name}
              </span>
            </SelectItem>
          )}
        </Select>
      </div>

      {/* Tag Filter */}
      {allTags.length > 0 && (
        <div className="w-full sm:w-48">
          <Select
            label="Tags"
            labelPlacement="outside"
            placeholder="Filter by tags"
            selectedKeys={new Set(filters.tagIds)}
            onSelectionChange={(keys) => handleTagChange(keys as Set<string>)}
            selectionMode="multiple"
            classNames={{
              trigger: 'bg-default-100',
            }}
            aria-label="Filter by tags"
            startContent={
              <Tag
                className="pointer-events-none shrink-0 text-default-400"
                size={16}
                aria-hidden="true"
              />
            }
            renderValue={(items) => {
              if (items.length === 0) return null;
              return (
                <span className="text-sm">
                  {items.length} tag{items.length > 1 ? 's' : ''} selected
                </span>
              );
            }}
          >
            {allTags.map((tag) => (
              <SelectItem key={tag.id} textValue={tag.name}>
                <span className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: tag.color }}
                    aria-hidden="true"
                  />
                  {tag.name}
                </span>
              </SelectItem>
            ))}
          </Select>
        </div>
      )}

      {/* Date Range Filters */}
      <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:items-end">
        {/* Date From */}
        <div className="w-full sm:w-40">
          <Input
            type="date"
            label="From"
            labelPlacement="outside"
            placeholder="Start date"
            value={filters.dateFrom || ''}
            onValueChange={handleDateFromChange}
            max={filters.dateTo || undefined}
            startContent={
              <Calendar
                className="pointer-events-none shrink-0 text-default-400"
                size={18}
                aria-hidden="true"
              />
            }
            classNames={{
              inputWrapper: 'bg-default-100',
            }}
            aria-label="Filter from date"
          />
        </div>

        {/* Date To */}
        <div className="w-full sm:w-40">
          <Input
            type="date"
            label="To"
            labelPlacement="outside"
            placeholder="End date"
            value={filters.dateTo || ''}
            onValueChange={handleDateToChange}
            min={filters.dateFrom || undefined}
            startContent={
              <Calendar
                className="pointer-events-none shrink-0 text-default-400"
                size={18}
                aria-hidden="true"
              />
            }
            classNames={{
              inputWrapper: 'bg-default-100',
            }}
            aria-label="Filter to date"
          />
        </div>

        {/* Clear Dates Button */}
        {hasDateFilters && (
          <Button
            variant="flat"
            color="default"
            size="md"
            onPress={handleClearDates}
            startContent={<X size={16} aria-hidden="true" />}
            className="w-full sm:w-auto"
            aria-label="Clear date filters"
          >
            Clear dates
          </Button>
        )}
      </div>

      {/* Selected Tag Filters Display */}
      {selectedTagObjects.length > 0 && (
        <div className="flex w-full flex-wrap items-center gap-2 pt-2">
          <span className="text-sm text-default-500">Filtering by:</span>
          {selectedTagObjects.map((tag) => (
            <Chip
              key={tag.id}
              size="sm"
              variant="flat"
              onClose={() => handleRemoveTagFilter(tag.id)}
              style={{
                backgroundColor: `${tag.color}20`,
                color: tag.color,
              }}
              classNames={{
                closeButton: 'text-current hover:bg-current/20',
              }}
              aria-label={`Remove tag filter: ${tag.name}`}
            >
              {tag.name}
            </Chip>
          ))}
        </div>
      )}
    </div>
  );
});

export default ExpenseFilters;
