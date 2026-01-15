'use client';

import { Card } from './Card';
import { PerformanceEntry } from '@/types';
import { TrendingUp, Clock, Zap, BarChart3 } from 'lucide-react';

interface StatsOverviewProps {
  entries: PerformanceEntry[];
}

export function StatsOverview({ entries }: StatsOverviewProps) {
  const calculateStats = () => {
    if (entries.length === 0) {
      return {
        avgScore: 0,
        avgLcp: 0,
        totalAnalyses: 0,
        improvement: 0,
      };
    }

    const avgScore = entries.reduce((sum, e) => sum + e.overallScore, 0) / entries.length;
    const avgLcp = entries.reduce((sum, e) => sum + (e.metrics.lcp || 0), 0) / entries.length;

    // Calculate improvement (compare first half to second half)
    const midPoint = Math.floor(entries.length / 2);
    const recentAvg = entries.slice(0, midPoint).reduce((sum, e) => sum + e.overallScore, 0) / (midPoint || 1);
    const olderAvg = entries.slice(midPoint).reduce((sum, e) => sum + e.overallScore, 0) / (entries.length - midPoint || 1);
    const improvement = recentAvg - olderAvg;

    return {
      avgScore: Math.round(avgScore),
      avgLcp: Math.round(avgLcp),
      totalAnalyses: entries.length,
      improvement: Math.round(improvement),
    };
  };

  const stats = calculateStats();

  const statCards = [
    {
      icon: BarChart3,
      label: 'Average Score',
      value: `${stats.avgScore}%`,
      color: 'text-primary',
      bgColor: 'bg-primary/20',
    },
    {
      icon: Clock,
      label: 'Avg LCP',
      value: `${stats.avgLcp}ms`,
      color: 'text-accent',
      bgColor: 'bg-accent/20',
    },
    {
      icon: Zap,
      label: 'Total Analyses',
      value: stats.totalAnalyses.toString(),
      color: 'text-warning',
      bgColor: 'bg-warning/20',
    },
    {
      icon: TrendingUp,
      label: 'Trend',
      value: `${stats.improvement >= 0 ? '+' : ''}${stats.improvement}%`,
      color: stats.improvement >= 0 ? 'text-success' : 'text-destructive',
      bgColor: stats.improvement >= 0 ? 'bg-success/20' : 'bg-destructive/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {statCards.map((stat, index) => (
        <Card key={index} hover>
          <div className="flex items-center gap-4">
            <div className={`rounded-lg p-3 ${stat.bgColor}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
