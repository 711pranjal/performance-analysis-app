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
        async (url: string) => {
            setMonitoring(true);
            setIsLoading(true);

            try {
                // Call the PageSpeed Insights API route
                const response = await fetch("/api/pagespeed", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        url,
                        strategy: "mobile", // TODO: Add device type selector to UI
                    }),
                });

                const data = await response.json();

                // Log the full API response for debugging
                console.log("PageSpeed API Response:", data);

                if (!response.ok) {
                    console.error("PageSpeed API Error:", data.error);
                    // For now, show alert and stop loading
                    alert(`Error: ${data.error}`);
                    setMonitoring(false);
                    setIsLoading(false);
                    return;
                }

                // Extract metrics from PageSpeed response
                // The PageSpeed API returns metrics in lighthouseResult.audits
                const lighthouseResult = data.lighthouseResult;
                const audits = lighthouseResult?.audits || {};

                // Log the audits for inspection
                console.log("Lighthouse Audits:", audits);
                console.log("Categories:", lighthouseResult?.categories);

                // Extract Core Web Vitals from the response
                // Values are in milliseconds for timing metrics, unitless for CLS
                const metrics = {
                    lcp: audits["largest-contentful-paint"]?.numericValue || 0,
                    fcp: audits["first-contentful-paint"]?.numericValue || 0,
                    cls: audits["cumulative-layout-shift"]?.numericValue || 0,
                    fid: audits["max-potential-fid"]?.numericValue || 0, // FID is approximated by max-potential-fid in Lighthouse
                    inp:
                        audits["interaction-to-next-paint"]?.numericValue ||
                        audits["total-blocking-time"]?.numericValue ||
                        0, // INP or fallback to TBT
                    ttfb: audits["server-response-time"]?.numericValue || 0,
                };

                console.log("Extracted Metrics:", metrics);

                // Extract resource timings from network-requests audit if available
                const networkRequests =
                    audits["network-requests"]?.details?.items || [];
                const resourceTimings = networkRequests
                    .slice(0, 10)
                    .map(
                        (item: {
                            url?: string;
                            resourceType?: string;
                            transferSize?: number;
                            endTime?: number;
                            startTime?: number;
                        }) => ({
                            name: item.url
                                ? new URL(item.url).pathname.split("/").pop() ||
                                  item.url
                                : "unknown",
                            initiatorType: item.resourceType || "other",
                            duration:
                                (item.endTime || 0) - (item.startTime || 0),
                            transferSize: item.transferSize || 0,
                            startTime: item.startTime || 0,
                        }),
                    );

                console.log("Resource Timings:", resourceTimings);

                const newEntry: PerformanceEntry = {
                    id: uuidv4(),
                    url,
                    timestamp: new Date(),
                    metrics,
                    resourceTimings:
                        resourceTimings.length > 0
                            ? resourceTimings
                            : [
                                  // Fallback to placeholder if no network data
                                  {
                                      name: "page-load",
                                      initiatorType: "document",
                                      duration: metrics.lcp,
                                      transferSize: 0,
                                      startTime: 0,
                                  },
                              ],
                    overallScore: calculateOverallScore(metrics),
                };

                console.log("New Entry:", newEntry);

                addEntry(newEntry);
                setSelectedEntry(newEntry);
            } catch (error) {
                console.error("Failed to analyze URL:", error);
                alert("Failed to analyze URL. Check the console for details.");
            } finally {
                setMonitoring(false);
                setIsLoading(false);
            }
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
        {
            id: "resources",
            label: "Resources",
            icon: <Zap className="h-4 w-4" />,
        },
        {
            id: "history",
            label: "History",
            icon: <Clock className="h-4 w-4" />,
        },
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
                            <InsightsSummary
                                entries={entries}
                                currentEntry={selectedEntry}
                            />
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
                                                                    {
                                                                        selectedEntry.url
                                                                    }
                                                                </CardTitle>
                                                            </CardHeader>
                                                            <CardContent>
                                                                <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                                                                    <ScoreGauge
                                                                        score={
                                                                            selectedEntry.overallScore
                                                                        }
                                                                        size="lg"
                                                                    />
                                                                    <div className="flex-1 space-y-4">
                                                                        <div>
                                                                            <h4 className="text-sm font-medium text-muted-foreground">
                                                                                Analysis
                                                                                Time
                                                                            </h4>
                                                                            <p className="text-lg text-card-foreground">
                                                                                {formatDate(
                                                                                    selectedEntry.timestamp,
                                                                                )}
                                                                            </p>
                                                                        </div>
                                                                        <div className="grid grid-cols-3 gap-4 text-center">
                                                                            <div>
                                                                                <p className="text-2xl font-bold text-primary">
                                                                                    {Math.round(
                                                                                        selectedEntry
                                                                                            .metrics
                                                                                            .lcp ||
                                                                                            0,
                                                                                    )}
                                                                                </p>
                                                                                <p className="text-xs text-muted-foreground">
                                                                                    LCP
                                                                                    (ms)
                                                                                </p>
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-2xl font-bold text-accent">
                                                                                    {(
                                                                                        selectedEntry
                                                                                            .metrics
                                                                                            .cls ||
                                                                                        0
                                                                                    ).toFixed(
                                                                                        3,
                                                                                    )}
                                                                                </p>
                                                                                <p className="text-xs text-muted-foreground">
                                                                                    CLS
                                                                                </p>
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-2xl font-bold text-warning">
                                                                                    {Math.round(
                                                                                        selectedEntry
                                                                                            .metrics
                                                                                            .ttfb ||
                                                                                            0,
                                                                                    )}
                                                                                </p>
                                                                                <p className="text-xs text-muted-foreground">
                                                                                    TTFB
                                                                                    (ms)
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </CardContent>
                                                        </Card>

                                                        {/* Score Breakdown */}
                                                        <ScoreBreakdown
                                                            entry={
                                                                selectedEntry
                                                            }
                                                        />

                                                        {/* Metrics Grid */}
                                                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                                            <MetricCard
                                                                name="LCP"
                                                                fullName="Largest Contentful Paint"
                                                                value={
                                                                    selectedEntry
                                                                        .metrics
                                                                        .lcp ||
                                                                    0
                                                                }
                                                                description="Measures loading performance. Should occur within 2.5s."
                                                            />
                                                            <MetricCard
                                                                name="FCP"
                                                                fullName="First Contentful Paint"
                                                                value={
                                                                    selectedEntry
                                                                        .metrics
                                                                        .fcp ||
                                                                    0
                                                                }
                                                                description="Time until first content is rendered on screen."
                                                            />
                                                            <MetricCard
                                                                name="CLS"
                                                                fullName="Cumulative Layout Shift"
                                                                value={
                                                                    selectedEntry
                                                                        .metrics
                                                                        .cls ||
                                                                    0
                                                                }
                                                                description="Measures visual stability. Should be less than 0.1."
                                                            />
                                                            <MetricCard
                                                                name="FID"
                                                                fullName="First Input Delay"
                                                                value={
                                                                    selectedEntry
                                                                        .metrics
                                                                        .fid ||
                                                                    0
                                                                }
                                                                description="Time from first interaction to browser response."
                                                            />
                                                            <MetricCard
                                                                name="INP"
                                                                fullName="Interaction to Next Paint"
                                                                value={
                                                                    selectedEntry
                                                                        .metrics
                                                                        .inp ||
                                                                    0
                                                                }
                                                                description="Measures overall responsiveness to user interactions."
                                                            />
                                                            <MetricCard
                                                                name="TTFB"
                                                                fullName="Time to First Byte"
                                                                value={
                                                                    selectedEntry
                                                                        .metrics
                                                                        .ttfb ||
                                                                    0
                                                                }
                                                                description="Time until first byte of response is received."
                                                            />
                                                        </div>

                                                        {/* Historical Chart */}
                                                        <PerformanceChart
                                                            data={
                                                                historicalData
                                                            }
                                                        />
                                                    </>
                                                ) : (
                                                    <Card className="py-16">
                                                        <CardContent className="text-center">
                                                            <p className="text-lg text-muted-foreground">
                                                                Enter a URL
                                                                above to analyze
                                                                performance, or
                                                                select a recent
                                                                analysis.
                                                            </p>
                                                        </CardContent>
                                                    </Card>
                                                )}
                                            </div>
                                        )}

                                        {activeTab === "deep-analysis" && (
                                            <div className="space-y-6">
                                                {selectedEntry ? (
                                                    <DetailedAnalysis
                                                        entry={selectedEntry}
                                                    />
                                                ) : (
                                                    <Card className="py-16">
                                                        <CardContent className="text-center">
                                                            <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
                                                            <p className="text-lg text-muted-foreground">
                                                                Select an
                                                                analysis to see
                                                                AI-powered deep
                                                                analysis with
                                                                component-level
                                                                breakdown.
                                                            </p>
                                                        </CardContent>
                                                    </Card>
                                                )}
                                            </div>
                                        )}

                                        {activeTab === "details" && (
                                            <div className="space-y-6">
                                                {selectedEntry ? (
                                                    <MetricBreakdown
                                                        entry={selectedEntry}
                                                    />
                                                ) : (
                                                    <Card className="py-16">
                                                        <CardContent className="text-center">
                                                            <p className="text-lg text-muted-foreground">
                                                                Select an
                                                                analysis to see
                                                                detailed
                                                                breakdown.
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
                                                    <PerformanceBudget
                                                        entry={selectedEntry}
                                                    />
                                                ) : (
                                                    <Card className="py-16">
                                                        <CardContent className="text-center">
                                                            <p className="text-lg text-muted-foreground">
                                                                Select an
                                                                analysis to see
                                                                performance
                                                                budget.
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
                                                            resources={
                                                                selectedEntry.resourceTimings
                                                            }
                                                        />
                                                        <ResourceTable
                                                            resources={
                                                                selectedEntry.resourceTimings
                                                            }
                                                        />
                                                    </>
                                                ) : (
                                                    <Card className="py-16">
                                                        <CardContent className="text-center">
                                                            <p className="text-lg text-muted-foreground">
                                                                Select an
                                                                analysis to see
                                                                resource
                                                                timings.
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
                                                        onSelect={
                                                            setSelectedEntry
                                                        }
                                                        selectedId={
                                                            selectedEntry?.id
                                                        }
                                                        maxItems={20}
                                                    />
                                                ) : (
                                                    <Card className="py-16">
                                                        <CardContent className="text-center">
                                                            <p className="text-lg text-muted-foreground">
                                                                No analysis
                                                                history yet.
                                                                Start by
                                                                analyzing a URL.
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
                                This will permanently delete all{" "}
                                {entries.length} analyses. This action cannot be
                                undone.
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
                            <h3 className="font-bold text-foreground mb-2">
                                Perf Analyzer
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Monitor and optimize your web performance with
                                Core Web Vitals tracking.
                            </p>
                        </div>

                        {/* Resources */}
                        <div>
                            <h4 className="font-medium text-foreground mb-2">
                                Resources
                            </h4>
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
                            <h4 className="font-medium text-foreground mb-2">
                                Built With
                            </h4>
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
                            © {new Date().getFullYear()} Perf Analyzer.
                            Performance monitoring made simple.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
