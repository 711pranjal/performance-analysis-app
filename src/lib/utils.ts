import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatMetricValue(name: string, value: number): string {
  if (name === "CLS") {
    return value.toFixed(3);
  }
  return `${Math.round(value)}ms`;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function getScoreColor(score: number): string {
  if (score >= 90) return "text-success";
  if (score >= 50) return "text-warning";
  return "text-destructive";
}

export function getScoreBgColor(score: number): string {
  if (score >= 90) return "bg-success";
  if (score >= 50) return "bg-warning";
  return "bg-destructive";
}

export function getRatingColor(
  rating: "good" | "needs-improvement" | "poor",
): string {
  switch (rating) {
    case "good":
      return "text-success";
    case "needs-improvement":
      return "text-warning";
    case "poor":
      return "text-destructive";
  }
}

export function getRatingBgColor(
  rating: "good" | "needs-improvement" | "poor",
): string {
  switch (rating) {
    case "good":
      return "bg-success/20 border-success/30";
    case "needs-improvement":
      return "bg-warning/20 border-warning/30";
    case "poor":
      return "bg-destructive/20 border-destructive/30";
  }
}

/**
 * Format a date consistently to avoid hydration mismatches between server and client.
 * Uses a fixed locale and timezone to ensure consistent output.
 */
export function formatDate(
  date: Date | string | number,
  options?: { dateOnly?: boolean },
): string {
  const d = new Date(date);

  if (options?.dateOnly) {
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  }

  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}
