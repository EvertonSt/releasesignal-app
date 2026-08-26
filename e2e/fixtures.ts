import { test as base, expect, type Page } from '@playwright/test';

// ── Shared selectors ──────────────────────────────────────────────────────
export const SELECTORS = {
  demoBanner: /demo mode/i,
  releaseDashboard: 'Release Dashboard',
  sidebar: 'aside',
  bottomNav: 'nav.fixed',
  hamburger: /open navigation menu/i,
  notifications: /notifications/i,
  searchTrigger: /search runs/i,
  searchInput: 'input[placeholder*="Search pages"]',
  userMenu: 'Demo User',
  rsLogo: 'ReleaseSignal',
} as const;

// ── Navigation helpers ────────────────────────────────────────────────────
export const APP_ROUTES = [
  { path: '/dashboard', heading: 'Release Dashboard' },
  { path: '/test-runs', heading: 'Test Runs' },
  { path: '/failures', heading: 'Failure Intelligence' },
  { path: '/flaky-tests', heading: 'Flaky Test' },
  { path: '/quality-gates', heading: 'Quality Gates' },
  { path: '/pull-requests', heading: 'Pull Request' },
  { path: '/performance', heading: 'Performance' },
  { path: '/reports', heading: 'Reports' },
  { path: '/settings', heading: 'Settings' },
] as const;

export const MARKETING_SECTIONS = [
  'ReleaseSignal',
  'Turn every test run into a release decision',
  'Release health scoring',
  'Failure classification',
  'Flaky-test detection',
  'US$10,000',
] as const;

// ── Custom test fixture ───────────────────────────────────────────────────
type TestFixtures = {
  desktopPage: Page;
  mobilePage: Page;
};

export const test = base.extend<TestFixtures>({
  desktopPage: async ({ page }, use) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await use(page);
  },
  mobilePage: async ({ page }, use) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await use(page);
  },
});

export { expect };

// ── Utility functions ─────────────────────────────────────────────────────
export async function waitForHydration(page: Page) {
  await page.waitForLoadState('networkidle');
}

export async function navigateAndVerify(page: Page, path: string, headingPattern: RegExp | string) {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
  await expect(page.locator('h1').first()).toContainText(headingPattern);
}

export async function checkDemoBanner(page: Page) {
  await expect(page.getByText(SELECTORS.demoBanner)).toBeVisible();
}

export async function checkResponsiveLayout(page: Page, isMobile: boolean) {
  if (isMobile) {
    await expect(page.locator(SELECTORS.bottomNav)).toBeVisible();
    await expect(page.getByRole('button', { name: SELECTORS.hamburger })).toBeVisible();
  } else {
    await expect(page.locator(SELECTORS.sidebar)).toBeVisible();
  }
}
