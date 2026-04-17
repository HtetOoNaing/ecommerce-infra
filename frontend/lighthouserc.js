/**
 * Lighthouse CI Configuration
 * Performance budgets for Core Web Vitals
 */
module.exports = {
  ci: {
    collect: {
      url: [
        "https://app.infra-pro.com/login",
        "https://app.infra-pro.com/dashboard",
        "https://app.infra-pro.com/dashboard/products",
      ],
      numberOfRuns: 3,
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
        // Core Web Vitals - Strict for PROD
        "categories:performance": ["error", { minScore: 0.9 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["error", { minScore: 0.9 }],
        "categories:seo": ["warn", { minScore: 0.8 }],

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
