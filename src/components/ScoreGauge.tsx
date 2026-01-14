'use client';

import { cn } from '@/lib/utils';

interface ScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ScoreGauge({ score, size = 'md', showLabel = true }: ScoreGaugeProps) {
  const roundedScore = Math.round(score);

  const getColor = () => {
    if (roundedScore >= 90) return { stroke: '#22c55e', bg: 'bg-success/20' };
    if (roundedScore >= 50) return { stroke: '#f59e0b', bg: 'bg-warning/20' };
    return { stroke: '#ef4444', bg: 'bg-destructive/20' };
  };

  const getLabel = () => {
    if (roundedScore >= 90) return 'Good';
    if (roundedScore >= 50) return 'Needs Work';
    return 'Poor';
  };

  const sizes = {
    sm: { width: 80, strokeWidth: 6, fontSize: 'text-lg' },
    md: { width: 120, strokeWidth: 8, fontSize: 'text-2xl' },
    lg: { width: 160, strokeWidth: 10, fontSize: 'text-4xl' },
  };

  const { width, strokeWidth, fontSize } = sizes[size];
  const radius = (width - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (roundedScore / 100) * circumference;
  const color = getColor();

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width, height: width }}>
        <svg className="transform -rotate-90" width={width} height={width}>
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-secondary"
          />
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            stroke={color.stroke}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('font-bold', fontSize)} style={{ color: color.stroke }}>
            {roundedScore}
          </span>
        </div>
      </div>
      {showLabel && (
        <span
          className={cn('text-sm font-medium px-3 py-1 rounded-full', color.bg)}
          style={{ color: color.stroke }}
        >
          {getLabel()}
        </span>
      )}
    </div>
  );
}
