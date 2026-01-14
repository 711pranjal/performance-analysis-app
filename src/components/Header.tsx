"use client";

import {
  Activity,
  Download,
  RefreshCw,
  Settings,
  Keyboard,
} from "lucide-react";
import { Button } from "./Button";
import { ThemeToggle } from "./ThemeToggle";
import { useState } from "react";

interface HeaderProps {
  onExport?: () => void;
  onRefresh?: () => void;
  onSettings?: () => void;
  isMonitoring?: boolean;
}

export function Header({
  onExport,
  onRefresh,
  onSettings,
  isMonitoring,
}: HeaderProps) {
  const [showShortcuts, setShowShortcuts] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Perf Analyzer
              </h1>
              <p className="text-xs text-muted-foreground">
                Web Performance Dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isMonitoring && (
              <div className="flex items-center gap-2 rounded-full bg-success/20 px-3 py-1">
                <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
                <span className="text-sm text-success">Monitoring</span>
              </div>
            )}

            {onRefresh && (
              <Button variant="ghost" size="sm" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            )}

            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowShortcuts(true)}
              title="Keyboard Shortcuts"
            >
              <Keyboard className="h-4 w-4" />
            </Button>

            <ThemeToggle />

            <Button variant="ghost" size="sm" onClick={onSettings}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={() => setShowShortcuts(false)}
        >
          <div
            className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4 animate-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4 text-card-foreground">
              Keyboard Shortcuts
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">
                  Search / Focus URL
                </span>
                <kbd className="px-2 py-1 bg-secondary rounded text-xs font-mono">
                  ⌘ K
                </kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Refresh Analysis</span>
                <kbd className="px-2 py-1 bg-secondary rounded text-xs font-mono">
                  ⌘ R
                </kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Export Report</span>
                <kbd className="px-2 py-1 bg-secondary rounded text-xs font-mono">
                  ⌘ E
                </kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Open Settings</span>
                <kbd className="px-2 py-1 bg-secondary rounded text-xs font-mono">
                  ⌘ ,
                </kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Close Modal</span>
                <kbd className="px-2 py-1 bg-secondary rounded text-xs font-mono">
                  Esc
                </kbd>
              </div>
            </div>
            <button
              className="mt-6 w-full py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              onClick={() => setShowShortcuts(false)}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
