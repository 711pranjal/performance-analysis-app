"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./Card";
import { PerformanceEntry, getMetricRating } from "@/types";
import {
  AlertTriangle,
  CheckCircle,
  Info,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RecommendationsProps {
  entry: PerformanceEntry | null;
}

interface Recommendation {
  type: "critical" | "warning" | "info" | "success";
  title: string;
  description: string;
  actions?: string[];
  learnMoreUrl?: string;
}

export function Recommendations({ entry }: RecommendationsProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const getRecommendations = (): Recommendation[] => {
    if (!entry) return [];

    const recommendations: Recommendation[] = [];
    const { metrics } = entry;

    // LCP recommendations
    if (metrics.lcp) {
      const lcpRating = getMetricRating("LCP", metrics.lcp);
      if (lcpRating === "poor") {
        recommendations.push({
          type: "critical",
          title: "Optimize Largest Contentful Paint",
          description:
            "Your LCP is too slow. The largest element takes too long to render.",
          actions: [
            "Optimize and compress images (use WebP/AVIF)",
            "Use a CDN to serve static assets",
            "Preload critical resources",
            "Remove render-blocking JavaScript",
          ],
          learnMoreUrl: "https://web.dev/lcp/",
        });
      } else if (lcpRating === "needs-improvement") {
        recommendations.push({
          type: "warning",
          title: "Improve LCP Performance",
          description:
            "Your LCP could be better. Try optimizing the largest content element.",
          actions: [
            "Lazy load non-critical images",
            "Preload the LCP image",
            "Use responsive images with srcset",
          ],
          learnMoreUrl: "https://web.dev/lcp/",
        });
      }
    }

    // CLS recommendations
    if (metrics.cls !== undefined) {
      const clsRating = getMetricRating("CLS", metrics.cls);
      if (clsRating === "poor") {
        recommendations.push({
          type: "critical",
          title: "Fix Layout Shifts",
          description:
            "High CLS detected. Elements are moving during page load.",
          actions: [
            "Add width/height to images and videos",
            "Reserve space for ads and embeds",
            "Avoid inserting content above existing content",
            "Preload fonts to prevent FOUT/FOIT",
          ],
          learnMoreUrl: "https://web.dev/cls/",
        });
      } else if (clsRating === "needs-improvement") {
        recommendations.push({
          type: "warning",
          title: "Reduce Layout Shifts",
          description:
            "Consider using CSS aspect-ratio and reserving space for dynamic content.",
          actions: [
            "Use CSS aspect-ratio for media",
            "Set explicit sizes on images",
          ],
          learnMoreUrl: "https://web.dev/cls/",
        });
      }
    }

    // TTFB recommendations
    if (metrics.ttfb) {
      const ttfbRating = getMetricRating("TTFB", metrics.ttfb);
      if (ttfbRating === "poor") {
        recommendations.push({
          type: "critical",
          title: "Reduce Server Response Time",
          description:
            "High TTFB detected. Your server is taking too long to respond.",
          actions: [
            "Use a Content Delivery Network (CDN)",
            "Optimize database queries",
            "Enable HTTP/2 or HTTP/3",
            "Implement server-side caching",
          ],
          learnMoreUrl: "https://web.dev/ttfb/",
        });
      }
    }

    // FCP recommendations
    if (metrics.fcp) {
      const fcpRating = getMetricRating("FCP", metrics.fcp);
      if (fcpRating === "poor") {
        recommendations.push({
          type: "warning",
          title: "Improve First Contentful Paint",
          description:
            "Eliminate render-blocking resources and inline critical CSS.",
          actions: [
            "Inline critical CSS in the <head>",
            "Defer non-critical JavaScript",
            "Remove unused CSS",
          ],
          learnMoreUrl: "https://web.dev/fcp/",
        });
      }
    }

    // INP recommendations
    if (metrics.inp) {
      const inpRating = getMetricRating("INP", metrics.inp);
      if (inpRating === "poor") {
        recommendations.push({
          type: "critical",
          title: "Improve Interaction Responsiveness",
          description: "Your page is slow to respond to user interactions.",
          actions: [
            "Break up long tasks into smaller chunks",
            "Use web workers for heavy computations",
            "Optimize event handlers",
          ],
          learnMoreUrl: "https://web.dev/inp/",
        });
      }
    }

    // Add success if everything is good
    if (entry.overallScore >= 90) {
      recommendations.push({
        type: "success",
        title: "Excellent Performance!",
        description:
          "Your page is performing well. Keep monitoring to maintain these scores.",
        actions: [
          "Continue monitoring regularly",
          "Set up performance budgets",
          "Test on real devices",
        ],
      });
    }

    // General tips
    if (recommendations.length === 0) {
      recommendations.push({
        type: "info",
        title: "Performance Tips",
        description:
          "Enable text compression, minify CSS/JS, and use browser caching for better performance.",
        actions: [
          "Enable Gzip or Brotli compression",
          "Set up proper cache headers",
          "Minify and bundle assets",
        ],
      });
    }

    return recommendations;
  };

  const recommendations = getRecommendations();

  const getIcon = (type: Recommendation["type"]) => {
    switch (type) {
      case "critical":
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case "warning":
        return <Lightbulb className="h-5 w-5 text-warning" />;
      case "success":
        return <CheckCircle className="h-5 w-5 text-success" />;
      default:
        return <Info className="h-5 w-5 text-primary" />;
    }
  };

  const getBgColor = (type: Recommendation["type"]) => {
    switch (type) {
      case "critical":
        return "bg-destructive/10 border-destructive/30";
      case "warning":
        return "bg-warning/10 border-warning/30";
      case "success":
        return "bg-success/10 border-success/30";
      default:
        return "bg-primary/10 border-primary/30";
    }
  };

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Recommendations</span>
          {entry && recommendations.length > 0 && (
            <span className="text-xs font-normal text-muted-foreground">
              {recommendations.length} item
              {recommendations.length !== 1 ? "s" : ""}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!entry ? (
          <p className="text-center text-muted-foreground py-4">
            Select an analysis to see recommendations
          </p>
        ) : (
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className={cn(
                  "rounded-lg border p-4 transition-all",
                  getBgColor(rec.type),
                )}
              >
                <div
                  className="flex items-start gap-3 cursor-pointer"
                  onClick={() => rec.actions && toggleExpand(index)}
                >
                  {getIcon(rec.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-card-foreground">
                        {rec.title}
                      </h4>
                      {rec.actions && (
                        <button className="text-muted-foreground hover:text-foreground transition-colors">
                          {expandedIndex === index ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {rec.description}
                    </p>
                  </div>
                </div>

                {/* Expanded Actions */}
                {expandedIndex === index && rec.actions && (
                  <div className="mt-3 ml-8 space-y-2 animate-slide-in">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Action Items:
                    </p>
                    <ul className="space-y-1">
                      {rec.actions.map((action, actionIndex) => (
                        <li
                          key={actionIndex}
                          className="flex items-start gap-2 text-sm text-card-foreground"
                        >
                          <span className="text-primary mt-1">•</span>
                          {action}
                        </li>
                      ))}
                    </ul>
                    {rec.learnMoreUrl && (
                      <a
                        href={rec.learnMoreUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                      >
                        Learn more
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
