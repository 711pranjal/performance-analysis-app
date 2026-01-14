'use client';

import { Card } from './Card';
import { cn } from '@/lib/utils';
import { getMetricRating, METRIC_THRESHOLDS } from '@/types';
import { formatMetricValue, getRatingColor, getRatingBgColor } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  name: string;
  fullName: string;
  value: number;
  previousValue?: number;
  description: string;
}

export function MetricCard({ name, fullName, value, previousValue, description }: MetricCardProps) {
  const rating = getMetricRating(name, value);
  const threshold = METRIC_THRESHOLDS[name];

  const getTrend = () => {
    if (!previousValue) return null;
    const diff = value - previousValue;
    const percentChange = ((diff / previousValue) * 100).toFixed(1);

    // For CLS, lower is better, so we invert the trend
    const isImprovement = name === 'CLS' ? diff < 0 : diff < 0;

    if (Math.abs(diff) < 0.01 * previousValue) {
      return { icon: Minus, color: 'text-muted-foreground', text: 'No change' };
    }

    return {
      icon: isImprovement ? TrendingDown : TrendingUp,
      color: isImprovement ? 'text-success' : 'text-destructive',
      text: `${isImprovement ? '' : '+'}${percentChange}%`,
    };
  };

  const trend = getTrend();

  return (
    <Card hover className={cn('border-l-4', getRatingBgColor(rating))}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{fullName}</p>
          <p className={cn('text-3xl font-bold', getRatingColor(rating))}>
            {formatMetricValue(name, value)}
          </p>
        </div>
        <span
          className={cn(
            'rounded-full px-2 py-1 text-xs font-medium uppercase',
            getRatingBgColor(rating),
            getRatingColor(rating)
          )}
        >
          {rating.replace('-', ' ')}
        </span>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">{description}</p>

      {threshold && (
        <div className="mt-3 flex gap-4 text-xs">
          <span className="text-success">Good: ≤{name === 'CLS' ? threshold.good : `${threshold.good}ms`}</span>
          <span className="text-warning">Moderate: ≤{name === 'CLS' ? threshold.needsImprovement : `${threshold.needsImprovement}ms`}</span>
        </div>
      )}

      {trend && (
        <div className={cn('mt-3 flex items-center gap-1 text-sm', trend.color)}>
          <trend.icon className="h-4 w-4" />
          <span>{trend.text}</span>
        </div>
      )}
    </Card>
  );
}
