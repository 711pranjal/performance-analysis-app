'use client';

import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { PerformanceEntry, getMetricRating } from '@/types';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Zap,
  Clock,
  BarChart3,
  Target
} from 'lucide-react';

interface InsightsSummaryProps {
  entries: PerformanceEntry[];
  currentEntry: PerformanceEntry | null;
}

export function InsightsSummary({ entries, currentEntry }: InsightsSummaryProps) {
  if (!currentEntry || entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-4">
            Analyze a URL to see performance insights
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate insights
  const avgScore = entries.reduce((sum, e) => sum + e.overallScore, 0) / entries.length;
  const bestScore = Math.max(...entries.map(e => e.overallScore));
  const worstScore = Math.min(...entries.map(e => e.overallScore));

  // Find trends (compare last 5 entries)
  const recentEntries = entries.slice(0, 5);
  const olderEntries = entries.slice(5, 10);

  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (recentEntries.length > 0 && olderEntries.length > 0) {
    const recentAvg = recentEntries.reduce((sum, e) => sum + e.overallScore, 0) / recentEntries.length;
    const olderAvg = olderEntries.reduce((sum, e) => sum + e.overallScore, 0) / olderEntries.length;
    if (recentAvg > olderAvg + 5) trend = 'up';
    else if (recentAvg < olderAvg - 5) trend = 'down';
  }

  // Find problem areas
  const problemMetrics: string[] = [];
  if (currentEntry.metrics.lcp && getMetricRating('LCP', currentEntry.metrics.lcp) === 'poor') {
    problemMetrics.push('LCP');
  }
  if (currentEntry.metrics.cls && getMetricRating('CLS', currentEntry.metrics.cls) === 'poor') {
    problemMetrics.push('CLS');
  }
  if (currentEntry.metrics.fid && getMetricRating('FID', currentEntry.metrics.fid) === 'poor') {
    problemMetrics.push('FID');
  }
  if (currentEntry.metrics.inp && getMetricRating('INP', currentEntry.metrics.inp) === 'poor') {
    problemMetrics.push('INP');
  }
  if (currentEntry.metrics.ttfb && getMetricRating('TTFB', currentEntry.metrics.ttfb) === 'poor') {
    problemMetrics.push('TTFB');
  }

  // Find strong areas
  const strongMetrics: string[] = [];
  if (currentEntry.metrics.lcp && getMetricRating('LCP', currentEntry.metrics.lcp) === 'good') {
    strongMetrics.push('LCP');
  }
  if (currentEntry.metrics.cls && getMetricRating('CLS', currentEntry.metrics.cls) === 'good') {
    strongMetrics.push('CLS');
  }
  if (currentEntry.metrics.ttfb && getMetricRating('TTFB', currentEntry.metrics.ttfb) === 'good') {
    strongMetrics.push('TTFB');
  }

  const insights = [
    {
      icon: BarChart3,
      label: 'Average Score',
      value: `${Math.round(avgScore)}`,
      color: avgScore >= 90 ? 'text-success' : avgScore >= 50 ? 'text-warning' : 'text-destructive',
    },
    {
      icon: Target,
      label: 'Best Score',
      value: `${Math.round(bestScore)}`,
      color: 'text-success',
    },
    {
      icon: Clock,
      label: 'Total Analyses',
      value: `${entries.length}`,
      color: 'text-primary',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Performance Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          {insights.map((insight, index) => (
            <div key={index} className="text-center">
              <insight.icon className={cn('h-5 w-5 mx-auto mb-1', insight.color)} />
              <p className={cn('text-xl font-bold', insight.color)}>{insight.value}</p>
              <p className="text-xs text-muted-foreground">{insight.label}</p>
            </div>
          ))}
        </div>

        {/* Trend */}
        <div className={cn(
          'flex items-center gap-2 rounded-lg p-3',
          trend === 'up' && 'bg-success/10',
          trend === 'down' && 'bg-destructive/10',
          trend === 'stable' && 'bg-secondary'
        )}>
          {trend === 'up' && <TrendingUp className="h-5 w-5 text-success" />}
          {trend === 'down' && <TrendingDown className="h-5 w-5 text-destructive" />}
          {trend === 'stable' && <BarChart3 className="h-5 w-5 text-muted-foreground" />}
          <div>
            <p className="text-sm font-medium">
              {trend === 'up' && 'Performance Improving'}
              {trend === 'down' && 'Performance Declining'}
              {trend === 'stable' && 'Performance Stable'}
            </p>
            <p className="text-xs text-muted-foreground">
              Based on recent analyses
            </p>
          </div>
        </div>

        {/* Problem Areas */}
        {problemMetrics.length > 0 && (
          <div className="rounded-lg bg-destructive/10 p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <p className="text-sm font-medium text-destructive">Needs Attention</p>
            </div>
            <p className="text-sm text-muted-foreground">
              {problemMetrics.join(', ')} {problemMetrics.length === 1 ? 'is' : 'are'} performing poorly
            </p>
          </div>
        )}

        {/* Strong Areas */}
        {strongMetrics.length > 0 && (
          <div className="rounded-lg bg-success/10 p-3">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <p className="text-sm font-medium text-success">Performing Well</p>
            </div>
            <p className="text-sm text-muted-foreground">
              {strongMetrics.join(', ')} {strongMetrics.length === 1 ? 'is' : 'are'} in the green
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
