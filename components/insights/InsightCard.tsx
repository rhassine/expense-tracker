'use client';

import { Card, CardBody } from '@heroui/react';
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  Info,
  Calendar,
  LucideIcon,
} from 'lucide-react';
import type { Insight } from '@/lib/insights';

/**
 * Map of icon names to Lucide components
 */
const iconMap: Record<string, LucideIcon> = {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  Info,
  Calendar,
};

/**
 * Color configurations for each insight type
 */
const typeStyles: Record<
  Insight['type'],
  {
    bg: string;
    border: string;
    iconBg: string;
    iconColor: string;
    titleColor: string;
  }
> = {
  info: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800',
    iconBg: 'bg-blue-100 dark:bg-blue-900/50',
    iconColor: 'text-blue-600 dark:text-blue-400',
    titleColor: 'text-blue-900 dark:text-blue-100',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800',
    iconBg: 'bg-amber-100 dark:bg-amber-900/50',
    iconColor: 'text-amber-600 dark:text-amber-400',
    titleColor: 'text-amber-900 dark:text-amber-100',
  },
  success: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-800',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    titleColor: 'text-emerald-900 dark:text-emerald-100',
  },
  tip: {
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    border: 'border-purple-200 dark:border-purple-800',
    iconBg: 'bg-purple-100 dark:bg-purple-900/50',
    iconColor: 'text-purple-600 dark:text-purple-400',
    titleColor: 'text-purple-900 dark:text-purple-100',
  },
};

interface InsightCardProps {
  insight: Insight;
}

/**
 * InsightCard component displays a single insight with icon, title, and description.
 * Color-coded by insight type for visual distinction.
 */
export function InsightCard({ insight }: InsightCardProps) {
  const IconComponent = iconMap[insight.icon] || Info;
  const styles = typeStyles[insight.type];

  return (
    <Card
      className={`${styles.bg} ${styles.border} border shadow-none`}
      role="article"
      aria-label={`${insight.type} insight: ${insight.title}`}
    >
      <CardBody className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon container */}
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-lg ${styles.iconBg} flex items-center justify-center`}
            aria-hidden="true"
          >
            <IconComponent className={`w-5 h-5 ${styles.iconColor}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold text-sm ${styles.titleColor}`}>
              {insight.title}
            </h3>
            <p className="text-sm text-default-600 mt-0.5 leading-relaxed">
              {insight.description}
            </p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export default InsightCard;
