"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Header,
  UrlInput,
  StatsOverview,
  MetricCard,
  ScoreGauge,
  PerformanceChart,
  ResourceTable,
  RecentAnalyses,
  Recommendations,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Tabs,
  LoadingOverlay,
  MetricBreakdown,
  CompareView,
  ScoreBreakdown,
  WaterfallChart,
  SettingsPanel,
  PerformanceBudget,
  ExportOptions,
  InsightsSummary,
  HistoryTimeline,
  QuickActions,
  WelcomeCard,
  DetailedAnalysis,
} from "@/components";
import { usePerformanceStore } from "@/store/performanceStore";
import { useAutoRefresh, useKeyboardShortcuts, useLocalStorage } from "@/hooks";
import { PerformanceEntry, calculateOverallScore } from "@/types";
import { formatDate } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";
import {
  BarChart3,
  GitCompare,
  Layers,
  Zap,
  Target,
  Clock,
  Sparkles,
} from "lucide-react";

export default function Home() {
  const {
    entries,
    historicalData,
    isMonitoring,
    addEntry,
    removeEntry,
    setMonitoring,
    clearEntries,
  } = usePerformanceStore();

  const [selectedEntry, setSelectedEntry] = useState<PerformanceEntry | null>(
    entries[0] || null,
  );
  const [compareIds, setCompareIds] = useState<[string, string] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState("overview");
  const [settings, setSettings] = useLocalStorage("perf-settings", {
    autoRefresh: false,
    refreshInterval: 30,
    showRecommendations: true,
    darkMode: true,
    compactView: false,
    aiProvider: "local" as "local" | "openai",
    openaiApiKey: "",
  });

  // Reference for URL input focus
  const urlInputRef = useRef<HTMLInputElement>(null);

  const handleAnalyze = useCallback(
    (url: string) => {
      setMonitoring(true);
      setIsLoading(true);

      // Simulate analysis (in real app, this would use Performance API)
      setTimeout(() => {
        const metrics = {
          lcp: 1500 + Math.random() * 2500,
          fcp: 1000 + Math.random() * 2000,
          cls: Math.random() * 0.25,
          fid: 50 + Math.random() * 250,
          inp: 100 + Math.random() * 400,
          ttfb: 200 + Math.random() * 1000,
        };

        const newEntry: PerformanceEntry = {
          id: uuidv4(),
          url,
          timestamp: new Date(),
          metrics,
          resourceTimings: [
            {
              name: "bundle.js",
              initiatorType: "script",
              duration: 150 + Math.random() * 300,
              transferSize: Math.floor(100000 + Math.random() * 200000),
              startTime: 100,
            },
            {
              name: "styles.css",
              initiatorType: "link",
              duration: 50 + Math.random() * 100,
              transferSize: Math.floor(20000 + Math.random() * 30000),
              startTime: 50,
            },
            {
              name: "hero-image.webp",
              initiatorType: "img",
              duration: 200 + Math.random() * 400,
              transferSize: Math.floor(300000 + Math.random() * 500000),
              startTime: 200,
            },
            {
              name: "api/data",
              initiatorType: "fetch",
              duration: 100 + Math.random() * 200,
              transferSize: Math.floor(5000 + Math.random() * 10000),
              startTime: 300,
            },
            {
              name: "fonts.woff2",
              initiatorType: "font",
              duration: 80 + Math.random() * 120,
              transferSize: Math.floor(40000 + Math.random() * 60000),
              startTime: 150,
            },
          ],
          overallScore: calculateOverallScore(metrics),
        };

        addEntry(newEntry);
        setSelectedEntry(newEntry);
        setMonitoring(false);
        setIsLoading(false);
      }, 2000);
    },
    [addEntry, setMonitoring],
  );

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      id: "deep-analysis",
      label: "Deep Analysis",
      icon: <Sparkles className="h-4 w-4" />,
    },
    {
      id: "details",
      label: "Metrics",
      icon: <Layers className="h-4 w-4" />,
    },
    {
      id: "budget",
      label: "Budget",
      icon: <Target className="h-4 w-4" />,
    },
    {
      id: "compare",
      label: "Compare",
      icon: <GitCompare className="h-4 w-4" />,
    },
    { id: "resources", label: "Resources", icon: <Zap className="h-4 w-4" /> },
    { id: "history", label: "History", icon: <Clock className="h-4 w-4" /> },
  ];

  const handleClearAll = useCallback(() => {
    clearEntries();
    setSelectedEntry(null);
    setShowClearConfirm(false);
  }, [clearEntries]);

  const handleRefresh = useCallback(() => {
    if (selectedEntry) {
      handleAnalyze(selectedEntry.url);
    }
  }, [selectedEntry, handleAnalyze]);

  // Auto-refresh functionality
  useAutoRefresh({
    enabled: settings.autoRefresh && !!selectedEntry,
    intervalSeconds: settings.refreshInterval,
    onRefresh: handleRefresh,
  });

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onRefresh: selectedEntry ? handleRefresh : undefined,
    onExport: selectedEntry ? () => setShowExport(true) : undefined,
    onSettings: () => setShowSettings(true),
    onEscape: () => {
      setShowSettings(false);
      setShowExport(false);
    },
    onSearch: () => urlInputRef.current?.focus(),
  });

  return (
    <div className="min-h-screen bg-background">
      {isLoading && (
        <LoadingOverlay message="Analyzing website performance..." />
      )}

      <Header
        onExport={selectedEntry ? () => setShowExport(true) : undefined}
        onRefresh={selectedEntry ? handleRefresh : undefined}
        onSettings={() => setShowSettings(true)}
        isMonitoring={isMonitoring}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* URL Input */}
          <UrlInput
            ref={urlInputRef}
            onAnalyze={handleAnalyze}
            isMonitoring={isMonitoring}
            onStopMonitoring={() => setMonitoring(false)}
          />

          {/* Stats Overview */}
          <StatsOverview entries={entries} />

          {/* Main Content Grid */}
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left Column - Recent Analyses */}
            <div className="lg:col-span-1 space-y-6">
              <InsightsSummary entries={entries} currentEntry={selectedEntry} />
              <RecentAnalyses
                entries={entries}
                onSelect={setSelectedEntry}
                onDelete={removeEntry}
                selectedId={selectedEntry?.id}
              />
              {settings.showRecommendations && (
                <Recommendations entry={selectedEntry} />
              )}
            </div>

            {/* Right Column - Tabbed Content */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs tabs={tabs} defaultTab="overview">
                {(activeTab) => (
                  <>
                    {activeTab === "overview" && (
                      <div className="space-y-6">
                        {selectedEntry ? (
                          <>
                            {/* Score and URL */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="truncate max-w-lg">
                                  {selectedEntry.url}
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                                  <ScoreGauge
                                    score={selectedEntry.overallScore}
                                    size="lg"
                                  />
                                  <div className="flex-1 space-y-4">
                                    <div>
                                      <h4 className="text-sm font-medium text-muted-foreground">
                                        Analysis Time
                                      </h4>
                                      <p className="text-lg text-card-foreground">
                                        {formatDate(selectedEntry.timestamp)}
                                      </p>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                      <div>
                                        <p className="text-2xl font-bold text-primary">
                                          {Math.round(
                                            selectedEntry.metrics.lcp || 0,
                                          )}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          LCP (ms)
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-2xl font-bold text-accent">
                                          {(
                                            selectedEntry.metrics.cls || 0
                                          ).toFixed(3)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          CLS
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-2xl font-bold text-warning">
                                          {Math.round(
                                            selectedEntry.metrics.ttfb || 0,
                                          )}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          TTFB (ms)
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            {/* Score Breakdown */}
                            <ScoreBreakdown entry={selectedEntry} />

                            {/* Metrics Grid */}
                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                              <MetricCard
                                name="LCP"
                                fullName="Largest Contentful Paint"
                                value={selectedEntry.metrics.lcp || 0}
                                description="Measures loading performance. Should occur within 2.5s."
                              />
                              <MetricCard
                                name="FCP"
                                fullName="First Contentful Paint"
                                value={selectedEntry.metrics.fcp || 0}
                                description="Time until first content is rendered on screen."
                              />
                              <MetricCard
                                name="CLS"
                                fullName="Cumulative Layout Shift"
                                value={selectedEntry.metrics.cls || 0}
                                description="Measures visual stability. Should be less than 0.1."
                              />
                              <MetricCard
                                name="FID"
                                fullName="First Input Delay"
                                value={selectedEntry.metrics.fid || 0}
                                description="Time from first interaction to browser response."
                              />
                              <MetricCard
                                name="INP"
                                fullName="Interaction to Next Paint"
                                value={selectedEntry.metrics.inp || 0}
                                description="Measures overall responsiveness to user interactions."
                              />
                              <MetricCard
                                name="TTFB"
                                fullName="Time to First Byte"
                                value={selectedEntry.metrics.ttfb || 0}
                                description="Time until first byte of response is received."
                              />
                            </div>

                            {/* Historical Chart */}
                            <PerformanceChart data={historicalData} />
                          </>
                        ) : (
                          <Card className="py-16">
                            <CardContent className="text-center">
                              <p className="text-lg text-muted-foreground">
                                Enter a URL above to analyze performance, or
                                select a recent analysis.
                              </p>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    )}

                    {activeTab === "deep-analysis" && (
                      <div className="space-y-6">
                        {selectedEntry ? (
                          <DetailedAnalysis entry={selectedEntry} />
                        ) : (
                          <Card className="py-16">
                            <CardContent className="text-center">
                              <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
                              <p className="text-lg text-muted-foreground">
                                Select an analysis to see AI-powered deep
                                analysis with component-level breakdown.
                              </p>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    )}

                    {activeTab === "details" && (
                      <div className="space-y-6">
                        {selectedEntry ? (
                          <MetricBreakdown entry={selectedEntry} />
                        ) : (
                          <Card className="py-16">
                            <CardContent className="text-center">
                              <p className="text-lg text-muted-foreground">
                                Select an analysis to see detailed breakdown.
                              </p>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    )}

                    {activeTab === "compare" && (
                      <CompareView
                        entries={entries}
                        selectedIds={compareIds}
                        onSelect={setCompareIds}
                      />
                    )}

                    {activeTab === "budget" && (
                      <div className="space-y-6">
                        {selectedEntry ? (
                          <PerformanceBudget entry={selectedEntry} />
                        ) : (
                          <Card className="py-16">
                            <CardContent className="text-center">
                              <p className="text-lg text-muted-foreground">
                                Select an analysis to see performance budget.
                              </p>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    )}

                    {activeTab === "resources" && (
                      <div className="space-y-6">
                        {selectedEntry ? (
                          <>
                            <WaterfallChart
                              resources={selectedEntry.resourceTimings}
                            />
                            <ResourceTable
                              resources={selectedEntry.resourceTimings}
                            />
                          </>
                        ) : (
                          <Card className="py-16">
                            <CardContent className="text-center">
                              <p className="text-lg text-muted-foreground">
                                Select an analysis to see resource timings.
                              </p>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    )}

                    {activeTab === "history" && (
                      <div className="space-y-6">
                        {entries.length > 0 ? (
                          <HistoryTimeline
                            entries={entries}
                            onSelect={setSelectedEntry}
                            selectedId={selectedEntry?.id}
                            maxItems={20}
                          />
                        ) : (
                          <Card className="py-16">
                            <CardContent className="text-center">
                              <p className="text-lg text-muted-foreground">
                                No analysis history yet. Start by analyzing a
                                URL.
                              </p>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    )}
                  </>
                )}
              </Tabs>
            </div>
          </div>
        </div>
      </main>

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSave={setSettings}
      />

      {/* Export Options */}
      <ExportOptions
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        entry={selectedEntry}
        entries={entries}
      />

      {/* Clear Confirmation Dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Card className="w-full max-w-md mx-4 animate-slide-in">
            <CardHeader>
              <CardTitle className="text-destructive">
                Clear All Analyses?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                This will permanently delete all {entries.length} analyses. This
                action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-2 px-4 rounded-lg border border-border hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAll}
                  className="flex-1 py-2 px-4 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                >
                  Delete All
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3">
            {/* Brand */}
            <div>
              <h3 className="font-bold text-foreground mb-2">Perf Analyzer</h3>
              <p className="text-sm text-muted-foreground">
                Monitor and optimize your web performance with Core Web Vitals
                tracking.
              </p>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-medium text-foreground mb-2">Resources</h4>
              <ul className="space-y-1 text-sm">
                <li>
                  <a
                    href="https://web.dev/vitals/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Web Vitals Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="https://pagespeed.web.dev/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    PageSpeed Insights
                  </a>
                </li>
                <li>
                  <a
                    href="https://developer.chrome.com/docs/lighthouse/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Lighthouse
                  </a>
                </li>
              </ul>
            </div>

            {/* Tech Stack */}
            <div>
              <h4 className="font-medium text-foreground mb-2">Built With</h4>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-secondary rounded text-xs text-muted-foreground">
                  Next.js
                </span>
                <span className="px-2 py-1 bg-secondary rounded text-xs text-muted-foreground">
                  React
                </span>
                <span className="px-2 py-1 bg-secondary rounded text-xs text-muted-foreground">
                  TypeScript
                </span>
                <span className="px-2 py-1 bg-secondary rounded text-xs text-muted-foreground">
                  Tailwind CSS
                </span>
                <span className="px-2 py-1 bg-secondary rounded text-xs text-muted-foreground">
                  Recharts
                </span>
                <span className="px-2 py-1 bg-secondary rounded text-xs text-muted-foreground">
                  Zustand
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-border text-center text-xs text-muted-foreground">
            <p>
              © {new Date().getFullYear()} Perf Analyzer. Performance monitoring
              made simple.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
