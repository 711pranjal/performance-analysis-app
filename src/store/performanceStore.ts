import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { PerformanceEntry, HistoricalData } from "@/types";
import { v4 as uuidv4 } from "uuid";

interface PerformanceState {
  entries: PerformanceEntry[];
  historicalData: HistoricalData[];
  isMonitoring: boolean;
  currentUrl: string;
  isHydrated: boolean;

  // Actions
  addEntry: (entry: Omit<PerformanceEntry, "id">) => void;
  removeEntry: (id: string) => void;
  clearEntries: () => void;
  setMonitoring: (isMonitoring: boolean) => void;
  setCurrentUrl: (url: string) => void;
  addHistoricalData: (data: Omit<HistoricalData, "date">) => void;
  initializeSampleData: () => void;
  setHydrated: (hydrated: boolean) => void;
}

// Completely static sample historical data - no randomness at all
const staticHistoricalData: HistoricalData[] = [
  { date: "2024-01-01", lcp: 2100, fcp: 1400, cls: 0.08, ttfb: 520, score: 78 },
  { date: "2024-01-02", lcp: 2250, fcp: 1520, cls: 0.12, ttfb: 580, score: 72 },
  { date: "2024-01-03", lcp: 1950, fcp: 1350, cls: 0.06, ttfb: 480, score: 82 },
  { date: "2024-01-04", lcp: 2400, fcp: 1600, cls: 0.15, ttfb: 620, score: 68 },
  { date: "2024-01-05", lcp: 2050, fcp: 1420, cls: 0.09, ttfb: 510, score: 76 },
  { date: "2024-01-06", lcp: 1850, fcp: 1280, cls: 0.05, ttfb: 450, score: 85 },
  { date: "2024-01-07", lcp: 2150, fcp: 1480, cls: 0.11, ttfb: 560, score: 74 },
  { date: "2024-01-08", lcp: 2300, fcp: 1550, cls: 0.13, ttfb: 600, score: 70 },
  { date: "2024-01-09", lcp: 1900, fcp: 1320, cls: 0.07, ttfb: 470, score: 80 },
  { date: "2024-01-10", lcp: 2000, fcp: 1380, cls: 0.08, ttfb: 500, score: 77 },
  { date: "2024-01-11", lcp: 2200, fcp: 1500, cls: 0.1, ttfb: 550, score: 73 },
  { date: "2024-01-12", lcp: 1800, fcp: 1250, cls: 0.04, ttfb: 420, score: 88 },
  { date: "2024-01-13", lcp: 2350, fcp: 1580, cls: 0.14, ttfb: 610, score: 69 },
  { date: "2024-01-14", lcp: 2100, fcp: 1450, cls: 0.09, ttfb: 530, score: 75 },
  { date: "2024-01-15", lcp: 1950, fcp: 1340, cls: 0.06, ttfb: 490, score: 81 },
];

