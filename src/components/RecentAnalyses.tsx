'use client';

import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { PerformanceEntry } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

interface RecentAnalysesProps {
  entries: PerformanceEntry[];
  onSelect: (entry: PerformanceEntry) => void;
  onDelete: (id: string) => void;
  selectedId?: string;
}

export function RecentAnalyses({ entries, onSelect, onDelete, selectedId }: RecentAnalysesProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success bg-success/20';
    if (score >= 50) return 'text-warning bg-warning/20';
    return 'text-destructive bg-destructive/20';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Analyses</CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No analyses yet. Enter a URL above to get started.
          </p>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {entries.map((entry) => (
              <div
                key={entry.id}
                onClick={() => onSelect(entry)}
                className={cn(
                  'group flex items-center justify-between rounded-lg border border-border p-3 cursor-pointer transition-all hover:border-primary/50 hover:bg-secondary/30',
                  selectedId === entry.id && 'border-primary bg-secondary/50'
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold',
                      getScoreColor(entry.overallScore)
                    )}
                  >
                    {Math.round(entry.overallScore)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-card-foreground">
                      {entry.url}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(entry.url, '_blank');
                    }}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(entry.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
