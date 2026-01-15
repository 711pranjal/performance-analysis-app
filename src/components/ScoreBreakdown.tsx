'use client';

import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { PerformanceEntry, getMetricRating } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ScoreBreakdownProps {
  entry: PerformanceEntry;
}

const WEIGHTS = {
  lcp: { weight: 25, label: 'LCP' },
  fcp: { weight: 15, label: 'FCP' },
  cls: { weight: 25, label: 'CLS' },
  fid: { weight: 10, label: 'FID' },
  inp: { weight: 15, label: 'INP' },
  ttfb: { weight: 10, label: 'TTFB' },
};

const COLORS = {
  good: '#22c55e',
  'needs-improvement': '#f59e0b',
  poor: '#ef4444',
};

export function ScoreBreakdown({ entry }: ScoreBreakdownProps) {
  const data = Object.entries(entry.metrics)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => {
      const info = WEIGHTS[key as keyof typeof WEIGHTS];
      const rating = getMetricRating(info.label, value as number);
      return {
        name: info.label,
        value: info.weight,
        rating,
        color: COLORS[rating],
        actualValue: value,
      };
    });

  const ratingCounts = data.reduce(
    (acc, item) => {
      acc[item.rating] = (acc[item.rating] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; rating: string; actualValue: number; value: number } }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            Weight: {data.value}%
          </p>
          <p className="text-sm capitalize" style={{ color: COLORS[data.rating as keyof typeof COLORS] }}>
            Rating: {data.rating.replace('-', ' ')}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Score Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-6 lg:flex-row">
          {/* Pie Chart */}
          <div className="h-[250px] w-full max-w-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(value) => (
                    <span className="text-sm text-muted-foreground">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Summary */}
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="rounded-lg bg-success/20 p-4">
                <p className="text-3xl font-bold text-success">{ratingCounts.good || 0}</p>
                <p className="text-sm text-muted-foreground">Good</p>
              </div>
              <div className="rounded-lg bg-warning/20 p-4">
                <p className="text-3xl font-bold text-warning">
                  {ratingCounts['needs-improvement'] || 0}
                </p>
                <p className="text-sm text-muted-foreground">Moderate</p>
              </div>
              <div className="rounded-lg bg-destructive/20 p-4">
                <p className="text-3xl font-bold text-destructive">{ratingCounts.poor || 0}</p>
                <p className="text-sm text-muted-foreground">Poor</p>
              </div>
            </div>

            <div className="rounded-lg bg-secondary/50 p-4">
              <h4 className="mb-2 font-medium">Weight Distribution</h4>
              <p className="text-sm text-muted-foreground">
                The overall score is calculated using industry-standard weights: LCP and CLS
                contribute 25% each, FCP and INP contribute 15% each, while FID and TTFB
                contribute 10% each.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
