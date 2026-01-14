'use client';

import { Card, CardHeader, CardTitle, CardContent } from './Card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { HistoricalData } from '@/types';
import { format, parseISO } from 'date-fns';

interface PerformanceChartProps {
  data: HistoricalData[];
  metric?: 'all' | 'lcp' | 'fcp' | 'cls' | 'ttfb' | 'score';
}

const COLORS = {
  lcp: '#3b82f6',
  fcp: '#8b5cf6',
  cls: '#22d3ee',
  ttfb: '#f59e0b',
  score: '#22c55e',
};

export function PerformanceChart({ data, metric = 'all' }: PerformanceChartProps) {
  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'MMM d');
    } catch {
      return dateStr;
    }
  };

  const formatValue = (value: number, name: string) => {
    if (name === 'cls') return value.toFixed(3);
    if (name === 'score') return `${Math.round(value)}%`;
    return `${Math.round(value)}ms`;
  };

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
          <p className="mb-2 text-sm font-medium text-card-foreground">
            {label ? formatDate(label) : ''}
          </p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name.toUpperCase()}: {formatValue(entry.value, entry.name)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const getLines = () => {
    if (metric === 'all') {
      return (
        <>
          <Line
            type="monotone"
            dataKey="lcp"
            stroke={COLORS.lcp}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="fcp"
            stroke={COLORS.fcp}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="ttfb"
            stroke={COLORS.ttfb}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </>
      );
    }

    return (
      <Line
        type="monotone"
        dataKey={metric}
        stroke={COLORS[metric]}
        strokeWidth={2}
        dot={false}
        activeDot={{ r: 4 }}
      />
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                stroke="#94a3b8"
                fontSize={12}
              />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => (
                  <span className="text-sm text-muted-foreground">{value.toUpperCase()}</span>
                )}
              />
              {getLines()}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
