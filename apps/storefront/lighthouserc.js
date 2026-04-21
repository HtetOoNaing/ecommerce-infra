/**
 * Lighthouse CI Configuration
 * Performance budgets for Core Web Vitals
 * Target: Performance > 90
 */
module.exports = {
  ci: {
    collect: {
      url: [
        "http://localhost:3001/",
        "http://localhost:3001/products",
      ],
      numberOfRuns: 3,
      startServerCommand: "pnpm start",
      startServerReadyPattern: "Ready",
      startServerReadyTimeout: 60000,
      settings: {
        preset: "desktop",
        throttlingMethod: "simulate",
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
        },
      },
    },
    assert: {
      preset: "lighthouse:recommended",
      assertions: {
        // Core Web Vitals - Performance > 90
        "categories:performance": ["error", { minScore: 0.9 }],
        "categories:accessibility": ["warn", { minScore: 0.9 }],
        "categories:best-practices": ["warn", { minScore: 0.9 }],
        "categories:seo": ["error", { minScore: 0.9 }],

        // Specific metrics
        "first-contentful-paint": ["error", { maxNumericValue: 1800 }], // < 1.8s
        "largest-contentful-paint": ["error", { maxNumericValue: 2500 }], // < 2.5s
        "total-blocking-time": ["error", { maxNumericValue: 200 }], // < 200ms
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }], // < 0.1
        "speed-index": ["error", { maxNumericValue: 3400 }], // < 3.4s
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
