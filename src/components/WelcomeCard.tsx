'use client';

import { Card, CardContent } from './Card';
import {
  Zap,
  BarChart3,
  Target,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

interface WelcomeCardProps {
  onGetStarted?: () => void;
}

export function WelcomeCard({ onGetStarted }: WelcomeCardProps) {
  const features = [
    {
      icon: Zap,
      title: 'Core Web Vitals',
      description: 'Measure LCP, FID, CLS, INP, FCP, and TTFB',
    },
    {
      icon: BarChart3,
      title: 'Historical Trends',
      description: 'Track performance over time with charts',
    },
    {
      icon: Target,
      title: 'Performance Budgets',
      description: 'Set and monitor performance thresholds',
    },
    {
      icon: TrendingUp,
      title: 'Actionable Insights',
      description: 'Get recommendations to improve scores',
    },
  ];

  return (
    <Card className="overflow-hidden">
      <div className="gradient-primary p-8 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome to Perf Analyzer</h2>
        <p className="text-white/80">
          Your comprehensive web performance monitoring dashboard
        </p>
      </div>
      <CardContent className="p-6">
        <div className="grid gap-4 sm:grid-cols-2 mb-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-card-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Enter a URL above to start analyzing, or explore the sample data below.
          </p>
          {onGetStarted && (
            <button
              onClick={onGetStarted}
              className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
