module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run start',
      startServerReadyPattern: 'ready on',
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/movies',
        'http://localhost:3000/tv',
        'http://localhost:3000/login',
      ],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
        },
        screenEmulation: {
          mobile: false,
          width: 1920,
          height: 1080,
          deviceScaleFactor: 1,
          disabled: false,
        },
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.75 }],
        'categories:accessibility': ['warn', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
        'categories:pwa': ['warn', { minScore: 0.5 }],

        // Core Web Vitals
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 4000 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 600 }],
        interactive: ['warn', { maxNumericValue: 5000 }],
        'speed-index': ['warn', { maxNumericValue: 4500 }],

        // Resource optimization
        'uses-responsive-images': 'warn',
        'uses-optimized-images': 'warn',
        'uses-text-compression': 'warn',
        'uses-rel-preconnect': 'warn',
        'font-display': 'warn',

        // JavaScript optimization
        'unminified-javascript': 'error',
        'unused-javascript': ['warn', { maxNumericValue: 200000 }],
        'legacy-javascript': 'warn',

        // Accessibility
        'color-contrast': 'error',
        'heading-order': 'warn',
        'image-alt': 'error',
        'link-name': 'error',
        'meta-viewport': 'error',

        // Security
        'is-on-https': 'error',
        'mixed-content': 'error',
        'no-vulnerable-libraries': 'warn',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
