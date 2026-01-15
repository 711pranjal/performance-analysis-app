"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./Card";
import { PerformanceEntry, getMetricRating } from "@/types";
import { cn, getRatingColor, formatDate } from "@/lib/utils";
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  GitCompare,
} from "lucide-react";

interface CompareViewProps {
  entries: PerformanceEntry[];
  selectedIds: [string, string] | null;
  onSelect: (ids: [string, string] | null) => void;
}

export function CompareView({
  entries,
  selectedIds,
  onSelect,
}: CompareViewProps) {
  // Local state for partial selections
  const [firstId, setFirstId] = useState<string>(selectedIds?.[0] || "");
  const [secondId, setSecondId] = useState<string>(selectedIds?.[1] || "");

  const entry1 = selectedIds
    ? entries.find((e) => e.id === selectedIds[0])
    : null;
  const entry2 = selectedIds
    ? entries.find((e) => e.id === selectedIds[1])
    : null;

  const metrics = ["lcp", "fcp", "cls", "fid", "inp", "ttfb"] as const;

  const getMetricLabel = (key: string) => {
    const labels: Record<string, string> = {
      lcp: "LCP",
      fcp: "FCP",
      cls: "CLS",
      fid: "FID",
      inp: "INP",
      ttfb: "TTFB",
    };
    return labels[key] || key.toUpperCase();
  };

  const formatValue = (key: string, value: number) => {
    if (key === "cls") return value.toFixed(3);
    return `${Math.round(value)}ms`;
  };

  const getDiff = (key: string, val1: number, val2: number) => {
    const diff = val2 - val1;
    const percentDiff = ((diff / val1) * 100).toFixed(1);
    // For all metrics, lower is better
    const isImprovement = diff < 0;

    if (Math.abs(diff) < 0.01 * val1) {
      return { icon: Minus, color: "text-muted-foreground", text: "Same" };
    }

    return {
      icon: isImprovement ? TrendingDown : TrendingUp,
      color: isImprovement ? "text-success" : "text-destructive",
      text: `${isImprovement ? "" : "+"}${percentDiff}%`,
    };
  };

  const handleCompare = () => {
    if (firstId && secondId && firstId !== secondId) {
      onSelect([firstId, secondId]);
    }
  };

  if (!selectedIds || !entry1 || !entry2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5 text-primary" />
            Compare Analyses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Select two analyses to compare their performance metrics.
          </p>

          {entries.length < 2 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>You need at least 2 analyses to compare.</p>
              <p className="text-sm mt-2">
                Run more URL analyses to use this feature.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    First Analysis (Before)
                  </label>
                  <select
                    className="w-full rounded-lg bg-secondary border border-border p-3 text-foreground"
                    value={firstId}
                    onChange={(e) => setFirstId(e.target.value)}
                  >
                    <option value="">Select an analysis</option>
                    {entries.map((entry) => (
                      <option
                        key={entry.id}
                        value={entry.id}
                        disabled={entry.id === secondId}
                      >
                        {entry.url} - Score: {Math.round(entry.overallScore)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Second Analysis (After)
                  </label>
                  <select
                    className="w-full rounded-lg bg-secondary border border-border p-3 text-foreground"
                    value={secondId}
                    onChange={(e) => setSecondId(e.target.value)}
                  >
                    <option value="">Select an analysis</option>
                    {entries.map((entry) => (
                      <option
                        key={entry.id}
                        value={entry.id}
                        disabled={entry.id === firstId}
                      >
                        {entry.url} - Score: {Math.round(entry.overallScore)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleCompare}
                disabled={!firstId || !secondId || firstId === secondId}
                className="mt-4 w-full py-3 px-4 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <GitCompare className="h-4 w-4" />
                Compare Selected
              </button>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header comparison */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-4">
            {/* Entry 1 */}
            <div className="text-center">
              <div
                className={cn(
                  "mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold",
                  entry1.overallScore >= 90 && "bg-success/20 text-success",
                  entry1.overallScore >= 50 &&
                    entry1.overallScore < 90 &&
                    "bg-warning/20 text-warning",
                  entry1.overallScore < 50 &&
                    "bg-destructive/20 text-destructive",
                )}
              >
                {Math.round(entry1.overallScore)}
              </div>
              <p className="text-sm font-medium truncate max-w-[200px] mx-auto">
                {entry1.url}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(entry1.timestamp, { dateOnly: true })}
              </p>
            </div>

            {/* Arrow */}
            <ArrowRight className="h-8 w-8 text-muted-foreground" />

            {/* Entry 2 */}
            <div className="text-center">
              <div
                className={cn(
                  "mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold",
                  entry2.overallScore >= 90 && "bg-success/20 text-success",
                  entry2.overallScore >= 50 &&
                    entry2.overallScore < 90 &&
                    "bg-warning/20 text-warning",
                  entry2.overallScore < 50 &&
                    "bg-destructive/20 text-destructive",
                )}
              >
                {Math.round(entry2.overallScore)}
              </div>
              <p className="text-sm font-medium truncate max-w-[200px] mx-auto">
                {entry2.url}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(entry2.timestamp, { dateOnly: true })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics comparison table */}
      <Card>
        <CardHeader>
          <CardTitle>Metrics Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-sm text-muted-foreground">
                  <th className="pb-3 text-left">Metric</th>
                  <th className="pb-3 text-center">Before</th>
                  <th className="pb-3 text-center">After</th>
                  <th className="pb-3 text-center">Change</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((key) => {
                  const val1 = entry1.metrics[key] || 0;
                  const val2 = entry2.metrics[key] || 0;
                  const diff = getDiff(key, val1, val2);
                  const rating1 = getMetricRating(getMetricLabel(key), val1);
                  const rating2 = getMetricRating(getMetricLabel(key), val2);

                  return (
                    <tr key={key} className="border-b border-border/50">
                      <td className="py-4">
                        <span className="font-medium">
                          {getMetricLabel(key)}
                        </span>
                      </td>
                      <td className="py-4 text-center">
                        <span
                          className={cn("font-mono", getRatingColor(rating1))}
                        >
                          {formatValue(key, val1)}
                        </span>
                      </td>
                      <td className="py-4 text-center">
                        <span
                          className={cn("font-mono", getRatingColor(rating2))}
                        >
                          {formatValue(key, val2)}
                        </span>
                      </td>
                      <td className="py-4">
                        <div
                          className={cn(
                            "flex items-center justify-center gap-1",
                            diff.color,
                          )}
                        >
                          <diff.icon className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {diff.text}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Reset button */}
      <button
        onClick={() => onSelect(null)}
        className="text-sm text-primary hover:underline"
      >
        ← Select different analyses
      </button>
    </div>
  );
}
