'use client';

import { useMemo, useState, useEffect } from 'react';
import { Accordion, AccordionItem, Spinner } from '@heroui/react';
import { Sparkles } from 'lucide-react';
import { InsightCard } from './InsightCard';
import { generateInsights, type Insight } from '@/lib/insights';
import type { Expense, Category } from '@/types';

interface InsightsPanelProps {
  expenses: Expense[];
  categories: Category[];
}

/**
 * InsightsPanel component displays a collapsible container with automatically
 * generated insights based on expense data.
 */
export function InsightsPanel({ expenses, categories }: InsightsPanelProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [insights, setInsights] = useState<Insight[]>([]);

  // Generate insights with a simulated loading state for better UX
  useEffect(() => {
    setIsLoading(true);

    // Small delay to show loading state and prevent UI jank
    const timer = setTimeout(() => {
      const generatedInsights = generateInsights(expenses, categories);
      setInsights(generatedInsights);
      setIsLoading(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [expenses, categories]);

  // Count insights by type for subtitle
  const insightSummary = useMemo(() => {
    if (insights.length === 0) return 'No insights available';

    const counts: Record<string, number> = {};
    insights.forEach((insight) => {
      counts[insight.type] = (counts[insight.type] || 0) + 1;
    });

    const parts: string[] = [];
    if (counts.warning) parts.push(`${counts.warning} alert${counts.warning > 1 ? 's' : ''}`);
    if (counts.success) parts.push(`${counts.success} positive`);
    if (counts.tip) parts.push(`${counts.tip} tip${counts.tip > 1 ? 's' : ''}`);
    if (counts.info) parts.push(`${counts.info} info`);

    return parts.join(', ') || `${insights.length} insight${insights.length > 1 ? 's' : ''}`;
  }, [insights]);

  return (
    <div className="mb-6">
      <Accordion
        variant="bordered"
        className="px-0"
        itemClasses={{
          base: 'py-0',
          title: 'font-semibold text-base',
          trigger: 'py-4 data-[hover=true]:bg-default-100 rounded-lg px-4',
          content: 'pt-2 pb-4 px-4',
        }}
      >
        <AccordionItem
          key="insights"
          aria-label="Automatic Insights"
          startContent={
            <Sparkles className="w-5 h-5 text-primary" aria-hidden="true" />
          }
          title="Insights"
          subtitle={isLoading ? 'Analyzing your spending...' : insightSummary}
        >
          {isLoading ? (
            <div
              className="flex items-center justify-center py-8"
              role="status"
              aria-label="Loading insights"
            >
              <Spinner size="md" color="primary" />
              <span className="ml-3 text-default-500">
                Analyzing your spending patterns...
              </span>
            </div>
          ) : insights.length === 0 ? (
            <div className="text-center py-8 text-default-500">
              <p>Not enough data to generate insights yet.</p>
              <p className="text-sm mt-1">
                Keep logging expenses to see personalized recommendations.
              </p>
            </div>
          ) : (
            <div
              className="space-y-3"
              role="feed"
              aria-label="Spending insights"
            >
              {insights.map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          )}
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export default InsightsPanel;
