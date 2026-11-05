import { defineConfig, devices } from '@playwright/test'

import { E2E_REVALIDATE_SECRET } from './tests/e2e/constants'

const PORT = Number(process.env.E2E_PORT ?? 3100)
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${PORT}`

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL, trace: 'on-first-retry' },
  projects: [
    { name: 'api', testMatch: /api\.spec\.ts/ },
    { name: 'desktop', testMatch: /site\.spec\.ts/, use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', testMatch: /site\.spec\.ts/, use: { ...devices['Pixel 7'] } },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: `npm run start -- --hostname 127.0.0.1 --port ${PORT}`,
        url: `${baseURL}/api/health`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        // Entorno determinista: nunca se envían correos reales desde las pruebas.
        env: {
          SANITY_REVALIDATE_SECRET: E2E_REVALIDATE_SECRET,
          RESEND_API_KEY: '',
          CONTACT_FROM_EMAIL: '',
        },
      },
})
