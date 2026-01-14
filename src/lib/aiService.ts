/**
 * AI Service for generating performance suggestions
 *
 * This service can be configured to use:
 * 1. Local rule-based analysis (default)
 * 2. OpenAI API
 * 3. Anthropic API
 * 4. Custom LLM endpoints
 */

import { PerformanceEntry, AISuggestion, ComponentAnalysis, getMetricRating } from '@/types';

export interface AIServiceConfig {
  provider: 'local' | 'openai' | 'anthropic' | 'custom';
  apiKey?: string;
  endpoint?: string;
  model?: string;
}

const defaultConfig: AIServiceConfig = {
  provider: 'local',
};

let config: AIServiceConfig = defaultConfig;

export function configureAIService(newConfig: Partial<AIServiceConfig>) {
  config = { ...config, ...newConfig };
}

// Build a prompt for LLM-based analysis
function buildAnalysisPrompt(entry: PerformanceEntry, components: ComponentAnalysis[]): string {
  const criticalIssues = components.filter(c => c.status === 'critical');
  const needsImprovement = components.filter(c => c.status === 'needs-improvement');

  return `
Analyze this web performance data and provide prioritized optimization suggestions:

## Performance Metrics
- LCP (Largest Contentful Paint): ${entry.metrics.lcp}ms (threshold: <2500ms good, <4000ms needs improvement)
- FCP (First Contentful Paint): ${entry.metrics.fcp}ms (threshold: <1800ms good, <3000ms needs improvement)
- CLS (Cumulative Layout Shift): ${entry.metrics.cls} (threshold: <0.1 good, <0.25 needs improvement)
- FID (First Input Delay): ${entry.metrics.fid}ms (threshold: <100ms good, <300ms needs improvement)
- INP (Interaction to Next Paint): ${entry.metrics.inp}ms (threshold: <200ms good, <500ms needs improvement)
- TTFB (Time to First Byte): ${entry.metrics.ttfb}ms (threshold: <800ms good, <1800ms needs improvement)

## Overall Score: ${entry.overallScore}/100

## Resource Summary
${entry.resourceTimings.map(r => `- ${r.name}: ${r.duration}ms, ${formatBytes(r.transferSize)}`).join('\n')}

## Critical Issues (${criticalIssues.length})
${criticalIssues.map(c => `- ${c.name}: ${c.description}`).join('\n') || 'None'}

## Needs Improvement (${needsImprovement.length})
${needsImprovement.map(c => `- ${c.name}: ${c.description}`).join('\n') || 'None'}

Please provide:
1. Top 5 prioritized recommendations with specific code examples
2. Estimated impact for each recommendation
3. Effort level (easy/medium/hard)
4. Which metrics each recommendation will improve

Format as JSON array of suggestions.
`;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Local rule-based suggestion generator
function generateLocalSuggestions(
  entry: PerformanceEntry,
  components: ComponentAnalysis[]
): AISuggestion[] {
  const suggestions: AISuggestion[] = [];
  const metrics = entry.metrics;

  // TTFB Optimization
  if (metrics.ttfb && metrics.ttfb > 800) {
    suggestions.push({
      id: 'optimize-ttfb',
      title: 'Optimize Server Response Time (TTFB)',
      description: `Your TTFB of ${Math.round(metrics.ttfb)}ms exceeds the recommended 800ms threshold. This is the foundation of your page load - everything else waits for the server to respond.`,
      priority: metrics.ttfb > 1800 ? 'critical' : 'high',
      category: 'performance',
      estimatedImpact: 'Could improve FCP by 20-40% and overall load time',
      effort: 'medium',
      codeExample: `// 1. Enable server-side caching in Next.js
// next.config.js
module.exports = {
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, s-maxage=31536000, stale-while-revalidate=59'
        }
      ],
    }]
  }
}

// 2. Use Edge Runtime for faster cold starts
export const runtime = 'edge';

// 3. Implement stale-while-revalidate pattern
export async function getStaticProps() {
  return {
    props: { data },
    revalidate: 60, // ISR: regenerate every 60 seconds
  }
}`,
      affectedComponents: ['server-response'],
      potentialGain: 15,
    });
  }

  // LCP Optimization
  if (metrics.lcp && metrics.lcp > 2500) {
    const lcpSeverity = metrics.lcp > 4000 ? 'critical' : 'high';
    suggestions.push({
      id: 'optimize-lcp',
      title: 'Improve Largest Contentful Paint (LCP)',
      description: `LCP of ${Math.round(metrics.lcp)}ms is ${lcpSeverity === 'critical' ? 'critically slow' : 'above threshold'}. The largest visible element (usually hero image or heading) is taking too long to render.`,
      priority: lcpSeverity,
      category: 'performance',
      estimatedImpact: 'Could improve overall score by 15-25 points',
      effort: 'medium',
      codeExample: `// 1. Preload LCP image in document head
<link
  rel="preload"
  as="image"
  href="/hero-image.webp"
  fetchpriority="high"
/>

// 2. Use Next.js Image with priority flag
import Image from 'next/image';

<Image
  src="/hero.webp"
  alt="Hero"
  width={1200}
  height={600}
  priority  // This preloads the image
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j..."
/>

// 3. Inline critical CSS for above-the-fold content
// Use critters or critical npm packages

// 4. Avoid lazy loading LCP element
// Remove loading="lazy" from hero images`,
      affectedComponents: ['images', 'server-response', 'css'],
      potentialGain: 20,
    });
  }

  // CLS Optimization
  if (metrics.cls && metrics.cls > 0.1) {
    suggestions.push({
      id: 'fix-cls',
      title: 'Fix Layout Shift Issues (CLS)',
      description: `CLS of ${metrics.cls.toFixed(3)} indicates ${metrics.cls > 0.25 ? 'severe' : 'noticeable'} layout instability. Users are experiencing content jumping around as the page loads.`,
      priority: metrics.cls > 0.25 ? 'critical' : 'high',
      category: 'performance',
      estimatedImpact: 'Dramatically improves user experience and Core Web Vitals',
      effort: 'easy',
      codeExample: `// 1. Always set explicit dimensions on images
<img
  src="photo.jpg"
  width="800"
  height="600"
  alt="Description"
/>

// 2. Use CSS aspect-ratio for responsive images
.image-container {
  aspect-ratio: 16 / 9;
  width: 100%;
}

// 3. Reserve space for dynamic content (ads, embeds)
.ad-slot {
  min-height: 250px;
  background: #f0f0f0;
}

// 4. Avoid inserting content above existing content
// Bad: prepending to DOM
// Good: appending or using fixed position

// 5. Use transform for animations instead of layout properties
.animated {
  transform: translateX(100px); /* Good */
  /* left: 100px; */ /* Bad - causes layout shift */
}

// 6. Preload fonts to prevent FOUT
<link
  rel="preload"
  href="/fonts/inter.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>`,
      affectedComponents: ['layout-stability', 'images', 'fonts'],
      potentialGain: 18,
    });
  }

  // JavaScript Bundle Optimization
  const jsComponent = components.find(c => c.id === 'javascript');
  if (jsComponent && (jsComponent.status === 'critical' || jsComponent.status === 'needs-improvement')) {
    suggestions.push({
      id: 'optimize-js-bundle',
      title: 'Reduce JavaScript Bundle Size & Execution Time',
      description: `Large JavaScript bundles (${formatBytes(jsComponent.metrics.size || 0)}) are blocking the main thread for ${Math.round(jsComponent.metrics.loadTime || 0)}ms, delaying interactivity.`,
      priority: jsComponent.status === 'critical' ? 'critical' : 'high',
      category: 'performance',
      estimatedImpact: 'Could reduce TBT by 40-60% and improve INP significantly',
      effort: 'hard',
      codeExample: `// 1. Use dynamic imports for code splitting
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false  // Don't include in server bundle
});

// 2. Analyze bundle with webpack-bundle-analyzer
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
module.exports = withBundleAnalyzer({});

// 3. Tree-shake unused exports
// package.json
{
  "sideEffects": false
}

// 4. Replace heavy libraries with lighter alternatives
// moment.js (300KB) → date-fns (13KB) or dayjs (2KB)
// lodash (70KB) → lodash-es (tree-shakeable)

// 5. Use React.lazy for route-based splitting
const Dashboard = React.lazy(() => import('./Dashboard'));

// 6. Defer non-critical scripts
<script src="analytics.js" defer></script>`,
      affectedComponents: ['javascript', 'main-thread'],
      potentialGain: 22,
    });
  }

  // Image Optimization
  const imageComponent = components.find(c => c.id === 'images');
  if (imageComponent && (imageComponent.status === 'critical' || imageComponent.status === 'needs-improvement')) {
    suggestions.push({
      id: 'optimize-images',
      title: 'Optimize Images for Web',
      description: `Images totaling ${formatBytes(imageComponent.metrics.size || 0)} are a major bottleneck. Modern formats and proper sizing can reduce this by 50-80%.`,
      priority: imageComponent.status === 'critical' ? 'high' : 'medium',
      category: 'performance',
      estimatedImpact: 'Could reduce page weight by 40-70%',
      effort: 'easy',
      codeExample: `// 1. Use Next.js Image component (automatic optimization)
import Image from 'next/image';

<Image
  src="/photo.jpg"
  alt="Description"
  width={800}
  height={600}
  sizes="(max-width: 768px) 100vw, 50vw"
  placeholder="blur"
  quality={85}
/>

// 2. Serve modern formats with fallbacks
<picture>
  <source srcset="photo.avif" type="image/avif" />
  <source srcset="photo.webp" type="image/webp" />
  <img src="photo.jpg" alt="..." loading="lazy" />
</picture>

// 3. Use responsive images
<img
  srcset="
    photo-400.jpg 400w,
    photo-800.jpg 800w,
    photo-1200.jpg 1200w
  "
  sizes="(max-width: 600px) 100vw, 50vw"
  src="photo-800.jpg"
  alt="..."
/>

// 4. Lazy load below-the-fold images
<img src="photo.jpg" loading="lazy" alt="..." />

// 5. Use blur placeholder for perceived performance
// Generate with: npx plaiceholder ./public/image.jpg`,
      affectedComponents: ['images'],
      potentialGain: 15,
    });
  }

  // INP/Interactivity Optimization
  if (metrics.inp && metrics.inp > 200) {
    suggestions.push({
      id: 'improve-inp',
      title: 'Improve Interaction Responsiveness (INP)',
      description: `INP of ${Math.round(metrics.inp)}ms means user interactions feel ${metrics.inp > 500 ? 'very sluggish' : 'slow'}. Users expect responses within 100ms.`,
      priority: metrics.inp > 500 ? 'critical' : 'medium',
      category: 'performance',
      estimatedImpact: 'Dramatically improves perceived performance and user satisfaction',
      effort: 'hard',
      codeExample: `// 1. Break up long tasks using scheduler
function processLargeArray(items) {
  const CHUNK_SIZE = 100;
  let index = 0;

  function processChunk() {
    const chunk = items.slice(index, index + CHUNK_SIZE);
    chunk.forEach(processItem);
    index += CHUNK_SIZE;

    if (index < items.length) {
      // Yield to main thread
      requestIdleCallback(processChunk);
    }
  }

  processChunk();
}

// 2. Use React transitions for non-urgent updates
import { useTransition } from 'react';

function SearchResults() {
  const [isPending, startTransition] = useTransition();

  function handleSearch(query) {
    startTransition(() => {
      setResults(filterResults(query));
    });
  }
}

// 3. Debounce expensive handlers
import { useDebouncedCallback } from 'use-debounce';

const debouncedSearch = useDebouncedCallback(
  (value) => search(value),
  300
);

// 4. Use Web Workers for heavy computation
const worker = new Worker('/heavy-computation.js');
worker.postMessage(data);
worker.onmessage = (e) => setResult(e.data);

// 5. Virtualize long lists
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={400}
  itemCount={10000}
  itemSize={50}
>
  {Row}
</FixedSizeList>`,
      affectedComponents: ['main-thread', 'javascript'],
      potentialGain: 12,
    });
  }

  // CSS Optimization
  const cssComponent = components.find(c => c.id === 'css');
  if (cssComponent && cssComponent.status !== 'excellent' && cssComponent.status !== 'good') {
    suggestions.push({
      id: 'optimize-css',
      title: 'Optimize CSS Delivery',
      description: 'Render-blocking CSS is delaying first paint. Inlining critical CSS and deferring the rest can significantly improve FCP.',
      priority: 'medium',
      category: 'performance',
      estimatedImpact: 'Could improve FCP by 15-25%',
      effort: 'medium',
      codeExample: `// 1. Inline critical CSS (above-the-fold styles)
// Use critters with Next.js
// next.config.js
const withCritters = require('critters-webpack-plugin');

// 2. Defer non-critical CSS
<link
  rel="preload"
  href="styles.css"
  as="style"
  onload="this.onload=null;this.rel='stylesheet'"
/>
<noscript>
  <link rel="stylesheet" href="styles.css" />
</noscript>

// 3. Remove unused CSS with PurgeCSS
// postcss.config.js
module.exports = {
  plugins: [
    require('@fullhuman/postcss-purgecss')({
      content: ['./src/**/*.{js,jsx,ts,tsx}'],
    }),
  ],
}

// 4. Use CSS containment for complex components
.widget {
  contain: layout style paint;
}

// 5. Avoid @import in CSS (causes sequential loading)
/* Bad */
@import url('other.css');

/* Good - use link tags instead */
<link rel="stylesheet" href="other.css" />`,
      affectedComponents: ['css'],
      potentialGain: 10,
    });
  }

  // Font Optimization
  const fontComponent = components.find(c => c.id === 'fonts');
  if (fontComponent && fontComponent.status === 'needs-improvement') {
    suggestions.push({
      id: 'optimize-fonts',
      title: 'Optimize Web Font Loading',
      description: 'Font loading is causing layout shifts or invisible text (FOIT/FOUT). Proper font loading strategy improves both CLS and perceived performance.',
      priority: 'low',
      category: 'performance',
      estimatedImpact: 'Reduces CLS and improves text visibility during load',
      effort: 'easy',
      codeExample: `// 1. Use Next.js built-in font optimization
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

export default function Layout({ children }) {
  return (
    <html className={inter.className}>
      <body>{children}</body>
    </html>
  );
}

// 2. Preload critical fonts
<link
  rel="preload"
  href="/fonts/inter-var.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>

// 3. Use font-display: swap
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter.woff2') format('woff2');
  font-display: swap;
}

// 4. Subset fonts to reduce size
// Use glyphhanger or fonttools to subset

// 5. Use variable fonts (single file, multiple weights)
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-var.woff2') format('woff2');
  font-weight: 100 900;
  font-display: swap;
}`,
      affectedComponents: ['fonts'],
      potentialGain: 5,
    });
  }

  // Third-party scripts
  const thirdPartyComponent = components.find(c => c.id === 'third-party');
  if (thirdPartyComponent && (thirdPartyComponent.status === 'critical' || thirdPartyComponent.status === 'needs-improvement')) {
    suggestions.push({
      id: 'manage-third-party',
      title: 'Manage Third-Party Scripts',
      description: 'Third-party scripts are impacting main thread performance. Consider loading them asynchronously or using a facade pattern.',
      priority: 'medium',
      category: 'performance',
      estimatedImpact: 'Could reduce TBT by 20-40%',
      effort: 'medium',
      codeExample: `// 1. Load third-party scripts with next/script
import Script from 'next/script';

<Script
  src="https://analytics.example.com/script.js"
  strategy="lazyOnload"  // Load after page is interactive
/>

// 2. Use facade pattern for heavy embeds
function YouTubeEmbed({ videoId }) {
  const [loaded, setLoaded] = useState(false);

  if (!loaded) {
    return (
      <button onClick={() => setLoaded(true)}>
        <img src={\`https://i.ytimg.com/vi/\${videoId}/hqdefault.jpg\`} />
        <span>▶ Play Video</span>
      </button>
    );
  }

  return <iframe src={\`https://youtube.com/embed/\${videoId}\`} />;
}

// 3. Self-host critical third-party resources
// Download and serve from your domain

// 4. Use Partytown to run scripts in web worker
import { Partytown } from '@builder.io/partytown/react';

<Partytown forward={['dataLayer.push']} />
<script type="text/partytown" src="https://analytics.js" />`,
      affectedComponents: ['third-party', 'main-thread'],
      potentialGain: 8,
    });
  }

  // General caching suggestion
  if (entry.overallScore < 80) {
    suggestions.push({
      id: 'implement-caching',
      title: 'Implement Comprehensive Caching Strategy',
      description: 'A proper caching strategy can dramatically reduce load times for returning visitors and reduce server load.',
      priority: 'medium',
      category: 'best-practices',
      estimatedImpact: 'Near-instant loads for returning visitors',
      effort: 'medium',
      codeExample: `// 1. Configure caching headers
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=86400, stale-while-revalidate=59',
          },
        ],
      },
    ];
  },
};

// 2. Use Service Worker for offline caching
// next.config.js with next-pwa
const withPWA = require('next-pwa')({
  dest: 'public',
  runtimeCaching: [
    {
      urlPattern: /^https:\\/\\/api\\./,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: { maxEntries: 50, maxAgeSeconds: 300 },
      },
    },
  ],
});

// 3. Implement stale-while-revalidate with SWR
import useSWR from 'swr';

function Profile() {
  const { data } = useSWR('/api/user', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });
}`,
      affectedComponents: ['server-response'],
      potentialGain: 10,
    });
  }

  // Sort by priority and potential gain
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  suggestions.sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.potentialGain - a.potentialGain;
  });

  return suggestions;
}

// OpenAI API integration
async function generateOpenAISuggestions(
  entry: PerformanceEntry,
  components: ComponentAnalysis[]
): Promise<AISuggestion[]> {
  if (!config.apiKey) {
    console.warn('OpenAI API key not configured, falling back to local analysis');
    return generateLocalSuggestions(entry, components);
  }

  try {
    const prompt = buildAnalysisPrompt(entry, components);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model || 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a web performance expert. Analyze the provided performance data and return actionable suggestions in JSON format.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    // Parse JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error('Could not parse suggestions from API response');
  } catch (error) {
    console.error('OpenAI API error:', error);
    return generateLocalSuggestions(entry, components);
  }
}

// Main export function
export async function generateAISuggestions(
  entry: PerformanceEntry,
  components: ComponentAnalysis[]
): Promise<AISuggestion[]> {
  switch (config.provider) {
    case 'openai':
      return generateOpenAISuggestions(entry, components);
    case 'local':
    default:
      return generateLocalSuggestions(entry, components);
  }
}

// Export component analysis generator
export { generateLocalSuggestions as generateRuleBasedSuggestions };
