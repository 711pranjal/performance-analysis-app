'use client';

import { PerformanceEntry } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { cn } from '@/lib/utils';
import { Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface HistoryTimelineProps {
  entries: PerformanceEntry[];
  onSelect: (entry: PerformanceEntry) => void;
  selectedId?: string;
  maxItems?: number;
}

export function HistoryTimeline({
  entries,
  onSelect,
  selectedId,
  maxItems = 10
}: HistoryTimelineProps) {
  const displayEntries = entries.slice(0, maxItems);

  const getScoreChange = (index: number) => {
    if (index >= displayEntries.length - 1) return null;

    const current = displayEntries[index].overallScore;
    const previous = displayEntries[index + 1].overallScore;
    const diff = current - previous;

    if (Math.abs(diff) < 1) {
      return { icon: Minus, color: 'text-muted-foreground', value: 0 };
    }

    return {
      icon: diff > 0 ? TrendingUp : TrendingDown,
      color: diff > 0 ? 'text-success' : 'text-destructive',
      value: diff,
    };
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-success';
    if (score >= 50) return 'bg-warning';
    return 'bg-destructive';
  };

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Analysis Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No analyses yet. Enter a URL to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Analysis Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-4">
            {displayEntries.map((entry, index) => {
              const scoreChange = getScoreChange(index);
              const isSelected = entry.id === selectedId;

              return (
                <div
                  key={entry.id}
                  className={cn(
                    'relative pl-10 cursor-pointer transition-all',
                    'hover:bg-secondary/30 rounded-lg p-2 -ml-2',
                    isSelected && 'bg-secondary/50'
                  )}
                  onClick={() => onSelect(entry)}
                >
                  {/* Timeline dot */}
                  <div
                    className={cn(
                      'absolute left-2.5 top-4 h-4 w-4 rounded-full border-2 border-background',
                      getScoreColor(entry.overallScore)
                    )}
                  />

                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-card-foreground truncate">
                        {entry.url}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'text-lg font-bold',
                          entry.overallScore >= 90 && 'text-success',
                          entry.overallScore >= 50 && entry.overallScore < 90 && 'text-warning',
                          entry.overallScore < 50 && 'text-destructive'
                        )}
                      >
                        {Math.round(entry.overallScore)}
                      </span>

                      {scoreChange && (
                        <div className={cn('flex items-center', scoreChange.color)}>
                          <scoreChange.icon className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick metrics */}
                  <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                    <span>LCP: {Math.round(entry.metrics.lcp || 0)}ms</span>
                    <span>CLS: {(entry.metrics.cls || 0).toFixed(2)}</span>
                    <span>TTFB: {Math.round(entry.metrics.ttfb || 0)}ms</span>
                  </div>
                </div>
              );
            })}
          </div>

          {entries.length > maxItems && (
            <p className="text-center text-sm text-muted-foreground mt-4 pt-4 border-t border-border">
              Showing {maxItems} of {entries.length} analyses
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
