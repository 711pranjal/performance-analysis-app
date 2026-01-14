'use client';

import { useEffect, useRef, useCallback } from 'react';

interface UseAutoRefreshOptions {
  enabled: boolean;
  intervalSeconds: number;
  onRefresh: () => void;
}

export function useAutoRefresh({ enabled, intervalSeconds, onRefresh }: UseAutoRefreshOptions) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastRefreshRef = useRef<Date | null>(null);

  const clearRefreshInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startRefreshInterval = useCallback(() => {
    clearRefreshInterval();
    if (enabled && intervalSeconds > 0) {
      intervalRef.current = setInterval(() => {
        lastRefreshRef.current = new Date();
        onRefresh();
      }, intervalSeconds * 1000);
    }
  }, [enabled, intervalSeconds, onRefresh, clearRefreshInterval]);

  useEffect(() => {
    if (enabled) {
      startRefreshInterval();
    } else {
      clearRefreshInterval();
    }

    return () => clearRefreshInterval();
  }, [enabled, startRefreshInterval, clearRefreshInterval]);

  const forceRefresh = useCallback(() => {
    lastRefreshRef.current = new Date();
    onRefresh();
    // Restart the interval after manual refresh
    if (enabled) {
      startRefreshInterval();
    }
  }, [enabled, onRefresh, startRefreshInterval]);

  return {
    lastRefresh: lastRefreshRef.current,
    forceRefresh,
    isAutoRefreshEnabled: enabled,
  };
}