// Completely static sample entries - no randomness at all
const staticSampleEntries: PerformanceEntry[] = [
  {
    id: "sample-entry-1",
    url: "https://example.com",
    timestamp: new Date("2024-01-15T12:00:00Z"),
    metrics: { lcp: 2100, fcp: 1450, cls: 0.08, fid: 95, inp: 180, ttfb: 520 },
    resourceTimings: [
      {
        name: "main.js",
        initiatorType: "script",
        duration: 220,
        transferSize: 150000,
        startTime: 100,
      },
      {
        name: "styles.css",
        initiatorType: "link",
        duration: 85,
        transferSize: 25000,
        startTime: 50,
      },
      {
        name: "hero.jpg",
        initiatorType: "img",
        duration: 340,
        transferSize: 500000,
        startTime: 200,
      },
    ],
    overallScore: 75,
  },
  {
    id: "sample-entry-2",
    url: "https://example.com/products",
    timestamp: new Date("2024-01-15T11:00:00Z"),
    metrics: { lcp: 2450, fcp: 1680, cls: 0.12, fid: 120, inp: 220, ttfb: 610 },
    resourceTimings: [
      {
        name: "main.js",
        initiatorType: "script",
        duration: 280,
        transferSize: 180000,
        startTime: 100,
      },
      {
        name: "styles.css",
        initiatorType: "link",
        duration: 95,
        transferSize: 28000,
        startTime: 50,
      },
      {
        name: "products.jpg",
        initiatorType: "img",
        duration: 420,
        transferSize: 650000,
        startTime: 200,
      },
    ],
    overallScore: 62,
  },
  {
    id: "sample-entry-3",
    url: "https://example.com/about",
    timestamp: new Date("2024-01-15T10:00:00Z"),
    metrics: { lcp: 1850, fcp: 1280, cls: 0.05, fid: 75, inp: 150, ttfb: 420 },
    resourceTimings: [
      {
        name: "main.js",
        initiatorType: "script",
        duration: 180,
        transferSize: 120000,
        startTime: 100,
      },
      {
        name: "styles.css",
        initiatorType: "link",
        duration: 70,
        transferSize: 22000,
        startTime: 50,
      },
      {
        name: "team.jpg",
        initiatorType: "img",
        duration: 280,
        transferSize: 380000,
        startTime: 200,
      },
    ],
    overallScore: 88,
  },
  {
    id: "sample-entry-4",
    url: "https://example.com/contact",
    timestamp: new Date("2024-01-15T09:00:00Z"),
    metrics: { lcp: 1720, fcp: 1150, cls: 0.03, fid: 65, inp: 130, ttfb: 380 },
    resourceTimings: [
      {
        name: "main.js",
        initiatorType: "script",
        duration: 160,
        transferSize: 100000,
        startTime: 100,
      },
      {
        name: "styles.css",
        initiatorType: "link",
        duration: 60,
        transferSize: 20000,
        startTime: 50,
      },
      {
        name: "map.png",
        initiatorType: "img",
        duration: 220,
        transferSize: 280000,
        startTime: 200,
      },
    ],
    overallScore: 92,
  },
  {
    id: "sample-entry-5",
    url: "https://example.com/blog",
    timestamp: new Date("2024-01-15T08:00:00Z"),
    metrics: { lcp: 2680, fcp: 1820, cls: 0.18, fid: 145, inp: 280, ttfb: 720 },
    resourceTimings: [
      {
        name: "main.js",
        initiatorType: "script",
        duration: 320,
        transferSize: 200000,
        startTime: 100,
      },
      {
        name: "styles.css",
        initiatorType: "link",
        duration: 110,
        transferSize: 32000,
        startTime: 50,
      },
      {
        name: "blog-hero.jpg",
        initiatorType: "img",
        duration: 480,
        transferSize: 750000,
        startTime: 200,
      },
    ],
    overallScore: 50,
  },
];

export const usePerformanceStore = create<PerformanceState>()(
  persist(
    (set, get) => ({
      entries: staticSampleEntries,
      historicalData: staticHistoricalData,
      isMonitoring: false,
      currentUrl: "",
      isHydrated: false,

      addEntry: (entry) =>
        set((state) => ({
          entries: [{ ...entry, id: uuidv4() }, ...state.entries].slice(0, 100),
        })),

      removeEntry: (id) =>
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== id),
        })),

      clearEntries: () => set({ entries: [] }),

      setMonitoring: (isMonitoring) => set({ isMonitoring }),

      setCurrentUrl: (currentUrl) => set({ currentUrl }),

      addHistoricalData: (data) =>
        set((state) => ({
          historicalData: [
            ...state.historicalData,
            { ...data, date: new Date().toISOString().split("T")[0] },
          ].slice(-90),
        })),

      initializeSampleData: () => {
        const state = get();
        if (state.entries.length === 0) {
          set({
            entries: staticSampleEntries,
            historicalData: staticHistoricalData,
          });
        }
      },

      setHydrated: (hydrated) => set({ isHydrated: hydrated }),
    }),
    {
      name: "performance-store",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
