// Browser tests for the open course (no login): one Chromium at phone size,
// one worker, against the production build. Run: npm run test:e2e
import { defineConfig, devices } from '@playwright/test'

const PORT = 4175

export default defineConfig({
  testDir: '.',
  workers: 1,
  fullyParallel: false,
  retries: 0,
  reporter: [['list']],
  timeout: 30_000,
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    // The PWA service worker would cache pages between tests
    serviceWorkers: 'block',
  },
  projects: [
    // Most visitors are on a phone
    { name: 'phone', use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
  webServer: {
    // npm scripts run from the project root (the command itself runs in e2e/)
    command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: true,
    timeout: 180_000,
  },
})
