"use client";

import { useState, forwardRef } from "react";
import { Button } from "./Button";
import { Card } from "./Card";
import { Globe, Play, Square, Command } from "lucide-react";

interface UrlInputProps {
  onAnalyze: (url: string) => void;
  isMonitoring: boolean;
  onStopMonitoring: () => void;
}

export const UrlInput = forwardRef<HTMLInputElement, UrlInputProps>(
  function UrlInput({ onAnalyze, isMonitoring, onStopMonitoring }, ref) {
    const [url, setUrl] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (url.trim()) {
        onAnalyze(url.trim());
      }
    };

    return (
      <Card className="gradient-primary border-0">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 sm:flex-row"
        >
          <div className="relative flex-1">
            <Globe className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/60" />
            <input
              ref={ref}
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Enter URL to analyze (e.g., https://example.com)"
              className="h-12 w-full rounded-lg bg-white/10 pl-10 pr-20 text-white placeholder-white/60 outline-none ring-2 ring-white/20 transition-all focus:ring-white/40"
              disabled={isMonitoring}
            />
            {!isFocused && !url && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 text-white/40 text-xs">
                <Command className="h-3 w-3" />
                <span>K</span>
              </div>
            )}
          </div>
          {isMonitoring ? (
            <Button
              type="button"
              onClick={onStopMonitoring}
              variant="destructive"
              size="lg"
              className="min-w-[140px]"
            >
              <Square className="h-4 w-4" />
              Stop
            </Button>
          ) : (
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 h-12 px-6 text-base min-w-[140px] bg-white text-blue-600 hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="h-4 w-4" />
              Analyze
            </button>
          )}
        </form>
      </Card>
    );
  },
);
