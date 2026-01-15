'use client';

import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { PerformanceEntry, METRIC_THRESHOLDS } from '@/types';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface PerformanceBudgetProps {
  entry: PerformanceEntry;
  budgets?: {
    lcp?: number;
    fcp?: number;
    cls?: number;
    ttfb?: number;
    totalSize?: number;
    requestCount?: number;
  };
}

const DEFAULT_BUDGETS = {
  lcp: 2500,
  fcp: 1800,
  cls: 0.1,
  ttfb: 800,
  totalSize: 1000000, // 1MB
  requestCount: 50,
};

export function PerformanceBudget({ entry, budgets = DEFAULT_BUDGETS }: PerformanceBudgetProps) {
  const totalSize = entry.resourceTimings.reduce((sum, r) => sum + r.transferSize, 0);
  const requestCount = entry.resourceTimings.length;

  const checks = [
    {
      name: 'LCP',
      description: 'Largest Contentful Paint',
      actual: entry.metrics.lcp || 0,
      budget: budgets.lcp || DEFAULT_BUDGETS.lcp,
      format: (v: number) => `${Math.round(v)}ms`,
      threshold: METRIC_THRESHOLDS.LCP,
    },
    {
      name: 'FCP',
      description: 'First Contentful Paint',
      actual: entry.metrics.fcp || 0,
      budget: budgets.fcp || DEFAULT_BUDGETS.fcp,
      format: (v: number) => `${Math.round(v)}ms`,
      threshold: METRIC_THRESHOLDS.FCP,
    },
    {
      name: 'CLS',
      description: 'Cumulative Layout Shift',
      actual: entry.metrics.cls || 0,
      budget: budgets.cls || DEFAULT_BUDGETS.cls,
      format: (v: number) => v.toFixed(3),
      threshold: METRIC_THRESHOLDS.CLS,
    },
    {
      name: 'TTFB',
      description: 'Time to First Byte',
      actual: entry.metrics.ttfb || 0,
      budget: budgets.ttfb || DEFAULT_BUDGETS.ttfb,
      format: (v: number) => `${Math.round(v)}ms`,
      threshold: METRIC_THRESHOLDS.TTFB,
    },
    {
      name: 'Page Size',
      description: 'Total transfer size',
      actual: totalSize,
      budget: budgets.totalSize || DEFAULT_BUDGETS.totalSize,
      format: (v: number) => `${(v / 1024 / 1024).toFixed(2)}MB`,
      threshold: { good: 500000, needsImprovement: 1000000 },
    },
    {
      name: 'Requests',
      description: 'Total HTTP requests',
      actual: requestCount,
      budget: budgets.requestCount || DEFAULT_BUDGETS.requestCount,
      format: (v: number) => `${v}`,
      threshold: { good: 30, needsImprovement: 50 },
    },
  ];

  const getStatus = (actual: number, budget: number, threshold: { good: number; needsImprovement: number }) => {
    if (actual <= threshold.good) return 'pass';
    if (actual <= budget) return 'warning';
    return 'fail';
  };

  const passCount = checks.filter(c => getStatus(c.actual, c.budget, c.threshold) === 'pass').length;
  const warningCount = checks.filter(c => getStatus(c.actual, c.budget, c.threshold) === 'warning').length;
  const failCount = checks.filter(c => getStatus(c.actual, c.budget, c.threshold) === 'fail').length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Performance Budget</CardTitle>
          <div className="flex gap-4 text-sm">
            <span className="flex items-center gap-1 text-success">
              <CheckCircle className="h-4 w-4" /> {passCount} Pass
            </span>
            <span className="flex items-center gap-1 text-warning">
              <AlertTriangle className="h-4 w-4" /> {warningCount} Warning
            </span>
            <span className="flex items-center gap-1 text-destructive">
              <XCircle className="h-4 w-4" /> {failCount} Fail
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {checks.map((check) => {
            const status = getStatus(check.actual, check.budget, check.threshold);
            const percentage = Math.min((check.actual / check.budget) * 100, 150);

            return (
              <div key={check.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {status === 'pass' && <CheckCircle className="h-4 w-4 text-success" />}
                    {status === 'warning' && <AlertTriangle className="h-4 w-4 text-warning" />}
                    {status === 'fail' && <XCircle className="h-4 w-4 text-destructive" />}
                    <span className="font-medium">{check.name}</span>
                    <span className="text-muted-foreground">({check.description})</span>
                  </div>
                  <div className="text-right">
                    <span
                      className={cn(
                        'font-mono',
                        status === 'pass' && 'text-success',
                        status === 'warning' && 'text-warning',
                        status === 'fail' && 'text-destructive'
                      )}
                    >
                      {check.format(check.actual)}
                    </span>
                    <span className="text-muted-foreground"> / {check.format(check.budget)}</span>
                  </div>
                </div>
                <div className="relative h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className={cn(
                      'absolute h-full rounded-full transition-all duration-500',
                      status === 'pass' && 'bg-success',
                      status === 'warning' && 'bg-warning',
                      status === 'fail' && 'bg-destructive'
                    )}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                  {percentage > 100 && (
                    <div
                      className="absolute h-full bg-destructive/50 animate-pulse"
                      style={{ left: '100%', width: `${percentage - 100}%` }}
                    />
                  )}
                  {/* Budget line */}
                  <div className="absolute right-0 top-0 h-full w-0.5 bg-foreground/50" />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
