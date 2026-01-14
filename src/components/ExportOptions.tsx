"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./Card";
import { Button } from "./Button";
import { PerformanceEntry } from "@/types";
import { formatDate } from "@/lib/utils";
import { Download, FileText, FileJson, Image, X } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ExportOptionsProps {
  isOpen: boolean;
  onClose: () => void;
  entry: PerformanceEntry | null;
  entries: PerformanceEntry[];
}

export function ExportOptions({
  isOpen,
  onClose,
  entry,
  entries,
}: ExportOptionsProps) {
  const [exporting, setExporting] = useState<string | null>(null);

  if (!isOpen) return null;

  const exportToPDF = async () => {
    if (!entry) return;
    setExporting("pdf");

    try {
      const doc = new jsPDF();
      const { metrics, url, timestamp, overallScore } = entry;

      // Title
      doc.setFontSize(20);
      doc.setTextColor(59, 130, 246);
      doc.text("Performance Report", 20, 20);

      // URL and Date
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text(`URL: ${url}`, 20, 35);
      doc.text(`Date: ${formatDate(timestamp)}`, 20, 42);
      doc.text(`Overall Score: ${Math.round(overallScore)}%`, 20, 49);

      // Metrics Table
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text("Core Web Vitals", 20, 65);

      const metricsData = [
        [
          "LCP",
          `${Math.round(metrics.lcp || 0)}ms`,
          "Largest Contentful Paint",
        ],
        ["FCP", `${Math.round(metrics.fcp || 0)}ms`, "First Contentful Paint"],
        ["CLS", (metrics.cls || 0).toFixed(3), "Cumulative Layout Shift"],
        ["FID", `${Math.round(metrics.fid || 0)}ms`, "First Input Delay"],
        [
          "INP",
          `${Math.round(metrics.inp || 0)}ms`,
          "Interaction to Next Paint",
        ],
        ["TTFB", `${Math.round(metrics.ttfb || 0)}ms`, "Time to First Byte"],
      ];

      autoTable(doc, {
        startY: 70,
        head: [["Metric", "Value", "Description"]],
        body: metricsData,
        theme: "striped",
        headStyles: { fillColor: [59, 130, 246] },
      });

      doc.save(
        `performance-report-${new Date().toISOString().split("T")[0]}.pdf`,
      );
    } finally {
      setExporting(null);
    }
  };

  const exportToJSON = () => {
    if (!entry) return;
    setExporting("json");

    try {
      const data = JSON.stringify(entry, null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `performance-data-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(null);
    }
  };

  const exportAllToJSON = () => {
    setExporting("json-all");

    try {
      const data = JSON.stringify(entries, null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `all-performance-data-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(null);
    }
  };

  const exportToCSV = () => {
    if (!entry) return;
    setExporting("csv");

    try {
      const headers = ["Metric", "Value"];
      const rows = [
        ["URL", entry.url],
        ["Date", new Date(entry.timestamp).toISOString()],
        ["Score", entry.overallScore.toString()],
        ["LCP (ms)", (entry.metrics.lcp || 0).toString()],
        ["FCP (ms)", (entry.metrics.fcp || 0).toString()],
        ["CLS", (entry.metrics.cls || 0).toString()],
        ["FID (ms)", (entry.metrics.fid || 0).toString()],
        ["INP (ms)", (entry.metrics.inp || 0).toString()],
        ["TTFB (ms)", (entry.metrics.ttfb || 0).toString()],
      ];

      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join(
        "\n",
      );
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `performance-data-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-md animate-slide-in">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Export Options</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {entry ? (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Export data for:{" "}
                <span className="font-medium text-foreground">{entry.url}</span>
              </p>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={exportToPDF}
                disabled={exporting !== null}
              >
                <FileText className="h-4 w-4 text-red-500" />
                {exporting === "pdf" ? "Exporting..." : "Export as PDF Report"}
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={exportToJSON}
                disabled={exporting !== null}
              >
                <FileJson className="h-4 w-4 text-yellow-500" />
                {exporting === "json" ? "Exporting..." : "Export as JSON"}
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={exportToCSV}
                disabled={exporting !== null}
              >
                <FileText className="h-4 w-4 text-green-500" />
                {exporting === "csv" ? "Exporting..." : "Export as CSV"}
              </Button>

              <div className="border-t border-border pt-4 mt-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Export all analyses:
                </p>
                <Button
                  variant="secondary"
                  className="w-full justify-start"
                  onClick={exportAllToJSON}
                  disabled={exporting !== null}
                >
                  <Download className="h-4 w-4" />
                  {exporting === "json-all"
                    ? "Exporting..."
                    : `Export All (${entries.length} entries)`}
                </Button>
              </div>
            </>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              Select an analysis to export
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
