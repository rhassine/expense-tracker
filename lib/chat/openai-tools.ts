import type { ChatCompletionTool } from 'openai/resources/chat/completions';

/**
 * OpenAI tool definitions for expense operations
 */
export const chatTools: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'get_spending_summary',
      description:
        'Obtenir le total des dépenses pour une période donnée, optionnellement filtré par catégorie.',
      parameters: {
        type: 'object',
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
  },
  {
    type: 'function',
    function: {
      name: 'get_budget_status',
      description:
        "Vérifier l'état du budget pour une catégorie spécifique ou le budget total.",
      parameters: {
        type: 'object',
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
  },
  {
    type: 'function',
    function: {
      name: 'search_expenses',
      description: 'Rechercher des dépenses par description ou critères.',
      parameters: {
        type: 'object',
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
  },
  {
    type: 'function',
    function: {
      name: 'get_top_expenses',
      description: 'Obtenir les plus grosses dépenses sur une période.',
      parameters: {
        type: 'object',
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
  },
  {
    type: 'function',
    function: {
      name: 'get_category_breakdown',
      description:
        'Obtenir la répartition des dépenses par catégorie pour une période.',
      parameters: {
        type: 'object',
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
  },
  {
    type: 'function',
    function: {
      name: 'create_expense',
      description:
        "Créer une nouvelle dépense. IMPORTANT: Utiliser UNIQUEMENT après confirmation explicite de l'utilisateur.",
      parameters: {
        type: 'object',
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
  },
];
