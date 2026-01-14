"use client";

import { Card, CardHeader, CardTitle, CardContent } from "./Card";
import { ResourceTiming } from "@/types";
import { formatDuration, formatBytes } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface WaterfallChartProps {
  resources: ResourceTiming[];
}

const TYPE_COLORS: Record<string, string> = {
  script: "bg-yellow-500",
  link: "bg-purple-500",
  css: "bg-purple-500",
  img: "bg-blue-500",
  fetch: "bg-green-500",
  xmlhttprequest: "bg-green-500",
  font: "bg-pink-500",
  other: "bg-gray-500",
};

export function WaterfallChart({ resources }: WaterfallChartProps) {
  if (resources.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resource Waterfall</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No resources to display
          </p>
        </CardContent>
      </Card>
    );
  }

  // Sort by start time
  const sortedResources = [...resources].sort(
    (a, b) => a.startTime - b.startTime,
  );

  // Calculate the total timeline
  const maxEndTime = Math.max(
    ...sortedResources.map((r) => r.startTime + r.duration),
  );
  const minStartTime = Math.min(...sortedResources.map((r) => r.startTime));
  const totalDuration = maxEndTime - minStartTime;

  // Generate timeline markers
  const markers: number[] = [];
  const markerCount = 5;
  for (let i = 0; i <= markerCount; i++) {
    markers.push(Math.round((totalDuration / markerCount) * i));
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Resource Waterfall</CardTitle>
          <div className="flex gap-4 text-xs">
            {Object.entries(TYPE_COLORS)
              .slice(0, 5)
              .map(([type, color]) => (
                <div key={type} className="flex items-center gap-1">
                  <div className={cn("h-3 w-3 rounded", color)} />
                  <span className="capitalize text-muted-foreground">
                    {type}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Timeline header */}
        <div className="mb-2 flex border-b border-border pb-2">
          <div className="w-48 shrink-0 text-xs text-muted-foreground">
            Resource
          </div>
          <div className="flex-1 relative">
            <div className="flex justify-between text-xs text-muted-foreground">
              {markers.map((time, i) => (
                <span key={i}>{formatDuration(time)}</span>
              ))}
            </div>
          </div>
          <div className="w-20 shrink-0 text-right text-xs text-muted-foreground">
            Size
          </div>
        </div>

        {/* Resources */}
        <div className="space-y-1 max-h-[400px] overflow-y-auto">
          {sortedResources.map((resource, index) => {
            const startPercent =
              ((resource.startTime - minStartTime) / totalDuration) * 100;
            const widthPercent = (resource.duration / totalDuration) * 100;
            const color =
              TYPE_COLORS[resource.initiatorType] || TYPE_COLORS.other;

            return (
              <div
                key={index}
                className="flex items-center group hover:bg-secondary/30 rounded px-1 py-1 transition-colors"
              >
                {/* Resource name */}
                <div className="w-48 shrink-0 pr-2">
                  <p
                    className="text-xs truncate text-card-foreground"
                    title={resource.name}
                  >
                    {resource.name.split("/").pop() || resource.name}
                  </p>
                </div>

                {/* Waterfall bar */}
                <div className="flex-1 relative h-5">
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex justify-between">
                    {markers.map((_, i) => (
                      <div key={i} className="w-px bg-border h-full" />
                    ))}
                  </div>

                  {/* Bar */}
                  <div
                    className={cn(
                      "absolute h-4 top-0.5 rounded-sm transition-all",
                      color,
                      "group-hover:opacity-80",
                    )}
                    style={{
                      left: `${startPercent}%`,
                      width: `${Math.max(widthPercent, 0.5)}%`,
                    }}
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block z-10">
                      <div className="rounded bg-card border border-border p-2 shadow-lg text-xs whitespace-nowrap">
                        <p className="font-medium">
                          {resource.name.split("/").pop()}
                        </p>
                        <p className="text-muted-foreground">
                          Start: {formatDuration(resource.startTime)}
                        </p>
                        <p className="text-muted-foreground">
                          Duration: {formatDuration(resource.duration)}
                        </p>
                        <p className="text-muted-foreground">
                          Size: {formatBytes(resource.transferSize)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Size */}
                <div className="w-20 shrink-0 text-right">
                  <span className="text-xs text-muted-foreground">
                    {formatBytes(resource.transferSize)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-primary">
              {resources.length}
            </p>
            <p className="text-xs text-muted-foreground">Total Requests</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-accent">
              {formatBytes(
                resources.reduce((sum, r) => sum + r.transferSize, 0),
              )}
            </p>
            <p className="text-xs text-muted-foreground">Total Size</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-warning">
              {formatDuration(totalDuration)}
            </p>
            <p className="text-xs text-muted-foreground">Total Time</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
