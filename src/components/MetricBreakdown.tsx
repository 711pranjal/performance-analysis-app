'use client';

import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { PerformanceEntry, METRIC_THRESHOLDS, getMetricRating } from '@/types';
import { cn } from '@/lib/utils';
import { getRatingColor } from '@/lib/utils';

interface MetricBreakdownProps {
  entry: PerformanceEntry;
}

const METRIC_INFO = {
  lcp: {
    name: 'Largest Contentful Paint',
    abbr: 'LCP',
    description: 'LCP measures when the largest content element becomes visible. It\'s a key indicator of perceived load speed.',
    tips: [
      'Optimize and compress images',
      'Use next-gen image formats (WebP, AVIF)',
      'Preload critical resources',
      'Use a CDN for static assets',
      'Minimize render-blocking resources',
    ],
  },
  fcp: {
    name: 'First Contentful Paint',
    abbr: 'FCP',
    description: 'FCP measures when the first content is painted to the screen. It marks when users first see something.',
    tips: [
      'Eliminate render-blocking resources',
      'Inline critical CSS',
      'Reduce server response time',
      'Preconnect to required origins',
      'Avoid large network payloads',
    ],
  },
  cls: {
    name: 'Cumulative Layout Shift',
    abbr: 'CLS',
    description: 'CLS measures visual stability by tracking unexpected layout shifts during the page lifecycle.',
    tips: [
      'Always include size attributes on images/videos',
      'Reserve space for ad slots',
      'Avoid inserting content above existing content',
      'Use CSS aspect-ratio for media',
      'Preload fonts to avoid FOIT/FOUT',
    ],
  },
  fid: {
    name: 'First Input Delay',
    abbr: 'FID',
    description: 'FID measures the time from first user interaction to when the browser can respond to it.',
    tips: [
      'Break up long JavaScript tasks',
      'Use web workers for heavy computation',
      'Reduce JavaScript execution time',
      'Minimize main thread work',
      'Keep request counts low',
    ],
  },
  inp: {
    name: 'Interaction to Next Paint',
    abbr: 'INP',
    description: 'INP measures responsiveness by observing all interactions and reporting the worst latency.',
    tips: [
      'Optimize event handlers',
      'Use requestAnimationFrame for visual updates',
      'Debounce/throttle rapid events',
      'Avoid layout thrashing',
      'Use CSS containment',
    ],
  },
  ttfb: {
    name: 'Time to First Byte',
    abbr: 'TTFB',
    description: 'TTFB measures the time from request start until the first byte of response is received.',
    tips: [
      'Use a CDN',
      'Optimize server-side code',
      'Use HTTP/2 or HTTP/3',
      'Implement caching strategies',
      'Reduce DNS lookup time',
    ],
  },
};

export function MetricBreakdown({ entry }: MetricBreakdownProps) {
  const metrics = Object.entries(entry.metrics).filter(([, value]) => value !== undefined);

  return (
    <div className="space-y-6">
      {metrics.map(([key, value]) => {
        const info = METRIC_INFO[key as keyof typeof METRIC_INFO];
        const threshold = METRIC_THRESHOLDS[info.abbr];
        const rating = getMetricRating(info.abbr, value as number);

        // Calculate percentage for progress bar
        const maxValue = threshold ? threshold.needsImprovement * 1.5 : 100;
        const percentage = Math.min(((value as number) / maxValue) * 100, 100);

        return (
          <Card key={key} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold',
                    rating === 'good' && 'bg-success/20 text-success',
                    rating === 'needs-improvement' && 'bg-warning/20 text-warning',
                    rating === 'poor' && 'bg-destructive/20 text-destructive'
                  )}>
                    {info.abbr}
                  </span>
                  {info.name}
                </CardTitle>
                <span className={cn('text-2xl font-bold', getRatingColor(rating))}>
                  {key === 'cls' ? (value as number).toFixed(3) : `${Math.round(value as number)}ms`}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress Bar */}
              <div className="relative h-3 rounded-full bg-secondary overflow-hidden">
                {threshold && (
                  <>
                    <div
                      className="absolute h-full bg-success/30"
                      style={{ width: `${(threshold.good / maxValue) * 100}%` }}
                    />
                    <div
                      className="absolute h-full bg-warning/30"
                      style={{
                        left: `${(threshold.good / maxValue) * 100}%`,
                        width: `${((threshold.needsImprovement - threshold.good) / maxValue) * 100}%`,
                      }}
                    />
                  </>
                )}
                <div
                  className={cn(
                    'absolute h-full rounded-full transition-all duration-500',
                    rating === 'good' && 'bg-success',
                    rating === 'needs-improvement' && 'bg-warning',
                    rating === 'poor' && 'bg-destructive'
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              {/* Thresholds */}
              {threshold && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0</span>
                  <span className="text-success">
                    Good: ≤{key === 'cls' ? threshold.good : `${threshold.good}ms`}
                  </span>
                  <span className="text-warning">
                    Moderate: ≤{key === 'cls' ? threshold.needsImprovement : `${threshold.needsImprovement}ms`}
                  </span>
                  <span className="text-destructive">Poor</span>
                </div>
              )}

              {/* Description */}
              <p className="text-sm text-muted-foreground">{info.description}</p>

              {/* Tips */}
              {rating !== 'good' && (
                <div className="rounded-lg bg-secondary/50 p-4">
                  <h4 className="mb-2 text-sm font-medium text-foreground">
                    Optimization Tips:
                  </h4>
                  <ul className="space-y-1">
                    {info.tips.slice(0, 3).map((tip, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
