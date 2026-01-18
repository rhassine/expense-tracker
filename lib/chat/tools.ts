import type { Tool } from '@anthropic-ai/sdk/resources/messages';

/**
 * Claude tool definitions for expense operations
 */
export const chatTools: Tool[] = [
  {
    name: 'get_spending_summary',
    description:
      'Obtenir le total des dépenses pour une période donnée, optionnellement filtré par catégorie.',
    input_schema: {
      type: 'object' as const,
      properties: {
        period: {
          type: 'string',
          enum: ['today', 'this_week', 'this_month', 'last_month', 'all_time'],
          description: 'Période à analyser',
        },
        categoryId: {
          type: 'string',
          description: 'ID de catégorie optionnel pour filtrer',
        },
      },
      required: ['period'],
    },
  },
  {
    name: 'get_budget_status',
    description:
      "Vérifier l'état du budget pour une catégorie spécifique ou le budget total.",
    input_schema: {
      type: 'object' as const,
      properties: {
        categoryId: {
          type: 'string',
          description:
            'ID de catégorie (null ou omis pour le budget total)',
        },
      },
      required: [],
    },
  },
  {
    name: 'search_expenses',
    description: 'Rechercher des dépenses par description ou critères.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'Terme de recherche dans les descriptions',
        },
        categoryId: {
          type: 'string',
          description: 'Filtrer par catégorie',
        },
        minAmount: {
          type: 'number',
          description: 'Montant minimum',
        },
        maxAmount: {
          type: 'number',
          description: 'Montant maximum',
        },
        limit: {
          type: 'number',
          description: 'Nombre max de résultats (défaut: 10)',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_top_expenses',
    description: 'Obtenir les plus grosses dépenses sur une période.',
    input_schema: {
      type: 'object' as const,
      properties: {
        period: {
          type: 'string',
          enum: ['this_week', 'this_month', 'last_month', 'all_time'],
          description: 'Période à analyser',
        },
        limit: {
          type: 'number',
          description: 'Nombre de dépenses à retourner (défaut: 5)',
        },
      },
      required: ['period'],
    },
  },
  {
    name: 'get_category_breakdown',
    description:
      'Obtenir la répartition des dépenses par catégorie pour une période.',
    input_schema: {
      type: 'object' as const,
      properties: {
        period: {
          type: 'string',
          enum: ['this_week', 'this_month', 'last_month', 'all_time'],
          description: 'Période à analyser',
        },
      },
      required: ['period'],
    },
  },
  {
    name: 'create_expense',
    description:
      "Créer une nouvelle dépense. IMPORTANT: Utiliser UNIQUEMENT après confirmation explicite de l'utilisateur.",
    input_schema: {
      type: 'object' as const,
      properties: {
        amount: {
          type: 'number',
          description: 'Montant de la dépense (nombre positif)',
        },
        description: {
          type: 'string',
          description: 'Description de la dépense',
        },
        categoryId: {
          type: 'string',
          description: 'ID de la catégorie',
        },
        date: {
          type: 'string',
          description: 'Date au format YYYY-MM-DD',
        },
      },
      required: ['amount', 'description', 'categoryId', 'date'],
    },
  },
];

/**
 * Tool input types
 */
export interface GetSpendingSummaryInput {
  period: 'today' | 'this_week' | 'this_month' | 'last_month' | 'all_time';
  categoryId?: string;
}

export interface GetBudgetStatusInput {
  categoryId?: string;
}

export interface SearchExpensesInput {
  query?: string;
  categoryId?: string;
  minAmount?: number;
  maxAmount?: number;
  limit?: number;
}

export interface GetTopExpensesInput {
  period: 'this_week' | 'this_month' | 'last_month' | 'all_time';
  limit?: number;
}

export interface GetCategoryBreakdownInput {
  period: 'this_week' | 'this_month' | 'last_month' | 'all_time';
}

export interface CreateExpenseInput {
  amount: number;
  description: string;
  categoryId: string;
  date: string;
}
