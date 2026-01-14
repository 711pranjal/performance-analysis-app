'use client';

import { useEffect, useCallback } from 'react';

interface ShortcutHandlers {
  onRefresh?: () => void;
  onExport?: () => void;
  onSettings?: () => void;
  onEscape?: () => void;
  onSearch?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Check if user is typing in an input
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      if (event.key === 'Escape' && handlers.onEscape) {
        handlers.onEscape();
        target.blur();
      }
      return;
    }

    // Cmd/Ctrl + R - Refresh
    if ((event.metaKey || event.ctrlKey) && event.key === 'r') {
      event.preventDefault();
      handlers.onRefresh?.();
    }

    // Cmd/Ctrl + E - Export
    if ((event.metaKey || event.ctrlKey) && event.key === 'e') {
      event.preventDefault();
      handlers.onExport?.();
    }

    // Cmd/Ctrl + , - Settings
    if ((event.metaKey || event.ctrlKey) && event.key === ',') {
      event.preventDefault();
      handlers.onSettings?.();
    }

    // Cmd/Ctrl + K - Focus search
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      handlers.onSearch?.();
    }

    // Escape - Close modals
    if (event.key === 'Escape') {
      handlers.onEscape?.();
    }
  }, [handlers]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
