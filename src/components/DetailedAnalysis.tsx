"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./Card";
import {
  PerformanceEntry,
  ComponentAnalysis,
  AISuggestion,
  getMetricRating,
} from "@/types";
import { cn } from "@/lib/utils";
import { generateAISuggestions as generateAISuggestionsFromService } from "@/lib/aiService";
import {
  Zap,
  Image,
  FileCode,
  Globe,
  Server,
  Type,
  Palette,
  Package,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  XCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Clock,
  TrendingUp,
  Code,
  Lightbulb,
  Target,
  Flame,
  Shield,
  ArrowRight,
  Loader2,
  Layers,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";

interface DetailedAnalysisProps {
  entry: PerformanceEntry;
  onGenerateAISuggestions?: () => void;
}

// Simulated component analysis based on entry data
function generateComponentAnalysis(
  entry: PerformanceEntry,
): ComponentAnalysis[] {
  const components: ComponentAnalysis[] = [];
  const metrics = entry.metrics;

  // Server Response Analysis
  const ttfbRating = getMetricRating("TTFB", metrics.ttfb || 0);
  components.push({
    id: "server-response",
    name: "Server Response Time",
    category: "server",
    status:
      ttfbRating === "good"
        ? "excellent"
        : ttfbRating === "needs-improvement"
          ? "needs-improvement"
          : "critical",
    impact: "high",
    metrics: {
      loadTime: metrics.ttfb,
    },
    description:
      ttfbRating === "good"
        ? "Server is responding quickly with optimal TTFB"
        : "Server response time is slow, affecting initial page load",
    affectedMetrics: ["TTFB", "FCP", "LCP"],
  });

  // JavaScript Execution
  const jsResources = entry.resourceTimings.filter(
    (r) => r.initiatorType === "script",
  );
  const totalJsTime = jsResources.reduce((sum, r) => sum + r.duration, 0);
  const totalJsSize = jsResources.reduce((sum, r) => sum + r.transferSize, 0);
  const jsStatus =
    totalJsTime < 200
      ? "excellent"
      : totalJsTime < 500
        ? "good"
        : totalJsTime < 1000
          ? "needs-improvement"
          : "critical";

  components.push({
    id: "javascript",
    name: "JavaScript Execution",
    category: "javascript",
    status: jsStatus,
    impact: "high",
    metrics: {
      loadTime: totalJsTime,
      size: totalJsSize,
      blockingTime: metrics.fid,
    },
    description:
      jsStatus === "excellent" || jsStatus === "good"
        ? "JavaScript bundles are well-optimized"
        : "Large JavaScript bundles are blocking the main thread",
    affectedMetrics: ["FID", "INP", "TBT"],
  });

  // Image Optimization
  const imageResources = entry.resourceTimings.filter(
    (r) => r.initiatorType === "img",
  );
  const totalImageSize = imageResources.reduce(
    (sum, r) => sum + r.transferSize,
    0,
  );
  const avgImageTime =
    imageResources.length > 0
      ? imageResources.reduce((sum, r) => sum + r.duration, 0) /
        imageResources.length
      : 0;
  const imageStatus =
    totalImageSize < 200000
      ? "excellent"
      : totalImageSize < 500000
        ? "good"
        : totalImageSize < 1000000
          ? "needs-improvement"
          : "critical";

  components.push({
    id: "images",
    name: "Image Optimization",
    category: "images",
    status: imageStatus,
    impact: "high",
    metrics: {
      loadTime: avgImageTime,
      size: totalImageSize,
    },
    description:
      imageStatus === "excellent" || imageStatus === "good"
        ? "Images are properly optimized and sized"
        : "Large unoptimized images are slowing down LCP",
    affectedMetrics: ["LCP", "Speed Index"],
  });

  // CSS Analysis
  const cssResources = entry.resourceTimings.filter(
    (r) => r.initiatorType === "link" || r.name.includes(".css"),
  );
  const totalCssSize = cssResources.reduce((sum, r) => sum + r.transferSize, 0);
  const cssStatus =
    totalCssSize < 50000
      ? "excellent"
      : totalCssSize < 100000
        ? "good"
        : totalCssSize < 200000
          ? "needs-improvement"
          : "critical";

  components.push({
    id: "css",
    name: "CSS Delivery",
    category: "css",
    status: cssStatus,
    impact: "medium",
    metrics: {
      size: totalCssSize,
      renderTime: cssResources.reduce((sum, r) => sum + r.duration, 0),
    },
    description:
      cssStatus === "excellent" || cssStatus === "good"
        ? "CSS is efficiently delivered and not render-blocking"
        : "Large CSS files are blocking rendering",
    affectedMetrics: ["FCP", "LCP"],
  });

  // Layout Stability
  const clsRating = getMetricRating("CLS", metrics.cls || 0);
  components.push({
    id: "layout-stability",
    name: "Layout Stability",
    category: "rendering",
    status:
      clsRating === "good"
        ? "excellent"
        : clsRating === "needs-improvement"
          ? "needs-improvement"
          : "critical",
    impact: "medium",
    metrics: {
      renderTime: (metrics.cls || 0) * 1000,
    },
    description:
      clsRating === "good"
        ? "Page has minimal layout shifts during loading"
        : "Significant layout shifts detected - check image dimensions and dynamic content",
    affectedMetrics: ["CLS"],
  });

  // Font Loading
  const fontResources = entry.resourceTimings.filter(
    (r) =>
      r.initiatorType === "font" ||
      r.name.includes("font") ||
      r.name.includes("woff"),
  );
  const fontStatus =
    fontResources.length === 0
      ? "excellent"
      : fontResources.some((r) => r.duration > 200)
        ? "needs-improvement"
        : "good";

  components.push({
    id: "fonts",
    name: "Font Loading",
    category: "fonts",
    status: fontStatus,
    impact: "low",
    metrics: {
      loadTime: fontResources.reduce((sum, r) => sum + r.duration, 0),
      size: fontResources.reduce((sum, r) => sum + r.transferSize, 0),
    },
    description:
      fontStatus === "excellent" || fontStatus === "good"
        ? "Fonts are loading efficiently with proper strategies"
        : "Font loading may be causing FOUT/FOIT issues",
    affectedMetrics: ["CLS", "FCP"],
  });

  // Third Party Scripts
  const thirdPartyResources = entry.resourceTimings.filter(
    (r) =>
      !r.name.includes("example.com") &&
      (r.name.includes("http") || r.name.includes("cdn")),
  );
  const thirdPartyStatus =
    thirdPartyResources.length === 0
      ? "excellent"
      : thirdPartyResources.length < 3
        ? "good"
        : thirdPartyResources.length < 6
          ? "needs-improvement"
          : "critical";

  components.push({
    id: "third-party",
    name: "Third-Party Resources",
    category: "third-party",
    status: thirdPartyStatus,
    impact: "medium",
    metrics: {
      loadTime: thirdPartyResources.reduce((sum, r) => sum + r.duration, 0),
      size: thirdPartyResources.reduce((sum, r) => sum + r.transferSize, 0),
    },
    description:
      thirdPartyStatus === "excellent" || thirdPartyStatus === "good"
        ? "Third-party scripts are minimal and well-managed"
        : "Multiple third-party scripts may be impacting performance",
    affectedMetrics: ["TBT", "FID", "INP"],
  });

  // Main Thread Work
  const inpRating = getMetricRating("INP", metrics.inp || 0);
  components.push({
    id: "main-thread",
    name: "Main Thread Work",
    category: "javascript",
    status:
      inpRating === "good"
        ? "excellent"
        : inpRating === "needs-improvement"
          ? "needs-improvement"
          : "critical",
    impact: "high",
    metrics: {
      blockingTime: metrics.inp,
    },
    description:
      inpRating === "good"
        ? "Main thread is responsive with minimal blocking"
        : "Heavy main thread work is causing interaction delays",
    affectedMetrics: ["INP", "FID", "TBT"],
  });

  return components;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

const categoryIcons: Record<string, React.ReactNode> = {
  rendering: <Palette className="h-4 w-4" />,
  network: <Globe className="h-4 w-4" />,
  javascript: <FileCode className="h-4 w-4" />,
  images: <Image className="h-4 w-4" />,
  fonts: <Type className="h-4 w-4" />,
  css: <Palette className="h-4 w-4" />,
  "third-party": <Package className="h-4 w-4" />,
  server: <Server className="h-4 w-4" />,
};

const statusConfig = {
  excellent: {
    icon: CheckCircle,
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/30",
    label: "Excellent",
    shimmer: "from-success/20 via-success/40 to-success/20",
  },
  good: {
    icon: CheckCircle,
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/20",
    label: "Good",
    shimmer: "from-success/10 via-success/30 to-success/10",
  },
  "needs-improvement": {
    icon: AlertCircle,
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/30",
    label: "Needs Work",
    shimmer: "from-warning/20 via-warning/40 to-warning/20",
  },
  critical: {
    icon: XCircle,
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/30",
    label: "Critical",
    shimmer: "from-destructive/20 via-destructive/40 to-destructive/20",
  },
};

const priorityConfig = {
  critical: { color: "text-destructive", bg: "bg-destructive/10", icon: Flame },
  high: { color: "text-warning", bg: "bg-warning/10", icon: AlertTriangle },
  medium: { color: "text-primary", bg: "bg-primary/10", icon: Target },
  low: { color: "text-muted-foreground", bg: "bg-secondary", icon: Lightbulb },
};

export function DetailedAnalysis({ entry }: DetailedAnalysisProps) {
  const [components, setComponents] = useState<ComponentAnalysis[]>([]);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(
    null,
  );
  const [activeSection, setActiveSection] = useState<
    "components" | "suggestions"
  >("components");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  useEffect(() => {
    // Simulate analysis loading
    setIsAnalyzing(true);
    const timer = setTimeout(() => {
      const analysisResult = generateComponentAnalysis(entry);
      setComponents(analysisResult);
      setIsAnalyzing(false);

      // Auto-generate AI suggestions after component analysis
      setTimeout(() => {
        setIsGeneratingAI(true);
        // Use the AI service to generate suggestions
        generateAISuggestionsFromService(entry, analysisResult)
          .then((aiSuggestions) => {
            setSuggestions(aiSuggestions);
            setIsGeneratingAI(false);
          })
          .catch((error) => {
            console.error("Error generating AI suggestions:", error);
            setIsGeneratingAI(false);
          });
      }, 500);
    }, 1000);

    return () => clearTimeout(timer);
  }, [entry]);

  const criticalCount = components.filter(
    (c) => c.status === "critical",
  ).length;
  const needsWorkCount = components.filter(
    (c) => c.status === "needs-improvement",
  ).length;
  const goodCount = components.filter(
    (c) => c.status === "good" || c.status === "excellent",
  ).length;

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <Card className="overflow-hidden">
        <div className="gradient-primary p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Zap className="h-6 w-6" />
                Detailed Performance Analysis
              </h2>
              <p className="text-white/80 mt-1 text-sm">
                Component-level breakdown with AI-powered suggestions
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">
                {Math.round(entry.overallScore)}
              </div>
              <div className="text-sm text-white/80">Overall Score</div>
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className={cn("rounded-lg p-4", statusConfig.critical.bg)}>
              <div
                className={cn(
                  "text-2xl font-bold",
                  statusConfig.critical.color,
                )}
              >
                {criticalCount}
              </div>
              <div className="text-sm text-muted-foreground">
                Critical Issues
              </div>
            </div>
            <div
              className={cn(
                "rounded-lg p-4",
                statusConfig["needs-improvement"].bg,
              )}
            >
              <div
                className={cn(
                  "text-2xl font-bold",
                  statusConfig["needs-improvement"].color,
                )}
              >
                {needsWorkCount}
              </div>
              <div className="text-sm text-muted-foreground">
                Needs Attention
              </div>
            </div>
            <div className={cn("rounded-lg p-4", statusConfig.good.bg)}>
              <div
                className={cn("text-2xl font-bold", statusConfig.good.color)}
              >
                {goodCount}
              </div>
              <div className="text-sm text-muted-foreground">
                Performing Well
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section Tabs */}
      <div className="flex gap-2 p-1 bg-secondary rounded-lg">
        <button
          onClick={() => setActiveSection("components")}
          className={cn(
            "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2",
            activeSection === "components"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Layers className="h-4 w-4" />
          Component Analysis
        </button>
        <button
          onClick={() => setActiveSection("suggestions")}
          className={cn(
            "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2",
            activeSection === "suggestions"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Sparkles className="h-4 w-4" />
          AI Suggestions
          {suggestions.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-primary text-primary-foreground">
              {suggestions.length}
            </span>
          )}
        </button>
      </div>

      {/* Component Analysis Section */}
      {activeSection === "components" && (
        <div className="space-y-4">
          {isAnalyzing ? (
            // Skeleton loading state
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-secondary animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-1/3 bg-secondary rounded animate-pulse" />
                        <div className="h-3 w-2/3 bg-secondary rounded animate-pulse" />
                      </div>
                      <div className="w-20 h-6 bg-secondary rounded animate-pulse" />
                    </div>
                    <div className="mt-4 h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full w-full bg-gradient-to-r from-secondary via-muted to-secondary animate-shimmer" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {components.map((component) => {
                const config = statusConfig[component.status];
                const StatusIcon = config.icon;

                return (
                  <Card
                    key={component.id}
                    className={cn(
                      "overflow-hidden border-l-4 transition-all hover:shadow-md",
                      config.border,
                    )}
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Category Icon */}
                        <div className={cn("p-2.5 rounded-lg", config.bg)}>
                          <span className={config.color}>
                            {categoryIcons[component.category]}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-foreground">
                              {component.name}
                            </h4>
                            <span
                              className={cn(
                                "text-xs px-2 py-0.5 rounded-full",
                                component.impact === "high"
                                  ? "bg-destructive/10 text-destructive"
                                  : component.impact === "medium"
                                    ? "bg-warning/10 text-warning"
                                    : "bg-muted text-muted-foreground",
                              )}
                            >
                              {component.impact} impact
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {component.description}
                          </p>

                          {/* Metrics */}
                          <div className="flex flex-wrap gap-4 mt-3">
                            {component.metrics.loadTime !== undefined && (
                              <div className="flex items-center gap-1.5 text-xs">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  Load:
                                </span>
                                <span className="font-medium">
                                  {Math.round(component.metrics.loadTime)}ms
                                </span>
                              </div>
                            )}
                            {component.metrics.size !== undefined && (
                              <div className="flex items-center gap-1.5 text-xs">
                                <Package className="h-3 w-3 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  Size:
                                </span>
                                <span className="font-medium">
                                  {formatBytes(component.metrics.size)}
                                </span>
                              </div>
                            )}
                            {component.metrics.blockingTime !== undefined && (
                              <div className="flex items-center gap-1.5 text-xs">
                                <AlertTriangle className="h-3 w-3 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  Blocking:
                                </span>
                                <span className="font-medium">
                                  {Math.round(component.metrics.blockingTime)}ms
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Affected Metrics */}
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {component.affectedMetrics.map((metric) => (
                              <span
                                key={metric}
                                className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground"
                              >
                                {metric}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium",
                            config.bg,
                            config.color,
                          )}
                        >
                          <StatusIcon className="h-4 w-4" />
                          {config.label}
                        </div>
                      </div>

                      {/* Visual Status Bar */}
                      <div className="mt-4 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-1000",
                            component.status === "excellent" &&
                              "w-full bg-success",
                            component.status === "good" && "w-4/5 bg-success",
                            component.status === "needs-improvement" &&
                              "w-1/2 bg-warning",
                            component.status === "critical" &&
                              "w-1/4 bg-destructive",
                          )}
                        />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* AI Suggestions Section */}
      {activeSection === "suggestions" && (
        <div className="space-y-4">
          {isGeneratingAI ? (
            <Card className="p-8">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="relative">
                  <Sparkles className="h-12 w-12 text-primary animate-pulse" />
                  <Loader2 className="h-6 w-6 text-primary absolute -bottom-1 -right-1 animate-spin" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-foreground">
                    Generating AI Suggestions
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Analyzing performance data and creating prioritized
                    recommendations...
                  </p>
                </div>
                <div className="w-48 h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary via-accent to-primary animate-shimmer rounded-full" />
                </div>
              </div>
            </Card>
          ) : suggestions.length === 0 ? (
            <Card className="p-8 text-center">
              <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
              <h3 className="font-semibold text-foreground">
                Great Performance!
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                No major issues detected. Your site is well-optimized.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Priority Summary */}
              <Card className="p-4">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <span className="font-medium">AI-Powered Suggestions</span>
                  </div>
                  <div className="flex gap-4 text-sm">
                    {(["critical", "high", "medium", "low"] as const).map(
                      (priority) => {
                        const count = suggestions.filter(
                          (s) => s.priority === priority,
                        ).length;
                        if (count === 0) return null;
                        const config = priorityConfig[priority];
                        return (
                          <div
                            key={priority}
                            className="flex items-center gap-1.5"
                          >
                            <span
                              className={cn(
                                "w-2 h-2 rounded-full",
                                config.bg.replace("/10", ""),
                              )}
                            />
                            <span className="text-muted-foreground capitalize">
                              {priority}:
                            </span>
                            <span className="font-medium">{count}</span>
                          </div>
                        );
                      },
                    )}
                  </div>
                  <div className="ml-auto flex items-center gap-2 text-sm text-success">
                    <TrendingUp className="h-4 w-4" />
                    <span>
                      Potential gain: +
                      {suggestions.reduce((sum, s) => sum + s.potentialGain, 0)}{" "}
                      points
                    </span>
                  </div>
                </div>
              </Card>

              {/* Suggestions List */}
              {suggestions.map((suggestion, index) => {
                const config = priorityConfig[suggestion.priority];
                const PriorityIcon = config.icon;
                const isExpanded = expandedSuggestion === suggestion.id;

                return (
                  <Card
                    key={suggestion.id}
                    className={cn(
                      "overflow-hidden transition-all",
                      isExpanded && "ring-2 ring-primary/20",
                    )}
                  >
                    <div
                      className="p-4 cursor-pointer"
                      onClick={() =>
                        setExpandedSuggestion(isExpanded ? null : suggestion.id)
                      }
                    >
                      <div className="flex items-start gap-4">
                        {/* Priority Indicator */}
                        <div className="flex flex-col items-center gap-1">
                          <div className={cn("p-2 rounded-lg", config.bg)}>
                            <PriorityIcon
                              className={cn("h-5 w-5", config.color)}
                            />
                          </div>
                          <span className="text-xs font-medium text-muted-foreground">
                            #{index + 1}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-foreground">
                              {suggestion.title}
                            </h4>
                            <span
                              className={cn(
                                "text-xs px-2 py-0.5 rounded-full capitalize",
                                config.bg,
                                config.color,
                              )}
                            >
                              {suggestion.priority}
                            </span>
                            <span
                              className={cn(
                                "text-xs px-2 py-0.5 rounded-full",
                                suggestion.effort === "easy"
                                  ? "bg-success/10 text-success"
                                  : suggestion.effort === "medium"
                                    ? "bg-warning/10 text-warning"
                                    : "bg-destructive/10 text-destructive",
                              )}
                            >
                              {suggestion.effort} fix
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {suggestion.description}
                          </p>

                          <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-1.5 text-xs text-success">
                              <TrendingUp className="h-3 w-3" />
                              <span>{suggestion.estimatedImpact}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-primary">
                              <Target className="h-3 w-3" />
                              <span>+{suggestion.potentialGain} points</span>
                            </div>
                          </div>
                        </div>

                        {/* Expand Icon */}
                        <button className="p-1 hover:bg-secondary rounded">
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="border-t border-border p-4 bg-secondary/30 space-y-4">
                        {/* Why This Matters */}
                        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                          <h5 className="text-sm font-medium mb-1 flex items-center gap-2 text-primary">
                            <Lightbulb className="h-4 w-4" />
                            Why This Matters
                          </h5>
                          <p className="text-sm text-muted-foreground">
                            {suggestion.priority === "critical" &&
                              "This is a critical issue that significantly impacts user experience and Core Web Vitals scores. Fixing this should be your top priority."}
                            {suggestion.priority === "high" &&
                              "This issue has a noticeable impact on performance. Addressing it will provide meaningful improvements to your site's speed."}
                            {suggestion.priority === "medium" &&
                              "While not urgent, fixing this will contribute to overall performance improvements and better user experience."}
                            {suggestion.priority === "low" &&
                              "This is a minor optimization that can provide incremental improvements to your site's performance."}
                          </p>
                        </div>

                        {/* Affected Components */}
                        <div>
                          <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <Shield className="h-4 w-4 text-muted-foreground" />
                            Affected Components
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {suggestion.affectedComponents.map((comp) => (
                              <span
                                key={comp}
                                className="text-xs px-2 py-1 rounded bg-secondary text-foreground capitalize"
                              >
                                {comp.replace("-", " ").replace(/_/g, " ")}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Code Example */}
                        {suggestion.codeExample && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="text-sm font-medium flex items-center gap-2">
                                <Code className="h-4 w-4 text-muted-foreground" />
                                Implementation Example
                              </h5>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyCode(
                                    suggestion.codeExample!,
                                    suggestion.id,
                                  );
                                }}
                                className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-secondary hover:bg-secondary/80 transition-colors"
                              >
                                {copiedCode === suggestion.id ? (
                                  <>
                                    <Check className="h-3 w-3 text-success" />
                                    <span className="text-success">
                                      Copied!
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3" />
                                    <span>Copy Code</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <div className="relative">
                              <pre className="p-4 rounded-lg bg-background border border-border overflow-x-auto text-xs max-h-96">
                                <code className="text-foreground whitespace-pre">
                                  {suggestion.codeExample}
                                </code>
                              </pre>
                            </div>
                          </div>
                        )}

                        {/* Expected Results */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                            <h5 className="text-sm font-medium mb-1 flex items-center gap-2 text-success">
                              <TrendingUp className="h-4 w-4" />
                              Expected Impact
                            </h5>
                            <p className="text-sm text-muted-foreground">
                              {suggestion.estimatedImpact}
                            </p>
                          </div>
                          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                            <h5 className="text-sm font-medium mb-1 flex items-center gap-2 text-primary">
                              <Target className="h-4 w-4" />
                              Score Improvement
                            </h5>
                            <p className="text-2xl font-bold text-primary">
                              +{suggestion.potentialGain}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              potential points
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-2">
                          <a
                            href={`https://web.dev/articles/${suggestion.id.replace("optimize-", "").replace("fix-", "").replace("improve-", "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="h-4 w-4" />
                            Learn More on web.dev
                          </a>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedSuggestion(null);
                            }}
                            className="px-4 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
