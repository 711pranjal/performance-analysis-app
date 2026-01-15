export interface WebVitalsMetric {
  id: string;
  name: "CLS" | "FCP" | "FID" | "INP" | "LCP" | "TTFB";
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  navigationType: string;
}

export interface PerformanceEntry {
  id: string;
  url: string;
  timestamp: Date;
  metrics: {
    lcp?: number;
    fcp?: number;
    cls?: number;
    fid?: number;
    inp?: number;
    ttfb?: number;
  };
  resourceTimings: ResourceTiming[];
  overallScore: number;
  componentAnalysis?: ComponentAnalysis[];
  aiSuggestions?: AISuggestion[];
}

export interface ResourceTiming {
  name: string;
  initiatorType: string;
  duration: number;
  transferSize: number;
  startTime: number;
}

export interface HistoricalData {
  date: string;
  lcp: number;
  fcp: number;
  cls: number;
  ttfb: number;
  score: number;
}

export interface ComponentAnalysis {
  id: string;
  name: string;
  category:
    | "rendering"
    | "network"
    | "javascript"
    | "images"
    | "fonts"
    | "css"
    | "third-party"
    | "server";
  status: "excellent" | "good" | "needs-improvement" | "critical";
  impact: "high" | "medium" | "low";
  metrics: {
    loadTime?: number;
    size?: number;
    renderTime?: number;
    blockingTime?: number;
  };
  description: string;
  affectedMetrics: string[];
}

export interface AISuggestion {
  id: string;
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  category: "performance" | "accessibility" | "seo" | "best-practices";
  estimatedImpact: string;
  effort: "easy" | "medium" | "hard";
  codeExample?: string;
  affectedComponents: string[];
  potentialGain: number; // Estimated score improvement
}

export interface MetricThreshold {
  good: number;
  needsImprovement: number;
}

export const METRIC_THRESHOLDS: Record<string, MetricThreshold> = {
  LCP: { good: 2500, needsImprovement: 4000 },
  FCP: { good: 1800, needsImprovement: 3000 },
  CLS: { good: 0.1, needsImprovement: 0.25 },
  FID: { good: 100, needsImprovement: 300 },
  INP: { good: 200, needsImprovement: 500 },
  TTFB: { good: 800, needsImprovement: 1800 },
};

export function getMetricRating(
  name: string,
  value: number,
): "good" | "needs-improvement" | "poor" {
  const threshold = METRIC_THRESHOLDS[name];
  if (!threshold) return "good";

  if (value <= threshold.good) return "good";
  if (value <= threshold.needsImprovement) return "needs-improvement";
  return "poor";
}

export function calculateOverallScore(
  metrics: PerformanceEntry["metrics"],
): number {
  const weights = {
    lcp: 25,
    fcp: 15,
    cls: 25,
    fid: 10,
    inp: 15,
    ttfb: 10,
  };

  let totalScore = 0;
  let totalWeight = 0;

  Object.entries(metrics).forEach(([key, value]) => {
    if (value !== undefined) {
      const metricName = key.toUpperCase();
      const rating = getMetricRating(metricName, value);
      const weight = weights[key as keyof typeof weights] || 0;

      let score = 0;
      if (rating === "good") score = 100;
      else if (rating === "needs-improvement") score = 50;
      else score = 0;

      totalScore += score * weight;
      totalWeight += weight;
    }
  });

  return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
}
