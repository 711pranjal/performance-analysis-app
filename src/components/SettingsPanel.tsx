"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./Card";
import { Button } from "./Button";
import {
  X,
  Save,
  RotateCcw,
  Sparkles,
  Key,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface Settings {
  autoRefresh: boolean;
  refreshInterval: number;
  showRecommendations: boolean;
  darkMode: boolean;
  compactView: boolean;
  aiProvider: "local" | "openai";
  openaiApiKey: string;
}

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSave: (settings: Settings) => void;
}

export function SettingsPanel({
  isOpen,
  onClose,
  settings,
  onSave,
}: SettingsPanelProps) {
  const [localSettings, setLocalSettings] = useState<Settings>({
    ...settings,
    aiProvider: settings.aiProvider || "local",
    openaiApiKey: settings.openaiApiKey || "",
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const handleReset = () => {
    const defaultSettings: Settings = {
      autoRefresh: false,
      refreshInterval: 30,
      showRecommendations: true,
      darkMode: true,
      compactView: false,
      aiProvider: "local",
      openaiApiKey: "",
    };
    setLocalSettings(defaultSettings);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-md animate-slide-in max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Settings</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Auto Refresh */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto Refresh</p>
              <p className="text-sm text-muted-foreground">
                Automatically refresh analysis
              </p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={localSettings.autoRefresh}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    autoRefresh: e.target.checked,
                  })
                }
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-secondary after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full" />
            </label>
          </div>

          {/* Refresh Interval */}
          {localSettings.autoRefresh && (
            <div>
              <label className="block font-medium mb-2">
                Refresh Interval (seconds)
              </label>
              <input
                type="number"
                min="10"
                max="300"
                value={localSettings.refreshInterval}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    refreshInterval: parseInt(e.target.value) || 30,
                  })
                }
                className="w-full rounded-lg bg-secondary border border-border p-3 text-foreground"
              />
            </div>
          )}

          {/* Show Recommendations */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Show Recommendations</p>
              <p className="text-sm text-muted-foreground">
                Display optimization tips
              </p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={localSettings.showRecommendations}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    showRecommendations: e.target.checked,
                  })
                }
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-secondary after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full" />
            </label>
          </div>

          {/* Compact View */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Compact View</p>
              <p className="text-sm text-muted-foreground">
                Use smaller cards and spacing
              </p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={localSettings.compactView}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    compactView: e.target.checked,
                  })
                }
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-secondary after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full" />
            </label>
          </div>

          {/* Advanced Settings Toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI Settings
            </span>
            {showAdvanced ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {/* AI Settings */}
          {showAdvanced && (
            <div className="space-y-4 p-4 rounded-lg bg-secondary/50 border border-border">
              {/* AI Provider */}
              <div>
                <label className="block font-medium mb-2">AI Provider</label>
                <select
                  value={localSettings.aiProvider}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      aiProvider: e.target.value as "local" | "openai",
                    })
                  }
                  className="w-full rounded-lg bg-secondary border border-border p-3 text-foreground"
                >
                  <option value="local">Local (Rule-based Analysis)</option>
                  <option value="openai">OpenAI GPT-4</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  {localSettings.aiProvider === "local"
                    ? "Uses built-in rules to generate suggestions. No API key required."
                    : "Uses OpenAI GPT-4 for more detailed, context-aware suggestions."}
                </p>
              </div>

              {/* OpenAI API Key */}
              {localSettings.aiProvider === "openai" && (
                <div>
                  <label className="block font-medium mb-2 flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    OpenAI API Key
                  </label>
                  <input
                    type="password"
                    value={localSettings.openaiApiKey}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        openaiApiKey: e.target.value,
                      })
                    }
                    placeholder="sk-..."
                    className="w-full rounded-lg bg-secondary border border-border p-3 text-foreground font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Your API key is stored locally and never sent to our
                    servers.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={handleReset} className="flex-1">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button variant="primary" onClick={handleSave} className="flex-1">
              <Save className="h-4 w-4" />
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
