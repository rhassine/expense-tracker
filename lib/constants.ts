import { Category } from '@/types';

/**
 * Default expense categories with associated icons and colors
 * Icons reference Lucide React icon names
 */
export const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Food & Dining', icon: 'Utensils', color: '#f97316' },
  { id: '2', name: 'Transportation', icon: 'Car', color: '#3b82f6' },
  { id: '3', name: 'Shopping', icon: 'ShoppingBag', color: '#ec4899' },
  { id: '4', name: 'Entertainment', icon: 'Film', color: '#8b5cf6' },
  { id: '5', name: 'Bills & Utilities', icon: 'FileText', color: '#ef4444' },
  { id: '6', name: 'Healthcare', icon: 'Heart', color: '#10b981' },
  { id: '7', name: 'Travel', icon: 'Plane', color: '#06b6d4' },
  { id: '8', name: 'Other', icon: 'MoreHorizontal', color: '#6b7280' },
];
