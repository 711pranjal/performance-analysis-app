'use client';

import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Button } from './Button';
import {
  Play,
  RefreshCw,
  Download,
  GitCompare,
  Trash2,
  ExternalLink
} from 'lucide-react';

interface QuickActionsProps {
  onAnalyze?: () => void;
  onRefresh?: () => void;
  onExport?: () => void;
  onCompare?: () => void;
  onClearAll?: () => void;
  hasEntries: boolean;
  hasSelectedEntry: boolean;
}

export function QuickActions({
  onAnalyze,
  onRefresh,
  onExport,
  onCompare,
  onClearAll,
  hasEntries,
  hasSelectedEntry,
}: QuickActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {onAnalyze && (
            <Button
              variant="primary"
              size="sm"
              onClick={onAnalyze}
              className="justify-start"
            >
              <Play className="h-4 w-4" />
              New Analysis
            </Button>
          )}

          {onRefresh && hasSelectedEntry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="justify-start"
            >
              <RefreshCw className="h-4 w-4" />
              Re-analyze
            </Button>
          )}

          {onExport && hasSelectedEntry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="justify-start"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          )}

          {onCompare && hasEntries && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCompare}
              className="justify-start"
            >
              <GitCompare className="h-4 w-4" />
              Compare
            </Button>
          )}

          <a
            href="https://web.dev/vitals/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-start gap-2 rounded-lg border border-border bg-transparent px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Web Vitals
          </a>

          {onClearAll && hasEntries && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
              Clear All
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
